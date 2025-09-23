import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart, Gift, Zap } from "lucide-react";

export default function FloatingPet() {
  const [isOpen, setIsOpen] = useState(false);
  const [petMood, setPetMood] = useState("happy");

  const petEmojis = {
    happy: "🐰",
    excited: "🐱",
    sleepy: "🐨",
    playful: "🐶",
  };

  const petMessages = {
    happy: "Bunny is happy! 😊",
    excited: "Cat is excited! 🎉",
    sleepy: "Koala is sleepy! 😴",
    playful: "Puppy wants to play! 🎾",
  };

  const handlePetAction = (action: string) => {
    switch (action) {
      case "love":
        setPetMood("happy");
        break;
      case "gift":
        setPetMood("excited");
        break;
      case "energy":
        setPetMood("playful");
        break;
      default:
        setPetMood("happy");
    }
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Pet */}
      <div className="fixed bottom-24 right-4 z-40">
        <div 
          className="w-16 h-16 gradient-bg rounded-full flex items-center justify-center hover-lift cursor-pointer shadow-lg"
          onClick={() => setIsOpen(true)}
          data-testid="button-open-pet"
        >
          <div className="text-2xl">{petEmojis[petMood as keyof typeof petEmojis]}</div>
        </div>
        <div className="absolute -top-8 -left-4 bg-card px-3 py-1 rounded-lg shadow-lg opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
          <span className="text-xs font-medium" data-testid="text-pet-status">
            {petMessages[petMood as keyof typeof petMessages]}
          </span>
        </div>
      </div>

      {/* Pet Menu Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-sm">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 gradient-bg rounded-full mx-auto flex items-center justify-center text-4xl">
              {petEmojis[petMood as keyof typeof petEmojis]}
            </div>
            
            <div>
              <h3 className="font-bold text-lg gradient-text mb-2">Your Pet Companion</h3>
              <p className="text-sm text-muted-foreground" data-testid="text-pet-message">
                {petMessages[petMood as keyof typeof petMessages]}
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => handlePetAction("love")}
                className="w-full bg-gradient-to-r from-pink-500 to-red-500 text-white hover-lift"
                data-testid="button-pet-love"
              >
                <Heart className="w-4 h-4 mr-2" />
                Send Love
              </Button>
              
              <Button
                onClick={() => handlePetAction("gift")}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white hover-lift"
                data-testid="button-pet-gift"
              >
                <Gift className="w-4 h-4 mr-2" />
                Give Gift
              </Button>
              
              <Button
                onClick={() => handlePetAction("energy")}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover-lift"
                data-testid="button-pet-energy"
              >
                <Zap className="w-4 h-4 mr-2" />
                Boost Energy
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
