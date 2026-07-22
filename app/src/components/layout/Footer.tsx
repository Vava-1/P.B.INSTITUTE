import { Link } from "react-router";
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Twitter, Linkedin, Youtube } from "lucide-react";
import { trpc } from "@/providers/trpc";

export default function Footer() {
  const { data: settings } = trpc.public.settings.get.useQuery();

  return (
    <footer className="bg-brand-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <img
                src="/images/PBI_logo.jpg"
                alt="Pacemaker Institute"
                className="h-16 w-auto rounded-xl shadow-lg"
              />
              <div>
                <div className="text-xl font-bold leading-tight font-display">
                  Pacemaker
                </div>
                <div className="font-hand text-lg text-gold leading-none mt-0.5">
                  Institute
                </div>
              </div>
            </Link>
            <p className="text-muted/80 text-sm leading-relaxed mb-6">
              Empowering individuals with practical skills, language mastery,
              and professional knowledge to excel in today's competitive world.
            </p>
            <div className="flex items-center gap-3">
              {settings?.facebookUrl && (
                <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand transition-colors">
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {settings?.instagramUrl && (
                <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand transition-colors">
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {settings?.twitterUrl && (
                <a href={settings.twitterUrl} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand transition-colors">
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {settings?.linkedinUrl && (
                <a href={settings.linkedinUrl} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand transition-colors">
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {settings?.youtubeUrl && (
                <a href={settings.youtubeUrl} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand transition-colors">
                  <Youtube className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-brand font-semibold text-sm uppercase tracking-wider mb-6">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Home", href: "/" },
                { label: "About Us", href: "/about" },
                { label: "Our Courses", href: "/courses" },
                { label: "News & Events", href: "/news" },
                { label: "Contact Us", href: "/contact" },
                { label: "FAQs", href: "/faqs" },
                { label: "Enroll Now", href: "/enroll" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-muted/70 hover:text-brand text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Courses */}
          <div>
            <h4 className="text-brand font-semibold text-sm uppercase tracking-wider mb-6">
              Our Courses
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Language Courses", href: "/courses/languages-conversational" },
                { label: "Test Preparation", href: "/courses/language-test-prep" },
                { label: "Bakery & Pastry", href: "/courses/bakery" },
                { label: "Salon & Beauty", href: "/courses/salon" },
                { label: "Mechanics", href: "/courses/mechanics" },
                { label: "AI Skills", href: "/courses/ai-skills-for-professionals" },
                { label: "Private Candidate", href: "/courses/private-candidate-support" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-muted/70 hover:text-brand text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-brand font-semibold text-sm uppercase tracking-wider mb-6">
              Contact Us
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand shrink-0 mt-0.5" />
                <span className="text-muted/70 text-sm">
                  {settings?.address || "Centenary House, 8 KN 4 Ave, Kigali, Rwanda"}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-brand shrink-0" />
                <a href={`tel:${settings?.phone || "+250786053720"}`} className="text-muted/70 text-sm hover:text-brand transition-colors">
                  {settings?.phone || "+250 786 053 720"}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-brand shrink-0" />
                <a href={`mailto:${settings?.email || "info@pacemakerinstitute.rw"}`} className="text-muted/70 text-sm hover:text-brand transition-colors">
                  {settings?.email || "info@pacemakerinstitute.rw"}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-brand shrink-0 mt-0.5" />
                <span className="text-muted/70 text-sm">
                  {settings?.openingHours || "Mon to Fri: 8:00 AM to 6:00 PM | Sat: 9:00 AM to 1:00 PM"}
                </span>
              </li>
            </ul>
            <a
              href={`https://wa.me/${(settings?.whatsapp || "+250786053720").replace(/\+/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-6 px-4 py-2 bg-[#25D366] text-white text-sm font-medium rounded-full hover:bg-[#128C7E] transition-colors"
            >
              <Phone className="w-4 h-4" />
              Chat on WhatsApp
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-muted/50 text-sm">
            &copy; {new Date().getFullYear()} Pacemaker Institute. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/contact" className="text-muted/50 hover:text-brand text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link to="/contact" className="text-muted/50 hover:text-brand text-sm transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
