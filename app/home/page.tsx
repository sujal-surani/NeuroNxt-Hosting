"use client"

import { useState } from "react"
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
  Check,
  Zap,
  Shield,
  BarChart3,
  Clock,
  Globe
} from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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
              <Link href="#platform" onClick={() => setIsMenuOpen(false)} className="text-sm font-medium p-2 hover:bg-muted rounded">Platform</Link>
              <Link href="#benefits" onClick={() => setIsMenuOpen(false)} className="text-sm font-medium p-2 hover:bg-muted rounded">Benefits</Link>
              <Link href="#features" onClick={() => setIsMenuOpen(false)} className="text-sm font-medium p-2 hover:bg-muted rounded">Features</Link>
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

        {/* Hero */}
        <section className="relative py-24 md:py-32 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background -z-10" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl -z-10" />

          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <Badge className="px-4 py-1.5 bg-primary/10 text-primary border-primary/20">
                  <Zap className="w-3 h-3 mr-2 inline-block" />
                  AI-Powered Learning Platform
                </Badge>

                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
                  The Complete
                  <span className="block text-primary mt-3 bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">Learning Platform</span>
                  <span className="block text-foreground/70 text-3xl md:text-4xl lg:text-5xl mt-4 font-semibold">for Your Institute</span>
                </h1>

                <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-xl">
                  Empower your students with AI-powered study tools, collaborative learning, and seamless communication—all in one modern platform.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Link href="/pricing">
                    <Button size="lg" className="h-14 px-8 text-lg shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all">
                      View Pricing Plans
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Link href="#platform">
                    <Button size="lg" variant="outline" className="h-14 px-8 text-lg">
                      See How It Works
                    </Button>
                  </Link>
                </div>

                <div className="flex items-center gap-8 pt-8 border-t">
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-muted-foreground">Enterprise-grade security</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-muted-foreground">24/7 dedicated support</span>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-3xl blur-3xl" />
                <div className="relative rounded-2xl border bg-card shadow-2xl overflow-hidden">
                  <img src="/neuronxt-dashboard-screenshot.png" alt="NeuroNxt Platform" className="w-full" />
                </div>
              </div>
            </div>
          </div>
        </section>



        {/* Benefits */}
        <section id="benefits" className="py-24 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <Badge className="mb-4 px-4 py-1.5 bg-primary/10 text-primary border-primary/20">Why Choose NeuroNxt</Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Built for Modern Education</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Everything your institute needs to enhance student learning and streamline operations
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-8 hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 hover:scale-[1.02]">
                <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-6">
                  <BarChart3 className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Boost Student Engagement</h3>
                <p className="text-muted-foreground leading-relaxed">
                  AI-powered tools, gamification, and social features keep students motivated and actively learning.
                </p>
              </Card>

              <Card className="p-8 hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 hover:scale-[1.02]">
                <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mb-6">
                  <Clock className="w-7 h-7 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Save Time & Resources</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Centralized management, automated notices, and digital notes reduce administrative workload.
                </p>
              </Card>

              <Card className="p-8 hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 hover:scale-[1.02]">
                <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mb-6">
                  <Shield className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Secure & Scalable</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Enterprise-grade security with role-based access. Scales from 100 to 10,000+ students effortlessly.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Platform Overview */}
        <section id="platform" className="py-24 px-4 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <Badge className="mb-4 px-4 py-1.5 bg-primary/10 text-primary border-primary/20">Complete Platform</Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Everything in One Place</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                A comprehensive ecosystem for students, teachers, and administrators
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
              <div className="space-y-6">
                <h3 className="text-3xl font-bold">For Your Students</h3>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Digital Notes Library</h4>
                      <p className="text-sm text-muted-foreground">Access and share study materials organized by subject and semester</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                      <Brain className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">AI Study Assistant</h4>
                      <p className="text-sm text-muted-foreground">Summarize texts, generate quizzes, create flashcards automatically</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                      <MessageCircle className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Peer Collaboration</h4>
                      <p className="text-sm text-muted-foreground">Chat with classmates, form study groups, connect with teachers</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                      <Trophy className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Gamified Learning</h4>
                      <p className="text-sm text-muted-foreground">Earn XP, track study streaks, compete on leaderboards</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary/5 to-transparent rounded-2xl p-8 border">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-background p-6 rounded-xl shadow-sm text-center">
                    <BookOpen className="w-10 h-10 mx-auto text-blue-500 mb-3" />
                    <div className="font-bold">Notes Hub</div>
                  </div>
                  <div className="bg-background p-6 rounded-xl shadow-sm text-center">
                    <Brain className="w-10 h-10 mx-auto text-purple-500 mb-3" />
                    <div className="font-bold">AI Tools</div>
                  </div>
                  <div className="bg-background p-6 rounded-xl shadow-sm text-center">
                    <CheckSquare className="w-10 h-10 mx-auto text-green-500 mb-3" />
                    <div className="font-bold">Tasks</div>
                  </div>
                  <div className="bg-background p-6 rounded-xl shadow-sm text-center">
                    <Trophy className="w-10 h-10 mx-auto text-yellow-500 mb-3" />
                    <div className="font-bold">Leaderboard</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl p-8 border">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-background p-6 rounded-xl shadow-sm">
                    <Users className="w-10 h-10 text-blue-500 mb-3" />
                    <div className="font-bold text-sm">User Management</div>
                  </div>
                  <div className="bg-background p-6 rounded-xl shadow-sm">
                    <Bell className="w-10 h-10 text-orange-500 mb-3" />
                    <div className="font-bold text-sm">Broadcast Notices</div>
                  </div>
                  <div className="bg-background p-6 rounded-xl shadow-sm col-span-2">
                    <Globe className="w-10 h-10 text-indigo-500 mb-3" />
                    <div className="font-bold text-sm">Multi-Branch Support</div>
                  </div>
                </div>
              </div>

              <div className="space-y-6 order-1 md:order-2">
                <h3 className="text-3xl font-bold">For Your Administrators</h3>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Centralized Management</h4>
                      <p className="text-sm text-muted-foreground">Add/remove students and teachers, manage multiple branches from one dashboard</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                      <Bell className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Instant Communication</h4>
                      <p className="text-sm text-muted-foreground">Send notices to specific branches, semesters, or entire institute</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Content Distribution</h4>
                      <p className="text-sm text-muted-foreground">Teachers upload notes directly, students access instantly</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <Badge className="mb-4 px-4 py-1.5 bg-primary/10 text-primary border-primary/20">Platform Features</Badge>
              <h2 className="text-4xl md:text-5xl font-bold">Powerful Tools for Learning</h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: BookOpen, title: "Notes Hub", desc: "Centralized library for all study materials", color: "blue" },
                { icon: Brain, title: "AI Study Tools", desc: "Summarizer, quiz generator, flashcards", color: "purple" },
                { icon: CheckSquare, title: "Task Manager", desc: "Track assignments and deadlines", color: "green" },
                { icon: MessageCircle, title: "Real-time Chat", desc: "Student-to-student and teacher messaging", color: "orange" },
                { icon: Trophy, title: "Leaderboards", desc: "Gamification with XP and study streaks", color: "yellow" },
                { icon: Bell, title: "Notice Board", desc: "Instant announcements to students", color: "red" },
              ].map((feature, i) => (
                <Card key={i} className="p-6 hover:shadow-lg transition-all hover:scale-[1.02] duration-300">
                  <div className={`w-12 h-12 bg-${feature.color}-100 dark:bg-${feature.color}-900/30 rounded-xl flex items-center justify-center mb-4`}>
                    <feature.icon className={`w-6 h-6 text-${feature.color}-600 dark:text-${feature.color}-400`} />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-4 bg-gradient-to-br from-primary to-primary/80 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
          <div className="max-w-4xl mx-auto text-center relative z-10 space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold">Ready to Transform Your Institute?</h2>
            <p className="text-xl opacity-90">
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
                  <li><Link href="#features" className="hover:text-primary">Features</Link></li>
                  <li><Link href="/pricing" className="hover:text-primary">Pricing</Link></li>
                  <li><Link href="#" className="hover:text-primary">Security</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link href="#" className="hover:text-primary">About</Link></li>
                  <li><Link href="#" className="hover:text-primary">Contact</Link></li>
                  <li><Link href="#" className="hover:text-primary">Support</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Legal</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link href="#" className="hover:text-primary">Privacy</Link></li>
                  <li><Link href="#" className="hover:text-primary">Terms</Link></li>
                </ul>
              </div>
            </div>
            <div className="pt-8 border-t text-center text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} NeuroNxt. All rights reserved.
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
