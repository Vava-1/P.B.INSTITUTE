import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import {
  BookOpen, Users, Clock, Award, ArrowRight, Star,
  CheckCircle, GraduationCap, Wrench, Cpu, Languages,
  ChefHat, Scissors, FileText, ChevronLeft, ChevronRight, Linkedin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/providers/trpc";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";

const categoryIcons: Record<string, any> = {
  languages: Languages,
  bakery: ChefHat,
  salon: Scissors,
  mechanics: Wrench,
  ai_skills: Cpu,
  private_candidate: FileText,
};

const categoryColors: Record<string, string> = {
  languages: "#3B82F6",
  bakery: "#F59E0B",
  salon: "#EC4899",
  mechanics: "#6B7280",
  ai_skills: "#8B5CF6",
  private_candidate: "#10B981",
};

// ─── HOME PAGE ───
export default function Home() {
  const { data } = trpc.public.homepage.data.useQuery();
  const courses = data?.featuredCourses;
  const allCourses = data?.allCourses ?? [];
  const testimonialsData = data?.testimonials ?? [];
  const news = data?.news ?? [];
  const settings = data?.settings;

  const announcementMsgs = settings?.announcementMessages
    ? JSON.parse(settings.announcementMessages as string)
    : [];
  const [announceIdx, setAnnounceIdx] = useState(0);

  useEffect(() => {
    if (announcementMsgs.length <= 1) return;
    const iv = setInterval(() => setAnnounceIdx((p) => (p + 1) % announcementMsgs.length), 5000);
    return () => clearInterval(iv);
  }, [announcementMsgs.length]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Announcement Ticker */}
      {settings?.announcementActive && announcementMsgs.length > 0 && (
        <div className="fixed top-20 left-0 right-0 z-40 bg-[#5E17EB] text-white py-2.5 px-4 text-center text-sm font-medium shadow-md">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
            <span className="animate-pulse">📣</span>
            <span>{announcementMsgs[announceIdx]}</span>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <HeroSection />

      {/* Courses Slider */}
      <CoursesSlider courses={allCourses || []} />

      {/* Stats Counter */}
      <StatsSection />

      {/* Courses Section */}
      <section className="py-32 bg-[#EDE7FF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-[#5E17EB] font-semibold text-sm uppercase tracking-wider">
              What We Teach
            </span>
            <h2 className="mt-3 text-4xl md:text-5xl font-bold text-[#1A1A2E] font-display">
              Six Paths to <span className="text-gradient-gold">Excellence</span>
            </h2>
            <p className="mt-4 text-lg text-[#6B7280] max-w-2xl mx-auto">
              Choose your course and start building real skills that employers and clients value.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses?.map((course) => {
              const Icon = categoryIcons[course.category] || BookOpen;
              const color = categoryColors[course.category] || "#5E17EB";
              return (
                <Card
                  key={course.id}
                  className="group overflow-hidden bg-white border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="h-1.5" style={{ backgroundColor: color }} />
                  <CardContent className="p-6">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                      style={{ backgroundColor: `${color}15` }}
                    >
                      <Icon className="w-7 h-7" style={{ color }} />
                    </div>
                    <h3 className="text-xl font-bold text-[#1A1A2E] mb-2 font-display">
                      {course.title}
                    </h3>
                    <p className="text-[#6B7280] text-sm mb-4 line-clamp-2">
                      {course.shortDesc}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-[#6B7280] mb-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {course.duration}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Link
                        to={`/courses/${course.slug}`}
                        className="text-sm font-medium text-[#5E17EB] hover:text-[#5E17EB] transition-colors flex items-center gap-1"
                      >
                        Learn More <ArrowRight className="w-4 h-4" />
                      </Link>
                      <Link
                        to="/enroll"
                        className="text-sm font-medium px-4 py-1.5 rounded-full text-white transition-colors"
                        style={{ backgroundColor: color }}
                      >
                        Enroll
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="text-center mt-10">
            <Button
              asChild
              variant="outline"
              className="border-[#5E17EB] text-[#5E17EB] hover:bg-[#5E17EB] hover:text-white rounded-full px-8"
            >
              <Link to="/courses">View All Courses</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <WhyChooseSection />

      {/* Testimonials */}
      <TestimonialsSection testimonials={testimonialsData} />

      {/* News Preview */}
      <section className="py-32 bg-[#EDE7FF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <span className="text-[#5E17EB] font-semibold text-sm uppercase tracking-wider">
                Latest Updates
              </span>
              <h2 className="mt-3 text-3xl md:text-4xl font-bold text-[#1A1A2E] font-display">
                News & Events
              </h2>
            </div>
            <Link
              to="/news"
              className="hidden sm:flex items-center gap-1 text-[#5E17EB] hover:text-[#5E17EB] font-medium transition-colors"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {news?.map((item) => (
              <Card
                key={item.id}
                className="overflow-hidden bg-white border-0 shadow-md hover:shadow-xl transition-all duration-300 group"
              >
                <div className="h-48 bg-gradient-to-br from-[#5E17EB] to-[#1A1A2E] flex items-center justify-center">
                  <span className="text-5xl font-bold text-white/20 font-display uppercase">
                    {item.category.charAt(0)}
                  </span>
                </div>
                <CardContent className="p-6">
                  <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-[#5E17EB]/10 text-[#5E17EB] mb-3 uppercase">
                    {item.category}
                  </span>
                  <h3 className="text-lg font-bold text-[#1A1A2E] mb-2 font-display group-hover:text-[#5E17EB] transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#6B7280] line-clamp-2 mb-4">
                    {item.excerpt}
                  </p>
                  <span className="text-xs text-[#6B7280]">
                    By {item.authorName} ·{" "}
                    {item.publishedAt
                      ? new Date(item.publishedAt).toLocaleDateString()
                      : "Recently"}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 bg-gradient-to-br from-[#C8E6C9] via-[#E8F5E9] to-[#C8E6C9]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-4xl font-bold text-[#2E7D32] mb-3 font-display">
            Ready to Start Your Training?
          </h2>
          <p className="text-base text-[#2E7D32]/80 mb-6 max-w-2xl mx-auto">
            Join hundreds of Pacemaker graduates building better careers.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              asChild
              className="bg-[#2E7D32] text-white hover:bg-[#1B5E20] font-semibold rounded-full px-8 py-5 text-base"
            >
              <Link to="/enroll">Enroll Today</Link>
            </Button>
            <a
              href={`https://wa.me/${(settings?.whatsapp || "250786053720").replace(/\+/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-[#2E7D32] font-semibold rounded-full hover:bg-[#EDE7FF] transition-colors"
            >
              Talk to Us on WhatsApp
            </a>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}

// ─── COURSES SLIDER ───
function CoursesSlider({ courses }: { courses: any[] }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (courses.length <= 1) return;
    const iv = setInterval(() => setIdx((p) => (p + 1) % courses.length), 4000);
    return () => clearInterval(iv);
  }, [courses.length]);

  if (!courses.length) return null;

  const course = courses[idx];
  const Icon = categoryIcons[course.category] || BookOpen;
  const color = categoryColors[course.category] || "#5E17EB";

  return (
    <section className="bg-gradient-to-r from-[#5E17EB] via-[#5E17EB] to-[#5E17EB] py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-xl bg-white/20 backdrop-blur-sm">
          <div className="flex items-center gap-6 p-4 sm:p-6">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${color}20` }}
            >
              <Icon className="w-7 h-7" style={{ color }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-xs text-[#1A1A2E]/60 uppercase tracking-wider font-medium mb-0.5">
                <span>Explore our programs</span>
                <span>·</span>
                <span>{course.category.replace(/_/g, " ")}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#1A1A2E] font-display truncate">
                {course.title}
              </h3>
              <p className="text-sm text-[#1A1A2E]/70 mt-0.5 line-clamp-1">
                {course.shortDesc}
              </p>
            </div>
            <Link
              to={`/courses/${course.slug}`}
              className="shrink-0 flex items-center gap-1 px-4 py-2 bg-[#1A1A2E] text-white text-sm font-medium rounded-lg hover:bg-[#5E17EB] transition-colors"
            >
              View <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Dots */}
          {courses.length > 1 && (
            <div className="flex items-center justify-center gap-1.5 pb-3">
              {courses.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === idx ? "bg-[#1A1A2E] w-4" : "bg-[#1A1A2E]/30"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── HERO SECTION ───
function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      canvas.style.display = "none";
      return;
    }

    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    const ribbons: {
      y: number;
      amplitude: number;
      frequency: number;
      speed: number;
      phase: number;
      width: number;
      color: string;
    }[] = [];

    for (let i = 0; i < 6; i++) {
      ribbons.push({
        y: h * 0.35 + i * 50,
        amplitude: 40 + i * 8,
        frequency: 0.003 + i * 0.0005,
        speed: 0.3 + i * 0.1,
        phase: (i * Math.PI) / 3,
        width: 2,
        color: i % 2 === 0 ? "rgba(244, 164, 0, 0.15)" : "rgba(4, 102, 200, 0.12)",
      });
    }

    let animId: number;
    let time = 0;

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);

      // Deep navy gradient background
      const bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, "#1A1A2E");
      bg.addColorStop(0.5, "#5E17EB");
      bg.addColorStop(1, "#1A1A2E");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Diagonal gold stripe watermark
      ctx.save();
      for (let i = -10; i < 20; i++) {
        ctx.beginPath();
        ctx.moveTo(i * 80, 0);
        ctx.lineTo(i * 80 + 200, h);
        ctx.strokeStyle = "rgba(244, 164, 0, 0.03)";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.restore();

      // Animated ribbons
      ribbons.forEach((ribbon) => {
        ctx.beginPath();
        ctx.moveTo(0, ribbon.y);
        for (let x = 0; x < w; x += 2) {
          const mx = (mouseRef.current.x / w - 0.5) * 30;
          const my = (mouseRef.current.y / h - 0.5) * 15;
          const y =
            ribbon.y +
            Math.sin(x * ribbon.frequency + time * ribbon.speed + ribbon.phase) *
              ribbon.amplitude +
            mx * Math.sin(x * 0.002) +
            my;
          ctx.lineTo(x, y);
        }
        ctx.strokeStyle = ribbon.color;
        ctx.lineWidth = ribbon.width;
        ctx.stroke();

        // Glow line
        ctx.beginPath();
        ctx.moveTo(0, ribbon.y);
        for (let x = 0; x < w; x += 4) {
          const mx = (mouseRef.current.x / w - 0.5) * 30;
          const my = (mouseRef.current.y / h - 0.5) * 15;
          const y =
            ribbon.y +
            Math.sin(x * ribbon.frequency + time * ribbon.speed + ribbon.phase) *
              ribbon.amplitude +
            mx * Math.sin(x * 0.002) +
            my;
          ctx.lineTo(x, y);
        }
        ctx.strokeStyle = ribbon.color.replace(/[\d.]+\)$/, "0.05)");
        ctx.lineWidth = 12;
        ctx.stroke();
      });

      // Spotlight effect
      const spotX = w * 0.5 + (mouseRef.current.x - w * 0.5) * 0.05;
      const spotY = h * 0.3 + (mouseRef.current.y - h * 0.3) * 0.05;
      const spot = ctx.createRadialGradient(spotX, spotY, 0, spotX, spotY, h * 0.6);
      spot.addColorStop(0, "rgba(212, 164, 24, 0.08)");
      spot.addColorStop(0.5, "rgba(4, 102, 200, 0.04)");
      spot.addColorStop(1, "transparent");
      ctx.fillStyle = spot;
      ctx.fillRect(0, 0, w, h);

      time += 0.015;
      animId = requestAnimationFrame(draw);
    }

    draw();

    const handleResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    };

    let mouseThrottleId: number;
    const handleMouse = (e: MouseEvent) => {
      cancelAnimationFrame(mouseThrottleId);
      mouseThrottleId = requestAnimationFrame(() => {
        mouseRef.current = { x: e.clientX, y: e.clientY };
      });
    };

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("mousemove", handleMouse, { passive: true });

    return () => {
      cancelAnimationFrame(animId);
      cancelAnimationFrame(mouseThrottleId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouse);
    };
  }, []);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 font-display leading-tight">
          Master a Skill.
          <br />
          <span className="text-gradient-gold">Transform Your Future.</span>
        </h1>
        <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed">
          Professional training in Languages, Bakery, Salon, Mechanics,
          AI Skills, and Exam Preparation, all in the heart of Kigali.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            asChild
            className="bg-gradient-to-r from-[#F4A400] to-[#FFD166] text-[#1A1A2E] font-bold rounded-full px-8 py-6 text-lg shadow-lg shadow-[#F4A400]/30 hover:from-[#e09600] hover:to-[#F4A400] transition-all"
          >
            <Link to="/enroll">Enroll Now</Link>
          </Button>
          <Button
            asChild
            className="border-2 border-white text-white hover:bg-white/10 font-semibold rounded-full px-8 py-6 text-lg backdrop-blur-sm"
          >
            <Link to="/courses">Browse Courses</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

// ─── STATS SECTION ───
function StatsSection() {
  const statsRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const stats = [
    { icon: GraduationCap, value: 1000, suffix: "+", label: "Graduates" },
    { icon: BookOpen, value: 6, suffix: "", label: "Courses" },
    { icon: Award, value: 98, suffix: "%", label: "Student Satisfaction" },
    { icon: Users, value: 10, suffix: "+", label: "Years of Excellence" },
  ];

  return (
    <section
      ref={statsRef}
      className="relative py-32 bg-gradient-to-r from-[#1A1A2E] via-[#5E17EB] to-[#1A1A2E]"
    >
      <div className="absolute inset-0 diagonal-stripe opacity-50" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div key={stat.label} className="text-center">
              <stat.icon className="w-8 h-8 text-[#F4A400] mx-auto mb-3" />
              <div className="text-4xl md:text-5xl font-bold text-white font-display mb-1">
                {visible ? <CountUp end={stat.value} duration={2000} delay={i * 200} /> : "0"}
                <span className="text-[#F4A400]">{stat.suffix}</span>
              </div>
              <div className="text-sm text-white/70">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CountUp({ end, duration, delay = 0 }: { end: number; duration: number; delay?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const start = performance.now();
      const animate = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(eased * end));
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }, delay);
    return () => clearTimeout(timeout);
  }, [end, duration, delay]);

  return <>{count.toLocaleString()}</>;
}

// ─── WHY CHOOSE US ───
function WhyChooseSection() {
  const features = [
    {
      icon: Award,
      title: "Qualified Instructors",
      desc: "Expert trainers with real-world industry experience and teaching qualifications.",
    },
    {
      icon: Users,
      title: "Hands-On Learning",
      desc: "Theory meets practice so you learn by doing in our fully equipped facilities.",
    },
    {
      icon: CheckCircle,
      title: "Recognized Certificates",
      desc: "Our certificates are trusted by employers across Rwanda and East Africa.",
    },
    {
      icon: Clock,
      title: "Flexible Schedules",
      desc: "Morning, afternoon, evening and weekend classes to fit your lifestyle.",
    },
  ];

  const comparisons = [
    { feature: "Certified Instructors", pbi: true, others: "partial" },
    { feature: "Flexible Timing", pbi: true, others: false },
    { feature: "Industry Practice", pbi: true, others: "partial" },
    { feature: "Multiple Courses", pbi: true, others: false },
    { feature: "Post-course Support", pbi: true, others: false },
  ];

  return (
    <section className="py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-[#5E17EB] font-semibold text-sm uppercase tracking-wider">
            Why Pacemaker
          </span>
          <h2 className="mt-3 text-4xl md:text-5xl font-bold text-[#1A1A2E] font-display">
            Why Choose <span className="text-[#5E17EB]">Pacemaker Institute?</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Feature blocks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((f) => (
              <Card
                key={f.title}
                className="border-0 shadow-md hover:shadow-lg transition-shadow bg-[#EDE7FF]"
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-[#5E17EB]/10 flex items-center justify-center mb-4">
                    <f.icon className="w-6 h-6 text-[#5E17EB]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1A1A2E] mb-2">{f.title}</h3>
                  <p className="text-sm text-[#6B7280]">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Comparison table */}
          <div className="bg-[#1A1A2E] rounded-2xl p-8">
            <h3 className="text-xl font-bold text-white mb-6 font-display">
              Pacemaker vs Others
            </h3>
            <div className="space-y-4">
              {comparisons.map((c) => (
                <div
                  key={c.feature}
                  className="flex items-center justify-between py-3 border-b border-white/10 last:border-0"
                >
                  <span className="text-white/80 text-sm">{c.feature}</span>
                  <div className="flex items-center gap-6">
                    <span className="text-[#00B894] text-sm font-medium">
                      {c.pbi ? "✓ Yes" : ""}
                    </span>
                    <span className="text-white/40 text-sm w-16 text-right">
                      {c.others === true ? "✓ Yes" : c.others === false ? "✗ No" : "⚠ Varies"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── TESTIMONIALS SECTION ───
function TestimonialsSection({ testimonials }: { testimonials: any[] }) {
  const [current, setCurrent] = useState(0);

  if (!testimonials.length) return null;

  const next = () => setCurrent((p) => (p + 1) % testimonials.length);
  const prev = () => setCurrent((p) => (p - 1 + testimonials.length) % testimonials.length);

  const t = testimonials[current];

  return (
    <section className="py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-[#5E17EB] font-semibold text-sm uppercase tracking-wider">
            Testimonials
          </span>
          <h2 className="mt-3 text-4xl md:text-5xl font-bold text-[#1A1A2E] font-display">
            What Our <span className="text-gradient-gold">Students Say</span>
          </h2>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative bg-gradient-to-br from-[#EDE7FF] to-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100">
            <div className="text-6xl text-[#5E17EB]/30 font-display leading-none mb-6">
              "
            </div>
            <p className="text-lg md:text-xl text-[#1A1A2E] leading-relaxed mb-8 italic">
              {t?.quote}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {t?.photoUrl ? (
                  <div className="relative w-14 h-14 shrink-0">
                    <img src={t.photoUrl} alt={t.studentName} className="w-14 h-14 rounded-full object-cover" />
                    {t?.linkedinUrl && (
                      <a href={t.linkedinUrl} target="_blank" rel="noopener noreferrer"
                        className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#0A66C2] rounded-full flex items-center justify-center shadow hover:scale-110 transition-transform">
                        <Linkedin className="w-3.5 h-3.5 text-white" />
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="relative w-14 h-14 shrink-0">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#5E17EB] to-[#1A1A2E] flex items-center justify-center text-white font-bold text-lg">
                      {t?.studentName?.charAt(0)}
                    </div>
                    {t?.linkedinUrl && (
                      <a href={t.linkedinUrl} target="_blank" rel="noopener noreferrer"
                        className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#0A66C2] rounded-full flex items-center justify-center shadow hover:scale-110 transition-transform">
                        <Linkedin className="w-3.5 h-3.5 text-white" />
                      </a>
                    )}
                  </div>
                )}
                <div>
                  <div className="font-bold text-[#1A1A2E]">{t?.studentName}</div>
                  <div className="text-sm text-[#6B7280]">
                    {t?.courseName} · {t?.currentRole}
                    {t?.employer ? ` at ${t.employer}` : ""}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: t?.rating || 5 }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-[#5E17EB] text-[#5E17EB]" />
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-3 mt-8">
              <button
                onClick={prev}
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-[#EDE7FF] transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    i === current ? "bg-[#5E17EB]" : "bg-gray-300"
                  }`}
                />
              ))}
              <button
                onClick={next}
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-[#EDE7FF] transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
