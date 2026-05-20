import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Sparkles, 
  User, 
  Calendar, 
  ShieldCheck, 
  Tag, 
  Smile, 
  ArrowRight,
  ArrowLeft,
  Check, 
  Search,
  Users
} from 'lucide-react';
import { Profile } from '../types';

interface WizardModalProps {
  isOpen: boolean;
  user: any;
  profiles: Profile[];
  onSave: (updatedData: any) => Promise<boolean>;
  onClose?: () => void;
  isEditMode?: boolean;
}

const FETISH_INTEREST_OPTIONS = [
  'Cuir',
  'Shibari & Cordes',
  'BDSM chic',
  'Fétiche Latex',
  'Cire chaude & impact',
  'Relation stable',
  'Amour pluriel',
  'Romance stable',
  'Vins de garde',
  'Art contemporain',
  'Gastronomie',
  'Puppy Play',
  'Voyages kinky',
];

export default function WizardModal({ 
  isOpen, 
  user, 
  profiles = [], 
  onSave, 
  onClose, 
  isEditMode = false 
}: WizardModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [name, setName] = useState('');
  const [age, setAge] = useState(25);
  const [gender, setGender] = useState<'Gay' | 'Bisexuel' | 'Bi-curieux' | 'Couple MM'>('Gay');
  const [relationshipStatus, setRelationshipStatus] = useState<string>('Célibataire');
  const [partnerId, setPartnerId] = useState<string>('');
  const [partnerName, setPartnerName] = useState<string>('');
  const [interests, setInterests] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [seeking, setSeeking] = useState('');
  const [loading, setLoading] = useState(false);
  const [partnerSearchInput, setPartnerSearchInput] = useState('');
  const [showPartnerSuggestions, setShowPartnerSuggestions] = useState(false);

  // Initialize from user info when model opens
  useEffect(() => {
    if (user && isOpen) {
      setName(user.name || '');
      setAge(user.age || 28);
      setGender(user.gender || 'Gay');
      setRelationshipStatus(user.relationshipStatus || 'Célibataire');
      setPartnerId(user.partnerId || '');
      setPartnerName(user.partnerName || '');
      setInterests(user.interests || []);
      setBio(user.bio || '');
      setSeeking(user.seeking || '');
      
      if (!isEditMode) {
        setCurrentStep(1);
      }
    }
  }, [user, isOpen, isEditMode]);

  if (!isOpen) return null;

  // Filter profiles for partner suggestions
  const partnerCandidates = profiles
    .filter(p => p.id !== (user?.id || ''))
    .filter(p => !partnerSearchInput || p.name.toLowerCase().includes(partnerSearchInput.toLowerCase()));

  const handleInterestToggle = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter(i => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const validateStep = () => {
    if (currentStep === 1) {
      if (!name.trim()) return "Veuillez entrer votre prénom ou pseudonyme.";
      if (age < 18) return "Vous devez avoir minimum 18 ans.";
    }
    if (currentStep === 2) {
      if (interests.length === 0) return "Veuillez sélectionner au moins une pratique kinky ou centre d'intérêt.";
    }
    if (currentStep === 4) {
      if (!bio.trim() || bio.length < 15) return "Veuillez rédiger une description sincère de votre esprit kinky (min. 15 caractères).";
      if (!seeking.trim() || seeking.length < 10) return "Veuillez décrire concrètement ce que vous recherchez.";
    }
    return null;
  };

  const [validationError, setValidationError] = useState<string | null>(null);

  const handleNext = () => {
    const error = validateStep();
    if (error) {
      setValidationError(error);
      return;
    }
    setValidationError(null);
    setCurrentStep(prev => prev + 1);
  };

  const handlePrev = () => {
    setValidationError(null);
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmitProfile = async () => {
    const error = validateStep();
    if (error) {
      setValidationError(error);
      return;
    }
    setValidationError(null);
    setLoading(true);

    const submissionData = {
      name,
      age,
      gender,
      interests,
      bio,
      seeking,
      relationshipStatus,
      partnerId: relationshipStatus === 'En couple' ? partnerId : '',
      partnerName: relationshipStatus === 'En couple' ? partnerName : '',
    };

    try {
      const success = await onSave(submissionData);
      if (success) {
        if (onClose) onClose();
      }
    } catch (err) {
      setValidationError("Erreur lors de la sauvegarde du profil. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
      {/* Background glowing rings */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div 
        id="wizard-container-card"
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg bg-[#110c2e] border-2 border-indigo-500 ring-4 ring-indigo-500/15 rounded-3xl p-6 shadow-[0_0_50px_rgba(99,102,241,0.35)] relative overflow-hidden text-slate-100 z-10"
      >
        {/* Rainbow top bar decoration */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 via-orange-500 via-yellow-500 via-green-500 via-indigo-500 to-pink-500" />

        {/* Header */}
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-600/30 flex items-center justify-center border border-indigo-400/20">
              <Sparkles className="w-4 h-4 text-indigo-400 rotate-12" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider font-mono">
                {isEditMode ? "Modifier mon Profil" : "Optimisation de mon radar IA"}
              </h3>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
                {isEditMode ? "Détails d'identité & pratiques actives" : "Liaison AI • Étape de première connexion"}
              </p>
            </div>
          </div>
          
          {isEditMode && onClose && (
            <button 
              onClick={onClose} 
              id="close-profile-btn"
              className="text-xs px-3 py-1 bg-slate-950 text-slate-400 hover:text-white border border-slate-800 rounded-xl hover:bg-slate-900 transition-all cursor-pointer"
            >
              ✕ Fermer
            </button>
          )}
        </div>

        {/* Progress Dots */}
        <div className="flex items-center justify-center gap-2 mb-6" id="wizard-progress-bar">
          {[1, 2, 3, 4].map((step) => (
            <div 
              key={step} 
              className={`h-1 px-4 rounded-full transition-all duration-300 ${
                currentStep === step 
                  ? 'bg-gradient-to-r from-indigo-500 to-pink-500 w-12' 
                  : currentStep > step 
                  ? 'bg-indigo-600 w-6' 
                  : 'bg-slate-800 w-4'
              }`}
            />
          ))}
        </div>

        {/* Validation error banner */}
        <AnimatePresence>
          {validationError && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-3 bg-red-950/20 border border-red-500/30 text-red-300 text-xs rounded-xl flex items-center gap-2"
              id="wizard-error-alert"
            >
              <Smile className="w-4 h-4 shrink-0 rotate-180 text-red-400" />
              <span>{validationError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Wizard Form view */}
        <div className="min-h-76 font-sans text-xs">
          {currentStep === 1 && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
              id="wizard-step-1"
            >
              <div className="space-y-1">
                <span className="text-[10px] bg-indigo-950/55 text-indigo-300 px-2 py-0.5 rounded border border-indigo-400/10 font-bold uppercase font-mono tracking-wider">Identité Libre</span>
                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5 pt-1">
                  1. Racontez-nous qui vous êtes
                </h4>
                <p className="text-[10px] text-slate-450 leading-relaxed">
                  Notre radar sémantique kinky se calibre selon votre âge et votre orientation. Soyez authentique.
                </p>
              </div>

              <div className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400 font-mono font-bold uppercase block flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-indigo-400 text-center" /> Prénom ou Pseudonyme :
                    </label>
                    <input 
                      type="text"
                      id="wizard-name-input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Carl"
                      className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 p-2.5 rounded-xl text-slate-100 outline-none font-bold placeholder-slate-450"
                    />
                  </div>
 
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400 font-mono font-bold uppercase block flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400 text-center" /> Âge (Requis majeur +18) :
                    </label>
                    <input 
                      type="number"
                      id="wizard-age-input"
                      min={18}
                      max={99}
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 p-2.5 rounded-xl text-slate-100 outline-none font-bold font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] text-slate-400 font-mono font-bold uppercase block">Orientation d'affichage principale :</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {['Gay', 'Bisexuel', 'Bi-curieux', 'Couple MM'].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGender(g as any)}
                        className={`p-2.5 rounded-xl border text-[11px] font-bold text-center transition-all cursor-pointer ${
                          gender === g 
                            ? 'bg-indigo-600/25 border-indigo-500 text-indigo-200 font-extrabold scale-102' 
                            : 'bg-slate-950/65 border-slate-850 text-slate-400 hover:border-slate-800'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
              id="wizard-step-2"
            >
              <div className="space-y-1">
                <span className="text-[10px] bg-pink-950/55 text-pink-300 px-2 py-0.5 rounded border border-pink-400/10 font-bold uppercase font-mono tracking-wider">Écosystème Kinky / Fétiche</span>
                <h4 className="text-sm font-bold text-slate-100 pt-1">
                  2. Vos Pratiques & Fétiches Favoris
                </h4>
                <p className="text-[10px] text-slate-450 leading-relaxed">
                  Cochez vos pratiques sensuelles et orientations kinky ou romantiques pour que l'IA puisse vous identifier et vous faire correspondre avec des esprits accordés.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1 pb-1">
                {FETISH_INTEREST_OPTIONS.map((interest) => {
                  const selected = interests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => handleInterestToggle(interest)}
                      className={`p-2 rounded-xl text-left border text-[10.5px] transition-all flex items-center justify-between cursor-pointer ${
                        selected 
                          ? 'bg-pink-650/15 border-pink-500 text-pink-300 font-bold' 
                          : 'bg-slate-950/60 border-slate-850 text-slate-450 hover:border-slate-800'
                      }`}
                    >
                      <span>{interest}</span>
                      {selected ? (
                        <Check className="w-3.5 h-3.5 text-pink-500 font-black shrink-0 ml-1" />
                      ) : (
                        <span className="w-2.5 h-2.5 rounded-full border border-slate-700 hover:border-slate-500 inline-block shrink-0 ml-1" />
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
              id="wizard-step-3"
            >
              <div className="space-y-1">
                <span className="text-[10px] bg-emerald-950/55 text-emerald-300 px-2 py-0.5 rounded border border-emerald-400/10 font-bold uppercase font-mono tracking-wider">État Relationnel</span>
                <h4 className="text-sm font-bold text-slate-100 pt-1">
                  3. Situation de vie ou de couple
                </h4>
                <p className="text-[10px] text-slate-450 leading-relaxed">
                  Êtes-vous célibataire, en couple engagé, homme marié ou adepte du libertinage ? Précisez votre statut et identifiez votre moitié si elle est membre.
                </p>
              </div>

              <div className="space-y-3.5 font-sans">
                <div className="space-y-1">
                  <label className="text-[9.5px] text-slate-400 font-mono font-bold uppercase block">Statut amoureux actuel :</label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {['Célibataire', 'En couple', 'Relation libre / Poly', 'Échangiste MM'].map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => {
                          setRelationshipStatus(status);
                          if (status !== 'En couple') {
                            setPartnerId('');
                            setPartnerName('');
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-[11px] font-bold text-center transition-all cursor-pointer ${
                          relationshipStatus === status 
                            ? 'bg-emerald-650/20 border-emerald-500 text-emerald-250 font-extrabold scale-102' 
                            : 'bg-slate-950/65 border-slate-850 text-slate-400 hover:border-slate-800'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Conditional fields for in a couple status */}
                {relationshipStatus === 'En couple' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-3.5 bg-slate-950 rounded-2xl border border-indigo-500/20 space-y-3"
                    id="wizard-couple-subform"
                  >
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase font-mono font-bold text-indigo-400 flex items-center gap-1">
                        <Users className="w-3 h-3" /> Liaison de profil partenaire
                      </span>
                      <p className="text-[9.5px] text-slate-500 leading-snug">
                        Qui est votre moitié ? Sélectionnez un membre actif de Liaison AI ou saisissez son nom à titre indicatif :
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-500">
                          <Search className="w-3.5 h-3.5" />
                        </span>
                        <input 
                          type="text" 
                          placeholder="Rechercher Lucas, Maxime, Alexandre..." 
                          value={partnerSearchInput}
                          onChange={(e) => {
                            setPartnerSearchInput(e.target.value);
                            setShowPartnerSuggestions(true);
                            // Set custom partner display name as fallback if they don't pick off list
                            setPartnerName(e.target.value);
                          }}
                          onFocus={() => setShowPartnerSuggestions(true)}
                          className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      {/* Dropdown list of users */}
                      {showPartnerSuggestions && (
                        <div className="bg-slate-900 border border-slate-800 max-h-32 overflow-y-auto rounded-xl shadow-lg divide-y divide-slate-850 p-1">
                          {partnerCandidates.length === 0 ? (
                            <p className="p-2 text-[10px] italic text-slate-500 text-center">
                              Aucun profil similaire trouvé. Son nom sera affiché de manière indicative.
                            </p>
                          ) : (
                            partnerCandidates.slice(0, 5).map(cand => (
                              <div 
                                key={cand.id}
                                onClick={() => {
                                  setPartnerId(cand.id);
                                  setPartnerName(cand.name);
                                  setPartnerSearchInput(cand.name);
                                  setShowPartnerSuggestions(false);
                                }}
                                className={`p-2 flex items-center gap-2 hover:bg-slate-800 rounded-lg cursor-pointer transition-all ${partnerId === cand.id ? 'bg-indigo-950 text-indigo-300 font-bold' : ''}`}
                              >
                                <img src={cand.avatar} alt={cand.name} className="w-5 h-5 rounded-full object-cover shrink-0" />
                                <div>
                                  <p className="text-[11.5px] font-bold text-slate-100 leading-tight">{cand.name}</p>
                                  <p className="text-[9px] text-slate-500 leading-none">{cand.gender} • {cand.age} ans • {cand.location.neighborhood}</p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>

                    {partnerName && (
                      <div className="p-2 bg-slate-900 border border-slate-850 rounded-xl flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">
                          Partenaire sélectionné : <strong className="text-white">{partnerName}</strong> 
                          {partnerId ? <span className="text-[9px] text-emerald-400 ml-1.5 font-mono">✓ Lié à son compte</span> : <span className="text-[9px] text-slate-500 ml-1.5 italic">(Nom libre)</span>}
                        </span>
                        <button 
                          onClick={() => {
                            setPartnerId('');
                            setPartnerName('');
                            setPartnerSearchInput('');
                          }}
                          className="text-[9.5px] text-red-400 font-bold hover:underline"
                        >
                          Effacer
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-3.5"
              id="wizard-step-4"
            >
              <div className="space-y-1">
                <span className="text-[10px] bg-purple-950/55 text-purple-300 px-2 py-0.5 rounded border border-purple-400/10 font-bold uppercase font-mono tracking-wider">Témoignage de l'Esprit</span>
                <h4 className="text-sm font-bold text-slate-100 pt-1">
                  4. Rédiger votre Biographie & Vos attentes
                </h4>
                <p className="text-[10px] text-slate-450 leading-relaxed">
                  Liaison AI utilise notre algorithme sémantique propulsé par Gemini pour analyser vos descriptions et optimiser vos recommandations en direct.
                </p>
              </div>

              <div className="space-y-3 font-sans">
                <div className="space-y-1">
                  <label className="text-[9.5px] text-slate-400 font-mono font-bold uppercase block">Votre biographie (minimum 15 caractères) :</label>
                  <textarea 
                    rows={2.5}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Parlez-nous de vous, de vos désirs, de vos passions, artistiques ou kinky..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500/50 p-2.5 rounded-xl text-white outline-none leading-relaxed text-xs resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9.5px] text-slate-400 font-mono font-bold uppercase block">Ce que vous recherchez précisément chez l'autre (intentions) :</label>
                  <textarea 
                    rows={2}
                    value={seeking}
                    onChange={(e) => setSeeking(e.target.value)}
                    placeholder="Ex: Un bel esprit kinky curieux ou un partenaire stable exclusif..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500/50 p-2.5 rounded-xl text-white outline-none leading-relaxed text-xs resize-none"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer actions */}
        <div className="border-t border-slate-800 mt-6 pt-4 flex items-center justify-between">
          <div>
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                id="wizard-prev-btn"
                className="px-4 py-2 rounded-xl bg-slate-950 text-slate-300 border border-slate-850 hover:bg-slate-900 transition-all font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Retour
              </button>
            ) : (
              <div />
            )}
          </div>

          <div>
            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                id="wizard-next-btn"
                className="px-5 py-2 rounded-xl bg-indigo-650 hover:bg-indigo-600 text-white font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                Suivant <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitProfile}
                disabled={loading}
                id="wizard-submit-btn"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-extrabold transition-all duration-300 flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span>Saving...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4 font-black" />
                    <span>{isEditMode ? "Enregistrer" : "Finaliser mon Profil"}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Small security seal */}
        <div className="mt-4 pt-2 border-t border-slate-800/40 text-center flex items-center justify-center gap-1.5 text-[9px] text-slate-500 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
          <span>Données traitées et isolées en France sous chiffrement Liaison AI TLS 1.3</span>
        </div>
      </motion.div>
    </div>
  );
}
