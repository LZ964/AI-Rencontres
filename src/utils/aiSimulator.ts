import { Profile, UserPreferences } from '../types';

/**
 * Simulates a server-side AI parsing of preferences or queries to match profiles dynamically.
 * It also handles dynamic bubble calculation.
 */
export function simulateAIMatchmaking(
  profiles: Profile[],
  userPrompt: string,
  userPrefs: UserPreferences
): { matchedProfiles: Profile[]; aiAnalysisMessage: string } {
  const promptLower = userPrompt.toLowerCase().trim();
  
  if (!promptLower) {
    // Return sorted by current score
    const processed = profiles.map(p => {
      // Filter based on gender preferences
      const genderMatch = userPrefs.genderFocus.includes(p.gender);
      const ageMatch = p.age >= userPrefs.minAge && p.age <= userPrefs.maxAge;
      const distMatch = p.location.distance <= userPrefs.maxDistance;
      
      let modifier = 0;
      if (!genderMatch) modifier -= 40;
      if (!ageMatch) modifier -= 20;
      if (!distMatch) modifier -= 15;

      return {
        ...p,
        compatibilityScore: Math.max(10, Math.min(99, p.compatibilityScore + modifier))
      };
    });
    
    return {
      matchedProfiles: processed.sort((a, b) => b.compatibilityScore - a.compatibilityScore),
      aiAnalysisMessage: "L'IA analyse vos filtres standards pour calibrer la carte de votre quartier."
    };
  }

  // AI Orchestrated semantic analysis simulation
  let explanation = "L'IA a interprété votre demande naturelle : ";
  const matched = profiles.map(p => {
    let scoreBoost = 0;
    const reasons: string[] = [];

    // Analyze keywords in the profile and link to prompt
    if (promptLower.includes('libertin') && (p.interests.includes('Libertinage') || p.interests.includes('BDSM Léger') || p.bio.toLowerCase().includes('libre'))) {
      scoreBoost += 25;
      reasons.push("Alignement parfait avec vos désirs d'exploration libertine");
    }
    
    if ((promptLower.includes('tranquille') || promptLower.includes('doux') || promptLower.includes('calme') || promptLower.includes('soft')) && 
        (p.interests.includes('Cures thermales') || p.interests.includes('Yoga') || p.interests.includes('Théâtre') || p.bio.toLowerCase().includes('sans pression'))) {
      scoreBoost += 20;
      reasons.push("Recherche conjointe de plaisirs calmes, de sensorialité douce ou d'esprit zen");
    }

    if ((promptLower.includes('vin') || promptLower.includes('manger') || promptLower.includes('cuisine') || promptLower.includes('gastronomie')) && 
        (p.interests.includes('Vins fins') || p.interests.includes('Cuisine gastronomique') || p.interests.includes('Cocktails éphémères'))) {
      scoreBoost += 30;
      reasons.push("Affinité gastronomique d’épicuriens partagée (vins fins, cocktails ou cuisine)");
    }

    if ((promptLower.includes('intellective') || promptLower.includes('esprit') || promptLower.includes('culture') || promptLower.includes('philosoph')) && 
        (p.interests.includes('Philosophie') || p.interests.includes('Théâtre') || p.interests.includes('Design') || p.interests.includes('Littérature érotique'))) {
      scoreBoost += 25;
      reasons.push("Liaison cérébrale & philosophique de haut niveau détectée par l'IA");
    }

    if ((promptLower.includes('proche') || promptLower.includes('voisin') || promptLower.includes('rapide')) && p.location.distance < 3) {
      scoreBoost += 15;
      reasons.push(`Idéal pour un rendez-vous rapide (situé(e) à seulement ${p.location.distance}km)`);
    }

    // Default matching base
    const baseScore = p.compatibilityScore;
    const finalScore = Math.max(30, Math.min(99, baseScore + scoreBoost));

    return {
      ...p,
      compatibilityScore: finalScore,
      compatibilityReasons: reasons.length > 0 ? reasons : p.compatibilityReasons
    };
  });

  // Sort by scores
  const sorted = matched.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  
  if (promptLower.includes('libertin')) {
    explanation += "Recherche de partenaires ayant un profil orienté libertinage ou BDSM doux.";
  } else if (promptLower.includes('vin') || promptLower.includes('cuisine')) {
    explanation += "Focalisation sur le partage de plaisirs épicuriens et la gastronomie fine.";
  } else if (promptLower.includes('philosoph') || promptLower.includes('esprit')) {
    explanation += "Combinaison de connexions intellectuelles, conversations littéraires et d'érotisme de l'esprit.";
  } else {
    explanation += `Recherche de mot-clé général "${userPrompt}". Affinement de la géolocalisation et des traits communs.`;
  }

  return {
    matchedProfiles: sorted,
    aiAnalysisMessage: explanation
  };
}

/**
 * Simulates real-time AI image moderation and profile inspection logic.
 * Returns analysis results and tells the user whether the image is approved.
 */
export function simulateImageModeration(
  imageSrc: string
): { 
  approved: boolean; 
  nsfwScore: number; // 0 to 100
  classyScore: number; // 0 to 100
  tags: string[]; 
  verdict: string;
} {
  // Let's analyze based on synthetic attributes to simulate the exact neural response
  const isOsee = imageSrc.includes('osee') || Math.random() > 0.65;
  const nsfwRandom = isOsee ? Math.floor(Math.random() * 30) + 70 : Math.floor(Math.random() * 35);
  const classyRandom = Math.floor(Math.random() * 40) + 50;

  const tags = isOsee 
    ? ['Lingerie osée', 'Exposition cutanée élevée', 'Sensuel poussé'] 
    : ['Portrait d’art', 'Visage dégagé', 'Vêtement chic', 'Esthétique épurée'];

  const approved = nsfwRandom < 75; // Refuse if too bold (matches user request to avoid "les photos trop osées")
  
  const verdict = approved 
    ? "Photo approuvée automatiquement par le modérateur IA. L'élégance artistique respecte nos standards." 
    : "Photo refusée. Exposition corporelle trop suggestive détectée. Liaison AI encourage la sensualité chic, pas l'explicite brut.";

  return {
    approved,
    nsfwScore: nsfwRandom,
    classyScore: classyRandom,
    tags,
    verdict
  };
}
