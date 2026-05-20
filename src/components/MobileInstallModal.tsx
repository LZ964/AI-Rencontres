import React from 'react';
import { motion } from 'motion/react';
import { 
  Smartphone, 
  Download, 
  HelpCircle, 
  CheckCircle, 
  Apple, 
  Play, 
  Compass, 
  Share 
} from 'lucide-react';

interface MobileInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileInstallModal({ isOpen, onClose }: MobileInstallModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
      {/* Background neon glows */}
      <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div 
        id="mobile-install-modal-card"
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-[#110c2e] border-2 border-pink-500 ring-4 ring-pink-500/15 rounded-3xl p-6 shadow-[0_0_50px_rgba(236,72,153,0.35)] relative overflow-hidden text-slate-100 z-10"
      >
        {/* Top vibrant pride ribbon */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 via-orange-500 via-yellow-400 via-green-500 via-blue-500 to-purple-600" />

        {/* Header */}
        <div className="flex items-start justify-between mb-5 border-b border-pink-500/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center shadow-[0_0_12px_rgba(236,72,153,0.4)]">
              <Smartphone className="w-5 h-5 text-white animate-bounce" style={{ animationDuration: '4s' }} />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider font-mono">
                INSTALLATION DE L'APP MOBILE
              </h3>
              <p className="text-[10px] text-pink-300 uppercase tracking-widest font-mono font-bold">
                Android (APK) & Apple iOS
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-xs px-3 py-1 bg-slate-950 text-slate-400 hover:text-white border border-slate-800 rounded-xl hover:bg-slate-900 transition-all cursor-pointer"
          >
            ✕ Fermer
          </button>
        </div>

        {/* Main Content */}
        <div className="space-y-4 text-xs leading-relaxed font-sans">
          <p className="text-slate-350">
            Liaison AI utilise la technologie moderne des <strong className="text-white">Progressive Web Apps (PWA)</strong>. Elle fonctionne comme une application native autonome (sans barre de navigateur URL et avec un accès tactile direct), tout en protégeant hermétiquement vos préférences privées.
          </p>

          <div className="p-3 bg-pink-950/20 border border-pink-500/20 rounded-2xl flex items-start gap-2 text-[11px] text-pink-200">
            <CheckCircle className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
            <span>
              <strong>Zéro téléchargement invasif d'APK non certifié :</strong> Notre standard PWA est certifié conforme par Google & Apple et respecte la confidentialité de votre appareil mobile.
            </span>
          </div>

          <div className="space-y-3.5 pt-1.5">
            {/* iOS installation */}
            <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-850 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white border-b border-slate-800 pb-1.5">
                <Apple className="w-4 h-4 text-slate-100" />
                <span>Installer sur Apple iOS (iPhone & iPad)</span>
              </div>
              <ol className="list-decimal pl-4.5 space-y-1.5 text-slate-400 font-mono text-[10.5px]">
                <li>Ouvrez ce site portail sur le navigateur <strong className="text-white">Safari</strong> de votre iPhone.</li>
                <li>Appuyez sur l'icône de <strong className="text-pink-300">Partage</strong> <Share className="w-3.5 h-3.5 inline text-indigo-400 mx-0.5" />.</li>
                <li>Faites défiler vers le bas et sélectionnez <strong className="text-white flex items-center gap-1 mt-0.5"><Download className="w-3.5 h-3.5 text-pink-400 inline" /> Sur l&apos;écran d&apos;accueil</strong>.</li>
                <li>L'icône Liaison AI s'ajoute à vos applications !</li>
              </ol>
            </div>

            {/* Android installation */}
            <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-850 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white border-b border-slate-800 pb-1.5">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Installer sur Android (Samsung, Pixel...)</span>
              </div>
              <ol className="list-decimal pl-4.5 space-y-1.5 text-slate-400 font-mono text-[10.5px]">
                <li>Ouvrez ce site portail sur le navigateur <strong className="text-white">Google Chrome</strong> de votre appareil.</li>
                <li>Appuyez sur l'icône de menu (les <strong className="text-white">3 points</strong>) en haut à droite.</li>
                <li>Sélectionnez l'option <strong className="text-pink-300">Installer l'application</strong> ou <strong className="text-white">Ajouter à l'écran d'accueil</strong>.</li>
                <li>Confirmez l'installation. C'est prêt !</li>
              </ol>
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-850/65 text-[10px] text-slate-500 font-mono leading-normal">
            💻 <strong className="text-slate-400">Note aux ingénieurs :</strong> Ce portail intègre un manifest et un Service Worker d'indexation d'actifs. En production commerciale, ce même bundle web est compilable en conteneur hybride Android/iOS via Apache Cordova ou Capacitor en moins de 10 minutes.
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-850 mt-5 pt-3 text-center">
          <button 
            type="button"
            onClick={onClose}
            className="w-full py-2 bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs active:scale-95 transition-all cursor-pointer shadow-lg"
          >
            J'ai compris
          </button>
        </div>
      </motion.div>
    </div>
  );
}
