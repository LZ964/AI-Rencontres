import { Profile } from './types';

export const INITIAL_PROFILES: Profile[] = [
  {
    id: '1',
    name: 'Sébastien',
    age: 34,
    gender: 'Gay',
    location: {
      lat: 45.5088,
      lng: -73.5878,
      neighborhood: 'Plateau Mont-Royal',
      distance: 1.2,
    },
    bio: "Créateur de mobilier d'art, esthète et adepte de relations intenses et kinky (domination douce, cuir, rituels sensoriels). Au-delà des soirées fétiches, je privilégie le respect, la communication saine et je recherche un compagnon de route dans l'espoir de bâtir une relation sérieuse et solide sur le long terme.",
    interests: ['Domination douce', 'BDSM chic', 'Vins de garde', 'Art contemporain', 'Cuir esthétique', 'Romance stable'],
    seeking: "Un homme éveillé, prêt à marier intensité charnelle et vraie complicité amoureuse durable ou projet de couple.",
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&h=300&q=80',
    compatibilityScore: 92,
    compatibilityReasons: ['Attrait commun pour l’esthétique noir/cuir', 'Intérêt partagé pour l’érotisme de classe', 'Voisinage direct'],
    isVerified: true,
    moderationStatus: 'approved',
    photos: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&h=300&q=80',
    ],
    isDemo: true,
    extendedNetworkOptIn: true,
    relationshipStatus: 'Célibataire'
  },
  {
    id: '2',
    name: 'Gabriel',
    age: 27,
    gender: 'Bi-curieux',
    location: {
      lat: 45.5236,
      lng: -73.5930,
      neighborhood: 'Mile End',
      distance: 2.8,
    },
    bio: "Consultant en tech, sportif et curieux d'explorer mes désirs inavoués avec d'autres hommes. Je m'intéresse au Shibari élégant et aux massages de pleine conscience. Je cherche d'abord la douceur et la complicité, avec l'esprit ouvert pour une amitié amoureuse durable si l'alchimie opère.",
    interests: ['Exploration sensorielle', 'Shibari & Cordes', 'Fitness & Trail', 'Cures thermales', 'Conversation profonde', 'Relation durable'],
    seeking: "Un guide masculin bienveillant et cultivé pour moments torrides et une idylle sincère.",
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&h=300&q=80',
    compatibilityScore: 88,
    compatibilityReasons: ['Partage l’attrait pour le Shibari esthétique', 'Recherche ouverte de connexion romantique', 'Goût commun pour le bien-être thermal'],
    isVerified: true,
    moderationStatus: 'approved',
    photos: [
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&h=300&q=80',
    ],
    isDemo: true,
    extendedNetworkOptIn: true,
    relationshipStatus: 'Relation libre'
  },
  {
    id: '3',
    name: 'Alexandre & Kevin',
    age: 38,
    gender: 'Couple MM',
    location: {
      lat: 45.4975,
      lng: -73.5714,
      neighborhood: 'Vieux-Port',
      distance: 3.5,
    },
    bio: "Couple d'esprits libres, complices depuis 8 ans et très joueurs (fétichisme puppy play, rituels d'impact modéré). Épicuriens accomplis, nous cuisinons beaucoup et aimons le design. Nous recherchons un partenaire de confiance ou un troisième homme régulier pour s'intégrer durablement à notre univers affectif.",
    interests: ['Puppy Play', 'Échangisme MM', 'Gastronomie', 'Voyages secrets', 'Amour pluriel', 'Projet de vie'],
    seeking: "Un homme célibataire ou bisexuel de confiance pour moments intimes hors norme et complicité durable.",
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&h=300&q=80',
    compatibilityScore: 78,
    compatibilityReasons: ['Amateurs de haute gastronomie', 'Recherche de stabilité émotionnelle', 'Intérêt commun pour le kinky chic'],
    isVerified: true,
    moderationStatus: 'approved',
    photos: [
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&h=300&q=80',
    ],
    isDemo: true,
    extendedNetworkOptIn: false,
    relationshipStatus: 'En couple',
    partnerName: 'Sébastien'
  },
  {
    id: '4',
    name: 'Nicolas',
    age: 42,
    gender: 'Gay',
    location: {
      lat: 45.5312,
      lng: -73.6145,
      neighborhood: 'Rosemont',
      distance: 4.1,
    },
    bio: "Écrivain et critique de cinéma, amateur de littérature érotique et de soumission sensuelle fine. Je chéris l'érotisme cérébral, les masques de soie et les murmures. Je cherche un homme mûr avec qui fonder un projet de vie authentique, marier la fidélité de l'âme et la liberté de nos jeux secrets.",
    interests: ['Lectures érotiques', 'Soumission délicate', 'Philosophie', 'Théâtre & Opéra', 'Projet de vie exclusive', 'Relation stable'],
    seeking: "Un compagnon de route érudit, dominant ou protecteur, partageant l'amour de l'esprit et des mots.",
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&h=300&q=80',
    compatibilityScore: 97,
    compatibilityReasons: ['Attraction philosophique et littéraire', 'Intellectualisation du désir', 'Quête d’exclusivité'],
    isVerified: true,
    moderationStatus: 'approved',
    photos: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&h=300&q=80',
    ],
    isDemo: true,
    extendedNetworkOptIn: true,
    relationshipStatus: 'Célibataire'
  },
  {
    id: '5',
    name: 'Maxime',
    age: 25,
    gender: 'Bisexuel',
    location: {
      lat: 45.5152,
      lng: -73.5622,
      neighborhood: 'Quartier Latin',
      distance: 1.9,
    },
    bio: "Barman de nuit, adepte de techno sombre et de tenues fétiches en latex ou cuir. Un vrai fêtard d'apparence mais avec un cœur d'or romantique. Je recherche un partenaire pour partager mes rituels de nuit, mais j'accorde une importance ultime aux sentiments. Prêt à m'installer à deux et à vivre le grand amour.",
    interests: ['Fétiche Latex', 'Soirées Techno', 'Jeux de rôles', 'Rooftops', 'Romance loyale', 'Relation à long terme'],
    seeking: "Un homme authentique et assumé pour des nuits folles et des matins câlins pleins de tendresse durable.",
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&h=300&q=80',
    compatibilityScore: 82,
    compatibilityReasons: ['Amour commun pour les pulsations électroniques nocturnes', 'Curiosité sensorielle mutuelle', 'Envie de relations sincères'],
    isVerified: false,
    moderationStatus: 'approved',
    photos: [
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&h=300&q=80',
    ],
    isDemo: true,
    extendedNetworkOptIn: true,
  },
  {
    id: '6',
    name: 'Dorian',
    age: 31,
    gender: 'Gay',
    location: {
      lat: 45.4832,
      lng: -73.5790,
      neighborhood: 'Griffintown',
      distance: 5.3,
    },
    bio: "Designer d'intérieur, esthète zen et mystérieux. Je pratique l'impact play et le fétichisme de la cire chaude dans une éthique de consentement absolue. J'accorde une place primordiale à l'écoute et l'intimité d'abord. J'espère sincèrement rencontrer l'homme avec qui me stabiliser pour une vie à deux harmonieuse.",
    interests: ['Cire chaude & Impact', 'Design intérieur', 'Consentement sain', 'Cures thermales', 'Relation stable exclusive', 'Méditation'],
    seeking: "Un partenaire soumis ou curieux d'apprendre, prêt à investir son cœur et son esprit dans un duo fusionnel solide.",
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=300&h=300&q=80',
    compatibilityScore: 90,
    compatibilityReasons: ['Sensibilité esthétique commune', 'Pratique saine et sécurisée de la cire', 'Désir d’idylle durable'],
    isVerified: true,
    moderationStatus: 'approved',
    photos: [
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=300&h=300&q=80',
    ],
    isDemo: true,
    extendedNetworkOptIn: false,
  }
];

export const MOCK_CHATS: { [profileId: string]: string[] } = {
  '1': [
    "Salut mec ! Ton profil m'interpelle beaucoup. Es-tu plutôt d'esprit cuir fétiche ou préfères-tu un verre tranquille en parlant d'art ?",
    "J'adore ton ouverture d'esprit. On devrait s'agencer une vraie rencontre !"
  ],
  '2': [
    "Hello ! J'aime beaucoup l'énergie et la sensibilité de ton profil. Prêt à s'initier ensemble aux tressages complexes en prenant notre temps ?",
  ],
  '4': [
    "La philosophie sans la sensualité sauvage n'est que pure abstraction théorique... Qu'en dis-tu ?"
  ]
};
