import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, X, Send, Loader2 } from 'lucide-react';
import { Markdown } from '../components/Markdown';

interface Message {
  role: 'user' | 'bot';
  text: string;
}

export function CoinkieChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: "Hey! I'm Coinkie 👋 Ask me literally anything about money — savings, UPI, credit cards, stocks, scams, all of it. No question is too small." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: messages.slice(1).map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            text: msg.text
          }))
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessages(prev => [...prev, { role: 'bot', text: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'bot', text: data.error || 'Oops! My circuits got tangled. Try again?' }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: "Hmm, I couldn't reach the internet. Try again later!" }]);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-5 md:right-10 w-[95vw] md:w-[480px] max-w-lg bg-[#FFFDF0] border-4 border-[#09090B] rounded-3xl shadow-[8px_8px_0px_#09090B] z-50 flex flex-col overflow-hidden"
            style={{ height: '650px', maxHeight: '80vh' }}
          >
            {/* Header */}
            <div className="bg-[#26355D] text-white border-b-4 border-[#09090B] p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="bg-[#FFFDF0] text-[#09090B] p-1.5 border-2 border-[#09090B] rounded-full">
                  <Bot className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-lg">Coinkie</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-[#09090B]/10 rounded-full transition-colors"
              >
                <X className="w-6 h-6 stroke-[2.5px]" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/50">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-5 py-3 border-2 border-[#09090B] text-base ${
                      msg.role === 'user'
                        ? 'bg-[#FF2A85] text-white rounded-tr-sm'
                        : 'bg-white rounded-tl-sm shadow-[2px_2px_0px_#09090B]'
                    }`}
                  >
                    {msg.role === 'bot' ? (
                      <div className="prose prose-base font-sans">
                        <Markdown>{msg.text}</Markdown>
                      </div>
                    ) : (
                      <p className="font-sans font-medium">{msg.text}</p>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 border-2 border-[#09090B] shadow-[2px_2px_0px_#09090B]">
                    <Loader2 className="w-4 h-4 animate-spin text-[#09090B]/50" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-3 bg-white border-t-4 border-[#09090B]">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-[#FFFDF0] border-2 border-[#09090B] rounded-full px-5 py-3 text-base outline-none focus:bg-white transition-colors font-medium placeholder:text-[#09090B]/40"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="bg-[#26355D] hover:bg-[#1a2542] text-white border-2 border-[#09090B] rounded-full p-2.5 shadow-[2px_2px_0px_0px_#09090B] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_#09090B] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 md:right-10 z-50 bg-[#26355D] hover:bg-[#1a2542] text-white border-4 border-[#09090B] rounded-full p-4 shadow-[4px_4px_0px_0px_#09090B] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#09090B] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all flex items-center justify-center group"
        title="Chat with Coinkie"
      >
        <span className="sr-only">Chat with Coinkie</span>
        {isOpen ? (
          <X className="w-6 h-6 stroke-[2.5px]" />
        ) : (
          <Bot className="w-6 h-6 stroke-[2.5px]" />
        )}
      </button>
    </>
  );
}
