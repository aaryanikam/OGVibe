import { Link, useLocation } from "wouter";
import { Home, Compass, Plus, Heart, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  currentPage?: string;
}

export default function BottomNav({ currentPage }: BottomNavProps) {
  const [location] = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Home", key: "home" },
    { path: "/explore", icon: Compass, label: "Explore", key: "explore" },
    { path: "/create", icon: Plus, label: "Create", key: "create", isSpecial: true },
    { path: "/vibes", icon: Heart, label: "Vibes", key: "vibes" },
    { path: "/profile", icon: User, label: "Profile", key: "profile" },
  ];

  const isActive = (path: string, key: string) => {
    if (currentPage) return currentPage === key;
    return location === path;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-lg border-t border-border">
      <div className="flex items-center justify-around py-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path, item.key);

          if (item.isSpecial) {
            return (
              <button
                key={item.key}
                className="flex flex-col items-center space-y-1"
                data-testid={`nav-${item.key}`}
              >
                <div className="w-8 h-8 gradient-bg rounded-xl flex items-center justify-center mb-1">
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </button>
            );
          }

          return (
            <Link key={item.key} href={item.path}>
              <button 
                className={cn(
                  "flex flex-col items-center space-y-1 transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-primary"
                )}
                data-testid={`nav-${item.key}`}
              >
                <Icon className="text-lg" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
