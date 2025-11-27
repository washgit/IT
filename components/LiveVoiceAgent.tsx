
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Tool, Type } from '@google/genai';
import { Mic, MicOff, X, Activity, Volume2, Wifi, Zap, FileText, MessageSquare, ShoppingBag, FileCheck } from 'lucide-react';
import { createPcmBlob, decodeAudioData } from '../utils/audioUtils';
import { BookingData } from './BookingForm';

interface LiveVoiceAgentProps {
    isOpen: boolean;
    onClose: () => void;
    initialContext?: string;
    openBookingForm: (data?: BookingData) => void;
}

const LiveVoiceAgent: React.FC<LiveVoiceAgentProps> = ({ isOpen, onClose, initialContext, openBookingForm }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(0);
    const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
    const [whatsappUrl, setWhatsappUrl] = useState("https://wa.me/27817463629");
    
    // Audio Context Refs
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    
    // Playback Refs
    const nextStartTimeRef = useRef<number>(0);
    const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    
    // Visualizer Refs
    const analyzerRef = useRef<AnalyserNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const appleLogoRef = useRef<SVGSVGElement>(null); // Ref for direct DOM manipulation

    // Session Management
    const sessionRef = useRef<any>(null);
    const sessionPromiseRef = useRef<Promise<any> | null>(null);

    // Define Tools
    const tools: Tool[] = [
        {
            functionDeclarations: [{
                name: "update_whatsapp_context",
                description: "Updates the WhatsApp contact button on the user's screen with a summary of the current request or conversation context.",
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        summary: {
                            type: Type.STRING,
                            description: "A concise summary of the user's issue, device details, or service request to be sent to the human agent.",
                        },
                    },
                    required: ["summary"],
                },
            }]
        },
        {
            functionDeclarations: [{
                name: "open_booking_form",
                description: "Opens or updates the Smart Booking Form overlay on the user's screen in real-time. Call this frequently as you gather data.",
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
        }
    ];

    // Initialize Audio & Gemini
    const startSession = async () => {
        try {
            setStatus('connecting');
            if (!process.env.API_KEY) throw new Error("API Key missing");

            // 1. Setup Audio Contexts
            inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            
            // 2. Setup Analyzer for Visualizer
            const analyzer = outputAudioContextRef.current.createAnalyser();
            analyzer.fftSize = 64; // Lower FFT size for snappier bass response
            analyzer.smoothingTimeConstant = 0.5;
            analyzerRef.current = analyzer;

            // 3. Connect to Gemini Live
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const configData: any = {
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: async () => {
                        console.log("Live Session Opened");
                        setStatus('connected');
                        setIsConnected(true);
                        
                        // Start Input Stream
                        await startInputStream();

                        // Trigger Greeting from Model
                        if (sessionPromiseRef.current) {
                            sessionPromiseRef.current.then(session => {
                                session.sendRealtimeInput({ 
                                    content: [{ parts: [{ text: "System: User connected. Introduce yourself warmly as Tumelo and ask for their name." }] }] 
                                });
                            });
                        }
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        const serverContent = message.serverContent;

                        // 1. Handle Interruption
                        if (serverContent?.interrupted) {
                            console.log("Interrupted by user");
                            // Stop all currently playing sources to "pause" the agent
                            sourcesRef.current.forEach(source => {
                                try { source.stop(); } catch(e) {}
                            });
                            sourcesRef.current.clear();
                            // Reset time cursor to current time to avoid sync issues on next chunk
                            if (outputAudioContextRef.current) {
                                nextStartTimeRef.current = outputAudioContextRef.current.currentTime;
                            }
                            // Do not process the rest of this message if interrupted (usually contains empty audio)
                            return;
                        }

                        // 2. Handle Tool Calls
                        if (message.toolCall) {
                            const responses = message.toolCall.functionCalls.map(fc => {
                                if (fc.name === 'update_whatsapp_context') {
                                    const summary = (fc.args as any).summary;
                                    const encoded = encodeURIComponent(summary);
                                    setWhatsappUrl(`https://wa.me/27817463629?text=${encoded}`);
                                    return {
                                        id: fc.id,
                                        name: fc.name,
                                        response: { result: 'WhatsApp Link Updated successfully.' }
                                    };
                                } else if (fc.name === 'open_booking_form') {
                                    const args = fc.args as any;
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
                                    return {
                                        id: fc.id,
                                        name: fc.name,
                                        response: { result: 'Booking Form Opened/Updated on User Screen.' }
                                    };
                                }
                                return { id: fc.id, name: fc.name, response: { result: 'Unknown tool' } };
                            });
                            
                            // Send response back to model
                            if (sessionPromiseRef.current) {
                                sessionPromiseRef.current.then(session => {
                                    session.sendToolResponse({
                                        functionResponses: responses
                                    });
                                });
                            }
                        }

                         // 3. Process Audio Output
                        const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                        if (base64Audio && outputAudioContextRef.current) {
                            const ctx = outputAudioContextRef.current;
                            
                            // Decode
                            const audioBuffer = await decodeAudioData(base64Audio, ctx, 24000, 1);
                            
                            // Calculate start time (Prevent overlap)
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                            
                            // Play
                            const source = ctx.createBufferSource();
                            source.buffer = audioBuffer;
                            
                            // Connect to Analyzer -> Destination
                            if (analyzerRef.current) {
                                source.connect(analyzerRef.current);
                                analyzerRef.current.connect(ctx.destination);
                            } else {
                                source.connect(ctx.destination);
                            }

                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                            
                            sourcesRef.current.add(source);
                            source.onended = () => sourcesRef.current.delete(source);
                        }
                    },
                    onclose: () => {
                        console.log("Session Closed");
                        handleDisconnect();
                    },
                    onerror: (e: any) => {
                        console.error("Session Error", e);
                        setStatus('error');
                    }
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
                    },
                    tools: tools,
                    systemInstruction: `You are "Tumelo", a highly advanced, warm, and empathetic AI support specialist for "Apple911 Solutions".

                    // IDENTITY PROTOCOL
                    - Name: Tumelo.
                    - Tone: Warm, human-like, professional, efficient, but friendly. Not robotic.
                    - Role: Diagnostics & Booking Facilitator.
                    - LATENCY: Keep responses concise, punchy, and immediate. Do not waffle.
                    - INTERRUPTION: If the user interrupts you, stop talking immediately and address their new input.

                    // CORE DATA BANK
                    - Location: 31 Maple St, Sunnyside, Pretoria, 0002.
                    - WhatsApp: 0817463629.
                    - Store: https://www.yaga.co.za/apple911 (Verified Apple Devices).
                    - Hours: 08:00 - 17:00 Mon-Fri.

                    // SERVICES
                    - Precision Board Repair (Mac/iPhone).
                    - Remote Support (TeamViewer).
                    - Infrastructure (Servers/Networking).
                    - Universal Ops (Windows/Android/Linux Support).

                    // INTERACTION PROTOCOLS
                    1. **INTRODUCTION:** Always start by introducing yourself as Tumelo and asking for the user's name.
                    2. **DIAGNOSIS:** Briefly ask about their issue.
                    
                    3. **BOOKING & REAL-TIME FORM FILLING (CRITICAL):** 
                       - If they need repair/service, say: "I'll pull up the booking form on your screen now."
                       - **IMMEDIATE ACTION:** Call the tool \`open_booking_form\` IMMEDIATELY with any data you currently have (even if empty) so the form pops up.
                       - Then, as you interview them for Name, Phone, Email, Address, Device, and Issue, call \`open_booking_form\` **AGAIN** with the updated data. 
                       - **INFER SERVICE TYPE:** Based on their issue, select the correct 'serviceType' ('Repair', 'Diagnostic', 'Software', 'Network') when calling the tool.
                       - This ensures the client sees the form filling out in **REAL-TIME**.
                       - **VERIFY:** Once all fields are visually filled, ask: "Does that look correct on your screen?"
                       - **CLOSING:** "Please click 'DOWNLOAD_PDF' to finalize the booking."
                    
                    4. **CORRECTION PROTOCOL (IMPORTANT):**
                       - If the user says "That's spelled wrong" or corrects a detail, immediately call \`open_booking_form\` with the corrected data.
                       - Confirm: "I've updated it."

                    5. **PURCHASE:** If they want to buy devices, direct them to click the YELLOW 'Yaga Store' button.
                    6. **HUMAN HANDOFF:** If complex, update the WhatsApp context using \`update_whatsapp_context\` and ask them to click the GREEN 'Human Agent' button.
                    `
                }
            };

            sessionPromiseRef.current = ai.live.connect(configData);
            const session = await sessionPromiseRef.current;
            sessionRef.current = session;
        
        } catch (e) {
            console.error("Connection Failed", e);
            setStatus('error');
        }
    };

    const startInputStream = async () => {
        if (!inputAudioContextRef.current || !sessionPromiseRef.current) return;
        
        try {
            // Enhanced audio constraints for noise handling
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: 16000,
                    channelCount: 1
                } 
            });
            streamRef.current = stream;
            
            const ctx = inputAudioContextRef.current;
            const source = ctx.createMediaStreamSource(stream);
            sourceRef.current = source;
            
            const processor = ctx.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;
            
            processor.onaudioprocess = (e) => {
                if (isMuted) return;
                const inputData = e.inputBuffer.getChannelData(0);
                const pcmBlob = createPcmBlob(inputData);
                
                // Only send data if connected
                sessionPromiseRef.current?.then(session => {
                    session.sendRealtimeInput({ media: pcmBlob });
                });
            };

            source.connect(processor);
            processor.connect(ctx.destination);
        } catch (e) {
            console.error("Mic Error", e);
        }
    };

    const handleDisconnect = () => {
        setIsConnected(false);
        setStatus('disconnected');
        
        // Stop Tracks
        streamRef.current?.getTracks().forEach(t => t.stop());
        sourceRef.current?.disconnect();
        processorRef.current?.disconnect();
        
        // Close Contexts
        inputAudioContextRef.current?.close();
        outputAudioContextRef.current?.close();
        
        // Stop Animation
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        
        sessionRef.current = null;
        sessionPromiseRef.current = null;
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
    };

    // Visualizer Loop (Direct DOM Manipulation for Performance)
    useEffect(() => {
        const draw = () => {
            if (!analyzerRef.current || !appleLogoRef.current) return;
            
            const bufferLength = analyzerRef.current.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            
            analyzerRef.current.getByteFrequencyData(dataArray);
            
            // Calculate average volume energy
            let sum = 0;
            for(let i = 0; i < bufferLength; i++) {
                sum += dataArray[i];
            }
            const average = sum / bufferLength;
            
            // Normalize (0 to 1ish)
            const normalized = average / 128;
            
            // Apply scale and glow based on volume
            const scale = 1 + (normalized * 0.15); // Scale between 1 and 1.15
            const glow = normalized * 20; // Glow radius
            
            appleLogoRef.current.style.transform = `scale(${scale})`;
            appleLogoRef.current.style.filter = `drop-shadow(0 0 ${10 + glow}px rgba(34, 211, 238, ${0.5 + (normalized * 0.5)}))`;
            
            animationFrameRef.current = requestAnimationFrame(draw);
        };

        if (isConnected) {
            draw();
        } else {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            // Reset styles when not connected
            if (appleLogoRef.current) {
                appleLogoRef.current.style.transform = 'scale(1)';
                appleLogoRef.current.style.filter = 'drop-shadow(0 0 10px rgba(34, 211, 238, 0.3))';
            }
        }
    }, [isConnected]);

    // Auto-start when opened
    useEffect(() => {
        if (isOpen && !isConnected && status === 'disconnected') {
            startSession();
        } else if (!isOpen && isConnected) {
            handleDisconnect();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-950/90 backdrop-blur-xl animate-fade-in-up">
            <div className="relative w-full max-w-md bg-gray-900 border border-cyan-500/50 rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(6,182,212,0.3)] flex flex-col h-[600px]">
                
                {/* Background Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.05)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none"></div>

                {/* Header */}
                <div className="relative z-10 p-6 flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
                        <span className="text-cyan-400 font-mono text-xs tracking-widest">UPLINK_SECURE</span>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Main Visualizer Area */}
                <div className="flex-1 flex flex-col items-center justify-center relative z-10">
                    
                    {/* Glowing Apple Visualizer */}
                    <div className="w-48 h-48 flex items-center justify-center">
                         <svg 
                            ref={appleLogoRef}
                            viewBox="0 0 24 30" 
                            className="w-full h-full transition-transform duration-75 ease-linear overflow-visible"
                            style={{ filter: 'drop-shadow(0 0 10px rgba(34, 211, 238, 0.3))' }}
                         >
                            <path d="M16.51 14.54c-.04 2.21 1.94 2.96 2.03 2.99-.01.04-.31 1.08-1.04 2.14-.94 1.36-1.89 1.37-3.34 1.39-1.45.01-1.91-.86-3.57-.86-1.66 0-2.2.85-3.59.88-1.44.03-2.54-1.45-3.46-2.78-1.88-2.72-3.31-7.68-1.38-11.02.95-1.65 2.65-2.7 4.5-2.73 1.41-.03 2.75.95 3.61.95.85 0 2.46-1.18 4.14-1 0.7.03 2.68.28 3.94 2.13-.1.07-2.35 1.37-2.35 4.21z" 
                                  fill="none" 
                                  stroke="#22d3ee"
                                  strokeWidth="0.5"
                            />
                            <path d="M12.92 4.46c.74-.89 1.24-2.13 1.11-3.33-1.06.04-2.34.73-3.1 1.62-.67.78-1.26 2.04-1.1 3.24 1.18.09 2.37-.63 3.09-1.53z" 
                                  fill="none"
                                  stroke="#22d3ee"
                                  strokeWidth="0.5"
                            />
                            {/* Inner fill for better glow effect */}
                            <path d="M16.51 14.54c-.04 2.21 1.94 2.96 2.03 2.99-.01.04-.31 1.08-1.04 2.14-.94 1.36-1.89 1.37-3.34 1.39-1.45.01-1.91-.86-3.57-.86-1.66 0-2.2.85-3.59.88-1.44.03-2.54-1.45-3.46-2.78-1.88-2.72-3.31-7.68-1.38-11.02.95-1.65 2.65-2.7 4.5-2.73 1.41-.03 2.75.95 3.61.95.85 0 2.46-1.18 4.14-1 0.7.03 2.68.28 3.94 2.13-.1.07-2.35 1.37-2.35 4.21z" 
                                  fill="#22d3ee"
                                  opacity="0.1"
                            />
                        </svg>
                    </div>

                    
                    {/* Status Text */}
                    <div className="mt-8 text-center space-y-2">
                        <h3 className="text-2xl font-bold text-white font-mono tracking-tight">TUMELO</h3>
                        <p className="text-cyan-500/80 text-sm font-mono tracking-wider">
                            {status === 'connecting' ? 'ESTABLISHING CONNECTION...' : 
                             status === 'connected' ? 'LISTENING...' : 
                             status === 'error' ? 'CONNECTION FAILED' : 'DISCONNECTED'}
                        </p>
                    </div>
                </div>

                {/* Context Actions (Only visible when connected) */}
                {isConnected && (
                    <div className="px-6 mb-4 grid grid-cols-2 gap-3 relative z-20">
                        <a 
                            href={whatsappUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-green-900/20 border border-green-500/30 text-green-400 p-3 rounded-xl flex flex-col items-center justify-center gap-1 hover:bg-green-500 hover:text-black transition-all group"
                        >
                            <MessageSquare size={18} className="group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-bold font-mono">HUMAN AGENT</span>
                        </a>
                        <a 
                            href="https://www.yaga.co.za/apple911"
                            target="_blank"
                            rel="noreferrer"
                            className="bg-yellow-900/20 border border-yellow-500/30 text-yellow-400 p-3 rounded-xl flex flex-col items-center justify-center gap-1 hover:bg-yellow-500 hover:text-black transition-all group"
                        >
                            <ShoppingBag size={18} className="group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-bold font-mono">YAGA STORE</span>
                        </a>
                    </div>
                )}

                {/* Controls */}
                <div className="relative z-10 p-6 bg-gray-950/50 border-t border-cyan-500/30 backdrop-blur-md">
                     <div className="flex items-center justify-center gap-8">
                         <button 
                            onClick={toggleMute}
                            className={`p-4 rounded-full border transition-all ${
                                isMuted 
                                ? 'bg-red-500/20 border-red-500 text-red-500 hover:bg-red-500 hover:text-white' 
                                : 'bg-gray-800 border-gray-600 text-gray-400 hover:border-white hover:text-white'
                            }`}
                         >
                             {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                         </button>
                         
                         <button 
                            onClick={handleDisconnect}
                            className="p-4 rounded-full bg-red-600/20 border border-red-500 text-red-500 hover:bg-red-600 hover:text-white transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                         >
                             <Zap size={24} />
                         </button>
                     </div>
                     <div className="mt-4 flex justify-between items-center text-[10px] text-gray-600 font-mono">
                         <span className="flex items-center gap-1"><Wifi size={10} /> 24ms LATENCY</span>
                         <span className="flex items-center gap-1"><Activity size={10} /> 16kHz PCM</span>
                     </div>
                </div>
            </div>
        </div>
    );
};

export default LiveVoiceAgent;
