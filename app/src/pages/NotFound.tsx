import { Link } from "react-router";
import { Home, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1A2E] via-[#5E17EB] to-[#1A1A2E] flex items-center justify-center px-4">
      <div className="absolute inset-0 diagonal-stripe opacity-30" />
      <div className="relative text-center">
        <img
          src="/images/PBI_logo.jpg"
          alt="Pacemaker Institute"
          className="h-24 w-auto rounded-lg mx-auto mb-6 shadow-lg"
        />
        <h1 className="text-6xl md:text-8xl font-bold text-white font-display mb-4">
          404
        </h1>
        <h2 className="text-2xl font-bold text-white mb-4 font-display">
          Page Not Found
        </h2>
        <p className="text-white/70 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            asChild
            className="bg-gradient-to-r from-[#5E17EB] to-[#5E17EB] text-[#1A1A2E] hover:from-[#5E17EB] hover:to-[#5E17EB] font-semibold rounded-full px-8"
          >
            <Link to="/" className="flex items-center gap-2">
              <Home className="w-4 h-4" /> Back to Home
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10 rounded-full px-8"
          >
            <Link to="/courses" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Browse Courses
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
