import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Profile, ChatMessage } from '../types';
import { ShieldCheck, MapPin, Sparkles, Send, MessageSquare, Zap, Heart, Check, Flame } from 'lucide-react';

interface ProfileDetailsProps {
  profile: Profile;
  userInterests: string[];
  onSendMessage: (profileId: string, message: string) => void;
  chatHistory: ChatMessage[];
}

export default function ProfileDetails({ profile, userInterests, onSendMessage, chatHistory }: ProfileDetailsProps) {
  const [typedMessage, setTypedMessage] = useState('');
  const [activeBubble, setActiveBubble] = useState<string | null>(null);

  // Calculate shared characteristics to show as blinking matching bubbles
  const sharedInterests = profile.interests.filter(interest => 
    userInterests.some(userInt => userInt.toLowerCase() === interest.toLowerCase())
  );
  
  // Remaining unique traits from this profile
  const uniqueInterests = profile.interests.filter(interest => 
    !userInterests.some(userInt => userInt.toLowerCase() === interest.toLowerCase())
  );

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;
    onSendMessage(profile.id, typedMessage.trim());
    setTypedMessage('');
  };

  return (
    <div className="bg-slate-900 border border-purple-500/10 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col h-full">
      {/* Absolute top glowing background decor representing neon/adult night layout */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Profile Header */}
      <div className="flex flex-col md:flex-row gap-6 items-start pb-6 border-b border-purple-500/10 z-10">
        <div className="relative mx-auto md:mx-0">
          <div className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-purple-500/30 shadow-lg shadow-purple-950/40">
            <img 
              src={profile.avatar} 
              alt={profile.name} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          {profile.isVerified && (
            <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-bold text-[10px] flex items-center gap-0.5 shadow-md">
              <ShieldCheck className="w-3.5 h-3.5 fill-slate-935" /> Verified
            </div>
          )}
        </div>

        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <h2 className="text-2xl font-bold font-sans tracking-tight text-white flex items-center justify-center md:justify-start gap-2">
                {profile.name}
                <span className="text-lg text-slate-400 font-medium">({profile.age})</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-500/30">
                  {profile.gender}
                </span>
              </h2>
              <p className="text-xs text-purple-300 mt-1 flex items-center justify-center md:justify-start gap-1 font-mono">
                <MapPin className="w-3.5 h-3.5 text-pink-500" />
                {profile.location.neighborhood} • à {profile.location.distance} km de vous (Plateau)
              </p>
            </div>

            <div className="flex flex-col items-center md:items-end">
              <div className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 font-extrabold text-white text-md shadow-lg shadow-pink-500/20 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-100 animate-pulse" />
                {profile.compatibilityScore}% Compatible
              </div>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold font-mono mt-1">Calibré par Liaison AI</span>
            </div>
          </div>

          <p className="text-[13px] text-slate-300 mt-3 italic leading-relaxed">
            "{profile.bio}"
          </p>

          <div className="mt-3 text-xs text-slate-400">
            <span className="font-semibold text-purple-300">Recherche :</span> {profile.seeking}
          </div>
        </div>
      </div>

      {/* Floating Affinity Bubbles Interaction Section */}
      <div className="py-4 border-b border-purple-500/10 z-10">
        <h3 className="text-xs uppercase tracking-wider font-bold text-pink-400 font-mono flex items-center gap-1">
          <Flame className="w-4 h-4 text-pink-500 animate-bounce" />
          Bulles d'affinité communes (En commun vs Singulier)
        </h3>
        <p className="text-[11px] text-slate-400 mt-1">
          Cliquez sur un intérêt en commun pour faire clignoter le signal de liaison !
        </p>

        <div className="flex flex-wrap gap-2 mt-3">
          {/* Shared Interests Pulsing Bubbles */}
          {sharedInterests.map((interest, idx) => (
            <motion.button
              key={`shared-${idx}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setActiveBubble(interest);
                setTimeout(() => setActiveBubble(null), 1200);
              }}
              className={`relative px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeBubble === interest 
                  ? 'bg-rose-500 border-rose-400 text-white shadow-[0_0_15px_rgba(244,63,94,0.6)]' 
                  : 'bg-gradient-to-r from-purple-950/80 to-pink-950/80 border border-pink-500 text-pink-200 shadow-md shadow-pink-950/20'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-pink-400 animate-ping absolute left-2 top-3" />
              <Zap className="w-3.5 h-3.5 text-pink-400" />
              {interest} (Commun)
            </motion.button>
          ))}

          {/* Unique Interests */}
          {uniqueInterests.map((interest, idx) => (
            <span
              key={`unique-${idx}`}
              className="px-3 py-1.5 rounded-full text-xs bg-slate-800/80 border border-slate-700 text-slate-300 flex items-center gap-1"
            >
              • {interest}
            </span>
          ))}
        </div>
      </div>

      {/* AI Alignment Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 border-b border-purple-500/10 z-10">
        <div>
          <h4 className="text-xs uppercase tracking-wider font-bold text-purple-300 font-mono flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            Analyse des Vecteurs IA
          </h4>
          <div className="space-y-2 mt-2">
            {[
              { name: 'Compatibilité Sensuelle & Épicurienne', val: profile.compatibilityScore },
              { name: 'Alignement du Style de Vie / Désirs', val: Math.round(profile.compatibilityScore * 0.95) },
              { name: 'Affinité Intellectuelle', val: Math.round(profile.compatibilityScore * 0.88) }
            ].map((v, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300">{v.name}</span>
                  <span className="font-bold text-purple-400 font-mono">{v.val}%</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-purple-500/5">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full transition-all duration-1000" 
                    style={{ width: `${v.val}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-wider font-bold text-purple-300 font-mono flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Rapports de Modération Automatique
          </h4>
          <div className="mt-2 bg-slate-950/60 border border-purple-500/10 p-2.5 rounded-xl flex flex-col justify-between h-[85px]">
            <div className="text-[11px] text-slate-300 flex items-start gap-1.5 leading-relaxed">
              <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1 flex-shrink-0" />
              <span>
                L'IA de modération a certifié ce profil : Photos décentes (0% de nudité brute), bio respectant la charte de Liaison AI.
              </span>
            </div>
            <div className="text-[10px] text-slate-500 flex justify-between items-center bg-slate-900 px-1.5 py-0.5 rounded border border-purple-500/5 font-mono">
              <span>Statut : Approuvé & Certifié</span>
              <span className="text-emerald-400">✔ Sécurisé</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Conversation Tab */}
      <div className="flex-1 flex flex-col pt-4 min-h-[160px] z-10">
        <h4 className="text-xs uppercase tracking-wider font-bold text-purple-300 font-mono mb-2 flex items-center gap-1">
          <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
          Messagerie Intelligente Sécurisée
        </h4>

        {/* Chat window */}
        <div className="flex-1 bg-slate-950/80 rounded-2xl border border-purple-500/10 p-3 overflow-y-auto max-h-[180px] space-y-2 flex flex-col text-xs scrollbar-thin">
          {chatHistory.length === 0 ? (
            <div className="text-center text-slate-500 italic my-auto">
              Aucun échange avec {profile.name} pour le moment. Brisez la glace !
            </div>
          ) : (
            chatHistory.map((msg, index) => {
              const isUser = msg.senderId === 'user';
              return (
                <div
                  key={msg.id || index}
                  className={`flex flex-col max-w-[85%] ${isUser ? 'self-end bg-purple-700 text-white rounded-l-xl rounded-tr-xl' : 'self-start bg-slate-800 text-slate-200 rounded-r-xl rounded-tl-xl'} p-2.5 shadow-sm border ${isUser ? 'border-purple-600' : 'border-slate-700'}`}
                >
                  <span className="font-bold text-[10px] mb-0.5 text-purple-200">
                    {isUser ? 'Vous' : profile.name}
                  </span>
                  <p>{msg.text}</p>
                </div>
              );
            })
          )}
        </div>

        {/* Input form */}
        <form onSubmit={handleSend} className="mt-2.5 flex gap-2">
          <input
            type="text"
            value={typedMessage}
            onChange={(e) => setTypedMessage(e.target.value)}
            placeholder={`Envoyez un message d'accroche ludique ou sensuel à ${profile.name}...`}
            className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-950/80 text-white border border-purple-500/20 focus:border-purple-500 focus:outline-none placeholder-slate-500"
          />
          <button
            type="submit"
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center transition-all active:scale-95 shadow-md shadow-purple-900/40"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
