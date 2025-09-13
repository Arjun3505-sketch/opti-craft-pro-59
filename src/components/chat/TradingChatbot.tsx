import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, User, Bot, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

interface TradingChatbotProps {
  className?: string;
}

export function TradingChatbot({ className }: TradingChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      content:
        "Hello! I'm your AI Trading Assistant. Please enter your Trader ID to get personalized recommendations and market insights.",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [traderId, setTraderId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasSetTraderId, setHasSetTraderId] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const baseURL = "http://localhost:5001"; // ✅ points to your Flask backend

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (
    content: string,
    type: "user" | "bot",
    isLoading = false
  ) => {
    const newMessage: Message = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      content,
      timestamp: new Date(),
      isLoading,
    };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage.id;
  };

  const updateMessage = (id: string, content: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === id ? { ...msg, content, isLoading: false } : msg
      )
    );
  };

  const callTradingAPI = async (query: string, endpoint: string) => {
    try {
      if (endpoint === "recommendations") {
        const response = await fetch(
          `${baseURL}/api/recommendations/${traderId}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              query,
              symbols: ["AAPL", "GOOGL", "MSFT", "TSLA", "NVDA"],
              include_stock_recommendations: true,
            }),
          }
        );
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
      } else if (endpoint === "market-analysis") {
        const response = await fetch(
          `${baseURL}/api/market-analysis?symbols=AAPL,GOOGL,MSFT,TSLA,NVDA`
        );
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
      } else if (endpoint.startsWith("stock-price:")) {
        const symbol = endpoint.split(":")[1];
        const response = await fetch(
          `${baseURL}/api/stock-data/${encodeURIComponent(symbol)}`
        );
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
      } else if (endpoint === "portfolio") {
        const response = await fetch(`${baseURL}/api/portfolio/${traderId}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
      }
    } catch (error) {
      throw new Error(`Failed to fetch from trading API: ${error}`);
    }
  };

  const validateTraderId = async (traderId: string): Promise<boolean> => {
    try {
      const response = await fetch(
        `${baseURL}/api/recommendations/${traderId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: "validate",
            symbols: ["AAPL"],
            include_stock_recommendations: false,
          }),
        }
      );

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error("Error validating trader ID:", error);
      return false;
    }
  };

  const processUserMessage = async (message: string) => {
    if (!hasSetTraderId) {
      if (message.trim()) {
        const traderId = message.trim();
        const loadingMessageId = addMessage(
          "Validating your Trader ID...",
          "bot",
          true
        );

        const isValid = await validateTraderId(traderId);

        if (isValid) {
          setTraderId(traderId);
          setHasSetTraderId(true);
          updateMessage(
            loadingMessageId,
            `Great! I've validated your Trader ID: ${traderId}. Now you can ask me about:

• Market analysis and insights
• Personalized trading recommendations
• Portfolio details
• Stock prices`
          );
        } else {
          updateMessage(
            loadingMessageId,
            `Sorry, I couldn't validate the Trader ID "${traderId}". Please make sure you're entering a valid Trader ID.`
          );
        }
      } else {
        addMessage("Please enter a valid Trader ID to continue.", "bot");
      }
      return;
    }

    const loadingMessageId = addMessage(
      "Analyzing your request...",
      "bot",
      true
    );

    try {
      const lowerMessage = message.toLowerCase();
      let response;

      if (
        lowerMessage.includes("market") ||
        lowerMessage.includes("analysis") ||
        lowerMessage.includes("sentiment")
      ) {
        response = await callTradingAPI(message, "market-analysis");
        if (response.success) {
          const analysis = response.analysis;
          updateMessage(
            loadingMessageId,
            `📊 **Market Analysis**\n\n${analysis}`
          );
        }
      } else if (
        lowerMessage.includes("portfolio") ||
        lowerMessage.includes("holdings")
      ) {
        response = await callTradingAPI(message, "portfolio");
        if (response.success) {
          const portfolio = response.portfolio;
          const metrics = response.metrics;
          let portfolioText = `📂 **Portfolio Overview**\n\nValue: $${metrics.total_portfolio_value?.toFixed(
            2
          )}\nWin Rate: ${metrics.win_rate?.toFixed(1)}%\nTrades: ${
            metrics.total_trades
          }\n\nPositions:\n`;
          portfolio.positions.forEach((pos: any) => {
            portfolioText += `• ${pos.symbol}: ${pos.quantity} @ $${pos.current_market_price}\n`;
          });
          updateMessage(loadingMessageId, portfolioText);
        }
      } else if (
        /(?:price|quote|current\s+price)\s+of\s+([A-Za-z]{1,5})/.test(
          lowerMessage
        ) ||
        /^(?:[A-Za-z]{1,5})\s+price$/.test(lowerMessage)
      ) {
        const match =
          message.match(
            /(?:price|quote|current\s+price)\s+of\s+([A-Za-z]{1,5})/i
          ) || message.match(/^([A-Za-z]{1,5})\s+price$/i);
        const symbol = match ? match[1].toUpperCase() : "AAPL";
        response = await callTradingAPI(message, `stock-price:${symbol}`);
        if (response.success) {
          const data = response.data || {};
          const price = data.current_price ?? 0;
          const changePct = data.change_percent ?? 0;
          updateMessage(
            loadingMessageId,
            `💵 **${symbol} Price**: $${Number(price).toFixed(
              2
            )} (${Number(changePct).toFixed(2)}%)`
          );
        }
      } else {
        response = await callTradingAPI(message, "recommendations");
        if (response.success) {
          updateMessage(loadingMessageId, response.recommendations);
        }
      }

      if (!response?.success) {
        throw new Error(response?.error || "Unknown error occurred");
      }
    } catch (error) {
      updateMessage(
        loadingMessageId,
        `⚠️ I couldn’t connect to the backend on port 5001.\n\nError: ${error}`
      );
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    const userMessage = inputMessage.trim();
    setInputMessage("");
    setIsLoading(true);

    addMessage(userMessage, "user");
    await processUserMessage(userMessage);

    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className={cn(
            "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-primary hover:bg-primary/90 z-50",
            className
          )}
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[500px] shadow-2xl border-0 z-50 flex flex-col bg-background">
          <div className="flex items-center justify-between p-4 border-b bg-primary/5 rounded-t-lg">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">AI Trading Assistant</h3>
                <p className="text-xs text-muted-foreground">
                  {hasSetTraderId ? `Trader: ${traderId}` : "Setup required"}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-2",
                    message.type === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.type === "bot" && (
                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="h-3 w-3 text-primary" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                      message.type === "user"
                        ? "bg-primary text-primary-foreground ml-auto"
                        : "bg-muted"
                    )}
                  >
                    {message.isLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>Thinking...</span>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap">
                        {message.content}
                      </div>
                    )}
                  </div>
                  {message.type === "user" && (
                    <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div ref={messagesEndRef} />
          </ScrollArea>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  hasSetTraderId
                    ? "Ask about markets, portfolio, or stock prices..."
                    : "Enter your Trader ID..."
                }
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim()}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
}
