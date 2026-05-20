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
    <div className="bg-[#120d2d] border-2 border-indigo-500/50 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col h-full">
      {/* Absolute top glowing background decor representing neon/adult night layout */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Profile Header */}
      <div className="flex flex-col md:flex-row gap-6 items-start pb-6 border-b border-indigo-550/25 z-10">
        <div className="relative mx-auto md:mx-0">
          <div className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-indigo-400 shadow-lg shadow-indigo-950/40">
            <img 
              src={profile.avatar} 
              alt={profile.name} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          {profile.isVerified && (
            <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-bold text-[10px] flex items-center gap-0.5 shadow-md">
              <ShieldCheck className="w-3.5 h-3.5" /> Certifié
            </div>
          )}
        </div>

        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <h2 className="text-2xl font-bold font-sans tracking-tight text-white flex items-center justify-center md:justify-start gap-2">
                {profile.name}
                <span className="text-lg text-slate-400 font-medium">({profile.age})</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-950 text-indigo-300 border border-slate-800">
                  {profile.gender}
                </span>
              </h2>
              <p className="text-xs text-indigo-300 mt-1 flex items-center justify-center md:justify-start gap-1 font-mono">
                <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                {profile.location.neighborhood} • à {profile.location.distance} km de vous
              </p>
              {profile.relationshipStatus && (
                <p className="text-xs text-pink-400 mt-2 flex items-center justify-center md:justify-start gap-1.5 font-bold font-sans">
                  <span>❤️</span> Statut : {profile.relationshipStatus}
                  {profile.relationshipStatus === 'En couple' && profile.partnerName && (
                    <span className="bg-pink-950/40 text-pink-200 border border-pink-500/20 px-2 py-0.5 rounded-xl text-[10px] inline-flex items-center gap-1">
                      👨‍❤️‍👨 Lié à {profile.partnerName}
                    </span>
                  )}
                </p>
              )}
            </div>

            <div className="flex flex-col items-center md:items-end">
              <div className="px-3 py-1.5 rounded-xl bg-indigo-600 font-extrabold text-white text-md shadow-lg shadow-indigo-500/20 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-white animate-pulse" />
                {profile.compatibilityScore}% Affinité
              </div>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold font-mono mt-1">Calibré par Liaison AI</span>
            </div>
          </div>

          <p className="text-[13px] text-slate-300 mt-3 italic leading-relaxed">
            "{profile.bio}"
          </p>

          <div className="mt-3 text-xs text-slate-400">
            <span className="font-semibold text-indigo-300">Recherche :</span> {profile.seeking}
          </div>
        </div>
      </div>

      {/* Floating Affinity Bubbles Interaction Section */}
      <div className="py-4 border-b border-slate-750 z-10">
        <h3 className="text-xs uppercase tracking-wider font-bold text-indigo-400 font-mono flex items-center gap-1">
          <Flame className="w-4 h-4 text-indigo-400 animate-bounce" />
          Bulles d'affinité (En commun vs Singulier)
        </h3>
        <p className="text-[11px] text-slate-450 mt-1">
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
                  : 'bg-indigo-950/80 border border-indigo-500/40 text-indigo-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              {interest} (En commun)
            </motion.button>
          ))}

          {/* Unique Interests */}
          {uniqueInterests.map((interest, idx) => (
            <span
              key={`unique-${idx}`}
              className="px-3 py-1.5 rounded-full text-xs bg-slate-950 border border-slate-850 text-slate-400 flex items-center gap-1"
            >
              • {interest}
            </span>
          ))}
        </div>
      </div>

      {/* AI Alignment Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 border-b border-slate-750 z-10">
        <div>
          <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400 font-mono flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Vecteurs d'Affinité IA
          </h4>
          <div className="space-y-2 mt-2">
            {[
              { name: 'Compatibilité Sensuelle & Épicurienne', val: profile.compatibilityScore },
              { name: 'Alignement du Style de Vie / Désirs', val: Math.round(profile.compatibilityScore * 0.95) },
              { name: 'Affinité Intellectuelle', val: Math.round(profile.compatibilityScore * 0.88) }
            ].map((v, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">{v.name}</span>
                  <span className="font-bold text-indigo-300 font-mono">{v.val}%</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-850">
                  <div 
                    className="bg-indigo-500 h-1.5 rounded-full transition-all duration-1000 shadow-[0_0_8px_#6366f1]" 
                    style={{ width: `${v.val}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-wider font-bold text-slate-450 font-mono flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Sécurité & Modération
          </h4>
          <div className="mt-2 bg-slate-950/60 border border-slate-850 p-2.5 rounded-xl flex flex-col justify-between h-[85px]">
            <div className="text-[11px] text-slate-300 flex items-start gap-1.5 leading-relaxed">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 flex-shrink-0" />
              <span>
                Photos décentes certifiées conformes par Liaison AI. Écrits en adéquation avec nos conditions de consentement d'adultes avisés.
              </span>
            </div>
            <div className="text-[10px] text-slate-500 flex justify-between items-center bg-slate-900 px-1.5 py-0.5 rounded border border-slate-850 font-mono">
              <span>Statut : Approuvé & Certifié</span>
              <span className="text-emerald-400 font-semibold">✔ Sécurisé</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Conversation Tab */}
      <div className="flex-1 flex flex-col pt-4 min-h-[160px] z-10">
        <h4 className="text-xs uppercase tracking-wider font-bold text-indigo-400 font-mono mb-2 flex items-center gap-1">
          <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
          Messagerie Chiffrée
        </h4>

        {/* Chat window */}
        <div className="flex-1 bg-slate-950/80 rounded-2xl border border-slate-850 p-3 overflow-y-auto max-h-[180px] space-y-2 flex flex-col text-xs scrollbar-thin">
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
                  className={`flex flex-col max-w-[85%] ${isUser ? 'self-end bg-indigo-600 text-white rounded-l-xl rounded-tr-xl' : 'self-start bg-slate-805 text-slate-200 rounded-r-xl rounded-tl-xl'} p-2.5 shadow-sm border ${isUser ? 'border-indigo-600' : 'border-slate-800'}`}
                >
                  <span className="font-bold text-[9px] mb-0.5 text-indigo-200 uppercase tracking-wider">
                    {isUser ? 'Vous' : profile.name}
                  </span>
                  <p className="leading-relaxed">{msg.text}</p>
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
            placeholder={`Écrivez un message d'accroche direct à ${profile.name}...`}
            className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-950/80 text-white border border-slate-850 focus:border-indigo-500 focus:outline-none placeholder-slate-600"
          />
          <button
            type="submit"
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-all active:scale-95 shadow-md shadow-indigo-900/40"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
