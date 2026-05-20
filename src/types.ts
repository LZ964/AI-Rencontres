export interface Profile {
  id: string;
  name: string;
  age: number;
  gender: 'Homme' | 'Femme' | 'Autre' | 'Couple';
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
}

export interface ChatMessage {
  id: string;
  senderId: 'user' | string;
  text: string;
  timestamp: Date;
}

export interface UserPreferences {
  genderFocus: ('Homme' | 'Femme' | 'Autre' | 'Couple')[];
  minAge: number;
  maxAge: number;
  maxDistance: number;
  aiPrompt: string;
}
