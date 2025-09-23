import { Bell, Music } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function MobileHeader() {
  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center">
            <Music className="text-white text-lg" />
          </div>
          <h1 className="text-xl font-bold gradient-text" data-testid="text-app-title">
            OGVibe
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Bell className="text-muted-foreground hover:text-primary cursor-pointer text-lg" data-testid="button-notifications" />
            <Badge className="absolute -top-1 -right-1 w-3 h-3 p-0 bg-accent border-none"></Badge>
          </div>
          <div className="w-8 h-8 gradient-bg rounded-full" data-testid="button-profile-menu"></div>
        </div>
      </div>
    </header>
  );
}
