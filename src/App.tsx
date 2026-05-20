import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Profile, ChatMessage, UserPreferences } from './types';
import { apiClient } from './utils/apiClient';
import AuthScreen from './components/AuthScreen';
import WizardModal from './components/WizardModal';
import MobileInstallModal from './components/MobileInstallModal';
import NeighborhoodMap from './components/NeighborhoodMap';
import ProfileDetails from './components/ProfileDetails';
import AIAssistant from './components/AIAssistant';
import PhotoModerator from './components/PhotoModerator';
import SupportCenter from './components/SupportCenter';
import EmployeePortal from './components/EmployeePortal';
import { 
  Heart, 
  Sparkles, 
  Map, 
  Grid, 
  ShieldCheck, 
  LogOut, 
  Check, 
  AlertCircle, 
  Code, 
  Copy, 
  Share2, 
  HelpCircle, 
  Volume2, 
  Send, 
  Info,
  Layers,
  ChevronRight,
  Database,
  Terminal,
  Activity,
  Maximize2,
  LifeBuoy
} from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'grid'>('map');
  const [userPrompt, setUserPrompt] = useState<string>('');
  const [aiAnalysisMessage, setAiAnalysisMessage] = useState<string>("Chargement du radar Liaison AI...");
  const [errorString, setErrorString] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Spontaneous AI Advisor chat states
  const [advisorVisible, setAdvisorVisible] = useState(false);
  const [currentAdviceIndex, setCurrentAdviceIndex] = useState(0);

  // Floating AI assistant widget states
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantMode, setAssistantMode] = useState<'textual' | 'live'>('textual');
  const [assistantInput, setAssistantInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [floatingAssistantMessages, setFloatingAssistantMessages] = useState<{sender: 'user'|'ai', text: string}[]>([
    { sender: 'ai', text: "Bonjour ! Saisissez ou parlez à voix haute pour m'ordonner une recherche tactile. Ex: 'Trouve des profils cuir fétiche à moins de 5 km'." }
  ]);

  // Dev API Sandbox states
  const [activeTab, setActiveTab] = useState<'radar' | 'moderation' | 'developer'>('radar');
  const [developerSectionOpen, setDeveloperSectionOpen] = useState(false);
  const [apiKeyCopied, setApiKeyCopied] = useState(false);
  const [showNetworkInfoPopup, setShowNetworkInfoPopup] = useState(false);

  // Embedded Support and Employee Intranet states
  const [showSupport, setShowSupport] = useState(false);
  const [showEmployeePortal, setShowEmployeePortal] = useState(false);
  const [sandboxApiKeyInput, setSandboxApiKeyInput] = useState('liaison-partner-key-2026');
  const [sandboxQueryResponse, setSandboxQueryResponse] = useState<any>(null);
  const [sandboxRunning, setSandboxRunning] = useState(false);

  // Developer Workspace Advanced States
  const [developerStatus, setDeveloperStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>('none');
  const [developerInfo, setDeveloperInfo] = useState<any>(null);
  const [developerKeys, setDeveloperKeys] = useState<any[]>([]);
  const [devReqName, setDevReqName] = useState('');
  const [devReqWebsite, setDevReqWebsite] = useState('');
  const [devReqUseCase, setDevReqUseCase] = useState('');
  const [newKeyWebsiteUrl, setNewKeyWebsiteUrl] = useState('');
  const [newKeyPerms, setNewKeyPerms] = useState({
    readProfiles: true,
    suggestMatches: true,
    createProfiles: false
  });

  // Active user network opt-in status from DB
  const [userOptedIn, setUserOptedIn] = useState(false);

  // Custom user preferences in French
  const [userPrefs, setUserPrefs] = useState<UserPreferences>({
    genderFocus: ['Gay', 'Bisexuel', 'Bi-curieux', 'Couple MM'],
    minAge: 18,
    maxAge: 55,
    maxDistance: 12,
    aiPrompt: ''
  });

  // User's own interests parsed from logged user
  const userInterests = useMemo(() => {
    return user?.interests || ['Sensualité', 'Shibari & Cordes', 'Vins fins', 'Art contemporain', 'Romance stable'];
  }, [user]);

  // Spontaneous advice pool
  const AI_ADVICES = useMemo(() => [
    { title: "🔗 Éthique Shibari", msg: "En Shibari, le dialogue est d'or. Convenez toujours de signaux d'arrêt clairs avant de restreindre les mouvements de votre partenaire." },
    { title: "💍 Matchs durables", msg: "N'hésitez pas à valoriser vos passions intellectuelles (l'art ou la philo). Dans notre communauté Gay/Bi, l'esprit est le plus sensuel des aphrodisiaques." },
    { title: "🔒 Modération stricte", msg: "Tous les visages sont validés par notre équipe. Si vous suspectez un faux profil ou un mineur, utilisez le signalement accéléré." },
    { title: "🖤 Consentement d'abord", msg: "Les pratiques BDSM s'articulent autour du SSC : Sain, Sauf et Consenti. Ne présumez jamais des limites d'autrui lors des premiers tchats." },
    { title: "📸 Clarté esthétique", msg: "Une photo de profil soignée, un peu sombre, augmente votre taux d'affinité IA évalué par Gemini de près de 22%." },
    { title: "⚖️ Protection de chacun", msg: "N'échangez jamais de coordonnées bancaires. Signalez immédiatement les comportements d'intrusion financière." },
    { title: "🎯 Position exacte", msg: "Notre radar de quartier masque votre position géographique exacte de (0 à 2 km) pour préserver votre totale intimité à domicile." },
  ], []);

  // Live message store fetched and pushed to database API
  const [chats, setChats] = useState<{ [profileId: string]: ChatMessage[] }>({});

  // Profile creation wizard & editing states
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isWizardEditMode, setIsWizardEditMode] = useState(false);
  const [isMobileInstallOpen, setIsMobileInstallOpen] = useState(false);

  // Auto-run wizard if newly logged-in user hasn't configured their profile yet
  useEffect(() => {
    if (user && !user.hasCompletedWizard) {
      setIsWizardEditMode(false);
      setIsWizardOpen(true);
    }
  }, [user]);

  const handleSaveProfile = async (updatedData: any) => {
    try {
      const token = localStorage.getItem('liaison_ai_token');
      const res = await fetch('/api/auth/user/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedData)
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setIsWizardOpen(false);
        // Instant reload of profiles directory with fresh user configuration
        loadProfiles();
        return true;
      } else {
        alert(data.error || "Impossible d'enregistrer vos paramètres de profil.");
        return false;
      }
    } catch (err) {
      console.error(err);
      alert("Erreur de connexion.");
      return false;
    }
  };

  // Check auth credentials from token on start up
  useEffect(() => {
    const token = localStorage.getItem('liaison_ai_token');
    if (token) {
      fetch('/api/auth/user', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error("Invalid token");
      })
      .then(data => {
        if (data && data.user) {
          setUser(data.user);
          setUserOptedIn(data.user.extendedNetworkOptIn || false);
        } else {
          throw new Error("Invalid user data");
        }
      })
      .catch(() => {
        apiClient.logout();
        setUser(null);
      });
    }
  }, []);

  const loadDeveloperData = async () => {
    const t = localStorage.getItem('liaison_ai_token');
    if (!t) return;
    try {
      // 1. Fetch status
      const resStatus = await fetch('/api/developer/status', {
        headers: { 'Authorization': `Bearer ${t}` }
      });
      if (resStatus.ok) {
        const statusData = await resStatus.json();
        setDeveloperStatus(statusData.status);
        setDeveloperInfo(statusData.approval);
      }
      
      // 2. Fetch keys list
      const resKeys = await fetch('/api/developer/keys', {
        headers: { 'Authorization': `Bearer ${t}` }
      });
      if (resKeys.ok) {
        const keysData = await resKeys.json();
        setDeveloperKeys(keysData.keys || []);
      }
    } catch (err) {
      console.error("Erreur de r\u00e9cup\u00e9ration des donn\u00e9es d\u00e9veloppeur:", err);
    }
  };

  useEffect(() => {
    if (user) {
      loadDeveloperData();
    }
  }, [user, activeTab]);

  const handleRequestDeveloperApproval = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = localStorage.getItem('liaison_ai_token');
    if (!t) return;
    try {
      const res = await fetch('/api/developer/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${t}`
        },
        body: JSON.stringify({
          developerName: devReqName,
          websiteUrl: devReqWebsite,
          useCase: devReqUseCase
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert("Votre demande d'approbation a \u00e9t\u00e9 soumise au support technique avec succ\u00e8s ! Il sera trait\u00e9 en temps r\u00e9el.");
        loadDeveloperData();
      } else {
        alert(data.error || "Impossible de soumettre la demande.");
      }
    } catch (err) {
      alert("Erreur de connexion.");
    }
  };

  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = localStorage.getItem('liaison_ai_token');
    if (!t) return;
    if (!newKeyWebsiteUrl.trim()) return;
    try {
      const assignedPermissions = [];
      if (newKeyPerms.readProfiles) assignedPermissions.push('read_profiles');
      if (newKeyPerms.suggestMatches) assignedPermissions.push('suggest_matches');
      if (newKeyPerms.createProfiles) assignedPermissions.push('create_profiles');

      const res = await fetch('/api/developer/keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${t}`
        },
        body: JSON.stringify({
          targetWebsiteUrl: newKeyWebsiteUrl.trim(),
          assignedPermissions
        })
      });
      const data = await res.json();
      if (res.ok) {
        setNewKeyWebsiteUrl('');
        loadDeveloperData();
        alert("Cl\u00e9 API g\u00e9n\u00e9r\u00e9e avec succ\u00e8s ! Gardez-la secr\u00e8te.");
      } else {
        alert(data.error || "Impossible de g\u00e9n\u00e9rer la cl\u00e9.");
      }
    } catch (err) {
      alert("Erreur de connexion.");
    }
  };

  const handleRevokeApiKey = async (apiKey: string) => {
    if (!confirm("Voulez-vous vraiment r\u00e9voquer d\u00e9finitivement cette cl\u00e9 API ? Tout trafic tiers utilisant cette cl\u00e9 sera imm\u00e9diatement bloqu\u00e9.")) {
      return;
    }
    const t = localStorage.getItem('liaison_ai_token');
    if (!t) return;
    try {
      const res = await fetch('/api/developer/keys', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${t}`
        },
        body: JSON.stringify({ apiKey })
      });
      if (res.ok) {
        loadDeveloperData();
      } else {
        const data = await res.json();
        alert(data.error || "Impossible de r\u00e9voquer la cl\u00e9.");
      }
    } catch (err) {
      alert("Erreur de connexion.");
    }
  };

  // Periodic advisor popup trigger (Triggered spontaneously every 24 seconds)
  useEffect(() => {
    if (!user) return;
    
    // First trigger after 10s, then repeat
    const initialTimer = setTimeout(() => {
      setAdvisorVisible(true);
      setCurrentAdviceIndex(Math.floor(Math.random() * AI_ADVICES.length));
    }, 12000);

    const interval = setInterval(() => {
      setAdvisorVisible(true);
      setCurrentAdviceIndex((prev) => (prev + 1) % AI_ADVICES.length);
    }, 28000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [user, AI_ADVICES]);

  // Fetch updated profiles lists based on current layout queries and semantic tags
  const loadProfiles = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setErrorString(null);
    try {
      const data = await apiClient.getProfiles(
        userPrompt,
        userPrefs.genderFocus,
        userPrefs.maxDistance
      );
      setProfiles(data.matchedProfiles);
      setAiAnalysisMessage(data.aiAnalysisMessage);
      
      if (data.matchedProfiles.length > 0) {
        setSelectedProfileId(prev => {
          const exists = data.matchedProfiles.some((p: Profile) => p.id === prev);
          return exists ? prev : data.matchedProfiles[0].id;
        });
      } else {
        setSelectedProfileId(null);
      }
    } catch (err: any) {
      setErrorString(err.message || "Erreur de communication avec le serveur de matchmaking Liaison AI.");
    } finally {
      setLoading(false);
    }
  }, [user, userPrompt, userPrefs.genderFocus, userPrefs.maxDistance]);

  // Trigger profile updates on filters or prompt events
  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  // Fetch or update specific chat history when selected profile changes
  useEffect(() => {
    if (!user || !selectedProfileId) return;

    let active = true;
    apiClient.getMessages(selectedProfileId)
      .then(msgs => {
        if (active) {
          setChats(prev => ({ ...prev, [selectedProfileId]: msgs }));
        }
      })
      .catch(err => {
        console.error("Impossible d'obtenir la discussion:", err);
      });

    return () => {
      active = false;
    };
  }, [user, selectedProfileId]);

  // Sending chat messages through express automated gateway
  const handleSendMessage = async (profileId: string, text: string) => {
    if (!profileId || !text.trim()) return;

    const userMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      senderId: 'user',
      text: text.trim(),
      timestamp: new Date()
    };

    setChats(prev => ({
      ...prev,
      [profileId]: [...(prev[profileId] || []), userMsg]
    }));

    try {
      const data = await apiClient.sendMessage(profileId, text.trim());
      setChats(prev => ({
        ...prev,
        [profileId]: data.messages
      }));
    } catch (err: any) {
      setErrorString(err.message || "Impossible de relayer votre message.");
    }
  };

  // Toggle Network integration with database backend
  const handleToggleNetworkOptIn = async (enabled: boolean) => {
    try {
      const token = localStorage.getItem('liaison_ai_token');
      const res = await fetch('/api/auth/user/update-extended-network', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ enabled })
      });
      const data = await res.json();
      if (res.ok) {
        setUserOptedIn(enabled);
        setUser(prev => ({ ...prev, extendedNetworkOptIn: enabled }));
      } else {
        alert(data.error || "Impossible de modifier vos préférences indépendantes.");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur de connexion.");
    }
  };

  // Run a real demo test of developer API
  const runDeveloperApiTest = async (type: 'get' | 'suggest' | 'mockPost') => {
    setSandboxRunning(true);
    setSandboxQueryResponse(null);
    try {
      if (type === 'get') {
        const res = await fetch('/api/v1/external/profiles', {
          headers: { 'X-API-Key': sandboxApiKeyInput }
        });
        const data = await res.json();
        setSandboxQueryResponse(data);
      } else if (type === 'suggest') {
        const res = await fetch('/api/v1/external/suggestions', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-API-Key': sandboxApiKeyInput 
          },
          body: JSON.stringify({
            userInterests: ["Shibari & Cordes", "Vins de garde", "Romance stable"],
            userPrompt: "Je cherche de l'érotisme de classe en français"
          })
        });
        const data = await res.json();
        setSandboxQueryResponse(data);
      } else {
        const res = await fetch('/api/v1/external/profiles', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-API-Key': sandboxApiKeyInput 
          },
          body: JSON.stringify({
            name: "Maxime (Profil Externe Sandbox)",
            age: 26,
            gender: "Bisexuel",
            bio: "Adepte de latex contemporain et amoureux fou de théâtre d'avant-garde. Exploration d'un compagnon.",
            interests: ["Fétiche Latex", "Théâtre & Opéra", "Romance stable"],
            seeking: "Un mec libre d'esprit pour projet de vie solide.",
            lat: 45.518,
            lng: -73.575,
            neighborhood: "Plateau Mont-Royal"
          })
        });
        const data = await res.json();
        setSandboxQueryResponse(data);
        // Refresh profiles to see the injected external profile immediately
        loadProfiles();
      }
    } catch (err: any) {
      setSandboxQueryResponse({ error: "Erreur HTTP lors du tchat de développement.", message: err.message });
    } finally {
      setSandboxRunning(false);
    }
  };

  // Process floating verbal prompt command routing
  const handleFloatingAssistantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assistantInput.trim()) return;
    executeAssistantAction(assistantInput.trim());
    setAssistantInput('');
  };

  const executeAssistantAction = (command: string) => {
    // Add user message to assistant log
    setFloatingAssistantMessages(prev => [...prev, { sender: 'user', text: command }]);

    const query = command.toLowerCase();
    let aiResponse = "J'ai bien compris votre requête vocale naturelle. ";

    if (query.includes('couple') || query.includes('couples')) {
      setUserPrefs(prev => ({ ...prev, genderFocus: ['Couple MM'] }));
      aiResponse += "J'ai configuré le radar de mise en relation pour cibler uniquement les couples MM.";
    } else if (query.includes('gay') || query.includes('hommes gay')) {
      setUserPrefs(prev => ({ ...prev, genderFocus: ['Gay'] }));
      aiResponse += "J'ai ciblé vos résultats sur les hommes qui s'identifient ouvertement comme Gay.";
    } else if (query.includes('bisexuel') || query.includes('bi-curieux')) {
      setUserPrefs(prev => ({ ...prev, genderFocus: ['Bisexuel', 'Bi-curieux'] }));
      aiResponse += "J'ai élargi le filtre aux profils d'hommes Bisexuels et Bi-curieux.";
    } else if (query.includes('distance') || query.includes('km') || query.includes('rayon')) {
      setUserPrefs(prev => ({ ...prev, maxDistance: 5 }));
      aiResponse += "J'ai réduit le rayon de ciblage géographique à moins de 5 kilomètres pour maximiser votre proximité.";
    }

    // Set search prompt of main block
    setUserPrompt(command);

    setFloatingAssistantMessages(prev => [...prev, { 
      sender: 'ai', 
      text: aiResponse + ` L'algorithme Liaison AI a été recalculé pour correspondre à : "${command}".` 
    }]);
  };

  const simulateSpeechRecognition = () => {
    setIsListening(true);
    const commands = [
      "Trouve des profils cuir fétiche à moins de 5 km",
      "Cible uniquement le couple MM Alexandre & Kevin",
      "Je cherche relation stable avec shibari",
      "Montre-moi des profils de bisexuels"
    ];
    const picked = commands[Math.floor(Math.random() * commands.length)];
    
    setTimeout(() => {
      setIsListening(false);
      executeAssistantAction(picked);
    }, 1800);
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText('liaison-partner-key-2026');
    setApiKeyCopied(true);
    setTimeout(() => setApiKeyCopied(false), 2000);
  };

  const handleLogout = () => {
    apiClient.logout();
    setUser(null);
    setProfiles([]);
    setSelectedProfileId(null);
  };

  const selectedProfile = useMemo(() => {
    return profiles.find(p => p.id === selectedProfileId) || profiles[0] || null;
  }, [profiles, selectedProfileId]);

  if (!user) {
    return <AuthScreen onSuccess={(u) => setUser(u)} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white font-sans antialiased pb-20 relative">
      {/* GLOBAL TOP PROMOTION BANNER FOR FREE BETA 35 WITH REAL-TIME GROWING USER METRIC */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border-b border-indigo-500/20 py-2.5 px-4 text-center text-xs text-indigo-200 font-mono shadow-sm flex items-center justify-center gap-2 flex-wrap relative z-50">
        <span className="inline-flex items-center gap-1 bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full text-[10px] border border-indigo-400/25 font-bold animate-pulse">⚠️ VERSION BÊTA 35</span>
        <span className="font-sans">Accès 100% gratuit pour un temps limité. Notre réseau libertin s'agrandit chaque jour • <strong className="text-white font-mono">{1240 + Math.floor((Date.now() - 1774000000000) / 32000)}</strong> membres actifs connectés</span>
      </div>

      {/* Background Dots Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #4f46e5 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      {/* Nav bar Header */}
      <nav className="sticky top-0 z-40 h-16 border-b border-pink-500/15 bg-[#0e0921]/90 backdrop-blur-md flex items-center justify-between px-6 shrink-0 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-tr from-pink-500 to-indigo-600 rounded-full flex items-center justify-center shadow-[0_0_12px_rgba(236,72,153,0.5)]">
            <Heart className="w-5 h-5 text-white fill-white animate-pulse" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-white uppercase flex items-center gap-1.5">
              Liaison<span className="text-pink-400 font-extrabold italic">AI</span>
              <span className="text-[9px] bg-pink-950 border border-pink-500/25 text-pink-300 font-mono px-1.5 py-0.5 rounded leading-none font-bold">🏳️‍🌈 Site 100% Gay</span>
            </span>
            <span className="text-[9px] text-pink-450 block -mt-1 uppercase tracking-widest font-mono font-bold">
              Gay, Bi & Queer Sensual Matcher
            </span>
          </div>
        </div>

        {/* Global explanation tool header */}
        <div className="hidden lg:flex items-center gap-3 text-xs bg-slate-900/50 border border-slate-850 rounded-full px-5 py-1.5 max-w-md">
          <Info className="w-4 h-4 text-pink-400 shrink-0" />
          <span className="text-[10px] text-slate-350 leading-normal font-mono">
            <span className="font-bold text-white">Liaison sécurisée :</span> Vos données & pratiques kinky sont isolées localement sur ce navigateur.
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setShowSupport(prev => !prev);
              setShowEmployeePortal(false);
            }}
            className={`p-1.5 px-3 rounded-xl border transition-all text-xs flex items-center gap-1.5 font-bold cursor-pointer ${
              showSupport 
                ? 'bg-rose-650 border-rose-400 text-white shadow font-extrabold' 
                : 'border-slate-850 bg-slate-900 hover:bg-slate-950 text-slate-300'
            }`}
          >
            <LifeBuoy className="w-3.5 h-3.5 text-pink-400 animate-spin" style={{ animationDuration: '8s' }} />
            <span>Assistance Tech</span>
          </button>

          <button 
            onClick={() => {
              setIsWizardEditMode(true);
              setIsWizardOpen(true);
            }}
            id="open-profile-wizard-btn"
            className="p-1.5 px-2.5 rounded-xl border border-pink-500/25 bg-[#22102f] hover:bg-[#341646] text-pink-300 hover:text-white transition-all text-xs flex items-center gap-1.5 font-bold cursor-pointer"
            title="Modifier mes désirs, intérêts ou partenaire de couple"
          >
            <span>⚙️</span>
            <span>Mon Profil</span>
          </button>

          <div className="flex items-center gap-2 border border-slate-850 rounded-xl bg-slate-900 px-3 py-1.5">
            <img src={user.avatar} alt={user.name} className="w-5 h-5 rounded-full object-cover border border-slate-800" />
            <span className="text-xs font-bold text-slate-200">{user.name}</span>
          </div>
          
          <button 
            onClick={handleLogout}
            className="p-1.5 px-3 rounded-xl border border-slate-850 bg-slate-900 hover:bg-slate-950 text-slate-400 hover:text-white transition-all text-xs flex items-center gap-1 font-semibold"
            title="Se déconnecter"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Quitter</span>
          </button>
        </div>
      </nav>

      {/* Interactive Workspace Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="bg-slate-900/80 border border-slate-850 p-2.5 rounded-3xl flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center shadow-lg relative z-20">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setActiveTab('radar');
                setShowSupport(false);
                setShowEmployeePortal(false);
              }}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'radar' && !showSupport && !showEmployeePortal
                  ? 'bg-indigo-600 text-white shadow shadow-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-950/50'
              }`}
            >
              <Map className="w-4 h-4" />
              <span>📡 Radar & Rencontres Sémantiques</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('moderation');
                setShowSupport(false);
                setShowEmployeePortal(false);
              }}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'moderation' && !showSupport && !showEmployeePortal
                  ? 'bg-indigo-600 text-white shadow shadow-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-950/50'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>🛡️ Modérateur & Sécurité d'Images</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('developer');
                setShowSupport(false);
                setShowEmployeePortal(false);
              }}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'developer' && !showSupport && !showEmployeePortal
                  ? 'bg-indigo-600 text-white shadow shadow-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-950/50'
              }`}
            >
              <Code className="w-4 h-4" />
              <span>💻 Console API Sandbox & Code</span>
            </button>
          </div>

          <div className="text-[10px] font-mono text-indigo-300 md:text-right px-3 py-1.5 bg-slate-950/70 rounded-xl border border-slate-800">
            📍 Vue active : {activeTab === 'radar' ? "Radar & Rencontre" : activeTab === 'moderation' ? "Photos & Protection" : "Réseau Tiers"}
          </div>
        </div>
      </div>

      {/* Collapsible Employee Portal Dashboard */}
      {showEmployeePortal && (
        <div id="employee-portal-view-container" className="max-w-7xl mx-auto px-4 mt-6">
          <EmployeePortal onClose={() => setShowEmployeePortal(false)} />
        </div>
      )}

      {/* Collapsible User Support Technical Tickets Center */}
      {showSupport && (
        <div id="user-support-view-container" className="max-w-3xl mx-auto px-4 mt-6">
          <SupportCenter onClose={() => setShowSupport(false)} />
        </div>
      )}

      {/* Main layout Grid container */}
      <main className="max-w-7xl mx-auto px-4 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* LEFT COMPACT MANAGEMENT TOOLS (4 cols on desktop, ordered second) */}
        <section className="order-last lg:order-last lg:col-span-4 space-y-6">
          {activeTab === 'developer' ? (
            // DEVELOPER SIDEBAR INFO PANEL
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-850 space-y-4">
              <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2.5">
                <Terminal className="w-4 h-4 text-indigo-400" />
                <h4 className="text-[10px] uppercase font-bold tracking-wider text-slate-300 font-mono">Documentation API tiers</h4>
              </div>
              
              <div className="space-y-3.5 text-xs text-slate-400 leading-relaxed font-sans">
                <p>
                  L'API tiers de <strong className="text-white">Liaison AI</strong> fournit un accès bidirectionnel cryptographiquement sécurisé aux profils consentants du réseau étendu.
                </p>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-850/60 leading-normal space-y-1 font-mono text-[10px] text-slate-300">
                  <strong className="text-slate-400 block uppercase text-[8.5px] font-sans">Headers requis :</strong>
                  <p className="text-red-400">X-API-Key: &lt;votre-clé-générée&gt;</p>
                  <p className="text-indigo-400 font-mono">Origin: &lt;votre-site-web-enregistré&gt;</p>
                </div>

                <div className="space-y-2 font-mono text-[10px]">
                  <span className="text-slate-400 block font-bold uppercase text-[8.5px] font-sans">Points d'entrée REST :</span>
                  
                  <div className="border border-slate-850 bg-slate-950 p-2 text-xs rounded-xl space-y-1">
                    <span className="text-emerald-400 font-bold block">GET /api/v1/external/profiles</span>
                    <p className="text-slate-500 text-[10px] font-sans">Lit l'annuaire des profils actifs.</p>
                  </div>

                  <div className="border border-slate-850 bg-slate-950 p-2 text-xs rounded-xl space-y-1">
                    <span className="text-purple-400 font-bold block">POST /api/v1/external/suggestions</span>
                    <p className="text-slate-500 text-[10px] font-sans">Calculateur de matchmaking direct.</p>
                  </div>

                  <div className="border border-slate-850 bg-slate-950 p-2 text-xs rounded-xl space-y-1">
                    <span className="text-sky-400 font-bold block">POST /api/v1/external/profiles</span>
                    <p className="text-slate-500 text-[10px] font-sans">Injecteur de profil sandbox.</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 text-[9.5px] text-slate-500 leading-normal font-sans">
                  ⚠️ <strong className="text-slate-400">Filtre d'Origin strict :</strong> Votre serveur d'appel doit envoyer l'Origin d'appel exact enregistré sur la clé. Tout écart retourne une erreur de sécurité (HTTP 403) pour prévenir les vols d'identité.
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* COMPACT GORGEOUS USER PROFILE BADGE CARD (Allow editing anywhere) */}
              <div className="bg-gradient-to-br from-pink-950/20 via-slate-900 to-indigo-950/30 border border-pink-500/25 rounded-3xl p-5 shadow-xl relative overflow-hidden backdrop-blur-md mb-6">
                <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center gap-3.5">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-pink-500 shadow-md">
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-black text-white">{user.name}</span>
                      <span className="text-[8px] bg-pink-600 text-white font-mono px-1 py-0.2 rounded font-black uppercase tracking-wider">Vous</span>
                    </div>
                    <p className="text-[10px] text-pink-300 font-mono">
                      ♂️ {user.gender} • {user.age || '—'} ans
                    </p>
                    <p className="text-[9.5px] text-slate-400 font-mono tracking-tight leading-none pt-0.5">
                      ❤️ {user.relationshipStatus || 'Célibataire'}
                      {user.relationshipStatus === 'En couple' && user.partnerName && (
                        <span className="text-pink-400 font-semibold block sm:inline sm:ml-1">
                          avec {user.partnerName}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="mt-3.5 pt-3.5 border-t border-slate-800/80 flex gap-2">
                  <button
                    onClick={() => {
                      setIsWizardEditMode(true);
                      setIsWizardOpen(true);
                    }}
                    id="btn-edit-my-profile"
                    className="w-full bg-slate-950/80 hover:bg-pink-600/20 text-pink-300 hover:text-white border border-pink-500/20 hover:border-pink-500/40 font-bold py-2.5 px-3 rounded-2xl transition-all font-mono text-[9.5px] uppercase text-center cursor-pointer select-none"
                  >
                    ⚙️ Éditer mon profil
                  </button>
                </div>
              </div>

              {/* Card 1: Recommander Matchmaker AI */}
          <div className="relative">
            <AIAssistant 
              onApplyPrompt={(prompt) => setUserPrompt(prompt)} 
              currentPrompt={userPrompt} 
            />
            {/* Plain description for function */}
            <div className="mt-2.5 p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/10 text-[10.5px] text-indigo-300 leading-normal font-sans">
              ⚙️ <span className="font-bold">Fonction :</span> Le compagnon prend une phrase rédigée par vous, en extrait les orientations (ex: fétiche, sérieux), et recalcule l'affichage du radar géolocalisé.
            </div>
          </div>

          {/* Card 2: Discovery and GPS Targets options */}
          <div className="bg-[#120d2d] border-2 border-slate-750 rounded-3xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[10px] uppercase tracking-[0.2em] text-slate-350 font-black font-mono">Axe de Recherche</h3>
              <span className="text-[9px] text-indigo-300 font-mono font-bold bg-indigo-950/40 border border-indigo-500/30 px-1.5 rounded">Recombinaison</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                onClick={() => setViewMode('map')}
                className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl transition-all border text-xs font-semibold cursor-pointer ${
                  viewMode === 'map'
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200'
                    : 'bg-slate-950/60 border-transparent text-slate-400 hover:bg-slate-950 hover:text-slate-100'
                }`}
              >
                <Map className="w-4 h-4" />
                <span>Radar Carte</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl transition-all border text-xs font-semibold cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200'
                    : 'bg-slate-950/60 border-transparent text-slate-400 hover:bg-slate-950 hover:text-slate-100'
                }`}
              >
                <Grid className="w-4 h-4" />
                <span>Mosaïque</span>
              </button>
            </div>

            <div className="space-y-4 text-xs pt-3 border-t border-slate-750">
              <div>
                <label className="text-slate-350 block mb-1 font-mono text-[10px] uppercase">Axe Métropolitain :</label>
                <select className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-850 text-slate-200 text-xs focus:outline-none">
                  <option>Plateau Mont-Royal + Village de Montréal</option>
                  <option>Rosemont & Mile End, QC</option>
                  <option>Rive-Sud de Montréal</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-350 font-mono text-[10px]">Cercle Geographique :</span>
                  <span className="font-extrabold text-indigo-400 font-mono text-[11px]">{userPrefs.maxDistance} km</span>
                </div>
                <input 
                  type="range" 
                  min="2" 
                  max="25" 
                  value={userPrefs.maxDistance} 
                  onChange={(e) => setUserPrefs(prev => ({ ...prev, maxDistance: Number(e.target.value) }))}
                  className="w-full accent-indigo-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <span className="text-slate-350 block mb-1.5 font-mono text-[10px] uppercase">Génotypes ciblés :</span>
                <div className="flex flex-wrap gap-1.5">
                  {['Gay', 'Bisexuel', 'Bi-curieux', 'Couple MM'].map((g) => {
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
                        className={`px-2.5 py-1 text-[10px] rounded-full border cursor-pointer transition-all ${
                          isSelected 
                            ? 'bg-indigo-650 text-white border-indigo-400 font-bold' 
                            : 'bg-slate-950 text-slate-400 border-slate-850 hover:text-slate-200 hover:border-slate-750'
                        }`}
                      >
                        {g}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Plain description for function */}
            <div className="mt-4 pt-3.5 border-t border-slate-800 text-[10px] text-slate-400 space-y-1">
              <p>🧬 <span className="font-bold">Fonction :</span> Paramètres de géorepérage spatial. Filtre mathématiquement les profils sur la carte selon vos préférences orientationnelles.</p>
            </div>
          </div>

          {/* Card 3: Photo Safe-Space AI Guardian */}
          <PhotoModerator />

          {/* Card 4: Espace Développeurs API (Crucial for developer tools!) */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-850">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <Code className="w-4 h-4 text-indigo-400" />
                <h4 className="text-[10.5px] uppercase tracking-wider font-bold text-white font-mono">Espace Développeurs API</h4>
              </div>
              <button 
                onClick={() => setShowNetworkInfoPopup(true)}
                className="text-[10px] text-indigo-400 hover:underline flex items-center gap-0.5"
              >
                C'est quoi ?
              </button>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
              Exportez notre écosystème de rencontre bienveillant ou intégrez de nouveaux profils sandbox complets à votre application tierce amie.
            </p>

            {/* Opt-in controller */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-850 space-y-2.5 mb-4">
              <div className="flex items-start gap-2.5">
                <input 
                  type="checkbox" 
                  id="expandedNetworkCheckbox"
                  checked={userOptedIn}
                  onChange={(e) => handleToggleNetworkOptIn(e.target.checked)}
                  className="w-4 h-4 mt-0.5 accent-indigo-500 cursor-pointer rounded bg-slate-900 border-slate-800 text-indigo-600 focus:ring-0"
                />
                <label htmlFor="expandedNetworkCheckbox" className="text-[11px] font-medium leading-snug text-slate-300 cursor-pointer">
                  Ajouter mon profil au réseau étendu AI, qui encourage les développeurs indépendants.
                </label>
              </div>
              <p className="text-[9px] text-slate-500 leading-snug">
                En cochant cette case, les tiers autorisés sur le réseau kinky pourront lire vos informations anonymisées de tchat sémantique via l'API ouverte.
              </p>
            </div>

            {/* Interactive Sandbox triggers */}
            <div className="space-y-2">
              <div className="flex justify-between items-center bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-850">
                <span className="font-mono text-[10px] text-slate-400">liaison-partner-key-2026</span>
                <button 
                  onClick={copyApiKey}
                  className="text-[10px] text-indigo-400 hover:text-indigo-200 uppercase font-bold flex items-center gap-0.5"
                >
                  <Copy className="w-3 h-3" />
                  {apiKeyCopied ? "Copié !" : "Copier"}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-1 px-1 pt-1">
                <button 
                  onClick={() => runDeveloperApiTest('get')}
                  className="py-1 px-2 text-[8.5px] rounded bg-indigo-950 border border-indigo-500/20 text-indigo-300 font-bold hover:bg-slate-800 flex items-center justify-center gap-0.5 cursor-pointer"
                  title="Appelle GET /api/v1/external/profiles"
                >
                  GET List
                </button>
                <button 
                  onClick={() => runDeveloperApiTest('suggest')}
                  className="py-1 px-2 text-[8.5px] rounded bg-indigo-950 border border-indigo-500/20 text-indigo-300 font-bold hover:bg-slate-800 flex items-center justify-center gap-0.5 cursor-pointer"
                  title="Appelle POST /api/v1/external/suggestions"
                >
                  GET Matches
                </button>
                <button 
                  onClick={() => runDeveloperApiTest('mockPost')}
                  className="py-1 px-2 text-[8.5px] rounded bg-indigo-950 border border-indigo-500/20 text-indigo-300 font-bold hover:bg-slate-800 flex items-center justify-center gap-0.5 cursor-pointer"
                  title="Appelle POST /api/v1/external/profiles"
                >
                  POST Profil
                </button>
              </div>

              {/* API Sandbox JSON display window */}
              {(sandboxRunning || sandboxQueryResponse) && (
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-850/80 mt-3 text-[10px] font-mono max-h-40 overflow-y-auto">
                  <div className="flex justify-between border-b border-slate-900 pb-1.5 mb-1.5">
                    <span className="text-[9px] uppercase font-bold text-slate-500">Flux Console Sandbox</span>
                    <button onClick={() => setSandboxQueryResponse(null)} className="text-slate-500 hover:text-white">✕</button>
                  </div>
                  {sandboxRunning ? (
                    <p className="text-indigo-400 animate-pulse font-bold">Appel API en cours...</p>
                  ) : (
                    <pre className="text-emerald-400 whitespace-pre-wrap">{JSON.stringify(sandboxQueryResponse, null, 2)}</pre>
                  )}
                </div>
              )}
            </div>

            {/* Plain description for function */}
            <div className="mt-4 pt-3.5 border-t border-slate-800/80 text-[10px] text-slate-500 space-y-1 leading-normal font-sans">
              <span className="font-bold">📚 Fonction de cette case :</span> Synchronise dynamiquement vos consentements de partage d'API avec notre réseau de sites partenaires kinky et alternatifs d'adultes à travers le Canada.
            </div>
          </div>
            </>
          )}

        </section>

        {/* RIGHT CORE SECTIONS (8 cols on desktop, ordered first) */}
        <section className="order-first lg:order-first lg:col-span-8 space-y-6">

          {activeTab === 'developer' ? (
            // DEVELOPER WORKSPACE PANEL
            <div className="space-y-6">
              
              {/* Top Summary Banner */}
              <div className="p-5.5 rounded-3xl bg-slate-900 border border-slate-850 space-y-2 shadow-2xl">
                <div className="flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">Espace Développeurs API</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  Créez des clés d'accès, définissez des restrictions d'appel par site, accordez des scopes de fonctions et expérimentez en temps réel via notre console interactive.
                </p>
              </div>

              {/* Developer validation workflow */}
              {developerStatus === 'none' && (
                <div className="p-6 rounded-3xl bg-slate-900 border border-amber-500/25 space-y-4">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-mono tracking-wider text-amber-500 font-bold block">🚨 Approbation Préalable Requise</span>
                    <h4 className="text-[13px] font-bold text-slate-100 font-sans">Soumettre une demande d'habilitation</h4>
                    <p className="text-xs text-slate-405 leading-relaxed font-sans">
                      Afin d'obtenir une clé API, l'utilisateur doit être approuvé au préalable par le support technique. Soumettez votre nom de développeur, site hôte et cas d'usage :
                    </p>
                  </div>

                  <form onSubmit={handleRequestDeveloperApproval} className="space-y-3.5 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-400 block font-mono font-bold">NOM DU PROJET OU UTILISATEUR :</label>
                        <input 
                          type="text"
                          required
                          value={devReqName}
                          onChange={(e) => setDevReqName(e.target.value)}
                          placeholder="Ex: Liaison App Partner"
                          className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500/50 p-2.5 rounded-xl text-white outline-none font-sans"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-400 block font-mono font-bold">URL DU SITE INTERNET EXCLUSIF (DOMAINE) :</label>
                        <input 
                          type="url"
                          required
                          value={devReqWebsite}
                          onChange={(e) => setDevReqWebsite(e.target.value)}
                          placeholder="Ex: https://partner-site.com"
                          className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500/50 p-2.5 rounded-xl text-white outline-none font-sans"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 block font-mono font-bold">DESCRIPTION DU CAS D'USAGE ET CONSENTEMENT :</label>
                      <textarea 
                        required
                        rows={3}
                        value={devReqUseCase}
                        onChange={(e) => setDevReqUseCase(e.target.value)}
                        placeholder="Quels types de suggestions d'IA souhaitez-vous intégrer et sur quel domaine d'appel externe ?"
                        className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500/50 p-2.5 rounded-xl text-white outline-none font-sans resize-none leading-relaxed"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-600 rounded-xl text-white font-bold transition-all shadow cursor-pointer text-center uppercase tracking-wider text-[10px]"
                    >
                      ✓ Envoyer la demande au Support Technique
                    </button>
                  </form>
                </div>
              )}

              {developerStatus === 'pending' && (
                <div className="p-6 rounded-3xl bg-slate-900 border border-indigo-500/20 text-center space-y-4">
                  <div className="inline-block p-4.5 bg-slate-950 border border-indigo-500/10 rounded-full animate-bounce">
                    <Terminal className="w-8 h-8 text-indigo-400" />
                  </div>
                  <div className="max-w-md mx-auto space-y-1.5">
                    <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest font-mono">⌛ Demande en cours d'approbation</h4>
                    <p className="text-xs text-slate-350 leading-relaxed font-sans">
                      Votre demande d'habilitation technique pour <strong className="text-white">"{developerInfo?.developerName || "Enregistrement"}"</strong> ({developerInfo?.websiteUrl}) a été transmise aux administrateurs.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-slate-950 border border-slate-850 rounded-2xl max-w-sm mx-auto text-left space-y-2">
                    <span className="text-[9px] text-slate-500 block font-sans uppercase font-bold text-center">💡 Raccourci d'évaluation en temps réel :</span>
                    <button
                      onClick={() => setShowEmployeePortal(true)}
                      className="w-full py-2 bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-500/20 hover:border-indigo-500/50 rounded-xl transition-all cursor-pointer text-center font-bold text-[10.5px] font-sans"
                    >
                      Ouvrir l'Espace Support Employé pour valider (Instant)
                    </button>
                  </div>
                </div>
              )}

              {developerStatus === 'rejected' && (
                <div className="p-6 rounded-3xl bg-slate-900 border border-red-500/20 text-center space-y-4">
                  <div className="inline-block p-4.5 bg-slate-950 border border-red-500/25 rounded-full">
                    <Terminal className="w-8 h-8 text-red-500" />
                  </div>
                  <div className="max-w-md mx-auto space-y-1.5">
                    <h4 className="text-xs font-bold text-red-400 uppercase tracking-widest font-mono">❌ Demande d'habilitation rejetée</h4>
                    <p className="text-xs text-slate-400 leading-relaxed font-sans">
                      Votre demande pour <span className="underline font-mono">{developerInfo?.websiteUrl}</span> a été refusée par l'administration (Critère de conformité ou SSL manquant).
                    </p>
                  </div>
                  
                  <button
                    onClick={() => { setDeveloperStatus('none'); }}
                    className="px-4 py-1.5 bg-slate-950 hover:bg-slate-900 text-slate-300 border border-slate-850 hover:border-slate-800 rounded-xl transition-all font-bold text-[10.5px]"
                  >
                    Soumettre une nouvelle demande
                  </button>
                </div>
              )}

              {developerStatus === 'approved' && (
                <div className="space-y-6">
                  
                  {/* GENERATED KEYS MANAGEMENT SECTION */}
                  <div className="p-5 rounded-3xl bg-slate-900 border border-slate-850 space-y-4">
                    <div className="border-b border-slate-800 pb-2.5">
                      <span className="text-[9px] uppercase font-mono font-bold text-indigo-400">Profil de développeur agréé</span>
                      <h4 className="text-xs font-bold text-slate-100">Compte : <span className="text-indigo-300">{developerInfo?.developerName}</span> ({developerInfo?.websiteUrl})</h4>
                    </div>

                    {/* Keys list */}
                    <div className="space-y-3 font-mono">
                      {developerKeys.length === 0 ? (
                        <p className="text-xs italic text-slate-500 font-sans">Aucune clé active générée pour le moment. Créez-en une à l'aide du formulaire ci-dessous.</p>
                      ) : (
                        developerKeys.map((key) => {
                          return (
                            <div key={key.apiKey} className="p-3.5 bg-slate-950 border border-slate-850 rounded-2xl space-y-2.5">
                              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-slate-900 pb-2">
                                <span className="text-[11px] font-mono text-indigo-300 bg-slate-900 px-3 py-1 rounded border border-slate-850 select-all font-bold">
                                  {key.apiKey}
                                </span>
                                <button
                                  onClick={() => handleRevokeApiKey(key.apiKey)}
                                  className="text-[9px] px-2.5 py-1 bg-red-950 text-red-300 border border-red-500/20 hover:border-red-500 hover:bg-red-900 rounded cursor-pointer transition-all"
                                >
                                  Révoquer la clé
                                </button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-[10px] text-slate-400">
                                <div>
                                  <strong className="text-slate-500">Site(s) d'appel autorisé(s) :</strong>
                                  <p className="text-slate-200 select-all">{key.targetWebsiteUrl}</p>
                                </div>
                                <div className="space-y-1">
                                  <strong className="text-slate-500">Droits et Scopes Actifs :</strong>
                                  <div className="flex flex-wrap gap-1">
                                    {key.assignedPermissions.map((perm: string) => (
                                      <span key={perm} className="text-[8px] px-2 py-0.5 bg-indigo-950 border border-indigo-500/20 text-indigo-300 rounded uppercase font-bold font-mono">
                                        {perm}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Create key Form */}
                    <form onSubmit={handleCreateApiKey} className="bg-slate-950 p-4 border border-slate-850/80 rounded-2.5xl space-y-4 font-sans">
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-mono font-extrabold text-indigo-400 block">Créer une clé d'API tiers</span>
                        <p className="text-[10px] text-slate-500 leading-normal">
                          Les droits sont stricts et sécurisés. L'Origin d'appel du client web doit correspondre au domaine de site enregistré pour la clé.
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[9.5px] text-slate-400 block font-mono font-bold">URL DU SITE INTERNET EXCLUSIF (SANS SLASH) :</label>
                          <input 
                            type="text"
                            required
                            value={newKeyWebsiteUrl}
                            onChange={(e) => setNewKeyWebsiteUrl(e.target.value)}
                            placeholder="Ex: https://partner-site.com"
                            className="w-full bg-slate-900 border border-slate-850 focus:border-indigo-500/50 p-2.5 text-xs text-white outline-none rounded-xl"
                          />
                        </div>

                        {/* Assign Rights/Permissions */}
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[9.5px] text-slate-450 block font-mono font-bold uppercase">Droits d'accès et scopes de fonctions (Assigner les fonctions) :</span>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 font-sans text-[10.5px]">
                            <label className="flex items-center gap-2 bg-slate-900 p-3 rounded-2xl border border-slate-850 hover:border-slate-800 cursor-pointer">
                              <input 
                                type="checkbox"
                                checked={newKeyPerms.readProfiles}
                                onChange={(e) => setNewKeyPerms(prev => ({ ...prev, readProfiles: e.target.checked }))}
                                className="accent-indigo-500 w-4 h-4"
                              />
                              <div>
                                <span className="block font-bold font-mono text-[9px] uppercase text-slate-300 leading-tight">Read Profiles</span>
                                <span className="text-[8px] text-slate-500 leading-tight block">Lecture annuaire</span>
                              </div>
                            </label>

                            <label className="flex items-center gap-2 bg-slate-900 p-3 rounded-2xl border border-slate-850 hover:border-slate-800 cursor-pointer">
                              <input 
                                type="checkbox"
                                checked={newKeyPerms.suggestMatches}
                                onChange={(e) => setNewKeyPerms(prev => ({ ...prev, suggestMatches: e.target.checked }))}
                                className="accent-indigo-500 w-4 h-4"
                              />
                              <div>
                                <span className="block font-bold font-mono text-[9px] uppercase text-slate-300 leading-tight">Suggest Match</span>
                                <span className="text-[8px] text-slate-550 leading-tight block">Mise en relation IA</span>
                              </div>
                            </label>

                            <label className="flex items-center gap-2 bg-slate-900 p-3 rounded-2xl border border-slate-850 hover:border-slate-800 cursor-pointer">
                              <input 
                                type="checkbox"
                                checked={newKeyPerms.createProfiles}
                                onChange={(e) => setNewKeyPerms(prev => ({ ...prev, createProfiles: e.target.checked }))}
                                className="accent-indigo-550 w-4 h-4"
                              />
                              <div>
                                <span className="block font-bold font-mono text-[9px] uppercase text-slate-300 leading-tight">Inject Profile</span>
                                <span className="text-[8px] text-slate-550 leading-tight block">Création sandbox</span>
                              </div>
                            </label>
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-indigo-650 hover:bg-indigo-600 rounded-xl font-bold uppercase tracking-wider text-[9.5px] text-white transition-all cursor-pointer"
                      >
                        ✓ Générer la clé API Liaison
                      </button>
                    </form>
                  </div>

                  {/* REST INTERACTIVE DEMO SANDBOX PLAYGROUND */}
                  <div className="p-5 rounded-3xl bg-slate-900 border border-slate-850 space-y-4">
                    <div className="border-b border-slate-800 pb-2.5">
                      <span className="text-[9px] uppercase font-mono font-bold text-emerald-400">Console d'exécution interactive</span>
                      <h4 className="text-xs font-bold text-slate-100">Playground de requêtes live</h4>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed font-sans">
                      Exécutez de vraies requêtes HTTP sécurisées avec vos propres jetons ou des clés existantes. Le système effectue toutes les vérifications d'identifiants et de conformité instantanément :
                    </p>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        <div className="space-y-1.5">
                          <label className="text-[9px] text-slate-400 block font-mono font-bold uppercase">1. SÉLECTIONNER LA CLÉ EXÉCUTANTE :</label>
                          <select 
                            value={sandboxApiKeyInput}
                            onChange={(e) => setSandboxApiKeyInput(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-xl font-mono text-xs text-slate-200 focus:outline-none"
                          >
                            <option value="liaison-partner-key-2026">liaison-partner-key-2026 (Clé d'essai standard)</option>
                            {developerKeys.map((key) => (
                              <option key={key.apiKey} value={key.apiKey}>
                                {key.apiKey} ({key.targetWebsiteUrl})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[9px] text-slate-400 block font-mono font-bold uppercase">2. TESTER LA CLÉ (APPELS TERMINAUX) :</label>
                          <div className="grid grid-cols-3 gap-1">
                            <button 
                              onClick={() => runDeveloperApiTest('get')}
                              disabled={sandboxRunning}
                              className="py-2.5 px-1.5 text-[8.5px] rounded-xl bg-indigo-950 border border-indigo-500/10 text-indigo-300 font-bold hover:bg-indigo-900 cursor-pointer disabled:bg-slate-950 font-mono text-center leading-none"
                            >
                              GET List
                            </button>
                            <button 
                              onClick={() => runDeveloperApiTest('suggest')}
                              disabled={sandboxRunning}
                              className="py-2.5 px-1.5 text-[8.5px] rounded-xl bg-indigo-950 border border-indigo-500/10 text-indigo-300 font-bold hover:bg-indigo-900 cursor-pointer disabled:bg-slate-950 font-mono text-center leading-none"
                            >
                              POST Match
                            </button>
                            <button 
                              onClick={() => runDeveloperApiTest('mockPost')}
                              disabled={sandboxRunning}
                              className="py-2.5 px-1.5 text-[8.5px] rounded-xl bg-indigo-950 border border-indigo-500/10 text-indigo-300 font-bold hover:bg-indigo-900 cursor-pointer disabled:bg-slate-950 font-mono text-center leading-none"
                            >
                              POST Profile
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* API Sandbox Output screen */}
                      {(sandboxRunning || sandboxQueryResponse) && (
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-850/80 text-[10.5px] font-mono">
                          <div className="flex justify-between border-b border-slate-900 pb-2 mb-2">
                            <span className="text-[9px] uppercase font-bold text-slate-500 flex items-center gap-1.5 font-sans">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> 
                              Console Sandbox Output
                            </span>
                            <button onClick={() => setSandboxQueryResponse(null)} className="text-slate-500 hover:text-white">✕</button>
                          </div>

                          {sandboxRunning ? (
                            <p className="text-indigo-400 animate-pulse font-bold p-2 text-center">Établissement du tuteur de routage API ...</p>
                          ) : (
                            <pre className="text-emerald-400 whitespace-pre font-mono max-h-56 overflow-y-auto leading-relaxed font-sans">{JSON.stringify(sandboxQueryResponse, null, 2)}</pre>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              )}

            </div>
          ) : (
            <>
              {/* AI matched insight banner */}
              <div className="p-4 rounded-2xl bg-[#140f35] border border-indigo-550/35 flex items-center justify-between gap-3 shadow-md">
            <span className="text-[11.5px] text-slate-200 flex items-center gap-2 leading-relaxed font-sans font-medium">
              <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse shrink-0" />
              <span>{aiAnalysisMessage}</span>
            </span>
            <span className="hidden md:inline-block text-[10px] text-indigo-300 font-mono uppercase bg-slate-950 px-2.5 py-1 rounded border border-indigo-500/30 font-bold shrink-0">
              {profiles.length} Profils actifs correspondants
            </span>
          </div>

          {/* Map layout or Grid layout */}
          <div className="relative">
            {loading && profiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-slate-550 gap-2">
                <div className="w-8 h-8 rounded-full border-t-2 border-indigo-500 animate-spin" />
                <p className="italic text-xs font-mono">Calcul en cours par l'IA...</p>
              </div>
            ) : viewMode === 'map' ? (
              <NeighborhoodMap 
                profiles={profiles} 
                onSelectProfile={(p) => setSelectedProfileId(p.id)} 
                selectedProfileId={selectedProfile?.id || null} 
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profiles.length === 0 ? (
                  <div className="col-span-2 text-center py-16 text-slate-550 italic font-mono text-xs">
                    Aucun membre ne correspond à vos filtres sémantiques ou géographiques. Réessayez d'élargir votre radar de quartier.
                  </div>
                ) : (
                  profiles.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => setSelectedProfileId(p.id)}
                      className={`cursor-pointer rounded-3xl p-4.5 transition-all duration-300 border-2 flex gap-4 bg-[#120d2d] hover:scale-[1.01] ${
                        selectedProfileId === p.id 
                          ? 'border-emerald-400 bg-[#16103a] shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-2 ring-emerald-400/20' 
                          : 'border-slate-850 hover:border-slate-750 hover:shadow-md'
                      }`}
                    >
                      <div className="w-20 h-20 rounded-2xl overflow-hidden border border-slate-800 relative flex-shrink-0">
                        <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <span className="absolute bottom-1 right-1 bg-indigo-600 border border-indigo-400 text-white font-extrabold text-[9px] px-1.5 rounded-full shadow">
                          {p.compatibilityScore}%
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <h4 className="font-bold text-white text-[13px]">
                            {p.name}, {p.age} ans
                          </h4>
                          {p.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-450 fill-emerald-500/20" />}
                          {p.isDemo && <span className="text-[8px] bg-slate-950 border border-slate-800 text-slate-400 px-1 py-0.5 rounded font-mono font-semibold uppercase leading-none">Démo IA</span>}
                        </div>
                        <p className="text-[10px] text-indigo-400 font-mono">{p.gender} • {p.location.neighborhood} ({p.location.distance} km)</p>
                        {p.relationshipStatus && (
                          <p className="text-[9.5px] text-pink-405 font-bold flex items-center gap-1 mt-0.5">
                            <span>❤️</span> {p.relationshipStatus}
                            {p.relationshipStatus === 'En couple' && p.partnerName && (
                              <span className="text-[9px] text-slate-400 font-mono">• Lié à {p.partnerName}</span>
                            )}
                          </p>
                        )}
                        <p className="text-xs text-slate-350 mt-1 line-clamp-2 italic">
                          "{p.bio}"
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
            
            {/* Map plain function label */}
            <div className="mt-2.5 p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/15 text-[10.5px] text-slate-400 leading-normal">
              📊 <span className="font-bold text-indigo-300">Fonction de la carte :</span> Visualise la liste des membres fictifs du Plateau Mont-Royal selon leur distance calculée depuis vos coordonnées centrales. Les scores rouges indiquent les correspondances érotiques préconisées par l'IA.
            </div>
          </div>

          {/* Selected match details panel */}
          {selectedProfile && (
            <div className="relative">
              <ProfileDetails 
                profile={selectedProfile}
                userInterests={userInterests}
                onSendMessage={handleSendMessage}
                chatHistory={chats[selectedProfile.id] || []}
              />
              <div className="mt-2.5 p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/10 text-[10.5px] text-indigo-300 leading-normal font-sans">
                💬 <span className="font-bold">Fonction :</span> Affiche la biographie détaillée, les photos certifiées, et permet d'entamer une discussion avec l'IA émulée en arrière-plan qui répond selon sa propre bio d'adulte.
              </div>
            </div>
          )}

          {/* COMPLÉMENT DU PROMPT: Description de la mathématique de l'IA (Angular & Matching) */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-850 space-y-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-400 animate-pulse" />
              <h3 className="text-sm font-bold text-white uppercase font-mono">Coulisses Techniques • Guide d'Intégration d'Algorithme (Angular)</h3>
            </div>

            <p className="text-[11.5px] text-slate-305 leading-relaxed font-sans">
              Le matcher Liaison AI repose sur un scoring pondéré à triple entrée : la distance physique, le recouvrement des centres d'intérêt et l'évaluation sémantique de la requête via un plongement phonétique/sémantique (Gemini Embeddings). Dans un environnement d'ingénierie moderne sous <strong className="text-white">Angular</strong>, l'algorithme s'implémente via des flux réactifs RxJS au sein d'un service partagé.
            </p>

            <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-slate-850">
              <p className="text-[10px] uppercase font-bold text-indigo-300 font-mono">Exemple de Code Angular Réceptif :</p>
              <pre className="text-[9.5px] font-mono text-slate-400 overflow-x-auto whitespace-pre leading-normal">
{`// liaison-matching.service.ts (Compagne Angular 18+)
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

export interface MatchingProfile {
  id: string; name: string; age: number; 
  interests: string[]; distance: number; bio: string;
}

@Injectable({ providedIn: 'root' })
export class LiaisonMatchingService {
  private http = inject(HttpClient);
  
  // États réactifs d'Angular (Signals ou BehaviorSubjects)
  private userPrompt$ = new BehaviorSubject<string>('');
  private genderFilters$ = new BehaviorSubject<string[]>(['Gay', 'Bisexuel']);

  setQuery(prompt: string) { this.userPrompt$.next(prompt); }

  // Pipeline principal de suggestion IA
  public suggestions$: Observable<MatchingProfile[]> = combineLatest([
    this.userPrompt$, this.genderFilters$
  ]).pipe(
    switchMap(([prompt, genders]) => {
      // Proxy d'API avec calcul pondéré de la distance sémantique
      return this.http.post<any>('/api/profiles', { 
        userPrompt: prompt, genderFocus: genders 
      }).pipe(
        map(res => res.matchedProfiles)
      );
    })
  );
}`}
              </pre>
            </div>

            {/* Plain description for function */}
            <div className="text-[10px] text-slate-400 leading-normal">
              💡 <span className="font-bold text-white">Fonction de ce panneau :</span> Décrit les meilleures pratiques d'ingénierie full-stack pour porter notre algorithme sur un framework tiers (comme Angular ou Vue.js) de façon structurée et fluide.
            </div>
          </div>
            </>
          )}

        </section>

      </main>

      {/* Dynamic Profile Completion Wizard Overlay */}
      <WizardModal
        isOpen={isWizardOpen}
        user={user}
        profiles={profiles}
        onSave={handleSaveProfile}
        onClose={() => setIsWizardOpen(false)}
        isEditMode={isWizardEditMode}
      />

      {/* Guided Mobile PWA Installer Overlays */}
      <MobileInstallModal
        isOpen={isMobileInstallOpen}
        onClose={() => setIsMobileInstallOpen(false)}
      />

      {/* FOOTER */}
      <footer className="w-full bg-slate-950 border-t border-slate-900 py-6 px-4 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            <p className="font-mono">© 2026 Association Liaison AI - Gay & Bi Discoveries. Tous droits réservés.</p>
            <p className="mt-1">Ce portail utilise des filtres et une modération d'image pilotée par Gemini-3.5-Flash.</p>
          </div>
          <div className="flex gap-4">
            <span className="text-slate-400">100% Sûr & Privé</span>
            <span className="text-slate-400">Pour Majeurs Uniquement (+18)</span>
          </div>
        </div>
      </footer>

      {/* SPONTANEOUS AI ADVISOR NOTIFICATION BOX (Bottom Left) */}
      <AnimatePresence>
        {advisorVisible && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, x: -30, y: 30 }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-4 left-4 z-50 max-w-sm p-4 rounded-2xl bg-indigo-900/90 border border-indigo-400 text-white shadow-2xl backdrop-blur-md"
          >
            <div className="flex justify-between items-start mb-1">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-pink-400 animate-spin" />
                <span className="font-mono text-[9px] font-extrabold uppercase tracking-widest text-indigo-300">
                  Conseil Spontané de Liaison {user.name ? "pour " + user.name : "IA"}
                </span>
              </div>
              <button 
                onClick={() => setAdvisorVisible(false)}
                className="text-xs text-white/60 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5">
              <h4 className="text-xs font-black uppercase text-pink-300">
                {AI_ADVICES[currentAdviceIndex].title}
              </h4>
              <p className="text-[11px] leading-relaxed text-slate-100">
                "{AI_ADVICES[currentAdviceIndex].msg}"
              </p>
            </div>

            <div className="mt-3 flex justify-between items-center text-[9px]">
              <span className="text-indigo-300 italic font-mono">Conseiller IA Actif</span>
              <button 
                onClick={() => {
                  setCurrentAdviceIndex((prev) => (prev + 1) % AI_ADVICES.length);
                }}
                className="text-pink-300 hover:underline flex items-center font-bold"
              >
                Autre conseil urgent <ChevronRight className="w-2.5 h-2.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING ACTION IA BUTTON ON ALL PAGES (Bottom Right) */}
      <div className="fixed bottom-4 right-4 z-50">
        <button 
          onClick={() => setAssistantOpen(prev => !prev)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-indigo-650 to-purple-650 flex items-center justify-center text-white shadow-[0_0_20px_rgba(99,102,241,0.6)] cursor-pointer hover:scale-105 active:scale-95 transition-all relative border border-indigo-400/30"
          title="Bouton Flottant Compagnon Vocal & Textuel Liaison IA"
        >
          <div className="absolute inset-0 bg-white/10 rounded-full animate-ping" />
          <Sparkles className="w-6 h-6 animate-pulse" />
        </button>

        {/* Floating AI Panel Drawer */}
        <AnimatePresence>
          {assistantOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="absolute bottom-16 right-0 w-80 sm:w-96 p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl backdrop-blur-md"
            >
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <div>
                    <h3 className="text-xs font-black text-white uppercase tracking-wider">Navigateur Intelligent IA</h3>
                    <p className="text-[8px] font-mono text-slate-500">Contrôlez l'application à la voix d'un geste tactile</p>
                  </div>
                </div>

                <div className="flex gap-1 bg-slate-950 p-1 rounded-lg border border-slate-850">
                  <button 
                    onClick={() => setAssistantMode('textual')}
                    className={`px-2.5 py-0.5 text-[9px] rounded-md font-mono ${assistantMode === 'textual' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    Clavier
                  </button>
                  <button 
                    onClick={() => setAssistantMode('live')}
                    className={`px-2.5 py-0.5 text-[9px] rounded-md font-mono flex items-center gap-1 ${assistantMode === 'live' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    <Volume2 className="w-2.5 h-2.5" />
                    Live Vocal
                  </button>
                </div>
              </div>

              {/* Toggle panels depending on selected Mode */}
              {assistantMode === 'live' ? (
                <div className="space-y-4 text-center py-4">
                  <p className="text-xs text-slate-300 px-2 leading-relaxed">
                    Le <strong className="text-indigo-400">Mode Live Vocal</strong> vous permet de dicter vos ordres intimes en parlant normalement (Simulé en direct).
                  </p>
                  
                  {/* Glowing Equalizer Simulation */}
                  <div className="flex items-center justify-center gap-1.5 h-12 py-2">
                    <span className={`w-1 rounded-full bg-indigo-505 transition-all ${isListening ? 'h-10 bg-indigo-400 animate-pulse' : 'h-2 bg-slate-700'}`} style={{ animationDelay: '0.1s' }} />
                    <span className={`w-1 rounded-full bg-indigo-505 transition-all ${isListening ? 'h-8 bg-pink-400 animate-pulse' : 'h-2 bg-slate-700'}`} style={{ animationDelay: '0.2s' }} />
                    <span className={`w-1 rounded-full bg-indigo-505 transition-all ${isListening ? 'h-12 bg-indigo-300 animate-pulse' : 'h-2 bg-slate-705'}`} style={{ animationDelay: '0.3s' }} />
                    <span className={`w-1 rounded-full bg-indigo-505 transition-all ${isListening ? 'h-6 bg-purple-400 animate-pulse' : 'h-2 bg-slate-700'}`} style={{ animationDelay: '0.4s' }} />
                    <span className={`w-1 rounded-full bg-indigo-505 transition-all ${isListening ? 'h-10 bg-pink-300 animate-pulse' : 'h-2 bg-slate-700'}`} style={{ animationDelay: '0.5s' }} />
                  </div>

                  <p className="text-[10px] font-mono text-slate-500 italic h-4">
                    {isListening ? "Écoute active en cours... Parlez maintenant." : "Prêt à écouter votre voix."}
                  </p>

                  <div className="flex justify-center gap-2">
                    <button 
                      onClick={simulateSpeechRecognition}
                      disabled={isListening}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-805 text-white font-bold text-xs rounded-xl transition-all shadow active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      {isListening ? "Analyse sonore..." : "Démarrer l'Écoute"}
                    </button>
                  </div>

                  {/* Preset quick simulation voice triggers */}
                  <div className="space-y-1.5 text-left bg-slate-950 p-3 rounded-2xl border border-slate-850">
                    <p className="text-[9px] uppercase tracking-wider font-extrabold text-indigo-400 font-mono">Exemples de phrases parlées à simuler :</p>
                    <div className="flex flex-col gap-1">
                      <button 
                        onClick={() => executeAssistantAction("Trouve du shibari à moins de 5 km")}
                        className="text-left text-[10px] text-slate-350 hover:text-indigo-300 py-0.5 flex items-center gap-1 hover:underline"
                      >
                        🎤 "Trouves du shibari à moins de 5 km"
                      </button>
                      <button 
                        onClick={() => executeAssistantAction("Cible uniquement les Couples MM")}
                        className="text-left text-[10px] text-slate-350 hover:text-indigo-300 py-0.5 flex items-center gap-1 hover:underline"
                      >
                        🎤 "Cible uniquement les Couples MM"
                      </button>
                      <button 
                        onClick={() => executeAssistantAction("Relation stable uniquement")}
                        className="text-left text-[10px] text-slate-350 hover:text-indigo-300 py-0.5 flex items-center gap-1 hover:underline"
                      >
                        🎤 "Filtre par relation stable"
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 pt-1">
                  {/* Chat messages log */}
                  <div className="h-44 overflow-y-auto pr-1 space-y-2 bg-slate-950 p-3 rounded-2xl border border-slate-850">
                    {floatingAssistantMessages.map((msg, idx) => (
                      <div 
                        key={idx}
                        className={`p-2 rounded-xl text-[10.5px] leading-relaxed max-w-[85%] ${msg.sender === 'user' ? 'bg-indigo-650 text-white ml-auto' : 'bg-slate-900 border border-slate-800 text-slate-205'}`}
                      >
                        {msg.text}
                      </div>
                    ))}
                  </div>

                  {/* Text query input */}
                  <form onSubmit={handleFloatingAssistantSubmit} className="flex gap-1.5">
                    <input 
                      type="text"
                      value={assistantInput}
                      onChange={(e) => setAssistantInput(e.target.value)}
                      placeholder="Tapez un ordre (ex: couple, gay...)"
                      className="flex-grow bg-slate-950 text-white px-3 py-2 text-xs rounded-xl border border-slate-800 focus:border-indigo-500 focus:outline-none placeholder-slate-600 font-mono"
                    />
                    <button 
                      type="submit"
                      className="p-2 rounded-xl bg-indigo-650 hover:bg-indigo-600 text-white active:scale-95 transition-all shadow shrink-0 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              )}

              {/* Simple function tag */}
              <div className="mt-3.5 pt-2 border-t border-slate-850 text-[9px] text-slate-500 leading-normal font-mono">
                💡 <span className="font-bold text-slate-400">Fonction de ce panneau :</span> Traduit en direct vos commandes naturelles en filtres actifs d'interface (Genre, distance, prompt) sans forcer l'usage des menus manuels du site.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* MODAL 3: Network Info Popup Explaining extended developer initiative */}
      <AnimatePresence>
        {showNetworkInfoPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-xl">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#110c2e] border-2 border-indigo-500 ring-4 ring-indigo-500/15 rounded-3xl p-6 max-w-lg w-full shadow-[0_0_50px_rgba(99,102,241,0.35)] relative"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-base font-bold text-white uppercase">Charte de Collaboration d'API Ouverte</h3>
                </div>
                <button 
                  onClick={() => setShowNetworkInfoPopup(false)}
                  className="w-7 h-7 rounded-full bg-slate-950 text-slate-400 hover:text-white flex items-center justify-center text-sm border border-slate-800"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-xs text-slate-350 leading-relaxed font-sans">
                <p>
                  La plateforme <strong className="text-indigo-300">Liaison AI - Gay & Bi Discoveries</strong> encourage les d'indépendants à innover en proposant leurs propres applications périphériques de rencontre sans repartir d'une base de profils vide.
                </p>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 space-y-2">
                  <h4 className="font-bold text-white uppercase text-[10px] tracking-wide text-indigo-400">Règles éthiques strictes :</h4>
                  <ul className="list-disc pl-4 space-y-1.5 text-slate-400">
                    <li>Seuls les profils ayant explicitement consenti via la case à cocher "Réseau indépendant" sont accessibles en lecture par notre API démo.</li>
                    <li>La transmission et l'insertion de profils tiers sont soumises à la clé d'API sandbox <code className="text-white bg-slate-900 px-1 py-0.5 rounded">liaison-partner-key-2026</code>.</li>
                    <li>Sont absolument interdits : la revente commerciale, le profilage abusif ou l'utilisation par des tierces parties non kinky-friendly.</li>
                  </ul>
                </div>

                <p className="text-[10.5px] italic text-slate-400">
                  En autorisant votre profil sur le réseau étendu, vous renforcez la solidarité de notre communauté Gay/Bi fétiche de long terme à travers un maillage d'applications saines et bienveillantes.
                </p>
              </div>

              <div className="mt-6 flex gap-3">
                <button 
                  onClick={() => handleToggleNetworkOptIn(true)}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl"
                >
                  Activer le partage étendu
                </button>
                <button 
                  onClick={() => setShowNetworkInfoPopup(false)}
                  className="flex-shrink py-2 px-4 bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs rounded-xl"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </div>
        )}
        {/* PRIVACY-FRIENDLY DISCREET EMPLOYEE PORTAL LINK IN FOOTER */}
        <footer className="max-w-7xl mx-auto px-6 mt-16 pt-6 border-t border-slate-900 text-center flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-[10.5px]">
          <div>
            <span>© 2026 Association Liaison AI • Conforme éthique libertine kinky, fétiche & long-terme</span>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => {
                setShowEmployeePortal(prev => !prev);
                setShowSupport(false);
              }}
              className="hover:text-red-400 hover:underline font-mono text-[10px] bg-transparent border-none cursor-pointer flex items-center gap-1.5"
            >
              🔒 Accès Staff Interne (Employés)
            </button>
          </div>
        </footer>

      </AnimatePresence>

    </div>
  );
}
