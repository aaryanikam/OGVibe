import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Image, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CreatePostProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export default function CreatePost({ isOpen, onClose, userId }: CreatePostProps) {
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createPostMutation = useMutation({
    mutationFn: async (postData: any) => {
      const response = await apiRequest("POST", "/api/posts", postData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId, "feed"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId, "posts"] });
      toast({
        title: "Post created! ✨",
        description: "Your vibe has been shared with the world",
      });
      handleClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please write something to share",
        variant: "destructive",
      });
      return;
    }

    createPostMutation.mutate({
      userId,
      content: content.trim(),
      mood: mood || null,
      imageUrl: imageUrl || null,
      isPrivate: false,
    });
  };

  const handleClose = () => {
    setContent("");
    setMood("");
    setImageUrl("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="gradient-text">Share Your Vibe ✨</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Content Input */}
          <Textarea
            placeholder="What's your vibe today? Share what's on your mind..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[100px] resize-none"
            data-testid="textarea-post-content"
          />

          {/* Mood Selector */}
          <Select value={mood} onValueChange={setMood}>
            <SelectTrigger data-testid="select-mood">
              <SelectValue placeholder="Select your mood (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="energetic">⚡ Energetic</SelectItem>
              <SelectItem value="chill">🌙 Chill</SelectItem>
              <SelectItem value="happy">😊 Happy</SelectItem>
              <SelectItem value="creative">🎨 Creative</SelectItem>
              <SelectItem value="focused">🎯 Focused</SelectItem>
              <SelectItem value="relaxed">🧘 Relaxed</SelectItem>
            </SelectContent>
          </Select>

          {/* Image URL Input */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Image className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Add an image (optional)</span>
            </div>
            <div className="flex space-x-2">
              <input
                type="url"
                placeholder="Paste image URL here..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="flex-1 px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                data-testid="input-image-url"
              />
              {imageUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setImageUrl("")}
                  data-testid="button-clear-image"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Image Preview */}
          {imageUrl && (
            <div className="rounded-lg overflow-hidden">
              <img
                src={imageUrl}
                alt="Preview"
                className="w-full h-32 object-cover"
                onError={() => setImageUrl("")}
                data-testid="img-preview"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              data-testid="button-cancel-post"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createPostMutation.isPending || !content.trim()}
              className="flex-1 gradient-bg text-white hover-lift"
              data-testid="button-submit-post"
            >
              {createPostMutation.isPending ? "Posting..." : "Share Vibe"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
