"use client";

import React, { useState, useRef, useEffect } from 'react';
import Webcam from "react-webcam";
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, MapPin, Cpu, Leaf, ScanLine, ShieldCheck } from 'lucide-react';
import { GoogleGenerativeAI } from "@google-generative-ai/generative-ai";

// --- CONFIGURATION ---
// In a real app, keep this on the server. For your college pitch, 
// you can put it here or in your Vercel Env Variables.
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "YOUR_API_KEY_HERE";
const genAI = new GoogleGenerativeAI(API_KEY);

export default function ArcApp() {
  const webcamRef = useRef<Webcam>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [scanResult, setScanResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // 1. Initialize Permissions & Metadata
  useEffect(() => {
    // Request Location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setError("Location access required for Passport Registry.")
      );
    }

    // Capture Device Data (For Technical Marks)
    setDeviceInfo({
      model: navigator.platform,
      engine: navigator.userAgent.split(' ')[0],
      cores: navigator.hardwareConcurrency || 'N/A',
    });
  }, []);

  // 2. The AI Scan Logic
  const executeArcScan = async () => {
    if (!webcamRef.current) return;
    setIsScanning(true);
    setScanResult(null);

    try {
      const imageBase64 = webcamRef.current.getScreenshot()?.split(',')[1];
      if (!imageBase64) throw new Error("Camera capture failed");

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `
        ACT AS: Arc Digital Product Passport System.
        ANALYZE: The luxury item in this image.
        CONTEXT: Location ${location?.lat}, ${location?.lng}. Device: ${deviceInfo?.model}.
        
        TASK: Generate a Digital Twin record in JSON format:
        {
          "age": "Estimated age based on wear",
          "carbon": "Total kg CO2e footprint",
          "origin": "Likely manufacturing region",
          "auth": "Authenticity Confidence %"
        }
      `;

      const result = await model.generateContent([
        prompt,
        { inlineData: { data: imageBase64, mimeType: "image/jpeg" } }
      ]);

      const responseText = result.response.text();
      const cleanJson = JSON.parse(responseText.replace(/```json|```/g, ""));
      setScanResult(cleanJson);
    } catch (err) {
      console.error(err);
      setError("Sync failed. Check API Key or Internet.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] flex flex-col items-center p-6 font-sans">
      
      {/* Symmetrical Header */}
      <header className="w-full max-w-md flex justify-between items-center mb-10">
        <div className="flex flex-col">
          <h1 className="text-3xl font-black tracking-tighter text-[#00b894]">ARC</h1>
          <span className="text-[10px] tracking-[0.3em] text-slate-500 uppercase font-bold">Circular Infrastructure</span>
        </div>
        <div className="flex gap-3">
          <div className={`p-2 rounded-full border ${location ? 'border-[#00b894] text-[#00b894]' : 'border-red-900 text-red-500'}`}>
            <MapPin size={16} />
          </div>
          <div className="p-2 rounded-full border border-slate-700 text-blue-400">
            <ShieldCheck size={16} />
          </div>
        </div>
      </header>

      {/* Luxury Camera Cutout */}
      <div className="relative w-full max-w-sm aspect-[4/5] rounded-[2.5rem] overflow-hidden border border-slate-800 shadow-[0_0_50px_rgba(0,184,148,0.1)]">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          className="w-full h-full object-cover grayscale-[0.3]"
          videoConstraints={{ facingMode: "environment" }}
        />
        
        {/* Scanning Animation Overlay */}
        <div className="absolute inset-0 pointer-events-none border-[30px] border-[#0d1117]/80">
          <div className="w-full h-full border border-[#00b894]/20 rounded-2xl relative overflow-hidden">
            <AnimatePresence>
              {isScanning && (
                <motion.div 
                  initial={{ top: "-10%" }}
                  animate={{ top: "110%" }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00b894] to-transparent shadow-[0_0_20px_#00b894]"
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Main CTA */}
      <button 
        onClick={executeArcScan}
        disabled={isScanning}
        className="mt-10 px-10 py-4 bg-[#00b894] hover:bg-[#55efc4] text-[#0d1117] font-bold rounded-2xl transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3 shadow-lg shadow-[#00b894]/20"
      >
        {isScanning ? (
          <span className="animate-pulse">SYNCHRONIZING...</span>
        ) : (
          <> <ScanLine size={20} /> INITIALIZE SCAN </>
        )}
      </button>

      {/* Result Modal - Slides up from bottom */}
      <AnimatePresence>
        {scanResult && (
          <motion.div 
            initial={{ y: 200 }}
            animate={{ y: 0 }}
            exit={{ y: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-[#161b22] border-t border-slate-800 p-8 rounded-t-[3rem] z-50 shadow-2xl max-w-xl mx-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold tracking-widest text-slate-500">PASSPORT METRICS</h3>
              <button onClick={() => setScanResult(null)} className="text-xs underline">DISMISS</button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <MetricBox icon={<Leaf className="text-green-400"/>} label="Carbon Footprint" value={`${scanResult.carbon} kg`} />
              <MetricBox icon={<History className="text-blue-400"/>} label="Product Age" value={scanResult.age} />
              <MetricBox icon={<MapPin className="text-red-400"/>} label="Registry Origin" value={scanResult.origin} />
              <MetricBox icon={<ShieldCheck className="text-yellow-400"/>} label="Auth Confidence" value={`${scanResult.auth}%`} />
            </div>

            <div className="mt-6 p-4 bg-[#0d1117] rounded-xl border border-slate-800 text-[10px] font-mono text-slate-500">
              ID: {Math.random().toString(36).substr(2, 9).toUpperCase()} | NODE: {deviceInfo?.model} | LOC: {location?.lat.toFixed(4)}, {location?.lng.toFixed(4)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p className="mt-4 text-red-500 text-xs font-mono">{error}</p>}
    </div>
  );
}

function MetricBox({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="bg-[#0d1117] p-4 rounded-2xl border border-slate-800 flex flex-col gap-1">
      <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-tighter">
        {icon} {label}
      </div>
      <div className="text-lg font-bold text-[#00b894]">{value}</div>
    </div>
  );
}

// Simple History icon for the box
function History({ className }: { className?: string }) {
    return <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>;
}