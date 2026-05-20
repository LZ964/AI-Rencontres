import React, { useState } from 'react';
import { motion } from 'motion/react';
import { simulateImageModeration } from '../utils/aiSimulator';
import { ShieldCheck, Camera, Sparkles, AlertOctagon, HelpCircle, CheckCircle, Flame } from 'lucide-react';

export default function PhotoModerator() {
  const [analyzing, setAnalyzing] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');
  const [moderationResult, setModerationResult] = useState<any>(null);

  // Preset images for easy user testing of AI moderation of adult content
  const testImages = [
    {
      name: 'Chic / Souriant (Certifié)',
      url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80',
      descriptionPath: 'Chic et glamour, haut niveau de décence'
    },
    {
      name: 'Artistique / Sophistiqué (Certifié)',
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=80',
      descriptionPath: 'Portrait masculin élégant'
    },
    {
      name: 'Trop Osé (Rejeté)',
      url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&h=400&q=80&osee=true',
      descriptionPath: 'Exposition corporelle trop suggestive (simulation d’infraction)'
    }
  ];

  const handleSelectedImage = (url: string) => {
    setAnalyzing(true);
    setPhotoUrl(url);
    setModerationResult(null);

    // Simulate AI delay scanner
    setTimeout(() => {
      const result = simulateImageModeration(url);
      setModerationResult(result);
      setAnalyzing(false);
    }, 1800);
  };

  return (
    <div className="bg-slate-900 border border-purple-500/10 rounded-3xl p-6 shadow-xl relative overflow-hidden">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-bold font-sans tracking-tight text-white">Modérateur d'Images IA Auto-Géré</h3>
      </div>
      <p className="text-xs text-slate-400 leading-relaxed mb-4">
        Notre intelligence artificielle filtre instantanément les photos suggestives, vulgaires ou trop dénudées lors du téléversement sur le profil. Testez nos préréglages pour observer le filtre neural en action.
      </p>

      {/* Selector of test presets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-6">
        {testImages.map((img, i) => (
          <button
            key={i}
            onClick={() => handleSelectedImage(img.url)}
            className="flex flex-col items-center bg-slate-950/80 hover:bg-purple-950/20 hover:border-purple-500/40 p-2.5 rounded-xl border border-purple-500/10 text-left transition-all active:scale-95 text-xs"
          >
            <span className="font-bold text-slate-200 block text-center w-full">{img.name}</span>
            <span className="text-[10px] text-slate-400 block mt-1 text-center font-mono">{img.descriptionPath}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Screen simulator */}
        <div className="relative aspect-square w-full rounded-2xl bg-slate-950 flex flex-col items-center justify-center border border-purple-500/20 overflow-hidden group">
          {photoUrl ? (
            <>
              <img 
                src={photoUrl} 
                alt="Upload preview" 
                className="w-full h-full object-cover opacity-80"
                referrerPolicy="no-referrer"
              />
              
              {/* Laser scanner animation overlay during calculation */}
              {analyzing && (
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  <motion.div 
                    initial={{ y: 0 }}
                    animate={{ y: '350px' }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
                    className="w-full h-1 bg-gradient-to-r from-transparent via-purple-550 to-transparent shadow-[0_0_12px_rgba(168,85,247,0.8)]"
                    style={{ backgroundColor: '#a855f7' }}
                  />
                  <div className="absolute inset-0 bg-purple-500/10 flex items-center justify-center">
                    <span className="px-3 py-1.5 rounded-full bg-slate-900 border border-purple-500/30 text-xs font-mono text-purple-300 animate-pulse uppercase tracking-wider">
                      Analyse Neurone active ...
                    </span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center p-6 text-slate-400">
              <Camera className="w-12 h-12 mx-auto text-purple-500/30 mb-2 animate-pulse" />
              <p className="text-xs font-medium">Aucune photo sélectionnée</p>
              <p className="text-[10px] text-slate-500 mt-1">Sélectionnez un préréglage ci-dessus pour simuler le téléversement</p>
            </div>
          )}
        </div>

        {/* Results layout */}
        <div className="flex flex-col justify-center">
          {analyzing && (
            <div className="text-center md:text-left space-y-3">
              <div className="h-6 bg-slate-950 w-2/3 rounded animate-pulse" />
              <div className="h-14 bg-slate-950 w-full rounded animate-pulse" />
              <div className="h-8 bg-slate-950 w-3/4 rounded animate-pulse" />
            </div>
          )}

          {!analyzing && moderationResult && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
                moderationResult.approved 
                  ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300' 
                  : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
              }`}>
                {moderationResult.approved ? (
                  <CheckCircle className="w-6 h-6 text-emerald-400 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertOctagon className="w-6 h-6 text-rose-400 mt-0.5 flex-shrink-0" />
                )}
                <div>
                  <h4 className="font-bold text-sm">
                    {moderationResult.approved ? 'Photo Approuvée' : 'Photo Bloquée'}
                  </h4>
                  <p className="text-xs text-slate-300 mt-1">
                    {moderationResult.verdict}
                  </p>
                </div>
              </div>

              {/* Tag badges identified */}
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-purple-400 font-mono">
                  Éléments Détectés :
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {moderationResult.tags.map((tag: string, index: number) => (
                    <span 
                      key={index} 
                      className={`text-[10px] px-2 py-0.5 rounded-full border ${
                        moderationResult.approved 
                          ? 'bg-emerald-950/40 border-emerald-500/20 text-emerald-300' 
                          : 'bg-rose-950/40 border-rose-500/20 text-rose-300'
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Meter details */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-purple-500/5">
                  <span className="text-[10px] text-slate-400 block font-mono">Score Sensuel / Chic</span>
                  <span className="text-lg font-extrabold font-mono text-white block mt-0.5">
                    {moderationResult.classyScore}%
                  </span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-purple-500/5">
                  <span className="text-[10px] text-slate-400 block font-mono">Niveau de Suggestivité</span>
                  <span className={`text-lg font-extrabold font-mono block mt-0.5 ${
                    moderationResult.nsfwScore > 70 ? 'text-rose-400' : 'text-emerald-400'
                  }`}>
                    {moderationResult.nsfwScore}%
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {!analyzing && !moderationResult && (
            <div className="text-center md:text-left text-slate-500 italic text-xs">
              Mettez l'intelligence artificielle à l'épreuve ! Cliquez sur une photo test ci-dessus pour simuler le scanneur de sécurité de notre site.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
