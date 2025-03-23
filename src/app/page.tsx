"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Brain, Sparkles, Clock, GraduationCap, Menu, X, Github, Twitter, Linkedin, Shield, Zap, Check } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuthContext } from "@/lib/contexts/AuthContext"
import { useRouter } from "next/navigation"

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter();
  const { user, loading } = useAuthContext();

  // For scroll fade-in animations
  useEffect(() => {
    const handleScroll = () => {
      const elements = document.querySelectorAll('.scrollfade-in');
      
      elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (elementTop < windowHeight * 0.9) {
          element.classList.add('visible');
        }
      });
    };
    
    // Initial check
    handleScroll();
    
    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    
    // Cleanup
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Redirect to humanize page if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.push('/humanize');
    }
  }, [loading, user, router]);

  // Show loading state if authentication is still loading
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If user is authenticated, don't show content (will redirect)
  if (user) {
    return null;
  }

  const scrollToSection = (sectionId: string) => {
    setIsMenuOpen(false)
    const element = document.getElementById(sectionId)
    if (element) {
      const headerOffset = 80 // Height of sticky header plus some padding
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Genify</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <button onClick={() => scrollToSection("features")} className="text-sm font-medium hover:text-primary transition-colors">
              Features
            </button>
            <button onClick={() => scrollToSection("testimonials")} className="text-sm font-medium hover:text-primary transition-colors">
              Testimonials
            </button>
            <button onClick={() => scrollToSection("pricing")} className="text-sm font-medium hover:text-primary transition-colors">
              Pricing
            </button>
            <div className="flex items-center space-x-3">
              <Link href="/login" passHref>
                <Button variant="ghost" size="sm" className="font-medium">
                  Log in
                </Button>
        </Link>
              <Link href="/signup" passHref>
                <Button size="sm" className="bg-black text-white hover:bg-black/90 font-medium cta-button">
                  Start Free Trial
                </Button>
        </Link>
      </div>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-2 md:hidden">
            <Link href="/login" passHref>
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-b">
            <nav className="container px-4 md:px-6 py-4 flex flex-col space-y-3">
              <button
                onClick={() => scrollToSection("features")}
                className="text-sm font-medium hover:text-primary text-left px-2 py-1.5 rounded-md hover:bg-accent"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("testimonials")}
                className="text-sm font-medium hover:text-primary text-left px-2 py-1.5 rounded-md hover:bg-accent"
              >
                Testimonials
              </button>
              <button
                onClick={() => scrollToSection("pricing")}
                className="text-sm font-medium hover:text-primary text-left px-2 py-1.5 rounded-md hover:bg-accent"
              >
                Pricing
              </button>
              <Link href="/signup" passHref className="w-full">
                <Button className="w-full bg-black text-white hover:bg-black/90" size="sm">
                  Start Free Trial
                </Button>
              </Link>
            </nav>
          </div>
        )}
      </header>
      <main className="w-full">
        {/* Hero Section */}
        <section className="container px-4 py-20 md:py-28 lg:py-36">
          <div className="flex flex-col items-center text-center space-y-8">
            <div className="space-y-6 max-w-[800px]">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                Make Your AI Writing Sound{" "}
                <span className="animated-gradient-text">
                  Human Again
                </span>
              </h1>
              <p className="mx-auto max-w-[600px] text-muted-foreground text-lg sm:text-xl leading-relaxed">
                Bypass Turnitin AI detection with a 100% success rate. <br />
                Trusted by university students across the UK.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-5 pt-4">
              <Link href="/signup" passHref>
                <Button size="lg" className="bg-black text-white hover:bg-black/90 cta-button font-medium px-8 h-12">
                  Start 7-Day Free Trial
                </Button>
              </Link>
              <Button size="lg" variant="outline" onClick={() => scrollToSection("features")} className="font-medium h-12">
                Learn More
              </Button>
            </div>
            <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span>100% success rate</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span>Used by 7,000+ students</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container px-4 py-16 md:py-24">
          <div className="text-center space-y-4 mb-16 scrollfade-in">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Why UK Students Love Genify</h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground text-lg">Powerful features to help you write better academic content and achieve the grades you deserve</p>
          </div>
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col items-center text-center p-8 space-y-5 rounded-xl border bg-card enhanced-card scrollfade-in">
              <div className="p-3 rounded-full bg-purple-100/60">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">The first in the world</h3>
              <p className="text-muted-foreground">
                Our AI is the only tool that bypasses Turnitin AI detection with a perfect success rate. Purpose-built for university students.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-8 space-y-5 rounded-xl border bg-card enhanced-card scrollfade-in">
              <div className="p-3 rounded-full bg-blue-100/60">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold">Advanced AI Humanization</h3>
              <p className="text-muted-foreground">
                Our sophisticated AI analyzes and transforms your text to match natural human writing patterns, styles, and quirks.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-8 space-y-5 rounded-xl border bg-card enhanced-card scrollfade-in">
              <div className="p-3 rounded-full bg-green-100/60">
                <GraduationCap className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold">Academic Focus</h3>
              <p className="text-muted-foreground">
                Specifically designed for academic writing, maintaining scholarly tone and structure that professors expect.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-8 space-y-5 rounded-xl border bg-card enhanced-card scrollfade-in">
              <div className="p-3 rounded-full bg-yellow-100/60">
                <Zap className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold">Lightning Fast Results</h3>
              <p className="text-muted-foreground">
                Get your humanized text in seconds, not minutes. Perfect for tight deadlines and last-minute assignments.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-8 space-y-5 rounded-xl border bg-card enhanced-card scrollfade-in">
              <div className="p-3 rounded-full bg-red-100/60">
                <Shield className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold">Complete Privacy</h3>
              <p className="text-muted-foreground">
                Your essays and content remain entirely private. We never store or share your academic work with anyone.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-8 space-y-5 rounded-xl border bg-card enhanced-card scrollfade-in">
              <div className="p-3 rounded-full bg-pink-100/60">
                <Brain className="h-8 w-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold">Smart Learning</h3>
              <p className="text-muted-foreground">
                Our AI learns from each interaction, continuously improving to deliver even more human-like results.
              </p>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="container px-4 py-16 md:py-24 bg-muted rounded-3xl my-8">
          <div className="text-center space-y-4 mb-16 scrollfade-in">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">What Students Say</h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground text-lg">Join thousands of satisfied students already using Genify to achieve academic success</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-8 rounded-xl bg-card enhanced-card scrollfade-in">
              <div className="flex items-center gap-1 text-yellow-500 mb-6">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                ))}
              </div>
              <p className="text-muted-foreground mb-6 italic leading-relaxed">
                "Genify has been a game-changer for my essays. The humanized text flows naturally and my professors
                never suspect it's AI-assisted. Couldn't recommend it more highly."
              </p>
              <div className="font-semibold text-lg">Sarah K.</div>
              <div className="text-sm text-muted-foreground">History Student, University of Manchester</div>
            </div>
            <div className="p-8 rounded-xl bg-card enhanced-card scrollfade-in">
              <div className="flex items-center gap-1 text-yellow-500 mb-6">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                ))}
              </div>
              <p className="text-muted-foreground mb-6 italic leading-relaxed">
                "I got 78% on my 2000 word essay with just 25 minutes spent, while others spent 8+ hours to get the same grade. 
                This tool is absolutely invaluable for busy students."
              </p>
              <div className="font-semibold text-lg">Michael R.</div>
              <div className="text-sm text-muted-foreground">Business Studies Student, King's College London</div>
            </div>
            <div className="p-8 rounded-xl bg-card enhanced-card scrollfade-in">
              <div className="flex items-center gap-1 text-yellow-500 mb-6">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                ))}
              </div>
              <p className="text-muted-foreground mb-6 italic leading-relaxed">
                "The free trial convinced me immediately. Now I use Genify for all my assignments. It's helped me manage my workload 
                while maintaining high grades. Best decision I've made this year."
              </p>
              <div className="font-semibold text-lg">Emma T.</div>
              <div className="text-sm text-muted-foreground">Psychology Student, University of Edinburgh</div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="container px-4 py-16 md:py-24">
          <div className="text-center space-y-4 mb-12 scrollfade-in">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Simple, Student-Friendly Pricing
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground text-lg">Start with a 7-day free trial, no credit card required</p>
          </div>
          <div className="max-w-md mx-auto">
            <div className="rounded-xl border bg-card p-8 text-center enhanced-card scrollfade-in">
              <div className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">Most Popular</div>
              <h3 className="text-2xl font-bold">Student Plan</h3>
              <div className="mt-4 flex items-baseline justify-center">
                <span className="text-5xl font-bold">£19</span>
                <span className="text-muted-foreground ml-1">/month</span>
              </div>
              <ul className="mt-8 space-y-5 text-left">
                <li className="flex items-center">
                  <div className="bg-green-100 p-1 rounded-full mr-3">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span>Works for all UK universities</span>
                </li>
                <li className="flex items-center">
                  <div className="bg-green-100 p-1 rounded-full mr-3">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span>Bypass Turnitin with 100% success rate</span>
                </li>
                <li className="flex items-center">
                  <div className="bg-green-100 p-1 rounded-full mr-3">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span>Unlimited essays and humanizations</span>
                </li>
                <li className="flex items-center">
                  <div className="bg-green-100 p-1 rounded-full mr-3">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span>Priority support 24/7</span>
                </li>
                <li className="flex items-center">
                  <div className="bg-green-100 p-1 rounded-full mr-3">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span>Cancel anytime</span>
                </li>
              </ul>
              <Link href="/signup" passHref>
                <Button className="w-full mt-8 bg-black text-white hover:bg-black/90 cta-button" size="lg">
                  Start 7-Day Free Trial
                </Button>
              </Link>
              <p className="mt-4 text-sm text-muted-foreground">No credit card required</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container px-4 py-16 md:py-24 bg-muted rounded-3xl my-8">
          <div className="max-w-2xl mx-auto text-center space-y-8 scrollfade-in">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Ready to Transform Your Writing?</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Join thousands of students who are already using Genify to improve their academic writing and 
              achieve the grades they deserve, while saving valuable time.
            </p>
            <Link href="/signup" passHref>
              <Button size="lg" className="bg-black text-white hover:bg-black/90 cta-button px-8 h-12 font-medium">
                Join 7,000+ Students Today
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="container px-4 py-6 md:py-16">
          <div className="grid grid-cols-3 gap-4 sm:gap-8 md:grid-cols-4">
            <div className="col-span-3 mb-5 md:col-span-1 md:mb-0">
              <Link href="/" className="flex items-center space-x-2 mb-2">
                <Brain className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                <span className="text-base md:text-xl font-bold">Genify</span>
              </Link>
              <p className="text-xs leading-tight md:text-sm text-muted-foreground">Making AI writing sound human again.</p>
              <Link href="/affiliate" className="mt-3 text-xs md:text-sm text-primary hover:underline inline-block font-medium">
                Earn Money by Sharing Genify on TikTok
              </Link>
            </div>
            <div>
              <h3 className="font-semibold text-xs md:text-base mb-1 md:mb-4">Product</h3>
              <ul className="space-y-1 md:space-y-3">
                <li>
                  <Link href="#features" className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-xs md:text-base mb-1 md:mb-4">Company</h3>
              <ul className="space-y-1 md:space-y-3">
                <li>
                  <Link href="#" className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-xs md:text-base mb-1 md:mb-4">Legal</h3>
              <ul className="space-y-1 md:space-y-3">
                <li>
                  <Link href="#" className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors">
                    Cookies
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-6 md:mt-12 pt-3 md:pt-8 border-t flex flex-col sm:flex-row justify-between items-center gap-3 md:gap-6">
            <p className="text-xs md:text-sm text-muted-foreground">© {new Date().getFullYear()} Genify</p>
            <div className="flex space-x-4 md:space-x-6">
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-4 w-4 md:h-5 md:w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="h-4 w-4 md:h-5 md:w-5" />
                <span className="sr-only">GitHub</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="h-4 w-4 md:h-5 md:w-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
