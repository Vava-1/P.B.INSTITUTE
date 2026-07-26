import { Link } from "react-router";
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Twitter, Linkedin, Youtube } from "lucide-react";
import { trpc } from "@/providers/trpc";

export default function Footer() {
  const { data: settings } = trpc.public.settings.get.useQuery();

  return (
    <footer className="bg-brand-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-3">
              <img src="/images/PBI_logo.jpg" alt="Pacemaker Institute" className="h-10 w-auto rounded-lg" />
              <span className="text-base font-bold font-display text-white">Pacemaker Institute</span>
            </Link>
            <p className="text-white/70 text-sm leading-snug mb-3">
              Empowering individuals with practical skills and professional knowledge.
            </p>
            <div className="flex items-center gap-2">
              {settings?.facebookUrl && <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"><Facebook className="w-4 h-4 text-white" /></a>}
              {settings?.instagramUrl && <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"><Instagram className="w-4 h-4 text-white" /></a>}
              {settings?.twitterUrl && <a href={settings.twitterUrl} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"><Twitter className="w-4 h-4 text-white" /></a>}
              {settings?.linkedinUrl && <a href={settings.linkedinUrl} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"><Linkedin className="w-4 h-4 text-white" /></a>}
              {settings?.youtubeUrl && <a href={settings.youtubeUrl} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"><Youtube className="w-4 h-4 text-white" /></a>}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-3">Quick Links</h4>
            <ul className="space-y-1.5">
              {[{ label: "Home", href: "/" }, { label: "About", href: "/about" }, { label: "Courses", href: "/courses" }, { label: "News", href: "/news" }, { label: "Enroll", href: "/enroll" }, { label: "FAQs", href: "/faqs" }].map((link) => (
                <li key={link.label}><Link to={link.href} className="text-white/70 hover:text-white text-sm transition-colors">{link.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Courses */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-3">Courses</h4>
            <ul className="space-y-1.5">
              {[{ label: "Languages", href: "/courses/languages-conversational" }, { label: "Bakery", href: "/courses/bakery" }, { label: "Salon", href: "/courses/salon" }, { label: "Mechanics", href: "/courses/mechanics" }, { label: "AI Skills", href: "/courses/ai-skills-for-professionals" }].map((link) => (
                <li key={link.label}><Link to={link.href} className="text-white/70 hover:text-white text-sm transition-colors">{link.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-3">Contact</h4>
            <ul className="space-y-1.5">
              <li className="flex items-start gap-2"><MapPin className="w-4 h-4 text-white shrink-0 mt-0.5" /><span className="text-white/70 text-sm leading-snug">{settings?.address || "Centenary House, Kigali"}</span></li>
              <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-white shrink-0" /><a href={`tel:${settings?.phone || "+250786053720"}`} className="text-white/70 hover:text-white text-sm transition-colors">{settings?.phone || "+250 786 053 720"}</a></li>
              <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-white shrink-0" /><a href={`mailto:${settings?.email || "info@pacemakerinstitute.rw"}`} className="text-white/70 hover:text-white text-sm transition-colors">{settings?.email || "info@pacemakerinstitute.rw"}</a></li>
              <li className="flex items-start gap-2"><Clock className="w-4 h-4 text-white shrink-0 mt-0.5" /><span className="text-white/70 text-sm leading-snug">Mon-Fri 8AM-6PM</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-white/50 text-sm">&copy; {new Date().getFullYear()} Pacemaker Institute.</p>
          <div className="flex items-center gap-4">
            <Link to="/contact" className="text-white/50 hover:text-white text-sm transition-colors">Privacy</Link>
            <Link to="/contact" className="text-white/50 hover:text-white text-sm transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
