import { MessageCircle } from "lucide-react";
import { trpc } from "@/providers/trpc";

export default function WhatsAppButton() {
  const { data: settings } = trpc.public.settings.get.useQuery();
  const phone = (settings?.whatsapp || "250786053720").replace(/[^0-9]/g, "");
  const message = encodeURIComponent(
    "Hello Pacemaker Institute! I'm interested in enrolling in one of your courses. Could you please share more information?"
  );

  return (
    <a
      href={`https://wa.me/${phone}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-3 right-3 z-50 w-9 h-9 bg-[#25D366] rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="w-4 h-4 text-white" />
    </a>
  );
}
