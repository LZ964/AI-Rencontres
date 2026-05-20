import { Profile } from './types';

export const INITIAL_PROFILES: Profile[] = [
  {
    id: '1',
    name: 'Sophie',
    age: 29,
    gender: 'Femme',
    location: {
      lat: 45.5088,
      lng: -73.5878,
      neighborhood: 'Plateau Mont-Royal',
      distance: 1.2,
    },
    bio: 'Adore le vin rouge, les conversations tardives, et explorer les limites du désir soft. Libre d’esprit et toujours partante pour une aventure imprévue.',
    interests: ['Vins fins', 'Sensualité', 'Théâtre', 'Liberté d’esprit', 'BDSM Léger'],
    seeking: 'Hommes ou Femmes ouverts d’esprit, sans tabou.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&h=300&q=80',
    compatibilityScore: 92,
    compatibilityReasons: ['Attrait commun pour les vins de garde', 'Intérêt partagé pour l’exploration sensorielle', 'Voisinage direct'],
    isVerified: true,
    moderationStatus: 'approved',
    photos: [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&h=300&q=80',
    ],
  },
  {
    id: '2',
    name: 'Marc & Elodie',
    age: 34,
    gender: 'Couple',
    location: {
      lat: 45.5236,
      lng: -73.5930,
      neighborhood: 'Mile End',
      distance: 2.8,
    },
    bio: 'Couple complice et joueur. Nous recherchons de belles connexions, des moments de partage enrichissants et plus si affinités électives.',
    interests: ['Libertinage', 'Cuisine gastronomique', 'Cures thermales', 'Humour noir', 'Danse'],
    seeking: 'Femmes ou couples ouverts aux expériences uniques.',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&h=300&q=80',
    compatibilityScore: 88,
    compatibilityReasons: ['Goût prononcé pour la bonne cuisine', 'Ouverture d’esprit partagée', 'Activités festives communes'],
    isVerified: true,
    moderationStatus: 'approved',
    photos: [
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&h=300&q=80',
    ],
  },
  {
    id: '3',
    name: 'Julien',
    age: 31,
    gender: 'Homme',
    location: {
      lat: 45.4975,
      lng: -73.5714,
      neighborhood: 'Vieux-Port',
      distance: 3.5,
    },
    bio: 'Amateur de sensations fortes et photographe à ses heures perdues. J’aime l’improvisation totale et le jeu de séduction.',
    interests: ['Photographie', 'Sensualité', 'Voyages secrets', 'Fitness', 'Musique de club'],
    seeking: 'Une femme authentique et audacieuse.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&h=300&q=80',
    compatibilityScore: 74,
    compatibilityReasons: ['Passions artistiques partagées', 'Amour de l’action et du sport'],
    isVerified: true,
    moderationStatus: 'approved',
    photos: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&h=300&q=80',
    ],
  },
  {
    id: '4',
    name: 'Mélissa',
    age: 26,
    gender: 'Femme',
    location: {
      lat: 45.5312,
      lng: -73.6145,
      neighborhood: 'Rosemont',
      distance: 4.1,
    },
    bio: 'Spontanée et passionnée de philosophie existentielle et de soirées interdites. Un soupçon de mystère et beaucoup d’intensité.',
    interests: ['Philosophie', 'BDSM Léger', 'Littérature érotique', 'Cocktails éphémères', 'Yoga'],
    seeking: 'Complices pour des jeux d’esprit et de corps sans pression.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&h=300&q=80',
    compatibilityScore: 97,
    compatibilityReasons: ['Attraction philosophique', 'Pratiques communes', 'Lecture et littérature'],
    isVerified: true,
    moderationStatus: 'approved',
    photos: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&h=300&q=80',
    ],
  },
  {
    id: '5',
    name: 'Thomas',
    age: 35,
    gender: 'Homme',
    location: {
      lat: 45.5152,
      lng: -73.5622,
      neighborhood: 'Quartier Latin',
      distance: 1.9,
    },
    bio: 'Un gentleman moderne qui sait ce qu’il veut. Une touche d’humour décalé, d’élégance intellectuelle et une curiosité sans limites.',
    interests: ['Design', 'Humour noir', 'Vins fins', 'Expositions', 'Sensualité'],
    seeking: 'Rencontres éphémères ou complices régulières.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&h=300&q=80',
    compatibilityScore: 82,
    compatibilityReasons: ['Appréciation pour l’élégance et le design', 'Humour noir partagé'],
    isVerified: false,
    moderationStatus: 'approved',
    photos: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&h=300&q=80',
    ],
  },
  {
    id: '6',
    name: 'Chloé',
    age: 30,
    gender: 'Femme',
    location: {
      lat: 45.4832,
      lng: -73.5790,
      neighborhood: 'Griffintown',
      distance: 5.3,
    },
    bio: 'Passionnée de cocktails moléculaires, de rituels zen et d’expériences d’adultes secrètes. Rejoignez-moi dans mon univers hypnotique.',
    interests: ['Cocktails éphémères', 'Danse', 'Liberté d’esprit', 'BDSM Léger', 'Cures thermales'],
    seeking: 'Hommes ou couples pour explorer le sensuel et l’interdit.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&h=300&q=80',
    compatibilityScore: 90,
    compatibilityReasons: ['Recherche l’interdit', 'Goût marqué pour la relaxation thermale', 'Cockteils moléculaires'],
    isVerified: true,
    moderationStatus: 'approved',
    photos: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&h=300&q=80',
    ],
  }
];

export const MOCK_CHATS: { [profileId: string]: string[] } = {
  '1': [
    "Bonjour ! Ton profil m'interpelle beaucoup. Es-tu plutôt vin rouge ou cocktail audacieux ?",
    "J'aime beaucoup ton ouverture d'esprit. On devrait s'agencer une rencontre de discussion !"
  ],
  '2': [
    "Hello ! Nous aimons beaucoup l'énergie qui se dégage de ton profil. Intéressé(e) par un verre au Mile-End bientôt ?",
  ],
  '4': [
    "La philosophie sans la sensualité n'est que pure théorie abstraite... Ne penses-tu pas ?"
  ]
};
