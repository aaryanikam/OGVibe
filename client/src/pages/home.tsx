import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import MobileHeader from "@/components/layout/mobile-header";
import BottomNav from "@/components/layout/bottom-nav";
import ProfileCard from "@/components/profile/profile-card";
import DailyQuest from "@/components/daily/daily-quest";
import PostCard from "@/components/posts/post-card";
import CreatePost from "@/components/posts/create-post";
import FloatingPet from "@/components/pet/floating-pet";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const CURRENT_USER_ID = "current-user"; // In a real app, this would come from auth context

export default function Home() {
  const [showCreatePost, setShowCreatePost] = useState(false);

  // Get current user data
  const { data: user } = useQuery({
    queryKey: ["/api/users", CURRENT_USER_ID],
  });

  // Get user's feed
  const { data: feedPosts = [], isLoading } = useQuery({
    queryKey: ["/api/users", CURRENT_USER_ID, "feed"],
  });

  // Get daily quests
  const { data: dailyQuests = [] } = useQuery({
    queryKey: ["/api/users", CURRENT_USER_ID, "daily-quests"],
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
        {/* Profile Section */}
        <section className="p-4">
          <ProfileCard user={user} />
        </section>

        {/* Daily Quest Section */}
        {dailyQuests.length > 0 && (
          <section className="px-4 mb-6">
            <DailyQuest quests={dailyQuests} />
          </section>
        )}

        {/* Feed Section */}
        <section className="px-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Your Vibe Feed</h3>
            <Button 
              onClick={() => setShowCreatePost(true)}
              className="gradient-bg text-white hover-lift"
              size="sm"
              data-testid="button-create-post"
            >
              <Plus className="w-4 h-4 mr-1" />
              Post
            </Button>
          </div>

          {feedPosts.length === 0 ? (
            <div className="bg-card rounded-3xl p-8 text-center">
              <div className="w-16 h-16 gradient-bg rounded-full mx-auto mb-4 flex items-center justify-center">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold mb-2">Share your first vibe!</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Start connecting with friends by sharing what's on your mind
              </p>
              <Button 
                onClick={() => setShowCreatePost(true)}
                className="gradient-bg text-white hover-lift"
                data-testid="button-first-post"
              >
                Create your first post
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {feedPosts.map((post: any) => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  currentUserId={CURRENT_USER_ID}
                />
              ))}
            </div>
          )}

          {/* Load more placeholder */}
          {feedPosts.length > 0 && (
            <div className="text-center py-8">
              <button 
                className="text-muted-foreground hover:text-primary transition-colors"
                data-testid="button-load-more"
              >
                <i className="fas fa-chevron-down mr-2"></i>
                Load more vibes
              </button>
            </div>
          )}
        </section>
      </main>

      <BottomNav currentPage="home" />
      <FloatingPet />

      {showCreatePost && (
        <CreatePost 
          isOpen={showCreatePost}
          onClose={() => setShowCreatePost(false)}
          userId={CURRENT_USER_ID}
        />
      )}
    </div>
  );
}
