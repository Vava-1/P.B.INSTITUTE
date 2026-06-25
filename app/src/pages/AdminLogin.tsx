import { useState } from "react";
import { useNavigate } from "react-router";
import { Shield, LogIn, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/providers/trpc";

export default function AdminLogin() {
  const navigate = useNavigate();
  const loginMutation = trpc.admin.login.useMutation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already logged in
  const adminToken = localStorage.getItem("admin_token");
  if (adminToken) {
    try {
      const payload = JSON.parse(atob(adminToken));
      if (payload.exp > Date.now()) {
        navigate("/admin/dashboard");
        return null;
      }
    } catch {
      localStorage.removeItem("admin_token");
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const result = await loginMutation.mutateAsync({ email, password });
      const token = btoa(
        JSON.stringify({
          id: result.id,
          name: result.name,
          email: result.email,
          role: result.role,
          exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        })
      );
      localStorage.setItem("admin_token", token);
      navigate("/admin/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1A2E] via-[#5E17EB] to-[#1A1A2E] flex items-center justify-center px-4">
      <div className="absolute inset-0 diagonal-stripe opacity-30" />
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src="/images/PBI_logo.jpg"
            alt="Pacemaker Institute"
            className="h-20 w-auto rounded-lg mx-auto mb-4 shadow-lg"
          />
          <h1 className="text-2xl font-bold text-white font-display">
            Admin Portal
          </h1>
          <p className="text-white/60 mt-1">Pacemaker Institute Management</p>
        </div>

        <Card className="border-0 shadow-2xl">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[#5E17EB]/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#5E17EB]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#1A1A2E]">Sign In</h2>
                <p className="text-sm text-[#6B7280]">Enter your credentials</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Email Address</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@pacemakerinstitute.ac.rw"
                  required
                />
              </div>
              <div>
                <Label>Password</Label>
                <div className="relative">
                  <Input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280]"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full bg-gradient-to-r from-[#5E17EB] to-[#5E17EB] text-[#1A1A2E] hover:from-[#5E17EB] hover:to-[#5E17EB] font-semibold"
              >
                <LogIn className="w-4 h-4 mr-2" />
                {loginMutation.isPending ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t text-center">
              <a href="/" className="text-sm text-[#5E17EB] hover:text-[#5E17EB] transition-colors">
                ← Back to Website
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
