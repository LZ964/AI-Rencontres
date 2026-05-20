import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Profile } from '../types';
import { MapPin, ShieldCheck, Heart, Sparkles, MessageSquare } from 'lucide-react';

interface NeighborhoodMapProps {
  profiles: Profile[];
  onSelectProfile: (profile: Profile) => void;
  selectedProfileId: string | null;
}

export default function NeighborhoodMap({ profiles, onSelectProfile, selectedProfileId }: NeighborhoodMapProps) {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [activeHoverId, setActiveHoverId] = useState<string | null>(null);

  // Center coordinates (simulated Plateau Mont-Royal / Montreal)
  const centerLat = 45.5088;
  const centerLng = -73.5878;

  // Render profiles with polar coordinates or custom offsets to map area elegantly
  return (
    <div className="relative w-full h-[550px] rounded-3xl bg-slate-950 border border-purple-500/20 overflow-hidden shadow-2xl shadow-purple-950/20">
      
      {/* Dynamic Background Grid and Ambient Stars */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(88,28,135,0.15)_0%,rgba(15,23,42,0.6)_100%)] z-0" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:30px_30px] z-0" />

      {/* Map Scanning Laser Effect (Radar Sweep) */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute inset-0 origin-center bg-[conic-gradient(from_0deg,rgba(168,85,247,0.08)_0deg,transparent_90deg,transparent_360deg)] rounded-full animate-[spin_8s_linear_infinite]" />
      </div>

      {/* Target Crosshairs / Grid Labels */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <div className="w-11/12 h-11/12 rounded-full border border-purple-500/5 flex items-center justify-center">
          <div className="w-8/12 h-8/12 rounded-full border border-purple-500/10 flex items-center justify-center">
            <div className="w-4/12 h-4/12 rounded-full border border-purple-500/15" />
          </div>
        </div>
      </div>

      <div className="absolute top-4 left-4 z-20 flex gap-2">
        <span className="px-3 py-1 text-xs font-mono font-medium rounded-full bg-purple-900/40 border border-purple-500/20 text-purple-200 backdrop-blur-md flex items-center gap-1.5 shadow-lg shadow-black/40">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          Radar IA Actif • Quartier Généralisé
        </span>
      </div>

      <div className="absolute bottom-4 right-4 z-20 flex gap-2">
        <button 
          onClick={() => setZoomLevel(prev => Math.min(2, prev + 0.25))}
          className="w-8 h-8 rounded-lg bg-slate-900/80 border border-purple-500/30 text-purple-300 hover:text-white flex items-center justify-center font-bold text-sm hover:bg-purple-950/50 backdrop-blur-md transition-all active:scale-95"
          title="Zoom +"
        >
          +
        </button>
        <button 
          onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.25))}
          className="w-8 h-8 rounded-lg bg-slate-900/80 border border-purple-500/30 text-purple-300 hover:text-white flex items-center justify-center font-bold text-sm hover:bg-purple-950/50 backdrop-blur-md transition-all active:scale-95"
          title="Zoom -"
        >
          -
        </button>
      </div>

      {/* Center user location marker */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-20 h-20 rounded-full bg-purple-500/20 animate-ping" />
          <div className="absolute w-10 h-10 rounded-full bg-purple-500/40 animate-pulse" />
          <div className="w-5 h-5 rounded-full bg-purple-500 border-2 border-slate-900 flex items-center justify-center shadow-md shadow-purple-500/50">
            <div className="w-1.5 h-1.5 rounded-full bg-white" />
          </div>
        </div>
        <span className="mt-2 px-2 py-0.5 text-[10px] uppercase tracking-wider font-mono font-bold text-purple-300 bg-slate-900/90 border border-purple-500/30 rounded backdrop-blur-md shadow-md">
          Vous (Moi)
        </span>
      </div>

      {/* Neighbors Pins on the Radar (Calculated relative positions based on lat/lng differences) */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {profiles.map((profile) => {
          // Calculate proportional offset from center point to give realistic geographic grouping
          const latDiff = (profile.location.lat - centerLat) * 3500 * zoomLevel;
          const lngDiff = (profile.location.lng - centerLng) * 3500 * zoomLevel;

          // Limit offsets to stay on screen beautifully
          const xOffset = Math.max(-230, Math.min(230, lngDiff));
          const yOffset = Math.max(-230, Math.min(230, -latDiff)); // inverted coordinates for map pixels

          const isActive = selectedProfileId === profile.id;
          const isHovered = activeHoverId === profile.id;

          return (
            <div
              key={profile.id}
              className="absolute left-1/2 top-1/2 pointer-events-auto cursor-pointer"
              style={{
                transform: `translate(calc(-50% + ${xOffset}px), calc(-50% + ${yOffset}px))`,
              }}
              onClick={() => onSelectProfile(profile)}
              onMouseEnter={() => setActiveHoverId(profile.id)}
              onMouseLeave={() => setActiveHoverId(null)}
            >
              {/* Profile Bubble on Map */}
              <div className="relative group flex items-center justify-center">
                {/* Score badge at top right */}
                <div className="absolute -top-3.5 -right-3.5 z-30 px-1.5 py-0.5 rounded-full bg-purple-600 text-[10px] font-bold text-white flex items-center gap-0.5 shadow-lg shadow-purple-900/50 border border-purple-400">
                  <Sparkles className="w-2.5 h-2.5" />
                  {profile.compatibilityScore}%
                </div>

                {/* Outer Match Glow Rings */}
                <span className={`absolute -inset-1 rounded-full opacity-60 transition-all duration-300 ${
                  isActive 
                    ? 'bg-[radial-gradient(circle_at_center,#a855f7,#ec4899)] animate-pulse shadow-[0_0_15px_rgba(236,72,153,0.8)]' 
                    : 'bg-purple-600/30 group-hover:bg-purple-500/50 group-hover:scale-110'
                }`} />

                {/* Avatar circle */}
                <div className={`w-14 h-14 rounded-full overflow-hidden border-2 relative z-20 shadow-md ${
                  isActive ? 'border-pink-500 scale-110' : 'border-purple-400/60'
                }`}>
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="w-full h-full object-cover select-none pointer-events-none"
                    referrerPolicy="no-referrer"
                  />
                  {/* Gender and custom indicator dots */}
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-slate-900 flex items-center justify-center border border-purple-400 z-30">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      profile.gender === 'Femme' ? 'bg-pink-400' :
                      profile.gender === 'Homme' ? 'bg-blue-400' : 'bg-emerald-400'
                    }`} />
                  </div>
                </div>

                {/* Label bubble */}
                <div className={`absolute -bottom-7 px-2 py-0.5 rounded-md text-[10px] font-medium whitespace-nowrap bg-slate-900/90 border border-purple-500/20 text-purple-200 backdrop-blur-sm z-20 flex items-center gap-1 shadow-md opacity-40 group-hover:opacity-100 transition-opacity ${
                  isActive ? 'opacity-100 font-bold border-pink-500/50' : ''
                }`}>
                  {profile.name}, {profile.age}
                  {profile.isVerified && <ShieldCheck className="w-3 h-3 text-emerald-400 fill-emerald-500/20" />}
                </div>

                {/* Instant preview card on element focus/hover */}
                {(isHovered || isActive) && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="absolute bottom-16 w-60 p-4 rounded-2xl bg-slate-900/95 border border-purple-500/40 text-left z-40 shadow-2xl backdrop-blur-md pointer-events-none"
                  >
                    <div className="flex justify-between items-start gap-1">
                      <div>
                        <h4 className="font-bold text-white text-sm flex items-center gap-1">
                          {profile.name}, {profile.age}
                          {profile.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
                        </h4>
                        <span className="text-xs text-purple-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-purple-500" />
                          {profile.location.neighborhood} ({profile.location.distance} km)
                        </span>
                      </div>
                      <div className="px-2 py-1 rounded bg-gradient-to-r from-purple-600 to-pink-500 text-white font-extrabold text-[11px]">
                        {profile.compatibilityScore}% Match
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 mt-2 line-clamp-2 italic">
                      "{profile.bio}"
                    </p>

                    {/* Common Interest Bubbles shown as aligned bubbles */}
                    <div className="mt-3">
                      <p className="text-[10px] uppercase tracking-wider font-semibold text-purple-400 font-mono">Affinités communes</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {profile.interests.slice(0, 3).map((interest, idx) => (
                          <span 
                            key={idx}
                            className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 font-medium"
                          >
                            ○ {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
