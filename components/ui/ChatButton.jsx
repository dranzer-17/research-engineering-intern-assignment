// components/ui/ChatButton.jsx
"use client";
import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function ChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    // Add user message to chat
    const userMessage = {
      type: 'user',
      text: query
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response');
      }
      
      const data = await response.json();
      
      // Add bot response to chat
      const botMessage = {
        type: 'bot',
        text: data.answer,
        sources: data.sources
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error fetching response:', error);
      // Add error message
      const errorMessage = {
        type: 'bot',
        text: 'Sorry, I encountered an error. Please try again.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setQuery('');
    }
  };

  return (
    <>
      {/* Chat Button */}
      <Button
        className="fixed bottom-7 right-7 rounded-full p-4 shadow-lg w-12 h-12 flex items-center justify-center bg-black text-white"
        onClick={toggleChat}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </Button>

      {/* Chat Modal */}
      {isOpen && (
        <Card className="fixed bottom-20 right-6 w-96 max-h-[70vh] shadow-xl border z-50 flex flex-col">
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle className="text-lg flex items-center">
              <MessageCircle className="mr-2 h-5 w-5 text-red-500" />
              Ask Reddify
            </CardTitle>
          </CardHeader>
          
          <CardContent className="overflow-y-auto flex-grow p-3 space-y-4 max-h-[50vh]">
            {messages.length === 0 && (
              <div className="text-gray-500 text-center py-8">
                <p>Ask me anything about Reddit posts!</p>
              </div>
            )}
            
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`rounded-lg px-4 py-2 max-w-[80%] ${
                  msg.type === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  <p>{msg.text}</p>
                  
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2 text-xs">
                      <p className="font-semibold">Sources:</p>
                      <ul className="list-disc pl-4">
                        {msg.sources.slice(0, 3).map((source, idx) => (
                          <li key={idx}>
                            r/{source.subreddit} - {source.title.substring(0, 30)}
                            {source.title.length > 30 ? '...' : ''}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-4 py-2">
                  <div className="flex space-x-2">
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="border-t p-3 bg-white">
            <form onSubmit={handleSubmit} className="flex w-full gap-2">
              <Input
                type="text"
                placeholder="Ask about Reddit posts..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={isLoading}
                className="flex-grow"
              />
              <Button 
                type="submit" 
                disabled={isLoading || !query.trim()}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}
    </>
  );
}