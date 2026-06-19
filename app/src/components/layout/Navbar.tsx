import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { Menu, X, ChevronDown, GraduationCap, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  {
    label: "Courses",
    href: "/courses",
    children: [
      { label: "Languages", href: "/courses/languages-conversational" },
      { label: "Language Test Prep", href: "/courses/language-test-prep" },
      { label: "Bakery & Pastry", href: "/courses/bakery" },
      { label: "Salon & Beauty", href: "/courses/salon" },
      { label: "Mechanics", href: "/courses/mechanics" },
      { label: "AI Skills", href: "/courses/ai-skills-for-professionals" },
      { label: "Private Candidate", href: "/courses/private-candidate-support" },
    ],
  },
  { label: "News", href: "/news" },
  { label: "Contact", href: "/contact" },
  { label: "FAQs", href: "/faqs" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  const isHome = location.pathname === "/";
  const showBg = scrolled || !isHome;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          showBg
            ? "bg-white/95 backdrop-blur-md shadow-md"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 shrink-0">
              <img
                src="/images/PBI_logo.jpg"
                alt="Pacemaker Institute"
                className="h-12 w-auto rounded"
              />
              <div className={`hidden sm:block ${showBg ? "text-[#0D1B2A]" : "text-white"}`}>
                <div className="text-lg font-bold leading-tight font-display">
                  Pacemaker
                </div>
                <div className="text-xs uppercase tracking-wider font-medium">
                  Institute
                </div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) =>
                link.children ? (
                  <div
                    key={link.label}
                    className="relative"
                    onMouseEnter={() => setDropdownOpen(true)}
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    <button
                      className={`flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors rounded-md ${
                        showBg
                          ? "text-[#1E1E2E] hover:text-[#1A3C6E] hover:bg-[#F8F9FC]"
                          : "text-white/90 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {link.label}
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    {dropdownOpen && (
                      <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50">
                        {link.children.map((child) => (
                          <Link
                            key={child.label}
                            to={child.href}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#1E1E2E] hover:bg-[#F8F9FC] hover:text-[#1A3C6E] transition-colors"
                          >
                            <GraduationCap className="w-4 h-4 text-[#F4A400]" />
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={link.label}
                    to={link.href}
                    className={`px-3 py-2 text-sm font-medium transition-colors rounded-md ${
                      showBg
                        ? "text-[#1E1E2E] hover:text-[#1A3C6E] hover:bg-[#F8F9FC]"
                        : "text-white/90 hover:text-white hover:bg-white/10"
                    } ${location.pathname === link.href ? "font-semibold" : ""}`}
                  >
                    {link.label}
                  </Link>
                )
              )}
            </div>

            {/* CTA */}
            <div className="hidden lg:flex items-center gap-3">
              <Button
                asChild
                className="bg-gradient-to-r from-[#F4A400] to-[#FFD166] text-[#0D1B2A] hover:from-[#FFD166] hover:to-[#F4A400] font-semibold rounded-full px-6"
              >
                <Link to="/enroll">Enroll Now</Link>
              </Button>
            </div>

            {/* Mobile Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`lg:hidden p-2 rounded-md ${
                showBg ? "text-[#0D1B2A]" : "text-white"
              }`}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-[#0D1B2A] shadow-2xl overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <img
                  src="/images/PBI_logo.jpg"
                  alt="Pacemaker Institute"
                  className="h-14 w-auto rounded"
                />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="text-white p-2"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-1">
                {navLinks.map((link) =>
                  link.children ? (
                    <div key={link.label} className="space-y-1">
                      <div className="text-[#F4A400] font-semibold text-sm uppercase tracking-wider px-3 py-2">
                        {link.label}
                      </div>
                      {link.children.map((child) => (
                        <Link
                          key={child.label}
                          to={child.href}
                          className="flex items-center gap-2 px-3 py-2.5 text-sm text-white/80 hover:text-[#F4A400] hover:bg-white/5 rounded-md transition-colors"
                        >
                          <GraduationCap className="w-4 h-4 shrink-0" />
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <Link
                      key={link.label}
                      to={link.href}
                      className={`block px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                        location.pathname === link.href
                          ? "text-[#F4A400] bg-white/5"
                          : "text-white/80 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {link.label}
                    </Link>
                  )
                )}
              </div>
              <div className="mt-8 pt-6 border-t border-white/10">
                <Button
                  asChild
                  className="w-full bg-gradient-to-r from-[#F4A400] to-[#FFD166] text-[#0D1B2A] hover:from-[#FFD166] hover:to-[#F4A400] font-semibold rounded-full"
                >
                  <Link to="/enroll">Enroll Now</Link>
                </Button>
                <a
                  href="https://wa.me/250786053720"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 mt-3 text-sm text-white/60 hover:text-[#00B894] transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
