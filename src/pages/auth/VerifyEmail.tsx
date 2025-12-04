import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "../../contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import api from "@/api/axios";

const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { userId, email } = location.state || {};
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState("");
  const [timer, setTimer] = useState(0);
  
  // Get user_id and email from URL params if not in state
  const urlParams = new URLSearchParams(location.search);
  const userIdFromUrl = urlParams.get('user_id');
  const emailFromUrl = urlParams.get('email');
  
  const finalUserId = userId || userIdFromUrl;
  const finalEmail = email || emailFromUrl;
  
  useEffect(() => {
    if (!finalUserId) {
      setError("User ID is required for email verification");
    } else {
      // Initialize timer to 60 seconds when component loads
      setTimer(60);
    }
  }, [finalUserId]);

  // Timer for resend button
  useEffect(() => {
    if (timer > 0) {
      const t = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [timer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await api.post("/customer/verify-email", {
        user_id: finalUserId,
        code: code
      });
      
      // Handle successful verification
      setSuccess(true);
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setResendLoading(true);
    setResendSuccess("");
    
    try {
      await api.post("/customer/resend-verification", { 
        user_id: finalUserId 
      });
      
      setResendSuccess("A new verification code has been sent to your email.");
      setTimer(60); // 60 second cooldown
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to resend verification code");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">{t('auth.verifyEmail')}</CardTitle>
          <CardDescription className="text-center">{t('auth.verifyEmailDesc').replace('{email}', finalEmail || "your email")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {resendSuccess && (
            <Alert variant="default">
              <AlertDescription>{resendSuccess}</AlertDescription>
            </Alert>
          )}
          {success ? (
            <Alert variant="default">
              <AlertDescription>{t('auth.verifyEmailSuccess')}</AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                minLength={6}
                autoFocus
                placeholder={t('auth.enterCode')}
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, ""))}
                className="tracking-widest text-center text-lg"
                required
              />
              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResend}
                  disabled={timer > 0 || resendLoading}
                  className="flex-1 mr-2"
                >
                  {resendLoading ? "Sending..." : timer > 0 ? `Resend (${timer}s)` : "Resend Code"}
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 ml-2" 
                  disabled={loading || code.length !== 6}
                >
                  {loading ? t('auth.verifying') : t('auth.verifyEmailButton')}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmail;
