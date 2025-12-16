"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, Construction, Clock, Sparkles, CheckCircle, Menu, X } from "lucide-react"
import Link from "next/link"

export default function PricingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-primary">NeuroNxt</span>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <Link href="/#features" className="text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link href="/#stats" className="text-muted-foreground hover:text-foreground transition-colors">
                Impact
              </Link>
              <Link href="/pricing" className="text-foreground font-medium">
                Pricing
              </Link>
              <Link href="/auth/login">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/auth/register">
                <Button>Get Started</Button>
              </Link>
            </div>

            <div className="md:hidden">
              <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {isMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <div className="flex flex-col space-y-4">
                <Link href="/#features" className="text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </Link>
                <Link href="/#stats" className="text-muted-foreground hover:text-foreground transition-colors">
                  Impact
                </Link>
                <Link href="/pricing" className="text-foreground font-medium">
                  Pricing
                </Link>
                <div className="flex flex-col space-y-2 pt-4">
                  <Link href="/auth/login">
                    <Button variant="outline" className="w-full bg-transparent">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button className="w-full">Get Started</Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <Badge variant="secondary" className="px-4 py-2">
              <Construction className="w-4 h-4 mr-2" />
              Coming Soon
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold text-balance">
              Pricing Plans for <span className="text-primary">NeuroNxt</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
              We're working hard to bring you flexible pricing options that fit your learning needs and budget.
            </p>
          </div>
        </div>
      </section>

      {/* Status Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <Card className="border-2 border-dashed border-muted-foreground/20 bg-muted/10">
            <CardContent className="p-12 text-center space-y-8">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Clock className="w-12 h-12 text-primary" />
              </div>

              <div className="space-y-4">
                <h2 className="text-3xl font-bold">Pricing Plans Under Development</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Our team is carefully crafting pricing plans that provide exceptional value for students, educators,
                  and institutions. We want to ensure our pricing is fair, transparent, and accessible to learners
                  everywhere.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mx-auto">
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-semibold">Free Tier</h3>
                  <p className="text-sm text-muted-foreground">
                    Basic AI study tools and note-taking features for individual learners
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto">
                    <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold">Premium Plans</h3>
                  <p className="text-sm text-muted-foreground">
                    Advanced AI features, unlimited storage, and collaboration tools
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mx-auto">
                    <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-semibold">Institution Plans</h3>
                  <p className="text-sm text-muted-foreground">
                    Custom solutions for schools, universities, and educational organizations
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-muted-foreground">
                  <strong>Expected Launch:</strong> Q2 2024
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/auth/register">
                    <Button size="lg" className="text-lg px-8 py-6">
                      Get Early Access
                      <Sparkles className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-transparent">
                      Learn More About Features
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h3 className="text-2xl font-bold">Stay Updated</h3>
          <p className="text-muted-foreground">
            Be the first to know when our pricing plans are available and get exclusive early-bird discounts.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button>Notify Me</Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t bg-muted/20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-primary">NeuroNxt</span>
          </div>
          <p className="text-muted-foreground text-sm">
            &copy; 2024 NeuroNxt. All rights reserved. Built for students, by students.
          </p>
        </div>
      </footer>
    </div>
  )
}
