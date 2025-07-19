import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  Bell, 
  Clock, 
  Users, 
  Zap,
  ArrowRight,
  Server,
  AlertCircle,
  BarChart3
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center space-x-2">
                <Activity className="h-6 w-6 text-blue-600" />
                <span className="font-bold text-xl">StatusPage</span>
              </Link>
              <div className="hidden md:flex items-center space-x-6">
                <Link href="/status/demo" className="text-sm font-medium hover:text-blue-600 transition-colors">
                  Demo
                </Link>
                <Link href="#features" className="text-sm font-medium hover:text-blue-600 transition-colors">
                  Features
                </Link>
                <Link href="#pricing" className="text-sm font-medium hover:text-blue-600 transition-colors">
                  Pricing
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/sign-in">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/sign-up">
                <Button>Get Started</Button>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4" variant="secondary">
              <Zap className="h-3 w-3 mr-1" />
              Real-time Status Monitoring
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Keep Your Users Informed with{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
                Beautiful Status Pages
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Build trust with transparent communication. Monitor your services, track incidents, 
              and keep your users updated with our modern status page platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/sign-up">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/status/demo">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  View Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need for Status Communication
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features to help you monitor services and communicate effectively with your users
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="rounded-lg bg-blue-100 dark:bg-blue-900/20 w-12 h-12 flex items-center justify-center mb-4">
                <Server className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Service Monitoring</h3>
              <p className="text-muted-foreground">
                Track multiple services with customizable status levels and real-time updates
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="rounded-lg bg-green-100 dark:bg-green-900/20 w-12 h-12 flex items-center justify-center mb-4">
                <AlertCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Incident Management</h3>
              <p className="text-muted-foreground">
                Create and track incidents with detailed updates and resolution timelines
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="rounded-lg bg-purple-100 dark:bg-purple-900/20 w-12 h-12 flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Scheduled Maintenance</h3>
              <p className="text-muted-foreground">
                Plan and communicate maintenance windows to minimize user disruption
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="rounded-lg bg-orange-100 dark:bg-orange-900/20 w-12 h-12 flex items-center justify-center mb-4">
                <Bell className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Updates</h3>
              <p className="text-muted-foreground">
                WebSocket-powered live updates keep users informed instantly
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="rounded-lg bg-cyan-100 dark:bg-cyan-900/20 w-12 h-12 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-cyan-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Team Collaboration</h3>
              <p className="text-muted-foreground">
                Multi-tenant support with role-based access control for teams
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="rounded-lg bg-pink-100 dark:bg-pink-900/20 w-12 h-12 flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Uptime Metrics</h3>
              <p className="text-muted-foreground">
                Track and display service uptime with beautiful charts and statistics
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="p-12 bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Build Trust with Your Users?
              </h2>
              <p className="text-lg mb-8 opacity-90">
                Start your free trial today and create your first status page in minutes
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/sign-up">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/status/demo">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/10 border-white/20 text-white hover:bg-white/20">
                    View Demo Page
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Activity className="h-5 w-5 text-blue-600" />
              <span className="font-semibold">StatusPage</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 StatusPage. Built with ❤️ using Next.js, Clerk, and Prisma
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
