"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { OnboardingModal } from "@/components/onboarding-modal"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  Building2,
  Users,
  Brain,
  MessageCircle,
  BookOpen,
  Trophy,
  CheckSquare,
  Bell,
  ArrowRight,
  Menu,
  X,
  Zap,
  Shield,
  BarChart3,
  Clock,
  Globe,
  Sparkles,
  Check
} from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_onboarded')
          .eq('id', user.id)
          .single()

        if (profile && !profile.is_onboarded) {
          setShowOnboarding(true)
        }
      }
    }
    checkUser()
  }, [])

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setShowOnboarding(false)
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-background">

      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">NeuroNxt</span>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#platform" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Platform</a>
              <a href="#benefits" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Benefits</a>
              <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Features</a>
              <Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Pricing</Link>

              <div className="flex items-center gap-3 pl-4 border-l">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link href="/pricing">
                  <Button size="sm" className="shadow-lg shadow-primary/20">Get Started</Button>
                </Link>
              </div>
            </div>

            <div className="md:hidden">
              <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-t p-4 bg-background/95 backdrop-blur-lg">
            <div className="flex flex-col space-y-4">
              <a href="#platform" onClick={() => setIsMenuOpen(false)} className="text-sm font-medium p-2 hover:bg-muted rounded">Platform</a>
              <a href="#benefits" onClick={() => setIsMenuOpen(false)} className="text-sm font-medium p-2 hover:bg-muted rounded">Benefits</a>
              <a href="#features" onClick={() => setIsMenuOpen(false)} className="text-sm font-medium p-2 hover:bg-muted rounded">Features</a>
              <Link href="/pricing" onClick={() => setIsMenuOpen(false)} className="text-sm font-medium p-2 hover:bg-muted rounded">Pricing</Link>
              <div className="pt-2 flex flex-col gap-2">
                <Link href="/auth/login"><Button variant="outline" className="w-full">Login</Button></Link>
                <Link href="/pricing"><Button className="w-full">Get Started</Button></Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main>

        {/* Hero - Modern Asymmetric Layout */}
        <section className="relative py-20 md:py-28 px-4 overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background -z-10" />
          <div className="absolute top-20 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -z-10" />

          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-12 gap-8 items-center">
              {/* Left content - 7 columns */}
              <div className="lg:col-span-7 space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">AI-Powered Learning Platform</span>
                </div>

                <h1 className="text-5xl md:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.1]">
                  Transform Your
                  <span className="block mt-2 bg-gradient-to-r from-primary via-primary to-blue-600 bg-clip-text text-transparent">
                    Institute's Future
                  </span>
                </h1>

                <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl">
                  Empower students with AI tools, collaborative learning, and seamless communication in one modern platform.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Link href="/pricing">
                    <Button size="lg" className="h-14 px-8 text-lg shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 transition-all group">
                      View Pricing Plans
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="#platform">
                    <Button size="lg" variant="outline" className="h-14 px-8 text-lg">
                      See How It Works
                    </Button>
                  </Link>
                </div>

                {/* Trust indicators */}
                <div className="flex flex-wrap items-center gap-6 pt-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    Enterprise Security
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    24/7 Support
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    Easy Setup
                  </div>
                </div>
              </div>

              {/* Right visual - 5 columns with overlapping cards */}
              <div className="lg:col-span-5 relative">
                <div className="relative h-[500px]">
                  {/* Main dashboard preview */}
                  <div className="absolute top-0 right-0 w-full rounded-2xl border bg-card shadow-2xl overflow-hidden transform hover:scale-105 transition-transform duration-500">
                    <img src="/neuronxt-dashboard-screenshot.png" alt="Dashboard" className="w-full" />
                  </div>

                  {/* Floating feature cards */}
                  <div className="absolute -left-4 top-20 w-48 p-4 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl transform hover:-translate-y-2 transition-transform duration-300">
                    <Brain className="w-8 h-8 mb-2 opacity-90" />
                    <div className="font-semibold">AI Study Tools</div>
                    <div className="text-xs opacity-90 mt-1">Powered by AI</div>
                  </div>

                  <div className="absolute -right-4 bottom-20 w-48 p-4 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-xl transform hover:-translate-y-2 transition-transform duration-300">
                    <Trophy className="w-8 h-8 mb-2 opacity-90" />
                    <div className="font-semibold">Gamification</div>
                    <div className="text-xs opacity-90 mt-1">Boost Engagement</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits - Bento Grid Layout */}
        <section id="benefits" className="py-24 px-4 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <Badge className="mb-4 px-4 py-1.5 bg-primary/10 text-primary border-primary/20">Why Choose NeuroNxt</Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Built for Modern Education</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Everything your institute needs in one powerful platform
              </p>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 md:gap-6">
              {/* Large card - spans 4 columns */}
              <Card className="md:col-span-4 p-8 md:p-12 bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 group">
                <div className="flex flex-col md:flex-row items-start gap-8">
                  <div className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <BarChart3 className="w-10 h-10 text-primary" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-3xl font-bold">Boost Student Engagement</h3>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      AI-powered tools, gamification with XP and leaderboards, and social features keep students motivated and actively learning. Track study streaks and celebrate achievements.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-2">
                      <Badge variant="secondary">AI Tools</Badge>
                      <Badge variant="secondary">Leaderboards</Badge>
                      <Badge variant="secondary">Social Learning</Badge>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Tall card - spans 2 columns, 2 rows */}
              <Card className="md:col-span-2 md:row-span-2 p-8 bg-gradient-to-br from-green-500/5 to-green-500/10 border-2 border-green-500/20 hover:border-green-500/40 transition-all duration-300 group">
                <div className="h-full flex flex-col justify-between">
                  <div>
                    <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Clock className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Save Time & Resources</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Centralized management, automated notices, and digital notes reduce administrative workload significantly.
                    </p>
                  </div>
                  <div className="mt-8 pt-6 border-t">
                    <div className="text-4xl font-bold text-green-600">60%</div>
                    <div className="text-sm text-muted-foreground">Time Saved</div>
                  </div>
                </div>
              </Card>

              {/* Wide card - spans 4 columns */}
              <Card className="md:col-span-4 p-8 bg-gradient-to-br from-purple-500/5 to-purple-500/10 border-2 border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 group">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Shield className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-3">Secure & Scalable</h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      Enterprise-grade security with role-based access control. Scales effortlessly from 100 to 10,000+ students.
                    </p>
                    <div className="grid grid-cols-3 gap-4 pt-4">
                      <div className="text-center p-3 rounded-lg bg-background/50">
                        <div className="text-2xl font-bold text-purple-600">256-bit</div>
                        <div className="text-xs text-muted-foreground">Encryption</div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-background/50">
                        <div className="text-2xl font-bold text-purple-600">99.9%</div>
                        <div className="text-xs text-muted-foreground">Uptime SLA</div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-background/50">
                        <div className="text-2xl font-bold text-purple-600">GDPR</div>
                        <div className="text-xs text-muted-foreground">Compliant</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Platform Features - Asymmetric Grid */}
        <section id="platform" className="py-24 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <Badge className="mb-4 px-4 py-1.5 bg-primary/10 text-primary border-primary/20">Complete Platform</Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Everything in One Place</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                A comprehensive ecosystem for students, teachers, and administrators
              </p>
            </div>

            {/* Student Features */}
            <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
              <div className="order-2 lg:order-1">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-6 hover:shadow-lg transition-all hover:scale-105 duration-300 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10 border-blue-200 dark:border-blue-900">
                    <BookOpen className="w-10 h-10 text-blue-600 mb-3" />
                    <div className="font-bold">Notes Hub</div>
                    <div className="text-xs text-muted-foreground mt-1">Digital Library</div>
                  </Card>
                  <Card className="p-6 hover:shadow-lg transition-all hover:scale-105 duration-300 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10 border-purple-200 dark:border-purple-900">
                    <Brain className="w-10 h-10 text-purple-600 mb-3" />
                    <div className="font-bold">AI Tools</div>
                    <div className="text-xs text-muted-foreground mt-1">Smart Assistant</div>
                  </Card>
                  <Card className="p-6 hover:shadow-lg transition-all hover:scale-105 duration-300 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10 border-green-200 dark:border-green-900">
                    <CheckSquare className="w-10 h-10 text-green-600 mb-3" />
                    <div className="font-bold">Tasks</div>
                    <div className="text-xs text-muted-foreground mt-1">Stay Organized</div>
                  </Card>
                  <Card className="p-6 hover:shadow-lg transition-all hover:scale-105 duration-300 bg-gradient-to-br from-yellow-50 to-yellow-100/50 dark:from-yellow-950/20 dark:to-yellow-900/10 border-yellow-200 dark:border-yellow-900">
                    <Trophy className="w-10 h-10 text-yellow-600 mb-3" />
                    <div className="font-bold">Leaderboard</div>
                    <div className="text-xs text-muted-foreground mt-1">Compete & Win</div>
                  </Card>
                </div>
              </div>

              <div className="space-y-6 order-1 lg:order-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium">
                  <Users className="w-4 h-4" /> For Students
                </div>
                <h3 className="text-3xl md:text-4xl font-bold">Powerful Tools for Learning</h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Give your students everything they need to succeed—from AI-powered study tools to collaborative features.
                </p>
                <div className="space-y-3 pt-4">
                  {[
                    { icon: BookOpen, text: "Access notes organized by subject and semester" },
                    { icon: Brain, text: "AI summarizer, quiz generator, and flashcards" },
                    { icon: MessageCircle, text: "Chat with classmates and teachers" },
                    { icon: Trophy, text: "Earn XP and track study streaks" }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <item.icon className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-muted-foreground">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Admin Features */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium">
                  <Building2 className="w-4 h-4" /> For Administrators
                </div>
                <h3 className="text-3xl md:text-4xl font-bold">Centralized Control</h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Manage your entire institute from one powerful dashboard. Simple, efficient, and secure.
                </p>
                <div className="space-y-3 pt-4">
                  {[
                    { icon: Users, text: "Add/remove students and teachers instantly" },
                    { icon: Bell, text: "Send notices to specific branches or entire institute" },
                    { icon: BookOpen, text: "Teachers upload notes, students access immediately" },
                    { icon: Globe, text: "Multi-branch support with role-based access" }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <item.icon className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-muted-foreground">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card className="p-6 hover:shadow-lg transition-all hover:scale-105 duration-300 bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-950/20 dark:to-indigo-900/10 border-indigo-200 dark:border-indigo-900">
                  <Users className="w-10 h-10 text-indigo-600 mb-3" />
                  <div className="font-bold">User Management</div>
                  <div className="text-xs text-muted-foreground mt-1">Full Control</div>
                </Card>
                <Card className="p-6 hover:shadow-lg transition-all hover:scale-105 duration-300 bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/20 dark:to-orange-900/10 border-orange-200 dark:border-orange-900">
                  <Bell className="w-10 h-10 text-orange-600 mb-3" />
                  <div className="font-bold">Notices</div>
                  <div className="text-xs text-muted-foreground mt-1">Instant Updates</div>
                </Card>
                <Card className="col-span-2 p-6 hover:shadow-lg transition-all hover:scale-105 duration-300 bg-gradient-to-br from-teal-50 to-teal-100/50 dark:from-teal-950/20 dark:to-teal-900/10 border-teal-200 dark:border-teal-900">
                  <Globe className="w-10 h-10 text-teal-600 mb-3" />
                  <div className="font-bold">Multi-Branch Support</div>
                  <div className="text-xs text-muted-foreground mt-1">Manage multiple locations</div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 px-4 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <Badge className="mb-4 px-4 py-1.5 bg-primary/10 text-primary border-primary/20">Platform Features</Badge>
              <h2 className="text-4xl md:text-5xl font-bold">Complete Feature Set</h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: BookOpen, title: "Notes Hub", desc: "Centralized library for all study materials", gradient: "from-blue-500 to-blue-600" },
                { icon: Brain, title: "AI Study Tools", desc: "Summarizer, quiz generator, flashcards", gradient: "from-purple-500 to-purple-600" },
                { icon: CheckSquare, title: "Task Manager", desc: "Track assignments and deadlines", gradient: "from-green-500 to-green-600" },
                { icon: MessageCircle, title: "Real-time Chat", desc: "Student-to-student and teacher messaging", gradient: "from-orange-500 to-orange-600" },
                { icon: Trophy, title: "Leaderboards", desc: "Gamification with XP and study streaks", gradient: "from-yellow-500 to-yellow-600" },
                { icon: Bell, title: "Notice Board", desc: "Instant announcements to students", gradient: "from-red-500 to-red-600" },
              ].map((feature, i) => (
                <Card key={i} className="group p-6 hover:shadow-2xl transition-all hover:scale-[1.02] duration-300 border-2 hover:border-primary/30 overflow-hidden relative">
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
                  <div className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative py-24 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-blue-600" />
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

          <div className="max-w-4xl mx-auto text-center relative z-10 space-y-8 text-white">
            <h2 className="text-4xl md:text-5xl font-bold">Ready to Transform Your Institute?</h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Transform your institute with modern learning technology. See how NeuroNxt can help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/pricing">
                <Button size="lg" variant="secondary" className="h-14 px-10 text-lg shadow-2xl hover:scale-105 transition-transform">
                  View Pricing Plans
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
            <p className="text-sm opacity-75 pt-4">
              Trusted by leading educational institutions • Enterprise support included
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 border-t">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-lg font-bold">NeuroNxt</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  The complete learning platform for modern educational institutions.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Platform</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
                  <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Security</a></li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Support</a></li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Legal</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-primary transition-colors">Privacy</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Terms</a></li>
                </ul>
              </div>
            </div>
            <div className="pt-8 border-t text-center text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} NeuroNxt. All rights reserved.
            </div>
          </div>
        </footer>

        {user && (
          <OnboardingModal
            isOpen={showOnboarding}
            userId={user.id}
            currentFullName={user.user_metadata?.full_name || ""}
            onComplete={handleOnboardingComplete}
          />
        )}
      </main>
    </div>
  )
}
