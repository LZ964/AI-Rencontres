import { Profile, ChatMessage } from '../types';

const BASE_URL = '/api';

class ApiClient {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('liaison_ai_token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async login(email: string, passwordString: string) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: passwordString }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Échec de l'authentification.");
    }
    localStorage.setItem('liaison_ai_token', data.token);
    return data;
  }

  async googleLogin(email: string, name: string, avatar: string) {
    const res = await fetch(`${BASE_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, avatar }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Échec de la connexion via Google.");
    }
    localStorage.setItem('liaison_ai_token', data.token);
    return data;
  }

  logout() {
    localStorage.removeItem('liaison_ai_token');
  }

  async getProfiles(userPrompt: string, genderFocus: string[], maxDistance: number) {
    const res = await fetch(`${BASE_URL}/profiles`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ userPrompt, genderFocus, maxDistance }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Erreur de chargement des profils via l'IA.");
    }
    return data; // returns { matchedProfiles: Profile[], aiAnalysisMessage: string }
  }

  async moderateImage(imageUrl: string) {
    const res = await fetch(`${BASE_URL}/moderate-image`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ imageUrl }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Erreur lors de l'analyse de l'image.");
    }
    return data; // returns { approved: boolean, verdict: string, tags: string[], nsfwScore: number, classyScore: number }
  }

  async getMessages(profileId: string) {
    const res = await fetch(`${BASE_URL}/chats/${profileId}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Erreur lors de la récupération du tchat.");
    }
    return data.messages as ChatMessage[];
  }

  async sendMessage(profileId: string, text: string) {
    const res = await fetch(`${BASE_URL}/chats/${profileId}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Impossible d'envoyer le message.");
    }
    return data; // returns { messages, userMessage, replyMessage }
  }
}

export const apiClient = new ApiClient();
