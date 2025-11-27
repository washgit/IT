
import React, { useState, useEffect } from 'react';
import { 
  Calendar, Phone, MapPin, Clock, FileText, 
  MessageSquare, Mic, X, Globe, Box, Layers, Target, 
  Wifi, Shield, Cpu, Server, Monitor, 
  Wrench, CloudLightning, MousePointer, Smartphone, ShoppingBag, ExternalLink, Zap, Laptop, FileCheck
} from 'lucide-react';

import ChatBot from './components/ChatBot'; 
import LiveVoiceAgent from './components/LiveVoiceAgent';
import BookingForm, { BookingData } from './components/BookingForm';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  // ChatBot state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [initialChatMsg, setInitialChatMsg] = useState<string | null>(null);

  // Voice Agent State
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

  // Booking Choice Modal State
  const [isBookingChoiceOpen, setIsBookingChoiceOpen] = useState(false);
  const [pendingBookingContext, setPendingBookingContext] = useState<string>('');

  // Smart Booking Form State
  const [isBookingFormOpen, setIsBookingFormOpen] = useState(false);
  const [bookingFormData, setBookingFormData] = useState<BookingData | undefined>(undefined);

  // Satellite Map Modal State
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [is3DMode, setIs3DMode] = useState(true);
  const [showRealColors, setShowRealColors] = useState(false);

  const addressText = "31 Maple St, Sunnyside, Pretoria, 0002";
  const mapCoordinates = "-25.7520566,28.2161283";
  const whatsappNumber = "0817463629";
  const yagaUrl = "https://www.yaga.co.za/apple911";

  const handleBook = (contextMessage: string) => {
    setPendingBookingContext(contextMessage);
    setIsBookingChoiceOpen(true);
  };

  const handleDirectChat = (contextMessage: string) => {
    setInitialChatMsg(contextMessage);
    setIsChatOpen(true);
  };

  const confirmBookingMethod = (method: 'chat' | 'voice' | 'form') => {
      setIsBookingChoiceOpen(false);
      if (method === 'chat') {
          setInitialChatMsg(pendingBookingContext);
          setIsChatOpen(true);
      } else if (method === 'voice') {
          setIsVoiceOpen(true);
      } else {
          setBookingFormData({ description: pendingBookingContext });
          setIsBookingFormOpen(true);
      }
  };

  const handleOpenBookingForm = (data?: BookingData) => {
      if (data) {
          setBookingFormData(data);
      }
      setIsBookingFormOpen(true);
  };

  useEffect(() => {
    const checkStatus = () => {
      const now = new Date();
      const day = now.getDay();
      const hour = now.getHours();
      const isWorkingDay = day >= 1 && day <= 6;
      const isWorkingHour = hour >= 8 && hour < 17;
      setIsOpen(isWorkingDay && isWorkingHour);
    };
    checkStatus();
    const interval = setInterval(checkStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isMapOpen) {
        setShowRealColors(false);
        const timer = setTimeout(() => {
            setShowRealColors(true);
        }, 3000);
        return () => clearTimeout(timer);
    } else {
        setShowRealColors(false);
    }
  }, [isMapOpen]);

  // --- COMPONENTS ---

  const NeonClock = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
      const timer = setInterval(() => setTime(new Date()), 1000);
      return () => clearInterval(timer);
    }, []);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', { hour12: false });
    };
    
    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase();
    };

    const seconds = time.getSeconds();
    const minutes = time.getMinutes();
    const hours = time.getHours();
    
    // Degrees
    const secDeg = seconds * 6;
    const minDeg = minutes * 6 + seconds * 0.1;
    const hourDeg = (hours % 12) * 30 + minutes * 0.5;

    return (
        <div className="flex flex-col items-center justify-center animate-fade-in-up">
            <div className="relative w-48 h-48 md:w-64 md:h-64 group cursor-default transition-all hover:scale-105">
                 {/* SVG HUD Background */}
                 <svg viewBox="0 0 24 30" className="w-full h-full drop-shadow-[0_0_10px_rgba(6,182,212,0.6)] overflow-visible">
                     <defs>
                       <pattern id="gridPattern" width="1" height="1" patternUnits="userSpaceOnUse">
                           <path d="M 1 0 L 0 0 0 1" fill="none" stroke="rgba(34,211,238,0.15)" strokeWidth="0.05"/>
                       </pattern>
                       <filter id="neonGlow">
                          <feGaussianBlur stdDeviation="0.4" result="coloredBlur"/>
                          <feMerge>
                              <feMergeNode in="coloredBlur"/>
                              <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                       </filter>
                       {/* Mask for internal elements like grid/rings to stay inside apple */}
                       <mask id="appleMask">
                          <path d="M16.51 14.54c-.04 2.21 1.94 2.96 2.03 2.99-.01.04-.31 1.08-1.04 2.14-.94 1.36-1.89 1.37-3.34 1.39-1.45.01-1.91-.86-3.57-.86-1.66 0-2.2.85-3.59.88-1.44.03-2.54-1.45-3.46-2.78-1.88-2.72-3.31-7.68-1.38-11.02.95-1.65 2.65-2.7 4.5-2.73 1.41-.03 2.75.95 3.61.95.85 0 2.46-1.18 4.14-1 0.7.03 2.68.28 3.94 2.13-.1.07-2.35 1.37-2.35 4.21z" fill="white" />
                       </mask>
                     </defs>
                     
                     {/* Leaf Outline */}
                     <path d="M12.92 4.46c.74-.89 1.24-2.13 1.11-3.33-1.06.04-2.34.73-3.1 1.62-.67.78-1.26 2.04-1.1 3.24 1.18.09 2.37-.63 3.09-1.53z" 
                           fill="none"
                           stroke="#22d3ee"
                           strokeWidth="0.2"
                           filter="url(#neonGlow)"
                     />
                     
                     {/* Apple Body Outline */}
                     <path d="M16.51 14.54c-.04 2.21 1.94 2.96 2.03 2.99-.01.04-.31 1.08-1.04 2.14-.94 1.36-1.89 1.37-3.34 1.39-1.45.01-1.91-.86-3.57-.86-1.66 0-2.2.85-3.59.88-1.44.03-2.54-1.45-3.46-2.78-1.88-2.72-3.31-7.68-1.38-11.02.95-1.65 2.65-2.7 4.5-2.73 1.41-.03 2.75.95 3.61.95.85 0 2.46-1.18 4.14-1 0.7.03 2.68.28 3.94 2.13-.1.07-2.35 1.37-2.35 4.21z" 
                           fill="rgba(15, 23, 42, 0.4)" 
                           stroke="#22d3ee" 
                           strokeWidth="0.25"
                           className="group-hover:stroke-cyan-300 transition-colors"
                           filter="url(#neonGlow)"
                     />
                     
                     {/* Internal Tech Elements (Masked) */}
                     <g mask="url(#appleMask)">
                         {/* Grid Background */}
                         <rect x="0" y="0" width="24" height="30" fill="url(#gridPattern)" />
                         
                         {/* Rotating Data Rings (Centered at apple body center approx 12, 16) */}
                         <g transform="translate(12, 16)">
                             <circle r="7" fill="none" stroke="#22d3ee" strokeWidth="0.1" strokeDasharray="1 1" className="animate-[spin_20s_linear_infinite] opacity-50" />
                             <circle r="5" fill="none" stroke="#a855f7" strokeWidth="0.1" strokeDasharray="4 2" className="animate-[spin_15s_linear_infinite_reverse] opacity-40" />
                         </g>
                     </g>
                     
                     {/* Scanning Line */}
                      <line x1="0" y1="0" x2="24" y2="0" stroke="rgba(34,211,238,0.5)" strokeWidth="0.2" className="animate-[scan_4s_linear_infinite]" />
                       <style>{`
                          @keyframes scan {
                            0% { transform: translateY(0); opacity: 0; }
                            10% { opacity: 1; }
                            90% { opacity: 1; }
                            100% { transform: translateY(30px); opacity: 0; }
                          }
                        `}</style>
                  </svg>

                  {/* Clock Elements - Centered in Apple Body */}
                  <div className="absolute top-[54%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] flex items-center justify-center">
                     
                     {/* Hands Container */}
                     <div className="relative w-full h-full z-10">
                         {/* Ticks Ring */}
                         <div className="absolute inset-0 border border-cyan-500/20 rounded-full scale-90"></div>
                         
                         {/* Hour Hand */}
                         <div className="absolute inset-0 flex items-center justify-center" style={{ transform: `rotate(${hourDeg}deg)` }}>
                              <div className="w-1.5 h-[35%] bg-purple-500 rounded-sm absolute bottom-1/2 origin-bottom shadow-[0_0_8px_#a855f7] border border-purple-300"></div>
                         </div>
                         {/* Minute Hand */}
                         <div className="absolute inset-0 flex items-center justify-center" style={{ transform: `rotate(${minDeg}deg)` }}>
                              <div className="w-1 h-[45%] bg-cyan-400 rounded-sm absolute bottom-1/2 origin-bottom shadow-[0_0_8px_#22d3ee] border border-cyan-200"></div>
                         </div>
                         {/* Second Hand */}
                         <div className="absolute inset-0 flex items-center justify-center" style={{ transform: `rotate(${secDeg}deg)` }}>
                              <div className="w-0.5 h-[50%] bg-red-500/80 absolute bottom-1/2 origin-bottom shadow-[0_0_5px_#ef4444]"></div>
                              <div className="w-2 h-2 bg-red-500 rounded-full absolute top-[calc(50%-4px)] shadow-[0_0_5px_#ef4444]"></div>
                         </div>
                         {/* Center Nut */}
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-gray-900 border-2 border-cyan-400 rounded-full z-20"></div>
                     </div>
                     
                     {/* Digital Text Overlay */}
                     <div className="absolute top-[75%] left-1/2 -translate-x-1/2 flex flex-col items-center w-full z-0 pointer-events-none">
                         <div className="text-sm md:text-xl font-mono font-bold text-cyan-50 tracking-[0.2em] drop-shadow-[0_0_5px_rgba(34,211,238,0.8)] bg-black/40 px-2 rounded border border-cyan-500/30 backdrop-blur-sm">
                            {formatTime(time)}
                         </div>
                         <div className="text-[8px] md:text-[10px] text-purple-400 font-mono tracking-widest mt-1 uppercase">
                            {formatDate(time)}
                         </div>
                     </div>
                  </div>
            </div>
        </div>
    );
  };

  const Navbar = () => (
    <nav className="fixed w-full z-50 bg-gray-950/80 backdrop-blur-xl border-b border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('home')}>
             <div className="relative">
                <div className="absolute inset-0 bg-cyan-500 blur-lg opacity-40 group-hover:opacity-60 transition-opacity"></div>
                <div className="bg-gray-900 border border-white/10 p-2 rounded-xl text-white relative z-10 group-hover:border-cyan-500/50 transition-colors">
                    <Cpu size={24} className="text-cyan-400" />
                </div>
             </div>
             <span className="text-2xl font-bold text-white tracking-tighter font-mono">
                APPLE<span className="text-red-500">911</span>
             </span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <button onClick={() => setActiveTab('home')} className={`${activeTab === 'home' ? 'text-cyan-400 font-bold shadow-[0_2px_0_0_rgba(34,211,238,1)]' : 'text-gray-400 hover:text-white'} py-2 transition-all font-mono text-sm tracking-wide`}>// HOME</button>
            <button onClick={() => setActiveTab('services')} className={`${activeTab === 'services' ? 'text-cyan-400 font-bold shadow-[0_2px_0_0_rgba(34,211,238,1)]' : 'text-gray-400 hover:text-white'} py-2 transition-all font-mono text-sm tracking-wide`}>// DIAGNOSTICS</button>
            <button onClick={() => setActiveTab('remote')} className={`${activeTab === 'remote' ? 'text-cyan-400 font-bold shadow-[0_2px_0_0_rgba(34,211,238,1)]' : 'text-gray-400 hover:text-white'} py-2 transition-all font-mono text-sm tracking-wide`}>// REMOTE_LINK</button>
            
            <a 
              href={yagaUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-gray-400 hover:text-yellow-400 font-mono text-sm transition-colors"
            >
              <ShoppingBag size={14} /> SHOP
            </a>

            <button 
              onClick={() => setActiveTab('book-now')}
              className="bg-cyan-900/20 text-cyan-400 border border-cyan-500/50 px-6 py-2 rounded-none hover:bg-cyan-500 hover:text-black transition-all font-bold font-mono text-sm flex items-center gap-2 group"
            >
              <Zap size={14} className="group-hover:fill-black" />
              DEPLOY_TECH
            </button>
          </div>

          <div className="md:hidden">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-400 hover:text-white p-2">
               {mobileMenuOpen ? <X size={24} /> : <Layers size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-950/95 border-b border-white/10 backdrop-blur-xl p-4 space-y-4 shadow-2xl animate-fade-in-up">
           <button onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }} className="block w-full text-left font-mono font-bold text-gray-300 p-2 hover:bg-white/5 rounded-lg border-l-2 border-transparent hover:border-cyan-500">HOME</button>
           <button onClick={() => { setActiveTab('services'); setMobileMenuOpen(false); }} className="block w-full text-left font-mono font-bold text-gray-300 p-2 hover:bg-white/5 rounded-lg border-l-2 border-transparent hover:border-cyan-500">SERVICES</button>
           <button onClick={() => { setActiveTab('remote'); setMobileMenuOpen(false); }} className="block w-full text-left font-mono font-bold text-gray-300 p-2 hover:bg-white/5 rounded-lg border-l-2 border-transparent hover:border-cyan-500">REMOTE_SUPPORT</button>
           <a href={yagaUrl} target="_blank" rel="noreferrer" className="block w-full text-left font-mono font-bold text-yellow-500 p-2 hover:bg-white/5 rounded-lg border-l-2 border-transparent hover:border-yellow-500">VISIT STORE</a>
           <button onClick={() => { setActiveTab('book-now'); setMobileMenuOpen(false); }} className="block w-full text-center bg-cyan-600 text-black py-3 font-bold font-mono tracking-widest mt-4">CONTACT_HQ</button>
        </div>
      )}
    </nav>
  );

  const ITHero = () => (
    <div className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden bg-gray-950 min-h-[90vh] flex items-center">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_100%)] pointer-events-none"></div>
      
      {/* Glowing Orbs */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-cyan-900/30 rounded-full blur-[128px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-900/30 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
         
         <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
             {/* Left Column: Clock */}
             <div className="flex-shrink-0 animate-fade-in-up">
                 <NeonClock />
             </div>

             {/* Right Column: Content */}
             <div className="text-center lg:text-left flex-1">
                 <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 text-cyan-400 px-4 py-2 rounded-full text-xs font-mono mb-8 animate-fade-in-up backdrop-blur-md">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                    </span>
                    SYSTEM STATUS: ONLINE
                 </div>

                 <h1 className="text-5xl md:text-8xl font-black text-white mb-6 tracking-tighter leading-tight animate-fade-in-up uppercase font-mono" style={{ animationDelay: '0.1s' }}>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 drop-shadow-[0_0_30px_rgba(6,182,212,0.5)]">Apple911</span>
                    <br /> <span className="text-3xl md:text-5xl text-gray-500">Cyber Repair Unit</span>
                 </h1>
                 
                 <p className="text-xl text-gray-400 mb-10 max-w-xl mx-auto lg:mx-0 animate-fade-in-up font-light leading-relaxed" style={{ animationDelay: '0.2s' }}>
                    Advanced diagnostics, precision hardware restoration, and secure remote intervention. We bring your tech back to life.
                 </p>
                 
                 <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                    <button 
                        onClick={() => handleBook("I need to book a technician.")}
                        className="group relative bg-white text-black px-8 py-4 font-bold text-lg hover:bg-cyan-400 transition-all flex items-center justify-center gap-2 font-mono overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        <Wrench size={20} className="relative z-10" /> <span className="relative z-10">INITIATE REPAIR</span>
                    </button>
                    <button 
                        onClick={() => handleBook("I need remote assistance immediately.")}
                        className="bg-transparent text-cyan-400 border border-cyan-500/50 px-8 py-4 font-bold text-lg hover:bg-cyan-950/30 hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] transition-all flex items-center justify-center gap-2 font-mono backdrop-blur-sm"
                    >
                        <CloudLightning size={20} /> REMOTE UPLINK
                    </button>
                    <a 
                        href={yagaUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-8 py-4 font-bold text-lg hover:from-yellow-500 hover:to-orange-500 transition-all flex items-center justify-center gap-2 font-mono shadow-[0_0_20px_rgba(234,179,8,0.3)]"
                    >
                        <ShoppingBag size={20} /> SHOP DEVICES
                    </a>
                 </div>
             </div>
         </div>
      </div>
    </div>
  );

  const ITServices = () => (
    <div className="py-24 bg-gray-950 relative" id="services">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-cyan-950/20 via-gray-950 to-gray-950"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-white mb-4 font-mono tracking-tight"><span className="text-cyan-500">//</span> CORE_PROTOCOLS</h2>
                <p className="text-gray-500 max-w-2xl mx-auto font-light">Deploying advanced solutions for all hardware and software anomalies.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-center">
                {[
                    { title: "Precision Repair", icon: <Cpu size={32} />, desc: "Component-level board repair for MacBooks, iPhones, and Servers.", color: "cyan", action: "Diagnose" },
                    { title: "Universal Ops", icon: <Laptop size={32} />, desc: "Full spectrum support for Windows, Android, and Linux systems.", color: "orange", action: "Scan" },
                    { title: "Infrastructure", icon: <Server size={32} />, desc: "Network cabling, server rack configuration, and secure deployment.", color: "purple", action: "Deploy" },
                    { title: "Remote Uplink", icon: <Monitor size={32} />, desc: "Instant secure connection via TeamViewer for software troubleshooting.", color: "blue", action: "Connect" },
                    { 
                        title: "Certified Store", 
                        icon: <ShoppingBag size={32} />, 
                        desc: "Purchase verified Apple devices and high-performance parts directly via Yaga.", 
                        color: "yellow", 
                        isStore: true 
                    }
                ].map((service, index) => (
                    <div key={index} className="bg-gray-900/50 backdrop-blur-sm p-8 border border-white/5 hover:border-cyan-500/30 transition-all hover:-translate-y-2 group relative overflow-hidden">
                        {/* Hover Gradient */}
                        <div className={`absolute inset-0 bg-gradient-to-br from-${service.color}-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                        
                        <div className={`w-14 h-14 bg-${service.color}-900/20 border border-${service.color}-500/30 text-${service.color}-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                            {service.icon}
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3 font-mono">{service.title}</h3>
                        <p className="text-gray-400 text-sm mb-8 leading-relaxed">{service.desc}</p>
                        
                        {service.isStore ? (
                            <a 
                                href={yagaUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="absolute bottom-0 left-0 w-full bg-yellow-600/20 text-yellow-400 py-4 font-mono font-bold text-xs hover:bg-yellow-500 hover:text-black transition-colors flex items-center justify-center gap-2 border-t border-yellow-500/30"
                            >
                                ACCESS STORE <ExternalLink size={14} />
                            </a>
                        ) : (
                            <button 
                                onClick={() => handleBook(`I am interested in ${service.title}`)}
                                className="absolute bottom-0 left-0 w-full bg-white/5 text-gray-300 py-4 font-mono font-bold text-xs hover:bg-cyan-500 hover:text-black transition-colors flex items-center justify-center gap-2 border-t border-white/10"
                            >
                                {service.action.toUpperCase()} <MousePointer size={14} />
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    </div>
  );

  const RemoteSupport = () => (
    <div className="py-20 bg-gray-900 border-y border-white/5">
        <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="w-20 h-20 bg-green-500/10 border border-green-500/30 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                <Wifi size={40} />
            </div>
            <h2 className="text-4xl font-bold text-white mb-6 font-mono tracking-tight">SECURE_REMOTE_ACCESS</h2>
            <p className="text-xl text-gray-400 mb-10 leading-relaxed font-light">
                Distance is irrelevant. Our technicians can establish a secure encrypted uplink to diagnose and repair software anomalies instantly.
            </p>
            <div className="bg-gray-950/50 p-8 border border-white/10 backdrop-blur-sm inline-block w-full text-left relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-green-500 shadow-[0_0_10px_#22c55e]"></div>
                
                <h3 className="font-bold text-white mb-6 flex items-center gap-2 text-lg font-mono">
                    <Shield size={24} className="text-green-500" /> PROTOCOL SEQUENCE:
                </h3>
                <ul className="space-y-6 text-gray-400">
                    <li className="flex gap-4 items-start">
                        <span className="bg-gray-800 text-green-500 w-8 h-8 flex items-center justify-center text-sm font-bold font-mono shrink-0 border border-green-500/30">01</span>
                        <div>
                            <p className="font-bold text-white font-mono">Establish Contact</p>
                            <p className="text-sm">Initiate communication via WhatsApp to define the error parameters.</p>
                        </div>
                    </li>
                    <li className="flex gap-4 items-start">
                        <span className="bg-gray-800 text-green-500 w-8 h-8 flex items-center justify-center text-sm font-bold font-mono shrink-0 border border-green-500/30">02</span>
                         <div>
                            <p className="font-bold text-white font-mono">Verify Credentials</p>
                            <p className="text-sm">Secure payment processing via provided encrypted link.</p>
                        </div>
                    </li>
                    <li className="flex gap-4 items-start">
                        <span className="bg-gray-800 text-green-500 w-8 h-8 flex items-center justify-center text-sm font-bold font-mono shrink-0 border border-green-500/30">03</span>
                         <div>
                            <p className="font-bold text-white font-mono">Remote Injection</p>
                            <p className="text-sm">Technician connects via AnyDesk to execute repair scripts while you monitor.</p>
                        </div>
                    </li>
                </ul>
                <div className="mt-10 text-center">
                     <button 
                        onClick={() => handleBook("I need to start a Remote Support session.")}
                        className="bg-green-600 text-black px-8 py-4 font-bold text-lg hover:bg-green-500 w-full transition-all flex items-center justify-center gap-2 font-mono shadow-[0_0_20px_rgba(34,197,94,0.4)]"
                     >
                        <MessageSquare size={24} /> INITIALIZE WHATSAPP SESSION
                     </button>
                </div>
            </div>
        </div>
    </div>
  );

  const HomeLocationSection = () => (
    <div className="py-24 bg-gray-950 relative border-t border-white/5">
         {/* Background glow similar to other sections */}
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
         
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
             <div className="text-center mb-12">
                <h2 className="text-2xl font-bold text-white font-mono tracking-tight flex items-center justify-center gap-2">
                    <Target className="text-red-500 animate-pulse" size={20} /> 
                    HQ_TARGETING_SYSTEM
                </h2>
                <p className="text-gray-600 font-mono text-xs mt-2">SECURE CONNECTION ESTABLISHED</p>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {/* Hours */}
                <div className="bg-gray-900/30 backdrop-blur-sm p-8 border border-white/10 rounded-sm relative group overflow-hidden">
                    <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    <div className="flex justify-between items-start mb-6 relative z-10">
                         <div className="p-3 bg-gray-800 rounded-sm border border-white/5 text-cyan-500">
                             <Clock size={24} />
                         </div>
                         <div className={`px-3 py-1 text-[10px] font-bold tracking-wider flex items-center gap-2 border transition-all duration-500 font-mono ${
                            isOpen 
                            ? 'bg-green-500/10 text-green-500 border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.2)]' 
                            : 'bg-gray-800 text-gray-500 border-gray-700'
                        }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                            {isOpen ? 'ONLINE' : 'OFFLINE'}
                        </div>
                    </div>
                    
                    <h3 className="font-bold text-white mb-2 font-mono text-lg relative z-10">OPERATIONAL HOURS</h3>
                    <div className="space-y-2 text-sm font-mono text-gray-400 relative z-10">
                        <div className="flex justify-between py-2 border-b border-white/5">
                            <span>MON - FRI</span>
                            <span className="text-white">0800 - 1700</span>
                        </div>
                        <div className="flex justify-between py-2">
                            <span>WEEKEND</span>
                            <span className="text-red-500">EMERGENCY PROTOCOL</span>
                        </div>
                    </div>
                </div>

                {/* Location Map Trigger */}
                <div className="bg-gray-900/30 backdrop-blur-sm p-1 border border-white/10 rounded-sm relative group">
                    <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                    
                    <button 
                        onClick={() => setIsMapOpen(true)}
                        className="relative w-full h-full min-h-[200px] bg-gray-950 overflow-hidden group/btn"
                    >
                         {/* Fake Map Background */}
                         <div className="absolute inset-0 opacity-50 grayscale group-hover/btn:grayscale-0 transition-all duration-700" 
                              style={{ 
                                  backgroundImage: 'url("https://vtc.vn/img/no-image-found.jpg")', 
                                  background: 'linear-gradient(45deg, #111 25%, #1a1a1a 25%, #1a1a1a 50%, #111 50%, #111 75%, #1a1a1a 75%, #1a1a1a 100%)',
                                  backgroundSize: '20px 20px'
                              }}
                         ></div>
                         
                         {/* Overlay */}
                         <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent opacity-80"></div>
                         
                         {/* Grid Lines */}
                         <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>

                         <div className="absolute bottom-6 left-6 text-left z-10">
                             <div className="flex items-center gap-2 text-cyan-400 mb-2">
                                <MapPin size={16} /> <span className="font-mono text-xs tracking-widest">COORDINATES</span>
                             </div>
                             <p className="text-white font-mono text-sm max-w-[200px] leading-tight">{addressText}</p>
                         </div>

                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                             <div className="w-16 h-16 rounded-full border border-cyan-500/50 flex items-center justify-center bg-gray-950/50 backdrop-blur-sm shadow-[0_0_20px_rgba(6,182,212,0.4)] group-hover/btn:scale-110 transition-transform">
                                <Globe size={24} className="text-cyan-400 animate-pulse" />
                             </div>
                         </div>
                         
                         <div className="absolute top-4 right-4 z-10">
                             <span className="text-[10px] bg-cyan-900/80 text-cyan-300 px-2 py-1 font-mono border border-cyan-500/30">SAT_VIEW</span>
                         </div>
                    </button>
                </div>
             </div>
         </div>
    </div>
  );

  const renderContent = () => {
    switch(activeTab) {
      case 'home':
        return (
          <>
            <ITHero />
            <ITServices />
            <HomeLocationSection />
          </>
        );
      case 'services':
        return <ITServices />;
      case 'remote':
        return <RemoteSupport />;
      case 'book-now':
        return (
          <div className="min-h-screen pt-32 pb-20 px-4 max-w-2xl mx-auto text-center animate-fade-in-up">
            <h2 className="text-3xl font-bold mb-8 text-white font-mono">CONTACT_HQ</h2>
            
            <div className="bg-gray-900/80 p-8 border border-white/10 backdrop-blur-md mb-8 relative overflow-hidden group">
               <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                 <Calendar className="text-cyan-400" size={36} />
               </div>
               <p className="text-gray-400 mb-8 text-lg">
                 Schedule precision hardware repair or on-site deployment.
                 <br/><span className="text-sm text-gray-500 mt-2 block font-mono">AI DIAGNOSTICS ONLINE</span>
               </p>
               
               <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
                  <button 
                    onClick={() => handleDirectChat("Hi, I'd like a quote for IT services.")}
                    className="flex items-center justify-center gap-3 bg-cyan-600 text-black px-6 py-4 font-bold text-lg hover:bg-cyan-500 transition-all w-full sm:w-auto font-mono"
                  >
                    <MessageSquare size={24} />
                    AI CHAT
                  </button>
                  <button 
                    onClick={() => setIsVoiceOpen(true)}
                    className="flex items-center justify-center gap-3 bg-white/10 text-white px-6 py-4 font-bold text-lg hover:bg-white/20 w-full sm:w-auto transition-all backdrop-blur-sm border border-white/10 font-mono"
                  >
                    <Mic size={24} />
                    VOICE AGENT
                  </button>
               </div>
            </div>

            <div className="bg-blue-900/10 p-6 border border-blue-500/20 text-left mb-8">
              <h3 className="font-bold text-blue-400 mb-4 flex items-center gap-2 font-mono">
                <FileText size={20} /> SERVICE_POLICIES
              </h3>
              <ul className="space-y-3 text-sm text-gray-400 font-mono">
                 <li className="flex gap-2">
                    <span className="text-blue-500">>></span> 
                    <span>Call-out fees apply for on-site recon.</span>
                 </li>
                 <li className="flex gap-2">
                    <span className="text-blue-500">>></span> 
                    <span>Hardware repairs: <strong>50% deposit</strong> required.</span>
                 </li>
                 <li className="flex gap-2">
                    <span className="text-blue-500">>></span> 
                    <span>Remote assistance is prepaid.</span>
                 </li>
                 <li className="flex gap-2">
                    <span className="text-blue-500">>></span> 
                    <span><strong>30-day warranty</strong> on all workmanship.</span>
                 </li>
              </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-900/80 p-6 border border-white/10 text-left relative overflow-hidden group">
                    <div className={`absolute top-4 right-4 px-3 py-1 text-[10px] font-bold tracking-wider flex items-center gap-2 border transition-all duration-500 font-mono ${
                        isOpen 
                        ? 'bg-green-500/10 text-green-500 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.4)]' 
                        : 'bg-gray-800 text-gray-500 border-gray-700'
                    }`}>
                        <div className={`w-2 h-2 rounded-full ${isOpen ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                        {isOpen ? 'ONLINE' : 'OFFLINE'}
                    </div>

                    <h3 className="font-bold text-white mb-6 flex items-center gap-2 font-mono">
                        <Clock size={20} className="text-cyan-500" /> 
                        OPS HOURS
                    </h3>
                    <div className="space-y-3 text-sm font-mono text-gray-400">
                        <div className="flex justify-between items-center border-b border-white/5 pb-2">
                            <span>Mon - Fri</span>
                            <span className="text-white">08:00 - 17:00</span>
                        </div>
                        <div className="flex justify-between items-center pb-2">
                            <span>Sat - Sun</span>
                            <span className="text-red-500">EMERGENCY ONLY</span>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-900/80 p-6 border border-white/10 text-left flex flex-col justify-between">
                    <div>
                        <h3 className="font-bold text-white mb-4 flex items-center gap-2 font-mono">
                            <MapPin size={20} className="text-cyan-500" /> 
                            COORDS
                        </h3>
                        <p className="text-gray-400 text-sm leading-relaxed mb-4 font-mono">
                            {addressText}
                        </p>
                    </div>
                    
                    <button 
                        onClick={() => setIsMapOpen(true)}
                        className="group relative w-full h-24 overflow-hidden border border-cyan-500/30 mt-auto bg-gray-950"
                    >
                         <div className="absolute inset-0 bg-cyan-900/20 group-hover:bg-cyan-500/20 transition-colors flex items-center justify-center z-10">
                             <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs bg-gray-950/80 backdrop-blur-md px-3 py-1.5 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.4)] font-mono">
                                <Globe size={14} className="animate-pulse" /> SATELLITE_FEED
                             </div>
                         </div>
                         {/* Grid Pattern */}
                         <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px] opacity-30"></div>
                    </button>
                </div>
            </div>

             <div className="mt-12 flex justify-center pb-12">
                <a 
                  href={`https://wa.me/27${whatsappNumber.substring(1)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-3 text-white bg-green-600/10 p-4 border border-green-500/30 hover:bg-green-600/20 transition-all group w-full md:w-auto"
                >
                  <span className="p-1 bg-[#25D366] text-white rounded shadow-lg group-hover:shadow-[0_0_15px_#25D366] transition-shadow"><Smartphone size={18}/></span> 
                  <span className="font-bold font-mono tracking-wider">{whatsappNumber}</span>
                  <span className="text-green-400 text-xs uppercase font-bold tracking-widest">[WHATSAPP]</span>
                </a>
             </div>
          </div>
        );
      default:
        return (
            <>
              <ITHero />
              <ITServices />
            </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 font-sans text-gray-200 selection:bg-cyan-900 selection:text-cyan-100">
      <Navbar />
      
      <main>
        {renderContent()}
      </main>

      {/* Booking Choice Modal */}
      {isBookingChoiceOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-md animate-fade-in-up">
            <div className="bg-gray-900 border border-white/10 w-full max-w-lg overflow-hidden relative shadow-[0_0_50px_rgba(0,0,0,0.8)]">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-purple-500"></div>
                <button 
                    onClick={() => setIsBookingChoiceOpen(false)}
                    className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white transition-colors z-10"
                >
                    <X size={20} />
                </button>

                <div className="p-8 text-center">
                    <h3 className="text-2xl font-bold text-white mb-2 font-mono">COMM_LINK ESTABLISHED</h3>
                    <p className="text-gray-500 mb-8 font-light">Select your preferred communication protocol:</p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <button 
                            onClick={() => confirmBookingMethod('chat')}
                            className="group flex flex-col items-center justify-center p-4 border border-white/10 hover:border-cyan-500 hover:bg-cyan-950/20 transition-all duration-300"
                        >
                            <div className="w-12 h-12 bg-cyan-900/20 text-cyan-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                                <MessageSquare size={24} />
                            </div>
                            <span className="font-bold text-white text-sm mb-1 font-mono">TEXT_CHAT</span>
                            <span className="text-[10px] text-cyan-600 font-mono tracking-wider">AUTOMATED</span>
                        </button>

                         <button 
                            onClick={() => confirmBookingMethod('form')}
                            className="group flex flex-col items-center justify-center p-4 border border-white/10 hover:border-green-500 hover:bg-green-950/20 transition-all duration-300"
                        >
                            <div className="w-12 h-12 bg-green-900/20 text-green-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                                <FileCheck size={24} />
                            </div>
                            <span className="font-bold text-white text-sm mb-1 font-mono">SMART_FORM</span>
                            <span className="text-[10px] text-green-600 font-mono tracking-wider">MANUAL_ENTRY</span>
                        </button>

                        <button 
                            onClick={() => confirmBookingMethod('voice')}
                            className="group flex flex-col items-center justify-center p-4 border border-white/10 hover:border-purple-500 hover:bg-purple-950/20 transition-all duration-300 relative overflow-hidden"
                        >
                            <div className="w-12 h-12 bg-purple-900/20 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                                <Mic size={24} />
                            </div>
                            <span className="font-bold text-white text-sm mb-1 font-mono">VOICE_LINK</span>
                            <span className="text-[10px] text-purple-600 font-mono tracking-wider">AI_AGENT</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Cyber FBI Satellite Map Modal */}
      {isMapOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950/95 p-4 animate-fade-in-up" onClick={() => setIsMapOpen(false)}>
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(0,255,255,0.06),rgba(0,0,255,0.06))] z-0 pointer-events-none bg-[length:100%_4px,3px_100%] opacity-20"></div>
            
            <div className="relative w-full max-w-6xl h-[85vh] bg-black border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.2)] flex flex-col font-mono text-cyan-500 overflow-hidden" onClick={e => e.stopPropagation()}>
                
                <div className="bg-black/90 p-4 border-b border-cyan-500/30 flex justify-between items-center z-20 relative backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                             <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse shadow-[0_0_10px_#ef4444]"></div>
                             <span className="text-red-500 font-bold tracking-widest text-xs">REC</span>
                        </div>
                        <div className="h-6 w-px bg-cyan-800/50"></div>
                        <div>
                            <h3 className="text-xl font-bold tracking-[0.2em] text-cyan-400 drop-shadow-[0_0_5px_rgba(6,182,212,0.8)] flex items-center gap-2">
                                <Shield size={16} /> 
                                {showRealColors ? "TARGET_ACQUIRED" : "SATELLITE_LINK"}
                            </h3>
                            <p className="text-[10px] text-cyan-600/80 tracking-widest font-mono">
                                {showRealColors ? "OPTICAL_FEED_LIVE // 4K" : "ENCRYPTING_DATA_STREAM..."}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex flex-col text-right text-[10px] text-cyan-700 font-mono leading-tight">
                            <span>LAT: {mapCoordinates.split(',')[0]}</span>
                            <span>LNG: {mapCoordinates.split(',')[1]}</span>
                        </div>
                        <button onClick={() => setIsMapOpen(false)} className="text-cyan-800 hover:text-red-500 transition-colors p-2 hover:bg-cyan-950/30 rounded">
                            <X size={24} />
                        </button>
                    </div>
                </div>
                
                <div className="relative flex-1 bg-gray-900 overflow-hidden perspective-[2000px]">
                    <div 
                        className="w-full h-full transition-all duration-1000 ease-in-out origin-center"
                        style={{
                            transform: is3DMode 
                                ? 'rotateX(45deg) scale(1.4) translateY(-10%)' 
                                : 'rotateX(0deg) scale(1) translateY(0)',
                            transformStyle: 'preserve-3d'
                        }}
                    >
                         <iframe 
                            width="100%" 
                            height="100%" 
                            frameBorder="0" 
                            scrolling="no" 
                            marginHeight={0} 
                            marginWidth={0} 
                            src={`https://maps.google.com/maps?q=${mapCoordinates}&t=k&z=20&ie=UTF8&iwloc=&output=embed`}
                            className="w-full h-full"
                            style={{ 
                                filter: showRealColors 
                                    ? 'grayscale(0) invert(0) sepia(0) hue-rotate(0deg) contrast(1.1) brightness(1.1)' 
                                    : 'grayscale(1) invert(1) sepia(1) hue-rotate(180deg) contrast(1.5) brightness(0.8)',
                                transition: 'filter 2s ease-in-out'
                            }}
                            title="Satellite View"
                            allowFullScreen
                        ></iframe>
                    </div>

                    <div className="absolute inset-0 pointer-events-none z-30">
                        {!showRealColors && (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center animate-fade-in-up">
                                <div className="w-[300px] h-[300px] border border-cyan-500/30 rounded-full flex items-center justify-center relative animate-[spin_10s_linear_infinite]"></div>
                                <div className="absolute">
                                    <Target size={40} className="text-red-500 animate-ping opacity-75" />
                                </div>
                                <div className="absolute mt-40 bg-gray-950/80 text-cyan-400 text-[10px] font-bold px-3 py-1 border border-cyan-500/50 tracking-widest animate-pulse">
                                    TRIANGULATING...
                                </div>
                            </div>
                        )}
                        
                        {showRealColors && (
                             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-bounce">
                                <div className="relative">
                                    <MapPin size={48} className="text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]" fill="currentColor" />
                                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-1 bg-red-500/50 blur-sm rounded-full"></div>
                                </div>
                             </div>
                        )}
                        
                        {/* HUD Corners */}
                        <div className="absolute top-8 left-8 w-16 h-16 border-t-2 border-l-2 border-cyan-500/50"></div>
                        <div className="absolute top-8 right-8 w-16 h-16 border-t-2 border-r-2 border-cyan-500/50"></div>
                        <div className="absolute bottom-8 left-8 w-16 h-16 border-b-2 border-l-2 border-cyan-500/50"></div>
                        <div className="absolute bottom-8 right-8 w-16 h-16 border-b-2 border-r-2 border-cyan-500/50"></div>
                    </div>
                    
                    <div className={`absolute top-0 left-0 w-full h-0.5 bg-cyan-500/80 shadow-[0_0_20px_#06b6d4] animate-[scan_3s_linear_infinite] z-40 opacity-70 transition-opacity duration-1000 ${showRealColors ? 'opacity-0' : 'opacity-70'}`}></div>
                    
                    <style>{`
                      @keyframes scan {
                        0% { transform: translateY(-100%); opacity: 0; }
                        10% { opacity: 1; }
                        90% { opacity: 1; }
                        100% { transform: translateY(100vh); opacity: 0; }
                      }
                    `}</style>
                </div>
            </div>
        </div>
      )}

      {/* Smart Booking Form */}
      <BookingForm 
         isOpen={isBookingFormOpen}
         onClose={() => setIsBookingFormOpen(false)}
         initialData={bookingFormData}
      />

      {/* Persistent ChatBot */}
      <ChatBot 
        isOpen={isChatOpen} 
        setIsOpen={setIsChatOpen} 
        initialMessage={initialChatMsg}
        openBookingForm={handleOpenBookingForm} 
      />

      {/* Live Voice Agent */}
      <LiveVoiceAgent 
          isOpen={isVoiceOpen} 
          onClose={() => setIsVoiceOpen(false)} 
          initialContext={pendingBookingContext}
          openBookingForm={handleOpenBookingForm}
      />

      {/* Floating Action Button for Voice */}
      <div className="fixed bottom-28 right-6 z-40 group">
        <div className="absolute right-20 top-1/2 -translate-y-1/2 bg-gray-950/80 backdrop-blur border border-cyan-500/30 text-white px-4 py-3 shadow-[0_0_20px_rgba(6,182,212,0.3)] opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap translate-x-4 group-hover:translate-x-0 hidden md:block clip-path-polygon">
            <p className="font-bold text-sm tracking-wide font-mono text-cyan-400">AI_SUPPORT_UNIT</p>
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">VOICE UPLINK READY</p>
        </div>
        
        <button
            onClick={() => setIsVoiceOpen(true)}
            className="relative bg-black text-white p-4 shadow-[0_0_25px_rgba(6,182,212,0.6)] hover:shadow-[0_0_40px_rgba(6,182,212,0.8)] border border-cyan-500 transition-all hover:scale-110 active:scale-95 group-hover:rotate-12 clip-path-hexagon"
        >
             <div className="absolute inset-0 bg-cyan-500 blur-xl opacity-20 animate-pulse"></div>
            <Mic size={28} className="relative z-10 text-cyan-100" />
        </button>
        <style>{`
            .clip-path-polygon {
                clip-path: polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%);
            }
            .clip-path-hexagon {
                clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
            }
        `}</style>
      </div>

      <footer className="bg-gray-950 text-white py-12 border-t border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px] opacity-20 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center relative z-10">
          <div className="mb-6 md:mb-0 text-center md:text-left">
            <h4 className="text-2xl font-bold text-white font-mono">APPLE<span className="text-red-500">911</span></h4>
            <p className="text-gray-500 text-sm mt-1 font-mono">Cyber Repair & Diagnostics</p>
          </div>
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="text-center md:text-left">
              <p className="text-cyan-500 text-xs uppercase tracking-wider mb-1 font-mono">SECURE_COMMS</p>
              <a href={`https://wa.me/27${whatsappNumber.substring(1)}`} className="font-bold hover:text-cyan-400 transition-colors cursor-pointer flex items-center justify-center md:justify-start gap-2 font-mono">
                 <div className="bg-green-900/30 p-1 border border-green-500/30 text-green-500">
                    <MessageSquare size={14} /> 
                 </div>
                 {whatsappNumber}
              </a>
            </div>
            <div className="text-center md:text-left">
               <p className="text-cyan-500 text-xs uppercase tracking-wider mb-1 font-mono">HQ_COORDS</p>
               <p className="font-bold text-sm max-w-xs text-gray-400 font-mono">{addressText}</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
