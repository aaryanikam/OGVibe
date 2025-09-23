import { 
  type User, 
  type InsertUser, 
  type Post, 
  type InsertPost,
  type Friendship,
  type InsertFriendship,
  type Vibe,
  type InsertVibe,
  type Reaction,
  type InsertReaction,
  type Badge,
  type DailyQuest
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  updateUserStreak(id: string): Promise<User | undefined>;
  
  // Post methods
  createPost(post: InsertPost): Promise<Post>;
  getPost(id: string): Promise<Post | undefined>;
  getPostsByUser(userId: string): Promise<Post[]>;
  getFeedPosts(userId: string, limit?: number): Promise<(Post & { author: User })[]>;
  updatePostCounts(postId: string, likes?: number, comments?: number): Promise<void>;
  
  // Friendship methods
  createFriendship(friendship: InsertFriendship): Promise<Friendship>;
  getFriendships(userId: string): Promise<(Friendship & { friend: User })[]>;
  getFriendship(userId: string, friendId: string): Promise<Friendship | undefined>;
  updateFriendshipStatus(id: string, status: string): Promise<Friendship | undefined>;
  
  // Vibe methods
  createVibe(vibe: InsertVibe): Promise<Vibe>;
  getVibesBetweenUsers(userId1: string, userId2: string): Promise<Vibe[]>;
  getVibesForUser(userId: string): Promise<(Vibe & { sender: User; receiver: User })[]>;
  
  // Reaction methods
  createReaction(reaction: InsertReaction): Promise<Reaction>;
  removeReaction(userId: string, postId: string): Promise<void>;
  getReactionsForPost(postId: string): Promise<(Reaction & { user: User })[]>;
  
  // Badge methods
  getUserBadges(userId: string): Promise<Badge[]>;
  createBadge(badge: Omit<Badge, "id">): Promise<Badge>;
  
  // Daily quest methods
  getDailyQuests(userId: string, date: Date): Promise<DailyQuest[]>;
  updateQuestProgress(questId: string, progress: number): Promise<DailyQuest | undefined>;
  createDailyQuests(userId: string, date: Date): Promise<DailyQuest[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private posts: Map<string, Post>;
  private friendships: Map<string, Friendship>;
  private vibes: Map<string, Vibe>;
  private reactions: Map<string, Reaction>;
  private badges: Map<string, Badge>;
  private dailyQuests: Map<string, DailyQuest>;

  constructor() {
    this.users = new Map();
    this.posts = new Map();
    this.friendships = new Map();
    this.vibes = new Map();
    this.reactions = new Map();
    this.badges = new Map();
    this.dailyQuests = new Map();
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      streakCount: 0,
      points: 0,
      lastActiveDate: new Date(),
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateUserStreak(id: string): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const today = new Date();
    const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
    
    let newStreakCount = user.streakCount || 0;
    
    if (lastActive) {
      const daysDiff = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff === 1) {
        newStreakCount += 1;
      } else if (daysDiff > 1) {
        newStreakCount = 1;
      }
    } else {
      newStreakCount = 1;
    }

    return this.updateUser(id, { 
      streakCount: newStreakCount, 
      lastActiveDate: today 
    });
  }

  // Post methods
  async createPost(insertPost: InsertPost): Promise<Post> {
    const id = randomUUID();
    const post: Post = {
      ...insertPost,
      id,
      likeCount: 0,
      commentCount: 0,
      createdAt: new Date()
    };
    this.posts.set(id, post);
    return post;
  }

  async getPost(id: string): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async getPostsByUser(userId: string): Promise<Post[]> {
    return Array.from(this.posts.values())
      .filter(post => post.userId === userId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getFeedPosts(userId: string, limit = 20): Promise<(Post & { author: User })[]> {
    const userFriendships = Array.from(this.friendships.values())
      .filter(f => (f.userId === userId || f.friendId === userId) && f.status === 'accepted');
    
    const friendIds = userFriendships.map(f => 
      f.userId === userId ? f.friendId : f.userId
    );
    friendIds.push(userId); // Include user's own posts

    const posts = Array.from(this.posts.values())
      .filter(post => friendIds.includes(post.userId) && !post.isPrivate)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(0, limit);

    return posts.map(post => ({
      ...post,
      author: this.users.get(post.userId)!
    }));
  }

  async updatePostCounts(postId: string, likes?: number, comments?: number): Promise<void> {
    const post = this.posts.get(postId);
    if (!post) return;

    const updates: Partial<Post> = {};
    if (likes !== undefined) updates.likeCount = likes;
    if (comments !== undefined) updates.commentCount = comments;

    this.posts.set(postId, { ...post, ...updates });
  }

  // Friendship methods
  async createFriendship(insertFriendship: InsertFriendship): Promise<Friendship> {
    const id = randomUUID();
    const friendship: Friendship = {
      ...insertFriendship,
      id,
      vibeCount: 0,
      createdAt: new Date()
    };
    this.friendships.set(id, friendship);
    return friendship;
  }

  async getFriendships(userId: string): Promise<(Friendship & { friend: User })[]> {
    const friendships = Array.from(this.friendships.values())
      .filter(f => (f.userId === userId || f.friendId === userId) && f.status === 'accepted');
    
    return friendships.map(friendship => {
      const friendId = friendship.userId === userId ? friendship.friendId : friendship.userId;
      const friend = this.users.get(friendId)!;
      return { ...friendship, friend };
    });
  }

  async getFriendship(userId: string, friendId: string): Promise<Friendship | undefined> {
    return Array.from(this.friendships.values())
      .find(f => 
        (f.userId === userId && f.friendId === friendId) || 
        (f.userId === friendId && f.friendId === userId)
      );
  }

  async updateFriendshipStatus(id: string, status: string): Promise<Friendship | undefined> {
    const friendship = this.friendships.get(id);
    if (!friendship) return undefined;

    const updated = { ...friendship, status };
    this.friendships.set(id, updated);
    return updated;
  }

  // Vibe methods
  async createVibe(insertVibe: InsertVibe): Promise<Vibe> {
    const id = randomUUID();
    const vibe: Vibe = {
      ...insertVibe,
      id,
      createdAt: new Date()
    };
    this.vibes.set(id, vibe);
    return vibe;
  }

  async getVibesBetweenUsers(userId1: string, userId2: string): Promise<Vibe[]> {
    return Array.from(this.vibes.values())
      .filter(v => 
        (v.senderId === userId1 && v.receiverId === userId2) ||
        (v.senderId === userId2 && v.receiverId === userId1)
      );
  }

  async getVibesForUser(userId: string): Promise<(Vibe & { sender: User; receiver: User })[]> {
    const vibes = Array.from(this.vibes.values())
      .filter(v => v.receiverId === userId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());

    return vibes.map(vibe => ({
      ...vibe,
      sender: this.users.get(vibe.senderId)!,
      receiver: this.users.get(vibe.receiverId)!
    }));
  }

  // Reaction methods
  async createReaction(insertReaction: InsertReaction): Promise<Reaction> {
    const id = randomUUID();
    const reaction: Reaction = {
      ...insertReaction,
      id,
      createdAt: new Date()
    };
    this.reactions.set(id, reaction);
    return reaction;
  }

  async removeReaction(userId: string, postId: string): Promise<void> {
    const reaction = Array.from(this.reactions.values())
      .find(r => r.userId === userId && r.postId === postId);
    
    if (reaction) {
      this.reactions.delete(reaction.id);
    }
  }

  async getReactionsForPost(postId: string): Promise<(Reaction & { user: User })[]> {
    const reactions = Array.from(this.reactions.values())
      .filter(r => r.postId === postId);
    
    return reactions.map(reaction => ({
      ...reaction,
      user: this.users.get(reaction.userId)!
    }));
  }

  // Badge methods
  async getUserBadges(userId: string): Promise<Badge[]> {
    return Array.from(this.badges.values())
      .filter(b => b.userId === userId)
      .sort((a, b) => new Date(b.earnedAt!).getTime() - new Date(a.earnedAt!).getTime());
  }

  async createBadge(badgeData: Omit<Badge, "id">): Promise<Badge> {
    const id = randomUUID();
    const badge: Badge = { ...badgeData, id };
    this.badges.set(id, badge);
    return badge;
  }

  // Daily quest methods
  async getDailyQuests(userId: string, date: Date): Promise<DailyQuest[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return Array.from(this.dailyQuests.values())
      .filter(q => 
        q.userId === userId && 
        q.questDate! >= startOfDay && 
        q.questDate! <= endOfDay
      );
  }

  async updateQuestProgress(questId: string, progress: number): Promise<DailyQuest | undefined> {
    const quest = this.dailyQuests.get(questId);
    if (!quest) return undefined;

    const updated = { 
      ...quest, 
      currentCount: Math.min(progress, quest.targetCount!),
      isCompleted: progress >= quest.targetCount!
    };
    this.dailyQuests.set(questId, updated);
    return updated;
  }

  async createDailyQuests(userId: string, date: Date): Promise<DailyQuest[]> {
    const questTemplates = [
      { type: 'share_vibes', title: 'Share vibes with friends', description: 'Send "I have a vibe with you" to 3 friends', pointReward: 50, targetCount: 3 },
      { type: 'react_posts', title: 'React to posts', description: 'React to 5 posts from friends', pointReward: 30, targetCount: 5 },
      { type: 'create_post', title: 'Share your vibe', description: 'Post your morning vibe', pointReward: 40, targetCount: 1 }
    ];

    const quests: DailyQuest[] = [];
    for (const template of questTemplates) {
      const id = randomUUID();
      const quest: DailyQuest = {
        ...template,
        id,
        userId,
        currentCount: 0,
        isCompleted: false,
        questDate: new Date(date)
      };
      this.dailyQuests.set(id, quest);
      quests.push(quest);
    }

    return quests;
  }
}

export const storage = new MemStorage();
