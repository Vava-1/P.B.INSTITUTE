import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import { trpc } from "@/providers/trpc";

export default function Contact() {
  const { data: settings } = trpc.public.settings.get.useQuery();
  const contactMutation = trpc.public.contact.submit.useMutation();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    fullName: "", email: "", phone: "", subject: "", message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.subject || !form.message) return;
    try {
      await contactMutation.mutateAsync(form);
      setSubmitted(true);
      setForm({ fullName: "", email: "", phone: "", subject: "", message: "" });
    } catch (err) {
      console.error("Contact submit failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-16 bg-gradient-to-br from-[#1A1A2E] via-[#5E17EB] to-[#1A1A2E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white font-display">
            Contact <span className="text-gradient-gold">Us</span>
          </h1>
          <p className="mt-4 text-lg text-white/70 max-w-2xl mx-auto">
            Have questions? We'd love to hear from you. Our team is here to help.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <Card className="border-0 shadow-xl">
                <CardContent className="p-8">
                  {submitted ? (
                    <div className="text-center py-12">
                      <CheckCircle className="w-16 h-16 text-[#00B894] mx-auto mb-4" />
                      <h2 className="text-2xl font-bold text-[#1A1A2E] mb-2 font-display">Message Sent!</h2>
                      <p className="text-[#6B7280]">We'll get back to you within 24 hours.</p>
                      <Button
                        variant="outline"
                        className="mt-6"
                        onClick={() => setSubmitted(false)}
                      >
                        Send Another Message
                      </Button>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-2xl font-bold text-[#1A1A2E] mb-6 font-display">
                        Send Us a Message
                      </h2>
                      <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label>Full Name *</Label>
                            <Input
                              value={form.fullName}
                              onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                              placeholder="Your name"
                              required
                            />
                          </div>
                          <div>
                            <Label>Email *</Label>
                            <Input
                              type="email"
                              value={form.email}
                              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                              placeholder="your@email.com"
                              required
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label>Phone</Label>
                            <Input
                              value={form.phone}
                              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                              placeholder="+250..."
                            />
                          </div>
                          <div>
                            <Label>Subject *</Label>
                            <Select value={form.subject} onValueChange={(v) => setForm((p) => ({ ...p, subject: v }))}>
                              <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Admissions">Admissions</SelectItem>
                                <SelectItem value="Course Info">Course Info</SelectItem>
                                <SelectItem value="Fees">Fees</SelectItem>
                                <SelectItem value="General">General</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label>Message *</Label>
                          <textarea
                            className="w-full min-h-[120px] p-3 border rounded-md text-sm"
                            value={form.message}
                            onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                            placeholder="How can we help you?"
                            required
                          />
                        </div>
                        <Button
                          type="submit"
                          disabled={contactMutation.isPending}
                          className="w-full bg-gradient-to-r from-[#5E17EB] to-[#5E17EB] text-[#1A1A2E] hover:from-[#5E17EB] hover:to-[#5E17EB] font-semibold"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          {contactMutation.isPending ? "Sending..." : "Send Message"}
                        </Button>
                        <p className="text-xs text-[#6B7280] text-center">
                          We respond within 24 hours on business days
                        </p>
                      </form>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-[#1A1A2E] mb-6 font-display">
                  Get In Touch
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-[#EDE7FF] rounded-xl">
                    <div className="w-12 h-12 rounded-full bg-[#5E17EB]/10 flex items-center justify-center shrink-0">
                      <MapPin className="w-6 h-6 text-[#5E17EB]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#1A1A2E]">Visit Us</h3>
                      <p className="text-sm text-[#6B7280]">
                        {settings?.address || "Centenary House, 8 KN 4 Ave, Kigali, Rwanda"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-[#EDE7FF] rounded-xl">
                    <div className="w-12 h-12 rounded-full bg-[#5E17EB]/10 flex items-center justify-center shrink-0">
                      <Phone className="w-6 h-6 text-[#5E17EB]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#1A1A2E]">Call Us</h3>
                      <p className="text-sm text-[#6B7280]">
                        {settings?.phone || "+250 786 053 720"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-[#EDE7FF] rounded-xl">
                    <div className="w-12 h-12 rounded-full bg-[#5E17EB]/10 flex items-center justify-center shrink-0">
                      <Mail className="w-6 h-6 text-[#5E17EB]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#1A1A2E]">Email Us</h3>
                      <p className="text-sm text-[#6B7280]">
                        {settings?.email || "info@pacemakerinstitute.rw"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-[#EDE7FF] rounded-xl">
                    <div className="w-12 h-12 rounded-full bg-[#5E17EB]/10 flex items-center justify-center shrink-0">
                      <Clock className="w-6 h-6 text-[#5E17EB]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#1A1A2E]">Opening Hours</h3>
                      <p className="text-sm text-[#6B7280]">
                        {settings?.openingHours || "Mon to Fri: 8:00 AM to 6:00 PM | Sat: 9:00 AM to 1:00 PM"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <a
                href={`https://wa.me/${(settings?.whatsapp || "250786053720").replace(/\+/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-4 bg-[#25D366] text-white rounded-xl hover:bg-[#128C7E] transition-colors font-semibold"
              >
                <MessageCircle className="w-5 h-5" />
                Chat with Us on WhatsApp
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
