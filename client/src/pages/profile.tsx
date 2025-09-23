import { useQuery } from "@tanstack/react-query";
import MobileHeader from "@/components/layout/mobile-header";
import BottomNav from "@/components/layout/bottom-nav";
import PostCard from "@/components/posts/post-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Music, Award, Flame, Heart } from "lucide-react";

const CURRENT_USER_ID = "current-user";

export default function Profile() {
  const { data: user } = useQuery({
    queryKey: ["/api/users", CURRENT_USER_ID],
  });

  const { data: userPosts = [] } = useQuery({
    queryKey: ["/api/users", CURRENT_USER_ID, "posts"],
  });

  const { data: badges = [] } = useQuery({
    queryKey: ["/api/users", CURRENT_USER_ID, "badges"],
  });

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader />
      
      <main className="pb-20">
        {/* Profile Header */}
        <section className="p-4">
          <Card className="hover-lift">
            <CardContent className="p-6">
              {/* Avatar and Basic Info */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-20 h-20 gradient-bg rounded-2xl flex items-center justify-center text-3xl text-white">
                  {user?.displayName?.[0] || "U"}
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold" data-testid="text-display-name">
                    {user?.displayName || "User"}
                  </h1>
                  <p className="text-muted-foreground" data-testid="text-username">
                    @{user?.username || "username"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1" data-testid="text-bio">
                    {user?.bio || "✨ Spreading good vibes only"}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Flame className="w-4 h-4 text-accent mr-1" />
                    <span className="text-xl font-bold" data-testid="text-streak">
                      {user?.streakCount || 0}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">Day Streak</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Award className="w-4 h-4 text-primary mr-1" />
                    <span className="text-xl font-bold" data-testid="text-points">
                      {user?.points || 0}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">Points</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Heart className="w-4 h-4 text-secondary mr-1" />
                    <span className="text-xl font-bold" data-testid="text-posts">
                      {userPosts.length}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">Posts</p>
                </div>
              </div>

              {/* Spotify Section */}
              {user?.spotifyData?.currentTrack && (
                <div className="bg-muted rounded-2xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Currently vibing to</span>
                    <Music className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 gradient-bg rounded-lg flex items-center justify-center">
                      <Music className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-sm" data-testid="text-current-track">
                        {user.spotifyData.currentTrack}
                      </p>
                      <p className="text-xs text-muted-foreground" data-testid="text-current-artist">
                        {user.spotifyData.currentArtist}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Badges */}
              {badges.length > 0 && (
                <div>
                  <h3 className="font-medium mb-3">Badges</h3>
                  <div className="flex flex-wrap gap-2">
                    {badges.map((badge: any) => (
                      <Badge 
                        key={badge.id} 
                        variant="secondary" 
                        className="bg-gradient-to-r from-primary/20 to-accent/20"
                        data-testid={`badge-${badge.type}`}
                      >
                        {badge.title}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* User Posts */}
        <section className="px-4">
          <h3 className="text-lg font-bold mb-4">Your Posts</h3>
          {userPosts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 gradient-bg rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold mb-2">No posts yet</h3>
                <p className="text-muted-foreground text-sm">
                  Share your first vibe to get started!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {userPosts.map((post: any) => (
                <PostCard 
                  key={post.id} 
                  post={{...post, author: user}} 
                  currentUserId={CURRENT_USER_ID}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <BottomNav currentPage="profile" />
    </div>
  );
}
