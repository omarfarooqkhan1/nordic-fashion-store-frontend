import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "../../contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertCircle } from "lucide-react";
import api from "@/api/axios";

const AdminForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
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
      await api.post("/admin/password/send-reset-code", { email });
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
      await api.post("/admin/password/send-reset-code", { email });
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
      await api.post("/admin/password/reset", {
        email,
        code,
        password,
        password_confirmation: passwordConfirm,
      });
      setSuccess("Password reset successful! Redirecting to login...");
      setTimeout(() => navigate("/admin/login", { replace: true }), 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-leather-100 to-leather-200 dark:from-leather-900 dark:to-leather-800 px-2 sm:px-4">
      <Card className="w-full max-w-md bg-gradient-to-br from-card to-leather-100/50 dark:from-card dark:to-leather-800/30 border-border shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-gold-500 to-gold-600 rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-leather-900" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Admin Password Reset
          </CardTitle>
          <CardDescription className="text-center">
            {step === "request"
              ? "Enter your admin email to receive a reset code"
              : `Enter the 6-digit code sent to ${email}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-600 dark:text-red-400">
                {error}
              </AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
              <AlertDescription className="text-green-600 dark:text-green-400">
                {success}
              </AlertDescription>
            </Alert>
          )}
          
          {step === "request" ? (
            <form onSubmit={handleRequest} className="space-y-4">
              <Input
                type="email"
                placeholder="Admin Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={loading}
              />
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-leather-900 font-semibold" 
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Reset Code"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => navigate("/admin/login")}
              >
                Back to Login
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
                placeholder="New Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <Input
                type="password"
                placeholder="Confirm New Password"
                value={passwordConfirm}
                onChange={e => setPasswordConfirm(e.target.value)}
                required
                disabled={loading}
              />
              <div className="flex items-center justify-between gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResend}
                  disabled={timer > 0 || loading}
                  className="flex-1"
                >
                  {timer > 0 ? `Resend (${timer}s)` : "Resend Code"}
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-leather-900 font-semibold" 
                  disabled={loading}
                >
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

export default AdminForgotPassword;