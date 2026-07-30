import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { apiRequest } from '@/lib/queryClient';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

export function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm your immigration assistant. How can I help you today? I can answer questions about our EB3 Work Visa Program, Study Abroad services, and more.",
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [sessionId] = useState(generateSessionId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const conversationHistory = messages.map(m => ({
        role: m.role,
        content: m.content,
      }));
      
      const response = await apiRequest('POST', '/api/ai/chat', {
        message,
        conversationHistory,
        sessionId,
      });
      
      return response.json();
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    },
    onError: () => {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: "I'm sorry, I'm having trouble responding right now. Please try again or contact us directly via WhatsApp." },
      ]);
    },
  });

  const handleSend = () => {
    if (!inputValue.trim() || chatMutation.isPending) return;
    
    const userMessage = inputValue.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInputValue('');
    chatMutation.mutate(userMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <Button
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
        onClick={() => setIsOpen(true)}
        data-testid="button-open-chat"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-[380px] h-[500px] shadow-2xl z-50 flex flex-col">
      <CardHeader className="pb-3 flex flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <Bot className="h-4 w-4 text-primary-foreground" />
          </div>
          <CardTitle className="text-base">Immigration Assistant</CardTitle>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} data-testid="button-close-chat">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 flex flex-col min-h-0">
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-4 py-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-3 w-3 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                  data-testid={`message-${message.role}-${index}`}
                >
                  {message.content}
                </div>
                {message.role === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <User className="h-3 w-3" />
                  </div>
                )}
              </div>
            ))}
            {chatMutation.isPending && (
              <div className="flex gap-2 justify-start">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-3 w-3 text-primary" />
                </div>
                <div className="bg-muted rounded-lg px-3 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              placeholder="Ask me anything..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={chatMutation.isPending}
              data-testid="input-chat-message"
            />
            <Button 
              size="icon" 
              onClick={handleSend} 
              disabled={!inputValue.trim() || chatMutation.isPending}
              data-testid="button-send-message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Powered by AI - For personalized advice, contact our team
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
