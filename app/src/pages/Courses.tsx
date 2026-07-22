import { useState } from "react";
import { Link } from "react-router";
import {
  BookOpen, Clock, ArrowRight, Filter, Languages,
  ChefHat, Scissors, Wrench, Cpu, FileText, Search,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import { trpc } from "@/providers/trpc";

const categoryIcons: Record<string, any> = {
  languages: Languages,
  bakery: ChefHat,
  salon: Scissors,
  mechanics: Wrench,
  ai_skills: Cpu,
  private_candidate: FileText,
};

const categoryLabels: Record<string, string> = {
  languages: "Languages",
  bakery: "Vocational",
  salon: "Vocational",
  mechanics: "Vocational",
  ai_skills: "Technology",
  private_candidate: "Academic",
};

export default function Courses() {
  const { data: courses } = trpc.public.courses.list.useQuery();
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = (courses || []).filter((c) => {
    const matchCategory = activeCategory === "all" || c.category === activeCategory;
    const matchSearch =
      !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.shortDesc.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-16 bg-gradient-to-br from-brand-dark via-brand to-brand-dark">
        <div className="absolute inset-0 diagonal-stripe opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="text-brand font-semibold text-sm uppercase tracking-wider">
              Course Catalog
            </span>
            <h1 className="mt-4 text-4xl md:text-5xl font-bold text-white font-display">
              Our <span className="text-gradient-gold">Courses</span>
            </h1>
            <p className="mt-4 text-lg text-white/70 max-w-2xl mx-auto">
              Professional training that builds real skills. Choose your path and
              start building a better future today.
            </p>
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="sticky top-20 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
              <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
              {[
                { key: "all", label: "All Courses" },
                { key: "languages", label: "Languages" },
                { key: "bakery", label: "Bakery" },
                { key: "salon", label: "Salon" },
                { key: "mechanics", label: "Mechanics" },
                { key: "ai_skills", label: "AI Skills" },
                { key: "private_candidate", label: "Private Candidate" },
              ].map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
                    activeCategory === cat.key
                      ? "bg-brand text-white"
                      : "bg-brand-light text-muted-foreground hover:bg-brand/10 hover:text-brand"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <div className="relative sm:w-64 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 rounded-full border-gray-200"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Course Grid */}
      <section className="py-16 bg-brand-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 text-sm text-muted-foreground">
            Showing {filtered.length} of {courses?.length || 0} courses
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((course) => {
              const Icon = categoryIcons[course.category] || BookOpen;
              return (
                <Card
                  key={course.id}
                  className="group overflow-hidden bg-white border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="h-2 bg-brand" />
                  <div className="h-40 bg-gradient-to-br from-brand-dark to-brand flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-4 left-4 w-20 h-20 rounded-full bg-white/20" />
                      <div className="absolute bottom-4 right-4 w-32 h-32 rounded-full bg-white/10" />
                    </div>
                    <Icon className="w-16 h-16 text-white/80" />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className="px-3 py-1 text-xs font-medium rounded-full text-white bg-brand"
                      >
                        {categoryLabels[course.category] || course.category}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2 font-display group-hover:text-brand transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {course.shortDesc}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {course.duration}
                      </span>
                      <Link
                        to={`/courses/${course.slug}`}
                        className="flex items-center gap-1 text-sm font-medium text-brand hover:text-brand transition-colors"
                      >
                        Details <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-20">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">No courses found matching your criteria.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => { setActiveCategory("all"); setSearch(""); }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
