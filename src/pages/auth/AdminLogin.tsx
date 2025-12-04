
import type React from "react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Shield } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "../../contexts/AuthContext"
import { AuthForm } from "@/components/common"

const AdminLogin: React.FC = () => {
  const [error, setError] = useState("")
  const { loginAdmin, loading } = useAuth()
  const navigate = useNavigate()

  const onSubmit = async (data: { email: string; password: string }) => {
    setError("")
    try {
      await loginAdmin(data.email, data.password)
      navigate("/admin/dashboard")
    } catch (err: any) {
      setError(err.response?.data?.message || "Admin login failed")
    }
  }

  return (
    <AuthForm
      title="Admin Portal"
      description="Secure access for administrators only"
      submitText="Sign In"
      isLoading={loading}
      error={error}
      onSubmit={onSubmit}
    >
      <div className="space-y-4">
        <Separator className="my-4" />
        <div className="text-center text-sm">
          <div className="flex items-center justify-center space-x-2 text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>Administrator Access Only</span>
          </div>
        </div>
        <div className="text-center text-sm">
          <span className="text-muted-foreground">Customer? </span>
          <Link to="/auth/customer-login" className="font-medium text-primary hover:underline">
            Sign in here
          </Link>
        </div>
      </div>
    </AuthForm>
  )
}

export default AdminLogin