import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Lock, 
  Terminal, 
  Users, 
  LifeBuoy, 
  Search, 
  Trash2, 
  CornerDownRight, 
  Send, 
  AlertOctagon, 
  CheckCircle, 
  Database,
  Mail,
  ArrowRight,
  LogOut,
  Sliders,
  Radio,
  FileSpreadsheet
} from 'lucide-react';

interface SystemLog {
  timestamp: string;
  userId: string;
  userEmail: string;
  action: string;
  details: string;
}

interface Profile {
  id: string;
  name: string;
  age: number;
  gender: string;
  bio: string;
  interests: string[];
  location?: {
    lat: number;
    lng: number;
    neighborhood: string;
    distance: number;
  };
}

interface TicketMessage {
  sender: 'user' | 'agent' | 'employee';
  text: string;
  timestamp: string;
}

interface SupportTicket {
  id: string;
  userId: string;
  userEmail: string;
  title: string;
  status: 'open' | 'resolved' | 'escalated';
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
}

interface EmployeePortalProps {
  onClose: () => void;
}

interface DeveloperRequest {
  userId: string;
  userEmail: string;
  developerName: string;
  websiteUrl: string;
  useCase: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  decisionDate?: string;
}

export default function EmployeePortal({ onClose }: EmployeePortalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState<string | null>(localStorage.getItem('liaison_employee_token'));
  
  // Tabs: 'logs' | 'profiles' | 'tickets' | 'developer_requests'
  const [currentTab, setCurrentTab] = useState<'logs' | 'profiles' | 'tickets' | 'developer_requests'>('logs');
  
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [devRequests, setDevRequests] = useState<DeveloperRequest[]>([]);
  
  // Selected lists states
  const [searchQuery, setSearchQuery] = useState('');
  const [profileSearchQuery, setProfileSearchQuery] = useState('');
  const [ticketReplyText, setTicketReplyText] = useState<{ [key: string]: string }>({});
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [successCode, setSuccessCode] = useState<string | null>(null);

  // Auto load data if token present
  useEffect(() => {
    if (token) {
      loadTabContent();
    }
  }, [token, currentTab]);

  const loadTabContent = async () => {
    if (!token) return;
    setLoading(true);
    setErrorCode(null);

    const headers = { 'Authorization': `Bearer ${token}` };

    try {
      if (currentTab === 'logs') {
        const res = await fetch('/api/employee/logs', { headers });
        if (res.ok) {
          const data = await res.json();
          setLogs(data.logs || []);
        } else {
          handleAxiosError(res);
        }
      } else if (currentTab === 'profiles') {
        const res = await fetch('/api/employee/profiles', { headers });
        if (res.ok) {
          const data = await res.json();
          setProfiles(data.profiles || []);
        } else {
          handleAxiosError(res);
        }
      } else if (currentTab === 'tickets') {
        const res = await fetch('/api/employee/tickets', { headers });
        if (res.ok) {
          const data = await res.json();
          setTickets(data.tickets || []);
        } else {
          handleAxiosError(res);
        }
      } else if (currentTab === 'developer_requests') {
        const res = await fetch('/api/developer/admin/requests', { headers });
        if (res.ok) {
          const data = await res.json();
          setDevRequests(data.requests || []);
        } else {
          handleAxiosError(res);
        }
      }
    } catch (err) {
      setErrorCode("Problème d'interconnexion avec l'Intranet Liaison AI.");
    } finally {
      setLoading(false);
    }
  };

  const handleAxiosError = async (res: Response) => {
    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem('liaison_employee_token');
      setToken(null);
      setErrorCode("Session d'employé expirée ou invalide.");
    } else {
      const body = await res.json();
      setErrorCode(body.error || "Une erreur est survenue.");
    }
  };

  // Log in as employee
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorCode(null);

    try {
      const res = await fetch('/api/employee/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('liaison_employee_token', data.token);
        setToken(data.token);
        setSuccessCode("Authentification réussie. Espace sécurité d'audit Liaison AI configuré !");
        setTimeout(() => setSuccessCode(null), 3000);
      } else {
        const errData = await res.json();
        setErrorCode(errData.error || "Identifiants d'employé invalides.");
      }
    } catch (err) {
      setErrorCode("Échec d'accès.");
    } finally {
      setLoading(false);
    }
  };

  // Delete/Moderate profile
  const handleDeleteProfile = async (profileId: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer définitivement ce profil de rencontre ? Cette action est irréversible et sera enregistrée dans les logs d'audit d'actions.")) {
      return;
    }

    try {
      const res = await fetch(`/api/employee/profiles/${profileId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setProfiles(prev => prev.filter(p => p.id !== profileId));
        setSuccessCode(`Le profil ${profileId} a été radié du réseau Liaison AI.`);
        setTimeout(() => setSuccessCode(null), 3500);
      } else {
        const errData = await res.json();
        setErrorCode(errData.error || "Suppression impossible.");
      }
    } catch (err) {
      setErrorCode("Échec d'interconnexion.");
    }
  };

  // Submit employee answer to user support ticket
  const handleReplyTicket = async (ticketId: string) => {
    const text = ticketReplyText[ticketId];
    if (!text || !text.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/employee/tickets/${ticketId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: text.trim() })
      });

      if (res.ok) {
        const updated = await res.json();
        // Update ticket in local list
        setTickets(prev => prev.map(t => t.id === updated.id ? updated : t));
        // Clear input reply state
        setTicketReplyText(prev => ({ ...prev, [ticketId]: '' }));
        setSuccessCode("Réponse finale de l'employé publiée ! Le ticket est résolu.");
        setTimeout(() => setSuccessCode(null), 3000);
      } else {
        const errData = await res.json();
        setErrorCode(errData.error || "Publiation de la réponse impossible.");
      }
    } catch (err) {
      setErrorCode("Erreur de sauvegarde.");
    } finally {
      setLoading(false);
    }
  };

  // Technical Support admin approval for third party developer access
  const handleApproveDeveloper = async (developerUserId: string, action: 'approve' | 'reject') => {
    setLoading(true);
    setErrorCode(null);
    setSuccessCode(null);
    const headers = { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    };

    try {
      const res = await fetch('/api/developer/admin/approve', {
        method: 'POST',
        headers,
        body: JSON.stringify({ developerUserId, action })
      });
      if (res.ok) {
        setSuccessCode(`Statut développeur mis à jour : ${action === 'approve' ? 'APPROUVÉ' : 'REJETÉ'} !`);
        setTimeout(() => setSuccessCode(null), 4000);
        
        // Refresh requests list
        const loadReqs = await fetch('/api/developer/admin/requests', { headers });
        if (loadReqs.ok) {
          const rdata = await loadReqs.json();
          setDevRequests(rdata.requests || []);
        }
        
        // Also refresh support tickets list to synchronize statuses
        const loadTcks = await fetch('/api/employee/tickets', { headers });
        if (loadTcks.ok) {
          const tdata = await loadTcks.json();
          setTickets(tdata.tickets || []);
        }
      } else {
        const body = await res.json();
        setErrorCode(body.error || "Une erreur est survenue lors de l'attribution des droits.");
      }
    } catch (err) {
      setErrorCode("Erreur de communication de sécurité.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('liaison_employee_token');
    setToken(null);
    onClose();
  };

  // Filter logs or tickets based on search query
  const filteredLogs = logs.filter(l => 
    l.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter profiles based on profileSearchQuery (by name, interests, or location)
  const filteredProfiles = profiles.filter(p => {
    if (!profileSearchQuery.trim()) return true;
    const query = profileSearchQuery.toLowerCase().trim();
    
    const nameMatch = p.name ? p.name.toLowerCase().includes(query) : false;
    const bioMatch = p.bio ? p.bio.toLowerCase().includes(query) : false;
    
    const interestMatch = p.interests ? p.interests.some(interest => 
      interest.toLowerCase().includes(query)
    ) : false;
    
    const locationNameMatch = p.location?.neighborhood 
      ? p.location.neighborhood.toLowerCase().includes(query)
      : false;

    const genderMatch = p.gender ? p.gender.toLowerCase().includes(query) : false;
    
    return nameMatch || bioMatch || interestMatch || locationNameMatch || genderMatch;
  });

  return (
    <div id="secure-employee-portal" className="bg-slate-950 border border-red-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden text-slate-100 max-w-5xl mx-auto my-6 font-mono text-xs">
      
      {/* Visual security indicator border rails */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-amber-600 to-red-600" />

      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-4 mb-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-950/40 border border-red-500/30 text-red-500 rounded-xl animate-pulse">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-widest flex items-center gap-1.5 font-sans">
              Portail d'Administration Interne <span className="px-2 py-0.5 bg-red-900/30 hover:bg-red-900/40 border border-red-500/20 text-red-400 font-mono text-[9px] rounded font-bold uppercase">ZONE EMPLOYÉ SÉCURISÉE</span>
            </h2>
            <p className="text-[10px] text-slate-450 mt-0.5">Vérifications d'éthique, audit dispute-logs et gestionnaires de tickets Liaison AI</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {token && (
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 hover:text-red-400 text-slate-400 border border-slate-850 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Déconnexion
            </button>
          )}
          <button 
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-900 border border-slate-850 text-slate-300 rounded-xl hover:text-white"
          >
            Fermer console
          </button>
        </div>
      </div>

      {errorCode && (
        <div className="p-3 mb-4 rounded-xl bg-red-950/45 border border-red-500/25 text-[11px] text-red-300 flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 shrink-0 text-red-500 animate-bounce" />
          <span>{errorCode}</span>
        </div>
      )}

      {successCode && (
        <div className="p-3 mb-4 rounded-xl bg-emerald-950/45 border border-emerald-500/25 text-[11px] text-emerald-300 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successCode}</span>
        </div>
      )}

      {/* LOGIN VIEW */}
      {!token ? (
        <div className="max-w-md mx-auto py-12 text-center space-y-6">
          <div className="inline-block p-4 bg-slate-900 border border-slate-800 rounded-3xl mb-1">
            <Lock className="w-8 h-8 text-red-500/80 mx-auto" />
          </div>
          <div className="space-y-1">
            <h3 className="font-sans font-bold text-slate-200 text-sm">IDENTIFICATION REQUISE</h3>
            <p className="text-[10px] text-slate-500 max-w-sm mx-auto">Veuillez renseigner vos identifiants d'employé. Les actions d'audit et de modération de profil sont journalisées à des fins de preuve technique légale.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3 text-left">
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-wider text-slate-450 block">Adresse Mail Professionnelle :</label>
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ex: employee@liaison.ai"
                className="w-full bg-slate-900 border border-slate-800 focus:border-red-500/50 p-2.5 rounded-xl text-white outline-none placeholder-slate-650"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-wider text-slate-450 block">Mot de Passe Réseau :</label>
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••••"
                className="w-full bg-slate-900 border border-slate-800 focus:border-red-500/50 p-2.5 rounded-xl text-white outline-none placeholder-slate-650"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-red-650 hover:bg-red-600 font-bold uppercase tracking-widest text-white rounded-xl transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Shield className="w-4 h-4" />
              {loading ? "Déverrouillage..." : "S'authentifier sur l'Intranet"}
            </button>
          </form>

          <div className="text-[9px] text-slate-600 bg-slate-900/40 p-3 rounded-2xl border border-slate-900 leading-normal max-w-sm mx-auto text-left">
            💡 <strong className="text-slate-400">Identifiants par défaut d'essai :</strong><br />
            Email: <span className="text-slate-350 select-all font-bold">employee@liaison.ai</span> • Passe: <span className="text-slate-350 select-all font-bold">securepassword2026</span>
          </div>
        </div>
      ) : (
        // EMBEDDED DASHBOARD WORKSPACE
        <div className="space-y-4">
          
          {/* Sub Navigation Bar Tab */}
          <div className="flex flex-wrap md:flex-row gap-2 border-b border-slate-850 pb-2.5">
            <button
              onClick={() => { setCurrentTab('logs'); setActiveTicketId(null); }}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${currentTab === 'logs' ? 'bg-red-950/60 border border-red-500/40 text-red-300' : 'bg-slate-900 border border-slate-850 text-slate-400 hover:text-slate-200'}`}
            >
              <Terminal className="w-3.5 h-3.5" /> Journal d'Audit ({logs.length})
            </button>
            <button
              onClick={() => { setCurrentTab('profiles'); setActiveTicketId(null); }}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${currentTab === 'profiles' ? 'bg-red-950/60 border border-red-500/40 text-red-300' : 'bg-slate-900 border border-slate-850 text-slate-400 hover:text-slate-200'}`}
            >
              <Users className="w-3.5 h-3.5" /> Fiches Profils ({profiles.length})
            </button>
            <button
              onClick={() => { setCurrentTab('tickets'); setActiveTicketId(null); }}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${currentTab === 'tickets' ? 'bg-red-950/60 border border-red-500/40 text-red-300' : 'bg-slate-900 border border-slate-850 text-slate-400 hover:text-slate-200'}`}
            >
              <LifeBuoy className="w-3.5 h-3.5" /> Tickets de Support ({tickets.length})
            </button>
            <button
              onClick={() => { setCurrentTab('developer_requests'); setActiveTicketId(null); }}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${currentTab === 'developer_requests' ? 'bg-red-950/60 border border-red-500/40 text-red-300' : 'bg-slate-900 border border-slate-850 text-slate-400 hover:text-slate-200'}`}
            >
              <Sliders className="w-3.5 h-3.5" /> Demandes d'Approbation API ({devRequests.length})
            </button>

            <div className="md:ml-auto w-full md:w-64 relative">
              <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher (ex: login, user, ip)..."
                className="w-full bg-slate-900 border border-slate-800 pl-8 pr-3 py-1.5 rounded-lg text-slate-200 focus:border-red-500/40 focus:outline-none placeholder-slate-605 text-[10.5px]"
              />
            </div>
          </div>

          {/* TAB 1: LOGS AUDIT TRAIL VIEW */}
          {currentTab === 'logs' && (
            <div className="space-y-3">
              <div className="text-[10px] text-slate-400 leading-normal bg-red-950/10 border border-red-500/10 p-3 rounded-xl flex items-start gap-1.5">
                <Sliders className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold text-slate-300">PRINCIPE DE JOURNALISATION ET VIE PRIVÉE :</span>
                  <p className="mt-0.5">
                    Conformément aux directives de l'utilisateur, toutes les actions sur le site (connexions, modifications, modérations d'images via IA, requêtes de matchmaking) sont consignées dans ce journal de sécurité cryptographiquement ordonné. Les textes intimes de la messagerie instantanée ne sont jamais écoutés ou affichés afin de garantir un droit à l'oubli absolu.
                  </p>
                </div>
              </div>

              {loading && logs.length === 0 ? (
                <div className="text-center py-12 animate-pulse font-mono text-slate-500">
                  Lecture sécurisée de la mémoire d'audit...
                </div>
              ) : (
                <div className="bg-slate-900/60 border border-slate-850 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-950/85 text-slate-450 uppercase font-bold text-[9px] border-b border-slate-850">
                          <th className="p-3">Horodatage d'Action</th>
                          <th className="p-3">Utilisateur / Auteur</th>
                          <th className="p-3">Action Clé</th>
                          <th className="p-3">Détails d'Audit de Sécurité</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850/60">
                        {filteredLogs.map((log, idx) => {
                          const dateStr = new Date(log.timestamp).toLocaleString();
                          return (
                            <tr key={idx} className="hover:bg-slate-900/30 transition-colors">
                              <td className="p-3 font-mono font-bold text-slate-400 whitespace-nowrap">{dateStr}</td>
                              <td className="p-3 whitespace-nowrap">
                                <span className="text-slate-300 font-extrabold block text-[10px]">{log.userEmail}</span>
                                <span className="text-slate-500 text-[8.5px] font-mono leading-none">ID: {log.userId}</span>
                              </td>
                              <td className="p-3">
                                <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-slate-950 border border-slate-800 text-amber-400 uppercase">
                                  {log.action}
                                </span>
                              </td>
                              <td className="p-3 text-slate-300 text-[10.5px] font-sans leading-relaxed">{log.details}</td>
                            </tr>
                          );
                        })}
                        {filteredLogs.length === 0 && (
                          <tr>
                            <td colSpan={4} className="p-8 text-center text-slate-500 italic">Aucun log correspondant trouvé.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PROFILES ETHICS LIST MODERATION */}
          {currentTab === 'profiles' && (
            <div className="space-y-4">
              <div className="text-[10.5px] text-slate-400 leading-normal bg-slate-950 border border-slate-850 p-3.5 rounded-2xl flex flex-col md:flex-row gap-3 justify-between items-start md:items-center">
                <div className="flex-1">
                  <span className="text-slate-300 font-bold block mb-0.5">🔒 Limites d'Accès RGPD d'Employé :</span>
                  <p>
                    Conforme aux exigences de sécurité, l'employé peut auditer les fiches de profil d'un membre et radier une personne contrevenante du réseau, mais la lecture de ses messages instantanés érotiques ou kinky privés lui est strictement interdite par le routage crypté du serveur d'api.
                  </p>
                </div>
                <div className="text-[10px] text-indigo-300 bg-indigo-950/40 border border-indigo-500/20 px-3 py-1.5 rounded-xl font-bold font-mono shrink-0">
                  Total : {profiles.length} fiches actives
                </div>
              </div>

              {/* Dedicated Quick Search Engine for Profiles */}
              <div className="bg-slate-900/60 border border-slate-850 p-4 rounded-2xl space-y-3">
                <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                  <div className="space-y-1 flex-1">
                    <label className="text-[10px] uppercase font-bold text-slate-300 font-mono tracking-wider flex items-center gap-1">
                      🔍 Recherche Rapide de Profils
                    </label>
                    <p className="text-[9px] text-slate-500">Filtrage instantané en temps réel par Nom, Centres d'intérêt, Sexe ou Localisation</p>
                  </div>
                  
                  {profileSearchQuery && (
                    <button
                      onClick={() => setProfileSearchQuery('')}
                      className="text-[10px] text-red-400 hover:text-red-300 font-bold underline font-mono cursor-pointer self-start md:self-auto"
                    >
                      [Effacer le filtre]
                    </button>
                  )}
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={profileSearchQuery}
                    onChange={(e) => setProfileSearchQuery(e.target.value)}
                    placeholder="Filtrer par nom (ex: Sébastien), intérêt (ex: Shibari, Cuir), lieu (ex: Mile End)..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-red-500/40 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition-all font-mono"
                  />
                </div>

                {/* Quick Interactive Location & Interest Tags */}
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="text-[9px] text-slate-500 uppercase font-mono mr-1">Raccourcis :</span>
                  {['Plateau Mont-Royal', 'Mile End', 'Rosemont', 'Vieux-Port', 'BDSM chic', 'Shibari', 'Couple MM', 'Gay'].map((tag) => {
                    const isActive = profileSearchQuery.toLowerCase() === tag.toLowerCase();
                    return (
                      <button
                        key={tag}
                        onClick={() => setProfileSearchQuery(isActive ? '' : tag)}
                        className={`text-[9px] px-2 py-1 rounded-md border font-mono transition-all cursor-pointer ${
                          isActive
                            ? 'bg-red-950 text-red-350 border-red-500/50 font-bold'
                            : 'bg-slate-950 text-slate-400 border-slate-850 hover:text-white hover:bg-slate-900'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center text-[9.5px] font-mono text-slate-450 bg-slate-950/40 px-3 py-1.5 rounded-lg border border-slate-800/40">
                  <span>Résultats du filtre : <strong>{filteredProfiles.length}</strong> profils trouvés</span>
                  {profileSearchQuery && (
                    <span className="text-red-450">Filtre actif: "{profileSearchQuery}"</span>
                  )}
                </div>
              </div>

              {loading && filteredProfiles.length === 0 ? (
                <div className="text-center py-12 text-slate-500 animate-pulse font-mono">Chargement de l'annuaire...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredProfiles.map(p => (
                    <div key={p.id} className="p-4 bg-slate-900/80 border border-slate-850 rounded-2xl relative flex flex-col justify-between hover:border-red-500/20 transition-all">
                      <div className="space-y-2.5">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <span className="text-[12px] font-bold text-slate-200 block font-sans">{p.name} ({p.age} ans)</span>
                            <span className="inline-block text-[8.5px] font-mono text-indigo-400 uppercase font-bold tracking-wider mt-0.5">{p.gender}</span>
                            
                            {/* Physical Location block */}
                            {p.location && (
                              <div className="flex items-center gap-1 text-[9px] text-amber-400 font-mono mt-0.5" title={`${p.location.neighborhood} - À environ ${p.location.distance} km`}>
                                <span>📍</span>
                                <span className="underline decoration-dotted">{p.location.neighborhood}</span>
                                <span className="text-slate-500 font-normal">({p.location.distance} km)</span>
                              </div>
                            )}
                          </div>
                          
                          <button
                            onClick={() => handleDeleteProfile(p.id)}
                            className="p-1 px-2.5 rounded bg-red-950 hover:bg-red-900 border border-red-500/20 hover:border-red-500/50 text-red-300 font-bold text-[9px] flex items-center gap-1 cursor-pointer shrink-0 transition-all hover:scale-105"
                            title="Bannir définitivement et supprimer ce profil"
                          >
                            <Trash2 className="w-3 h-3 text-red-400" /> Radier
                          </button>
                        </div>

                        <p className="text-[11px] text-slate-350 line-clamp-3 font-sans leading-relaxed italic border-l-2 border-slate-800 pl-2">
                          "{p.bio}"
                        </p>

                        <div className="flex flex-wrap gap-1 mt-2">
                          {p.interests.map((interest, i) => {
                            const isMatched = profileSearchQuery && interest.toLowerCase().includes(profileSearchQuery.toLowerCase());
                            return (
                              <span 
                                key={i} 
                                className={`text-[8px] px-2 py-0.5 rounded font-mono select-none border ${
                                  isMatched 
                                    ? 'bg-amber-950/80 text-amber-300 border-amber-500/50 font-bold shadow-sm' 
                                    : 'bg-slate-950 text-slate-400 border-slate-850'
                                }`}
                              >
                                {interest}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-850 flex items-center justify-between text-[9px] text-slate-500 font-mono">
                        <span>Référentiel ID: {p.id}</span>
                        <span className="text-red-400 flex items-center gap-0.5 font-bold">
                          🛡️ Messagerie cryptée inviolable
                        </span>
                      </div>
                    </div>
                  ))}
                  {filteredProfiles.length === 0 && (
                    <div className="col-span-2 text-center py-12 p-8 border border-slate-850 border-dashed rounded-2xl text-slate-550 font-mono">
                      ⚠️ Aucun profil de membre ne correspond à votre filtre "{profileSearchQuery}".
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: TICKETS SUPPORT MANAGEMENT */}
          {currentTab === 'tickets' && (
            <div className="space-y-4">
              <div className="text-[10px] text-slate-400 leading-normal bg-amber-950/20 border border-amber-500/10 p-3 rounded-xl flex items-start gap-1.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold text-amber-300">MODULE TICKETS :</span>
                  <p className="mt-0.5">Les tickets marqués comme <strong className="text-amber-400 animate-pulse">Escaladé</strong> ont déclenché des envois d'e-mails professionnels. Résolvez les requêtes pour fermer les incidents.</p>
                </div>
              </div>

              {!activeTicketId ? (
                <div className="space-y-3">
                  {tickets.map(t => {
                    const isEscalated = t.status === 'escalated';
                    const isResolved = t.status === 'resolved';

                    return (
                      <div
                        key={t.id}
                        onClick={() => setActiveTicketId(t.id)}
                        className={`p-3.5 bg-slate-900 border cursor-pointer hover:border-slate-700 transition-all rounded-2xl flex items-center justify-between ${isEscalated ? 'border-amber-500/30 hover:border-amber-500/50' : 'border-slate-850'}`}
                      >
                        <div className="space-y-1">
                          <h4 className="text-xs font-extrabold text-slate-200">
                            {t.title}
                          </h4>
                          <div className="flex items-center gap-2 text-[8.5px] font-mono text-slate-500">
                            <span>Auteur: {t.userEmail}</span>
                            <span>•</span>
                            <span>Ticket ID: {t.id}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isEscalated ? (
                            <span className="text-[8px] font-bold px-2 py-0.5 bg-amber-500/15 border border-amber-500/30 text-amber-400 rounded-full animate-pulse uppercase">
                              ⚠️ Escaladé Dev (Email)
                            </span>
                          ) : isResolved ? (
                            <span className="text-[8px] font-bold px-2 py-0.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-full uppercase">
                              Résolu par staff
                            </span>
                          ) : (
                            <span className="text-[8px] font-bold px-2 py-0.5 bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 rounded-full uppercase">
                              Ouvert (Assistance IA)
                            </span>
                          )}
                          <ArrowRight className="w-4 h-4 text-slate-600" />
                        </div>
                      </div>
                    );
                  })}
                  {tickets.length === 0 && (
                    <div className="text-center py-12 border border-slate-850 border-dashed rounded-2xl text-slate-500">Aucun ticket utilisateur à gérer pour le moment.</div>
                  )}
                </div>
              ) : (
                // ACTIVE ESCALATED TICKETS REPLY CHAT WORKSPACE
                (() => {
                  const t = tickets.find(ticket => ticket.id === activeTicketId);
                  if (!t) return null;

                  return (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                        <button
                          onClick={() => setActiveTicketId(null)}
                          className="font-bold text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                        >
                          ← Retour à la liste globale
                        </button>
                        <span className="text-[9px] font-mono bg-slate-905 border border-slate-800 text-slate-350 px-2 py-1 rounded">
                          RÉF: {t.id}
                        </span>
                      </div>

                      <div className="p-4 bg-slate-900 border border-slate-850 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <span className="text-[9px] text-slate-500 uppercase font-mono">Utilisateur Auteur</span>
                          <span className="block text-xs text-slate-200 font-extrabold">{t.userEmail} (ID: {t.userId})</span>
                          <h3 className="text-xs font-bold text-slate-300 mt-1">Sujet: {t.title}</h3>
                        </div>
                        {t.status === 'escalated' && (
                          <span className="text-[9px] font-mono font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1 rounded-full flex items-center gap-1 select-none animate-pulse">
                            ⚠️ Alerte e-mail envoyée aux Devs
                          </span>
                        )}
                      </div>

                      {/* Ticket dialog messages timeline */}
                      <div className="border border-slate-850 rounded-2xl p-4 h-60 overflow-y-auto space-y-3 bg-slate-950/60 font-mono text-[11px]">
                        {t.messages.map((msg, index) => {
                          const isUser = msg.sender === 'user';
                          const isAgent = msg.sender === 'agent';
                          const isEmployee = msg.sender === 'employee';
                          const date = new Date(msg.timestamp);

                          let label = "Utilisateur";
                          let color = "text-indigo-400";
                          let bg = "bg-indigo-950/20 border-indigo-500/10";
                          if (isAgent) {
                            label = "Agent IA Liaison";
                            color = "text-purple-400";
                            bg = "bg-purple-950/20 border-purple-500/10";
                          } else if (isEmployee) {
                            label = "Moi (Employé Support)";
                            color = "text-emerald-400";
                            bg = "bg-emerald-950/20 border-emerald-500/10";
                          }

                          return (
                            <div key={index} className={`p-3 rounded-xl border ${bg} leading-relaxed`}>
                              <div className="flex justify-between items-center opacity-85 mb-1 text-[9.5px]">
                                <span className={`${color} font-extrabold`}>{label}</span>
                                <span>{date.toLocaleString()}</span>
                              </div>
                              <p className="whitespace-pre-wrap">{msg.text}</p>
                            </div>
                          );
                        })}
                      </div>

                      {/* Publish Reply */}
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleReplyTicket(t.id);
                        }}
                        className="space-y-2"
                      >
                        <label className="text-[9px] uppercase tracking-wider text-slate-400 block font-bold">Rédiger une réponse d'employé (Résolution & e-mail simulé) :</label>
                        <div className="flex gap-2">
                          <textarea
                            required
                            rows={2}
                            value={ticketReplyText[t.id] || ''}
                            onChange={(e) => {
                              const v = e.target.value;
                              setTicketReplyText(prev => ({ ...prev, [t.id]: v }));
                            }}
                            placeholder="Bonjour, j'ai vérifié votre compte Liaison AI et procédé à la modification..."
                            className="flex-grow bg-slate-900 text-white rounded-xl p-3 border border-slate-800 focus:border-red-500/40 focus:outline-none placeholder-slate-650 resize-none"
                          />
                          <button
                            type="submit"
                            disabled={loading || !(ticketReplyText[t.id] || '').trim()}
                            className="p-3.5 bg-red-650 hover:bg-red-600 rounded-xl text-white transition-all hover:scale-[1.02] flex items-center justify-center cursor-pointer font-bold uppercase tracking-wider text-[10px] shrink-0 disabled:bg-slate-800"
                          >
                            <Send className="w-4 h-4 shrink-0 mr-1" /> Publier
                          </button>
                        </div>
                      </form>
                    </div>
                  );
                })()
              )}
            </div>
          )}

          {/* TAB 4: DEVELOPER REQUESTS MANAGEMENT */}
          {currentTab === 'developer_requests' && (
            <div className="space-y-4 font-mono text-xs">
              <div className="text-[10px] text-slate-350 leading-normal bg-red-950/10 border border-red-500/10 p-3.5 rounded-xl flex items-start gap-1.5 font-sans">
                <Sliders className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold text-red-350 uppercase">MODÉRATION TECHNIQUE DES ACCÈS API TIERS (RGPD & CHARTE) :</span>
                  <p className="mt-0.5 text-slate-400">
                    Conformément aux règles de protection de Liaison AI, chaque développeur externe tiers doit de fait être individuellement audité et approuvé par notre support technique avant de pouvoir émettre des clés d'API actives. Utilisez les contrôles ci-dessous pour approuver ou restreindre l'empreinte de leurs applications.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {devRequests.length === 0 ? (
                  <div className="text-center py-12 p-8 border border-slate-850 border-dashed rounded-2xl text-slate-500 font-mono text-[11px]">
                    Aucune demande d'approbation d'accès API enregistrée en base pour le moment.
                  </div>
                ) : (
                  devRequests.map(req => {
                    const isPending = req.status === 'pending';
                    const isApproved = req.status === 'approved';
                    const isRejected = req.status === 'rejected';

                    return (
                      <div 
                        key={req.userId} 
                        className={`p-4 bg-slate-900 border rounded-2xl space-y-3 transition-colors ${
                          isPending ? 'border-amber-500/30 bg-slate-900/90' : 'border-slate-850'
                        }`}
                      >
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-850 pb-2.5">
                          <div>
                            <span className="text-xs font-bold text-slate-200 block font-sans">{req.developerName}</span>
                            <span className="text-[9.5px] font-mono text-slate-450">{req.userEmail} (ID: {req.userId})</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {isPending ? (
                              <span className="text-[8px] font-bold px-2.5 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-400 rounded-full uppercase animate-pulse shrink-0 font-sans">
                                ⏳ En attente de décision support
                              </span>
                            ) : isApproved ? (
                              <span className="text-[8px] font-bold px-2.5 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-full uppercase shrink-0 font-sans">
                                ✓ Accès Autorisé
                              </span>
                            ) : (
                              <span className="text-[8px] font-bold px-2.5 py-1 bg-red-500/15 border border-red-500/30 text-red-400 rounded-full uppercase shrink-0 font-sans font-medium">
                                ✕ Accès Rejeté
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] leading-relaxed font-sans text-slate-300">
                          <div className="space-y-1">
                            <span className="text-[9px] uppercase font-mono text-slate-500 block font-bold">Identité du site enregistré :</span>
                            <a href={req.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline break-all font-mono">
                              {req.websiteUrl}
                            </a>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[9px] uppercase font-mono text-slate-500 block font-bold">Usage projet déclaré :</span>
                            <p className="italic text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-850/40 font-mono text-[10.5px]">"{req.useCase}"</p>
                          </div>
                        </div>

                        {isPending && (
                          <div className="pt-2 flex justify-end gap-2 border-t border-slate-850 font-sans">
                            <button
                              onClick={() => handleApproveDeveloper(req.userId, 'reject')}
                              disabled={loading}
                              className="px-3 py-1.5 rounded-xl bg-red-950/20 hover:bg-red-950 text-red-400 border border-red-500/20 hover:border-red-500/50 text-[10px] font-bold hover:scale-[1.01] transition-all cursor-pointer"
                            >
                              ✕ Refuser l'accès
                            </button>
                            <button
                              onClick={() => handleApproveDeveloper(req.userId, 'approve')}
                              disabled={loading}
                              className="px-3 py-1.5 rounded-xl bg-emerald-950/20 hover:bg-emerald-950 text-emerald-350 border border-emerald-500/20 hover:border-emerald-500/50 text-[10px] font-bold hover:scale-[1.01] transition-all cursor-pointer"
                            >
                              ✓ Approuver pour production
                            </button>
                          </div>
                        )}
                        {!isPending && (
                          <div className="pt-2.5 flex justify-between items-center gap-2 border-t border-slate-850 text-[9.5px] font-mono text-slate-500">
                            <span>Souhaitez-vous réexaminer la conformité ?</span>
                            <button
                              onClick={() => handleApproveDeveloper(req.userId, isApproved ? 'reject' : 'approve')}
                              disabled={loading}
                              className="text-red-450 hover:underline font-bold cursor-pointer font-sans"
                            >
                              {isApproved ? "Révoquer la clé" : "Rétablir en approuvé"}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Footer Disclaimer */}
      <div className="mt-6 pt-4 border-t border-slate-850 flex items-center justify-between text-[9px] text-slate-500 font-mono">
        <span>© 2026 Admin Liaison AI. Tous droits réservés.</span>
        <span>Version 2.35.1 (Intranet de Secours)</span>
      </div>
    </div>
  );
}
