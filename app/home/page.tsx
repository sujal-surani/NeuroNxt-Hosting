"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Brain,
  BookOpen,
  Users,
  MessageSquare,
  Trophy,
  Search,
  Sparkles,
  ArrowRight,
  Menu,
  X,
  TrendingUp,
  Clock,
  Target,
} from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  const features = [
    {
      icon: Brain,
      title: "AI Study Assistant",
      description: "Get personalized help with your studies using advanced AI technology",
    },
    {
      icon: BookOpen,
      title: "Smart Notes Hub",
      description: "Organize, share, and discover study materials with intelligent categorization",
    },
    {
      icon: Users,
      title: "Collaborative Learning",
      description: "Connect with classmates and study together in real-time",
    },
    {
      icon: MessageSquare,
      title: "Interactive Chat",
      description: "Discuss topics, ask questions, and get instant help from peers",
    },
    {
      icon: Trophy,
      title: "Gamified Learning",
      description: "Earn XP, compete on leaderboards, and track your progress",
    },
    {
      icon: Search,
      title: "Advanced Search",
      description: "Find exactly what you need with semantic and AI-powered search",
    },
  ]

  const studyStats = [
    {
      icon: TrendingUp,
      value: "85%",
      label: "Average Grade Improvement",
      description: "Students see significant grade improvements within their first semester",
    },
    {
      icon: Clock,
      value: "3.5hrs",
      label: "Time Saved Weekly",
      description: "AI-powered tools reduce study preparation time by over 50%",
    },
    {
      icon: Target,
      value: "92%",
      label: "Goal Achievement Rate",
      description: "Students successfully reach their academic targets using our platform",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <button
                onClick={scrollToTop}
                className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <Brain className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-primary">NeuroNxt</span>
              </button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#stats" className="text-muted-foreground hover:text-foreground transition-colors">
                Impact
              </a>
              <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </Link>
              <Link href="/auth/login">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/auth/register">
                <Button>Get Started</Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <div className="flex flex-col space-y-4">
                <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </a>
                <a href="#stats" className="text-muted-foreground hover:text-foreground transition-colors">
                  Impact
                </a>
                <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
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
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <Badge variant="secondary" className="px-4 py-2">
                <Sparkles className="w-4 h-4 mr-2" />
                AI-Powered Learning Platform
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-balance">
                Transform Your Learning with <span className="text-primary">NeuroNxt</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-balance">
                Experience the future of education with AI-powered study tools, collaborative learning, and intelligent
                note management designed for modern students.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="lg" className="text-lg px-8 py-6">
                  Start Learning Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-transparent">
                  Sign In
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>

            <div className="pt-8">
              <img
                src="/neuronxt-dashboard-screenshot.png"
                alt="NeuroNxt Dashboard - Complete learning platform with AI study tools, notes hub, and progress tracking"
                className="mx-auto rounded-lg shadow-2xl border max-w-4xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">Powerful Features for Modern Learning</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to excel in your studies, powered by cutting-edge AI technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Study Impact Statistics Section */}
      <section id="stats" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">Proven Learning Impact</h2>
            <p className="text-xl text-muted-foreground">
              Real results from students using NeuroNxt to transform their academic performance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {studyStats.map((stat, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow text-center">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <stat.icon className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-4xl font-bold text-primary mb-2">{stat.value}</div>
                  <h3 className="text-xl font-semibold mb-3">{stat.label}</h3>
                  <p className="text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl sm:text-4xl font-bold">Ready to Transform Your Learning?</h2>
          <p className="text-xl opacity-90">
            Join thousands of students who are already using NeuroNxt to achieve their academic goals
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 sm:px-6 lg:px-8 border-t bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            <div className="space-y-4 lg:col-span-1">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-primary">NeuroNxt</span>
              </div>
              <p className="text-muted-foreground">
                Empowering the next generation of learners with intelligent AI-powered study tools designed for academic
                excellence and lifelong success.
              </p>
            </div>

            <div className="lg:ml-8">
              <h3 className="font-semibold mb-4">About us</h3>
              <div className="space-y-3 text-muted-foreground">
                <a href="#" className="block hover:text-foreground transition-colors">
                  Our Story
                </a>
                <a href="#" className="block hover:text-foreground transition-colors">
                  Mission
                </a>
                <a href="#" className="block hover:text-foreground transition-colors">
                  Team
                </a>
                <a href="#" className="block hover:text-foreground transition-colors">
                  Careers
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Features</h3>
              <div className="space-y-3 text-muted-foreground">
                <a href="#features" className="block hover:text-foreground transition-colors">
                  AI Study Tools
                </a>
                <a href="#features" className="block hover:text-foreground transition-colors">
                  Smart Notes
                </a>
                <a href="#features" className="block hover:text-foreground transition-colors">
                  Collaboration
                </a>
                <a href="#features" className="block hover:text-foreground transition-colors">
                  Progress Tracking
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Learning Impact</h3>
              <div className="space-y-3 text-muted-foreground">
                <a href="#stats" className="block hover:text-foreground transition-colors">
                  Success Stories
                </a>
                <a href="#stats" className="block hover:text-foreground transition-colors">
                  Research
                </a>
                <a href="#stats" className="block hover:text-foreground transition-colors">
                  Case Studies
                </a>
                <a href="#stats" className="block hover:text-foreground transition-colors">
                  Impact Report
                </a>
              </div>
            </div>
          </div>

          <div className="border-t mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-muted-foreground text-sm">
                &copy; 2024 NeuroNxt. All rights reserved. Built for students, by students.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
