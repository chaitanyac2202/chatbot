import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Zap, X, Send, User, Sparkles, ShieldAlert, Cpu, RefreshCw, HelpCircle, ChevronDown, Mic } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { vectorDB } from './vectorDb';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { RetellVoiceUI } from './RetellVoiceUI';

// Initialize Gemini
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const SYSTEM_INSTRUCTION = "You are the CareGuide Chatbot Pro. If the user asks you to generate, create, draw, or make an image, YOU MUST generate it by outputting exactly this tag: [IMAGE_PROMPT: your highly descriptive prompt here]. 1. Create a highly descriptive prompt for a beautiful, high-quality, realistic masterpiece. If they ask for a specific brand or item (like 'Dolo 650 tablet sheet'), describe its iconic real-world appearance in extreme detail (e.g. 'a realistic medical silver foil blister pack containing 15 oval white tablets, with blue and orange printed text saying DOLO 650 on the packaging, studio lighting, macro photography'). 2. Output ONLY the tag and a short friendly message. Do NOT use Pollinations AI. Do NOT apologize.";
const primaryModel = genAI.getGenerativeModel({ model: "gemini-flash-latest", systemInstruction: SYSTEM_INSTRUCTION });
const fallbackModel = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest", systemInstruction: SYSTEM_INSTRUCTION });

const StandardLogo = ({ size = 22, className = '' }: { size?: number, className?: string }) => (
  <div className={`font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 drop-shadow-md flex items-center justify-center tracking-tighter ${className}`} style={{ fontSize: size * 0.85 }}>C</div>
);

const ProLogo = ({ size = 22, className = '' }: { size?: number, className?: string }) => (
  <div className={`font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-purple-600 to-pink-500 drop-shadow-md italic flex items-baseline justify-center tracking-tighter ${className}`}>
    <span style={{ fontSize: size * 0.85 }}>C</span>
    <span style={{ fontSize: size * 0.5 }}>pro</span>
  </div>
);
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  confidence?: number;
  category?: string;
  isError?: boolean;
}

type ChatMode = 'standard' | 'pro';

const QUICK_PROMPTS = [
  { label: '🌐 How website works', query: 'How does this website work and what is the process?' },
  { label: '⚡ Explain workflow', query: 'Explain the workflow of CareGuide step by step' },
  { label: '👨‍💻 Who created you?', query: 'Who created you and who is chaitu?' },
  { label: '🤒 Cold & fever steps', query: 'I have a common cold and mild fever, what can I do?' },
  { label: '🚨 Emergency signs', query: 'What are the emergency red flags when I should go to a hospital?' }
];

const renderMessageText = (text: string) => {
  // Regex to match markdown images: ![alt](url)
  const imgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  
  const parts = [];
  let lastIndex = 0;
  let match;
  
  while ((match = imgRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex, match.index)}</span>);
    }
    parts.push(
      <a 
        key={`link-${match.index}`} 
        href={match[2]} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block my-2"
        title="Click to view full image"
      >
        <img 
          src={match[2]} 
          alt={match[1]} 
          className="w-full h-auto rounded-xl shadow-sm border border-slate-200 hover:opacity-90 transition-opacity cursor-pointer"
          loading="lazy"
        />
      </a>
    );
    lastIndex = match.index + match[0].length;
  }
  
  if (lastIndex < text.length) {
    parts.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex)}</span>);
  }
  
  return parts.length > 0 ? <>{parts}</> : text;
};

