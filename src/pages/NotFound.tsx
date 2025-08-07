"use client"

import type React from "react"
import { Link } from "react-router-dom"
import { Home, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/contexts/LanguageContext"

const NotFound: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-6xl font-bold text-gray-900 dark:text-gray-100 mb-2">404</CardTitle>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('error.404.title')}</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            {t('error.404.desc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <Button asChild>
              <Link to="/" className="flex items-center justify-center">
                <Home className="mr-2 h-4 w-4" />
                {t('error.404.goHome')}
              </Link>
            </Button>
            <Button variant="outline" onClick={() => window.history.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('error.404.goBack')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default NotFound
