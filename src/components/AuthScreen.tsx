import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { apiClient } from '../utils/apiClient';
import { INITIAL_PROFILES } from '../data';
import { Profile } from '../types';
import { 
  Heart, 
  ShieldAlert, 
  Sparkles, 
  Mail, 
  Lock, 
  AlertCircle, 
  Check, 
  HelpCircle, 
  MapPin, 
  ShieldCheck, 
  Terminal, 
  BookOpen, 
  Scale, 
  Cpu,
  Bookmark,
  ChevronRight,
  UserCheck
} from 'lucide-react';

interface AuthScreenProps {
  onSuccess: (user: any) => void;
}

export default function AuthScreen({ onSuccess }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Offline AI Demo states (available before logging in!)
  const [sandboxPrompt, setSandboxPrompt] = useState('Relation stable & fétiche cuir');
  const [sandboxResults, setSandboxResults] = useState<Profile[]>(() => runLocalOfflineMatching('Relation stable & fétiche cuir'));
  const [clickedResult, setClickedResult] = useState<Profile | null>(null);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showDeveloperNetworkModal, setShowDeveloperNetworkModal] = useState(false);

  // Helper local function to rank demo profiles with absolute transparency (offline)
  function runLocalOfflineMatching(query: string): Profile[] {
    const term = query.toLowerCase().trim();
    return INITIAL_PROFILES.map(p => {
      let scoreBoost = 0;
      const reasons: string[] = [];

      // Geo-distance weighting
      const geoScore = Math.max(0, 100 - p.location.distance * 15);
      reasons.push(`Proximité géographique : ${p.location.neighborhood} (${p.location.distance} km)`);

      // Keyword evaluations
      if ((term.includes('cuir') || term.includes('bdsm') || term.includes('kinky') || term.includes('fétiche') || term.includes('fetiche') || term.includes('domination') || term.includes('shibari') || term.includes('latex')) &&
          p.interests.some(i => ['domination douce', 'bdsm chic', 'cuir esthétique', 'shibari & cordes', 'fétiche latex', 'cire chaude & impact'].some(tag => i.toLowerCase().includes(tag) || tag.includes(i.toLowerCase())))) {
        scoreBoost += 35;
        reasons.push("Harmonie parfaite détectée autour des pratiques kinky/fétiches sensuelles");
      }

      if ((term.includes('stable') || term.includes('sérieux') || term.includes('serieux') || term.includes('long terme') || term.includes('amour') || term.includes('durable')) &&
          p.interests.some(i => ['romance stable', 'relation stable', 'projet de vie', 'relation durable', 'relation stable exclusive', 'amour pluriel'].some(tag => i.toLowerCase().includes(tag) || tag.includes(i.toLowerCase())))) {
        scoreBoost += 30;
        reasons.push("Aspirations profondes mutuelles pour un engagement affectif stable de long terme");
      }

      if ((term.includes('couple') || term.includes('échangiste') || term.includes('menage à trois') || term.includes('plusieurs') || term.includes('échangisme')) &&
          p.interests.some(i => ['échangisme mm', 'amour pluriel', 'puppy play'].some(tag => i.toLowerCase().includes(tag) || tag.includes(i.toLowerCase())))) {
        scoreBoost += 40;
        reasons.push("Alignement de liberté libertine et configurations relationnelles ouvertes");
      }

      if ((term.includes('vin') || term.includes('art') || term.includes('gastronomie') || term.includes('bouteille')) &&
          p.interests.some(i => ['vins de garde', 'art contemporain', 'gastronomie', 'théâtre & opéra'].some(tag => i.toLowerCase().includes(tag) || tag.includes(i.toLowerCase())))) {
        scoreBoost += 25;
        reasons.push("Affinité sur les plaisirs de l'esprit, art contemporain et grands vins fins");
      }

      const finalScore = Math.max(45, Math.min(99, Math.round((p.compatibilityScore + scoreBoost) / (scoreBoost > 0 ? 1.1 : 1.25))));
      return {
        ...p,
        compatibilityScore: finalScore,
        compatibilityReasons: reasons.slice(0, 3)
      };
    }).sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  }

  const [isSandboxAnalyzing, setIsSandboxAnalyzing] = useState(false);

  const handleSandboxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sandboxPrompt.trim()) return;
    setIsSandboxAnalyzing(true);
    setClickedResult(null);
    setTimeout(() => {
      setSandboxResults(runLocalOfflineMatching(sandboxPrompt));
      setIsSandboxAnalyzing(false);
    }, 800);
  };

  const executeSandboxPreset = (preset: string) => {
    setSandboxPrompt(preset);
    setIsSandboxAnalyzing(true);
    setClickedResult(null);
    setTimeout(() => {
      setSandboxResults(runLocalOfflineMatching(preset));
      setIsSandboxAnalyzing(false);
    }, 700);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await apiClient.login(email, password);
      onSuccess(result.user);
    } catch (err: any) {
      setError(err.message || "Une erreur s'est produite lors de l'authentification.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      const googleEmail = 'carlgodrolt@gmail.com';
      const googleName = 'Carl G.';
      const googleAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&h=300&q=80';

      const result = await apiClient.googleLogin(googleEmail, googleName, googleAvatar);
      onSuccess(result.user);
    } catch (err: any) {
      setError(err.message || "Impossible de joindre le service Google Auth.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Pride Rainbow Ribbon at the top */}
      <div className="h-1.5 w-full bg-gradient-to-r from-red-500 via-orange-500 via-yellow-400 via-green-500 via-blue-500 to-purple-600 z-50" />
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #ec4899 1px, transparent 0)', backgroundSize: '24px 24px' }} />
      <div className="absolute top-10 left-10 w-[500px] h-[500px] bg-gradient-to-tr from-pink-500/10 to-indigo-500/5 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-gradient-to-bl from-purple-500/15 to-rose-500/5 rounded-full blur-3xl pointer-events-none z-0" />

      {/* Main Container */}
      <div className="flex-grow w-full max-w-7xl mx-auto px-4 py-8 relative z-10 flex flex-col justify-center">
        
        {/* Main Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* LEFT PANEL: High Fidelity Live AI Matching Playground (Offline, available on index page) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1.5 text-[9px] font-extrabold tracking-widest uppercase bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 text-white rounded-full border border-pink-500/30 flex items-center gap-1 shadow-lg">
                  <span>🏳️‍🌈</span> ESPACE 100% GAY, BI & KINKY MASCULIN
                </span>
                <span className="px-2.5 py-1 text-[9px] font-mono tracking-widest uppercase bg-[#1e1136] text-pink-300 rounded-full border border-pink-500/15">
                  ⚡ Mode Démo Hors-Connexion
                </span>
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-black text-white tracking-tight uppercase leading-none">
                LIAISON<span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 font-extrabold font-sans">AI</span>
                <span className="text-xs uppercase font-mono tracking-widest bg-pink-600 text-white px-2 py-0.5 rounded ml-2.5 relative -top-3.5 align-middle">PROUD</span>
              </h1>
              
              <p className="text-sm lg:text-base text-slate-300 max-w-3xl leading-relaxed">
                L'unique sanctuaire et réseau de rencontre <strong className="text-pink-400">100% dédié aux hommes Gay, Bisexuels, Trans et Bi-curieux</strong> à travers le Canada. Nous unissons la liberté absolue de l'exploration fétiche et l'idéal d'une relation amoureuse sincère, durable et solide à deux.
              </p>
            </div>

            {/* Offline AI interactive search sandbox */}
            <div className="bg-[#15132d]/95 border border-pink-500/20 rounded-3xl p-6 shadow-[0_0_30px_rgba(219,39,119,0.15)] relative overflow-hidden backdrop-blur-md rainbow-glow">
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-pink-500/10">
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-pink-400 animate-pulse" />
                  <div>
                    <h3 className="text-sm font-black text-white tracking-wide uppercase flex items-center gap-1">
                      <span>🤖</span> Simulateur de Correspondance IA
                    </h3>
                    <p className="text-[10px] font-mono text-pink-300">Algorithme d'Affinité Érotique & Intellectuelle Active</p>
                  </div>
                </div>
                <span className="text-[10px] bg-slate-950 border border-pink-500/20 text-pink-400 px-2 py-0.5 rounded-md font-mono font-bold">
                  LiaisonEngine v2.5 (Offline)
                </span>
              </div>

              <p className="text-xs text-slate-300 mb-4 bg-slate-950/40 p-3 rounded-xl border border-pink-900/20 leading-relaxed">
                🌈 <span className="text-pink-400 font-bold">Exprimez-vous librement :</span> Saisissez vos désirs et configurations intimes en français naturel. L'IA analyse instantanément vos fétiches, affinités et l'alignement de vos projets pour trier l'annuaire de démonstration.
              </p>

              {/* Ready-made chips */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                <button 
                  onClick={() => executeSandboxPreset('Fétiche cuir & domination douce')} 
                  disabled={isSandboxAnalyzing}
                  className={`text-[10px] px-2.5 py-1 rounded-full transition-all border font-semibold ${sandboxPrompt === 'Fétiche cuir & domination douce' ? 'bg-pink-600/30 text-pink-300 border-pink-500/50 shadow-md' : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:border-pink-500/30'}`}
                >
                  🖤 Cuir & Domination
                </button>
                <button 
                  onClick={() => executeSandboxPreset('Relation stable et exclusive long terme')} 
                  disabled={isSandboxAnalyzing}
                  className={`text-[10px] px-2.5 py-1 rounded-full transition-all border font-semibold ${sandboxPrompt === 'Relation stable et exclusive long terme' ? 'bg-indigo-650/30 text-indigo-300 border-indigo-500/50 shadow-md' : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:border-indigo-500/30'}`}
                >
                  💍 Romance Durable
                </button>
                <button 
                  onClick={() => executeSandboxPreset('Shibari cordes & complices de vins')} 
                  disabled={isSandboxAnalyzing}
                  className={`text-[10px] px-2.5 py-1 rounded-full transition-all border font-semibold ${sandboxPrompt === 'Shibari cordes & complices de vins' ? 'bg-pink-600/30 text-pink-300 border-pink-500/50 shadow-md' : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:border-pink-500/30'}`}
                >
                  🏮 Shibari & Vins fins
                </button>
                <button 
                  onClick={() => executeSandboxPreset('Rituels romantiques et puppy play')} 
                  disabled={isSandboxAnalyzing}
                  className={`text-[10px] px-2.5 py-1 rounded-full transition-all border font-semibold ${sandboxPrompt === 'Rituels romantiques et puppy play' ? 'bg-purple-600/30 text-purple-300 border-purple-500/50 shadow-md' : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:border-purple-500/30'}`}
                >
                  🐶 Puppy Play & Douceur
                </button>
              </div>

              {/* Input section */}
              <form onSubmit={handleSandboxSubmit} className="flex gap-2 mb-4">
                <input 
                  type="text" 
                  value={sandboxPrompt}
                  disabled={isSandboxAnalyzing}
                  onChange={(e) => setSandboxPrompt(e.target.value)}
                  placeholder="Ex: Mec de 30 ans cherchant relation exclusive, complice cuir et shibari..."
                  className="flex-grow bg-slate-950 text-white pl-3.5 pr-4 py-2.5 text-xs rounded-xl border border-pink-500/20 focus:border-pink-500 focus:outline-none placeholder-slate-500"
                />
                <button 
                  type="submit" 
                  disabled={isSandboxAnalyzing}
                  className="bg-pink-600 hover:bg-pink-550 text-white text-xs font-black px-5 rounded-xl active:scale-95 transition-all shadow-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
                >
                  {isSandboxAnalyzing ? (
                    <span className="w-3.5 h-3.5 border-t-2 border-white rounded-full animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  {isSandboxAnalyzing ? "Analyse..." : "Analyser"}
                </button>
              </form>

              {/* Show matching results */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {sandboxResults.slice(0, 3).map(profile => (
                  <div 
                    key={profile.id}
                    onClick={() => setClickedResult(profile)}
                    className={`p-3 rounded-xl transition-all cursor-pointer border ${clickedResult?.id === profile.id ? 'bg-slate-850/90 border-indigo-500/60' : 'bg-slate-950/40 border-slate-850 hover:bg-slate-850/40'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-800">
                          <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white flex items-center gap-1.5">
                            {profile.name} <span className="text-[9px] px-1 bg-slate-800 border border-slate-700 text-slate-400 rounded">Profil Démo</span>
                          </p>
                          <p className="text-[10px] text-slate-450">{profile.gender} • {profile.age} ans • {profile.location.neighborhood}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-emerald-400">{profile.compatibilityScore}% Affinité</span>
                        <p className="text-[9px] text-slate-500 italic">Cliquez pour voir l'analyse</p>
                      </div>
                    </div>

                    {/* Reasons dropdown if clicked */}
                    <AnimatePresence>
                      {clickedResult?.id === profile.id && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-2.5 pt-2.5 border-t border-slate-800/60 text-[11px] text-slate-300 space-y-1.5"
                        >
                          <p className="font-mono text-[9px] uppercase tracking-wider text-indigo-400 font-bold">Rapport d'Explication de l'IA :</p>
                          <ul className="list-disc pl-4 space-y-1 text-slate-350">
                            {profile.compatibilityReasons.map((reason, rIdx) => (
                              <li key={rIdx}>{reason}</li>
                            ))}
                          </ul>
                          <p className="text-[10px] text-slate-550 border-t border-slate-800/40 pt-1">
                            <span className="font-bold text-slate-400">Enseignement technique :</span> En Angular, ce tri sémantique s'effectue via un pipe RxJS combinant `combineLatest` d'un service d'API et d'une barre de recherche.
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Secure Authentic Login Box */}
          <div className="lg:col-span-5 flex justify-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md bg-slate-900 border-2 border-indigo-500/80 ring-4 ring-indigo-500/10 rounded-3xl p-6 shadow-[0_0_40px_rgba(99,102,241,0.25)] relative overflow-hidden"
            >
              <div className="text-center mb-5">
                <div className="w-11 h-11 bg-indigo-650 rounded-full flex items-center justify-center mx-auto mb-2 shadow-[0_0_15px_rgba(79,70,229,0.4)]">
                  <Heart className="w-5 h-5 text-white fill-white animate-pulse" />
                </div>
                <h2 className="text-xl font-bold tracking-tight text-white uppercase">
                  Espace Sûr & Privé
                </h2>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Sensualité, Éthique & Consentement</p>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-rose-950/20 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Login/Sign up form */}
              <form onSubmit={handleEmailAuth} className="space-y-3.5">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[9px] text-slate-400 uppercase tracking-widest font-bold font-mono">
                      Adresse Courriel
                    </label>
                    <span className="text-[9px] text-slate-500 font-mono">Connexion immédiate</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-slate-500">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre_adresse@email.com"
                      className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-950 text-white border border-slate-800 focus:border-indigo-500 focus:outline-none placeholder-slate-650"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[9px] text-slate-400 uppercase tracking-widest font-bold font-mono">
                      Mot de passe
                    </label>
                    <span className="text-[9px] text-indigo-400/85 hover:underline cursor-pointer" onClick={() => alert("Pour la démo, saisissez n'importe quel mot de passe d'au moins 4 caractères, l'enregistrement est instantané.")}>Besoin d'aide ?</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-slate-500">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-950 text-white border border-slate-800 focus:border-indigo-500 focus:outline-none placeholder-slate-650"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-bold text-xs transition-all active:scale-95 shadow-md shadow-indigo-900/30 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <UserCheck className="w-4 h-4" />
                  {loading ? "Chiffrement et liaison..." : "Entrer dans Liaison AI"}
                </button>
              </form>

              {/* Explanation of functions */}
              <div className="mt-3.5 p-2 rounded bg-slate-950/60 border border-slate-850/80 text-[10px] text-slate-400 font-mono flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-450 flex-shrink-0 animate-ping" />
                <span><span className="font-bold text-white">Fonction :</span> Login rapide. Si l'adresse n'existe pas, un profil optimisé est généré automatiquement.</span>
              </div>

              <div className="relative flex py-3 items-center">
                <div className="flex-grow border-t border-slate-850"></div>
                <span className="flex-shrink mx-3 text-[9px] text-slate-500 uppercase font-bold tracking-wider font-mono">OU</span>
                <div className="flex-grow border-t border-slate-850"></div>
              </div>

              <button
                onClick={handleGoogleAuth}
                disabled={loading}
                type="button"
                className="w-full py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs transition-all active:scale-95 flex items-center justify-center gap-2 hover:bg-slate-100 shadow-md cursor-pointer"
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5.04c1.62 0 3.08.56 4.22 1.65l3.15-3.15C17.45 1.6 14.93 1 12 1 7.35 1 3.39 3.65 1.41 7.5l3.77 2.92c.88-2.64 3.37-4.38 6.82-4.38z" />
                  <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.45c-.28 1.47-1.11 2.72-2.36 3.56l3.66 2.84c2.14-1.98 3.38-4.89 3.38-8.55z" />
                  <path fill="#FBBC05" d="M5.18 10.42c-.22-.67-.35-1.39-.35-2.13s.13-1.46.35-2.13L1.41 3.24C.51 5.04 0 7.06 0 9.17s.51 4.13 1.41 5.93l3.77-2.92z" />
                  <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.66-2.84c-1.01.68-2.31 1.09-4.3 1.09-3.45 0-5.94-1.74-6.82-4.38L1.41 16.89C3.39 20.74 7.35 23 12 23z" />
                </svg>
                Connexion instantanée Google (Carl G.)
              </button>

              {/* Verification & Protection Links */}
              <div className="mt-5 pt-3.5 border-t border-slate-800 text-center space-y-1.5">
                <p className="text-[10px] text-slate-550">
                  En accédant à ce service d'adulte, vous jurez être majeur (+18).
                </p>
                <div className="flex justify-center gap-4 text-[10px] font-semibold text-indigo-400">
                  <button 
                    onClick={() => setShowTermsModal(true)} 
                    className="hover:text-indigo-300 underline flex items-center gap-1 cursor-pointer"
                  >
                    <Scale className="w-3 h-3" />
                    Charte Légale & +18
                  </button>

                  <button 
                    onClick={() => setShowDeveloperNetworkModal(true)} 
                    className="hover:text-indigo-300 underline flex items-center gap-1 cursor-pointer"
                  >
                    <BookOpen className="w-3 h-3" />
                    Réseau Tiers API
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>

      {/* FOOTER & ACCESSIBILITY DECREMENTS */}
      <footer className="w-full bg-slate-950 border-t border-slate-900 py-6 px-4 z-10 relative">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            <p className="font-mono">© 2026 Liaison AI Inc. Tous droits réservés. Version Démo 3.1-Beta.</p>
            <p className="mt-1">Plateforme de mise en relation sécurisée utilisant l'orchestration sémantique Gemini-3.5-Flash.</p>
          </div>
          <div className="flex gap-4">
            <span className="text-emerald-450 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              Serveur Cloud Run : Sécurisé (Chiffrement AES-GCM local)
            </span>
            <span className="text-slate-400">
              Hébergé au Canada
            </span>
          </div>
        </div>
      </footer>

      {/* MODAL 1: Terms and Conditions Modal */}
      <AnimatePresence>
        {showTermsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-xl">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#110c2e] border-2 border-indigo-500 ring-4 ring-indigo-500/15 rounded-3xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-[0_0_50px_rgba(99,102,241,0.35)] relative"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-base font-bold text-white uppercase">Termes & Conditions Générales</h3>
                </div>
                <button 
                  onClick={() => setShowTermsModal(false)}
                  className="w-7 h-7 rounded-full bg-slate-950 text-slate-400 hover:text-white flex items-center justify-center text-sm border border-slate-800"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-xs text-slate-300 leading-relaxed font-sans pr-1">
                <span className="block px-2.5 py-1.5 rounded-xl bg-orange-950/20 border border-orange-500/30 text-orange-300 text-[10px] font-mono leading-normal">
                  ⚠️ CLAUSE DE SÉCURITÉ ABSOLUE : Ce site s'adresse exclusivement à un public d'adultes majeurs (18 ans révolus). L'accès des mineurs est strictement interdit et réprimé de manière pénale en cas de falsification de profil.
                </span>

                <div className="space-y-2">
                  <h4 className="font-bold text-white text-[12px] uppercase">1. Protection des Mineurs et Personnes Vulnérables</h4>
                  <p>
                    Liaison AI applique une politique de tolérance zéro à l'égard de toute forme d'exploitation de mineurs, de harcèlement, d'obtention de matériels d'abus ou de non-consentement. Tout comportement suspect, profil se déclarant faussement majeur sera immédiatement transmis aux autorités policières et de protection de la jeunesse canadiennes (incluant le SPVM et cyberaide.ca).
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-white text-[12px] uppercase">2. Exclusion de Responsabilité Légale (Protection Auteurs/Éditeurs)</h4>
                  <p>
                    Les auteurs, développeurs et éditeurs de 'Liaison AI - Gay & Bi Discoveries' mettent à disposition cet outil algorithmique à titre purement récréatif et expérimental. Les auteurs ne sauraient être tenus responsables d'aucune mauvaise rencontre physique, d'actes frauduleux commis par des utilisateurs tiers, ou de l'exactitude de la compatibilité neuronale estimée par l'intelligence artificielle. Vous interagissez sous votre entière responsabilité d'adulte libre et éclairé.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-white text-[12px] uppercase">3. Utilisation Responsable des Espaces Fétiches (Kinky Sûr)</h4>
                  <p>
                    Les espaces d'intérêts fétiches (tels que Shibari, BDSM chic, Impact ou Latex) sont régis par les principes fondamentaux du <strong className="text-white">SSC (Sain, Sauf et Consenti)</strong> et du <strong className="text-white">RACK (Risk Aware Consensual Kink)</strong>. Liaison AI n'encourage aucun comportement blessant sans consentement préalable explicite. Les conseils prodigués par l'IA compagnon sont de simples aide-mémoires philosophiques et ne remplacent pas les règles de sécurité indispensables aux pratiques physiques.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-white text-[12px] uppercase">4. Propriété des Données et Réseau Étendu</h4>
                  <p>
                    Vos données personnelles sont stockées de façon cryptée dans notre cache local d'orchestration. Si vous choisissez de cliquer sur "Ajouter mon profil au réseau étendu", vous autorisez l'accès restreint à votre pseudonyme, bio et centres d'intérêts par des éditeurs indépendants partenaires via notre API de développement de rencontre.
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <button 
                  onClick={() => setShowTermsModal(false)}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl"
                >
                  J'ai lu et je m'engage à respecter ces termes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Extended Developer Network Explanation */}
      <AnimatePresence>
        {showDeveloperNetworkModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-xl">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#110c2e] border-2 border-indigo-500 ring-4 ring-indigo-500/15 rounded-3xl p-6 max-w-lg w-full shadow-[0_0_50px_rgba(99,102,241,0.35)] relative"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-indigo-400 animate-pulse" />
                  <h3 className="text-base font-bold text-white uppercase">Le Réseau Étendu Liaison AI</h3>
                </div>
                <button 
                  onClick={() => setShowDeveloperNetworkModal(false)}
                  className="w-7 h-7 rounded-full bg-slate-950 text-slate-400 hover:text-white flex items-center justify-center text-sm border border-slate-800"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-xs text-slate-350 leading-relaxed">
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850">
                  <p className="text-white font-bold mb-1">C'est quoi ?</p>
                  <p className="text-slate-400">
                    C'est une initiative ouverte et sécurisée qui permet à d'autres développeurs indépendants et kinky d'intégrer notre banque de profils volontaires pour tester ou peaufiner de nouvelles applications de rencontre alternatives ou spécialisées (ex. un radar de quartier uniquement Shibari).
                  </p>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850">
                  <p className="text-white font-bold mb-1">Fonction de Consentement :</p>
                  <p className="text-slate-400">
                    Votre profil ne sera <span className="text-indigo-400 font-bold">JAMAIS</span> exporté ou visible sur ces applications tierces sans votre consentement préalable explicite. Vous devez volontairement activer l'option de partage "Réseau indépendant" dans votre espace utilisateur.
                  </p>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850">
                  <p className="text-white font-bold mb-1">Pour les Développeurs :</p>
                  <p className="text-slate-400">
                    Une fois connecté, vous aurez accès à un onglet <strong className="text-white">"Espace Développeurs API"</strong> qui génère votre propre clé d'API sandbox, liste la documentation interactive, et vous permet d'exporter des profils volontaires ou d'insérer vos propres profils de test kinky !
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <button 
                  onClick={() => setShowDeveloperNetworkModal(false)}
                  className="w-full py-2 bg-indigo-650 hover:bg-slate-800 text-white font-bold text-xs rounded-xl"
                >
                  Fermer la documentation
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
