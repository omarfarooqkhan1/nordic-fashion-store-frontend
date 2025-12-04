import React, { useState, useRef, useEffect } from 'react';
import { Send, X, MessageCircle, Clock, Zap, ChevronRight } from 'lucide-react';
import { chatbotApi } from '@/api/chatbot';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  cached?: boolean;
  fallback?: boolean;
}

// Define commonly asked questions
const COMMON_QUESTIONS = [
  {
    id: 1,
    question: "What is your return policy?",
    category: "Returns & Exchanges"
  },
  {
    id: 2,
    question: "How long does shipping take?",
    category: "Shipping"
  },
  {
    id: 3,
    question: "Do you offer international shipping?",
    category: "Shipping"
  },
  {
    id: 4,
    question: "What materials are your products made of?",
    category: "Product Information"
  },
  {
    id: 5,
    question: "How do I care for my leather products?",
    category: "Product Care"
  },
  {
    id: 6,
    question: "What payment methods do you accept?",
    category: "Payment"
  }
];

export const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showFAQs, setShowFAQs] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change or when chat is opened
  useEffect(() => {
    if (isOpen && scrollAreaRef.current) {
      // Use setTimeout to ensure DOM has updated
      setTimeout(() => {
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
      }, 0);
    }
  }, [messages, showWelcome, showFAQs, isOpen]);

  const sendQuestion = async (question: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: question,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setShowFAQs(false); // Hide FAQs when user sends a message
    setShowWelcome(false); // Hide welcome message when user sends a message

    try {
      // Call API
      const response = await chatbotApi.sendMessage(question);
      
      // Add bot response
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.success ? response.response || 'Sorry, I could not process that.' : response.error || 'Sorry, something went wrong.',
        timestamp: new Date(),
        cached: response.cached,
        fallback: response.fallback
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error: any) {
      console.error('Chatbot error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message || 'Unknown error'}. Please try again.`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isLoading) return;

    await sendQuestion(inputValue.trim());
    setInputValue('');
  };

  const handleCommonQuestionClick = (question: string) => {
    // Send the question immediately when clicked
    sendQuestion(question);
  };

  const toggleChat = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    
    // When chat is opened, scroll to the last message if there are any messages
    if (newIsOpen) {
      // If there are existing messages, don't show FAQs or welcome message
      if (messages.length > 0) {
        setShowFAQs(false);
        setShowWelcome(false);
      } else {
        // If no messages, show welcome message and FAQs
        setShowWelcome(true);
        setShowFAQs(true);
      }
      
      // Scroll to bottom after a short delay to ensure DOM is updated
      setTimeout(() => {
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
      }, 100);
    }
    
    // Hide welcome message and FAQs when chat is closed
    if (!newIsOpen) {
      setShowWelcome(false);
      setShowFAQs(false);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gold-500 rounded-full shadow-lg flex items-center justify-center text-leather-900 hover:bg-gold-600 transition-all z-50 border-2 border-gold-400"
        aria-label="Open chat"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-full max-w-md h-[500px] bg-card rounded-lg shadow-xl border border-border flex flex-col z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-gold-50 to-gold-100 dark:from-gold-900/20 dark:to-gold-800/20">
            <h3 className="font-semibold text-foreground">Fashion Assistant</h3>
            <button 
              onClick={toggleChat}
              className="text-foreground hover:text-gold-700 dark:hover:text-gold-300"
              aria-label="Close chat"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4 bg-background" ref={scrollAreaRef}>
            <div className="space-y-4">
              {/* Show welcome message */}
              {showWelcome && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg p-3 relative bg-leather-100 dark:bg-leather-800 text-foreground">
                    <p className="whitespace-pre-wrap">Hello! I'm your Nordic Fashion assistant. How can I help you today?</p>
                    <p className="text-xs mt-1 opacity-70">
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Show common questions */}
              {showFAQs && (
                <div className="mt-4">
                  <h4 className="font-medium text-foreground mb-3">Commonly Asked Questions:</h4>
                  <div className="space-y-2">
                    {COMMON_QUESTIONS.map((faq) => (
                      <button
                        key={faq.id}
                        onClick={() => handleCommonQuestionClick(faq.question)}
                        className="w-full text-left p-3 rounded-lg border border-border hover:bg-gold-50 dark:hover:bg-gold-900/20 transition-colors flex items-center justify-between group"
                      >
                        <span className="text-foreground">{faq.question}</span>
                        <ChevronRight 
                          size={16} 
                          className="text-muted-foreground group-hover:text-gold-500 transition-colors" 
                        />
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 text-center">
                    Or type your own question below
                  </p>
                </div>
              )}

              {/* Show conversation messages */}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 relative ${
                      message.role === 'user'
                        ? 'bg-gold-500 text-leather-900'
                        : 'bg-leather-100 dark:bg-leather-800 text-foreground'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {message.cached && (
                        <span className="ml-2 inline-flex items-center text-xs">
                          <Clock size={12} className="mr-1" />
                          Cached
                        </span>
                      )}
                      {message.fallback && (
                        <span className="ml-2 inline-flex items-center text-xs">
                          <Zap size={12} className="mr-1" />
                          Quick response
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-leather-100 dark:bg-leather-800 text-foreground rounded-lg p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gold-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gold-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-gold-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-border bg-background">
            <div className="flex gap-2">
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about our products, sizing, or styling..."
                className="flex-1 resize-none border-border bg-card text-foreground"
                rows={2}
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                size="icon"
                disabled={!inputValue.trim() || isLoading}
                className="self-end h-10 w-10 bg-gold-500 hover:bg-gold-600 text-leather-900"
              >
                <Send size={16} />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Powered by AI. Responses may vary.
            </p>
          </form>
        </div>
      )}
    </>
  );
};