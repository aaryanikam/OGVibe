import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface DailyQuestProps {
  quests: any[];
}

export default function DailyQuest({ quests }: DailyQuestProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const completedQuests = quests.filter(q => q.isCompleted).length;
  const totalQuests = quests.length;

  const updateQuestMutation = useMutation({
    mutationFn: async ({ questId, progress }: { questId: string; progress: number }) => {
      const response = await apiRequest("PATCH", `/api/daily-quests/${questId}/progress`, {
        progress
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      if (data.isCompleted) {
        toast({
          title: "Quest completed! 🎯",
          description: `You earned ${data.pointReward} points!`,
        });
      }
    },
  });

  return (
    <Card className="bg-gradient-to-r from-accent/20 to-secondary/20 border-accent/30">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Daily Quest 🎯</h3>
          <Badge variant="secondary" className="bg-accent/20" data-testid="text-quest-progress">
            {completedQuests}/{totalQuests} complete
          </Badge>
        </div>
        
        <div className="space-y-3">
          {quests.map((quest) => (
            <div 
              key={quest.id} 
              className="flex items-center space-x-3"
              data-testid={`quest-${quest.type}`}
            >
              <div 
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center",
                  quest.isCompleted 
                    ? "bg-accent" 
                    : "border-2 border-muted"
                )}
              >
                {quest.isCompleted && (
                  <Check className="w-4 h-4 text-white" />
                )}
              </div>
              
              <div className="flex-1">
                <span 
                  className={cn(
                    "text-sm",
                    quest.isCompleted 
                      ? "line-through text-muted-foreground" 
                      : ""
                  )}
                  data-testid="text-quest-title"
                >
                  {quest.title}
                </span>
                {quest.currentCount > 0 && quest.targetCount > 1 && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Progress: {quest.currentCount}/{quest.targetCount}
                  </div>
                )}
              </div>
              
              <span 
                className={cn(
                  "text-xs font-medium",
                  quest.isCompleted 
                    ? "text-accent" 
                    : "text-muted-foreground"
                )}
                data-testid="text-quest-points"
              >
                +{quest.pointReward} pts
              </span>
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-300"
              style={{ width: `${(completedQuests / totalQuests) * 100}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {completedQuests === totalQuests 
              ? "All quests completed! 🎉" 
              : `${totalQuests - completedQuests} quests remaining`
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
