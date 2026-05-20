import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LifeBuoy, 
  Send, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Mail, 
  MessageSquare, 
  PlusCircle, 
  ChevronRight,
  ShieldAlert,
  HelpCircle,
  Sparkles,
  ArrowLeft
} from 'lucide-react';

interface TicketMessage {
  sender: 'user' | 'agent' | 'employee';
  text: string;
  timestamp: string | Date;
}

interface SupportTicket {
  id: string;
  userId: string;
  userEmail: string;
  title: string;
  status: 'open' | 'resolved' | 'escalated';
  messages: TicketMessage[];
  createdAt: string | Date;
  updatedAt: string | Date;
  escalatedEmailSent?: boolean;
  escalationDetails?: string;
}

interface SupportCenterProps {
  onClose?: () => void;
}

export default function SupportCenter({ onClose }: SupportCenterProps) {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  
  // Create ticket form states
  const [creationMode, setCreationMode] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  
  // Chat input states
  const [replyText, setReplyText] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const token = localStorage.getItem('liaison_ai_token');

  // Load user tickets
  const fetchTickets = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/support/tickets', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets || []);
      } else {
        const errData = await res.json();
        setError(errData.error || "Impossible de récupérer vos tickets.");
      }
    } catch (err) {
      setError("Erreur réseau branchée au support technique.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [token]);

  const activeTicket = tickets.find(t => t.id === activeTicketId);

  // Submit new ticket
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newMessage.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newTitle.trim(),
          message: newMessage.trim()
        })
      });

      if (res.ok) {
        const created = await res.json();
        setTickets(prev => [created, ...prev]);
        setActiveTicketId(created.id);
        setCreationMode(false);
        setNewTitle('');
        setNewMessage('');
        setSuccessMsg("Ticket de support créé avec succès ! Assistance IA activée.");
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        const errData = await res.json();
        setError(errData.error || "Création impossible.");
      }
    } catch (err) {
      setError("Erreur réseau lors de la création.");
    } finally {
      setLoading(false);
    }
  };

  // Submit chat reply in a ticket
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeTicketId) return;

    const textToSend = replyText.trim();
    setReplyText('');
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/support/tickets/${activeTicketId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: textToSend })
      });

      if (res.ok) {
        const updated = await res.json();
        // Update ticket in local state
        setTickets(prev => prev.map(t => t.id === updated.id ? updated : t));
      } else {
        const errData = await res.json();
        setError(errData.error || "Envoi du message impossible.");
      }
    } catch (err) {
      setError("Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  };

  // Human / Dev escalation function forced by button click
  const triggerEscalation = async () => {
    if (!activeTicketId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/support/tickets/${activeTicketId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: "S'il vous plaît, je demande l'escalade immédiate de ma demande à un développeur réel pour analyse." })
      });

      if (res.ok) {
        const updated = await res.json();
        setTickets(prev => prev.map(t => t.id === updated.id ? updated : t));
        setSuccessMsg("Votre ticket a été escaladé avec succès aux développeurs ! Alerte e-mail envoyée.");
        setTimeout(() => setSuccessMsg(null), 5000);
      } else {
        const errData = await res.json();
        setError(errData.error || "Escalation impossible.");
      }
    } catch (err) {
      setError("Erreur réseau de transmission.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="support-center-card" className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
      {/* Background radial highlight */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-500/15 rounded-xl border border-indigo-500/20 text-indigo-400">
            <LifeBuoy className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <div>
            <h3 className="font-sans font-bold text-sm text-slate-100 flex items-center gap-1.5 uppercase tracking-wider font-mono">
              Support Technique Liaison <span className="text-indigo-400">AI</span>
            </h3>
            <p className="text-[10px] text-slate-450 font-mono">Conseiller intelligent de niveau 1 & Escalade développeur 24/7</p>
          </div>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white px-2.5 py-1 text-xs border border-slate-800 bg-slate-950 rounded-xl"
          >
            Fermer
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 mb-4 rounded-xl bg-red-950/40 border border-red-500/20 text-[11px] text-red-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 mb-4 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main navigation screen options */}
      {!activeTicketId && !creationMode ? (
        <div className="space-y-4">
          <div className="text-[11.5px] text-slate-350 leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-slate-850/80">
            <p className="mb-2">
              Un problème avec le chargement de votre radar, la validation de vos photos BDSM par notre IA de décence, ou un problème d'API externe ?
            </p>
            <p className="text-slate-400 text-[11px]">
              Notre <strong className="text-indigo-400">Conseiller IA</strong> résout 92% des incidents immédiatement. S'il ne peut résoudre votre cas, il alertera automatiquement nos développeurs par courriel.
            </p>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10.5px] uppercase font-bold text-slate-400 font-mono flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" /> Vos Tickets de Support ({tickets.length})
            </span>
            <button
              onClick={() => setCreationMode(true)}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-650 hover:bg-indigo-600 font-bold text-[10.5px] text-white flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Nouveau Ticket
            </button>
          </div>

          {loading && tickets.length === 0 ? (
            <div className="text-center py-8 text-xs font-mono text-slate-500 animate-pulse">
              Chargement des requêtes...
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-12 bg-slate-950/20 border border-slate-850 border-dashed rounded-2xl text-slate-500 text-xs italic">
              Vous n'utilisez aucun ticket de support actuellement. Créez-en un pour tester l'IA de dépannage.
            </div>
          ) : (
            <div className="space-y-2">
              {tickets.map(ticket => (
                <div
                  key={ticket.id}
                  onClick={() => setActiveTicketId(ticket.id)}
                  className="p-3.5 bg-slate-950/80 border border-slate-850 hover:border-indigo-500/30 rounded-2xl cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="space-y-1 min-w-0 flex-1 pr-3">
                    <h4 className="text-xs font-bold text-slate-200 truncate group-hover:text-indigo-400 transition-colors">
                      {ticket.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[9.5px] text-slate-500 font-mono">
                      <span>Ref: {ticket.id.slice(7)}</span>
                      <span>•</span>
                      <span>{new Date(ticket.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {ticket.status === 'escalated' ? (
                      <span className="text-[8.5px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold flex items-center gap-0.5" title="Alerte envoyée aux devs carlgodrolt@gmail.com">
                        <Mail className="w-2.5 h-2.5 animate-bounce" /> Escaladé Dev
                      </span>
                    ) : ticket.status === 'resolved' ? (
                      <span className="text-[8.5px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">
                        Résolu
                      </span>
                    ) : (
                      <span className="text-[8.5px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold animate-pulse">
                        Soutien IA
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-slate-650 group-hover:text-white transition-all transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : creationMode ? (
        <form onSubmit={handleCreateTicket} className="space-y-4">
          <div className="flex items-center justify-between">
            <button 
              type="button" 
              onClick={() => setCreationMode(false)}
              className="text-slate-400 hover:text-white text-xs flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Retour la liste
            </button>
            <span className="text-[10px] font-mono uppercase bg-indigo-950 border border-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded leading-none font-bold">Nouveau cas</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-400 block font-mono text-[10px] uppercase">Sujet / Problème technique :</label>
            <input 
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Ex: Ma photo de profil fétiche est faussement censurée"
              className="w-full bg-slate-950 text-white px-3 py-2 text-xs rounded-xl border border-slate-800 focus:border-indigo-500 focus:outline-none placeholder-slate-600"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-400 block font-mono text-[10px] uppercase">Description détaillée de l'incident :</label>
            <textarea 
              required
              rows={4}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Veuillez détailler ce qui est bloqué ou s'affiche mal. Écrivez 'escalader' si vous souhaitez contacter directement un développeur."
              className="w-full bg-slate-950 text-white p-3 text-xs rounded-xl border border-slate-800 focus:border-indigo-500 focus:outline-none placeholder-slate-600 resize-none font-sans leading-relaxed"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 font-bold text-xs bg-indigo-650 hover:bg-indigo-600 text-white rounded-xl transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-slate-800"
          >
            <LifeBuoy className="w-4 h-4" />
            {loading ? "Génération de l'aide par l'IA..." : "Ouvrir et interroger l'IA de Support"}
          </button>
        </form>
      ) : (
        // ACTIVE TICKET DETAILS CHAT THREAD
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <button 
              onClick={() => setActiveTicketId(null)}
              className="text-slate-400 hover:text-white text-xs flex items-center gap-1 font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Liste des tickets
            </button>
            <div className="text-right">
              <h4 className="text-[10px] font-mono text-slate-500 uppercase">Statut actuel</h4>
              {activeTicket?.status === 'escalated' ? (
                <span className="text-[9px] font-mono font-bold text-yellow-400 uppercase bg-yellow-950/40 border border-yellow-500/25 px-2 py-0.5 rounded">Escaladé Équipe Dev</span>
              ) : activeTicket?.status === 'resolved' ? (
                <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase bg-emerald-950/40 border border-emerald-500/25 px-2 py-0.5 rounded">Résolu & Clos</span>
              ) : (
                <span className="text-[9px] font-mono font-bold text-indigo-400 uppercase bg-indigo-950/40 border border-indigo-500/25 px-2 py-0.5 rounded animate-pulse">Conseiller IA Actif</span>
              )}
            </div>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-850">
            <span className="text-[9px] text-slate-500 uppercase font-mono block">Sujet de la demande</span>
            <span className="text-xs font-extrabold text-slate-200">{activeTicket?.title}</span>
            {activeTicket?.escalatedEmailSent && (
              <div className="mt-2 text-[10px] text-yellow-300 bg-yellow-950/20 border border-yellow-500/15 p-2 rounded-xl flex items-start gap-1.5">
                <Mail className="w-3.5 h-3.5 text-yellow-400 shrink-0 mt-0.5 animate-bounce" />
                <div>
                  <span className="font-bold">Alerte de niveau 2 dépêchée :</span>
                  <p className="text-[9px] text-slate-400 mt-0.5 leading-snug">Courriel urgent envoyé automatiquement au développeur du site de rencontre (carlgodrolt@gmail.com) pour analyse immédiate.</p>
                </div>
              </div>
            )}
          </div>

          {/* Ticket message loop */}
          <div className="h-56 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
            {activeTicket?.messages.map((msg, index) => {
              const date = new Date(msg.timestamp);
              const isUser = msg.sender === 'user';
              const isEmployee = msg.sender === 'employee';
              const isAgent = msg.sender === 'agent';
              
              let senderName = "Moi (Utilisateur)";
              let colorClasses = "bg-indigo-650 text-white ml-auto";
              if (isAgent) {
                senderName = "🤖 AI Tech Support Agent";
                colorClasses = "bg-slate-950 border border-slate-800 text-slate-200";
              } else if (isEmployee) {
                senderName = "👨‍💻 Employé Liaison (Support)";
                colorClasses = "bg-emerald-900/60 border border-emerald-500/20 text-emerald-100";
              }

              return (
                <div key={index} className={`max-w-[90%] rounded-2xl p-3 text-xs leading-relaxed ${colorClasses}`}>
                  <div className="flex justify-between items-center mb-1 text-[9px] opacity-70 font-mono">
                    <span className="font-extrabold">{senderName}</span>
                    <span>{date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              );
            })}
          </div>

          {/* Prompt quick tools */}
          {activeTicket?.status !== 'escalated' && (
            <div className="flex flex-col md:flex-row gap-2 pt-2 border-t border-slate-800/80 items-stretch md:items-center justify-between">
              <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono leading-none">
                <ShieldAlert className="w-3.5 h-3.5 text-orange-400 animate-pulse" /> IA impuissante ou besoin d'expertise humaine ?
              </span>
              <button
                type="button"
                onClick={triggerEscalation}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white font-bold text-[10px] rounded-lg transition-all"
                title="Acheminer directement un e-mail à carlgodrolt@gmail.com"
              >
                Escalader aux Développeurs (Email)
              </button>
            </div>
          )}

          {/* Input reply form */}
          <form onSubmit={handleSendReply} className="flex gap-2">
            <input 
              type="text"
              required
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={activeTicket?.status === 'escalated' ? "Écrivez votre complément pour les développeurs..." : "Posez une question technique (ex: comment marche...)"}
              className="flex-grow bg-slate-950 text-white px-3 py-2.5 text-xs rounded-xl border border-slate-800 focus:border-indigo-500 focus:outline-none placeholder-slate-650 font-mono"
            />
            <button 
              type="submit"
              disabled={loading}
              className="p-2 px-3.5 rounded-xl bg-indigo-650 hover:bg-indigo-600 disabled:bg-slate-800 text-white transition-colors active:scale-95 flex items-center justify-center shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}

      {/* Safety message */}
      <div className="mt-4 pt-3.5 border-t border-slate-800/80 text-[9.5px] text-slate-500 leading-normal font-mono">
        ⚙️ <span className="font-bold text-slate-400">Respect de la vie privée :</span> Cette console de support n'enregistre aucune donnée de chat kinky intime. Seules les descriptions techniques du problème formulées ici sont auditables en cas de litige par nos employés agréés.
      </div>
    </div>
  );
}
