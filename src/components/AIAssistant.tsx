import React, { useState } from 'react';
import { Sparkles, ArrowRight, Zap, RefreshCw } from 'lucide-react';

interface AIAssistantProps {
  onApplyPrompt: (prompt: string) => void;
  currentPrompt: string;
}

export default function AIAssistant({ onApplyPrompt, currentPrompt }: AIAssistantProps) {
  const [inputValue, setInputValue] = useState('');

  const suggestions = [
    { text: 'Un verre de vin rouge tranquille', label: '🍷 Épicurien' },
    { text: 'Un couple complice pour discuter sans tabou', label: '👥 Couple Libertin' },
    { text: 'Quelqu’un avec qui philosopher d’érotisme', label: '🧠 Intellectuel' },
    { text: 'Un profil à moins de 2km d’ici', label: '📍 Voisin direct' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    onApplyPrompt(inputValue.trim());
    setInputValue('');
  };

  return (
    <div className="bg-[#120d2d] border-2 border-purple-500/45 rounded-3xl p-5 shadow-[0_0_25px_rgba(168,85,247,0.2)] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/15 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
        <h3 className="text-base font-bold text-white font-sans">Compagnon de Rencontre IA</h3>
      </div>

      <p className="text-xs text-slate-350 leading-relaxed mb-4">
        Dites à l’IA de Liaison AI ce que vous désirez en français naturel. Elle modifiera instantanément l'algorithme de recommandation et projettera les profils adéquats sur votre carte de quartier.
      </p>

      {/* Preset suggestions button */}
      <div className="flex flex-wrap gap-2 mb-4">
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => onApplyPrompt(s.text)}
            className="px-2.5 py-1 text-[11px] rounded-full bg-slate-950/80 hover:bg-purple-950/40 border border-purple-500/15 text-purple-200 transition-all font-medium flex items-center gap-1 hover:border-purple-500/40"
          >
            <Zap className="w-3 h-3 text-pink-500" />
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="relative flex gap-2" id="ai-assistant-search-form">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ex: Passionné de shibari, cuir et relation de couple stable exclusive..."
          id="ai-assistant-prompt-input"
          className="flex-grow px-3.5 py-2.5 text-xs rounded-2xl bg-slate-950 text-slate-100 border border-purple-500/40 focus:border-purple-400 focus:outline-none placeholder-slate-400 font-sans font-medium"
        />
        <button
          type="submit"
          id="ai-assistant-submit-btn"
          className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs flex items-center justify-center gap-1 shadow-lg shadow-indigo-900/40 transition-all active:scale-95 cursor-pointer shrink-0"
        >
          Analyser <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </form>

      {currentPrompt && (
        <div className="mt-4 p-3 rounded-2xl bg-purple-950/20 border border-purple-500/20 flex justify-between items-center">
          <div className="text-xs text-purple-300">
            <span className="font-bold">Requête Active:</span> "{currentPrompt}"
          </div>
          <button 
            onClick={() => onApplyPrompt('')}
            className="text-[10px] text-pink-400 underline uppercase tracking-wider font-bold hover:text-pink-300 ml-2"
          >
            Réinitialiser
          </button>
        </div>
      )}
    </div>
  );
}
