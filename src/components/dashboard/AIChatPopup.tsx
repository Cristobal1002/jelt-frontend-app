import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Sparkles, Package, TrendingDown, Users, ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CreatePurchaseOrderDialog } from "./CreatePurchaseOrderDialog";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  showCreateOrder?: boolean;
  timestamp: Date;
}

interface AIChatPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AIChatPopup({ open, onOpenChange }: AIChatPopupProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Welcome back! How can I assist you today?',
      timestamp: new Date()
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
    onOpenChange(false);
  };

  const handleQuickAction = (action: string) => {
    setInput(action);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date()
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
        timestamp: new Date()
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

  const quickActions = [
    { icon: TrendingDown, label: "Analyze shortages", query: "Show me products at risk of shortage" },
    { icon: Package, label: "Predict demand", query: "Predict demand for the next month" },
    { icon: Users, label: "Recommend suppliers", query: "Recommend best performing suppliers" },
    { icon: ShoppingCart, label: "Create order", query: "Help me create a purchase order for low stock items" }
  ];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl h-[85vh] p-0 overflow-hidden backdrop-blur-2xl bg-background/95 border-[hsl(var(--border))] shadow-2xl">
          {/* Header with Animated Avatar */}
          <DialogHeader className="p-6 border-b border-[hsl(var(--border))] bg-gradient-ai">
            <div className="flex items-center gap-4">
              {/* Animated Doctor Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg relative overflow-hidden">
                  <svg 
                    className="w-8 h-8 text-white animate-[float_3s_ease-in-out_infinite]" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="8" r="4" />
                    <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
                    <path d="M12 12v3" />
                    <circle cx="12" cy="16" r="1" />
                  </svg>
                  <span className="ai-spark absolute -top-1 -right-1" />
                </div>
              </div>

              <div className="flex-1">
                <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                  Jenny · AI Medical Assistant
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </DialogTitle>
                <p className="text-sm text-white/80 mt-1">
                  Real-time inventory intelligence and predictions
                </p>
              </div>
            </div>
          </DialogHeader>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ maxHeight: 'calc(85vh - 280px)' }}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl p-4 ${
                    message.role === 'user'
                      ? 'bg-gradient-ai text-white shadow-lg'
                      : 'card-ai-glass'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-white/70' : 'text-muted-foreground'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {message.showCreateOrder && (
                    <Button
                      onClick={handleCreateOrder}
                      size="sm"
                      className="mt-3 w-full bg-white text-[hsl(var(--primary))] hover:bg-white/90"
                    >
                      <Package className="w-4 h-4 mr-2" />
                      Create Purchase Order
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            {/* Thinking Animation */}
            {loading && (
              <div className="flex justify-start animate-fade-in">
                <div className="card-ai-glass p-4 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-[hsl(var(--primary))] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-[hsl(var(--primary))] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-[hsl(var(--primary))] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-xs text-muted-foreground">Jenny is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="px-6 pb-4 border-t border-[hsl(var(--border))] bg-muted/10">
            <div className="grid grid-cols-2 gap-2 mt-4">
              {quickActions.map((action) => (
                <Button
                  key={action.label}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction(action.query)}
                  disabled={loading}
                  className="justify-start text-xs hover:bg-gradient-ai hover:text-white hover:border-transparent transition-all"
                >
                  <action.icon className="w-3.5 h-3.5 mr-2" />
                  {action.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-6 border-t border-[hsl(var(--border))] bg-muted/20 backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about inventory, forecasts, suppliers, or orders..."
                disabled={loading}
                className="flex-1 border-[hsl(var(--input-border))] focus:border-[hsl(var(--primary))] bg-white"
                autoFocus
              />
              <Button 
                type="submit" 
                disabled={loading || !input.trim()}
                className="bg-gradient-ai text-white hover:opacity-90 px-6"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      <CreatePurchaseOrderDialog
        open={showPODialog}
        onOpenChange={setShowPODialog}
      />
    </>
  );
}
