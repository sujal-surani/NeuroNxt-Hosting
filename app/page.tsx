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
  Star,
  Bookmark
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
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/30">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background -z-10" />

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrollY > 50 ? 'bg-background/80 backdrop-blur-xl border-b border-border/50' : ''}`}>
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-primary/20">
              <Brain className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">NeuroNxt</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {[
              { label: 'Features', action: 'scroll', target: 'features' },
              { label: 'Platform', action: 'scroll', target: 'platform' },
              { label: 'Pricing', action: 'route', target: '/pricing' },
              { label: 'Join', action: 'scroll', target: 'join' }
            ].map((item) => (
              item.action === 'scroll' ? (
                <button
                  key={item.label}
                  onClick={() => document.getElementById(item.target)?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors hover:scale-105 transform duration-200"
                >
                  {item.label}
                </button>
              ) : (
                <Link
                  key={item.label}
                  href={item.target}
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors hover:scale-105 transform duration-200"
                >
                  {item.label}
                </Link>
              )
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:shadow-primary/30 font-semibold px-6">
                Login for students
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Split Hero */}
        <section className="min-h-screen relative flex items-center pt-16 pb-8 overflow-hidden">
          {/* Grid Background */}
          {/* Gradient Orbs */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[150px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[150px] animate-pulse" />

          <div className="relative z-10 mx-auto max-w-7xl px-6 w-full">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="space-y-8" style={{ transform: `translateY(${scrollY * 0.1}px)` }}>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/50 bg-secondary/50 backdrop-blur-sm shadow-sm">
                  <Star className="h-3 w-3 text-foreground fill-foreground" />
                  <span className="text-xs font-medium text-foreground tracking-wide uppercase">AI-Powered Platform</span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-7xl font-black leading-[0.9] tracking-tighter text-foreground">
                  <span className="block text-foreground drop-shadow-sm">Transform Your</span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-neutral-800 via-slate-700 to-neutral-500 drop-shadow-sm pb-2">Institute</span>
                  <span className="block text-foreground">With NeuroNxt</span>
                </h1>

                <p className="text-lg text-muted-foreground max-w-lg leading-relaxed font-light">
                  A comprehensive platform for educational institutions combining AI study tools, task management, real-time collaboration, and gamification.
                </p>

                <div className="flex flex-wrap items-center gap-4">
                  <Link href="/pricing">
                    <Button size="lg" className="h-14 px-8 bg-primary text-primary-foreground hover:bg-primary/90 border-0 shadow-lg shadow-primary/20 group font-semibold transition-all duration-300 hover:scale-105">
                      View Pricing
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/auth/login">
                    <Button size="lg" variant="outline" className="h-14 px-8 border-border bg-white/50 backdrop-blur-md hover:bg-white text-foreground font-medium shadow-sm transition-all duration-300 hover:border-primary/20 hover:scale-105 hover:shadow-md">
                      Sign In
                    </Button>
                  </Link>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-8 pt-4">
                  <div>
                    <div className="text-2xl font-bold text-foreground">10+</div>
                    <div className="text-sm text-muted-foreground">AI Features</div>
                  </div>
                  <div className="h-8 w-px bg-border/50" />
                  <div>
                    <div className="text-2xl font-bold text-foreground">99.9%</div>
                    <div className="text-sm text-muted-foreground">Uptime</div>
                  </div>
                  <div className="h-8 w-px bg-border/50" />
                  <div>
                    <div className="text-2xl font-bold text-foreground">24/7</div>
                    <div className="text-sm text-muted-foreground">Support</div>
                  </div>
                </div>
              </div>

              {/* Right - Floating Cards */}
              <div className="relative h-[600px] hidden lg:block perspective-1000" style={{ transform: `translateY(${scrollY * -0.05}px)` }}>
                <div className="absolute top-0 right-0 w-80 h-48 bg-card/60 backdrop-blur-2xl rounded-2xl border border-border/50 p-6 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] hover:scale-105 transition-all duration-500 cursor-default hover:border-primary/50 group" style={{ transform: 'rotate(-6deg)' }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                  <Brain className="h-12 w-12 text-muted-foreground/80 mb-4 drop-shadow-sm group-hover:text-primary transition-colors" />
                  <div className="text-xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors">AI Study Assistant</div>
                  <div className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Automated summaries & quizzes</div>
                </div>

                <div className="absolute top-32 right-20 w-72 h-44 bg-card/60 backdrop-blur-2xl rounded-2xl border border-border/50 p-6 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] hover:scale-105 transition-all duration-500 cursor-default hover:border-primary/50 group" style={{ transform: 'rotate(3deg)' }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                  <BookOpen className="h-12 w-12 text-muted-foreground/80 mb-4 group-hover:text-primary transition-colors" />
                  <div className="text-xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors">Smart Notes Hub</div>
                  <div className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Centralized study materials</div>
                </div>

                <div className="absolute top-72 right-10 w-80 h-48 bg-card/60 backdrop-blur-2xl rounded-2xl border border-border/50 p-6 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] hover:scale-105 transition-all duration-500 cursor-default hover:border-primary/50 group" style={{ transform: 'rotate(-3deg)' }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                  <CheckSquare className="h-12 w-12 text-muted-foreground/80 mb-4 group-hover:text-primary transition-colors" />
                  <div className="text-xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors">Task Management</div>
                  <div className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Track deadlines & projects</div>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
            <span className="text-xs text-muted-foreground">Scroll to explore</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>
        </section>

        {/* Features - Masonry Grid */}
        <section id="features" className="py-20 px-6 relative bg-card">
          <div className="relative z-10 mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-primary hover:bg-primary/10 transition-colors cursor-default mb-4">
                <Sparkles className="h-3 w-3 text-inherit" />
                <span className="text-sm font-semibold tracking-wide">Student Features</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                Tools That Make Your
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-neutral-900 via-slate-800 to-neutral-500 drop-shadow-sm">Students Smarter</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Empower your students with cutting-edge tools designed to enhance learning outcomes and boost academic performance
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: Brain, title: "AI Study Tools", desc: "Students get automated text summarization, quiz generation, flashcards, and YouTube summarizers", size: "large", iconBg: "bg-secondary", iconColor: "text-muted-foreground" },
                { icon: BookOpen, title: "Notes Hub", desc: "Students upload, organize, and share study materials by subject", size: "normal", iconBg: "bg-secondary", iconColor: "text-muted-foreground" },
                { icon: CheckSquare, title: "Task Manager", desc: "Students track assignments, projects, and exam deadlines", size: "normal", iconBg: "bg-secondary", iconColor: "text-muted-foreground" },
                { icon: MessageCircle, title: "Real-time Chat", desc: "Students collaborate through messaging and study groups", size: "normal", iconBg: "bg-secondary", iconColor: "text-muted-foreground" },
                { icon: Bookmark, title: "Saved Resources", desc: "Students bookmark and organize important notes, links, and study materials for quick access", size: "normal", iconBg: "bg-secondary", iconColor: "text-muted-foreground" },
                { icon: Trophy, title: "Gamified Learning", desc: "Students earn XP points, climb leaderboards, maintain study streaks", size: "large", iconBg: "bg-secondary", iconColor: "text-muted-foreground" },
                { icon: Bell, title: "Notices", desc: "Students receive important announcements from teachers and admins", size: "normal", iconBg: "bg-secondary", iconColor: "text-muted-foreground" },
                { icon: Users, title: "Social Network", desc: "Students connect and network with peers across your institute", size: "normal", iconBg: "bg-secondary", iconColor: "text-muted-foreground" },
                { icon: BarChart3, title: "Dashboard", desc: "Students track study streaks, upcoming tasks, and progress", size: "normal", iconBg: "bg-secondary", iconColor: "text-muted-foreground" },
                { icon: Search, title: "Smart Search", desc: "Students quickly find notes, people, and resources", size: "normal", iconBg: "bg-secondary", iconColor: "text-muted-foreground" }
              ].map((feature, i) => (
                <Card
                  key={i}
                  className={`group relative overflow-hidden bg-background border-border/50 hover:border-primary/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 cursor-default ${feature.size === 'large' ? 'md:col-span-2' : ''}`}
                  style={{ minHeight: feature.size === 'large' ? '300px' : '240px' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative p-8 h-full flex flex-col justify-between z-10">
                    <div>
                      <div className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl ${feature.iconBg} mb-6 group-hover:scale-110 transition-transform shadow-sm border border-border/20`}>
                        <feature.icon className={`h-8 w-8 ${feature.iconColor} transition-colors`} />
                      </div>
                      <h3 className="text-xl font-bold mb-3 text-foreground">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.desc}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Platform Section */}
        <section id="platform" className="py-20 px-6 relative overflow-hidden bg-secondary/30">
          <div className="absolute inset-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-primary/5 rounded-full blur-[150px]" />
          </div>

          <div className="relative z-10 mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                Built For
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-neutral-900 via-slate-800 to-neutral-500 drop-shadow-sm">Every Stakeholder</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Tailored experiences for students, teachers, and administrators
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Students */}
              <div className="group relative p-8 rounded-3xl bg-card/60 border border-border/50 hover:border-slate-500/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-slate-500/10 hover:bg-secondary/40">
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-500/10 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
                <div className="relative space-y-4">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-slate-400">
                    <Users className="h-7 w-7 text-current" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">For Students</h3>
                  <p className="text-muted-foreground text-sm">Everything to excel in studies</p>
                  <div className="space-y-2 pt-2">
                    {["Access digital notes", "AI study tools", "Track assignments", "Chat with peers", "Earn XP & compete", "Social networking"].map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="h-1 w-1 rounded-full bg-slate-500/50" />
                        <span className="text-sm text-muted-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Teachers */}
              <div className="group relative p-8 rounded-3xl bg-card/60 border border-border/50 hover:border-slate-500/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-slate-500/10 hover:bg-secondary/40">
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-500/10 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
                <div className="relative space-y-4">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-slate-400">
                    <UserPlus className="h-7 w-7 text-current" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">For Teachers</h3>
                  <p className="text-muted-foreground text-sm">Tools to engage students</p>
                  <div className="space-y-2 pt-2">
                    {["Upload study materials", "Send notices", "Chat with students", "Share resources"].map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="h-1 w-1 rounded-full bg-slate-500/50" />
                        <span className="text-sm text-muted-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Admins */}
              <div className="group relative p-8 rounded-3xl bg-card/60 border border-border/50 hover:border-slate-500/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-slate-500/10 hover:bg-secondary/40">
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-500/10 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
                <div className="relative space-y-4">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-slate-400">
                    <Building2 className="h-7 w-7 text-current" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">For Institutes</h3>
                  <p className="text-muted-foreground text-sm">Administer & analyze</p>
                  <div className="space-y-2 pt-2">
                    {["Student verification", "Send specific notices", "User management", "System analytics"].map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="h-1 w-1 rounded-full bg-slate-500/50" />
                        <span className="text-sm text-muted-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="join" className="py-20 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />

          <div className="relative z-10 mx-auto max-w-4xl text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary hover:bg-primary/10 transition-colors cursor-default">
              <Sparkles className="h-4 w-4 text-inherit" />
              <span className="text-sm font-semibold tracking-wide">Start Your Journey Today</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-black leading-tight text-foreground">
              <span className="block drop-shadow-sm">Ready to Transform</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-neutral-900 via-slate-800 to-neutral-500 drop-shadow-sm">
                Your Institution?
              </span>
            </h2>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto drop-shadow-sm">
              Join forward-thinking institutes using NeuroNxt to revolutionize education and boost student success
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <Link href="/pricing">
                <Button size="lg" className="h-16 px-12 bg-primary text-primary-foreground hover:bg-primary/90 border-0 shadow-lg shadow-primary/20 group text-lg font-semibold transition-all duration-300 hover:scale-105">
                  View Pricing
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-6 border-t border-border bg-background">
          <div className="mx-auto max-w-7xl">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                    <Brain className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <span className="text-lg font-bold text-foreground tracking-tight">NeuroNxt</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Transforming educational institutions with AI-powered learning platforms.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-4 text-sm text-foreground">Platform</h4>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
                  <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4 text-sm text-foreground">Company</h4>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li><button type="button" className="hover:text-primary transition-colors cursor-default">About</button></li>
                  <li><button type="button" className="hover:text-primary transition-colors cursor-default">Contact</button></li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4 text-sm text-foreground">Legal</h4>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li><button type="button" className="hover:text-primary transition-colors cursor-default">Privacy</button></li>
                  <li><button type="button" className="hover:text-primary transition-colors cursor-default">Terms</button></li>
                </ul>
              </div>
            </div>

            <div className="pt-8 border-t border-border/50 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
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
