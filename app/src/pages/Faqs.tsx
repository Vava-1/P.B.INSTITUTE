import { useState } from "react";
import { Link } from "react-router";
import { Search, ChevronDown, ChevronUp, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import { trpc } from "@/providers/trpc";

const categoryColors: Record<string, string> = {
  enrollment: "#5E17EB",
  courses: "#5E17EB",
  fees: "#00B894",
  schedule: "#8B5CF6",
  certificates: "#EC4899",
  technical: "#6B7280",
};

const categoryLabels: Record<string, string> = {
  enrollment: "Enrollment",
  courses: "Courses",
  fees: "Fees",
  schedule: "Schedule",
  certificates: "Certificates",
  technical: "Technical",
};

export default function Faqs() {
  const { data: faqs } = trpc.public.faqs.list.useQuery();
  const { data: settings } = trpc.public.settings.get.useQuery();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [openId, setOpenId] = useState<number | null>(null);

  const filtered = (faqs || []).filter((f) => {
    const matchCat = activeCategory === "all" || f.category === activeCategory;
    const matchSearch =
      !search ||
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-16 bg-gradient-to-br from-[#1A1A2E] via-[#5E17EB] to-[#1A1A2E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white font-display">
            Frequently Asked <span className="text-gradient-gold">Questions</span>
          </h1>
          <p className="mt-4 text-lg text-white/70 max-w-2xl mx-auto">
            Find answers to common questions about our courses, admissions, fees, and more.
          </p>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="py-12 bg-[#EDE7FF]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
            <Input
              placeholder="Search questions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 py-6 text-lg rounded-xl border-gray-200 shadow-sm"
            />
          </div>
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                activeCategory === "all"
                  ? "bg-[#5E17EB] text-white"
                  : "bg-white text-[#6B7280] hover:bg-[#5E17EB]/10"
              }`}
            >
              All
            </button>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                  activeCategory === key
                    ? "bg-[#5E17EB] text-white"
                    : "bg-white text-[#6B7280] hover:bg-[#5E17EB]/10"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* FAQ List */}
          <div className="space-y-4">
            {filtered.map((faq) => {
              const isOpen = openId === faq.id;
              const color = categoryColors[faq.category] || "#5E17EB";
              return (
                <Card
                  key={faq.id}
                  className={`border-0 shadow-sm transition-all ${isOpen ? "shadow-md" : ""}`}
                >
                  <button
                    onClick={() => setOpenId(isOpen ? null : faq.id)}
                    className="w-full flex items-start justify-between p-6 text-left"
                  >
                    <div className="flex-1 pr-4">
                      <span
                        className="inline-block px-2 py-0.5 text-xs font-medium rounded mb-2 text-white"
                        style={{ backgroundColor: color }}
                      >
                        {categoryLabels[faq.category] || faq.category}
                      </span>
                      <h3 className="font-semibold text-[#1A1A2E]">{faq.question}</h3>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-[#6B7280] shrink-0 mt-6" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-[#6B7280] shrink-0 mt-6" />
                    )}
                  </button>
                  {isOpen && (
                    <CardContent className="pt-0 pb-6 px-6">
                      <p className="text-[#6B7280] leading-relaxed">{faq.answer}</p>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-[#6B7280]">No questions found matching your search.</p>
            </div>
          )}

          {/* CTA */}
          <div className="mt-12 text-center p-8 bg-gradient-to-r from-[#5E17EB] to-[#1A1A2E] rounded-2xl">
            <h3 className="text-xl font-bold text-white mb-3 font-display">
              Didn't Find Your Answer?
            </h3>
            <p className="text-white/70 mb-6">
              Our team is happy to help. Reach out and we'll get back to you quickly.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/contact"
                className="px-6 py-3 bg-white text-[#1A1A2E] font-semibold rounded-full hover:bg-[#EDE7FF] transition-colors"
              >
                Contact Us
              </Link>
              <a
                href={`https://wa.me/${(settings?.whatsapp || "250786053720").replace(/\+/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white rounded-full hover:bg-[#128C7E] transition-colors font-medium"
              >
                <MessageCircle className="w-4 h-4" /> Ask on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
