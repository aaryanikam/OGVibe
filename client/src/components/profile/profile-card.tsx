import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Music, Flame, Award, Users } from "lucide-react";

interface ProfileCardProps {
  user?: any;
}

export default function ProfileCard({ user }: ProfileCardProps) {
  const { data: friends = [] } = useQuery({
    queryKey: ["/api/users", user?.id, "friends"],
    enabled: !!user?.id,
  });

  const { data: badges = [] } = useQuery({
    queryKey: ["/api/users", user?.id, "badges"],
    enabled: !!user?.id,
  });

  if (!user) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-muted rounded-2xl"></div>
            <div className="space-y-2">
              <div className="w-32 h-4 bg-muted rounded"></div>
              <div className="w-48 h-3 bg-muted rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover-lift">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center text-2xl text-white font-bold">
            {user.displayName?.[0] || user.username?.[0] || "U"}
          </div>
          <div>
            <h2 className="text-xl font-bold" data-testid="text-display-name">
              {user.displayName || user.username}
            </h2>
            <p className="text-muted-foreground" data-testid="text-bio">
              {user.bio || "✨ Spreading good vibes only"}
            </p>
            <div className="flex items-center space-x-2 mt-1">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-primary" data-testid="text-streak">
                  {user.streakCount || 0} day streak
                </span>
              </div>
              <span className="text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground" data-testid="text-points">
                {user.points || 0} points
              </span>
            </div>
          </div>
        </div>
        
        {/* Spotify Section */}
        {user.spotifyData?.currentTrack ? (
          <div className="bg-muted rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Currently vibing to</span>
              <Music className="w-4 h-4 text-green-500" />
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Music className="text-white" />
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
        ) : (
          <div className="bg-muted rounded-2xl p-4 mb-4 text-center">
            <Music className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No music playing</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-primary flex items-center justify-center">
              <Flame className="w-4 h-4 mr-1" />
              {user.streakCount || 0}
            </div>
            <div className="text-xs text-muted-foreground">Streak</div>
          </div>
          <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-primary flex items-center justify-center">
              <Users className="w-4 h-4 mr-1" />
              {friends.length}
            </div>
            <div className="text-xs text-muted-foreground">Friends</div>
          </div>
          <div className="bg-gradient-to-r from-pink-100 to-yellow-100 dark:from-pink-900/20 dark:to-yellow-900/20 rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-primary flex items-center justify-center">
              <Award className="w-4 h-4 mr-1" />
              {badges.length}
            </div>
            <div className="text-xs text-muted-foreground">Badges</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
