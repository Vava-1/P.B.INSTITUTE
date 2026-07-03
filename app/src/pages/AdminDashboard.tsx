import { useState, useEffect } from "react";
import { useNavigate, useLocation, Routes, Route, Link } from "react-router";
import {
  LayoutDashboard, Users, BookOpen, Newspaper,
  Settings, LogOut, Mail,
  TrendingUp, Clock, CheckCircle, AlertCircle, Eye, Menu, X,
  Star, Plus, Edit, Trash2, Linkedin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { trpc } from "@/providers/trpc";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";

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
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [admin, setAdmin] = useState<{ name: string; email: string; role: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      navigate("/admin");
      return;
    }
    // Decode the JWT to get the admin's name/email/role for the sidebar.
    try {
      const payload = JSON.parse(atob(token.split(".")[1] ?? ""));
      setAdmin({ name: payload.name ?? "Admin", email: payload.email ?? "", role: payload.role ?? "admin" });
    } catch {
      setAdmin({ name: "Admin", email: "", role: "admin" });
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    navigate("/admin");
  };

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-[#EDE7FF]">
      {/* Mobile Header */}
      <div className="lg:hidden bg-[#1A1A2E] text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/images/PBI_logo.jpg" alt="PBI" className="h-8 w-auto rounded" />
          <span className="font-bold font-display">Admin</span>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle navigation menu" aria-expanded={sidebarOpen}>
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-[#1A1A2E] text-white flex flex-col transition-transform ${
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
                  location.pathname.startsWith(item.path)
                    ? "bg-[#5E17EB] text-[#1A1A2E] font-semibold"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
                aria-current={location.pathname.startsWith(item.path) ? "page" : undefined}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 px-4 py-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-[#5E17EB] flex items-center justify-center text-[#1A1A2E] font-bold text-sm">
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
    { label: "Total Enrollments", value: stats?.totalEnrollments ?? 0, icon: Users, color: "#5E17EB" },
    { label: "Pending Review", value: stats?.pendingEnrollments ?? 0, icon: Clock, color: "#5E17EB" },
    { label: "Confirmed", value: stats?.confirmedEnrollments ?? 0, icon: CheckCircle, color: "#00B894" },
    { label: "Unread Messages", value: stats?.unreadMessages ?? 0, icon: Mail, color: "#8B5CF6" },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1A1A2E] font-display">Dashboard</h1>
        <p className="text-[#6B7280]">Welcome back! Here's what's happening.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((s) => (
          <Card key={s.label} className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#6B7280]">{s.label}</p>
                  <p className="text-3xl font-bold text-[#1A1A2E] mt-1">{s.value}</p>
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
            <h2 className="text-lg font-bold text-[#1A1A2E] mb-4 font-display flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#5E17EB]" /> Recent Enrollments
            </h2>
            <div className="space-y-3">
              {(recentEnrollments || []).length === 0 && (
                <p className="text-sm text-[#6B7280] py-4 text-center">No enrollments yet</p>
              )}
              {(recentEnrollments || []).map((e: any) => (
                <div key={e.id} className="flex items-center justify-between p-3 bg-[#EDE7FF] rounded-lg">
                  <div>
                    <div className="font-medium text-sm text-[#1A1A2E]">{e.fullName}</div>
                    <div className="text-xs text-[#6B7280]">{e.referenceNumber}</div>
                  </div>
                  <Badge
                    className={
                      e.status === "pending"
                        ? "bg-[#5E17EB]/10 text-[#5E17EB]"
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
            <h2 className="text-lg font-bold text-[#1A1A2E] mb-4 font-display flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[#5E17EB]" /> Quick Actions
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
                  className="flex flex-col items-center gap-2 p-4 bg-[#EDE7FF] rounded-lg hover:bg-[#5E17EB]/5 transition-colors text-center"
                >
                  <action.icon className="w-6 h-6 text-[#5E17EB]" />
                  <span className="text-sm font-medium text-[#1A1A2E]">{action.label}</span>
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
        <h1 className="text-2xl font-bold text-[#1A1A2E] font-display">Enrollments</h1>
        <p className="text-[#6B7280]">Manage student enrollment applications</p>
      </div>
      <Card className="border-0 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#EDE7FF]">
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
                <tr key={e.id} className="border-t border-gray-50 hover:bg-[#EDE7FF]">
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
                    <button
                      className="text-[#5E17EB] hover:text-[#5E17EB] transition-colors"
                      aria-label={`View details for ${e.fullName}`}
                      title="View details"
                      onClick={() => {
                        alert(
                          `Enrollment: ${e.fullName}\n` +
                          `Reference: ${e.referenceNumber}\n` +
                          `Phone: ${e.phone}\n` +
                          `Email: ${e.email ?? "—"}\n` +
                          `Status: ${e.status}\n` +
                          `Payment: ${e.paymentStatus ?? "—"}\n` +
                          `Submitted: ${e.submittedAt ? new Date(e.submittedAt).toLocaleString() : "—"}`
                        );
                      }}
                    >
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
  const { data: courses, refetch } = trpc.admin.courseList.useQuery(undefined, { retry: false });
  const createMutation = trpc.admin.courseCreate.useMutation({ onSuccess: () => refetch() });
  const updateMutation = trpc.admin.courseUpdate.useMutation({ onSuccess: () => refetch() });
  const deleteMutation = trpc.admin.courseDelete.useMutation({ onSuccess: () => refetch() });
  const [confirmNode, confirm] = useConfirmDialog();

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({
    slug: "", title: "", category: "languages", shortDesc: "", description: "",
    duration: "", isPublished: true, isFeatured: false, displayOrder: 0,
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ slug: "", title: "", category: "languages", shortDesc: "", description: "", duration: "", isPublished: true, isFeatured: false, displayOrder: 0 });
    setShowModal(true);
  };

  const openEdit = (course: any) => {
    setEditing(course);
    setForm({
      slug: course.slug || "",
      title: course.title || "",
      category: course.category || "languages",
      shortDesc: course.shortDesc || "",
      description: course.description || "",
      duration: course.duration || "",
      isPublished: course.isPublished ?? true,
      isFeatured: course.isFeatured ?? false,
      displayOrder: course.displayOrder ?? 0,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: form as any });
    } else {
      createMutation.mutate(form as any);
    }
    setShowModal(false);
    setEditing(null);
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E] font-display">Courses</h1>
          <p className="text-[#6B7280]">Manage your course catalog</p>
        </div>
        <Button onClick={openCreate} className="bg-[#5E17EB] text-white hover:bg-[#1A1A2E]">
          <Plus className="w-4 h-4 mr-2" /> Add Course
        </Button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto m-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold text-[#1A1A2E]">{editing ? "Edit Course" : "Add Course"}</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-[#6B7280]" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-sm font-medium text-[#1A1A2E] block mb-1">Title</label>
                  <input className="w-full px-3 py-2 border rounded-md text-sm" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#1A1A2E] block mb-1">Slug</label>
                  <input className="w-full px-3 py-2 border rounded-md text-sm" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#1A1A2E] block mb-1">Category</label>
                  <select className="w-full px-3 py-2 border rounded-md text-sm" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    <option value="languages">Languages</option>
                    <option value="bakery">Bakery & Pastry</option>
                    <option value="salon">Salon & Beauty</option>
                    <option value="mechanics">Mechanics</option>
                    <option value="ai_skills">AI Skills</option>
                    <option value="private_candidate">Private Candidate</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-[#1A1A2E] block mb-1">Short Description</label>
                  <input className="w-full px-3 py-2 border rounded-md text-sm" value={form.shortDesc} onChange={(e) => setForm({ ...form, shortDesc: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-[#1A1A2E] block mb-1">Description</label>
                  <textarea className="w-full px-3 py-2 border rounded-md text-sm min-h-[80px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#1A1A2E] block mb-1">Duration</label>
                  <input className="w-full px-3 py-2 border rounded-md text-sm" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#1A1A2E] block mb-1">Display Order</label>
                  <input type="number" className="w-full px-3 py-2 border rounded-md text-sm" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} />
                    Published
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
                    Featured
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending} className="bg-[#5E17EB] text-white hover:bg-[#1A1A2E]">
                {createMutation.isPending || updateMutation.isPending ? "Saving..." : editing ? "Update Course" : "Create Course"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(courses || []).length === 0 && (
          <div className="col-span-full text-center py-12 text-[#6B7280]">No courses yet. Click "Add Course" to create one.</div>
        )}
        {(courses || []).map((course: any) => (
          <Card key={course.id} className="border-0 shadow-md group">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-[#5E17EB]/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-[#5E17EB]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[#1A1A2E] text-sm truncate">{course.title}</h3>
                  <p className="text-xs text-[#6B7280]">{course.category.replace(/_/g, " ")}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Badge className={course.isPublished ? "bg-[#00B894]/10 text-[#00B894]" : "bg-gray-100 text-gray-600"}>
                  {course.isPublished ? "Published" : "Draft"}
                </Badge>
                <span className="text-xs text-[#6B7280]">{course.duration}</span>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(course)} className="text-xs flex items-center gap-1 text-[#5E17EB] hover:text-[#5E17EB] transition-colors">
                  <Edit className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={async () => { if (await confirm("Delete this course? This cannot be undone.", "Delete course")) deleteMutation.mutate({ id: course.id }); }}
                  className="text-xs flex items-center gap-1 text-red-500 hover:text-red-700 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {confirmNode}
    </div>
  );
}

// ─── NEWS ADMIN ───
function NewsAdminPage() {
  const { data: newsItems, refetch } = trpc.admin.newsList.useQuery(undefined, { retry: false });
  const createMutation = trpc.admin.newsCreate.useMutation({ onSuccess: () => refetch() });
  const updateMutation = trpc.admin.newsUpdate.useMutation({ onSuccess: () => refetch() });
  const deleteMutation = trpc.admin.newsDelete.useMutation({ onSuccess: () => refetch() });
  const [confirmNode, confirm] = useConfirmDialog();

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({
    slug: "", title: "", category: "news", excerpt: "", content: "",
    authorName: "", isPublished: false,
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ slug: "", title: "", category: "news", excerpt: "", content: "", authorName: "", isPublished: false });
    setShowModal(true);
  };

  const openEdit = (item: any) => {
    setEditing(item);
    setForm({
      slug: item.slug || "",
      title: item.title || "",
      category: item.category || "news",
      excerpt: item.excerpt || "",
      content: item.content || "",
      authorName: item.authorName || "",
      isPublished: item.isPublished ?? false,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: form as any });
    } else {
      createMutation.mutate(form as any);
    }
    setShowModal(false);
    setEditing(null);
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E] font-display">News & Events</h1>
          <p className="text-[#6B7280]">Manage news articles and events</p>
        </div>
        <Button onClick={openCreate} className="bg-[#5E17EB] text-white hover:bg-[#1A1A2E]">
          <Plus className="w-4 h-4 mr-2" /> Add Article
        </Button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto m-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold text-[#1A1A2E]">{editing ? "Edit Article" : "Add Article"}</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-[#6B7280]" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-sm font-medium text-[#1A1A2E] block mb-1">Title</label>
                  <input className="w-full px-3 py-2 border rounded-md text-sm" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#1A1A2E] block mb-1">Slug</label>
                  <input className="w-full px-3 py-2 border rounded-md text-sm" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#1A1A2E] block mb-1">Category</label>
                  <select className="w-full px-3 py-2 border rounded-md text-sm" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    <option value="news">News</option>
                    <option value="event">Event</option>
                    <option value="achievement">Achievement</option>
                    <option value="announcement">Announcement</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-[#1A1A2E] block mb-1">Excerpt</label>
                  <input className="w-full px-3 py-2 border rounded-md text-sm" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-[#1A1A2E] block mb-1">Content</label>
                  <textarea className="w-full px-3 py-2 border rounded-md text-sm min-h-[120px]" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#1A1A2E] block mb-1">Author Name</label>
                  <input className="w-full px-3 py-2 border rounded-md text-sm" value={form.authorName} onChange={(e) => setForm({ ...form, authorName: e.target.value })} />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} />
                    Published
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending} className="bg-[#5E17EB] text-white hover:bg-[#1A1A2E]">
                {createMutation.isPending || updateMutation.isPending ? "Saving..." : editing ? "Update Article" : "Create Article"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {(newsItems || []).length === 0 && <p className="text-[#6B7280]">No articles yet</p>}
        {(newsItems || []).map((item: any) => (
          <Card key={item.id} className="border-0 shadow-sm group">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="bg-[#5E17EB]/10 text-[#5E17EB]">{item.category}</Badge>
                    <span className="text-xs text-[#6B7280]">
                      {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : "Draft"}
                    </span>
                    {!item.isPublished && (
                      <Badge className="bg-gray-100 text-gray-600">Unpublished</Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-[#1A1A2E] truncate">{item.title}</h3>
                  <p className="text-xs text-[#6B7280] mt-1">{item.excerpt}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => updateMutation.mutate({ id: item.id, data: { isPublished: !item.isPublished } })}
                    className="text-xs px-2 py-1 bg-[#5E17EB] text-white rounded hover:bg-[#1A1A2E] transition-colors"
                  >
                    {item.isPublished ? "Unpublish" : "Publish"}
                  </button>
                  <button onClick={() => openEdit(item)} className="text-[#5E17EB] hover:text-[#5E17EB] transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={async () => { if (await confirm("Delete this article? This cannot be undone.", "Delete article")) deleteMutation.mutate({ id: item.id }); }}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {confirmNode}
    </div>
  );
}

// ─── TESTIMONIALS ADMIN ───
function TestimonialsAdminPage() {
  const { data: testimonials, refetch } = trpc.admin.testimonialList.useQuery(undefined, { retry: false });
  const [confirmNode, confirm] = useConfirmDialog();
  const updateMutation = trpc.admin.testimonialUpdate.useMutation({ onSuccess: () => refetch() });
  const deleteMutation = trpc.admin.testimonialDelete.useMutation({ onSuccess: () => refetch() });
  const createMutation = trpc.admin.testimonialCreate.useMutation({ onSuccess: () => refetch() });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({
    studentName: "", photoUrl: "", linkedinUrl: "", courseName: "",
    currentRole: "", employer: "", quote: "", rating: 5,
  });

  const openNew = () => {
    setEditId(null);
    setForm({ studentName: "", photoUrl: "", linkedinUrl: "", courseName: "", currentRole: "", employer: "", quote: "", rating: 5 });
    setDialogOpen(true);
  };

  const openEdit = (t: any) => {
    setEditId(t.id);
    setForm({
      studentName: t.studentName, photoUrl: t.photoUrl ?? "", linkedinUrl: t.linkedinUrl ?? "",
      courseName: t.courseName ?? "", currentRole: t.currentRole ?? "", employer: t.employer ?? "",
      quote: t.quote, rating: t.rating ?? 5,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (editId) {
      updateMutation.mutate({ id: editId, data: form });
    } else {
      createMutation.mutate(form);
    }
    setDialogOpen(false);
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E] font-display">Testimonials</h1>
          <p className="text-[#6B7280]">Manage student testimonials</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew} className="bg-[#5E17EB] text-white hover:bg-[#4a12c0] rounded-full">
              <Plus className="w-4 h-4 mr-2" /> Add Testimonial
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editId ? "Edit Testimonial" : "New Testimonial"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Student Name</Label>
                <Input value={form.studentName} onChange={(e) => setForm({ ...form, studentName: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Photo URL</Label>
                  <Input value={form.photoUrl} onChange={(e) => setForm({ ...form, photoUrl: e.target.value })} placeholder="https://..." />
                </div>
                <div>
                  <Label>LinkedIn URL</Label>
                  <Input value={form.linkedinUrl} onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })} placeholder="https://linkedin.com/in/..." />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Course Name</Label>
                  <Input value={form.courseName} onChange={(e) => setForm({ ...form, courseName: e.target.value })} />
                </div>
                <div>
                  <Label>Rating (1-5)</Label>
                  <Input type="number" min={1} max={5} value={form.rating} onChange={(e) => setForm({ ...form, rating: parseInt(e.target.value) || 5 })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Current Role</Label>
                  <Input value={form.currentRole} onChange={(e) => setForm({ ...form, currentRole: e.target.value })} />
                </div>
                <div>
                  <Label>Employer</Label>
                  <Input value={form.employer} onChange={(e) => setForm({ ...form, employer: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Testimony</Label>
                <Textarea rows={3} value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSave} className="bg-[#5E17EB] text-white hover:bg-[#4a12c0]">
                  {editId ? "Update" : "Create"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-4">
        {(testimonials || []).length === 0 && <p className="text-[#6B7280]">No testimonials yet</p>}
        {(testimonials || []).map((t: any) => (
          <Card key={t.id} className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {t.photoUrl ? (
                    <div className="relative w-12 h-12 shrink-0">
                      <img src={t.photoUrl} alt={t.studentName} className="w-12 h-12 rounded-full object-cover" />
                      {t.linkedinUrl && (
                        <a href={t.linkedinUrl} target="_blank" rel="noopener noreferrer"
                          className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#0A66C2] rounded-full flex items-center justify-center shadow">
                          <Linkedin className="w-3 h-3 text-white" />
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="relative w-12 h-12 shrink-0">
                      <div className="w-12 h-12 rounded-full bg-[#5E17EB]/10 flex items-center justify-center text-[#5E17EB] font-bold text-sm">
                        {t.studentName.charAt(0)}
                      </div>
                      {t.linkedinUrl && (
                        <a href={t.linkedinUrl} target="_blank" rel="noopener noreferrer"
                          className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#0A66C2] rounded-full flex items-center justify-center shadow">
                          <Linkedin className="w-3 h-3 text-white" />
                        </a>
                      )}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">{t.studentName}</span>
                      <Badge className={t.isPublished ? "bg-[#00B894]/10 text-[#00B894]" : "bg-[#5E17EB]/10 text-[#5E17EB]"}>
                        {t.isPublished ? "Published" : "Pending"}
                      </Badge>
                    </div>
                    {t.courseName && <div className="text-xs text-[#6B7280] mb-1">{t.courseName}</div>}
                    <p className="text-sm text-[#6B7280] italic line-clamp-2">"{t.quote}"</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => openEdit(t)} aria-label={`Edit testimonial from ${t.studentName}`} className="p-2 text-[#6B7280] hover:text-[#5E17EB] hover:bg-[#EDE7FF] rounded transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={async () => { if (await confirm("Delete this testimonial? This cannot be undone.", "Delete testimonial")) deleteMutation.mutate({ id: t.id }); }} aria-label={`Delete testimonial from ${t.studentName}`}
                    className="p-2 text-[#6B7280] hover:text-red-500 hover:bg-red-50 rounded transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => updateMutation.mutate({ id: t.id, data: { isPublished: !t.isPublished, isApproved: !t.isPublished } })}
                    className="text-xs px-3 py-1.5 bg-[#5E17EB] text-white rounded hover:bg-[#1A1A2E] transition-colors"
                  >
                    {t.isPublished ? "Unpublish" : "Publish"}
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {confirmNode}
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
        <h1 className="text-2xl font-bold text-[#1A1A2E] font-display">Contact Messages</h1>
        <p className="text-[#6B7280]">Messages from the contact form</p>
      </div>
      <div className="space-y-4">
        {(messages || []).length === 0 && <p className="text-[#6B7280]">No messages yet</p>}
        {(messages || []).map((m: any) => (
          <Card key={m.id} className={`border-0 shadow-sm ${!m.isRead ? "border-l-4 border-l-[#5E17EB]" : ""}`}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{m.fullName}</span>
                    {!m.isRead && <Badge className="bg-[#5E17EB]/10 text-[#5E17EB]">New</Badge>}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#6B7280] mb-2">
                    <span>{m.email}</span>
                    <span>{m.phone}</span>
                    <Badge variant="outline">{m.subject}</Badge>
                  </div>
                  <p className="text-sm text-[#1A1A2E]">{m.message}</p>
                  <div className="text-xs text-[#6B7280] mt-2">
                    {new Date(m.createdAt).toLocaleString()}
                  </div>
                </div>
                {!m.isRead && (
                  <button
                    onClick={() => updateMutation.mutate({ id: m.id, isRead: true })}
                    className="text-xs px-3 py-1.5 bg-[#EDE7FF] text-[#5E17EB] rounded hover:bg-[#5E17EB]/10 transition-colors shrink-0"
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
        <h1 className="text-2xl font-bold text-[#1A1A2E] font-display">Site Settings</h1>
        <p className="text-[#6B7280]">Configure your website settings</p>
      </div>

      <Card className="border-0 shadow-md">
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-[#1A1A2E] mb-1 block">Site Name</label>
              <input
                className="w-full px-3 py-2 border rounded-md text-sm"
                value={form.siteName || ""}
                onChange={(e) => setForm((p) => ({ ...p, siteName: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#1A1A2E] mb-1 block">Tagline</label>
              <input
                className="w-full px-3 py-2 border rounded-md text-sm"
                value={form.tagline || ""}
                onChange={(e) => setForm((p) => ({ ...p, tagline: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#1A1A2E] mb-1 block">Phone</label>
              <input
                className="w-full px-3 py-2 border rounded-md text-sm"
                value={form.phone || ""}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#1A1A2E] mb-1 block">Email</label>
              <input
                className="w-full px-3 py-2 border rounded-md text-sm"
                value={form.email || ""}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#1A1A2E] mb-1 block">WhatsApp</label>
              <input
                className="w-full px-3 py-2 border rounded-md text-sm"
                value={form.whatsapp || ""}
                onChange={(e) => setForm((p) => ({ ...p, whatsapp: e.target.value }))}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-[#1A1A2E] mb-1 block">Address</label>
              <input
                className="w-full px-3 py-2 border rounded-md text-sm"
                value={form.address || ""}
                onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-[#1A1A2E] mb-1 block">Opening Hours</label>
              <input
                className="w-full px-3 py-2 border rounded-md text-sm"
                value={form.openingHours || ""}
                onChange={(e) => setForm((p) => ({ ...p, openingHours: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#1A1A2E] mb-1 block">Facebook URL</label>
              <input
                className="w-full px-3 py-2 border rounded-md text-sm"
                value={form.facebookUrl || ""}
                onChange={(e) => setForm((p) => ({ ...p, facebookUrl: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#1A1A2E] mb-1 block">Instagram URL</label>
              <input
                className="w-full px-3 py-2 border rounded-md text-sm"
                value={form.instagramUrl || ""}
                onChange={(e) => setForm((p) => ({ ...p, instagramUrl: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#1A1A2E] mb-1 block">Twitter URL</label>
              <input
                className="w-full px-3 py-2 border rounded-md text-sm"
                value={form.twitterUrl || ""}
                onChange={(e) => setForm((p) => ({ ...p, twitterUrl: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#1A1A2E] mb-1 block">LinkedIn URL</label>
              <input
                className="w-full px-3 py-2 border rounded-md text-sm"
                value={form.linkedinUrl || ""}
                onChange={(e) => setForm((p) => ({ ...p, linkedinUrl: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#1A1A2E] mb-1 block">YouTube URL</label>
              <input
                className="w-full px-3 py-2 border rounded-md text-sm"
                value={form.youtubeUrl || ""}
                onChange={(e) => setForm((p) => ({ ...p, youtubeUrl: e.target.value }))}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-[#1A1A2E] mb-1 block">SEO Title Suffix</label>
              <input
                className="w-full px-3 py-2 border rounded-md text-sm"
                value={form.seoTitleSuffix || ""}
                onChange={(e) => setForm((p) => ({ ...p, seoTitleSuffix: e.target.value }))}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-[#1A1A2E] mb-1 block">SEO Default Description</label>
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
              className="bg-gradient-to-r from-[#5E17EB] to-[#5E17EB] text-[#1A1A2E] hover:from-[#5E17EB] hover:to-[#5E17EB] font-semibold px-8"
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
