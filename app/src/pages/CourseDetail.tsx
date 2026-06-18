import { useParams, Link, useNavigate } from "react-router";
import {
  Clock, BookOpen, CheckCircle, Briefcase, ArrowLeft,
  GraduationCap, Calendar, Phone, MessageCircle,
  ChevronDown, ChevronUp,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import { trpc } from "@/providers/trpc";

const categoryColors: Record<string, string> = {
  languages: "#3B82F6",
  bakery: "#F59E0B",
  salon: "#EC4899",
  mechanics: "#6B7280",
  ai_skills: "#8B5CF6",
  private_candidate: "#10B981",
};

export default function CourseDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: course, isLoading } = trpc.public.courses.getBySlug.useQuery(
    { slug: slug || "" },
    { enabled: !!slug }
  );
  const { data: testimonials } = trpc.public.testimonials.list.useQuery();
  const { data: settings } = trpc.public.settings.get.useQuery();
  const [openModule, setOpenModule] = useState<number | null>(0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-32 pb-20 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-[#1A3C6E] border-t-transparent rounded-full" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-32 pb-20 text-center">
          <h1 className="text-2xl font-bold text-[#0D1B2A] mb-4">Course Not Found</h1>
          <Button asChild>
            <Link to="/courses">Browse All Courses</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const color = categoryColors[course.category] || "#1A3C6E";
  const whatYoullLearn = course.whatYoullLearn
    ? JSON.parse(course.whatYoullLearn as string)
    : [];
  const modules = course.modules ? JSON.parse(course.modules as string) : [];
  const requirements = course.requirements
    ? JSON.parse(course.requirements as string)
    : [];
  const careerOutcomes = course.careerOutcomes
    ? JSON.parse(course.careerOutcomes as string)
    : [];
  const scheduleOptions = course.scheduleOptions
    ? JSON.parse(course.scheduleOptions as string)
    : [];

  const courseTestimonials = (testimonials || []).filter(
    (t) => t.courseName?.toLowerCase().includes(course.title.toLowerCase()) ||
           (course.category === "languages" && t.courseName?.toLowerCase().includes("language"))
  );

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-28 pb-16" style={{ backgroundColor: color }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-white/20" />
          <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-white/10" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate("/courses")}
            className="flex items-center gap-1 text-white/80 hover:text-white text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Courses
          </button>
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-white/20 text-white hover:bg-white/30">
              {course.category.replace("_", " ").toUpperCase()}
            </Badge>
            {course.isFeatured && (
              <Badge className="bg-[#F4A400] text-[#0D1B2A]">Featured</Badge>
            )}
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white font-display mb-4">
            {course.title}
          </h1>
          <p className="text-lg text-white/80 max-w-2xl">{course.shortDesc}</p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-[#F8F9FC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Course Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Overview */}
              <Card className="border-0 shadow-md">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-[#0D1B2A] mb-4 font-display flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-[#F4A400]" /> Overview
                  </h2>
                  <p className="text-[#1E1E2E] leading-relaxed whitespace-pre-line">
                    {course.description}
                  </p>
                </CardContent>
              </Card>

              {/* What You'll Learn */}
              {whatYoullLearn.length > 0 && (
                <Card className="border-0 shadow-md">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold text-[#0D1B2A] mb-4 font-display flex items-center gap-2">
                      <GraduationCap className="w-6 h-6 text-[#F4A400]" /> What You'll Learn
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {whatYoullLearn.map((item: string, i: number) => (
                        <div key={i} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-[#00B894] shrink-0 mt-0.5" />
                          <span className="text-[#1E1E2E] text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Course Modules */}
              {modules.length > 0 && (
                <Card className="border-0 shadow-md">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold text-[#0D1B2A] mb-4 font-display flex items-center gap-2">
                      <BookOpen className="w-6 h-6 text-[#F4A400]" /> Course Modules
                    </h2>
                    <div className="space-y-3">
                      {modules.map((mod: any, i: number) => (
                        <div key={i} className="border border-gray-100 rounded-lg overflow-hidden">
                          <button
                            onClick={() => setOpenModule(openModule === i ? null : i)}
                            className="w-full flex items-center justify-between p-4 text-left hover:bg-[#F8F9FC] transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                                style={{ backgroundColor: color }}
                              >
                                {i + 1}
                              </span>
                              <span className="font-semibold text-[#0D1B2A]">{mod.title}</span>
                            </div>
                            {openModule === i ? (
                              <ChevronUp className="w-5 h-5 text-[#6B7280]" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-[#6B7280]" />
                            )}
                          </button>
                          {openModule === i && (
                            <div className="px-4 pb-4 pl-16">
                              <p className="text-sm text-[#6B7280] mb-2">{mod.description}</p>
                              <div className="flex flex-wrap gap-2">
                                {mod.topics?.map((topic: string, j: number) => (
                                  <Badge key={j} variant="secondary" className="text-xs">
                                    {topic}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Requirements */}
              {requirements.length > 0 && (
                <Card className="border-0 shadow-md">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold text-[#0D1B2A] mb-4 font-display flex items-center gap-2">
                      <CheckCircle className="w-6 h-6 text-[#F4A400]" /> Requirements
                    </h2>
                    <ul className="space-y-2">
                      {requirements.map((req: string, i: number) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-[#00B894] shrink-0 mt-0.5" />
                          <span className="text-[#1E1E2E]">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Career Outcomes */}
              {careerOutcomes.length > 0 && (
                <Card className="border-0 shadow-md">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold text-[#0D1B2A] mb-4 font-display flex items-center gap-2">
                      <Briefcase className="w-6 h-6 text-[#F4A400]" /> Career Outcomes
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {careerOutcomes.map((career: string, i: number) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 p-4 bg-[#F8F9FC] rounded-lg"
                        >
                          <Briefcase className="w-5 h-5 text-[#1A3C6E]" />
                          <span className="text-sm font-medium text-[#0D1B2A]">{career}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Testimonials */}
              {courseTestimonials.length > 0 && (
                <Card className="border-0 shadow-md">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold text-[#0D1B2A] mb-6 font-display">
                      Student Reviews
                    </h2>
                    <div className="space-y-6">
                      {courseTestimonials.slice(0, 3).map((t) => (
                        <div key={t.id} className="flex items-start gap-4 p-4 bg-[#F8F9FC] rounded-lg">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1A3C6E] to-[#0D1B2A] flex items-center justify-center text-white font-bold shrink-0">
                            {t.studentName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-[#0D1B2A]">{t.studentName}</div>
                            <div className="flex items-center gap-1 mb-2">
                              {Array.from({ length: t.rating }).map((_, i) => (
                                <svg key={i} className="w-4 h-4 text-[#F4A400] fill-current" viewBox="0 0 20 20">
                                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                </svg>
                              ))}
                            </div>
                            <p className="text-sm text-[#6B7280] italic">"{t.quote}"</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right: Sticky Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <Card className="border-2 border-[#F4A400]/30 shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-[#0D1B2A] mb-4 font-display">
                      Course Details
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-[#F4A400]" />
                        <div>
                          <div className="text-xs text-[#6B7280]">Duration</div>
                          <div className="font-medium text-sm">{course.duration}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-[#F4A400]" />
                        <div>
                          <div className="text-xs text-[#6B7280]">Schedule</div>
                          <div className="font-medium text-sm">
                            {scheduleOptions.join(", ") || "Contact us"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <GraduationCap className="w-5 h-5 text-[#F4A400]" />
                        <div>
                          <div className="text-xs text-[#6B7280]">Certificate</div>
                          <div className="font-medium text-sm">Professional Certificate</div>
                        </div>
                      </div>
                      {course.feeRwf && (
                        <div className="flex items-center gap-3">
                          <MessageCircle className="w-5 h-5 text-[#F4A400]" />
                          <div>
                            <div className="text-xs text-[#6B7280]">Fee</div>
                            <div className="font-medium text-sm">
                              {course.feeRwf.toLocaleString()} RWF
                              {course.installmentAvailable && " (Installments available)"}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="mt-6 space-y-3">
                      <Button
                        asChild
                        className="w-full bg-gradient-to-r from-[#F4A400] to-[#FFD166] text-[#0D1B2A] hover:from-[#FFD166] hover:to-[#F4A400] font-semibold"
                      >
                        <Link to="/enroll">Enroll Now</Link>
                      </Button>
                      <a
                        href={`https://wa.me/${(settings?.whatsapp || "250786053720").replace(/\+/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#25D366] text-white rounded-md hover:bg-[#128C7E] transition-colors text-sm font-medium"
                      >
                        <Phone className="w-4 h-4" /> Chat on WhatsApp
                      </a>
                    </div>
                  </CardContent>
                </Card>

                {/* Who is this for */}
                {course.whoIsItFor && (
                  <Card className="border-0 shadow-md">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-bold text-[#0D1B2A] mb-3 font-display">
                        Who Is This For?
                      </h3>
                      <p className="text-sm text-[#6B7280]">{course.whoIsItFor}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
