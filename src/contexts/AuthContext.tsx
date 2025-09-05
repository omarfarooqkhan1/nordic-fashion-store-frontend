
import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useAuth0 } from "@auth0/auth0-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/contexts/LanguageContext"
import api from "../api/axios"

interface User {
  id: number
  name: string
  email: string
  role: "customer" | "admin"
  auth_type: "password" | "auth0"
}

interface AuthContextType {
  user: User | null
  token: string | null
  loginAdmin: (email: string, password: string) => Promise<void>
  registerCustomer: (name: string, email: string, password: string) => Promise<void>
  loginCustomer: (email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  isCustomer: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"))
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const { t } = useLanguage()

  const {
    user: auth0User,
    isAuthenticated: auth0Authenticated,
    getAccessTokenSilently,
    logout: auth0Logout,
  } = useAuth0()
  const queryClient = useQueryClient()

  // Handle Auth0 authentication for customers
  useEffect(() => {
    const handleAuth0Login = async () => {
      if (auth0Authenticated && auth0User && !user) {
        try {
          // We don't need the access token for our backend call
          // as we're creating our own token in the response
          const response = await api.post("/auth0-callback", {
            name: auth0User.name,
            email: auth0User.email,
            auth0_user_id: auth0User.sub,
          })

          setToken(response.data.token)
          setUser(response.data.user)
          localStorage.setItem("token", response.data.token)
          localStorage.setItem("user", JSON.stringify(response.data.user))
          
          // Show success toast
          toast({
            title: t('toast.loginSuccess'),
            description: `${t('toast.loginSuccess')} ${response.data.user.name}`,
            className: "bg-green-500 text-white",
          })
        } catch (error) {
          toast({
            title: t('toast.loginError'),
            description: t('toast.error'),
            variant: "destructive",
          })
        }
      }
      setLoading(false)
    }

    handleAuth0Login()
  }, [auth0Authenticated, auth0User, user, toast])

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = () => {
      const storedToken = localStorage.getItem("token")
      const storedUser = localStorage.getItem("user")

      if (storedToken && storedUser && !auth0Authenticated) {
        try {
          setToken(storedToken)
          setUser(JSON.parse(storedUser))
        } catch (error) {
          localStorage.removeItem("token")
          localStorage.removeItem("user")
        }
      }
      setLoading(false)
    }

    if (!auth0Authenticated) {
      initAuth()
    }
  }, [auth0Authenticated])

  // Admin login mutation
  const adminLoginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await api.post("/admin/login", { email, password })
      return response.data
    },
    onSuccess: (data) => {
      setToken(data.token)
      setUser(data.user)
      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))
      
      toast({
        title: t('toast.loginSuccess'),
        description: `${t('auth.profile')}: ${data.user.name}`,
        className: "bg-green-500 text-white",
      })
    },
    onError: (error: any) => {
      toast({
        title: t('toast.loginError'),
        description: error.response?.data?.message || t('toast.loginError'),
        variant: "destructive",
      })
    },
  })

  // Customer registration mutation
  const customerRegisterMutation = useMutation({
    mutationFn: async ({ name, email, password }: { name: string; email: string; password: string }) => {
      const response = await api.post("/customer/register", {
        name,
        email,
        password,
        password_confirmation: password,
      })
      return response.data
    },
    onSuccess: (data) => {
      setToken(data.token)
      setUser(data.user)
      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))
      
      toast({
        title: t('toast.signupSuccess'),
        description: `${t('nav.home')}: ${data.user.name}`,
        className: "bg-green-500 text-white",
      })
    },
    onError: (error: any) => {
      toast({
        title: t('toast.signupError'),
        description: error.response?.data?.message || t('toast.signupError'),
        variant: "destructive",
      })
    },
  })

  // Customer login mutation
  const customerLoginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await api.post("/customer/login", { email, password })
      return response.data
    },
    onSuccess: (data) => {
      setToken(data.token)
      setUser(data.user)
      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))
      
      toast({
        title: t('toast.loginSuccess'),
        description: `${t('auth.profile')}: ${data.user.name}`,
        className: "bg-green-500 text-white",
      })
    },
    onError: (error: any) => {
      toast({
        title: t('toast.loginError'),
        description: error.response?.data?.message || t('toast.loginError'),
        variant: "destructive",
      })
    },
  })

  const loginAdmin = async (email: string, password: string) => {
    await adminLoginMutation.mutateAsync({ email, password })
  }

  const registerCustomer = async (name: string, email: string, password: string) => {
    await customerRegisterMutation.mutateAsync({ name, email, password })
  }

  const loginCustomer = async (email: string, password: string) => {
    await customerLoginMutation.mutateAsync({ email, password })
  }

  const logout = () => {
    const userName = user?.name || t('auth.profile')
    
    setUser(null)
    setToken(null)
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    queryClient.clear()

    toast({
      title: t('toast.logoutSuccess'),
      description: `${userName}`,
      className: "bg-blue-500 text-white",
    })

    // Logout from Auth0 if authenticated
    if (auth0Authenticated) {
      auth0Logout({ logoutParams: { returnTo: window.location.origin } })
    }
  }

  const value: AuthContextType = {
    user,
    token,
    loginAdmin,
    registerCustomer,
    loginCustomer,
    logout,
    loading:
      loading || adminLoginMutation.isPending || customerRegisterMutation.isPending || customerLoginMutation.isPending,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    isCustomer: user?.role === "customer",
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}