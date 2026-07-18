import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import superjson from "superjson";
import type { AppRouter } from "../../api/router";
import type { ReactNode } from "react";
import { AdminSession } from "@contracts/constants";

export const trpc = createTRPCReact<AppRouter>();

// Read a cookie value by name from document.cookie (for the CSRF token).
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([.$?*|{}()[\]\\/+^])/g, "\\$1") + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

// Configure QueryClient with sensible defaults:
// - staleTime: 0 means data is immediately stale (always refetch on mount/refocus)
// - refetchOnWindowFocus: true refetches when the user returns to the tab
//   (so admin sees fresh data after switching to the website and back)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      headers() {
        // The admin JWT is sent automatically via the httpOnly admin_session
        // cookie (credentials: "include" below). We only need to attach the
        // CSRF token as a header — it's read from the non-httpOnly admin_csrf
        // cookie and sent on every request; the server only validates it on
        // mutations.
        const csrfToken = getCookie(AdminSession.csrfCookieName);
        return {
          ...(csrfToken ? { "x-csrf-token": csrfToken } : {}),
        };
      },
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

export function TRPCProvider({ children }: { children: ReactNode }) {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