export const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<ChatMode>('standard');
  const [isModeDropdownOpen, setIsModeDropdownOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showRetell, setShowRetell] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getInitialMessages = (currentMode: ChatMode): Message[] => {
    if (currentMode === 'standard') {
      return [{
        id: '1',
        text: "👋 **Hello! I am the CareGuide Neural Assistant.**\n\nPowered by an on-device **Vector Database** engineered by **Chaitu**.\n\nI can explain the **website workflow**, guide you through **minor symptoms**, or answer questions about home care. How may I assist you today?",
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        confidence: 0.99,
        category: 'system'
      }];
    } else {
      return [{
        id: '1',
        text: "✨ **Welcome to Chatbot Pro!**\n\nI am powered by **Google Gemini** for advanced reasoning and conversational AI.\n\nYou can also click **Talk to Retell AI Voice** above to speak with my voice agent and book appointments instantly!\n\nHow can I help you?",
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category: 'system'
      }];
    }
  };

  const [messages, setMessages] = useState<Message[]>(getInitialMessages('standard'));

  useEffect(() => {
    setMessages(getInitialMessages(mode));
    setShowRetell(false); // Reset Retell view on mode change
  }, [mode]);

  useEffect(() => {
    if (messagesEndRef.current && !showRetell) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, showRetell]);

  const executeVectorSearch = (query: string) => {
    const searchResults = vectorDB.search(query, 1, 0.17);

    if (searchResults.length > 0 && searchResults[0].score >= 0.17) {
      const topMatch = searchResults[0];
      return {
        text: topMatch.response,
        confidence: topMatch.score,
        category: topMatch.category,
        isError: false
      };
    }

    return {
      text: 
        `⚠️ **Sorry, there is no information found for this query.**\n\n` +
        `I couldn't locate relevant guidance in our local clinical vector database. ` +
        `As CareGuide's home-care assistant, I am designed to assist with:\n\n` +
        `• **Website Navigation & Workflow**\n` +
        `• **Platform Creator**\n` +
        `• **Minor Symptoms**\n` +
        `• **Emergency Red Flags**\n\n` +
        `Please feel free to rephrase or tap one of the suggested prompts below!`,
      confidence: 0,
      category: 'fallback',
      isError: true
    };
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newUserMsg: Message = {
      id: Date.now().toString(),
      text: query,
      sender: 'user',
      timestamp: timeStr
    };

    setMessages(prev => [...prev, newUserMsg]);
    if (!textToSend) setInputValue('');
    setIsTyping(true);

    if (mode === 'standard') {
      setTimeout(() => {
        const vectorResponse = executeVectorSearch(query);

        const newBotMsg: Message = {
          id: (Date.now() + 1).toString(),
          text: vectorResponse.text,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          confidence: vectorResponse.confidence,
          category: vectorResponse.category,
          isError: vectorResponse.isError
        };

        setMessages(prev => [...prev, newBotMsg]);
        setIsTyping(false);
      }, 650);
    } else {
      try {
        const streamFromModel = async (selectedModel: any) => {
          const resultPromise = selectedModel.generateContentStream(query);
          const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Request timed out after 15 seconds")), 15000));
          
          const result = await Promise.race([resultPromise, timeoutPromise]) as any;
          const botMsgId = (Date.now() + 1).toString();
          
          let fullText = '';
          let isFirstChunk = true;
          
          for await (const chunk of result.stream) {
            if (isFirstChunk) {
              setIsTyping(false);
              setMessages(prev => [...prev, {
                id: botMsgId,
                text: "",
                sender: 'assistant',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }]);
              isFirstChunk = false;
            }
            const chunkText = chunk.text();
            fullText += chunkText;
            setMessages(prev => prev.map(msg => 
              msg.id === botMsgId ? { ...msg, text: fullText } : msg
            ));
          }
          
          if (isFirstChunk) {
            setIsTyping(false);
          }

          // Check if Gemini requested an image generation
          const imageMatch = fullText.match(/\[IMAGE_PROMPT:\s*(.*?)\]/);
          if (imageMatch) {
            const prompt = imageMatch[1];
            let finalText = fullText.replace(imageMatch[0], "\n\n*(🎨 Generating masterpiece via Cloudflare AI...)*");
            setMessages(prev => prev.map(msg => msg.id === botMsgId ? { ...msg, text: finalText } : msg));

            try {
              const cfAccountId = import.meta.env.VITE_CLOUDFLARE_ACCOUNT_ID;
              const cfApiToken = import.meta.env.VITE_CLOUDFLARE_API_TOKEN;
              
              if (!cfAccountId || !cfApiToken) {
                throw new Error("Missing Cloudflare API credentials");
              }

              const controller = new AbortController();
              const cfTimeout = setTimeout(() => controller.abort(), 12000);

              const cfResponse = await fetch(`/cf-ai/client/v4/accounts/${cfAccountId}/ai/run/@cf/bytedance/stable-diffusion-xl-lightning`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${cfApiToken}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ prompt }),
                signal: controller.signal
              });
              
              clearTimeout(cfTimeout);
              
              if (cfResponse.ok) {
                const blob = await cfResponse.blob();
                const imageUrl = URL.createObjectURL(blob);
                finalText = finalText.replace("\n\n*(🎨 Generating masterpiece via Cloudflare AI...)*", `\n\n![Generated Image](${imageUrl})`);
              } else {
                finalText = finalText.replace("\n\n*(🎨 Generating masterpiece via Cloudflare AI...)*", `\n\n⚠️ *Failed to generate image. Cloudflare API returned an error.*`);
              }
            } catch(e) {
               console.error("Cloudflare AI Error:", e);
               finalText = finalText.replace("\n\n*(🎨 Generating masterpiece via Cloudflare AI...)*", `\n\n⚠️ *Failed to generate image. Request timed out or CORS failed.*`);
            }
            
            setMessages(prev => prev.map(msg => msg.id === botMsgId ? { ...msg, text: finalText } : msg));
          }
        };

        // Try primary model, fallback on 503
        try {
          await streamFromModel(primaryModel);
        } catch (primaryErr: any) {
          const errMsg = primaryErr?.message || '';
          if (errMsg.includes('503') || errMsg.includes('high demand') || errMsg.includes('overloaded')) {
            console.warn('Primary model busy, trying fallback...');
            await streamFromModel(fallbackModel);
          } else {
            throw primaryErr;
          }
        }
      } catch (error: any) {
        console.error("Gemini API Error:", error);
        
        const errorMessageStr = error?.message || error?.toString() || "Unknown error";
        
        let errorMessage = "⚠️ **Error connecting to Gemini.**\n\n";
        
        if (errorMessageStr.includes("403") || errorMessageStr.includes("API key not valid")) {
          errorMessage += "The API key provided appears to be invalid or for a different Google service.\n\n";
          errorMessage += "**To fix this:**\n";
          errorMessage += "1. Go to [Google AI Studio](https://aistudio.google.com/)\n";
          errorMessage += "2. Click 'Get API key' and generate a new key.\n";
          errorMessage += "3. Open `src/ChatbotWidget.tsx` and replace the `GEMINI_API_KEY`.\n";
        } else if (errorMessageStr.includes("503") || errorMessageStr.includes("high demand") || errorMessageStr.includes("overloaded")) {
           errorMessage += "Google's Gemini servers are currently experiencing high demand and are temporarily unavailable (503 Error).\n\n";
           errorMessage += "Please try your request again in a few moments!";
        } else {
          errorMessage += `**Details:** ${errorMessageStr}\n\n`;
          errorMessage += "Please try again later or check your console for more details.";
        }

        const errorMsg: Message = {
          id: (Date.now() + 1).toString(),
          text: errorMessage,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isError: true
        };
        setMessages(prev => [...prev, errorMsg]);
      } finally {
        setIsTyping(false);
      }
    }
  };

  const handleResetChat = () => {
    setMessages(getInitialMessages(mode));
  };

  const isPro = mode === 'pro';

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 font-sans flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.92 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="fixed inset-0 sm:inset-auto sm:absolute sm:bottom-20 sm:right-0 w-full sm:w-[420px] h-full sm:h-[600px] sm:max-h-[85vh] sm:rounded-3xl overflow-hidden flex flex-col bg-white shadow-2xl sm:border border-slate-200 sm:origin-bottom-right z-[60]"
          >
            {/* Top Banner with Mode Selector */}
            <div className={`p-4 pt-[max(1rem,env(safe-area-inset-top))] sm:pt-4 flex items-center justify-between text-white relative overflow-visible shadow-sm shrink-0 ${
              isPro ? 'bg-gradient-to-r from-purple-700 via-fuchsia-600 to-pink-600' : 'bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600'
            }`}>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-md border border-slate-100 flex items-center justify-center">
                    {isPro ? <ProLogo size={24} className="animate-pulse" /> : <StandardLogo size={24} className="animate-pulse" />}
                  </div>
                  <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white tracking-wide text-sm">{isPro ? 'CHATBOT PRO' : 'CAREGUIDE ASSISTANT'}</h3>
                  </div>
                  <p className={`text-[11px] flex items-center gap-1 ${isPro ? 'text-fuchsia-100' : 'text-cyan-100'}`}>
                    <Cpu size={11} /> {isPro ? 'Powered by Google Gemini' : '50+ Clinical Vectors • by Chaitu'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleResetChat}
                  title="Clear conversation"
                  className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
                >
                  <RefreshCw size={15} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
                >
                  <X size={17} />
                </button>
              </div>
            </div>

            {/* Quick Suggestion Pills */}
            <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex gap-2 overflow-x-auto no-scrollbar">
              {isPro ? (
                <button 
                  onClick={() => setShowRetell(!showRetell)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm ${
                    showRetell 
                      ? 'bg-rose-100 hover:bg-rose-200 text-rose-700 border-rose-200' 
                      : 'bg-purple-100 hover:bg-purple-200 text-purple-700 border-purple-200'
                  }`}
                >
                  {showRetell ? <X size={12} /> : <Mic size={12} />}
                  {showRetell ? 'Close Voice Agent' : 'Talk to Retell AI Voice'}
                </button>
              ) : (
                QUICK_PROMPTS.map((qp, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(qp.query)}
                    className="whitespace-nowrap px-2.5 py-1 rounded-full text-xs font-medium bg-white hover:bg-cyan-50 text-slate-700 hover:text-cyan-800 border border-slate-200 hover:border-cyan-300 transition-all flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs"
                  >
                    <Sparkles size={10} className="text-cyan-600" />
                    {qp.label}
                  </button>
                ))
              )}
            </div>

            {/* Main Content Area: Chat or Retell Voice UI with Subtitles */}
            {showRetell ? (
              <RetellVoiceUI onClose={() => setShowRetell(false)} />
            ) : (
              <>
                {/* Chat Messages Stream */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 shadow-2xs ${
                        isPro ? 'bg-white border border-purple-200' : 'bg-white border border-cyan-200'
                      }`}>
                        {isPro ? <ProLogo size={16} /> : <StandardLogo size={16} />}
                      </div>
                    )}

                    <div className={`max-w-[85%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-xs ${
                          isUser
                            ? (isPro ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-tr-xs shadow-sm' : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-xs shadow-sm')
                            : msg.isError
                            ? 'bg-rose-50 border border-rose-200 text-rose-900 rounded-tl-xs'
                            : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs shadow-xs'
                        }`}
                      >
                        {renderMessageText(msg.text)}
                      </div>

                      {/* Metadata / Match Score */}
                      <div className="flex items-center gap-2 mt-1 px-1 text-[10px] text-slate-400 font-mono">
                        <span>{msg.timestamp}</span>
                        {!isUser && msg.confidence !== undefined && msg.confidence > 0 && (
                          <span className="flex items-center gap-1 text-cyan-700 bg-cyan-50 px-1.5 py-0.2 rounded border border-cyan-200 font-medium">
                            <Sparkles size={9} />
                            {Math.round(msg.confidence * 100)}% VECTOR MATCH
                          </span>
                        )}
                        {!isUser && msg.isError && !isPro && (
                          <span className="flex items-center gap-1 text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200 font-medium">
                            <ShieldAlert size={9} /> NO VECTOR ENTRY
                          </span>
                        )}
                      </div>
                    </div>

                    {isUser && (
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 shadow-2xs ${
                        isPro ? 'bg-purple-100 border border-purple-200 text-purple-700' : 'bg-blue-100 border border-blue-200 text-blue-700'
                      }`}>
                        <User size={15} />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Processing Indicator */}
              {isTyping && (
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-2xs ${
                    isPro ? 'bg-white border border-purple-200' : 'bg-white border border-cyan-200'
                  }`}>
                    {isPro ? <ProLogo size={16} /> : <StandardLogo size={16} />}
                  </div>
                  <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-xs flex items-center gap-2 shadow-xs">
                    <span className={`text-[11px] font-mono font-medium flex items-center gap-1.5 ${isPro ? 'text-purple-700' : 'text-cyan-700'}`}>
                      <Cpu size={12} className={`animate-spin ${isPro ? 'text-purple-600' : 'text-cyan-600'}`} /> 
                      {isPro ? 'Gemini is thinking...' : 'Vectorizing query...'}
                    </span>
                    <div className="flex gap-1">
                      <motion.div className={`w-1.5 h-1.5 rounded-full ${isPro ? 'bg-purple-500' : 'bg-cyan-500'}`} animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                      <motion.div className={`w-1.5 h-1.5 rounded-full ${isPro ? 'bg-purple-500' : 'bg-cyan-500'}`} animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 }} />
                      <motion.div className={`w-1.5 h-1.5 rounded-full ${isPro ? 'bg-purple-500' : 'bg-cyan-500'}`} animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))] sm:pb-3.5 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0">
              <div className="relative">
                <button 
                  onClick={() => setIsModeDropdownOpen(!isModeDropdownOpen)}
                  className={`flex items-center gap-1.5 px-2.5 py-2.5 rounded-xl border transition-all cursor-pointer shadow-sm ${
                    isPro ? 'bg-purple-50 border-purple-200 hover:bg-purple-100' : 'bg-cyan-50 border-cyan-200 hover:bg-cyan-100'
                  }`}
                  title="Select AI Model"
                >
                  {isPro ? <ProLogo size={18} /> : <StandardLogo size={18} />}
                  <ChevronDown size={14} className={isPro ? "text-purple-600" : "text-cyan-600"} />
                </button>
                
                {/* Mode Dropdown (Opens Upwards) */}
                <AnimatePresence>
                  {isModeDropdownOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50"
                    >
                      <button
                        onClick={() => { setMode('standard'); setIsModeDropdownOpen(false); }}
                        className={`w-full text-left px-4 py-3 flex items-center gap-2 border-b border-slate-100 cursor-pointer transition-colors ${!isPro ? 'bg-cyan-50' : 'hover:bg-slate-50'}`}
                      >
                        <div className="w-6 h-6 flex items-center justify-center shrink-0">
                          <StandardLogo size={18} />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-800">Standard Mode</div>
                          <div className="text-[10px] text-slate-500">Vector DB queries</div>
                        </div>
                      </button>
                      <button
                        onClick={() => { setMode('pro'); setIsModeDropdownOpen(false); }}
                        className={`w-full text-left px-4 py-3 flex items-center gap-2 cursor-pointer transition-colors ${isPro ? 'bg-purple-50' : 'hover:bg-slate-50'}`}
                      >
                        <div className="w-6 h-6 flex items-center justify-center shrink-0">
                          <ProLogo size={18} />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-purple-700">Chatbot Pro</div>
                          <div className="text-[10px] text-slate-500">Gemini AI integration</div>
                        </div>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={isPro ? "Ask Gemini anything..." : "Ask any symptom or how this website works..."}
                  className={`w-full bg-slate-50 text-slate-900 placeholder-slate-400 text-xs sm:text-sm rounded-xl pl-3.5 pr-8 py-2.5 border border-slate-200 focus:outline-none focus:ring-2 transition-all ${
                    isPro ? 'focus:border-purple-400 focus:ring-purple-400/20' : 'focus:border-cyan-400 focus:ring-cyan-400/20'
                  }`}
                />
                <HelpCircle size={14} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim()}
                className={`text-white p-2.5 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                  isPro ? 'bg-gradient-to-r from-purple-500 to-pink-600' : 'bg-gradient-to-r from-cyan-500 to-blue-600'
                }`}
              >
                <Send size={16} />
              </motion.button>
            </div>
            </>
          )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className={`relative group p-4 rounded-2xl text-white shadow-[0_0_30px_rgba(0,240,255,0.45)] hover:shadow-[0_0_40px_rgba(0,240,255,0.65)] border border-white/30 flex items-center justify-center transition-all cursor-pointer ${
          isPro ? 'bg-gradient-to-tr from-purple-500 via-fuchsia-600 to-pink-600 shadow-[0_0_30px_rgba(217,70,239,0.45)] hover:shadow-[0_0_40px_rgba(217,70,239,0.65)]' : 'bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 shadow-[0_0_30px_rgba(0,240,255,0.45)] hover:shadow-[0_0_40px_rgba(0,240,255,0.65)]'
        }`}
      >
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isPro ? 'bg-pink-300' : 'bg-cyan-300'}`}></span>
          <span className={`relative inline-flex rounded-full h-4 w-4 text-[8px] font-bold text-slate-900 items-center justify-center ${isPro ? 'bg-pink-400' : 'bg-cyan-400'}`}>
            {isPro ? 'PRO' : 'AI'}
          </span>
        </span>
        {isPro ? <Zap size={26} className="text-white drop-shadow-sm" /> : <MessageSquare size={26} className="text-white drop-shadow-sm" />}
        
        {/* Tooltip on hover */}
        {!isOpen && (
          <div className="absolute right-16 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-medium whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            {isPro ? '⚡ Chatbot Pro • Gemini AI' : '⚡ Vector Assistant • Ask anything!'}
          </div>
        )}
      </motion.button>
    </div>
  );
};
