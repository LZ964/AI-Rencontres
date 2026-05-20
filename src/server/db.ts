import { Profile, ChatMessage } from '../types';
import { INITIAL_PROFILES } from '../data';

export interface UserAccount {
  id: string;
  email: string;
  passwordHash?: string;
  name: string;
  avatar: string;
  gender: 'Gay' | 'Bisexuel' | 'Bi-curieux' | 'Couple MM';
  interests: string[];
  bio: string;
  seeking: string;
  location: {
    lat: number;
    lng: number;
    neighborhood: string;
    distance: number;
  };
  age?: number;
  hasCompletedWizard?: boolean;
  relationshipStatus?: 'Célibataire' | 'En couple' | 'Relation libre';
  partnerId?: string | null;
  partnerName?: string | null;
}

export interface Session {
  token: string;
  userId: string;
  createdAt: Date;
}

export interface TicketMessage {
  sender: 'user' | 'agent' | 'employee';
  text: string;
  timestamp: Date;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userEmail: string;
  title: string;
  status: 'open' | 'resolved' | 'escalated';
  messages: TicketMessage[];
  createdAt: Date;
  updatedAt: Date;
  escalatedEmailSent?: boolean;
  escalationDetails?: string;
}

export interface SystemLog {
  id: string;
  timestamp: Date;
  userId?: string;
  userEmail?: string;
  action: string;
  details: string;
}

export interface ApiKeyConfig {
  id: string;
  userId: string;
  developerName: string;
  key: string;
  websiteUrl: string;
  permissions: {
    readProfiles: boolean;
    writeProfiles: boolean;
    getSuggestions: boolean;
    deleteProfiles: boolean;
  };
  createdAt: Date;
  status: 'active' | 'revoked';
}

export interface DeveloperApproval {
  userId: string;
  userEmail: string;
  developerName: string;
  websiteUrl: string;
  useCase: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: Date;
  decisionDate?: Date;
}

// In-Memory dynamic DB
class Database {
  users: Map<string, UserAccount> = new Map();
  sessions: Map<string, Session> = new Map();
  profiles: Map<string, Profile> = new Map();
  chats: Map<string, ChatMessage[]> = new Map();
  tickets: Map<string, SupportTicket> = new Map();
  apiKeys: Map<string, ApiKeyConfig> = new Map();
  devApprovals: Map<string, DeveloperApproval> = new Map();
  logs: SystemLog[] = [];

  constructor() {
    this.reset();
  }

  logAction(userId: string | undefined, userEmail: string | undefined, action: string, details: string) {
    const logItem: SystemLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date(),
      userId,
      userEmail,
      action,
      details
    };
    this.logs.unshift(logItem); // New logs at front
  }

  reset() {
    this.users.clear();
    this.sessions.clear();
    this.profiles.clear();
    this.chats.clear();
    this.tickets.clear();
    this.apiKeys.clear();
    this.devApprovals.clear();
    this.logs = [];

    // Seed developer approval state for user-carl
    this.devApprovals.set('user-carl', {
      userId: 'user-carl',
      userEmail: 'carlgodrolt@gmail.com',
      developerName: 'Carl @ Liaison Dev',
      websiteUrl: 'https://carlgodrolt.github.io/liaison-app',
      useCase: 'Intégration d\'une carte de quartier de rencontres Gay et Bi fétiches pour notre site partenaire.',
      status: 'approved',
      requestDate: new Date(),
      decisionDate: new Date()
    });

    // Seed default API key linked to user-carl
    this.apiKeys.set('liaison-partner-key-2026', {
      id: 'key-default',
      userId: 'user-carl',
      developerName: 'Carl @ Liaison Dev',
      key: 'liaison-partner-key-2026',
      websiteUrl: 'https://carlgodrolt.github.io/liaison-app',
      permissions: {
        readProfiles: true,
        writeProfiles: true,
        getSuggestions: true,
        deleteProfiles: true
      },
      createdAt: new Date(),
      status: 'active'
    });

    // Populate initial demo profiles from initial matching rules
    INITIAL_PROFILES.forEach(profile => {
      this.profiles.set(profile.id, { ...profile });
    });

    // Populate default user account (Carl is a bisexual/bi-curious explorer)
    this.users.set('user-carl', {
      id: 'user-carl',
      email: 'carlgodrolt@gmail.com',
      name: 'Carl',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&h=300&q=80',
      gender: 'Bisexuel',
      interests: ['Shibari & Cordes', 'BDSM chic', 'Vins de garde', 'Art contemporain', 'Romance stable'],
      bio: 'Créateur graphique, adodore le vin rouge, faire de la photo d\'art fétiche, et explorer l\'érotisme masculin kinky tout en cherchant une vraie complicité à deux.',
      seeking: 'Un mec ou couple inspiré, de bel esprit, pour moments hors normes et relation stable.',
      location: {
        lat: 45.5088,
        lng: -73.5878,
        neighborhood: 'Plateau Mont-Royal',
        distance: 0
      }
    });

    // Log seed activation
    this.logAction(
      'system',
      'system@liaison.ai',
      'SYSTEM_STARTUP',
      'Initialisation de la base de données démo Liaison AI Béta 35.'
    );
  }
}

export const db = new Database();
