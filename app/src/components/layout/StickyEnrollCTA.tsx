import { useEffect, useState } from "react";
import { Link } from "react-router";

export function StickyEnrollCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className={`fixed bottom-20 right-4 z-40 transition-all duration-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
      <Link to="/enroll" className="flex items-center gap-2 px-5 py-3 bg-[#F4A400] text-[#1A1A2E] font-bold rounded-full shadow-lg shadow-[#F4A400]/30 hover:bg-[#e09600] transition-colors text-sm">
        Enroll Now
      </Link>
    </div>
  );
}
