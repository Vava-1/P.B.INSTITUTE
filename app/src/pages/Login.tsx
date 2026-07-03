import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function getOAuthUrl() {
  const authUrl = import.meta.env.VITE_AUTH_URL;
  const appID = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  // SECURITY: state is a random nonce bound to a cookie the server can read on callback.
  // This prevents login-CSRF (attacker forcing a victim into the attacker's account).
  const nonce = crypto.randomUUID();
  const state = `${nonce}.${btoa(redirectUri)}`;
  // Set a short-lived cookie that the server-side callback will compare against state.
  document.cookie = `oauth_state=${nonce}; path=/; max-age=600; SameSite=Lax${window.location.protocol === "https:" ? "; Secure" : ""}`;

  const url = new URL(`${authUrl}/api/oauth/authorize`);
  url.searchParams.set("client_id", appID);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "profile");
  url.searchParams.set("state", state);

  return url.toString();
}

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle>Welcome</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            className="w-full"
            size="lg"
            onClick={() => {
              window.location.href = getOAuthUrl();
            }}
          >
            Sign in
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
