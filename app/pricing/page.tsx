"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, Menu, X, CheckCircle, Sparkles, Clock, Brain, ArrowRight, Star } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function PricingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/30">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background -z-10" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-primary/20">
              <Brain className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">NeuroNxt</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors hover:scale-105 transform duration-200">Features</Link>
            <Link href="/#platform" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors hover:scale-105 transform duration-200">Platform</Link>
            <Link href="/pricing" className="text-sm font-medium text-primary hover:text-primary transition-colors hover:scale-105 transform duration-200">Pricing</Link>
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

      <main className="pt-32 pb-20">
        {/* Hero Section */}
        <section className="relative px-6">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[150px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[150px] animate-pulse" />

          <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary hover:bg-primary/10 transition-colors cursor-default">
              <Star className="h-4 w-4 text-inherit fill-primary/20" />
              <span className="text-sm font-semibold tracking-wide">Flexible Pricing</span>
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tighter text-foreground">
              <span className="block drop-shadow-sm">Simple Pricing for</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-neutral-800 via-slate-700 to-neutral-500 drop-shadow-sm pb-2">Your Institution</span>
            </h1>

            <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light">
              Choose the perfect plan for your educational institution. All plans include core features with scalable options.
            </p>
          </div>
        </section>

        {/* Status Section */}
        <section className="relative py-20 px-6">
          <div className="relative z-10 max-w-5xl mx-auto">
            <Card className="group relative overflow-hidden bg-card border-border/50 hover:border-slate-500/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/5">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative p-8 text-center space-y-6">
                <div className="w-16 h-16 mx-auto bg-secondary rounded-full flex items-center justify-center border border-border/50 group-hover:scale-110 transition-transform duration-500">
                  <Clock className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>

                <div className="space-y-4">
                  <Badge variant="secondary" className="px-3 py-1 bg-primary/5 text-primary border-primary/10 text-xs">
                    Coming Soon
                  </Badge>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">Pricing Plans Under Development</h2>
                  <p className="text-base text-muted-foreground max-w-2xl mx-auto">
                    Our team is carefully crafting pricing plans that provide exceptional value for institutions.
                    We want to ensure our pricing is fair, transparent, and accessible to all educational organizations.
                  </p>
                </div>

                {/* Plan Preview Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto pt-6">
                  {[
                    { icon: Sparkles, title: "Premium Plans", desc: "Advanced features and unlimited access" },
                    { icon: Brain, title: "Enterprise", desc: "Custom solutions for large universities" }
                  ].map((plan, i) => (
                    <Card key={i} className="relative overflow-hidden bg-background/50 border-border/50 hover:border-primary/20 transition-all hover:bg-background hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5">
                      <div className="relative p-4 space-y-3">
                        <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center mx-auto">
                          <plan.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <h3 className="font-bold text-foreground text-base">{plan.title}</h3>
                        <p className="text-xs text-muted-foreground">{plan.desc}</p>
                      </div>
                    </Card>
                  ))}
                </div>

                <div className="space-y-6 pt-8 border-t border-border/50">
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Expected Launch:</strong> Q2 2025
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      size="lg"
                      onClick={() => toast.info("Pricing plans will be available in Q2 2025.")}
                      className="h-14 px-8 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 group font-semibold"
                    >
                      Get Early Access
                      <Sparkles className="ml-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="relative py-20 px-6 overflow-hidden bg-card border-y border-border/50">
          <div className="relative z-10 max-w-2xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary">
              <Sparkles className="h-4 w-4 text-inherit" />
              <span className="text-sm font-semibold">Stay Updated</span>
            </div>

            <h3 className="text-3xl font-bold text-foreground">Be the First to Know</h3>
            <p className="text-muted-foreground text-lg">
              Get notified when our pricing plans are available and receive exclusive early-bird discounts.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground shadow-sm"
              />
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-6 h-auto">
                Notify Me
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-6 bg-background">
          <div className="mx-auto max-w-7xl">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
                    <Brain className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <span className="text-lg font-bold text-foreground">NeuroNxt</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Transforming educational institutions with AI-powered learning platforms.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-4 text-sm text-foreground">Platform</h4>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li><Link href="/" className="hover:text-primary transition-colors">Features</Link></li>
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
      </main>
    </div>
  )
}
