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
  Shield,
  BarChart3,
  Search,
  Sparkles,
  Zap,
  Clock,
  UserPlus,
  Share2,
  ChevronDown,
  Star
} from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [scrollY, setScrollY] = useState(0)
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

    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrollY > 50 ? 'bg-slate-950/95 backdrop-blur-xl border-b border-white/10' : ''}`}>
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">NeuroNxt</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm text-slate-300 hover:text-white transition-colors">Features</Link>
            <Link href="#platform" className="text-sm text-slate-300 hover:text-white transition-colors">Platform</Link>
            <Link href="/pricing" className="text-sm text-slate-300 hover:text-white transition-colors">Pricing</Link>
            <Link href="/auth/login">
              <Button size="sm" variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/10">Login</Button>
            </Link>
            <Link href="/pricing">
              <Button size="sm" className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 border-0 text-white">
                Start Free
              </Button>
            </Link>
          </div>

          <Button variant="ghost" size="icon" className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </nav>

      <main>

        {/* Split Hero */}
        <section className="min-h-screen relative flex items-center pt-16 pb-8 overflow-hidden">
          {/* Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

          {/* Gradient Orbs */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '10s' }} />

          <div className="relative z-10 mx-auto max-w-7xl px-6 w-full">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="space-y-6" style={{ transform: `translateY(${scrollY * 0.1}px)` }}>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-400/30 bg-cyan-500/10 backdrop-blur-sm">
                  <Star className="h-3 w-3 text-cyan-300 fill-cyan-300" />
                  <span className="text-xs font-medium text-cyan-200">AI-Powered Platform</span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-none">
                  <span className="block text-slate-400">Transform Your</span>
                  <span className="block bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">Institute</span>
                  <span className="block text-slate-400">With AI</span>
                </h1>

                <p className="text-base text-slate-200 max-w-lg leading-relaxed">
                  A comprehensive platform for educational institutions combining AI study tools, task management, real-time collaboration, and gamification to boost student engagement and academic success.
                </p>

                <div className="flex flex-wrap items-center gap-4">
                  <Link href="/pricing">
                    <Button size="lg" className="h-14 px-8 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white border-0 shadow-lg shadow-cyan-500/25 group font-semibold">
                      Request Demo
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/auth/login">
                    <Button size="lg" variant="outline" className="h-14 px-8 border-slate-700 bg-slate-900/50 hover:bg-slate-800 text-white font-semibold">
                      Sign In
                    </Button>
                  </Link>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-8 pt-4">
                  <div>
                    <div className="text-2xl font-bold text-white">10+</div>
                    <div className="text-sm text-slate-400">AI Features</div>
                  </div>
                  <div className="h-8 w-px bg-slate-700" />
                  <div>
                    <div className="text-2xl font-bold text-white">99.9%</div>
                    <div className="text-sm text-slate-400">Uptime</div>
                  </div>
                  <div className="h-8 w-px bg-slate-700" />
                  <div>
                    <div className="text-2xl font-bold text-white">24/7</div>
                    <div className="text-sm text-slate-400">Support</div>
                  </div>
                </div>
              </div>

              {/* Right - Floating Cards */}
              <div className="relative h-[600px] hidden lg:block" style={{ transform: `translateY(${scrollY * -0.05}px)` }}>
                <div className="absolute top-0 right-0 w-80 h-48 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-2xl hover:scale-105 transition-transform cursor-default" style={{ transform: 'rotate(-6deg)' }}>
                  <Brain className="h-12 w-12 text-cyan-300 mb-4" />
                  <div className="text-xl font-bold mb-2 text-white">AI Study Assistant</div>
                  <div className="text-sm text-slate-300">Automated summaries & quizzes</div>
                </div>

                <div className="absolute top-32 right-20 w-72 h-44 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-2xl hover:scale-105 transition-transform cursor-default" style={{ transform: 'rotate(3deg)' }}>
                  <Trophy className="h-12 w-12 text-purple-300 mb-4" />
                  <div className="text-xl font-bold mb-2 text-white">Leaderboards & XP</div>
                  <div className="text-sm text-slate-300">Gamified learning experience</div>
                </div>

                <div className="absolute top-72 right-10 w-80 h-48 bg-gradient-to-br from-emerald-500/20 to-green-500/20 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-2xl hover:scale-105 transition-transform cursor-default" style={{ transform: 'rotate(-3deg)' }}>
                  <MessageCircle className="h-12 w-12 text-emerald-300 mb-4" />
                  <div className="text-xl font-bold mb-2 text-white">Real-time Chat</div>
                  <div className="text-sm text-slate-300">Connect with peers instantly</div>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
            <span className="text-xs text-slate-400">Scroll to explore</span>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </div>
        </section>

        {/* Features - Masonry Grid */}
        <section id="features" className="py-20 px-6 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />

          <div className="relative z-10 mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <div className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-sm font-medium mb-4">
                Student Features
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                Tools That Make Your
                <span className="block bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">Students Smarter</span>
              </h2>
              <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                Empower your students with cutting-edge tools designed to enhance learning outcomes and boost academic performance
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: Brain, title: "AI Study Tools", desc: "Students get automated text summarization, quiz generation, flashcards, and YouTube summarizers", size: "large", iconBg: "bg-white/10", iconColor: "text-cyan-300" },
                { icon: BookOpen, title: "Notes Hub", desc: "Students upload, organize, and share study materials by subject", size: "normal", iconBg: "bg-white/10", iconColor: "text-blue-300" },
                { icon: CheckSquare, title: "Task Manager", desc: "Students track assignments, projects, and exam deadlines", size: "normal", iconBg: "bg-white/10", iconColor: "text-emerald-300" },
                { icon: MessageCircle, title: "Real-time Chat", desc: "Students collaborate through messaging and study groups", size: "normal", iconBg: "bg-white/10", iconColor: "text-purple-300" },
                { icon: Trophy, title: "Gamified Learning", desc: "Students earn XP points, climb leaderboards, maintain study streaks", size: "large", iconBg: "bg-white/10", iconColor: "text-amber-300" },
                { icon: Bell, title: "Notices", desc: "Students receive important announcements from teachers and admins", size: "normal", iconBg: "bg-white/10", iconColor: "text-red-300" },
                { icon: Users, title: "Social Network", desc: "Students connect and network with peers across your institute", size: "normal", iconBg: "bg-white/10", iconColor: "text-indigo-300" },
                { icon: BarChart3, title: "Dashboard", desc: "Students track study streaks, upcoming tasks, and progress", size: "normal", iconBg: "bg-white/10", iconColor: "text-violet-300" },
                { icon: Search, title: "Smart Search", desc: "Students quickly find notes, people, and resources", size: "normal", iconBg: "bg-white/10", iconColor: "text-slate-300" }
              ].map((feature, i) => (
                <Card
                  key={i}
                  className={`group relative overflow-hidden bg-slate-900/50 backdrop-blur-sm border-slate-800 hover:bg-slate-800/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl cursor-default ${feature.size === 'large' ? 'md:col-span-2' : ''}`}
                  style={{ minHeight: feature.size === 'large' ? '300px' : '240px' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative p-8 h-full flex flex-col justify-between">
                    <div>
                      <div className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl ${feature.iconBg} mb-6 group-hover:scale-110 transition-transform shadow-xl`}>
                        <feature.icon className={`h-8 w-8 ${feature.iconColor}`} />
                      </div>
                      <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                      <p className="text-slate-300">{feature.desc}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Platform Section */}
        <section id="platform" className="py-20 px-6 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-cyan-500/5 rounded-full blur-[150px]" />
          </div>

          <div className="relative z-10 mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                Built For
                <span className="block bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">Every Stakeholder</span>
              </h2>
              <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                Tailored experiences for students, teachers, and administrators
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Students */}
              <div className="group relative p-8 rounded-3xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-slate-800 hover:border-cyan-500/30 transition-all hover:shadow-2xl hover:shadow-cyan-500/20">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
                <div className="relative space-y-4">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/20">
                    <Users className="h-7 w-7 text-cyan-300" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">For Students</h3>
                  <p className="text-slate-300 text-sm">Everything to excel in studies</p>
                  <div className="space-y-2 pt-2">
                    {["Access digital notes", "AI study tools", "Track assignments", "Chat with peers", "Earn XP & compete", "Social networking"].map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="h-1 w-1 rounded-full bg-cyan-400" />
                        <span className="text-sm text-slate-200">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Teachers */}
              <div className="group relative p-8 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-slate-800 hover:border-emerald-500/30 transition-all hover:shadow-2xl hover:shadow-emerald-500/20">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
                <div className="relative space-y-4">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20">
                    <UserPlus className="h-7 w-7 text-emerald-300" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">For Teachers</h3>
                  <p className="text-slate-300 text-sm">Tools to engage students</p>
                  <div className="space-y-2 pt-2">
                    {["Upload study materials", "Send notices", "Chat with students", "Create study groups", "Share resources", "Monitor engagement"].map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="h-1 w-1 rounded-full bg-emerald-400" />
                        <span className="text-sm text-slate-200">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Admins */}
              <div className="group relative p-8 rounded-3xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-slate-800 hover:border-purple-500/30 transition-all hover:shadow-2xl hover:shadow-purple-500/20">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
                <div className="relative space-y-4">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/20">
                    <Building2 className="h-7 w-7 text-purple-300" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">For Administrators</h3>
                  <p className="text-slate-300 text-sm">Powerful management</p>
                  <div className="space-y-2 pt-2">
                    {["Manage all users", "Multi-branch support", "Send announcements", "Role-based access", "Platform analytics", "Full control"].map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="h-1 w-1 rounded-full bg-purple-400" />
                        <span className="text-sm text-slate-200">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-purple-500/20" />
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />

          <div className="relative z-10 mx-auto max-w-4xl text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-cyan-300" />
              <span className="text-sm font-medium text-slate-200">Start Your Journey Today</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-black leading-tight text-white">
              <span className="block">Ready to Transform</span>
              <span className="block bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">
                Your Institution?
              </span>
            </h2>

            <p className="text-lg text-slate-200 max-w-2xl mx-auto">
              Join forward-thinking institutes using NeuroNxt to revolutionize education and boost student success
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <Link href="/pricing">
                <Button size="lg" className="h-16 px-12 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white border-0 shadow-2xl shadow-cyan-500/25 group text-lg font-semibold">
                  Request a Demo
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-6 border-t border-slate-800">
          <div className="mx-auto max-w-7xl">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                    <Building2 className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-lg font-bold text-white">NeuroNxt</span>
                </div>
                <p className="text-sm text-slate-400">
                  Empowering students with AI-powered learning tools.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-4 text-sm text-white">Platform</h4>
                <ul className="space-y-3 text-sm text-slate-400">
                  <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                  <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4 text-sm text-white">Company</h4>
                <ul className="space-y-3 text-sm text-slate-400">
                  <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4 text-sm text-white">Legal</h4>
                <ul className="space-y-3 text-sm text-slate-400">
                  <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                </ul>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-400">
              <span>&copy; {new Date().getFullYear()} NeuroNxt. All rights reserved.</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>System Online</span>
              </div>
            </div>
          </div>
        </footer>

        {user && (
          <OnboardingModal
            isOpen={showOnboarding}
            userId={user.id}
            currentFullName={user.user_metadata?.full_name || ""}
            onComplete={() => setShowOnboarding(false)}
          />
        )}
      </main>
    </div>
  )
}
