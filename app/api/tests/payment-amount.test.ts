import { describe, it, expect, beforeEach, vi } from "vitest";
import { TRPCError } from "@trpc/server";
import { publicRouter } from "../public-router";
import { createContext } from "../context";
import { _resetRateLimiter } from "../lib/rate-limiter";

// Shared mutable state for the mocked DB helper below. vi.hoisted runs before
// the vi.mock factory so the factory can close over it. select() results are
// consumed FIFO: each resolver's .where() pulls the next queued result set.
const fakeState = vi.hoisted(() => {
  const resultsQueue: Array<Array<Record<string, unknown>>> = [];
  const inserts: Array<Record<string, unknown>> = [];
  return { resultsQueue, inserts };
});

vi.mock("../queries/connection", () => ({
  getDb: () => ({
    select(shape?: Record<string, unknown>) {
      return {
        from: () => ({
          where: async () => {
            const rows = fakeState.resultsQueue.shift() ?? [];
            if (!shape) return rows;
            return rows.map((r) => {
              const out: Record<string, unknown> = {};
              for (const key of Object.keys(shape)) {
                out[key] = r[key];
              }
              return out;
            });
          },
        }),
      };
    },
    insert() {
      return {
        values: async (values: Record<string, unknown>) => {
          fakeState.inserts.push(values);
          return [];
        },
      };
    },
  }),
}));

async function makeCaller() {
  const req = new Request("http://localhost/api/trpc", {
    headers: { "x-forwarded-for": "203.0.113.7" },
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- createContext ignores the `info` field; satisfies FetchCreateContextFnOptions.
  const ctx = await createContext({ req, resHeaders: new Headers(), info: {} as any });
  return publicRouter.createCaller(ctx);
}

function expectTrpcError(error: unknown, code: TRPCError["code"], messagePattern: RegExp) {
  expect(error).toBeInstanceOf(TRPCError);
  expect((error as TRPCError).code).toBe(code);
  expect((error as TRPCError).message).toMatch(messagePattern);
}

describe("payment amount integrity", () => {
  beforeEach(() => {
    _resetRateLimiter();
    fakeState.resultsQueue.length = 0;
    fakeState.inserts.length = 0;
  });

  it("sources the payment amount from the authoritative course fee, never the client", async () => {
    // Queue: initiate does one select (course lookup) then an insert.
    fakeState.resultsQueue.push([{ feeRwf: 250000, title: "Bakery Level 1" }]);

    const caller = await makeCaller();
    const res = await caller.payments.initiate({
      provider: "AIRTEL",
      phoneNumber: "0788123456",
      courseId: 1,
    });

    expect(res.success).toBe(true);
    // The Airtel fallback path omits `amount` from the response, but the
    // inserted payment row captures it: assert the server used the DB fee.
    expect(fakeState.inserts).toHaveLength(1);
    expect(fakeState.inserts[0].amount).toBe(250000);
  });

  it("rejects enrollment when the paid amount does not match the course fee", async () => {
    // Queue order: submit's payment lookup (full select), then fee lookup (shape select).
    fakeState.resultsQueue.push(
      [{ id: 1, referenceNumber: "PI-PAY-1", phoneNumber: "0788123456", status: "success", amount: 500, enrollmentRef: null }],
      [{ feeRwf: 250000 }],
    );

    const caller = await makeCaller();
    let caught: unknown = null;
    try {
      await caller.enrollments.submit({
        fullName: "Alice Uwase",
        phone: "0788123456",
        courseId: 1,
        paymentRef: "PI-PAY-1",
      });
    } catch (e) {
      caught = e;
    }
    expectTrpcError(caught, "BAD_REQUEST", /does not match course fee/i);
  });

  it("rejects enrollment when the payment belongs to another phone number", async () => {
    // Queue: submit's payment lookup (full select). Ownership check fails before fee lookup.
    fakeState.resultsQueue.push(
      [{ id: 1, referenceNumber: "PI-PAY-1", phoneNumber: "0788999999", status: "success", amount: 250000, enrollmentRef: null }],
    );

    const caller = await makeCaller();
    let caught: unknown = null;
    try {
      await caller.enrollments.submit({
        fullName: "Alice Uwase",
        phone: "0788123456",
        courseId: 1,
        paymentRef: "PI-PAY-1",
      });
    } catch (e) {
      caught = e;
    }
    expectTrpcError(caught, "FORBIDDEN", /does not belong/i);
  });
});