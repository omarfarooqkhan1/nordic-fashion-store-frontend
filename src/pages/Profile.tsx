"use client"

import type React from "react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { User, Mail, Lock, Save, Eye, EyeOff, Shield, MapPin, Edit, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import api from "../api/axios"

import { useAuth } from "../contexts/AuthContext"
import { useLanguage } from "../contexts/LanguageContext"
import { 
  fetchUserAddresses, 
  createAddress, 
  updateAddress, 
  deleteAddress, 
  setDefaultAddress,
  type Address,
  type CreateAddressData,
  type UpdateAddressData
} from "../api/addresses"

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
})

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

const addressSchema = z.object({
  type: z.enum(["home", "work", "other"]).optional(),
  label: z.string().optional(),
  street: z.string().min(5, "Street address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().min(2, "State/Province must be at least 2 characters"),
  postal_code: z.string().min(4, "Postal code must be at least 4 characters"),
  country: z.string().min(2, "Country must be at least 2 characters"),
})

type ProfileFormData = z.infer<typeof profileSchema>
type PasswordFormData = z.infer<typeof passwordSchema>
type AddressFormData = z.infer<typeof addressSchema>

const Profile: React.FC = () => {
  const { user } = useAuth()
  const { t } = useLanguage()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState("")
  const [profileError, setProfileError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)

  // Fetch addresses using React Query
  const {
    data: addresses = [],
    isLoading: addressesLoading,
    error: addressesError,
  } = useQuery({
    queryKey: ['addresses'],
    queryFn: fetchUserAddresses,
    enabled: !!user,
  })

  // Address mutations
  const createAddressMutation = useMutation({
    mutationFn: createAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      toast({
        title: t('address.addSuccess'),
        className: "bg-green-500 text-white",
      })
      setShowAddressForm(false)
      resetAddressForm()
    },
    onError: (error: Error) => {
      toast({
        title: t('toast.error'),
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const updateAddressMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAddressData }) => updateAddress(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      toast({
        title: t('address.updateSuccess'),
        className: "bg-green-500 text-white",
      })
      setShowAddressForm(false)
      setEditingAddress(null)
      resetAddressForm()
    },
    onError: (error: Error) => {
      toast({
        title: t('toast.error'),
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const deleteAddressMutation = useMutation({
    mutationFn: deleteAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      toast({
        title: t('address.deleteSuccess'),
        className: "bg-green-500 text-white",
      })
    },
    onError: (error: Error) => {
      toast({
        title: t('toast.error'),
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const setDefaultMutation = useMutation({
    mutationFn: setDefaultAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      toast({
        title: t('address.defaultSuccess'),
        className: "bg-green-500 text-white",
      })
    },
    onError: (error: Error) => {
      toast({
        title: t('toast.error'),
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
  })

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPasswordForm,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  const {
    register: registerAddress,
    handleSubmit: handleAddressSubmit,
    formState: { errors: addressErrors },
    reset: resetAddressForm,
    setValue: setAddressValue,
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      type: "home",
      country: "Sweden",
    },
  })

  const onProfileSubmit = async (data: ProfileFormData) => {
    setProfileError("")
    setProfileSuccess("")
    setIsUpdatingProfile(true)

    try {
      const response = await api.put('/user', {
        name: data.name,
        email: data.email,
      })
      
      setProfileSuccess(t('toast.profileUpdated'))
      
      toast({
        title: t('toast.profileUpdated'),
        className: "bg-green-500 text-white",
      })

      // Update the user context with new data
      // This would typically be handled by refetching user data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || t('toast.error')
      setProfileError(errorMessage)
      
      toast({
        title: t('toast.error'),
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setPasswordError("")
    setPasswordSuccess("")
    setIsUpdatingPassword(true)

    try {
      const response = await api.post('/change-password', {
        current_password: data.currentPassword,
        password: data.newPassword,
        password_confirmation: data.confirmPassword,
      })
      
      setPasswordSuccess(t('toast.profileUpdated'))
      resetPasswordForm()
      
      toast({
        title: t('toast.profileUpdated'),
        className: "bg-green-500 text-white",
      })
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || t('toast.error')
      setPasswordError(errorMessage)
      
      toast({
        title: t('toast.error'),
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  const onAddressSubmit = async (data: AddressFormData) => {
    const addressData: CreateAddressData = {
      type: data.type,
      label: data.label,
      street: data.street,
      city: data.city,
      state: data.state,
      postal_code: data.postal_code,
      country: data.country,
    }

    if (editingAddress) {
      updateAddressMutation.mutate({ id: editingAddress.id, data: addressData })
    } else {
      createAddressMutation.mutate(addressData)
    }
  }

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address)
    setAddressValue("type", address.type)
    setAddressValue("label", address.label)
    setAddressValue("street", address.street)
    setAddressValue("city", address.city)
    setAddressValue("state", address.state)
    setAddressValue("postal_code", address.postal_code)
    setAddressValue("country", address.country)
    setShowAddressForm(true)
  }

  const handleDeleteAddress = async (addressId: string) => {
    if (addresses.length === 1) {
      toast({
        title: t('address.mustHaveOne'),
        variant: "destructive",
      })
      return
    }
    
    deleteAddressMutation.mutate(addressId)
  }

  const handleSetDefaultAddress = async (addressId: string) => {
    setDefaultMutation.mutate(addressId)
  }

  const handleCancelAddressForm = () => {
    setShowAddressForm(false)
    setEditingAddress(null)
    resetAddressForm()
  }

  const isAuth0User = user?.auth_type === "auth0"

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('auth.profile')}</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">{t('auth.updateProfile')}</p>
          </div>

          {/* User Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {t('auth.profile')}
              </CardTitle>
              <CardDescription>{t('auth.updateProfile')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary">{t('nav.customer')}</Badge>
                    <Badge variant={isAuth0User ? "default" : "outline"}>
                      {isAuth0User ? (
                        <>
                          <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24">
                            <path
                              fill="currentColor"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                          </svg>
                          Google Account
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3 mr-1" />
                          {t('auth.password')} Account
                        </>
                      )}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Password Change Form - Only for password users */}
          {!isAuth0User && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  {t('auth.password')}
                </CardTitle>
                <CardDescription>{t('auth.updateProfile')} - {t('auth.password')}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
                  {passwordSuccess && (
                    <Alert className="border-green-200 bg-green-50">
                      <AlertDescription className="text-green-800">{passwordSuccess}</AlertDescription>
                    </Alert>
                  )}
                  {passwordError && (
                    <Alert variant="destructive">
                      <AlertDescription>{passwordError}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">{t('auth.password')} ({t('common.previous')})</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder={t('auth.password')}
                        className="pl-10 pr-10"
                        {...registerPassword("currentPassword")}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {passwordErrors.currentPassword && (
                      <p className="text-sm text-destructive">{passwordErrors.currentPassword.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">{t('auth.password')} ({t('common.next')})</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        placeholder={t('auth.password')}
                        className="pl-10 pr-10"
                        {...registerPassword("newPassword")}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {passwordErrors.newPassword && (
                      <p className="text-sm text-destructive">{passwordErrors.newPassword.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder={t('auth.confirmPassword')}
                        className="pl-10 pr-10"
                        {...registerPassword("confirmPassword")}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {passwordErrors.confirmPassword && (
                      <p className="text-sm text-destructive">{passwordErrors.confirmPassword.message}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={isUpdatingPassword}>
                    <Lock className="mr-2 h-4 w-4" />
                    {isUpdatingPassword ? t('common.loading') : t('auth.updateProfile')}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Address Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {t('address.title')}
              </CardTitle>
              <CardDescription>{t('auth.updateProfile')} - {t('address.title')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {addressesLoading && (
                <p className="text-center text-muted-foreground">{t('common.loading')}</p>
              )}
              
              {addressesError && (
                <Alert variant="destructive">
                  <AlertDescription>{t('toast.error')}</AlertDescription>
                </Alert>
              )}

              {!addressesLoading && !addressesError && addresses.length === 0 && (
                <Alert>
                  <AlertDescription>{t('address.mustHaveOne')}</AlertDescription>
                </Alert>
              )}

              {/* Address List */}
              {!addressesLoading && addresses.length > 0 && (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <div key={address.id} className="p-4 border rounded-lg bg-muted/50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{address.label}</h4>
                            {address.is_default && (
                              <Badge variant="default" className="text-xs">
                                {t('address.default')}
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {t(`address.${address.type}`)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {address.street}<br />
                            {address.city}, {address.state} {address.postal_code}<br />
                            {address.country}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {!address.is_default && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSetDefaultAddress(address.id)}
                              disabled={setDefaultMutation.isPending}
                            >
                              {t('address.setDefault')}
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditAddress(address)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteAddress(address.id)}
                            disabled={addresses.length === 1 || deleteAddressMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Address Button */}
              {!showAddressForm && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowAddressForm(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {t('address.add')}
                </Button>
              )}

              {/* Address Form */}
              {showAddressForm && (
                <div className="border rounded-lg p-4 bg-background">
                  <h4 className="font-medium mb-4">
                    {editingAddress ? t('address.edit') : t('address.add')}
                  </h4>
                  <form onSubmit={handleAddressSubmit(onAddressSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="addressType">{t('address.type')}</Label>
                        <select
                          id="addressType"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                          {...registerAddress("type")}
                        >
                          <option value="home">{t('address.home')}</option>
                          <option value="work">{t('address.work')}</option>
                          <option value="other">{t('address.other')}</option>
                        </select>
                        {addressErrors.type && (
                          <p className="text-sm text-destructive">{addressErrors.type.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="addressLabel">{t('address.label')}</Label>
                        <Input
                          id="addressLabel"
                          placeholder={t('address.label')}
                          {...registerAddress("label")}
                        />
                        {addressErrors.label && (
                          <p className="text-sm text-destructive">{addressErrors.label.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="addressStreet">{t('address.street')}</Label>
                      <Input
                        id="addressStreet"
                        placeholder={t('address.street')}
                        {...registerAddress("street")}
                      />
                      {addressErrors.street && (
                        <p className="text-sm text-destructive">{addressErrors.street.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="addressCity">{t('address.city')}</Label>
                        <Input
                          id="addressCity"
                          placeholder={t('address.city')}
                          {...registerAddress("city")}
                        />
                        {addressErrors.city && (
                          <p className="text-sm text-destructive">{addressErrors.city.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="addressState">{t('address.state')}</Label>
                        <Input
                          id="addressState"
                          placeholder={t('address.state')}
                          {...registerAddress("state")}
                        />
                        {addressErrors.state && (
                          <p className="text-sm text-destructive">{addressErrors.state.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="addressPostalCode">{t('address.postalCode')}</Label>
                        <Input
                          id="addressPostalCode"
                          placeholder={t('address.postalCode')}
                          {...registerAddress("postal_code")}
                        />
                        {addressErrors.postal_code && (
                          <p className="text-sm text-destructive">{addressErrors.postal_code.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="addressCountry">{t('address.country')}</Label>
                        <Input
                          id="addressCountry"
                          placeholder={t('address.country')}
                          {...registerAddress("country")}
                        />
                        {addressErrors.country && (
                          <p className="text-sm text-destructive">{addressErrors.country.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        type="submit" 
                        disabled={createAddressMutation.isPending || updateAddressMutation.isPending}
                      >
                        <Save className="mr-2 h-4 w-4" />
                        {createAddressMutation.isPending || updateAddressMutation.isPending 
                          ? t('common.loading') 
                          : t('address.save')
                        }
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancelAddressForm}
                      >
                        {t('address.cancel')}
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Auth0 Users Info */}
          {isAuth0User && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Google Account Security
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800 text-sm">
                    {t('auth.loginGoogle')} - {t('auth.updateProfile')}
                  </p>
                  <Button variant="outline" className="mt-3" asChild>
                    <a
                      href="https://myaccount.google.com/security"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600"
                    >
                      Google Account
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile
