import { describe, it, expect, beforeEach, vi } from "vitest";
import { publicRouter } from "../public-router";
import { createContext } from "../context";

// Shared mutable state for the mocked DB helper below. vi.hoisted runs before
// the vi.mock factory so the factory can close over it. select() results are
// consumed FIFO: each resolver's .where() pulls the next queued result set.
const fakeState = vi.hoisted(() => {
  const resultsQueue: Array<Array<Record<string, unknown>>> = [];
  const selectProjections: Array<Record<string, unknown> | undefined> = [];
  return { resultsQueue, selectProjections };
});

vi.mock("../queries/connection", () => ({
  getDb: () => ({
    select(shape?: Record<string, unknown>) {
      fakeState.selectProjections.push(shape);
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
  }),
}));

async function callCheckStatus(reference: string, phone: string) {
  const req = new Request("http://localhost/api/trpc", {
    headers: { "x-forwarded-for": "203.0.113.7" },
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- createContext ignores the `info` field; satisfies FetchCreateContextFnOptions.
  const ctx = await createContext({ req, resHeaders: new Headers(), info: {} as any });
  return publicRouter.createCaller(ctx).enrollments.checkStatus({ reference, phone });
}

describe("enrollments.checkStatus field allowlist", () => {
  beforeEach(() => {
    fakeState.resultsQueue.length = 0;
    fakeState.selectProjections.length = 0;
  });

  it("returns only the allowlisted fields and strips PII rows that live in the table", async () => {
    fakeState.resultsQueue.push([
      {
        referenceNumber: "PI-ENRL-2026-ABC123",
        fullName: "Alice Uwase",
        status: "pending",
        paymentStatus: "not_paid",
        submittedAt: new Date("2026-01-05T10:00:00Z"),
        courseId: 7,
        email: "alice@example.com",
        phone: "0788123456",
        nationalId: "1199876543210",
        dateOfBirth: new Date("1995-01-01"),
        emergencyName: "Bob Uwase",
        emergencyPhone: "0788998877",
      },
    ]);

    const result = await callCheckStatus("PI-ENRL-2026-ABC123", "0788123456");
    expect(result).not.toBeNull();
    expect(result?.referenceNumber).toBe("PI-ENRL-2026-ABC123");
    expect(Object.keys(result ?? {})).toEqual(
      expect.arrayContaining([
        "referenceNumber",
        "fullName",
        "status",
        "paymentStatus",
        "submittedAt",
        "courseId",
      ])
    );
    expect(result).not.toHaveProperty("email");
    expect(result).not.toHaveProperty("phone");
    expect(result).not.toHaveProperty("nationalId");
    expect(result).not.toHaveProperty("dateOfBirth");
    expect(result).not.toHaveProperty("emergencyName");
    expect(result).not.toHaveProperty("emergencyPhone");
  });

  it("returns null when no enrollment matches", async () => {
    expect(await callCheckStatus("PI-ENRL-NOPE", "0788123456")).toBeNull();
  });

  it("never projects PII columns in the generated select", async () => {
    fakeState.resultsQueue.push([{ referenceNumber: "X-1" }]);
    await callCheckStatus("X-1", "0788123456");
    const projection = fakeState.selectProjections[0];
    expect(projection).toBeDefined();
    expect(Object.keys(projection ?? {})).not.toEqual(
      expect.arrayContaining([
        "email",
        "phone",
        "nationalId",
        "dateOfBirth",
        "emergencyName",
        "emergencyPhone",
      ])
    );
  });
});