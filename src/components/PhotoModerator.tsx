import React, { useState } from 'react';
import { motion } from 'motion/react';
import { apiClient } from '../utils/apiClient';
import { ShieldCheck, Camera, Sparkles, AlertOctagon, HelpCircle, CheckCircle, Flame, AlertCircle } from 'lucide-react';

export default function PhotoModerator() {
  const [analyzing, setAnalyzing] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');
  const [moderationResult, setModerationResult] = useState<any>(null);
  const [errorString, setErrorString] = useState<string | null>(null);

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
      descriptionPath: 'Exposition suggestive (infraction simulée)'
    }
  ];

  const handleSelectedImage = async (url: string) => {
    setAnalyzing(true);
    setPhotoUrl(url);
    setModerationResult(null);
    setErrorString(null);

    try {
      const result = await apiClient.moderateImage(url);
      setModerationResult(result);
    } catch (err: any) {
      setErrorString(err.message || "Impossible de joindre le service de modération de Liaison AI.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck className="w-5 h-5 text-indigo-400" />
        <h3 className="text-sm font-bold font-sans uppercase tracking-wider text-white">Modérateur d'Images IA</h3>
      </div>
      <p className="text-xs text-slate-400 leading-relaxed mb-4">
        Notre intelligence artificielle filtre instantanément les photos suggestives, vulgaires ou trop dénudées lors du téléversement sur le profil. Testez nos préréglages pour observer le filtre neural en action.
      </p>

      {/* Selector of test presets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
        {testImages.map((img, i) => (
          <button
            key={i}
            onClick={() => handleSelectedImage(img.url)}
            className="flex flex-col items-center bg-slate-950/80 hover:bg-indigo-950/20 hover:border-indigo-500/40 p-2.5 rounded-xl border border-slate-850 text-left transition-all active:scale-95 text-xs text-center w-full"
          >
            <span className="font-bold text-slate-200 block text-center w-full">{img.name}</span>
            <span className="text-[10px] text-slate-500 block mt-1 text-center font-mono">{img.descriptionPath}</span>
          </button>
        ))}
      </div>

      {errorString && (
        <div className="p-3 mb-4 rounded-xl bg-rose-950/20 border border-rose-500/30 text-rose-300 text-xs flex gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorString}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Screen simulator */}
        <div className="relative aspect-square w-full rounded-2xl bg-slate-950 flex flex-col items-center justify-center border border-slate-850 overflow-hidden group">
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
                    animate={{ y: '250px' }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
                    className="w-full h-1 bg-gradient-to-r from-transparent via-indigo-550 to-transparent shadow-[0_0_12px_rgba(99,102,241,0.8)]"
                    style={{ backgroundColor: '#6366f1' }}
                  />
                  <div className="absolute inset-0 bg-indigo-500/10 flex items-center justify-center">
                    <span className="px-3 py-1.5 rounded-full bg-slate-900 border border-indigo-500/30 text-[10px] font-mono text-indigo-300 animate-pulse uppercase tracking-wider">
                      Analyse active ...
                    </span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center p-6 text-slate-400">
              <Camera className="w-10 h-10 mx-auto text-indigo-500/30 mb-2 animate-pulse" />
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
              <div className="h-10 bg-slate-950 w-full rounded animate-pulse" />
              <div className="h-8 bg-slate-950 w-3/4 rounded animate-pulse" />
            </div>
          )}

          {!analyzing && moderationResult && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-3"
            >
              <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
                moderationResult.approved 
                  ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300' 
                  : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
              }`}>
                {moderationResult.approved ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertOctagon className="w-5 h-5 text-rose-400 mt-0.5 flex-shrink-0" />
                )}
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider">
                    {moderationResult.approved ? 'Photo Approuvée' : 'Photo Bloquée'}
                  </h4>
                  <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                    {moderationResult.verdict}
                  </p>
                </div>
              </div>

              {/* Tag badges identified */}
              <div>
                <span className="text-[9px] uppercase tracking-wider font-bold text-indigo-400 font-mono">
                  Éléments Détectés :
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {moderationResult.tags?.map((tag: string, index: number) => (
                    <span 
                      key={index} 
                      className={`text-[9px] px-2 py-0.5 rounded-full border ${
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
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="bg-slate-950 p-2 rounded-xl border border-slate-850">
                  <span className="text-[9px] text-slate-500 block font-mono">Score Sensuel / Chic</span>
                  <span className="text-md font-extrabold font-mono text-white block mt-0.5">
                    {moderationResult.classyScore}%
                  </span>
                </div>
                <div className="bg-slate-950 p-2 rounded-xl border border-slate-850">
                  <span className="text-[9px] text-slate-500 block font-mono">Niveau Suggestif</span>
                  <span className={`text-md font-extrabold font-mono block mt-0.5 ${
                    moderationResult.nsfwScore > 70 ? 'text-rose-400' : 'text-emerald-400'
                  }`}>
                    {moderationResult.nsfwScore}%
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {!analyzing && !moderationResult && (
            <div className="text-center md:text-left text-slate-500 italic text-[11px]">
              Mettez l'intelligence artificielle à l'épreuve ! Cliquez sur une photo test ci-dessus pour simuler le scanneur de sécurité de notre site.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
