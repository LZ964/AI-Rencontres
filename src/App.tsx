import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { INITIAL_PROFILES, MOCK_CHATS } from './data';
import { Profile, ChatMessage, UserPreferences } from './types';
import { simulateAIMatchmaking } from './utils/aiSimulator';
import NeighborhoodMap from './components/NeighborhoodMap';
import ProfileDetails from './components/ProfileDetails';
import AIAssistant from './components/AIAssistant';
import PhotoModerator from './components/PhotoModerator';
import { Heart, Sparkles, Map, Grid, ShieldCheck, Moon, Settings, MessageSquare, Compass, Send } from 'lucide-react';

export default function App() {
  const [profiles, setProfiles] = useState<Profile[]>(INITIAL_PROFILES);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>('1');
  const [viewMode, setViewMode] = useState<'map' | 'grid'>('map');
  const [userPrompt, setUserPrompt] = useState<string>('');
  
  // Custom user preferences in French
  const [userPrefs, setUserPrefs] = useState<UserPreferences>({
    genderFocus: ['Femme', 'Homme', 'Couple'],
    minAge: 20,
    maxAge: 45,
    maxDistance: 10,
    aiPrompt: ''
  });

  // User's own simulated interests to trigger correct "Affinités communes" bubbles
  const userInterests = useMemo(() => ['Vins fins', 'Sensualité', 'Philosophie', 'Liberté d’esprit', 'Cuisine gastronomique'], []);

  // Live messages stored locally per profile id to simulate real chat
  const [chats, setChats] = useState<{ [profileId: string]: ChatMessage[] }>(() => {
    const initial: { [profileId: string]: ChatMessage[] } = {};
    Object.keys(MOCK_CHATS).forEach(id => {
      initial[id] = MOCK_CHATS[id].map((t, idx) => ({
        id: `m-${id}-${idx}`,
        senderId: id,
        text: t,
        timestamp: new Date()
      }));
    });
    return initial;
  });

  // Compute matched profiles on-the-fly based on user interaction & AI prompt
  const { matchedProfiles, aiAnalysisMessage } = useMemo(() => {
    return simulateAIMatchmaking(profiles, userPrompt, userPrefs);
  }, [profiles, userPrompt, userPrefs]);

  // Current selected profile
  const selectedProfile = useMemo(() => {
    return matchedProfiles.find(p => p.id === selectedProfileId) || matchedProfiles[0] || null;
  }, [matchedProfiles, selectedProfileId]);

  const handleSendMessage = (profileId: string, text: string) => {
    const newMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      senderId: 'user',
      text,
      timestamp: new Date()
    };

    setChats(prev => ({
      ...prev,
      [profileId]: [...(prev[profileId] || []), newMsg]
    }));

    // Trigger funny, custom AI responses based on the message content and profile name
    setTimeout(() => {
      const responseText = `Merci pour ton message ! L'algorithme Liaison AI a détecté une connexion de ${selectedProfile?.compatibilityScore}% entre nous. Dis-moi, qu'aimerais-tu explorer d'autre ?`;
      const replyMsg: ChatMessage = {
        id: `m-reply-${Date.now()}`,
        senderId: profileId,
        text: responseText,
        timestamp: new Date()
      };
      setChats(prev => ({
        ...prev,
        [profileId]: [...(prev[profileId] || []), replyMsg]
      }));
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white font-sans antialiased pb-12 relative">
      {/* Background Dots Pattern standard to Immersive UI */}
      <div className="absolute inset-0 opacity-15 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #334155 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      {/* Premium Header/Nav matching Immersive UI */}
      <nav className="sticky top-0 z-50 h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md flex items-center justify-between px-6 sm:px-8 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.5)]">
            <Heart className="w-5 h-5 text-white fill-white animate-pulse" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white uppercase">
              Liaison<span className="text-indigo-400 font-light italic ml-1">AI</span>
            </span>
            <span className="text-[9px] text-slate-500 block -mt-1 uppercase tracking-wider font-mono">
              Adult Discovery Engine
            </span>
          </div>
        </div>

        {/* Status indicator and User logo */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-full px-4 py-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]"></div>
            <span className="text-xs font-medium uppercase tracking-widest text-slate-400 italic">LIAISON Moteur: Actif</span>
          </div>
          <div className="w-10 h-10 rounded-full border border-slate-700 bg-slate-800 p-1 flex-shrink-0">
            <div className="w-full h-full rounded-full bg-gradient-to-tr from-pink-500 to-indigo-500"></div>
          </div>
        </div>
      </nav>

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* Left Interactive Column (Admin, Preferences, Moderation tests) - Col Span 4 */}
        <section className="lg:col-span-4 space-y-6">
          
          {/* Card: Live Matchmaker Assistant */}
          <AIAssistant 
            onApplyPrompt={(prompt) => setUserPrompt(prompt)} 
            currentPrompt={userPrompt} 
          />

          {/* Discovery Mode Switcher Integrated like the side options in Immersive UI */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-3 font-semibold">Modes de Découverte</h3>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                onClick={() => setViewMode('map')}
                className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl transition-all border text-xs font-medium ${
                  viewMode === 'map'
                    ? 'bg-indigo-600/15 border-indigo-550/50 text-indigo-250 shadow-[0_0_10px_rgba(99,102,241,0.2)]'
                    : 'bg-slate-950/60 border-transparent text-slate-400 hover:bg-slate-950/80 hover:text-slate-100'
                }`}
              >
                <Map className="w-4 h-4" />
                <span>Carte</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl transition-all border text-xs font-medium ${
                  viewMode === 'grid'
                    ? 'bg-indigo-600/15 border-indigo-550/50 text-indigo-250 shadow-[0_0_10px_rgba(99,102,241,0.2)]'
                    : 'bg-slate-950/60 border-transparent text-slate-400 hover:bg-slate-950/80 hover:text-slate-100'
                }`}
              >
                <Grid className="w-4 h-4" />
                <span>Mosaïque</span>
              </button>
            </div>

            {/* Simulated GPS Settings */}
            <div className="space-y-4 text-xs pt-3 border-t border-slate-800">
              <div>
                <label className="text-slate-400 block mb-1 font-mono">Ma localisation simulée :</label>
                <select className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-850 text-slate-200">
                  <option>Plateau Mont-Royal, Montréal, QC</option>
                  <option>Mile End, Montréal, QC</option>
                  <option>Vieux-Port, Montréal, QC</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400 font-mono">Rayon du Radar :</span>
                  <span className="font-bold text-indigo-400 font-mono">{userPrefs.maxDistance} km</span>
                </div>
                <input 
                  type="range" 
                  min="2" 
                  max="20" 
                  value={userPrefs.maxDistance} 
                  onChange={(e) => setUserPrefs(prev => ({ ...prev, maxDistance: Number(e.target.value) }))}
                  className="w-full accent-indigo-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <span className="text-slate-400 block mb-1.5 font-mono">Cibler :</span>
                <div className="flex flex-wrap gap-1.5">
                  {['Femme', 'Homme', 'Couple'].map((g) => {
                    const isSelected = userPrefs.genderFocus.includes(g as any);
                    return (
                      <button
                        key={g}
                        onClick={() => {
                          const next = isSelected 
                            ? userPrefs.genderFocus.filter(item => item !== g) 
                            : [...userPrefs.genderFocus, g as any];
                          setUserPrefs(prev => ({ ...prev, genderFocus: next }));
                        }}
                        className={`px-2.5 py-1 text-[11px] rounded-full border transition-all ${
                          isSelected 
                            ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 font-bold' 
                            : 'bg-slate-950/60 border-transparent text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        {g}s
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* AI Neural Status Widget from Immersive UI specs */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800">
            <h4 className="text-[10px] uppercase tracking-widest text-indigo-400 mb-3 font-bold">Statut Neural de Liaison AI</h4>
            <div className="flex justify-between items-end mb-2">
              <span className="text-xs text-slate-450 italic">Précision de l'Affinité</span>
              <span className="text-lg font-mono text-indigo-300 font-bold">98.4%</span>
            </div>
            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
              <div className="w-[98.4%] h-full bg-indigo-500 shadow-[0_0_10px_#6366f1]" style={{ width: '98.4%' }}></div>
            </div>
            <p className="text-[10px] text-slate-500 mt-4 leading-relaxed">Le système filtre actuellement un flux intense de photos par minute pour certifier notre standard sensuel.</p>
          </div>

          {/* Real-time Image automatic check device */}
          <PhotoModerator />

        </section>

        {/* Right Active Matches & Map Display Column - Col Span 8 */}
        <section className="lg:col-span-8 space-y-6">

          {/* AI recommendations header status */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 shadow-md">
            <span className="text-xs text-slate-400 flex items-center gap-1.5 leading-relaxed font-sans">
              <Sparkles className="w-4 h-4 text-indigo-500 animate-spin" />
              {aiAnalysisMessage}
            </span>
            <span className="hidden md:inline-block text-[10px] text-indigo-400 font-mono uppercase bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              {matchedProfiles.length} Recommandations IA trouvées
            </span>
          </div>

          {/* Map layout or Grid layout */}
          {viewMode === 'map' ? (
            <NeighborhoodMap 
              profiles={matchedProfiles} 
              onSelectProfile={(p) => setSelectedProfileId(p.id)} 
              selectedProfileId={selectedProfile?.id || null} 
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matchedProfiles.length === 0 ? (
                <div className="col-span-2 text-center py-12 text-slate-500 italic">
                  Aucun profil adulte ne correspond aux requêtes IA actives. Essayez de réinitialiser la recherche !
                </div>
              ) : (
                matchedProfiles.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setSelectedProfileId(p.id)}
                    className={`cursor-pointer rounded-2xl p-4 transition-all duration-300 border flex gap-4 bg-slate-900 hover:scale-[1.01] ${
                      selectedProfileId === p.id 
                        ? 'border-indigo-550 bg-indigo-950/15 shadow-lg shadow-indigo-950/10' 
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-20 h-20 rounded-xl overflow-hidden border border-slate-800 relative flex-shrink-0">
                      <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      {/* Live score indicator */}
                      <span className="absolute bottom-1 right-1 bg-indigo-600 border border-indigo-400 text-white font-extrabold text-[9px] px-1 rounded-full">
                        {p.compatibilityScore}%
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-white text-sm flex items-center gap-1">
                        {p.name}, {p.age}
                        {p.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
                      </h4>
                      <p className="text-[11px] text-indigo-400 font-mono mt-0.5">{p.gender} • {p.location.neighborhood}</p>
                      <p className="text-xs text-slate-350 mt-1 line-clamp-2 italic">
                        "{p.bio}"
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Selected match details panel */}
          {selectedProfile && (
            <ProfileDetails 
              profile={selectedProfile}
              userInterests={userInterests}
              onSendMessage={handleSendMessage}
              chatHistory={chats[selectedProfile.id] || []}
            />
          )}

          {/* Optimiser ma sélection Footer layout info bar from design specs */}
          <div className="h-20 border border-slate-800 rounded-3xl bg-slate-900/40 backdrop-blur flex items-center justify-between px-6 shrink-0 mt-6 shadow-xl">
            <div className="flex items-center gap-8">
               <div className="flex flex-col">
                 <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Pulsation IA</span>
                 <div className="flex items-center gap-1 mt-1">
                   <div className="h-4 w-1 bg-indigo-500 animate-pulse"></div>
                   <div className="h-6 w-1 bg-indigo-400"></div>
                   <div className="h-3 w-1 bg-indigo-600 animate-pulse"></div>
                   <div className="h-5 w-1 bg-indigo-500"></div>
                   <div className="h-2 w-1 bg-indigo-700"></div>
                 </div>
               </div>
               <div className="text-xs text-slate-400 italic max-w-md hidden md:block">
                 "Le système a identifié de magnifiques affinités communes à proximité immédiate."
               </div>
            </div>
            <button 
              onClick={() => {
                // Boost standard profiles slightly using simulated matchmaking optimization
                setProfiles(old => old.map(p => ({
                  ...p,
                  compatibilityScore: Math.min(99, p.compatibilityScore + 2)
                })));
              }}
              className="px-5 py-2 rounded-full bg-white text-slate-950 font-bold text-xs hover:bg-slate-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95"
            >
              Optimiser ma sélection
            </button>
          </div>

        </section>

      </main>
    </div>
  );
}
