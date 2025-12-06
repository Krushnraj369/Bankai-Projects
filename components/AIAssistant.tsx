import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, X, Send, Loader2 } from 'lucide-react';
import { aiService } from '../services/aiService';
import { useNavigate } from 'react-router-dom';

export const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: "Hello! I'm Bankai, your QA Copilot. Ask me about test coverage, failures, or say 'Create Test' to start." }
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isOpen]);

  const handleSubmit = async () => {
    if (!query.trim()) return;

    const text = query;
    setMessages(prev => [...prev, { role: 'user', text }]);
    setQuery('');
    setIsThinking(true);

    // Process Query
    try {
      const result = await aiService.processNaturalQuery(text, []); 
      
      setMessages(prev => [...prev, { role: 'ai', text: result.text }]);
      
      // Handle Actions
      if (result.action === 'NAVIGATE_CREATE') {
        setTimeout(() => {
            setIsOpen(false);
            navigate('/create');
        }, 2000);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', text: "I'm having trouble connecting to my neural core. Please try again." }]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <>
      {/* Floating Trigger - Theme Aware & Compact */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-12 h-12 flex items-center justify-center rounded-full shadow-2xl transition-all duration-300 border border-white/20 backdrop-blur-md bg-primary-600 text-white hover:bg-primary-500 hover:shadow-primary-500/40 ${isOpen ? 'hidden' : 'flex'}`}
        whileHover={{ scale: 1.1, rotate: 10 }}
        whileTap={{ scale: 0.9 }}
      >
        <BrainCircuit size={22} />
        {/* Pulse Ring */}
        <span className="absolute -inset-1 rounded-full bg-primary-500 opacity-30 animate-ping"></span>
      </motion.button>

      {/* Chat Interface */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 w-full max-w-sm h-[500px] flex flex-col bg-surface/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between bg-primary-600/10">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="font-bold text-heading flex items-center gap-2">
                  <BrainCircuit size={18} className="text-primary-600" /> Bankai Copilot
                </span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-muted hover:text-heading transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-background/50">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-primary-600 text-white rounded-tr-none'
                        : 'bg-surface border border-border text-heading rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {isThinking && (
                <div className="flex justify-start">
                  <div className="bg-surface p-3 rounded-2xl rounded-tl-none border border-border shadow-sm">
                    <Loader2 size={16} className="text-primary-500 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-border bg-surface">
              <div className="relative flex items-center gap-2">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  placeholder="Ask anything..."
                  className="flex-1 bg-background border border-border rounded-full px-4 py-2 text-sm text-heading focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all placeholder-muted"
                />
                <button
                  onClick={handleSubmit}
                  disabled={!query.trim()}
                  className="p-2 rounded-full bg-primary-600 text-white hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};