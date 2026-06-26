declare global {
  interface Window {
    gtag?: (command: string, eventName: string, params?: Record<string, unknown>) => void;
    fbq?: (command: string, eventName: string, params?: Record<string, unknown>) => void;
  }
}

export const track = {
  pageView: (path: string) => {
    window.gtag?.("event", "page_view", { page_path: path });
    window.fbq?.("track", "PageView");
  },
  enrollmentStarted: (courseName: string) => {
    window.gtag?.("event", "begin_checkout", { item_name: courseName });
    window.fbq?.("track", "InitiateCheckout", { content_name: courseName });
  },
  enrollmentCompleted: (courseName: string, value: number) => {
    window.gtag?.("event", "purchase", { item_name: courseName, value, currency: "RWF" });
    window.fbq?.("track", "Purchase", { content_name: courseName, value, currency: "RWF" });
  },
  contactSubmitted: () => {
    window.gtag?.("event", "generate_lead");
    window.fbq?.("track", "Lead");
  },
};
