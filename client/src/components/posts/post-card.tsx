import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share, Sparkles, MoreHorizontal } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface PostCardProps {
  post: any;
  currentUserId: string;
}

export default function PostCard({ post, currentUserId }: PostCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLiked, setIsLiked] = useState(false);

  // Get reactions for this post
  const { data: reactions = [] } = useQuery({
    queryKey: ["/api/posts", post.id, "reactions"],
  });

  // Check if current user has liked this post
  const userReaction = reactions.find((r: any) => r.userId === currentUserId);

  // Toggle reaction mutation
  const toggleReactionMutation = useMutation({
    mutationFn: async () => {
      if (userReaction) {
        return apiRequest("DELETE", `/api/reactions/${currentUserId}/${post.id}`);
      } else {
        return apiRequest("POST", "/api/reactions", {
          userId: currentUserId,
          postId: post.id,
          type: "like"
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts", post.id, "reactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", currentUserId, "feed"] });
      setIsLiked(!userReaction);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to react to post",
        variant: "destructive",
      });
    },
  });

  // Send vibe mutation
  const sendVibeMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/vibes", {
        senderId: currentUserId,
        receiverId: post.userId,
        postId: post.id,
        message: "I have a vibe with you!"
      });
    },
    onSuccess: () => {
      toast({
        title: "Vibe sent! ✨",
        description: `You sent a vibe to ${post.author?.displayName || "someone"}`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send vibe",
        variant: "destructive",
      });
    },
  });

  const getMoodEmoji = (mood: string) => {
    const moodEmojis: Record<string, string> = {
      "energetic": "⚡",
      "chill": "🌙",
      "happy": "😊",
      "creative": "🎨",
      "focused": "🎯",
      "relaxed": "🧘",
    };
    return moodEmojis[mood?.toLowerCase()] || "✨";
  };

  const getMoodColor = (mood: string) => {
    const moodColors: Record<string, string> = {
      "energetic": "text-accent",
      "chill": "text-primary",
      "happy": "text-yellow-500",
      "creative": "text-purple-500",
      "focused": "text-blue-500",
      "relaxed": "text-green-500",
    };
    return moodColors[mood?.toLowerCase()] || "text-accent";
  };

  return (
    <Card className="hover-lift" data-testid={`post-${post.id}`}>
      <CardContent className="p-6">
        {/* Post Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center text-white font-bold">
              {post.author?.displayName?.[0] || post.author?.username?.[0] || "U"}
            </div>
            <div>
              <p className="font-medium text-sm" data-testid="text-author-name">
                {post.author?.displayName || post.author?.username || "Unknown User"}
              </p>
              <p className="text-xs text-muted-foreground" data-testid="text-post-time">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {post.mood && (
              <div className="bg-accent/20 px-2 py-1 rounded-lg">
                <span className={cn("text-xs font-medium", getMoodColor(post.mood))} data-testid="text-post-mood">
                  {getMoodEmoji(post.mood)} {post.mood}
                </span>
              </div>
            )}
            <MoreHorizontal className="w-4 h-4 text-muted-foreground cursor-pointer" data-testid="button-post-menu" />
          </div>
        </div>

        {/* Post Content */}
        <p className="text-sm mb-4" data-testid="text-post-content">
          {post.content}
        </p>

        {/* Post Image */}
        {post.imageUrl && (
          <div className="rounded-2xl overflow-hidden mb-4">
            <img 
              src={post.imageUrl} 
              alt="Post image" 
              className="w-full h-48 object-cover"
              data-testid="img-post-image"
            />
          </div>
        )}

        {/* Post Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => toggleReactionMutation.mutate()}
              disabled={toggleReactionMutation.isPending}
              className={cn(
                "flex items-center space-x-2 transition-colors",
                userReaction ? "text-accent" : "text-muted-foreground hover:text-accent"
              )}
              data-testid="button-like-post"
            >
              <Heart className={cn("w-4 h-4", userReaction && "fill-current")} />
              <span className="text-sm" data-testid="text-like-count">
                {reactions.length}
              </span>
            </button>
            <button 
              className="flex items-center space-x-2 text-muted-foreground hover:text-primary"
              data-testid="button-comment-post"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm" data-testid="text-comment-count">
                {post.commentCount || 0}
              </span>
            </button>
            <button 
              className="flex items-center space-x-2 text-muted-foreground hover:text-secondary"
              data-testid="button-share-post"
            >
              <Share className="w-4 h-4" />
            </button>
          </div>
          {post.userId !== currentUserId && (
            <Button 
              onClick={() => sendVibeMutation.mutate()}
              disabled={sendVibeMutation.isPending}
              className="gradient-bg text-white hover-lift"
              size="sm"
              data-testid="button-send-vibe"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              I have a vibe with you
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
