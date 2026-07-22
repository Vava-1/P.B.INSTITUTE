import { useState, useEffect } from "react";
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

  // Check if already logged in by calling admin.me — if it succeeds, the
  // httpOnly admin_session cookie is present and valid.
  const meQuery = trpc.admin.me.useQuery(undefined, { retry: false });

  useEffect(() => {
    if (meQuery.isSuccess) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [meQuery.isSuccess, navigate]);

  // While the auth check is loading, show a spinner.
  if (meQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand">
        <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      // The login mutation sets the admin_session + admin_csrf cookies server-side.
      // No token is stored client-side.
      await loginMutation.mutateAsync({ email, password });
      navigate("/admin/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-dark via-brand to-brand-dark flex items-center justify-center px-4">
      <div className="absolute inset-0 diagonal-stripe opacity-30" aria-hidden="true" />
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src="/images/PBI_logo.jpg"
            alt="Pacemaker Institute"
            className="h-20 w-auto rounded-2xl mx-auto mb-4 shadow-warm-lg"
            width={80}
            height={80}
          />
          <h1 className="text-2xl font-bold text-white font-display">
            Admin Portal
          </h1>
          <p className="font-hand text-lg text-gold mt-1">Pacemaker Institute Management</p>
        </div>

        <Card className="border-0 shadow-2xl">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-brand" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-body">Sign In</h2>
                <p className="text-sm text-muted-foreground">Enter your credentials</p>
              </div>
            </div>

            {error && (
              <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="admin-email">Email Address</Label>
                <Input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@pacemakerinstitute.ac.rw"
                  required
                  autoComplete="email"
                />
              </div>
              <div>
                <Label htmlFor="admin-password">Password</Label>
                <div className="relative">
                  <Input
                    id="admin-password"
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    aria-label={showPass ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full bg-brand text-white hover:bg-brand-dark font-semibold"
              >
                <LogIn className="w-4 h-4 mr-2" />
                {loginMutation.isPending ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t text-center">
              <a href="/" className="text-sm text-brand hover:text-brand-dark transition-colors">
                ← Back to Website
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
