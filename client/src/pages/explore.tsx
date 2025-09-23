import MobileHeader from "@/components/layout/mobile-header";
import BottomNav from "@/components/layout/bottom-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Compass, Users, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Explore() {
  return (
    <div className="min-h-screen bg-background">
      <MobileHeader />
      
      <main className="pb-20">
        {/* Search Section */}
        <section className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search for friends, vibes, or music..."
              className="pl-10 rounded-2xl border-border bg-card"
              data-testid="input-search"
            />
          </div>
        </section>

        {/* Trending Section */}
        <section className="px-4 mb-6">
          <h3 className="text-lg font-bold mb-4">Trending Vibes</h3>
          <div className="grid grid-cols-2 gap-3">
            <Card className="hover-lift cursor-pointer" data-testid="card-trending-music">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Music Vibes</p>
                    <p className="text-xs text-muted-foreground">145 active</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-lift cursor-pointer" data-testid="card-trending-friends">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">New Friends</p>
                    <p className="text-xs text-muted-foreground">89 online</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Discover Friends */}
        <section className="px-4 mb-6">
          <h3 className="text-lg font-bold mb-4">Discover Friends</h3>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 gradient-bg rounded-full mx-auto mb-4 flex items-center justify-center">
                <Compass className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold mb-2">Find Your Vibe Tribe</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Connect with people who share your music taste and energy
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl"></div>
                    <div className="text-left">
                      <p className="font-medium text-sm">Alex Chen</p>
                      <p className="text-xs text-muted-foreground">Similar music taste</p>
                    </div>
                  </div>
                  <button className="gradient-bg text-white px-3 py-1 rounded-lg text-xs font-medium hover-lift" data-testid="button-add-friend">
                    Add Friend
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-purple-500 rounded-xl"></div>
                    <div className="text-left">
                      <p className="font-medium text-sm">Jordan Kim</p>
                      <p className="text-xs text-muted-foreground">Positive vibes</p>
                    </div>
                  </div>
                  <button className="gradient-bg text-white px-3 py-1 rounded-lg text-xs font-medium hover-lift" data-testid="button-add-friend">
                    Add Friend
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Popular Tags */}
        <section className="px-4">
          <h3 className="text-lg font-bold mb-4">Popular Vibes</h3>
          <div className="flex flex-wrap gap-2">
            {["#MorningVibes", "#StudyMode", "#ChillTime", "#WorkoutEnergy", "#CreativeFlow", "#NightOwl"].map((tag) => (
              <div 
                key={tag}
                className="bg-gradient-to-r from-primary/20 to-accent/20 px-3 py-2 rounded-xl text-sm font-medium cursor-pointer hover:scale-105 transition-transform"
                data-testid={`tag-${tag.slice(1)}`}
              >
                {tag}
              </div>
            ))}
          </div>
        </section>
      </main>

      <BottomNav currentPage="explore" />
    </div>
  );
}
