import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertPostSchema, 
  insertFriendshipSchema, 
  insertVibeSchema,
  insertReactionSchema 
} from "@shared/schema";
import { getCurrentUserProfile, getCurrentlyPlaying, getTopTracks } from "./spotifyClient";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email) || 
                           await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const user = await storage.createUser(userData);
      
      // Create initial daily quests
      await storage.createDailyQuests(user.id, new Date());
      
      res.json({ user });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, username } = req.body;
      
      const user = email ? 
        await storage.getUserByEmail(email) : 
        await storage.getUserByUsername(username);
      
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Update streak and last active date
      await storage.updateUserStreak(user.id);
      
      res.json({ user });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const updates = req.body;
      const user = await storage.updateUser(req.params.id, updates);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/users/:id/badges", async (req, res) => {
    try {
      const badges = await storage.getUserBadges(req.params.id);
      res.json(badges);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Post routes
  app.post("/api/posts", async (req, res) => {
    try {
      const postData = insertPostSchema.parse(req.body);
      const post = await storage.createPost(postData);
      res.json(post);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/posts/:id", async (req, res) => {
    try {
      const post = await storage.getPost(req.params.id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      res.json(post);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/users/:id/posts", async (req, res) => {
    try {
      const posts = await storage.getPostsByUser(req.params.id);
      res.json(posts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/users/:id/feed", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const posts = await storage.getFeedPosts(req.params.id, limit);
      res.json(posts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Friendship routes
  app.post("/api/friendships", async (req, res) => {
    try {
      const friendshipData = insertFriendshipSchema.parse(req.body);
      const friendship = await storage.createFriendship(friendshipData);
      res.json(friendship);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/users/:id/friends", async (req, res) => {
    try {
      const friends = await storage.getFriendships(req.params.id);
      res.json(friends);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/friendships/:id", async (req, res) => {
    try {
      const { status } = req.body;
      const friendship = await storage.updateFriendshipStatus(req.params.id, status);
      if (!friendship) {
        return res.status(404).json({ message: "Friendship not found" });
      }
      res.json(friendship);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Vibe routes
  app.post("/api/vibes", async (req, res) => {
    try {
      const vibeData = insertVibeSchema.parse(req.body);
      const vibe = await storage.createVibe(vibeData);
      
      // Award points to sender
      const sender = await storage.getUser(vibe.senderId);
      if (sender) {
        await storage.updateUser(sender.id, { 
          points: (sender.points || 0) + 10 
        });
      }
      
      res.json(vibe);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/users/:id/vibes", async (req, res) => {
    try {
      const vibes = await storage.getVibesForUser(req.params.id);
      res.json(vibes);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Reaction routes
  app.post("/api/reactions", async (req, res) => {
    try {
      const reactionData = insertReactionSchema.parse(req.body);
      
      // Remove existing reaction if any
      await storage.removeReaction(reactionData.userId, reactionData.postId);
      
      const reaction = await storage.createReaction(reactionData);
      
      // Update post like count
      const reactions = await storage.getReactionsForPost(reactionData.postId);
      await storage.updatePostCounts(reactionData.postId, reactions.length);
      
      res.json(reaction);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/reactions/:userId/:postId", async (req, res) => {
    try {
      await storage.removeReaction(req.params.userId, req.params.postId);
      
      // Update post like count
      const reactions = await storage.getReactionsForPost(req.params.postId);
      await storage.updatePostCounts(req.params.postId, reactions.length);
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/posts/:id/reactions", async (req, res) => {
    try {
      const reactions = await storage.getReactionsForPost(req.params.id);
      res.json(reactions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Daily quest routes
  app.get("/api/users/:id/daily-quests", async (req, res) => {
    try {
      const date = req.query.date ? new Date(req.query.date as string) : new Date();
      let quests = await storage.getDailyQuests(req.params.id, date);
      
      // Create quests if they don't exist for today
      if (quests.length === 0) {
        quests = await storage.createDailyQuests(req.params.id, date);
      }
      
      res.json(quests);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/daily-quests/:id/progress", async (req, res) => {
    try {
      const { progress } = req.body;
      const quest = await storage.updateQuestProgress(req.params.id, progress);
      if (!quest) {
        return res.status(404).json({ message: "Quest not found" });
      }
      
      // Award points if quest completed
      if (quest.isCompleted) {
        const user = await storage.getUser(quest.userId);
        if (user) {
          await storage.updateUser(user.id, { 
            points: (user.points || 0) + (quest.pointReward || 0)
          });
        }
      }
      
      res.json(quest);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Spotify integration routes
  app.get("/api/spotify/profile", async (req, res) => {
    try {
      const profile = await getCurrentUserProfile();
      res.json(profile);
    } catch (error: any) {
      res.status(500).json({ message: "Spotify not connected or error occurred", error: error.message });
    }
  });

  app.get("/api/spotify/currently-playing", async (req, res) => {
    try {
      const playing = await getCurrentlyPlaying();
      res.json(playing);
    } catch (error: any) {
      res.status(500).json({ message: "Could not get currently playing track", error: error.message });
    }
  });

  app.get("/api/spotify/top-tracks", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const topTracks = await getTopTracks(limit);
      res.json(topTracks);
    } catch (error: any) {
      res.status(500).json({ message: "Could not get top tracks", error: error.message });
    }
  });

  app.patch("/api/users/:id/spotify", async (req, res) => {
    try {
      const { spotifyData } = req.body;
      const user = await storage.updateUser(req.params.id, { spotifyData });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
