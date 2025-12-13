import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sparkles, Send, Package, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CreatePurchaseOrderDialog } from "./CreatePurchaseOrderDialog";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  showCreateOrder?: boolean;
}

export function InventoryChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hi! I\'m Jenny, your AI-powered inventory assistant. I can help you with queries about stock levels, forecasts, and recommendations. How can I assist you today?'
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPODialog, setShowPODialog] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleCreateOrder = () => {
    setShowPODialog(true);
    setIsOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("inventory-chat", {
        body: {
          message: input,
          conversationHistory: messages,
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        showCreateOrder: data.shouldCreatePO && data.alertsCount > 0,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error.message || "Could not send message",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <div className="relative">
              {/* Chat invitation bubble */}
              {!isOpen && (
                <div 
                  className="absolute bottom-20 right-0 mb-2 mr-2 animate-fade-in"
                  style={{ animation: 'fade-in 0.5s ease-out 1s both, float 3s ease-in-out infinite 1.5s' }}
                >
                  <div className="relative">
                    <div className="bg-card-ai-glass border border-[hsl(var(--border))] rounded-2xl px-4 py-3 shadow-xl backdrop-blur-xl max-w-[200px]">
                      <p className="text-sm font-medium text-card-foreground">
                        Hi! I'm Jenny 👋
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Ask me about your inventory!
                      </p>
                    </div>
                    {/* Arrow pointing to button */}
                    <div className="absolute -bottom-2 right-8 w-4 h-4 bg-card-ai-glass border-r border-b border-[hsl(var(--border))] transform rotate-45" />
                  </div>
                </div>
              )}
              
              <Button
                size="lg"
                className="h-16 w-16 rounded-full shadow-2xl bg-gradient-ai text-white hover:opacity-90 
                         ai-hover-glow transition-all duration-300"
                style={{ animation: 'float 3s ease-in-out infinite' }}
              >
                <div className="relative">
                  <Sparkles className="h-7 w-7" />
                  <span className="ai-spark absolute -top-1 -right-1 scale-75" />
                </div>
              </Button>
            </div>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-xl p-0 backdrop-blur-xl bg-background/95">
            <div className="flex flex-col h-full">
              {/* AI Header */}
              <div className="p-6 border-b border-[hsl(var(--border))] bg-gradient-ai">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center relative">
                    <Sparkles className="h-6 w-6 text-white" />
                    <span className="ai-spark absolute -top-1 -right-1" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Jenny</h2>
                    <p className="text-sm text-white/80">Your AI Inventory Assistant</p>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl p-4 ${
                        message.role === 'user'
                          ? 'bg-gradient-ai text-white shadow-lg'
                          : 'card-ai-glass'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      {message.showCreateOrder && (
                        <Button
                          onClick={handleCreateOrder}
                          size="sm"
                          className="mt-3 w-full bg-gradient-ai text-white hover:opacity-90"
                        >
                          <Package className="w-4 h-4 mr-2" />
                          Create Purchase Order
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="card-ai-glass p-4 ai-shimmer">
                      <Loader2 className="w-5 h-5 animate-spin text-[hsl(var(--primary))]" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-[hsl(var(--border))] bg-muted/20 backdrop-blur-sm">
                <form onSubmit={handleSubmit} className="flex space-x-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about levels, forecasts, or recommendations..."
                    disabled={loading}
                    className="flex-1 border-[hsl(var(--input-border))] focus:border-[hsl(var(--primary))]"
                  />
                  <Button 
                    type="submit" 
                    disabled={loading || !input.trim()}
                    className="bg-gradient-ai text-white hover:opacity-90"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <CreatePurchaseOrderDialog
        open={showPODialog}
        onOpenChange={setShowPODialog}
      />
    </>
  );
}
