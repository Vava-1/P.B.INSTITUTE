import { MessageCircle } from "lucide-react";
import { trpc } from "@/providers/trpc";

export default function WhatsAppButton() {
  const { data: settings } = trpc.public.settings.get.useQuery();
  const whatsappNumber = (settings?.whatsapp || "250786053720").replace(/\+/g, "");
  const message = encodeURIComponent("Hello, I'm interested in Pacemaker Institute courses.");

  return (
    <a
      href={`https://wa.me/${whatsappNumber}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform animate-pulse"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="w-7 h-7 text-white" />
    </a>
  );
}
