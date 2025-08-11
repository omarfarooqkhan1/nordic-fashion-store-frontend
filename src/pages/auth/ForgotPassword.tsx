import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import api from "@/api/axios";

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"request" | "verify">("request");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  // Timer for resend
  React.useEffect(() => {
    if (timer > 0) {
      const t = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [timer]);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/password/send-reset-code", { email });
      setStep("verify");
      setSuccess("");
      setTimer(60);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send reset code");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setLoading(true);
    try {
      await api.post("/password/send-reset-code", { email });
      setSuccess("Code resent to your email.");
      setTimer(60);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to resend code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/password/reset", {
        email,
        code,
        password,
        password_confirmation: passwordConfirm,
      });
      setSuccess("Password reset! Redirecting to login...");
      setTimeout(() => navigate("/login", { replace: true }), 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Forgot Password</CardTitle>
          <CardDescription className="text-center">
            {step === "request"
              ? "Enter your email to receive a reset code."
              : `Enter the 6-digit code sent to ${email}.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert variant="default">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          {step === "request" ? (
            <form onSubmit={handleRequest} className="space-y-4">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={loading}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Code"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <Input
                type="text"
                placeholder="6-digit code"
                value={code}
                onChange={e => setCode(e.target.value)}
                required
                maxLength={6}
                minLength={6}
                pattern="\d{6}"
                disabled={loading}
              />
              <Input
                type="password"
                placeholder="New password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <Input
                type="password"
                placeholder="Confirm new password"
                value={passwordConfirm}
                onChange={e => setPasswordConfirm(e.target.value)}
                required
                disabled={loading}
              />
              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResend}
                  disabled={timer > 0 || loading}
                >
                  {timer > 0 ? `Resend (${timer}s)` : "Resend Code"}
                </Button>
                <Button type="submit" className="w-32" disabled={loading}>
                  {loading ? "Resetting..." : "Reset Password"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
