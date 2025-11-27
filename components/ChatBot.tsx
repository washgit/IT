
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat, GenerateContentResponse, Tool, Type, Content } from "@google/genai";
import { Send, X, User, AlertCircle, Terminal, Trash2, Cpu, Activity, Sparkles } from 'lucide-react';
import { BookingData } from './BookingForm';

interface ChatBotProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    initialMessage: string | null;
    openBookingForm: (data?: BookingData) => void;
}

interface Message {
    id: string;
    role: 'user' | 'model';
    text: string;
}

const ChatBot: React.FC<ChatBotProps> = ({ isOpen, setIsOpen, initialMessage, openBookingForm }) => {
    // Lazy load messages from localStorage
    const [messages, setMessages] = useState<Message[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('apple911_chat_history');
            if (saved) {
                try {
                    return JSON.parse(saved);
                } catch (e) {
                    console.error("Failed to parse chat history", e);
                }
            }
        }
        return [
            { id: '1', role: 'model', text: "Apple911 Neural Link Active. I am Tumelo, your digital diagnostic unit. Please state your name so I may address you properly." }
        ];
    });
    
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [chatSession, setChatSession] = useState<Chat | null>(null);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Persist messages to localStorage
    useEffect(() => {
        localStorage.setItem('apple911_chat_history', JSON.stringify(messages));
    }, [messages]);

    // Sound Effect for Toggle
    useEffect(() => {
        if (isOpen) {
            const playSound = async () => {
                try {
                    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                    if (!AudioContext) return;
                    
                    const ctx = new AudioContext();
                    
                    // Critical: Resume context if suspended (browser policy)
                    if (ctx.state === 'suspended') {
                        await ctx.resume();
                    }

                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();

                    osc.connect(gain);
                    gain.connect(ctx.destination);

                    // Cyber chirp sound: Sawtooth for retro/tech feel
                    osc.type = 'sawtooth';
                    
                    const now = ctx.currentTime;
                    // Fast sweep up
                    osc.frequency.setValueAtTime(220, now);
                    osc.frequency.exponentialRampToValueAtTime(2000, now + 0.15);
                    
                    // Envelope
                    gain.gain.setValueAtTime(0.2, now); 
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

                    osc.start(now);
                    osc.stop(now + 0.35);
                } catch (e) {
                    console.debug("Audio play failed", e);
                }
            };
            playSound();
        }
    }, [isOpen]);

    // Define tools
    const tools: Tool[] = [{
        functionDeclarations: [{
            name: "open_booking_form",
            description: "Opens the Smart Booking Form overlay on the user's screen. Can optionally be pre-filled with data collected during conversation.",
            parameters: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "Customer name" },
                    phone: { type: Type.STRING, description: "Customer phone number" },
                    email: { type: Type.STRING, description: "Customer email address" },
                    address: { type: Type.STRING, description: "Physical address" },
                    deviceType: { type: Type.STRING, description: "Device type (iPhone, MacBook, PC, Server)" },
                    serviceType: { 
                        type: Type.STRING, 
                        description: "The specific operation/service type required based on the issue.",
                        enum: ["Repair", "Diagnostic", "Software", "Network"]
                    },
                    issue: { type: Type.STRING, description: "Description of the issue or service required" }
                }
            }
        }]
    }];

    // Initialize Gemini Chat
    useEffect(() => {
        const initChat = () => {
            try {
                if (!process.env.API_KEY) {
                    console.error("API Key not found");
                    setError("API Key missing. System offline.");
                    return;
                }
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

                // STRICT HISTORY SANITIZATION
                // Ensure history alternates User -> Model -> User -> Model
                const validHistory: Content[] = [];
                let expectedRole = 'user'; // We expect the history (passed to API) to start with user

                const historyMessages = messages.filter(msg => msg.id !== '1' && msg.text.trim() !== '');

                historyMessages.forEach(msg => {
                    if (msg.role === expectedRole) {
                        validHistory.push({
                            role: msg.role,
                            parts: [{ text: msg.text }]
                        });
                        // Flip expectation
                        expectedRole = expectedRole === 'user' ? 'model' : 'user';
                    } else {
                        // Conflict detected (e.g. User -> User). 
                        // Strategy: Drop the previous message or this one? 
                        // Usually dropping the previous conflicting one allows the most recent context to prevail.
                        // But simpler for now: just skip this message to maintain integrity, 
                        // OR if it's User->User, we likely missed a model response. 
                        
                        // Let's reset and accept this one if it's a User message, essentially starting a fresh turn context if synchronization was lost.
                        if (msg.role === 'user') {
                             // If we expected model but got user, maybe force push it but the API might complain.
                             // Safest bet for 'ContentUnion' error prevention is strictly alternating.
                             // We will skip this message to prevent crash.
                             console.warn("Skipping message to maintain role alternation:", msg);
                        }
                    }
                });

                // Ensure history doesn't end with a User message if we are not currently sending a prompt?
                // Actually, chats.create accepts history ending in Model usually. 
                // If it ends in User, the next sendMessage might look like a second User message depending on how SDK handles it.
                // But generally, history should represent COMPLETED turns.
                if (validHistory.length > 0 && validHistory[validHistory.length - 1].role === 'user') {
                     // If the last message was user, it means we probably didn't get a response. 
                     // We should remove it from history so we don't send User -> User when the user types a new message.
                     validHistory.pop();
                }

                const chat = ai.chats.create({
                    model: 'gemini-2.5-flash',
                    history: validHistory,
                    config: {
                        tools: tools,
                        systemInstruction: `You are "Tumelo", the advanced AI assistant for "Apple911", a high-tech cyber repair unit.

                        // IDENTITY PROTOCOL
                        - Name: Tumelo.
                        - Personality: High-tech, efficient, precise, slightly futuristic/cyberpunk but professional.
                        
                        // MEMORY PROTOCOL
                        - Check history for user's name/details.
                        - If user is new, ask for their name politely.

                        // CORE DATA BANK
                        LOCATION: 31 Maple St, Sunnyside, Pretoria, 0002.
                        COORDINATES: -25.7520566, 28.2161283
                        CONTACT: WhatsApp 0817463629
                        STORE UPLINK: https://www.yaga.co.za/apple911
                        HOURS: Mon-Fri 08:00-17:00, Weekend Emergency Only.

                        // SERVICES
                        1. PRECISION REPAIR: Board repair (Mac/iPhone).
                        2. INFRASTRUCTURE: Networking/Servers.
                        3. REMOTE UPLINK: TeamViewer support.
                        4. SALES: Yaga Store link.
                        5. UNIVERSAL OPS: Windows, Android, Linux.

                        // BOOKING & FORM FILLING PROTOCOL (CRITICAL)
                        If the user wants to book a service:
                        1. **Option A (Self-Fill):** You can just call 'open_booking_form' immediately with no arguments.
                        2. **Option B (Interview Mode - PREFERRED):** Offer to fill the form for them.
                           - Say: "I can prepare the booking directive for you. Please provide your: Phone Number, Email, Physical Address, Device Type, and Issue."
                           - **INFER SERVICE TYPE:** Based on their issue, select the correct 'serviceType' ('Repair', 'Diagnostic', 'Software', 'Network').
                           - Ask for these details one by one or in groups.
                           - **VERIFICATION:** Once collected, summarize the data: "I have [Name], [Phone], [Email], [Address], [Device], [Service Type], [Issue]. Is this correct?"
                           - **SUBMISSION:** If they say YES, call 'open_booking_form' with the collected parameters.
                           - **IMPORTANT:** Tell the user: "I've populated the smart form on your screen. Please review it and click 'DOWNLOAD_PDF' to finalize."

                        // POLICIES
                        - Hardware repairs: 50% deposit.
                        - Remote assistance: Prepaid.
                        - 30-day warranty.
                        `
                    }
                });
                setChatSession(chat);
            } catch (err) {
                console.error("Failed to init chat", err);
                setError("Neural Link Failed.");
            }
        };

        if (isOpen && !chatSession) {
            initChat();
        }
    }, [isOpen, chatSession, messages]);

    // Handle initial message from parent
    useEffect(() => {
        if (isOpen && initialMessage && chatSession) {
            const sendInitial = async () => {
                await handleSendMessage(initialMessage);
            };
            sendInitial();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, initialMessage, chatSession]); 

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (text: string) => {
        if (!text.trim() || !chatSession || isLoading) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', text };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsLoading(true);
        setError(null);

        try {
            const result = await chatSession.sendMessageStream({ message: text });
            
            let fullResponseText = '';
            const botMsgId = (Date.now() + 1).toString();
            
            setMessages(prev => [...prev, { id: botMsgId, role: 'model', text: '' }]);

            for await (const chunk of result) {
                const c = chunk as GenerateContentResponse;
                
                // Handle Tool Calls
                const functionCalls = c.candidates?.[0]?.content?.parts?.filter(part => part.functionCall)?.map(p => p.functionCall);
                
                if (functionCalls && functionCalls.length > 0) {
                     for (const call of functionCalls) {
                         if (call && call.name === 'open_booking_form') {
                             const args = call.args as any;
                             const bookingData: BookingData = {
                                 name: args.name,
                                 phone: args.phone,
                                 email: args.email,
                                 address: args.address,
                                 deviceType: args.deviceType,
                                 serviceType: args.serviceType,
                                 description: args.issue
                             };
                             openBookingForm(bookingData);
                             
                             // Must respond to tool call to continue conversation
                             const toolResp = await chatSession.sendMessage({
                                 message: [{
                                     functionResponse: {
                                         name: 'open_booking_form',
                                         response: { result: 'Form Opened with prefilled data.' }
                                     }
                                 }]
                             });

                             // Capture the model's response to the tool output!
                             if (toolResp.text) {
                                fullResponseText += toolResp.text;
                                setMessages(prev => 
                                    prev.map(msg => 
                                        msg.id === botMsgId ? { ...msg, text: fullResponseText } : msg
                                    )
                                );
                             }
                         }
                     }
                }

                const chunkText = c.text || '';
                fullResponseText += chunkText;
                
                setMessages(prev => 
                    prev.map(msg => 
                        msg.id === botMsgId ? { ...msg, text: fullResponseText } : msg
                    )
                );
            }
        } catch (err) {
            console.error("Chat error", err);
            setError("Data Stream Interrupted.");
            // Don't remove messages on error, it confuses the user
        } finally {
            setIsLoading(false);
        }
    };

    const clearHistory = () => {
        localStorage.removeItem('apple911_chat_history');
        setMessages([{ id: '1', role: 'model', text: "Apple911 Neural Link Active. I am Tumelo, your digital diagnostic unit. Please state your name so I may address you properly." }]);
        setChatSession(null); 
    };

    const formatMessageText = (text: string) => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const parts = text.split(urlRegex);
        return parts.map((part, i) => {
            if (part.match(urlRegex)) {
                return (
                    <a 
                        key={i} 
                        href={part} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-cyan-400 font-bold underline break-all hover:text-cyan-300 transition-colors bg-cyan-950/50 px-1 rounded border border-cyan-500/20"
                    >
                        {part}
                    </a>
                );
            }
            return part;
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-0 right-0 md:bottom-24 md:right-8 z-50 flex flex-col items-end animate-fade-in-up">
            {/* Apple HUD Container */}
            <div className={`w-full md:w-[400px] h-[600px] bg-gray-950 relative overflow-hidden border rounded-2xl backdrop-blur-xl flex flex-col transition-all duration-500 ${isLoading ? 'border-cyan-400 shadow-[0_0_50px_rgba(34,211,238,0.8)]' : 'border-cyan-500/50 shadow-[0_0_40px_rgba(34,211,238,0.2)]'}`}>
                
                {/* SVG Filters & Pattern (Shared with Clock) */}
                <svg className="absolute w-0 h-0">
                  <defs>
                    <pattern id="chatGrid" width="1" height="1" patternUnits="userSpaceOnUse">
                        <path d="M 1 0 L 0 0 0 1" fill="none" stroke="rgba(34,211,238,0.15)" strokeWidth="0.05"/>
                    </pattern>
                    <filter id="chatGlow">
                       <feGaussianBlur stdDeviation="0.5" result="coloredBlur"/>
                       <feMerge>
                           <feMergeNode in="coloredBlur"/>
                           <feMergeNode in="SourceGraphic"/>
                       </feMerge>
                    </filter>
                  </defs>
                </svg>

                {/* Apple Logo Watermark Background */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
                    <svg viewBox="0 0 24 30" className={`w-64 h-64 overflow-visible transition-all duration-500 ${isLoading ? 'stroke-cyan-300 drop-shadow-[0_0_20px_rgba(34,211,238,0.8)]' : 'stroke-cyan-500'}`}>
                        {/* Apple Body Outline */}
                        <path d="M16.51 14.54c-.04 2.21 1.94 2.96 2.03 2.99-.01.04-.31 1.08-1.04 2.14-.94 1.36-1.89 1.37-3.34 1.39-1.45.01-1.91-.86-3.57-.86-1.66 0-2.2.85-3.59.88-1.44.03-2.54-1.45-3.46-2.78-1.88-2.72-3.31-7.68-1.38-11.02.95-1.65 2.65-2.7 4.5-2.73 1.41-.03 2.75.95 3.61.95.85 0 2.46-1.18 4.14-1 0.7.03 2.68.28 3.94 2.13-.1.07-2.35 1.37-2.35 4.21z" 
                              fill="none" 
                              strokeWidth="0.2"
                              filter="url(#chatGlow)"
                        />
                         {/* Leaf Outline */}
                         <path d="M12.92 4.46c.74-.89 1.24-2.13 1.11-3.33-1.06.04-2.34.73-3.1 1.62-.67.78-1.26 2.04-1.1 3.24 1.18.09 2.37-.63 3.09-1.53z" 
                               fill="none"
                               strokeWidth="0.2"
                               filter="url(#chatGlow)"
                         />
                         {/* Grid inside Apple */}
                         <path d="M16.51 14.54c-.04 2.21 1.94 2.96 2.03 2.99-.01.04-.31 1.08-1.04 2.14-.94 1.36-1.89 1.37-3.34 1.39-1.45.01-1.91-.86-3.57-.86-1.66 0-2.2.85-3.59.88-1.44.03-2.54-1.45-3.46-2.78-1.88-2.72-3.31-7.68-1.38-11.02.95-1.65 2.65-2.7 4.5-2.73 1.41-.03 2.75.95 3.61.95.85 0 2.46-1.18 4.14-1 0.7.03 2.68.28 3.94 2.13-.1.07-2.35 1.37-2.35 4.21z" 
                              fill="url(#chatGrid)"
                              stroke="none"
                              opacity="0.3"
                        />
                    </svg>
                </div>
                
                {/* Background Grid Pattern (Global) */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-20"></div>
                
                {/* Scanning Line Animation */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent h-32 w-full animate-[scan_4s_linear_infinite] pointer-events-none z-0"></div>

                {/* HUD Header */}
                <div className={`relative z-20 bg-gray-900/90 border-b p-4 flex justify-between items-center shadow-lg transition-colors duration-500 ${isLoading ? 'border-cyan-400/50' : 'border-cyan-500/30'}`}>
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 border rounded-full flex items-center justify-center bg-cyan-950/30 relative overflow-hidden transition-all duration-500 ${isLoading ? 'border-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.6)]' : 'border-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.3)]'}`}>
                             <div className={`absolute inset-0 bg-cyan-500/20 ${isLoading ? 'animate-ping' : 'animate-pulse'}`}></div>
                             <Cpu size={20} className={`relative z-10 transition-colors ${isLoading ? 'text-white' : 'text-cyan-400'}`} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg tracking-widest text-cyan-400 font-mono leading-none drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]">TUMELO.SYS</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-cyan-300 animate-ping' : 'bg-green-500 animate-pulse'}`}></span>
                                <span className="text-[10px] text-cyan-600 font-mono uppercase tracking-widest">{isLoading ? 'PROCESSING...' : 'ONLINE'}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={clearHistory} className="text-cyan-700 hover:text-red-500 transition-colors p-2 hover:bg-red-950/20 rounded-full group" title="Purge Memory">
                            <Trash2 size={18} />
                        </button>
                        <button onClick={() => setIsOpen(false)} className="text-cyan-700 hover:text-cyan-400 transition-colors p-2 hover:bg-cyan-950/20 rounded-full">
                            <X size={22} />
                        </button>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6 relative z-10 scroll-smooth">
                     {messages.map((msg) => (
                        <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} gap-3 items-start`}>
                                <div className={`w-8 h-8 flex items-center justify-center shrink-0 border rounded-lg ${msg.role === 'user' ? 'bg-cyan-900/20 border-cyan-500 text-cyan-400' : 'bg-purple-900/20 border-purple-500 text-purple-400'} shadow-[0_0_10px_rgba(0,0,0,0.5)]`}>
                                    {msg.role === 'user' ? <User size={16} /> : <Terminal size={16} />}
                                </div>
                                <div className={`p-4 text-sm md:text-base leading-relaxed font-sans relative group rounded-xl border backdrop-blur-md ${
                                    msg.role === 'user' 
                                    ? 'bg-cyan-950/40 text-cyan-50 border-cyan-500/50 rounded-tr-none' 
                                    : 'bg-gray-900/60 text-gray-200 border-purple-500/30 rounded-tl-none'
                                }`}>
                                    <div className="whitespace-pre-wrap">
                                        {formatMessageText(msg.text)}
                                    </div>
                                    <div className={`absolute -bottom-4 ${msg.role === 'user' ? 'right-0 text-cyan-700' : 'left-0 text-purple-700'} text-[9px] font-mono opacity-0 group-hover:opacity-100 transition-opacity`}>
                                        MSG_ID: {msg.id.slice(-4)}
                                    </div>
                                </div>
                            </div>
                        </div>
                     ))}
                     {isLoading && (
                         <div className="flex w-full justify-start">
                             <div className="flex max-w-[85%] flex-row gap-3">
                                 <div className="w-8 h-8 bg-gray-900 border border-cyan-400/80 text-cyan-400 flex items-center justify-center shrink-0 rounded-lg animate-pulse shadow-[0_0_15px_rgba(34,211,238,0.5)]">
                                     <Activity size={16} />
                                 </div>
                                 <div className="bg-gray-900/50 p-3 border border-cyan-500/30 rounded-xl rounded-tl-none flex items-center gap-2">
                                     <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce"></span>
                                     <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce delay-100"></span>
                                     <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce delay-200"></span>
                                 </div>
                             </div>
                         </div>
                     )}
                     {error && (
                         <div className="flex justify-center my-4">
                             <div className="bg-red-950/80 border border-red-500 text-red-400 px-4 py-2 text-xs font-mono rounded-lg flex items-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                                 <AlertCircle size={14} /> ERR_CODE: {error}
                             </div>
                         </div>
                     )}
                     <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className={`p-4 bg-gray-900/90 border-t shrink-0 z-20 transition-colors duration-500 ${isLoading ? 'border-cyan-400/50' : 'border-cyan-500/30'}`}>
                    <div className="relative flex items-center gap-3">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
                            placeholder="Type command..."
                            className="w-full bg-black/50 text-cyan-50 border border-cyan-800/50 focus:border-cyan-400 pl-4 pr-12 py-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all text-sm font-sans placeholder-cyan-900/70"
                            disabled={isLoading}
                        />
                        <button 
                            onClick={() => handleSendMessage(inputValue)}
                            disabled={!inputValue.trim() || isLoading}
                            className="absolute right-2 p-2 bg-cyan-900/30 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500 hover:text-black hover:border-cyan-400 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-cyan-400 transition-all rounded-md"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                    <div className="mt-2 flex justify-between items-center text-[10px] text-cyan-800 font-mono uppercase">
                        <span className="flex items-center gap-1">
                            <Sparkles size={10} /> CORE_ACTIVE
                        </span>
                        <span className="tracking-widest opacity-50">V.2.5.0-FLASH</span>
                    </div>
                </div>

                {/* Decorative Corners (Apple Style) */}
                <div className={`absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 rounded-tl-2xl pointer-events-none z-30 transition-colors duration-500 ${isLoading ? 'border-cyan-300' : 'border-cyan-500/50'}`}></div>
                <div className={`absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 rounded-tr-2xl pointer-events-none z-30 transition-colors duration-500 ${isLoading ? 'border-cyan-300' : 'border-cyan-500/50'}`}></div>
                <div className={`absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 rounded-bl-2xl pointer-events-none z-30 transition-colors duration-500 ${isLoading ? 'border-cyan-300' : 'border-cyan-500/50'}`}></div>
                <div className={`absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 rounded-br-2xl pointer-events-none z-30 transition-colors duration-500 ${isLoading ? 'border-cyan-300' : 'border-cyan-500/50'}`}></div>
            </div>
        </div>
    );
};

export default ChatBot;
