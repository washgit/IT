
import React, { useState, useEffect } from 'react';
import { X, Send, Smartphone, Laptop, Server, Cpu, FileText, CheckCircle, Mail, MapPin, Download } from 'lucide-react';
import { jsPDF } from "jspdf";

export interface BookingData {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
    deviceType?: string;
    serviceType?: string;
    description?: string;
}

interface BookingFormProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: BookingData;
}

const BookingForm: React.FC<BookingFormProps> = ({ isOpen, onClose, initialData }) => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        deviceType: 'iPhone',
        serviceType: 'Repair',
        description: ''
    });

    const [isGenerating, setIsGenerating] = useState(false);

    // Populate form if initialData is provided (from AI or context)
    useEffect(() => {
        if (isOpen && initialData) {
            setFormData(prev => ({
                ...prev,
                name: initialData.name || prev.name,
                phone: initialData.phone || prev.phone,
                email: initialData.email || prev.email,
                address: initialData.address || prev.address,
                deviceType: initialData.deviceType || prev.deviceType,
                serviceType: initialData.serviceType || prev.serviceType,
                description: initialData.description || prev.description
            }));
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const generateJobCardPDF = () => {
        const doc = new jsPDF();
        const refId = `REF-${Date.now().toString().slice(-4)}`;
        const timestamp = new Date().toLocaleString();

        // -- Theme: Tech/Industrial --
        
        // Header Background
        doc.setFillColor(15, 23, 42); // Dark Blue/Gray
        doc.rect(0, 0, 210, 40, 'F');

        // Title
        doc.setTextColor(34, 211, 238); // Cyan
        doc.setFont("courier", "bold");
        doc.setFontSize(22);
        doc.text("APPLE911 SOLUTIONS", 15, 20);
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.text("CYBER REPAIR & DIAGNOSTICS UNIT", 15, 28);

        // Job Details Header
        doc.setTextColor(0, 0, 0);
        doc.setFont("courier", "bold");
        doc.setFontSize(14);
        doc.text("DIGITAL JOB CARD / SERVICE REQUEST", 15, 55);
        
        // Meta Data
        doc.setFontSize(10);
        doc.setFont("courier", "normal");
        doc.text(`ID: ${refId}`, 150, 55);
        doc.text(`DATE: ${timestamp}`, 150, 60);

        // -- Client Info Section --
        doc.setDrawColor(200, 200, 200);
        doc.line(15, 65, 195, 65);
        
        doc.setFont("courier", "bold");
        doc.text("CLIENT IDENTIFICATION", 15, 75);
        
        doc.setFont("courier", "normal");
        doc.text(`NAME:    ${formData.name.toUpperCase()}`, 15, 85);
        doc.text(`PHONE:   ${formData.phone}`, 15, 92);
        doc.text(`EMAIL:   ${formData.email}`, 15, 99);
        doc.text(`ADDRESS: ${formData.address}`, 15, 106);

        // -- Device Info Section --
        doc.line(15, 115, 195, 115);
        doc.setFont("courier", "bold");
        doc.text("HARDWARE SPECIFICATIONS", 15, 125);
        
        doc.setFont("courier", "normal");
        doc.text(`DEVICE TYPE:  ${formData.deviceType.toUpperCase()}`, 15, 135);
        doc.text(`SERVICE TYPE: ${formData.serviceType.toUpperCase()}`, 15, 142);

        // -- Issue Description Box --
        doc.setFont("courier", "bold");
        doc.text("ANOMALY REPORT / ISSUE DESCRIPTION", 15, 160);
        
        doc.setDrawColor(0, 0, 0);
        doc.rect(15, 165, 180, 50); // Box
        
        doc.setFont("courier", "normal");
        doc.setFontSize(9);
        // Word wrap text
        const splitDescription = doc.splitTextToSize(formData.description, 170);
        doc.text(splitDescription, 18, 172);

        // -- Disclaimer --
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text("AUTHORIZATION: By submitting this form, the client authorizes Apple911 to perform diagnostics.", 15, 230);
        doc.text("Hardware repairs may require a 50% deposit on parts.", 15, 235);
        doc.text("All workmanship carries a 30-day warranty.", 15, 240);

        // -- Footer --
        doc.setFillColor(15, 23, 42);
        doc.rect(0, 270, 210, 27, 'F');
        doc.setTextColor(255, 255, 255);
        doc.text("HQ: 31 Maple St, Sunnyside, Pretoria", 15, 280);
        doc.text("WhatsApp: 081 746 3629", 15, 285);
        
        doc.save(`Apple911_JobCard_${refId}.pdf`);
        return refId;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsGenerating(true);

        // 1. Generate & Download PDF
        const refId = generateJobCardPDF();

        // 2. Wait a moment for download to start visually
        await new Promise(resolve => setTimeout(resolve, 1500));

        // 3. Create Simplified WhatsApp Link
        const message = `
*🤖 APPLE911 SERVICE REQUEST*
*ID:* ${refId}
*CLIENT:* ${formData.name}
*DEVICE:* ${formData.deviceType}
-----------------------------
*✅ INSTRUCTIONS:*
I have downloaded my official *Job Card PDF*.
Please see the attached file for full details of my request.
-----------------------------
`.trim();

        const encodedMsg = encodeURIComponent(message);
        
        // 4. Open WhatsApp
        window.open(`https://wa.me/27817463629?text=${encodedMsg}`, '_blank');
        
        setIsGenerating(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-gray-950/90 backdrop-blur-md animate-fade-in-up">
            <div className="w-full max-w-lg bg-gray-900 border border-cyan-500/50 shadow-[0_0_50px_rgba(6,182,212,0.2)] relative overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Schematic Background */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.05)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
                
                {/* Header */}
                <div className="p-4 border-b border-cyan-500/30 flex justify-between items-center bg-gray-900/90 relative z-10">
                    <div className="flex items-center gap-2">
                        <FileText className="text-cyan-400" size={20} />
                        <h3 className="text-cyan-400 font-mono font-bold tracking-widest text-sm">SMART_BOOKING_FORM_V3</h3>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4 relative z-10 overflow-y-auto custom-scrollbar">
                    
                    {/* Personal Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-mono text-cyan-600 uppercase tracking-wider">Operative Name</label>
                            <input 
                                required
                                type="text" 
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                className="w-full bg-gray-950 border border-gray-700 focus:border-cyan-500 text-white p-2 text-sm font-mono rounded-sm outline-none transition-colors"
                                placeholder="ENTER NAME"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-mono text-cyan-600 uppercase tracking-wider">Contact Uplink</label>
                            <input 
                                required
                                type="tel" 
                                value={formData.phone}
                                onChange={e => setFormData({...formData, phone: e.target.value})}
                                className="w-full bg-gray-950 border border-gray-700 focus:border-cyan-500 text-white p-2 text-sm font-mono rounded-sm outline-none transition-colors"
                                placeholder="082 000 0000"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-mono text-cyan-600 uppercase tracking-wider flex items-center gap-1"><Mail size={10} /> Digital Mail Relay</label>
                        <input 
                            required
                            type="email" 
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                            className="w-full bg-gray-950 border border-gray-700 focus:border-cyan-500 text-white p-2 text-sm font-mono rounded-sm outline-none transition-colors"
                            placeholder="user@example.com"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-mono text-cyan-600 uppercase tracking-wider flex items-center gap-1"><MapPin size={10} /> Physical Coordinates</label>
                        <input 
                            required
                            type="text" 
                            value={formData.address}
                            onChange={e => setFormData({...formData, address: e.target.value})}
                            className="w-full bg-gray-950 border border-gray-700 focus:border-cyan-500 text-white p-2 text-sm font-mono rounded-sm outline-none transition-colors"
                            placeholder="Unit 4, 123 Tech Street, City"
                        />
                    </div>

                    {/* Device Info */}
                    <div className="space-y-1 pt-2 border-t border-gray-800">
                        <label className="text-[10px] font-mono text-cyan-600 uppercase tracking-wider">Hardware Identification</label>
                        <div className="grid grid-cols-4 gap-2">
                            {['iPhone', 'MacBook', 'PC', 'Server'].map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setFormData({...formData, deviceType: type})}
                                    className={`p-2 border text-xs font-mono flex flex-col items-center justify-center gap-1 transition-all ${
                                        formData.deviceType === type 
                                        ? 'bg-cyan-900/30 border-cyan-500 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)]' 
                                        : 'bg-gray-950 border-gray-800 text-gray-500 hover:border-gray-600'
                                    }`}
                                >
                                    {type === 'iPhone' && <Smartphone size={14} />}
                                    {type === 'MacBook' && <Laptop size={14} />}
                                    {type === 'PC' && <Cpu size={14} />}
                                    {type === 'Server' && <Server size={14} />}
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-mono text-cyan-600 uppercase tracking-wider">Operation Type</label>
                        <select 
                            value={formData.serviceType}
                            onChange={e => setFormData({...formData, serviceType: e.target.value})}
                            className="w-full bg-gray-950 border border-gray-700 focus:border-cyan-500 text-white p-2 text-sm font-mono rounded-sm outline-none"
                        >
                            <option value="Repair">Hardware Repair</option>
                            <option value="Diagnostic">System Diagnostic</option>
                            <option value="Software">Software/OS</option>
                            <option value="Network">Network/Server</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-mono text-cyan-600 uppercase tracking-wider">Anomaly Description</label>
                        <textarea 
                            required
                            rows={3}
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            className="w-full bg-gray-950 border border-gray-700 focus:border-cyan-500 text-white p-2 text-sm font-mono rounded-sm outline-none resize-none"
                            placeholder="Describe the issue..."
                        ></textarea>
                    </div>

                    <div className="pt-2">
                         <button 
                            type="submit"
                            disabled={isGenerating}
                            className="w-full bg-cyan-600 hover:bg-cyan-500 text-black font-bold p-3 font-mono tracking-widest flex items-center justify-center gap-2 mt-2 shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isGenerating ? (
                                <span className="animate-pulse">GENERATING JOB CARD PDF...</span>
                            ) : (
                                <>
                                    <Download size={16} className="group-hover:translate-y-1 transition-transform" /> 
                                    DOWNLOAD_PDF & OPEN_WHATSAPP
                                </>
                            )}
                        </button>
                        <p className="text-[9px] text-center text-gray-500 font-mono mt-2">
                            * THIS WILL DOWNLOAD A PDF. PLEASE ATTACH IT TO THE WHATSAPP CHAT.
                        </p>
                    </div>
                   
                </form>

                {/* Decorative Corners */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-cyan-500 pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-cyan-500 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-cyan-500 pointer-events-none"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-cyan-500 pointer-events-none"></div>
            </div>
        </div>
    );
};

export default BookingForm;
