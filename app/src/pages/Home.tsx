import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import {
  BookOpen, Users, Clock, Award, ArrowRight, Star,
  CheckCircle, GraduationCap, Wrench, Cpu, Languages,
  ChefHat, Scissors, FileText, ChevronLeft, ChevronRight, Linkedin,
  Calendar, MapPin, X, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

// Real photos for each course category — humanizes the cards.
const categoryPhotos: Record<string, string> = {
  languages: "https://sfile.chatglm.cn/images-ppt/8f4abe659dfd.jpg",
  bakery: "https://sfile.chatglm.cn/images-ppt/cdfb0ab15a32.jpg",
  salon: "https://sfile.chatglm.cn/images-ppt/656589bdeea2.jpg",
  mechanics: "https://sfile.chatglm.cn/images-ppt/f41025bf86ea.jpg",
  ai_skills: "https://sfile.chatglm.cn/images-ppt/c96b5147d30a.png",
  private_candidate: "https://sfile.chatglm.cn/images-ppt/17c1ff02f142.jpg",
};

// ─── Helpers ───

// Safely parse a JSON-encoded DB text field (e.g. whatYoullLearn, modules).
function parseJsonArray(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

// Estimate reading time from article content (~200 wpm).
function readingTime(content: string | null | undefined): number {
  if (!content) return 1;
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

// Format RWF with thousands separators.
function formatRwf(amount: number | null | undefined): string | null {
  if (!amount || amount <= 0) return null;
  return new Intl.NumberFormat("en-RW").format(amount);
}

// ─── HOME PAGE ───
export default function Home() {
  const { data } = trpc.public.homepage.data.useQuery();
  const courses = data?.featuredCourses;
  const allCourses = data?.allCourses ?? [];
  const testimonialsData = data?.testimonials ?? [];
  const news = data?.news ?? [];
  const settings = data?.settings;

  const announcementMsgs = (() => {
    if (!settings?.announcementMessages) return [];
    try {
      const parsed = JSON.parse(settings.announcementMessages as string);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  })();
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
        <div className="fixed top-20 left-0 right-0 z-40 bg-brand text-white py-2.5 px-4 text-center text-sm font-medium shadow-md">
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
      <section className="py-32 bg-brand-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="font-hand text-2xl text-brand block mb-1">
              What We Teach
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground font-display">
              Six Paths to <span className="text-gradient-gold">Excellence</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose your course and start building real skills that employers and clients value.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(allCourses.length > 0 ? allCourses : courses ?? [])?.map((course) => {
              const Icon = categoryIcons[course.category] || BookOpen;
              const photo = categoryPhotos[course.category] || course.imageUrl || "";
              const skills = parseJsonArray(course.whatYoullLearn);
              const previewSkills = skills.slice(0, 3);
              const moreSkills = skills.length - previewSkills.length;
              const fee = formatRwf(course.feeRwf);
              return (
                <Card
                  key={course.id}
                  className="group overflow-hidden bg-white border-0 shadow-warm hover:shadow-warm-lg transition-all duration-300 hover:-translate-y-1 flex flex-col rounded-2xl"
                >
                  {/* Real photo header with category icon overlay. */}
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={photo}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to top, hsl(var(--brand) / 0.87) 0%, hsl(var(--brand) / 0.19) 50%, transparent 100%)" }} />
                    <div className="absolute top-3 left-3 w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-sm bg-white/90">
                      <Icon className="w-5 h-5 text-brand" aria-hidden="true" />
                    </div>
                    <h3 className="absolute bottom-3 left-4 right-4 text-lg font-bold text-white font-display leading-tight drop-shadow-lg">
                      {course.title}
                    </h3>
                  </div>
                  <CardContent className="p-5 flex flex-col flex-1">
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                      {course.shortDesc}
                    </p>

                    {/* Skills teaser — makes the user want to see the rest */}
                    {previewSkills.length > 0 && (
                      <div className="mb-3 p-3 rounded-xl bg-brand/[0.04]">
                        <p className="text-[10px] font-bold uppercase tracking-wider mb-2 font-hand text-base text-brand">
                          What you&apos;ll master
                        </p>
                        <ul className="space-y-1.5">
                          {previewSkills.map((skill, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                              <CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-brand" aria-hidden="true" />
                              <span className="line-clamp-1">{skill}</span>
                            </li>
                          ))}
                        </ul>
                        {moreSkills > 0 && (
                          <p className="text-[11px] text-muted-foreground mt-2 italic">
                            + {moreSkills} more skill{moreSkills > 1 ? "s" : ""} in the full curriculum
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4 mt-auto">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                        {course.duration}
                      </span>
                      {fee && (
                        <span className="flex items-center gap-1 font-medium text-foreground">
                          · {fee} RWF
                          {course.installmentAvailable && (
                            <span className="text-muted-foreground font-normal">/ installments ok</span>
                          )}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <Link
                        to={`/courses/${course.slug}`}
                        className="text-sm font-medium text-brand hover:text-brand transition-colors flex items-center gap-1"
                      >
                        See full curriculum <ArrowRight className="w-4 h-4" />
                      </Link>
                      <Link
                        to="/enroll"
                        className="text-sm font-medium px-4 py-1.5 rounded-full text-white bg-brand hover:bg-brand-dark transition-colors ml-auto"
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
              className="border-brand text-brand hover:bg-brand hover:text-white rounded-full px-8"
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
      <NewsPreviewSection news={news} />

      {/* CTA Banner */}
      <section className="py-16 bg-gradient-to-br from-gold via-gold to-gold">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-4xl font-bold text-gold mb-3 font-display">
            Ready to Start Your Training?
          </h2>
          <p className="text-base text-gold/80 mb-6 max-w-2xl mx-auto">
            Join hundreds of Pacemaker graduates building better careers.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              asChild
              className="bg-gold text-gold-foreground hover:bg-brand-dark hover:text-white font-semibold rounded-full px-8 py-5 text-base transition-colors"
            >
              <Link to="/enroll">Enroll Today</Link>
            </Button>
            <a
              href={`https://wa.me/${(settings?.whatsapp || "250786053720").replace(/\+/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-gold font-semibold rounded-full hover:bg-brand-light transition-colors"
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

  return (
    <section className="bg-gradient-to-r from-brand via-brand to-brand py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-xl bg-white/20 backdrop-blur-sm">
          <div className="flex items-center gap-6 p-4 sm:p-6">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 bg-brand/20"
            >
              <Icon className="w-7 h-7 text-brand" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-xs text-foreground/60 uppercase tracking-wider font-medium mb-0.5">
                <span>Explore our programs</span>
                <span>·</span>
                <span>{course.category.replace(/_/g, " ")}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground font-display truncate">
                {course.title}
              </h3>
              <p className="text-sm text-foreground/70 mt-0.5 line-clamp-1">
                {course.shortDesc}
              </p>
            </div>
            <Link
              to={`/courses/${course.slug}`}
              className="shrink-0 flex items-center gap-1 px-4 py-2 bg-brand-dark text-white text-sm font-medium rounded-lg hover:bg-brand transition-colors"
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
                    i === idx ? "bg-brand-dark w-4" : "bg-brand-dark/30"
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
// Real classroom photo with a warm purple/navy overlay — feels human and inviting,
// not cold and corporate like the old canvas animation.
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Real photo background — students in a classroom. */}
      <div className="absolute inset-0">
        <img
          src="https://sfile.chatglm.cn/images-ppt/c896710cc274.jpg"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover"
          loading="eager"
          fetchPriority="high"
        />
        {/* Warm overlay — keeps text readable while letting the photo breathe. */}
        <div className="absolute inset-0 photo-overlay" />
        {/* Subtle texture for warmth. */}
        <div className="absolute inset-0 diagonal-stripe opacity-30" />
      </div>

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto pt-20">
        {/* Handwritten accent label — human touch. */}
        <p className="font-hand text-2xl md:text-3xl text-gold mb-3 animate-fade-up">
          Welcome to Pacemaker Institute
        </p>
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 font-display leading-tight animate-fade-up" style={{ animationDelay: "0.1s" }}>
          Master a Skill.
          <br />
          <span className="text-gradient-gold">Transform Your Future.</span>
        </h1>
        <p className="text-lg md:text-xl text-white/85 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-up" style={{ animationDelay: "0.2s" }}>
          Professional training in Languages, Bakery, Salon, Mechanics,
          AI Skills, and Exam Preparation, all in the heart of Kigali.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: "0.3s" }}>
          <Button
            asChild
            className="bg-gradient-to-r from-gold to-gold text-foreground font-bold rounded-full px-8 py-6 text-lg shadow-warm-glow hover:from-gold hover:to-gold transition-all"
          >
            <Link to="/enroll">Enroll Now</Link>
          </Button>
          <Button
            asChild
            className="border-2 border-white/80 text-white hover:bg-white/15 font-semibold rounded-full px-8 py-6 text-lg backdrop-blur-sm"
          >
            <Link to="/courses">Browse Courses</Link>
          </Button>
        </div>
      </div>

      {/* Scroll indicator — gentle human cue. */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden md:flex flex-col items-center gap-2 text-white/50">
        <span className="font-hand text-sm">scroll to explore</span>
        <div className="w-px h-8 bg-gradient-to-b from-white/40 to-transparent" />
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
      className="relative py-32 bg-gradient-to-r from-brand-dark via-brand to-brand-dark"
    >
      <div className="absolute inset-0 diagonal-stripe opacity-50" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div key={stat.label} className="text-center">
              <stat.icon className="w-8 h-8 text-gold mx-auto mb-3" />
              <div className="text-4xl md:text-5xl font-bold text-white font-display mb-1">
                {visible ? <CountUp end={stat.value} duration={2000} delay={i * 200} /> : "0"}
                <span className="text-gold">{stat.suffix}</span>
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
          <span className="text-brand font-semibold text-sm uppercase tracking-wider">
            Why Pacemaker
          </span>
          <h2 className="mt-3 text-4xl md:text-5xl font-bold text-foreground font-display">
            Why Choose <span className="text-brand">Pacemaker Institute?</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Feature blocks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((f) => (
              <Card
                key={f.title}
                className="border-0 shadow-md hover:shadow-lg transition-shadow bg-brand-light"
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-brand/10 flex items-center justify-center mb-4">
                    <f.icon className="w-6 h-6 text-brand" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Comparison table */}
          <div className="bg-brand-dark rounded-2xl p-8">
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
                    <span className="text-gold text-sm font-medium">
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

// ─── TESTIMONIALS SECTION (carousel showing ALL testimonials) ───
function TestimonialsSection({ testimonials }: { testimonials: any[] }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  // Auto-rotate every 5 seconds (pauses on hover).
  useEffect(() => {
    if (paused || testimonials.length <= 1) return;
    const iv = setInterval(() => setCurrent((p) => (p + 1) % testimonials.length), 5000);
    return () => clearInterval(iv);
  }, [paused, testimonials.length]);

  if (!testimonials.length) return null;

  const next = () => setCurrent((p) => (p + 1) % testimonials.length);
  const prev = () => setCurrent((p) => (p - 1 + testimonials.length) % testimonials.length);
  const t = testimonials[current];

  return (
    <section className="py-32 bg-gradient-to-b from-white to-brand-light/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="font-hand text-2xl text-brand block mb-1">
            Testimonials
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground font-display">
            What Our <span className="text-gradient-gold">Students Say</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Real stories from graduates who transformed their lives through Pacemaker Institute.
          </p>
        </div>

        {/* Carousel */}
        <div
          className="max-w-4xl mx-auto"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div
            key={t.id}
            className="relative bg-gradient-to-br from-brand-light to-white rounded-3xl shadow-warm-lg p-8 md:p-12 border border-purple-100 animate-fade-up"
          >
            <div className="text-6xl text-brand/30 font-display leading-none mb-6">
              &ldquo;
            </div>
            <p className="text-lg md:text-xl text-foreground leading-relaxed mb-8 italic">
              {t?.quote}
            </p>
            <div className="flex items-center justify-between flex-wrap gap-4">
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
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center text-white font-bold text-lg">
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
                  <div className="font-bold text-foreground">{t?.studentName}</div>
                  <div className="text-sm text-muted-foreground">
                    {t?.courseName} · {t?.currentRole}
                    {t?.employer ? ` at ${t.employer}` : ""}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: t?.rating || 5 }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-gold text-gold" />
                ))}
              </div>
            </div>
          </div>

          {/* Navigation */}
          {testimonials.length > 1 && (
            <div className="flex items-center justify-center gap-3 mt-8">
              <button
                onClick={prev}
                aria-label="Previous testimonial"
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-brand-light transition-colors"
              >
                <ChevronLeft className="w-5 h-5" aria-hidden="true" />
              </button>
              {/* Dots */}
              <div className="flex items-center gap-1.5 flex-wrap justify-center max-w-md">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    aria-label={`Go to testimonial ${i + 1}`}
                    aria-current={i === current}
                    className={`h-2 rounded-full transition-all ${
                      i === current ? "bg-brand w-6" : "bg-gray-300 w-2 hover:bg-gray-400"
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={next}
                aria-label="Next testimonial"
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-brand-light transition-colors"
              >
                <ChevronRight className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
          )}

          {/* Counter */}
          <p className="text-center text-sm text-muted-foreground mt-4 font-hand text-base">
            {current + 1} of {testimonials.length} stories
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── NEWS PREVIEW SECTION (with article modal) ───
function NewsPreviewSection({ news }: { news: any[] }) {
  const [selected, setSelected] = useState<any | null>(null);

  return (
    <>
      <section className="py-32 bg-brand-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <span className="font-hand text-2xl text-brand block mb-1">
                Latest Updates
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground font-display">
                News & Events
              </h2>
              <p className="mt-3 text-muted-foreground max-w-xl">
                Stories, milestones, and announcements from the Pacemaker community. Tap any card to read the full story.
              </p>
            </div>
            <Link
              to="/news"
              className="hidden sm:flex items-center gap-1 text-brand hover:text-brand font-medium transition-colors shrink-0"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(news || []).map((item) => {
              const minutes = readingTime(item.content);
              // Use the thumbnailUrl if set, otherwise use a campus photo based on category.
              const newsPhoto = item.thumbnailUrl || "https://sfile.chatglm.cn/images-ppt/25cff1a6682d.jpg";
              return (
                <Card
                  key={item.id}
                  className="overflow-hidden bg-white border-0 shadow-warm hover:shadow-warm-lg transition-all duration-300 group cursor-pointer flex flex-col rounded-2xl"
                  onClick={() => setSelected(item)}
                >
                  <div className="h-44 relative overflow-hidden">
                    {/* Real photo background. */}
                    <img
                      src={newsPhoto}
                      alt=""
                      aria-hidden="true"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 photo-overlay-bottom" />
                    {/* Sparkle accent */}
                    <Sparkles className="w-5 h-5 text-white/40 absolute top-4 right-4" aria-hidden="true" />
                    {/* Category chip overlaid on the photo */}
                    <span className="absolute bottom-3 left-4 inline-block px-3 py-1 text-[10px] font-bold tracking-wider rounded-full bg-white/90 text-brand uppercase">
                      {item.category}
                    </span>
                  </div>
                  <CardContent className="p-6 flex flex-col flex-1">
                    <h3 className="text-lg font-bold text-foreground mb-2 font-display group-hover:text-brand transition-colors line-clamp-2">
                      {item.title}
                    </h3>

                    {/* Teaser excerpt with fade-out mask — hints at more content */}
                    <div className="relative mb-4">
                      <p className="text-sm text-muted-foreground line-clamp-3 pr-2">
                        {item.excerpt}
                      </p>
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-white to-transparent" aria-hidden="true" />
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                      <span className="text-xs text-muted-foreground">
                        By {item.authorName} ·{" "}
                        {item.publishedAt
                          ? new Date(item.publishedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
                          : "Recently"}
                      </span>
                      <span className="text-xs text-brand font-medium flex items-center gap-1">
                        {minutes} min read
                      </span>
                    </div>

                    {/* "Read more" affordance — appears on hover */}
                    <div className="mt-3 flex items-center gap-1 text-sm font-semibold text-brand opacity-80 group-hover:opacity-100 transition-opacity">
                      Read full story
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Mobile "View All" link */}
          <div className="text-center mt-10 sm:hidden">
            <Button asChild variant="outline" className="border-brand text-brand hover:bg-brand hover:text-white rounded-full px-8">
              <Link to="/news">View All News <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Article Modal */}
      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-0">
          {selected && (
            <>
              {/* Header banner with real photo. */}
              <div className="relative h-44 overflow-hidden">
                <img
                  src={selected.thumbnailUrl || "https://sfile.chatglm.cn/images-ppt/25cff1a6682d.jpg"}
                  alt=""
                  aria-hidden="true"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 photo-overlay-bottom" />
                <span className="absolute bottom-3 left-6 inline-block px-3 py-1 text-[10px] font-bold tracking-wider rounded-full bg-white/90 text-brand uppercase">
                  {selected.category}
                </span>
                <button
                  onClick={() => setSelected(null)}
                  aria-label="Close article"
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <DialogHeader className="p-6 pb-2">
                <DialogTitle className="text-2xl font-bold text-foreground font-display leading-tight">
                  {selected.title}
                </DialogTitle>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-2">
                  <span>By <strong className="text-foreground">{selected.authorName}</strong></span>
                  <span>·</span>
                  <span>
                    {selected.publishedAt
                      ? new Date(selected.publishedAt).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })
                      : "Recently"}
                  </span>
                  <span>·</span>
                  <span>{readingTime(selected.content)} min read</span>
                  {selected.eventDate && (
                    <>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" aria-hidden="true" />
                        {new Date(selected.eventDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </span>
                    </>
                  )}
                  {selected.eventLocation && (
                    <>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" aria-hidden="true" />
                        {selected.eventLocation}
                      </span>
                    </>
                  )}
                </div>
              </DialogHeader>

              <div className="px-6 pb-8">
                {/* Pull-quote excerpt */}
                <blockquote className="border-l-4 border-brand pl-4 py-1 my-4 text-foreground italic font-medium">
                  {selected.excerpt}
                </blockquote>

                {/* Full article content — preserves paragraphs */}
                <div className="prose prose-sm max-w-none text-foreground leading-relaxed space-y-4">
                  {selected.content?.split(/\n\n+/).map((para: string, i: number) => (
                    <p key={i} className="whitespace-pre-line">{para}</p>
                  ))}
                </div>

                {/* Footer CTA */}
                <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-muted-foreground text-center sm:text-left">
                    Want to be part of the next story?
                  </p>
                  <div className="flex gap-3">
                    <Button asChild className="bg-brand text-white hover:bg-brand-dark rounded-full">
                      <Link to="/enroll">Enroll Now</Link>
                    </Button>
                    <Button asChild variant="outline" className="border-brand text-brand hover:bg-brand hover:text-white rounded-full">
                      <Link to="/news">More News</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
