import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router";
import {
  Search, CheckCircle, Clock, XCircle, AlertCircle,
  GraduationCap, Phone, Mail, BookOpen, Calendar, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import { trpc } from "@/providers/trpc";

export default function TrackEnrollment() {
  const [searchParams] = useSearchParams();
  const [reference, setReference] = useState(searchParams.get("ref") || "");
  const [searched, setSearched] = useState(false);

  // Auto-search if ref is in the URL (from the enrollment success page).
  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      setReference(ref);
      setSearched(true);
    }
  }, [searchParams]);

  const { data: enrollment, isLoading, error } = trpc.public.enrollments.checkStatus.useQuery(
    { reference },
    { enabled: searched && reference.length > 0, retry: false }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (reference.trim()) setSearched(true);
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "pending":
        return {
          icon: Clock,
          color: "hsl(var(--brand))",
          bg: "hsl(var(--brand-light))",
          title: "Application Received — Pending Review",
          desc: "Your enrollment application has been received and is waiting for review by our admissions team. We'll contact you within 2 business days.",
        };
      case "under_review":
        return {
          icon: AlertCircle,
          color: "hsl(var(--gold))",
          bg: "hsl(var(--gold) / 0.1)",
          title: "Under Review",
          desc: "Our admissions team is currently reviewing your application. You'll hear from us soon.",
        };
      case "enrolled":
        return {
          icon: CheckCircle,
          color: "hsl(var(--gold))",
          bg: "hsl(var(--gold) / 0.1)",
          title: "Admitted — You're In!",
          desc: "Congratulations! You've been admitted to Pacemaker Institute. Our team will contact you with your class schedule and next steps.",
        };
      case "rejected":
        return {
          icon: XCircle,
          color: "hsl(var(--destructive))",
          bg: "hsl(var(--destructive) / 0.1)",
          title: "Application Not Approved",
          desc: "Unfortunately, your application was not approved at this time. Please contact us for more information.",
        };
      case "waitlisted":
        return {
          icon: Clock,
          color: "hsl(var(--muted-foreground))",
          bg: "hsl(var(--muted))",
          title: "Waitlisted",
          desc: "You've been placed on our waitlist. We'll contact you if a spot opens up in your chosen course.",
        };
      case "completed":
        return {
          icon: GraduationCap,
          color: "hsl(var(--gold))",
          bg: "hsl(var(--gold) / 0.1)",
          title: "Course Completed",
          desc: "Congratulations on completing your course at Pacemaker Institute!",
        };
      default:
        return {
          icon: Clock,
          color: "hsl(var(--brand))",
          bg: "hsl(var(--brand-light))",
          title: status,
          desc: "",
        };
    }
  };

  return (
    <div className="min-h-screen bg-brand-light">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-12 bg-gradient-to-br from-brand-dark via-brand to-brand-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white font-display">
            Track Your <span className="text-gradient-gold">Enrollment</span>
          </h1>
          <p className="mt-3 text-white/70">
            Enter your reference number to check the status of your application.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search */}
          <Card className="border-0 shadow-xl mb-8">
            <CardContent className="p-6 md:p-8">
              <form onSubmit={handleSearch} className="space-y-4">
                <div>
                  <Label htmlFor="reference">Reference Number</Label>
                  <div className="relative mt-1">
                    <Input
                      id="reference"
                      value={reference}
                      onChange={(e) => { setReference(e.target.value); setSearched(false); }}
                      placeholder="e.g., PI-ENRL-2026-XXXXXX"
                      className="pr-10 font-mono"
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Your reference number was given to you when you submitted your enrollment.
                  </p>
                </div>
                <Button type="submit" className="w-full bg-brand hover:bg-brand-dark font-semibold">
                  <Search className="w-4 h-4 mr-2" /> Check Status
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Results */}
          {searched && isLoading && (
            <Card className="border-0 shadow-md">
              <CardContent className="p-12 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-brand border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-muted-foreground">Looking up your enrollment...</p>
              </CardContent>
            </Card>
          )}

          {searched && !isLoading && error && (
            <Card className="border-0 shadow-md">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Enrollment Not Found</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  We couldn't find an enrollment with that reference number. Please check the number and try again.
                </p>
                <Button asChild variant="outline" className="border-brand text-brand hover:bg-brand hover:text-white rounded-full">
                  <Link to="/enroll">Submit New Enrollment</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {searched && !isLoading && !error && enrollment && (
            <Card className="border-0 shadow-xl overflow-hidden">
              {/* Status banner */}
              {(() => {
                const info = getStatusInfo(enrollment.status);
                const StatusIcon = info.icon;
                return (
                  <div className="p-6 text-center" style={{ backgroundColor: info.bg }}>
                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto mb-3 shadow-sm">
                      <StatusIcon className="w-8 h-8" style={{ color: info.color }} />
                    </div>
                    <h3 className="text-xl font-bold mb-1 font-display" style={{ color: info.color }}>
                      {info.title}
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">{info.desc}</p>
                  </div>
                );
              })()}

              {/* Details */}
              <CardContent className="p-6 md:p-8 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-brand-light/50 rounded-xl">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Reference Number</div>
                    <div className="font-mono font-bold text-foreground">{enrollment.referenceNumber}</div>
                  </div>
                  <div className="p-4 bg-brand-light/50 rounded-xl">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Full Name</div>
                    <div className="font-bold text-foreground">{enrollment.fullName}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-100">
                    <Phone className="w-5 h-5 text-brand shrink-0" />
                    <div>
                      <div className="text-xs text-muted-foreground">Phone</div>
                      <div className="text-sm font-medium text-foreground">{enrollment.phone}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-100">
                    <Mail className="w-5 h-5 text-brand shrink-0" />
                    <div>
                      <div className="text-xs text-muted-foreground">Email</div>
                      <div className="text-sm font-medium text-foreground">{enrollment.email || "—"}</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-100">
                  <BookOpen className="w-5 h-5 text-brand shrink-0" />
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground">Course</div>
                    <div className="text-sm font-medium text-foreground">Course ID: {enrollment.courseId}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-100">
                    <Calendar className="w-5 h-5 text-brand shrink-0" />
                    <div>
                      <div className="text-xs text-muted-foreground">Submitted</div>
                      <div className="text-sm font-medium text-foreground">
                        {enrollment.submittedAt ? new Date(enrollment.submittedAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : "—"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-100">
                    <GraduationCap className="w-5 h-5 text-brand shrink-0" />
                    <div>
                      <div className="text-xs text-muted-foreground">Payment Status</div>
                      <div className="text-sm font-medium text-foreground capitalize">
                        {enrollment.paymentStatus?.replace(/_/g, " ") || "not paid"}
                      </div>
                    </div>
                  </div>
                </div>

                {enrollment.adminNotes && (
                  <div className="p-4 bg-gold rounded-xl border border-gold/20">
                    <div className="text-xs text-gold uppercase tracking-wider mb-1 font-semibold">Message from Admissions</div>
                    <p className="text-sm text-foreground">{enrollment.adminNotes}</p>
                  </div>
                )}

                {/* Timeline */}
                <div className="pt-4">
                  <h4 className="text-sm font-bold text-foreground mb-3">Application Timeline</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-gold" />
                      <span className="text-sm text-foreground">Application submitted</span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {enrollment.submittedAt ? new Date(enrollment.submittedAt).toLocaleDateString() : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${enrollment.status === "pending" ? "bg-brand animate-pulse" : "bg-gold"}`} />
                      <span className="text-sm text-foreground">
                        {enrollment.status === "pending" ? "Awaiting review" : "Reviewed by admissions team"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${["enrolled", "completed"].includes(enrollment.status) ? "bg-gold" : "bg-gray-200"}`} />
                      <span className={`text-sm ${["enrolled", "completed"].includes(enrollment.status) ? "text-foreground" : "text-muted-foreground"}`}>
                        Admitted to course
                      </span>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="pt-4 flex flex-col sm:flex-row gap-3">
                  <Button asChild className="bg-brand text-white hover:bg-brand-dark rounded-full flex-1">
                    <Link to="/">
                      Back to Home <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                  <a
                    href={`https://wa.me/250786053720?text=Hello%2C%20I%20have%20a%20question%20about%20my%20enrollment%20(Ref%3A%20${enrollment.referenceNumber})`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] text-white rounded-full hover:bg-[#128C7E] transition-colors text-sm font-medium flex-1"
                  >
                    <Phone className="w-4 h-4" /> Ask on WhatsApp
                  </a>
                </div>
              </CardContent>
            </Card>
          )}

          {!searched && (
            <Card className="border-0 shadow-md">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">
                  Enter your reference number above to check your enrollment status.
                  Don't have a reference number yet?{" "}
                  <Link to="/enroll" className="text-brand font-medium hover:underline">
                    Submit an enrollment →
                  </Link>
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
