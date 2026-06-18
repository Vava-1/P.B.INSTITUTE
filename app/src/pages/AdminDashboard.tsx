import { useState, useEffect } from "react";
import { useNavigate, Routes, Route, Link } from "react-router";
import {
  LayoutDashboard, Users, BookOpen, Newspaper,
  Settings, LogOut, Mail,
  TrendingUp, Clock, CheckCircle, AlertCircle, Eye, Menu, X,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/providers/trpc";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
  { icon: Users, label: "Enrollments", path: "/admin/enrollments" },
  { icon: BookOpen, label: "Courses", path: "/admin/courses" },
  { icon: Newspaper, label: "News", path: "/admin/news" },
  { icon: Star, label: "Testimonials", path: "/admin/testimonials" },
  { icon: Mail, label: "Messages", path: "/admin/messages" },
  { icon: Settings, label: "Settings", path: "/admin/settings" },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [admin, setAdmin] = useState<{ name: string; email: string; role: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      navigate("/admin");
      return;
    }
    try {
      const payload = JSON.parse(atob(token));
      if (payload.exp < Date.now()) {
        localStorage.removeItem("admin_token");
        navigate("/admin");
        return;
      }
      setAdmin(payload);
    } catch {
      localStorage.removeItem("admin_token");
      navigate("/admin");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    navigate("/admin");
  };

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      {/* Mobile Header */}
      <div className="lg:hidden bg-[#0D1B2A] text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/images/PBI_logo.jpg" alt="PBI" className="h-8 w-auto rounded" />
          <span className="font-bold font-display">Admin</span>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-[#0D1B2A] text-white flex flex-col transition-transform ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <img src="/images/PBI_logo.jpg" alt="PBI" className="h-10 w-auto rounded" />
              <div>
                <div className="font-bold font-display leading-tight">Pacemaker</div>
                <div className="text-xs text-white/50">Admin Panel</div>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                  location.pathname === item.path
                    ? "bg-[#F4A400] text-[#0D1B2A] font-semibold"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 px-4 py-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-[#F4A400] flex items-center justify-center text-[#0D1B2A] font-bold text-sm">
                {admin.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{admin.name}</div>
                <div className="text-xs text-white/50 capitalize">{admin.role}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" /> Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-30 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          <Routes>
            <Route path="dashboard" element={<DashboardOverview />} />
            <Route path="enrollments" element={<EnrollmentsPage />} />
            <Route path="courses" element={<CoursesAdminPage />} />
            <Route path="news" element={<NewsAdminPage />} />
            <Route path="testimonials" element={<TestimonialsAdminPage />} />
            <Route path="messages" element={<MessagesAdminPage />} />
            <Route path="settings" element={<SettingsAdminPage />} />
            <Route path="*" element={<DashboardOverview />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

// ─── DASHBOARD OVERVIEW ───
function DashboardOverview() {
  const { data: stats } = trpc.admin.stats.useQuery(undefined, { retry: false });
  const { data: recentEnrollments } = trpc.admin.enrollmentList.useQuery(
    { limit: 5, offset: 0 },
    { retry: false }
  );

  const statCards = [
    { label: "Total Enrollments", value: stats?.totalEnrollments ?? 0, icon: Users, color: "#1A3C6E" },
    { label: "Pending Review", value: stats?.pendingEnrollments ?? 0, icon: Clock, color: "#F4A400" },
    { label: "Confirmed", value: stats?.confirmedEnrollments ?? 0, icon: CheckCircle, color: "#00B894" },
    { label: "Unread Messages", value: stats?.unreadMessages ?? 0, icon: Mail, color: "#8B5CF6" },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0D1B2A] font-display">Dashboard</h1>
        <p className="text-[#6B7280]">Welcome back! Here's what's happening.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((s) => (
          <Card key={s.label} className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#6B7280]">{s.label}</p>
                  <p className="text-3xl font-bold text-[#0D1B2A] mt-1">{s.value}</p>
                </div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${s.color}15` }}>
                  <s.icon className="w-6 h-6" style={{ color: s.color }} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold text-[#0D1B2A] mb-4 font-display flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#F4A400]" /> Recent Enrollments
            </h2>
            <div className="space-y-3">
              {(recentEnrollments || []).length === 0 && (
                <p className="text-sm text-[#6B7280] py-4 text-center">No enrollments yet</p>
              )}
              {(recentEnrollments || []).map((e: any) => (
                <div key={e.id} className="flex items-center justify-between p-3 bg-[#F8F9FC] rounded-lg">
                  <div>
                    <div className="font-medium text-sm text-[#0D1B2A]">{e.fullName}</div>
                    <div className="text-xs text-[#6B7280]">{e.referenceNumber}</div>
                  </div>
                  <Badge
                    className={
                      e.status === "pending"
                        ? "bg-[#F4A400]/10 text-[#F4A400]"
                        : e.status === "enrolled"
                        ? "bg-[#00B894]/10 text-[#00B894]"
                        : "bg-gray-100 text-gray-600"
                    }
                  >
                    {e.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold text-[#0D1B2A] mb-4 font-display flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[#F4A400]" /> Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Add News", path: "/admin/news", icon: Newspaper },
                { label: "Manage Courses", path: "/admin/courses", icon: BookOpen },
                { label: "View Messages", path: "/admin/messages", icon: Mail },
                { label: "Site Settings", path: "/admin/settings", icon: Settings },
              ].map((action) => (
                <Link
                  key={action.path}
                  to={action.path}
                  className="flex flex-col items-center gap-2 p-4 bg-[#F8F9FC] rounded-lg hover:bg-[#1A3C6E]/5 transition-colors text-center"
                >
                  <action.icon className="w-6 h-6 text-[#1A3C6E]" />
                  <span className="text-sm font-medium text-[#0D1B2A]">{action.label}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── ENROLLMENTS PAGE ───
function EnrollmentsPage() {
  const { data: enrollments, refetch } = trpc.admin.enrollmentList.useQuery({ limit: 50, offset: 0 }, { retry: false });
  const updateMutation = trpc.admin.enrollmentUpdate.useMutation({ onSuccess: () => refetch() });

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0D1B2A] font-display">Enrollments</h1>
        <p className="text-[#6B7280]">Manage student enrollment applications</p>
      </div>
      <Card className="border-0 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F8F9FC]">
              <tr>
                <th className="text-left p-4 text-xs font-semibold text-[#6B7280] uppercase">Reference</th>
                <th className="text-left p-4 text-xs font-semibold text-[#6B7280] uppercase">Name</th>
                <th className="text-left p-4 text-xs font-semibold text-[#6B7280] uppercase">Phone</th>
                <th className="text-left p-4 text-xs font-semibold text-[#6B7280] uppercase">Status</th>
                <th className="text-left p-4 text-xs font-semibold text-[#6B7280] uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(enrollments || []).length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-[#6B7280]">No enrollments found</td></tr>
              )}
              {(enrollments || []).map((e: any) => (
                <tr key={e.id} className="border-t border-gray-50 hover:bg-[#F8F9FC]">
                  <td className="p-4 text-sm font-mono">{e.referenceNumber}</td>
                  <td className="p-4 text-sm font-medium">{e.fullName}</td>
                  <td className="p-4 text-sm">{e.phone}</td>
                  <td className="p-4">
                    <select
                      value={e.status}
                      onChange={(ev) =>
                        updateMutation.mutate({ id: e.id, status: ev.target.value as any })
                      }
                      className="text-xs px-2 py-1 rounded border border-gray-200 bg-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="under_review">Under Review</option>
                      <option value="enrolled">Enrolled</option>
                      <option value="rejected">Rejected</option>
                      <option value="waitlisted">Waitlisted</option>
                      <option value="completed">Completed</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <button className="text-[#1A3C6E] hover:text-[#F4A400]">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── COURSES ADMIN ───
function CoursesAdminPage() {
  const { data: courses } = trpc.admin.courseList.useQuery(undefined, { retry: false });

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0D1B2A] font-display">Courses</h1>
          <p className="text-[#6B7280]">Manage your course catalog</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(courses || []).map((course: any) => (
          <Card key={course.id} className="border-0 shadow-md">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-[#1A3C6E]/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-[#1A3C6E]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[#0D1B2A] text-sm truncate">{course.title}</h3>
                  <p className="text-xs text-[#6B7280]">{course.category}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Badge className={course.isPublished ? "bg-[#00B894]/10 text-[#00B894]" : "bg-gray-100 text-gray-600"}>
                  {course.isPublished ? "Published" : "Draft"}
                </Badge>
                <span className="text-xs text-[#6B7280]">{course.duration}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── NEWS ADMIN ───
function NewsAdminPage() {
  const { data: newsItems } = trpc.admin.newsList.useQuery(undefined, { retry: false });

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0D1B2A] font-display">News & Events</h1>
        <p className="text-[#6B7280]">Manage news articles and events</p>
      </div>
      <div className="space-y-4">
        {(newsItems || []).length === 0 && <p className="text-[#6B7280]">No articles yet</p>}
        {(newsItems || []).map((item: any) => (
          <Card key={item.id} className="border-0 shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-[#F4A400]/10 text-[#F4A400]">{item.category}</Badge>
                  <span className="text-xs text-[#6B7280]">
                    {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : "Draft"}
                  </span>
                </div>
                <h3 className="font-semibold text-[#0D1B2A] truncate">{item.title}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── TESTIMONIALS ADMIN ───
function TestimonialsAdminPage() {
  const { data: testimonials, refetch } = trpc.admin.testimonialList.useQuery(undefined, { retry: false });
  const updateMutation = trpc.admin.testimonialUpdate.useMutation({ onSuccess: () => refetch() });

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0D1B2A] font-display">Testimonials</h1>
        <p className="text-[#6B7280]">Manage student testimonials</p>
      </div>
      <div className="space-y-4">
        {(testimonials || []).length === 0 && <p className="text-[#6B7280]">No testimonials yet</p>}
        {(testimonials || []).map((t: any) => (
          <Card key={t.id} className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-[#1A3C6E]/10 flex items-center justify-center text-[#1A3C6E] font-bold text-sm">
                      {t.studentName.charAt(0)}
                    </div>
                    <span className="font-semibold text-sm">{t.studentName}</span>
                    <Badge className={t.isPublished ? "bg-[#00B894]/10 text-[#00B894]" : "bg-[#F4A400]/10 text-[#F4A400]"}>
                      {t.isPublished ? "Published" : "Pending"}
                    </Badge>
                  </div>
                  <p className="text-sm text-[#6B7280] italic line-clamp-2">"{t.quote}"</p>
                </div>
                <button
                  onClick={() =>
                    updateMutation.mutate({ id: t.id, data: { isPublished: !t.isPublished, isApproved: !t.isPublished } })
                  }
                  className="text-xs px-3 py-1.5 bg-[#1A3C6E] text-white rounded hover:bg-[#0D1B2A] transition-colors shrink-0"
                >
                  {t.isPublished ? "Unpublish" : "Publish"}
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── MESSAGES ADMIN ───
function MessagesAdminPage() {
  const { data: messages, refetch } = trpc.admin.messageList.useQuery(undefined, { retry: false });
  const updateMutation = trpc.admin.messageUpdate.useMutation({ onSuccess: () => refetch() });

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0D1B2A] font-display">Contact Messages</h1>
        <p className="text-[#6B7280]">Messages from the contact form</p>
      </div>
      <div className="space-y-4">
        {(messages || []).length === 0 && <p className="text-[#6B7280]">No messages yet</p>}
        {(messages || []).map((m: any) => (
          <Card key={m.id} className={`border-0 shadow-sm ${!m.isRead ? "border-l-4 border-l-[#F4A400]" : ""}`}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{m.fullName}</span>
                    {!m.isRead && <Badge className="bg-[#F4A400]/10 text-[#F4A400]">New</Badge>}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#6B7280] mb-2">
                    <span>{m.email}</span>
                    <span>{m.phone}</span>
                    <Badge variant="outline">{m.subject}</Badge>
                  </div>
                  <p className="text-sm text-[#1E1E2E]">{m.message}</p>
                  <div className="text-xs text-[#6B7280] mt-2">
                    {new Date(m.createdAt).toLocaleString()}
                  </div>
                </div>
                {!m.isRead && (
                  <button
                    onClick={() => updateMutation.mutate({ id: m.id, isRead: true })}
                    className="text-xs px-3 py-1.5 bg-[#F8F9FC] text-[#1A3C6E] rounded hover:bg-[#1A3C6E]/10 transition-colors shrink-0"
                  >
                    Mark Read
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── SETTINGS ADMIN ───
function SettingsAdminPage() {
  const { data: settings, refetch } = trpc.public.settings.get.useQuery();
  const updateMutation = trpc.admin.settingsUpdate.useMutation({ onSuccess: () => refetch() });
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    if (settings) {
      setForm({
        siteName: settings.siteName || "",
        tagline: settings.tagline || "",
        phone: settings.phone || "",
        email: settings.email || "",
        whatsapp: settings.whatsapp || "",
        address: settings.address || "",
        openingHours: settings.openingHours || "",
        facebookUrl: settings.facebookUrl || "",
        instagramUrl: settings.instagramUrl || "",
        twitterUrl: settings.twitterUrl || "",
        linkedinUrl: settings.linkedinUrl || "",
        youtubeUrl: settings.youtubeUrl || "",
        seoTitleSuffix: settings.seoTitleSuffix || "",
        seoDefaultDesc: settings.seoDefaultDesc || "",
      });
    }
  }, [settings]);

  const handleSave = () => {
    updateMutation.mutate(form);
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0D1B2A] font-display">Site Settings</h1>
        <p className="text-[#6B7280]">Configure your website settings</p>
      </div>

      <Card className="border-0 shadow-md">
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-[#0D1B2A] mb-1 block">Site Name</label>
              <input
                className="w-full px-3 py-2 border rounded-md text-sm"
                value={form.siteName || ""}
                onChange={(e) => setForm((p) => ({ ...p, siteName: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#0D1B2A] mb-1 block">Tagline</label>
              <input
                className="w-full px-3 py-2 border rounded-md text-sm"
                value={form.tagline || ""}
                onChange={(e) => setForm((p) => ({ ...p, tagline: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#0D1B2A] mb-1 block">Phone</label>
              <input
                className="w-full px-3 py-2 border rounded-md text-sm"
                value={form.phone || ""}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#0D1B2A] mb-1 block">Email</label>
              <input
                className="w-full px-3 py-2 border rounded-md text-sm"
                value={form.email || ""}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#0D1B2A] mb-1 block">WhatsApp</label>
              <input
                className="w-full px-3 py-2 border rounded-md text-sm"
                value={form.whatsapp || ""}
                onChange={(e) => setForm((p) => ({ ...p, whatsapp: e.target.value }))}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-[#0D1B2A] mb-1 block">Address</label>
              <input
                className="w-full px-3 py-2 border rounded-md text-sm"
                value={form.address || ""}
                onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-[#0D1B2A] mb-1 block">Opening Hours</label>
              <input
                className="w-full px-3 py-2 border rounded-md text-sm"
                value={form.openingHours || ""}
                onChange={(e) => setForm((p) => ({ ...p, openingHours: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#0D1B2A] mb-1 block">Facebook URL</label>
              <input
                className="w-full px-3 py-2 border rounded-md text-sm"
                value={form.facebookUrl || ""}
                onChange={(e) => setForm((p) => ({ ...p, facebookUrl: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#0D1B2A] mb-1 block">Instagram URL</label>
              <input
                className="w-full px-3 py-2 border rounded-md text-sm"
                value={form.instagramUrl || ""}
                onChange={(e) => setForm((p) => ({ ...p, instagramUrl: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#0D1B2A] mb-1 block">Twitter URL</label>
              <input
                className="w-full px-3 py-2 border rounded-md text-sm"
                value={form.twitterUrl || ""}
                onChange={(e) => setForm((p) => ({ ...p, twitterUrl: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#0D1B2A] mb-1 block">LinkedIn URL</label>
              <input
                className="w-full px-3 py-2 border rounded-md text-sm"
                value={form.linkedinUrl || ""}
                onChange={(e) => setForm((p) => ({ ...p, linkedinUrl: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#0D1B2A] mb-1 block">YouTube URL</label>
              <input
                className="w-full px-3 py-2 border rounded-md text-sm"
                value={form.youtubeUrl || ""}
                onChange={(e) => setForm((p) => ({ ...p, youtubeUrl: e.target.value }))}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-[#0D1B2A] mb-1 block">SEO Title Suffix</label>
              <input
                className="w-full px-3 py-2 border rounded-md text-sm"
                value={form.seoTitleSuffix || ""}
                onChange={(e) => setForm((p) => ({ ...p, seoTitleSuffix: e.target.value }))}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-[#0D1B2A] mb-1 block">SEO Default Description</label>
              <textarea
                className="w-full px-3 py-2 border rounded-md text-sm min-h-[80px]"
                value={form.seoDefaultDesc || ""}
                onChange={(e) => setForm((p) => ({ ...p, seoDefaultDesc: e.target.value }))}
              />
            </div>
          </div>

          <div className="mt-8 pt-6 border-t flex items-center justify-between">
            <Button
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="bg-gradient-to-r from-[#F4A400] to-[#FFD166] text-[#0D1B2A] hover:from-[#FFD166] hover:to-[#F4A400] font-semibold px-8"
            >
              {updateMutation.isPending ? "Saving..." : "Save Settings"}
            </Button>
            {updateMutation.isSuccess && (
              <span className="text-sm text-[#00B894]">Settings saved successfully!</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
