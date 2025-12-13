import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Sparkles } from "lucide-react";
import { AIChatPopup } from "./AIChatPopup";

export function AIAssistantCard() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Card className="card-ai-glass ai-hover-lift overflow-visible relative group">
        {/* AI Glow Effect */}
        <div className="ai-panel-glow" />
        
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Animated Doctor Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-gradient-ai flex items-center justify-center shadow-lg relative overflow-hidden">
                {/* Animated Female Doctor Avatar SVG */}
                <svg 
                  className="w-12 h-12 text-white" 
                  viewBox="0 0 64 64" 
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Head with animation */}
                  <circle 
                    cx="32" 
                    cy="20" 
                    r="8" 
                    fill="currentColor"
                    className="animate-[float_3s_ease-in-out_infinite]"
                  />
                  
                  {/* Hair bun */}
                  <circle 
                    cx="32" 
                    cy="14" 
                    r="4" 
                    fill="currentColor" 
                    opacity="0.8"
                    className="animate-[float_3s_ease-in-out_infinite_0.2s]"
                  />
                  
                  {/* Medical coat */}
                  <path 
                    d="M20 32 L20 50 L44 50 L44 32 Q44 28 40 28 L24 28 Q20 28 20 32 Z" 
                    fill="currentColor"
                    className="animate-[float_3.5s_ease-in-out_infinite]"
                  />
                  
                  {/* Stethoscope - animated */}
                  <g className="animate-[swing_2s_ease-in-out_infinite]" style={{ transformOrigin: '32px 32px' }}>
                    <path 
                      d="M28 35 Q28 40 32 40 Q36 40 36 35" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      fill="none"
                      opacity="0.9"
                    />
                    <circle cx="32" cy="40" r="2" fill="currentColor" opacity="0.9" />
                    <line x1="28" y1="35" x2="28" y2="32" stroke="currentColor" strokeWidth="2" opacity="0.9" />
                    <line x1="36" y1="35" x2="36" y2="32" stroke="currentColor" strokeWidth="2" opacity="0.9" />
                  </g>
                  
                  {/* Medical cross badge */}
                  <g className="animate-pulse">
                    <rect x="38" y="30" width="6" height="2" fill="currentColor" opacity="0.7" rx="1" />
                    <rect x="40" y="28" width="2" height="6" fill="currentColor" opacity="0.7" rx="1" />
                  </g>
                </svg>
                
                {/* Pulsing AI indicator */}
                <span className="ai-spark absolute -top-1 -right-1" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-card-foreground">Jenny · AI</h3>
                  <Sparkles className="w-4 h-4 text-[hsl(var(--accent))] animate-pulse" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Medical management and real-time predictions
                </p>
              </div>

              {/* Greeting Message */}
              <div className="bg-gradient-ai-subtle rounded-xl p-3 border border-[hsl(var(--border-light))]">
                <p className="text-sm text-card-foreground leading-relaxed">
                  Hi 👋 I'm Jenny, your AI medical assistant. I can help you analyze inventory, predict shortages, or generate smart orders.
                </p>
              </div>

              {/* Start Chat Button */}
              <Button 
                onClick={() => setIsOpen(true)}
                className="w-full bg-gradient-ai text-white hover:opacity-90 ai-hover-glow"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Start Chat
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AIChatPopup open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
