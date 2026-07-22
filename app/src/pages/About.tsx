import { Link } from "react-router";
import { Target, Eye, Heart, Award, Users, BookOpen, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import { trpc } from "@/providers/trpc";

const values = [
  { icon: Award, title: "Excellence", desc: "High standards in instruction and student outcomes." },
  { icon: Users, title: "Practicality", desc: "Skills immediately applicable in the real world." },
  { icon: Heart, title: "Inclusivity", desc: "Accessible to all Rwandans and beyond." },
  { icon: BookOpen, title: "Innovation", desc: "Modern curriculum with technology forward learning." },
  { icon: Target, title: "Integrity", desc: "Transparent, honest, ethical institution." },
];

const timeline = [
  { year: "2014", event: "Founded in Kigali with a single language classroom and a vision." },
  { year: "2017", event: "Launched vocational training division with Bakery and Salon courses." },
  { year: "2020", event: "Added Mechanics program and expanded to current campus facilities." },
  { year: "2023", event: "Introduced AI Skills course, first in Kigali. 500+ graduates milestone." },
  { year: "2025", event: "1,000+ graduates across all programs. Recognized as premier training institute." },
];

export default function About() {
  const { data: instructors } = trpc.public.instructors.list.useQuery();
  const { data: settings } = trpc.public.settings.get.useQuery();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero with real campus photo */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://sfile.chatglm.cn/images-ppt/25cff1a6682d.jpg"
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 photo-overlay" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="font-hand text-2xl text-gold block mb-2">
              About Us
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-white font-display">
              About Pacemaker Institute
            </h1>
            <p className="mt-6 text-lg text-white/85 max-w-2xl mx-auto">
              Empowering individuals with practical skills, language mastery,
              and professional knowledge to excel in today's competitive world.
            </p>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-brand to-brand-dark text-white">
              <CardContent className="p-8 text-center">
                <Target className="w-12 h-12 text-brand mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-3 font-display">Our Mission</h3>
                <p className="text-white/80 leading-relaxed">
                  Empowering individuals with practical skills, language mastery, and
                  professional knowledge to excel in today's competitive world.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-brand">
              <CardContent className="p-8 text-center">
                <Eye className="w-12 h-12 text-primary-foreground mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-3 font-display text-primary-foreground">Our Vision</h3>
                <p className="text-primary-foreground/80 leading-relaxed">
                  To be Rwanda's leading center for professional training and skills
                  development, producing world-class graduates who drive national progress.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-brand-light">
              <CardContent className="p-8 text-center">
                <Heart className="w-12 h-12 text-brand mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-3 font-display text-foreground">Our Values</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Excellence, Practicality, Inclusivity, Innovation, and Integrity guide
                  everything we do at Pacemaker Institute.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Core Values Grid */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground font-display">
              Our Core Values
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {values.map((v) => (
              <Card
                key={v.title}
                className="border-0 shadow-md hover:shadow-lg transition-shadow text-center"
              >
                <CardContent className="p-6">
                  <div className="w-14 h-14 rounded-full bg-brand/10 flex items-center justify-center mx-auto mb-4">
                    <v.icon className="w-7 h-7 text-brand" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{v.title}</h3>
                  <p className="text-sm text-muted-foreground">{v.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 bg-brand-light">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-brand font-semibold text-sm uppercase tracking-wider">
              Our Journey
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold text-foreground font-display">
              Our Story
            </h2>
          </div>
          <div className="relative">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-brand/30 md:-translate-x-px" />
            {timeline.map((item, i) => (
              <div
                key={item.year}
                className={`relative flex items-start gap-6 mb-12 last:mb-0 ${
                  i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                <div className={`flex-1 ${i % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                  <div className="bg-white rounded-xl shadow-md p-6 ml-10 md:ml-0">
                    <span className="text-brand font-bold text-lg">{item.year}</span>
                    <p className="text-muted-foreground mt-2">{item.event}</p>
                  </div>
                </div>
                <div className="absolute left-4 md:left-1/2 w-4 h-4 rounded-full bg-brand border-4 border-white shadow md:-translate-x-2 mt-6" />
                <div className="hidden md:block flex-1" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instructors */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-brand font-semibold text-sm uppercase tracking-wider">
              Our Team
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold text-foreground font-display">
              Meet Our Instructors
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {instructors?.map((instructor) => (
              <Card
                key={instructor.id}
                className="border-0 shadow-lg overflow-hidden group"
              >
                <div className="h-32 bg-gradient-to-br from-brand to-brand-dark" />
                <CardContent className="p-6 -mt-12 relative">
                  <div className="w-24 h-24 rounded-full bg-brand flex items-center justify-center text-2xl font-bold text-primary-foreground mx-auto mb-4 border-4 border-white shadow-lg">
                    {instructor.fullName.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <h3 className="text-lg font-bold text-center text-foreground font-display">
                    {instructor.fullName}
                  </h3>
                  <p className="text-brand text-sm text-center font-medium mb-3">
                    {instructor.title}
                  </p>
                  <p className="text-sm text-muted-foreground text-center line-clamp-3">
                    {instructor.bio}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-brand to-brand-dark">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 font-display">
            Come Visit Our Campus
          </h2>
          <p className="text-white/70 mb-8">
            {settings?.address || "Centenary House, 8 KN 4 Ave, Kigali, Rwanda"}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              asChild
              className="bg-brand text-primary-foreground hover:bg-brand-dark font-semibold rounded-full px-8 transition-colors"
            >
              <Link to="/enroll">Apply Now</Link>
            </Button>
            <a
              href={`https://wa.me/${(settings?.whatsapp || "250786053720").replace(/\+/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 border border-white/30 text-white rounded-full hover:bg-white/10 transition-colors"
            >
              <Phone className="w-4 h-4" />
              Get Directions
            </a>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
