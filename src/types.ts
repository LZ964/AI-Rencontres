export interface Profile {
  id: string;
  name: string;
  age: number;
  gender: 'Gay' | 'Bisexuel' | 'Bi-curieux' | 'Couple MM';
  location: {
    lat: number; // offset values for custom map
    lng: number;
    neighborhood: string;
    distance: number; // in km
  };
  bio: string;
  interests: string[];
  seeking: string;
  avatar: string;
  compatibilityScore: number;
  compatibilityReasons: string[];
  isVerified: boolean;
  moderationStatus: 'approved' | 'rejected' | 'pending';
  photos: string[];
  isDemo?: boolean;
  extendedNetworkOptIn?: boolean;
  relationshipStatus?: string;
  partnerId?: string;
  partnerName?: string;
}

export interface ChatMessage {
  id: string;
  senderId: 'user' | string;
  text: string;
  timestamp: Date;
}

export interface UserPreferences {
  genderFocus: ('Gay' | 'Bisexuel' | 'Bi-curieux' | 'Couple MM')[];
  minAge: number;
  maxAge: number;
  maxDistance: number;
  aiPrompt: string;
}
