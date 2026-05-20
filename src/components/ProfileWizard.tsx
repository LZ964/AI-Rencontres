import React, { useState } from 'react';
import { 
  Sparkles, 
  User, 
  Heart, 
  MessageSquare, 
  Check, 
  HelpCircle, 
  ArrowRight, 
  ArrowLeft,
  Calendar,
  Layers
} from 'lucide-react';
import { Profile } from '../types';

interface ProfileWizardProps {
  user: any;
  availableProfiles: Profile[];
  onComplete: (updatedUser: any) => void;
}

export default function ProfileWizard({ user, availableProfiles, onComplete }: ProfileWizardProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState(user.name || '');
  const [age, setAge] = useState<number>(user.age || 26);
  const [gender, setGender] = useState<'Gay' | 'Bisexuel' | 'Bi-curieux' | 'Couple MM'>(user.gender || 'Gay');
  const [relationshipStatus, setRelationshipStatus] = useState<'Célibataire' | 'En couple' | 'Relation libre'>('Célibataire');
  const [partnerId, setPartnerId] = useState<string>('');
  const [bio, setBio] = useState(user.bio || '');
  const [seeking, setSeeking] = useState(user.seeking || '');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(user.interests || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const interestOptions = [
    'Cuir esthétique',
    'Domination douce',
    'BDSM chic',
    'Shibari & cordes',
    'Puppy Play',
    'Échangisme MM',
    'Romance stable',
    'Cures thermales',
    'Vins de garde',
    'Art contemporain',
    'Sorties en plein air',
    'Voyages cocooning'
  ];

  const handleInterestToggle = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const nextStep = () => {
    if (step === 1 && !name.trim()) {
      setError("Veuillez entrer votre prénom ou pseudonyme.");
      return;
    }
    setError(null);
    setStep(s => s + 1);
  };

  const prevStep = () => {
    setError(null);
    setStep(s => s - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Le nom est obligatoire.");
      return;
    }
    if (age < 18 || age > 99) {
      setError("L'âge doit être compris entre 18 et 99 ans.");
      return;
    }

    setLoading(true);
    setError(null);

    // If partner is selected, find their name to store it as well
    const selectedPartner = availableProfiles.find(p => p.id === partnerId);
    const partnerName = selectedPartner ? selectedPartner.name : null;

    try {
      const response = await fetch('/api/auth/user/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('liaison_token') || ''}`
        },
        body: JSON.stringify({
          name,
          age,
          gender,
          relationshipStatus,
          partnerId: relationshipStatus === 'En couple' ? (partnerId || null) : null,
          partnerName: relationshipStatus === 'En couple' ? (partnerName || null) : null,
          bio,
          seeking,
          interests: selectedInterests,
          avatar: user.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&h=300&q=80`
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la sauvegarde du profil.");
      }

      onComplete(data.user);
    } catch (err: any) {
      setError(err.message || "Impossible de sauvegarder votre profil.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/95 flex items-center justify-center p-4">
      <div className="h-1.5 absolute top-0 left-0 right-0 bg-gradient-to-r from-red-500 via-pink-500 via-purple-500 via-blue-500 to-green-500" />
      
      <div className="w-full max-w-xl bg-slate-900 border border-pink-500/30 rounded-3xl overflow-hidden shadow-2xl relative z-10 my-8">
        
        {/* Background glow sparks */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-44 h-44 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Wizard Header Banner */}
        <div className="p-6 bg-gradient-to-r from-pink-900/30 via-slate-900 to-indigo-900/30 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pink-400 animate-spin-slow" />
            <div>
              <h2 className="text-sm font-black uppercase text-white tracking-widest">Configuration du Profil</h2>
              <p className="text-[10px] text-slate-400 font-mono">Associez vos préférences • Étape {step} de 4</p>
            </div>
          </div>
          
          {/* Progress bar dots */}
          <div className="flex gap-1.5">
            {[1, 2, 3, 4].map(idx => (
              <span 
                key={idx} 
                className={`w-2.5 h-2.5 rounded-full transition-all ${idx === step ? 'bg-pink-500 ring-2 ring-pink-500/30 scale-110' : idx < step ? 'bg-pink-850' : 'bg-slate-800'}`} 
              />
            ))}
          </div>
        </div>

        {/* Wizard Form Area */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-950/50 border border-red-500/30 text-xs text-red-200">
              ⚠️ {error}
            </div>
          )}

          {/* STEP 1: Main identity */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block uppercase tracking-wide">Pseudonyme ou Prénom fétiche</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => { setName(e.target.value); setError(null); }}
                    placeholder="Ex: Carl_Montreal"
                    className="w-full bg-slate-950 text-white pl-10 pr-4 py-2.5 text-xs rounded-xl border border-pink-500/15 focus:border-pink-500 focus:outline-none"
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-500 leading-normal">C'est le nom public qui s'affichera sur votre carte du radar de Liaison AI.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block uppercase tracking-wide">Âge (Fier et majeur)</label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <input 
                      type="number" 
                      min="18"
                      max="99"
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="w-full bg-slate-950 text-white pl-10 pr-4 py-2.5 text-xs rounded-xl border border-pink-500/15 focus:border-pink-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block uppercase tracking-wide">Orientation</label>
                  <select 
                    value={gender}
                    onChange={(e: any) => setGender(e.target.value)}
                    className="w-full bg-slate-950 text-white pl-3 pr-4 py-2.5 text-xs rounded-xl border border-pink-500/15 focus:border-pink-500 focus:outline-none"
                  >
                    <option value="Gay">♂️ Homme Gay</option>
                    <option value="Bisexuel">🏳️‍🌈 Homme Bisexuel</option>
                    <option value="Bi-curieux">🔍 Homme Bi-curieux</option>
                    <option value="Couple MM">👥 Couple MM (Actif)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Relationship Status & Partner linkage */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block uppercase tracking-wide">Statut Amoureux actuel</label>
                <div className="grid grid-cols-3 gap-2.5">
                  {(['Célibataire', 'En couple', 'Relation libre'] as const).map(status => (
                    <button
                      type="button"
                      key={status}
                      onClick={() => setRelationshipStatus(status)}
                      className={`p-3.5 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1.5 ${relationshipStatus === status ? 'bg-pink-650 text-white border-pink-500 shadow-lg shadow-pink-900/15 ring-2 ring-pink-500/30' : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700'}`}
                    >
                      <Heart className={`w-4 h-4 ${relationshipStatus === status ? 'text-white fill-white' : 'text-slate-500'}`} />
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {relationshipStatus === 'En couple' && (
                <div className="space-y-2 p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 animate-fade-in">
                  <label className="text-xs font-bold text-slate-300 block uppercase tracking-wide flex items-center gap-1">
                    <span>👨‍❤️‍👨</span> Sélectionner votre partenaire officiel :
                  </label>
                  <p className="text-[10px] text-slate-400 leading-normal mb-2">
                    Liez votre compte à un autre membre actif de Liaison AI. Les autres utilisateurs verront cette liaison s'afficher fièrement sur vos profils respectifs.
                  </p>
                  
                  <select
                    value={partnerId}
                    onChange={(e) => setPartnerId(e.target.value)}
                    className="w-full bg-slate-950 text-white pl-3 pr-4 py-2.5 text-xs rounded-xl border border-indigo-500/30 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="">-- Sélectionner un membre du réseau --</option>
                    {availableProfiles.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.location.neighborhood})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Biography and Quests */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block uppercase tracking-wide">Qui êtes-vous ? (Slogan / Bio)</label>
                <div className="relative">
                  <MessageSquare className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <textarea 
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Parlez-nous librement de votre tempérament, de ce qui vous plaît au quotidien..."
                    className="w-full bg-slate-950 text-white pl-10 pr-4 py-2.5 text-xs rounded-xl border border-pink-500/15 focus:border-pink-500 focus:outline-none"
                    maxLength={200}
                  />
                </div>
                <span className="text-[9px] text-slate-500 float-right font-mono">{bio.length}/200</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block uppercase tracking-wide">Qu'est-ce qui attise votre liaison ?</label>
                <div className="relative">
                  <MessageSquare className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <textarea 
                    rows={3}
                    value={seeking}
                    onChange={(e) => setSeeking(e.target.value)}
                    placeholder="Cherchez vous de la cuir-attitude, du shibari, de la complicité tendre sincère ou de la kinky exploration ?"
                    className="w-full bg-slate-950 text-white pl-10 pr-4 py-2.5 text-xs rounded-xl border border-pink-500/15 focus:border-pink-500 focus:outline-none"
                    maxLength={200}
                  />
                </div>
                <span className="text-[9px] text-slate-500 float-right font-mono">{seeking.length}/200</span>
              </div>
            </div>
          )}

          {/* STEP 4: Choose interests */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-pink-400" />
                  <label className="text-xs font-bold text-slate-200 block uppercase tracking-wide">Univers Kinky & Pratiques Fétiches</label>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Cochez les univers et fétiches qui vous correspondent. L'algorithme d'affinité comparera vos choix à ceux de la communauté pour trier le radar.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                {interestOptions.map(interest => {
                  const isSelected = selectedInterests.includes(interest);
                  return (
                    <button
                      type="button"
                      key={interest}
                      onClick={() => handleInterestToggle(interest)}
                      className={`p-2.5 text-left text-[11px] rounded-xl flex items-center justify-between border font-medium ${isSelected ? 'bg-pink-950/40 text-pink-350 border-pink-500/50' : 'bg-slate-950/70 text-slate-400 border-slate-850 hover:bg-slate-850'}`}
                    >
                      <span className="truncate">{interest}</span>
                      <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${isSelected ? 'bg-pink-600 border-pink-500' : 'border-slate-700'}`}>
                        {isSelected && <Check className="w-2.5 h-2.5 text-white stroke-[3.5]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Buttons Area */}
          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3 font-bold text-xs">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white flex items-center gap-1 select-none cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Précédent
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-5 py-2.5 bg-pink-600 hover:bg-pink-550 text-white rounded-xl flex items-center gap-1 shadow-lg shadow-pink-900/20 ml-auto cursor-pointer select-none"
              >
                Suivant <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-pink-500/10 ml-auto flex items-center gap-1.5 cursor-pointer select-none"
              >
                {loading ? (
                  <span className="w-4 h-4 border-t-2 border-white rounded-full animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Activer ma Liaison !
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
