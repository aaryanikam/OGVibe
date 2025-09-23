import { useQuery } from "@tanstack/react-query";
import MobileHeader from "@/components/layout/mobile-header";
import BottomNav from "@/components/layout/bottom-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Sparkles, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const CURRENT_USER_ID = "current-user";

export default function Vibes() {
  const { data: vibes = [], isLoading } = useQuery({
    queryKey: ["/api/users", CURRENT_USER_ID, "vibes"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 gradient-bg rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your vibes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader />
      
      <main className="pb-20">
        {/* Header */}
        <section className="p-4">
          <div className="text-center mb-6">
            <div className="w-16 h-16 gradient-bg rounded-full mx-auto mb-4 flex items-center justify-center">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold gradient-text">Your Vibes</h1>
            <p className="text-muted-foreground">See who's been vibing with you</p>
          </div>
        </section>

        {/* Vibes List */}
        <section className="px-4">
          {vibes.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-muted to-muted/50 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-bold mb-2">No vibes yet</h3>
                <p className="text-muted-foreground text-sm">
                  When friends send you vibes, they'll appear here!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {vibes.map((vibe: any) => (
                <Card key={vibe.id} className="hover-lift" data-testid={`vibe-${vibe.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center text-white font-bold">
                        {vibe.sender?.displayName?.[0] || "U"}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="font-medium" data-testid="text-sender-name">
                            {vibe.sender?.displayName || "Unknown User"}
                          </p>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatDistanceToNow(new Date(vibe.createdAt), { addSuffix: true })}
                          </div>
                        </div>
                        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-3 border border-primary/20">
                          <p className="text-sm font-medium text-primary flex items-center">
                            <Sparkles className="w-4 h-4 mr-2" />
                            "I have a vibe with you"
                          </p>
                          {vibe.message && (
                            <p className="text-sm text-muted-foreground mt-1" data-testid="text-vibe-message">
                              {vibe.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Vibe Stats */}
        <section className="px-4 mt-8">
          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="p-6 text-center">
              <h3 className="font-bold mb-2">Vibe Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold gradient-text" data-testid="text-vibes-received">
                    {vibes.length}
                  </div>
                  <p className="text-sm text-muted-foreground">Vibes Received</p>
                </div>
                <div>
                  <div className="text-2xl font-bold gradient-text" data-testid="text-unique-senders">
                    {new Set(vibes.map((v: any) => v.senderId)).size}
                  </div>
                  <p className="text-sm text-muted-foreground">Unique Friends</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <BottomNav currentPage="vibes" />
    </div>
  );
}
