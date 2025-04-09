'use client'

import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { 
  LayoutDashboard, 
  Users, 
  PieChart, 
  Settings, 
  Bell, 
  ClipboardList, 
  BarChart3,
  Calendar,
  Map
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"

// Role-specific navigation items
const navigationItems = {
  prov: [
    { name: 'Inventory', icon: <ClipboardList className="mr-2 h-4 w-4" />, href: '/dashboard/inventory' },
    { name: 'Donations', icon: <PieChart className="mr-2 h-4 w-4" />, href: '/dashboard/donations' },
    { name: 'Schedule', icon: <Calendar className="mr-2 h-4 w-4" />, href: '/dashboard/schedule' },
  ],
  recip: [
    { name: 'Available Foods', icon: <ClipboardList className="mr-2 h-4 w-4" />, href: '/dashboard/available' },
    { name: 'My Requests', icon: <PieChart className="mr-2 h-4 w-4" />, href: '/dashboard/requests' },
    { name: 'Schedule', icon: <Calendar className="mr-2 h-4 w-4" />, href: '/dashboard/schedule' },
  ],
  vol: [
    { name: 'Opportunities', icon: <ClipboardList className="mr-2 h-4 w-4" />, href: '/dashboard/opportunities' },
    { name: 'My Shifts', icon: <Calendar className="mr-2 h-4 w-4" />, href: '/dashboard/shifts' },
    { name: 'Impact', icon: <BarChart3 className="mr-2 h-4 w-4" />, href: '/dashboard/impact' },
  ],
  org: [
    { name: 'Distribution Network', icon: <Map className="mr-2 h-4 w-4" />, href: '/dashboard/network' },
    { name: 'Inventory', icon: <ClipboardList className="mr-2 h-4 w-4" />, href: '/dashboard/inventory' },
    { name: 'Analytics', icon: <BarChart3 className="mr-2 h-4 w-4" />, href: '/dashboard/analytics' },
    { name: 'Team', icon: <Users className="mr-2 h-4 w-4" />, href: '/dashboard/team' },
  ],
  default: [
    { name: 'Overview', icon: <LayoutDashboard className="mr-2 h-4 w-4" />, href: '/dashboard' },
    { name: 'Listings', icon: <ClipboardList className="mr-2 h-4 w-4" />, href: '/listings' },
  ]
};

// Notification component for real-time alerts
function RealTimeNotifications() {
  return (
    <div className="absolute right-4 top-4">
      <Button variant="ghost" size="sm" className="relative">
        <Bell className="h-5 w-5" />
        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 flex items-center justify-center text-[10px] text-white">
          3
        </span>
      </Button>
    </div>
  );
}

// Analytics sidebar for the dashboard
function AnalyticsSidebar() {
  const { profile } = useAuth();
  const role = (profile?.role || 'default') as keyof typeof analyticsContent;
  
  const analyticsContent = {
    prov: (
      <>
        <h3 className="text-lg font-medium mb-4">Provider Analytics</h3>
        <div className="space-y-4">
          <div className="bg-gray-800 p-3 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Total Donations</p>
            <p className="text-xl font-bold">24</p>
          </div>
          <div className="bg-gray-800 p-3 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">People Helped</p>
            <p className="text-xl font-bold">85</p>
          </div>
        </div>
      </>
    ),
    recip: (
      <>
        <h3 className="text-lg font-medium mb-4">Recipient Analytics</h3>
        <div className="space-y-4">
          <div className="bg-gray-800 p-3 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Foods Received</p>
            <p className="text-xl font-bold">12</p>
          </div>
          <div className="bg-gray-800 p-3 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Saved (est.)</p>
            <p className="text-xl font-bold">$125</p>
          </div>
        </div>
      </>
    ),
    vol: (
      <>
        <h3 className="text-lg font-medium mb-4">Volunteer Stats</h3>
        <div className="space-y-4">
          <div className="bg-gray-800 p-3 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Hours Volunteered</p>
            <p className="text-xl font-bold">18</p>
          </div>
          <div className="bg-gray-800 p-3 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Deliveries</p>
            <p className="text-xl font-bold">7</p>
          </div>
        </div>
      </>
    ),
    org: (
      <>
        <h3 className="text-lg font-medium mb-4">Organization Stats</h3>
        <div className="space-y-4">
          <div className="bg-gray-800 p-3 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Members</p>
            <p className="text-xl font-bold">34</p>
          </div>
          <div className="bg-gray-800 p-3 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Total Impact</p>
            <p className="text-xl font-bold">412 lbs</p>
          </div>
        </div>
      </>
    ),
    default: (
      <>
        <h3 className="text-lg font-medium mb-4">Quick Stats</h3>
        <div className="space-y-4">
          <div className="bg-gray-800 p-3 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Activity</p>
            <p className="text-xl font-bold">--</p>
          </div>
          <div className="bg-gray-800 p-3 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Status</p>
            <p className="text-xl font-bold">Active</p>
          </div>
        </div>
      </>
    )
  };
  
  return (
    <Card className="bg-gray-900/70 border-gray-800 h-full">
      <CardHeader>
        <CardTitle className="text-lg">Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        {analyticsContent[role]}
      </CardContent>
    </Card>
  );
}

// Role-specific navigation component
function RoleSpecificNavbar({ role }: { role: string | null }) {
  const items = navigationItems[role as keyof typeof navigationItems] || navigationItems.default;
  
  return (
    <Card className="bg-gray-900/70 border-gray-800">
      <CardHeader>
        <CardTitle className="text-lg capitalize">{role || 'User'} Dashboard</CardTitle>
        <CardDescription>
          Welcome to your personalized dashboard
        </CardDescription>
      </CardHeader>
      <CardContent>
        <nav className="space-y-2">
          {items.map((item) => (
            <Link href={item.href} key={item.name}>
              <Button variant="ghost" className="w-full justify-start">
                {item.icon}
                {item.name}
              </Button>
            </Link>
          ))}
          <Link href="/profile">
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </Link>
        </nav>
      </CardContent>
    </Card>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  
  // Debug output to identify loading issues
  useEffect(() => {
    console.log("Dashboard layout mounting", { 
      loading, 
      userExists: !!user, 
      profileExists: !!profile,
      role: profile?.role,
      profileCompleted: profile?.profile_completed
    });
  }, [loading, user, profile]);

  // Ensure user is authenticated and has completed onboarding
  useEffect(() => {
    if (!loading) {
      if (!user) {
        console.log("No user, redirecting to login");
        router.push('/login');
      } else if (!profile?.role) {
        console.log("No role, redirecting to select-role");
        router.push('/select-role');
      } else {
        // User has a role, so allow them to access the dashboard regardless of profile completion
        console.log("User and role exist, showing dashboard");
      }
    }
  }, [user, profile, loading, router]);

  // Add a timeout to prevent infinite loading
  const [timeoutExpired, setTimeoutExpired] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        console.log("Loading timeout expired, forcing render");
        setTimeoutExpired(true);
      }
    }, 3000); // 3 seconds timeout
    
    return () => clearTimeout(timer);
  }, [loading]);

  // If loading or not authenticated, show loading state
  if ((loading && !timeoutExpired) || !user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="h-10 w-10 border-4 border-t-transparent border-blue-500 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-300">Loading your dashboard...</p>
        </div>
      </div>
    );
  }
  
  // Safety fallback - if profile doesn't exist but timeout expired, show an error
  if (!profile && timeoutExpired) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center max-w-md text-center">
          <div className="text-red-500 text-5xl mb-4">!</div>
          <h1 className="text-xl font-bold mb-2">Unable to load profile</h1>
          <p className="text-gray-300 mb-4">
            We encountered a problem loading your dashboard. This might be due to a connectivity issue.
          </p>
          <div className="flex gap-4">
            <Button onClick={() => window.location.reload()}>
              Reload Page
            </Button>
            <Button variant="outline" onClick={() => router.push('/')}>
              Return Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-10 px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[120%] h-[120%] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/20 blur-3xl opacity-40" />
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[300px_1fr_250px] gap-6 max-w-7xl mx-auto">
        {/* Left sidebar with role-specific navigation */}
        <div className="lg:col-span-1">
          <RoleSpecificNavbar role={profile?.role || null} />
        </div>

        {/* Main content area */}
        <div className="lg:col-span-1 relative">
          <RealTimeNotifications />
          <div className="main-content pt-10">
            {children}
          </div>
        </div>

        {/* Right sidebar with analytics */}
        <div className="lg:col-span-1 hidden lg:block">
          <AnalyticsSidebar />
        </div>
      </div>
    </div>
  );
} 