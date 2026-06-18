import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Compass, User } from 'lucide-react';

export default function AiAssistant() {
  const [messages, setMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([
    { sender: 'ai', text: "Hello! I am your general TripPilot Travel Assistant. Ask me anything about routes, packing essentials, road conditions, or local food spots!" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const query = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: query }]);
    setInput('');
    setIsLoading(true);

    try {
      // Map message sender values to roles for OpenAI API standard formatting
      const history = messages.map(msg => ({
        role: msg.sender === 'ai' ? ('assistant' as const) : ('user' as const),
        content: msg.text
      }));

      // Retrieve OpenAI key override from local storage
      const userOpenaiKey = localStorage.getItem('VITE_OPENAI_API_KEY') || '';

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-openai-key': userOpenaiKey
        },
        body: JSON.stringify({ message: query, history })
      });
      const data = await response.json();
      
      setMessages(prev => [...prev, { sender: 'ai', text: data.text || data.error || "No response received from the advisor." }]);
    } catch (err) {
      console.error("Chat request failed:", err);
      setMessages(prev => [...prev, { sender: 'ai', text: "I ran into a problem connecting to the AI advisory server. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col justify-between max-w-4xl mx-auto animate-slide-up">
      {/* Header */}
      <div className="pb-3 border-b border-white/5">
        <h1 className="text-2xl font-extrabold text-white font-display">AI Travel Advisor</h1>
        <p className="text-gray-400 text-xs mt-1">Consult our AI engine on packing checklists, route safety, or travel warnings.</p>
      </div>

      {/* Message Feed */}
      <div className="grow overflow-y-auto space-y-4 my-4 pr-1">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.sender === 'ai' ? 'justify-start' : 'justify-end'}`}>
            <div className={`flex gap-3 max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center border font-bold text-xs ${
                msg.sender === 'ai' 
                  ? 'bg-indigo-600/10 border-indigo-500/20 text-indigo-400 font-display' 
                  : 'bg-white/5 border-white/5 text-gray-400'
              }`}>
                {msg.sender === 'ai' ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed border ${
                msg.sender === 'ai' 
                  ? 'bg-slate-900/60 border-white/5 text-gray-300 rounded-tl-sm shadow-inner' 
                  : 'bg-indigo-600 border-indigo-500 text-white rounded-tr-sm shadow-md'
              }`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        
        {/* Typing loader indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-3 max-w-[80%]">
              <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center border bg-indigo-600/10 border-indigo-500/20 text-indigo-400">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
              <div className="p-4 rounded-2xl text-xs sm:text-sm leading-relaxed border bg-slate-900/60 border-white/5 text-gray-400 rounded-tl-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={chatEndRef}></div>
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 rounded-2xl glass-panel border-white/5 flex gap-3 shadow-xl">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
          placeholder={isLoading ? "AI is processing travel query..." : "Ask general travel questions (e.g. 'What to pack for Leh?')"}
          className="grow px-4 py-3.5 glass-input text-xs sm:text-sm disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="p-3.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white transition shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
