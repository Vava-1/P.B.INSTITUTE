import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import {
  CheckCircle, ChevronRight, ChevronLeft, BookOpen,
  Phone, User, GraduationCap, Smartphone, CreditCard, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import { trpc } from "@/providers/trpc";

export default function Enroll() {
  const { data: courses } = trpc.public.courses.list.useQuery();
  const { data: settings } = trpc.public.settings.get.useQuery();
  const enrollMutation = trpc.public.enrollments.submit.useMutation();
  const payMutation = trpc.public.payments.initiate.useMutation();

  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [refNum, setRefNum] = useState("");
  const [paymentRef, setPaymentRef] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "failed">("idle");
  const [paymentMessage, setPaymentMessage] = useState("");
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({
    fullName: "", email: "", phone: "", whatsapp: "",
    dateOfBirth: "", gender: "", nationality: "", nationalId: "", district: "",
    courseId: "", languageOption: "", languageLevel: "", examOption: "",
    schedulePreference: "", referralSource: "", educationLevel: "", occupation: "",
    specialNeeds: "", emergencyName: "", emergencyPhone: "", emergencyRelation: "",
    paymentProvider: "", paymentPhone: "",
    confirmInfo: false, acceptTerms: false, consentContact: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (field: string, value: any) => {
    setFormData((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: "" }));
  };

  const selectedCourse = (courses || []).find((c) => c.id === parseInt(formData.courseId));
  const courseFee = selectedCourse?.feeRwf || 0;

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!formData.fullName) newErrors.fullName = "Full name is required";
      if (!formData.phone) newErrors.phone = "Phone number is required";
      if (!formData.gender) newErrors.gender = "Gender is required";
    }
    if (step === 2) {
      if (!formData.courseId) newErrors.courseId = "Please select a course";
      if (!formData.schedulePreference) newErrors.schedulePreference = "Please select a schedule";
    }
    if (step === 3) {
      if (!formData.courseId) newErrors.courseId = "Please select a course first";
      if (courseFee > 0) {
        if (!formData.paymentProvider) newErrors.paymentProvider = "Please select a payment method";
        if (!formData.paymentPhone) newErrors.paymentPhone = "Please enter your mobile money number";
        if (paymentStatus !== "success") newErrors.payment = "Please complete payment before proceeding";
      }
    }
    if (step === 4) {
      if (!formData.confirmInfo) newErrors.confirmInfo = "Please confirm";
      if (!formData.acceptTerms) newErrors.acceptTerms = "Please accept terms";
      if (!formData.consentContact) newErrors.consentContact = "Please consent";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => { if (validateStep()) setStep((p) => Math.min(p + 1, 5)); };
  const handlePrev = () => setStep((p) => Math.max(p - 1, 1));

  const handlePayNow = async () => {
    if (!formData.paymentProvider || !formData.paymentPhone) {
      setErrors((p) => ({ ...p, paymentProvider: !formData.paymentProvider ? "Select provider" : "", paymentPhone: !formData.paymentPhone ? "Enter phone number" : "" }));
      return;
    }
    setPaymentStatus("processing");
    setPaymentMessage("");
    try {
      const result = await payMutation.mutateAsync({
        provider: formData.paymentProvider as "MOMO" | "AIRTEL",
        amount: courseFee,
        phoneNumber: formData.paymentPhone,
        courseId: parseInt(formData.courseId),
      });
      setPaymentRef(result.referenceNumber);
      if (result.status === "pending") {
        setPaymentMessage(result.message || "Payment request sent to your phone.");
      } else if (result.status === "success") {
        setPaymentStatus("success");
      } else {
        setPaymentStatus("failed");
        setPaymentMessage(result.message || "Payment failed. Please try again.");
      }
    } catch {
      setPaymentStatus("failed");
    }
  };

  // Poll payment status while waiting for PIN confirmation
  useEffect(() => {
    if (paymentStatus === "processing" && paymentRef) {
      const interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/trpc/public.payments.status?input=${encodeURIComponent(JSON.stringify({ reference: paymentRef }))}`);
          const json = await res.json();
          const status = json?.result?.data?.status;
          if (status === "success") {
            setPaymentStatus("success");
            clearInterval(interval);
          } else if (status === "failed") {
            setPaymentStatus("failed");
            clearInterval(interval);
          }
        } catch {}
      }, 3000);
      pollingRef.current = interval;
      return () => clearInterval(interval);
    }
  }, [paymentStatus, paymentRef]);



  const handleSubmit = async () => {
    if (!validateStep()) return;
    try {
      const result = await enrollMutation.mutateAsync({
        fullName: formData.fullName,
        email: formData.email || undefined,
        phone: formData.phone,
        whatsapp: formData.whatsapp || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        gender: formData.gender || undefined,
        nationality: formData.nationality || undefined,
        nationalId: formData.nationalId || undefined,
        district: formData.district || undefined,
        courseId: parseInt(formData.courseId),
        languageOption: formData.languageOption || undefined,
        languageLevel: formData.languageLevel || undefined,
        examOption: formData.examOption || undefined,
        schedulePreference: formData.schedulePreference || undefined,
        referralSource: formData.referralSource || undefined,
        educationLevel: formData.educationLevel || undefined,
        occupation: formData.occupation || undefined,
        specialNeeds: formData.specialNeeds || undefined,
        emergencyName: formData.emergencyName || undefined,
        emergencyPhone: formData.emergencyPhone || undefined,
        emergencyRelation: formData.emergencyRelation || undefined,
        paymentRef: paymentRef || undefined,
      });
      if (result.success) {
        setRefNum(result.referenceNumber);
        setSubmitted(true);
      }
    } catch (e) {
      console.error("Enrollment failed:", e);
    }
  };

  const stepLabels = ["Personal Info", "Course Selection", "Payment", "Declaration", "Review"];

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-12 bg-gradient-to-br from-[#0D1B2A] via-[#1A3C6E] to-[#0D1B2A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white font-display">
            Enroll at <span className="text-gradient-gold">Pacemaker</span>
          </h1>
          <p className="mt-3 text-white/70">
            Fill out the form below to start your journey. Our admissions team will
            contact you within 2 business days.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {submitted ? (
            <Card className="border-0 shadow-xl">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 rounded-full bg-[#00B894]/10 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-[#00B894]" />
                </div>
                <h2 className="text-2xl font-bold text-[#0D1B2A] mb-3 font-display">
                  Enrollment Submitted!
                </h2>
                <p className="text-[#6B7280] mb-2">
                  Your reference number:
                </p>
                <p className="text-2xl font-bold text-[#1A3C6E] font-mono mb-6">{refNum}</p>
                <p className="text-sm text-[#6B7280] mb-8">
                  Our admissions team will contact you within 2 business days to confirm
                  your class schedule.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button asChild className="bg-gradient-to-r from-[#F4A400] to-[#FFD166] text-[#0D1B2A] font-semibold rounded-full px-8">
                    <Link to="/">Back to Home</Link>
                  </Button>
                  <a
                    href={`https://wa.me/${(settings?.whatsapp || "250786053720").replace(/\+/g, "")}?text=Hello%2C%20I%20just%20submitted%20my%20enrollment%20(Ref%3A%20${refNum})`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white rounded-full hover:bg-[#128C7E] transition-colors text-sm font-medium"
                  >
                    <Phone className="w-4 h-4" /> Follow Up on WhatsApp
                  </a>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-xl">
              <CardContent className="p-6 md:p-8">
                {/* Progress Bar */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-2">
                    {stepLabels.map((label, i) => (
                      <div
                        key={label}
                        className={`text-xs font-medium ${
                          i + 1 <= step ? "text-[#1A3C6E]" : "text-[#6B7280]"
                        }`}
                      >
                        <span className="hidden sm:inline">{label}</span>
                        <span className="sm:hidden">{i + 1}</span>
                      </div>
                    ))}
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#F4A400] to-[#FFD166] transition-all duration-500"
                      style={{ width: `${(step / 5) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Step 1: Personal Info */}
                {step === 1 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-[#0D1B2A] font-display flex items-center gap-2">
                      <User className="w-5 h-5 text-[#F4A400]" /> Personal Information
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label>Full Name *</Label>
                        <Input value={formData.fullName} onChange={(e) => update("fullName", e.target.value)} placeholder="Your full name" />
                        {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                      </div>
                      <div>
                        <Label>Date of Birth</Label>
                        <Input type="date" value={formData.dateOfBirth} onChange={(e) => update("dateOfBirth", e.target.value)} />
                      </div>
                      <div>
                        <Label>Gender *</Label>
                        <Select value={formData.gender} onValueChange={(v) => update("gender", v)}>
                          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
                      </div>
                      <div>
                        <Label>Nationality</Label>
                        <Input value={formData.nationality} onChange={(e) => update("nationality", e.target.value)} placeholder="e.g., Rwandan" />
                      </div>
                      <div>
                        <Label>Phone Number *</Label>
                        <Input value={formData.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+250..." />
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                      </div>
                      <div>
                        <Label>WhatsApp Number</Label>
                        <Input value={formData.whatsapp} onChange={(e) => update("whatsapp", e.target.value)} placeholder="+250..." />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input type="email" value={formData.email} onChange={(e) => update("email", e.target.value)} placeholder="your@email.com" />
                      </div>
                      <div>
                        <Label>District</Label>
                        <Input value={formData.district} onChange={(e) => update("district", e.target.value)} placeholder="e.g., Gasabo" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Course Selection */}
                {step === 2 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-[#0D1B2A] font-display flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-[#F4A400]" /> Course Selection
                    </h2>
                    <div>
                      <Label>Select Course *</Label>
                      <Select value={formData.courseId} onValueChange={(v) => update("courseId", v)}>
                        <SelectTrigger><SelectValue placeholder="Choose a course" /></SelectTrigger>
                        <SelectContent>
                          {!courses || courses.length === 0 ? (
                            <SelectItem value="" disabled>No courses available</SelectItem>
                          ) : (
                            (courses || []).map((c) => (
                              <SelectItem key={c.id} value={c.id.toString()}>{c.title}</SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      {errors.courseId && <p className="text-red-500 text-xs mt-1">{errors.courseId}</p>}
                    </div>

                    {selectedCourse?.category === "languages" && (
                      <>
                        <div>
                          <Label>Language Option</Label>
                          <Select value={formData.languageOption} onValueChange={(v) => update("languageOption", v)}>
                            <SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="French">French</SelectItem>
                              <SelectItem value="English">English</SelectItem>
                              <SelectItem value="Kiswahili">Kiswahili</SelectItem>
                              <SelectItem value="German">German</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Level</Label>
                          <Select value={formData.languageLevel} onValueChange={(v) => update("languageLevel", v)}>
                            <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Beginner">Beginner</SelectItem>
                              <SelectItem value="Intermediate">Intermediate</SelectItem>
                              <SelectItem value="Advanced">Advanced</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}

                    {selectedCourse?.category === "languages" && selectedCourse?.languageSubType === "test_prep" && (
                      <div>
                        <Label>Exam Preparation</Label>
                        <Select value={formData.examOption} onValueChange={(v) => update("examOption", v)}>
                          <SelectTrigger><SelectValue placeholder="Select exam" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="IELTS">IELTS</SelectItem>
                            <SelectItem value="TOEFL">TOEFL</SelectItem>
                            <SelectItem value="DELF">DELF</SelectItem>
                             <SelectItem value="Goethe">Goethe Zertifikat</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div>
                      <Label>Preferred Schedule *</Label>
                      <Select value={formData.schedulePreference} onValueChange={(v) => update("schedulePreference", v)}>
                        <SelectTrigger><SelectValue placeholder="Select schedule" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Morning">Morning (8 AM to 10 AM)</SelectItem>
                          <SelectItem value="Afternoon">Afternoon (1 PM to 3 PM)</SelectItem>
                          <SelectItem value="Evening">Evening (5 PM to 7 PM)</SelectItem>
                          <SelectItem value="Weekend">Weekend</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.schedulePreference && <p className="text-red-500 text-xs mt-1">{errors.schedulePreference}</p>}
                    </div>

                    <div>
                      <Label>How did you hear about us?</Label>
                      <Select value={formData.referralSource} onValueChange={(v) => update("referralSource", v)}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Social Media">Social Media</SelectItem>
                          <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                          <SelectItem value="Friend">Friend</SelectItem>
                          <SelectItem value="Walk-in">Walk In</SelectItem>
                          <SelectItem value="Google">Google Search</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Education Level</Label>
                      <Select value={formData.educationLevel} onValueChange={(v) => update("educationLevel", v)}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Primary">Primary</SelectItem>
                          <SelectItem value="O-Level">O Level</SelectItem>
                          <SelectItem value="A-Level">A Level</SelectItem>
                          <SelectItem value="Diploma">Diploma</SelectItem>
                          <SelectItem value="Bachelor">Bachelor's</SelectItem>
                          <SelectItem value="Master">Master's+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Step 3: Payment */}
                {step === 3 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-[#0D1B2A] font-display flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-[#F4A400]" /> Payment
                    </h2>
                    {selectedCourse && (
                      <div className="bg-[#F8F9FC] rounded-lg p-4">
                        <div className="text-sm text-[#6B7280]">Course Fee</div>
                        <div className="text-2xl font-bold text-[#0D1B2A]">
                          {courseFee > 0 ? `${courseFee.toLocaleString()} RWF` : "Contact us for fee"}
                        </div>
                        <div className="text-xs text-[#6B7280] mt-1">{selectedCourse.title}</div>
                      </div>
                    )}
                    {courseFee === 0 && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                        Course fee not set. Please contact us for pricing.
                      </div>
                    )}
                    <div>
                      <Label>Payment Method *</Label>
                      <div className="grid grid-cols-2 gap-3 mt-1">
                        <button
                          type="button"
                          onClick={() => update("paymentProvider", "MOMO")}
                          className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                            formData.paymentProvider === "MOMO"
                              ? "border-[#F4A400] bg-[#F4A400]/5"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <Smartphone className="w-6 h-6 text-[#1A3C6E]" />
                          <span className="text-sm font-medium">MTN MoMo</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => update("paymentProvider", "AIRTEL")}
                          className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                            formData.paymentProvider === "AIRTEL"
                              ? "border-[#F4A400] bg-[#F4A400]/5"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <Smartphone className="w-6 h-6 text-[#E53935]" />
                          <span className="text-sm font-medium">Airtel Money</span>
                        </button>
                      </div>
                      {errors.paymentProvider && <p className="text-red-500 text-xs mt-1">{errors.paymentProvider}</p>}
                    </div>
                    <div>
                      <Label>Mobile Money Number *</Label>
                      <Input
                        value={formData.paymentPhone}
                        onChange={(e) => update("paymentPhone", e.target.value)}
                        placeholder="e.g., 0788123456"
                      />
                      {errors.paymentPhone && <p className="text-red-500 text-xs mt-1">{errors.paymentPhone}</p>}
                    </div>

                    {paymentStatus === "idle" && courseFee > 0 && (
                      <Button
                        onClick={handlePayNow}
                        disabled={payMutation.isPending}
                        className="w-full bg-gradient-to-r from-[#00B894] to-[#00C9A7] text-white font-semibold py-6 text-lg"
                      >
                        <CreditCard className="w-5 h-5 mr-2" />
                        {payMutation.isPending ? "Processing..." : `Pay ${courseFee.toLocaleString()} RWF`}
                      </Button>
                    )}

                    {paymentStatus === "processing" && (
                      <div className="text-center py-8">
                        <Loader2 className="w-10 h-10 animate-spin text-[#1A3C6E] mx-auto mb-3" />
                        <p className="text-[#0D1B2A] font-semibold">Payment request sent to your phone</p>
                        {paymentMessage && <p className="text-sm text-[#6B7280] mt-1">{paymentMessage}</p>}
                        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                          <p className="font-medium">Check your phone and enter your PIN to confirm</p>
                          <p className="text-xs mt-1">Waiting for confirmation... This page will update automatically.</p>
                        </div>
                        <p className="text-xs text-[#6B7280] mt-3">
                          {formData.paymentProvider === "MOMO" ? "MTN MoMo" : "Airtel Money"} • {courseFee.toLocaleString()} RWF
                        </p>
                      </div>
                    )}

                    {paymentStatus === "success" && (
                      <div className="text-center py-6 bg-[#00B894]/5 rounded-lg border border-[#00B894]/20">
                        <CheckCircle className="w-10 h-10 text-[#00B894] mx-auto mb-2" />
                        <p className="font-semibold text-[#00B894]">Payment Successful!</p>
                        <p className="text-xs text-[#6B7280] mt-1">Ref: {paymentRef}</p>
                      </div>
                    )}

                    {paymentStatus === "failed" && (
                      <div className="text-center py-6 bg-red-50 rounded-lg border border-red-200">
                        <p className="font-semibold text-red-600 mb-2">Payment Failed</p>
                        <p className="text-xs text-red-500 mb-3">The transaction could not be completed. Please try again.</p>
                        <Button onClick={() => { setPaymentStatus("idle"); setPaymentRef(""); }} variant="outline" size="sm">
                          Try Again
                        </Button>
                      </div>
                    )}

                    {courseFee === 0 && paymentStatus === "idle" && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                        You can proceed without payment. Our team will contact you with fee details.
                      </div>
                    )}
                  </div>
                )}

                {/* Step 4: Declaration */}
                {step === 4 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-[#0D1B2A] font-display flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-[#F4A400]" /> Background & Declaration
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label>Current Occupation</Label>
                        <Input value={formData.occupation} onChange={(e) => update("occupation", e.target.value)} placeholder="e.g., Student, Business Owner" />
                      </div>
                      <div>
                        <Label>Emergency Contact Name</Label>
                        <Input value={formData.emergencyName} onChange={(e) => update("emergencyName", e.target.value)} />
                      </div>
                      <div>
                        <Label>Emergency Contact Phone</Label>
                        <Input value={formData.emergencyPhone} onChange={(e) => update("emergencyPhone", e.target.value)} />
                      </div>
                      <div>
                        <Label>Relationship</Label>
                        <Input value={formData.emergencyRelation} onChange={(e) => update("emergencyRelation", e.target.value)} placeholder="e.g., Parent, Spouse" />
                      </div>
                    </div>
                    <div>
                      <Label>Special Needs or Accommodations</Label>
                      <textarea
                        className="w-full min-h-[80px] p-3 border rounded-md text-sm"
                        value={formData.specialNeeds}
                        onChange={(e) => update("specialNeeds", e.target.value)}
                        placeholder="Let us know if you have any special requirements..."
                      />
                    </div>
                    <div className="space-y-3 pt-4 border-t">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={formData.confirmInfo}
                          onCheckedChange={(v) => update("confirmInfo", v)}
                          id="confirmInfo"
                        />
                        <Label htmlFor="confirmInfo" className="text-sm leading-relaxed cursor-pointer">
                          I confirm all information provided is accurate *
                        </Label>
                      </div>
                      {errors.confirmInfo && <p className="text-red-500 text-xs">{errors.confirmInfo}</p>}
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={formData.acceptTerms}
                          onCheckedChange={(v) => update("acceptTerms", v)}
                          id="acceptTerms"
                        />
                        <Label htmlFor="acceptTerms" className="text-sm leading-relaxed cursor-pointer">
                          I have read and accept the Terms & Conditions *
                        </Label>
                      </div>
                      {errors.acceptTerms && <p className="text-red-500 text-xs">{errors.acceptTerms}</p>}
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={formData.consentContact}
                          onCheckedChange={(v) => update("consentContact", v)}
                          id="consentContact"
                        />
                        <Label htmlFor="consentContact" className="text-sm leading-relaxed cursor-pointer">
                          I consent to being contacted by Pacemaker Institute via phone/WhatsApp/email *
                        </Label>
                      </div>
                      {errors.consentContact && <p className="text-red-500 text-xs">{errors.consentContact}</p>}
                    </div>
                  </div>
                )}

                {/* Step 5: Review */}
                {step === 5 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-[#0D1B2A] font-display">Review Your Application</h2>
                    <div className="bg-[#F8F9FC] rounded-lg p-6 space-y-4">
                      <div>
                        <div className="text-xs text-[#6B7280] uppercase tracking-wider mb-1">Name</div>
                        <div className="font-medium">{formData.fullName}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-[#6B7280] uppercase tracking-wider mb-1">Phone</div>
                          <div className="font-medium">{formData.phone}</div>
                        </div>
                        <div>
                          <div className="text-xs text-[#6B7280] uppercase tracking-wider mb-1">Email</div>
                          <div className="font-medium">{formData.email || "—"}</div>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-[#6B7280] uppercase tracking-wider mb-1">Course</div>
                        <div className="font-medium">{selectedCourse?.title}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-[#6B7280] uppercase tracking-wider mb-1">Schedule</div>
                          <div className="font-medium">{formData.schedulePreference}</div>
                        </div>
                        {formData.languageOption && (
                          <div>
                            <div className="text-xs text-[#6B7280] uppercase tracking-wider mb-1">Language</div>
                            <div className="font-medium">{formData.languageOption} - {formData.languageLevel}</div>
                          </div>
                        )}
                      </div>
                      {paymentStatus === "success" && (
                        <div>
                          <div className="text-xs text-[#6B7280] uppercase tracking-wider mb-1">Payment</div>
                          <div className="font-medium text-[#00B894]">
                            {courseFee.toLocaleString()} RWF via {formData.paymentProvider}
                          </div>
                          <div className="text-xs text-[#6B7280]">Ref: {paymentRef}</div>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-[#6B7280] text-center">
                      By submitting, you agree to our terms and conditions.
                    </p>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t">
                  {step > 1 ? (
                    <Button variant="outline" onClick={handlePrev} className="flex items-center gap-1">
                      <ChevronLeft className="w-4 h-4" /> Previous
                    </Button>
                  ) : (
                    <div />
                  )}
                  {step < 5 ? (
                    <Button onClick={handleNext} className="bg-[#1A3C6E] hover:bg-[#0D1B2A] flex items-center gap-1">
                      Next <ChevronRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={enrollMutation.isPending}
                      className="bg-gradient-to-r from-[#F4A400] to-[#FFD166] text-[#0D1B2A] hover:from-[#FFD166] hover:to-[#F4A400] font-semibold px-8"
                    >
                      {enrollMutation.isPending ? "Submitting..." : "Submit Enrollment"}
                    </Button>
                  )}
                </div>
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
