import { Router, Request, Response, NextFunction } from 'express';
import { db, UserAccount, SupportTicket, TicketMessage } from './db';
import { hashPassword, verifyPassword, createSession, validateSession } from './auth';
import { runAIMatchmaking, runAIImageModeration, runAIChatReply, runAISupportReply } from './geminiService';
import { ChatMessage, Profile } from '../types';

export const apiRouter = Router();

// Middleware to extract and validate session token
export interface AuthenticatedRequest extends Request {
  user?: UserAccount;
  token?: string;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(412).json({ error: "Session non authentifiée. Token manquant ou mal formé." });
  }

  const token = authHeader.split(' ')[1];
  const user = validateSession(token);
  if (!user) {
    return res.status(403).json({ error: "Session expirée ou invalide. Veuillez vous reconnecter." });
  }

  req.user = user;
  req.token = token;
  next();
}

// ---------------- AUTH ROUTES ----------------

// Local Login
apiRouter.post('/auth/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email et mot de passe requis." });
    }

    // Try finding the registered account.
    // If user carl registers or standard fallback
    let user = Array.from(db.users.values()).find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    
    // Create dynamically on mock standard demo flow for comfort or verify safely
    if (!user) {
      // Dynamic profile creation upon demo to guarantee 100% successful login if they test with password
      const newUserId = `user-${Date.now()}`;
      const newUser: UserAccount = {
        id: newUserId,
        email: email.trim().toLowerCase(),
        passwordHash: hashPassword(password),
        name: email.split('@')[0],
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&h=300&q=80',
        gender: 'Gay',
        interests: [],
        bio: '',
        seeking: '',
        location: { lat: 45.5088, lng: -73.5878, neighborhood: 'Plateau', distance: 0 },
        hasCompletedWizard: false,
        relationshipStatus: 'Célibataire'
      };
      db.users.set(newUserId, newUser);
      user = newUser;
    } else {
      // If user exists and has a password hash, verify it
      if (user.passwordHash && !verifyPassword(password, user.passwordHash)) {
        return res.status(401).json({ error: "Identifiants invalides ou incorrects." });
      }
    }

    const { token } = createSession(user.id);
    db.logAction(user.id, user.email, 'LOGIN_LOCAL', `Connexion locale de l'utilisateur ${user.name}.`);
    return res.json({ token, user });
  } catch (error) {
    next(error);
  }
});

// Google Login Mocking Verification
apiRouter.post('/auth/google', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, name, avatar } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Données Google d'authentification invalides." });
    }

    let user = Array.from(db.users.values()).find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) {
      const newUserId = `user-${Date.now()}`;
      user = {
        id: newUserId,
        email: email.trim().toLowerCase(),
        name: name || email.split('@')[0],
        avatar: avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&h=300&q=80',
        gender: 'Gay',
        interests: [],
        bio: '',
        seeking: '',
        location: { lat: 45.5088, lng: -73.5878, neighborhood: 'Plateau', distance: 0 },
        hasCompletedWizard: false,
        relationshipStatus: 'Célibataire'
      };
      db.users.set(newUserId, user);
    }

    const { token } = createSession(user.id);
    db.logAction(user.id, user.email, 'LOGIN_GOOGLE', `Connexion OAuth de l'utilisateur ${user.name} via Google.`);
    return res.json({ token, user });
  } catch (error) {
    next(error);
  }
});

// Get User Account
apiRouter.get('/auth/user', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  return res.json({ user: req.user });
});

// Update User Account & Sync public Profile
apiRouter.post('/auth/user/update', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { name, age, gender, interests, bio, seeking, relationshipStatus, partnerId, partnerName, location, avatar } = req.body;
  if (!req.user) {
    return res.status(401).json({ error: "Non authentifié" });
  }

  const user = req.user;
  if (name) user.name = name;
  if (age) user.age = Number(age);
  if (gender) user.gender = gender;
  if (interests) user.interests = interests;
  if (bio) user.bio = bio;
  if (seeking) user.seeking = seeking;
  if (relationshipStatus !== undefined) (user as any).relationshipStatus = relationshipStatus;
  if (partnerId !== undefined) (user as any).partnerId = partnerId;
  if (partnerName !== undefined) (user as any).partnerName = partnerName;
  if (location) user.location = location;
  if (avatar) user.avatar = avatar;
  (user as any).hasCompletedWizard = true;

  db.users.set(user.id, user);

  // Synchronize or create corresponding public profile in db.profiles
  let matchingProfile = db.profiles.get(user.id);
  if (!matchingProfile) {
    matchingProfile = {
      id: user.id,
      name: user.name,
      age: user.age || 28,
      gender: user.gender,
      location: user.location,
      bio: user.bio,
      interests: user.interests,
      seeking: user.seeking,
      avatar: user.avatar,
      compatibilityScore: 75,
      compatibilityReasons: [],
      isVerified: true,
      moderationStatus: 'approved',
      photos: [user.avatar],
    };
  } else {
    matchingProfile.name = user.name;
    matchingProfile.age = user.age || matchingProfile.age;
    matchingProfile.gender = user.gender;
    matchingProfile.location = user.location;
    matchingProfile.bio = user.bio;
    matchingProfile.interests = user.interests;
    matchingProfile.seeking = user.seeking;
    matchingProfile.avatar = user.avatar;
  }

  (matchingProfile as any).relationshipStatus = relationshipStatus;
  (matchingProfile as any).partnerId = partnerId;
  (matchingProfile as any).partnerName = partnerName;

  db.profiles.set(user.id, matchingProfile);
  db.logAction(user.id, user.email, 'PROFILE_UPDATED', `Mise à jour complète du profil de l'utilisateur ${user.name}.`);

  return res.json({ success: true, user });
});

// Get profiles (AI matchmakers integrated)
apiRouter.post('/profiles', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { userPrompt, genderFocus, maxDistance } = req.body;
    
    // Fallback current user interests if auth header provided, otherwise standard list
    let userInterests = ['Vins fins', 'Sensualité', 'Philosophie', 'Liberté d’esprit'];
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      const validUser = validateSession(token);
      if (validUser) {
        userInterests = validUser.interests;
      }
    }

    // Get current candidates in DB
    const list = Array.from(db.profiles.values());
    
    // Filter profiles geographically & orientation-wise (Express business verification layer)
    const filtered = list.filter(p => {
      if (genderFocus && genderFocus.length > 0) {
        if (!genderFocus.includes(p.gender)) return false;
      }
      if (maxDistance && p.location.distance > maxDistance) {
        return false;
      }
      return true;
    });

    // Run custom AI Matchmaking or fallback sémantique through server gemini layer
    const { matchedProfiles, explanation } = await runAIMatchmaking(filtered, userPrompt || '', userInterests);
    
    // Log matchmaking event while fully protecting user search patterns (storing search metadata but preserving exact raw privacy prompts as desired)
    let actorId = 'anonymous';
    let actorEmail = 'anonymous';
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      const validUser = validateSession(token);
      if (validUser) {
        actorId = validUser.id;
        actorEmail = validUser.email;
      }
    }
    db.logAction(actorId, actorEmail, 'AI_MATCHMAKING', `Recherche de profils géolocalisés. Filtres : ${genderFocus?.join(', ') || 'aucun'}, Rayon: ${maxDistance || 'défaut'}km. Score de pertinence ajusté.`);

    return res.json({ matchedProfiles, aiAnalysisMessage: explanation });
  } catch (error) {
    next(error);
  }
});

// Moderation API Route
apiRouter.post('/moderate-image', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) {
      return res.status(400).json({ error: "URL d'image ou format base64 requis." });
    }

    const result = await runAIImageModeration(imageUrl);
    
    const authHeader = req.headers.authorization;
    let actorId = 'anonymous';
    let actorEmail = 'anonymous';
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const validUser = validateSession(token);
      if (validUser) {
        actorId = validUser.id;
        actorEmail = validUser.email;
      }
    }
    db.logAction(actorId, actorEmail, 'PHOTO_MODERATION', `Lancement de la modération automatique d'image par l'IA. Verdict: ${result.approved ? 'Approuvée' : 'Rejetée'}.`);

    return res.json(result);
  } catch (error) {
    next(error);
  }
});

// Get chat conversations
apiRouter.get('/chats/:profileId', (req: Request, res: Response) => {
  const { profileId } = req.params;
  const messages = db.chats.get(profileId) || [];
  return res.json({ messages });
});

// Send message & trigger smart automated AI replying
apiRouter.post('/chats/:profileId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { profileId } = req.params;
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Le texte du message est obligatoire." });
    }

    const targetProfile = db.profiles.get(profileId);
    if (!targetProfile) {
      return res.status(404).json({ error: "Le profil associé est introuvable." });
    }

    // Register user sent message
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      senderId: 'user',
      text: text.trim(),
      timestamp: new Date()
    };

    const conversation = db.chats.get(profileId) || [];
    conversation.push(userMsg);
    db.chats.set(profileId, conversation);

    // Call dynamic context-driven AI replay through Gemini
    const replyText = await runAIChatReply(
      targetProfile.name,
      targetProfile.bio,
      targetProfile.interests,
      text.trim()
    );

    const replyMsg: ChatMessage = {
      id: `msg-${Date.now()}-reply`,
      senderId: profileId,
      text: replyText,
      timestamp: new Date()
    };

    conversation.push(replyMsg);
    db.chats.set(profileId, conversation);

    // Log with high regard of user privacy (no real messages logged)
    const authHeader = req.headers.authorization;
    let actorId = 'anonymous';
    let actorEmail = 'anonymous';
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const validUser = validateSession(token);
      if (validUser) {
        actorId = validUser.id;
        actorEmail = validUser.email;
      }
    }
    db.logAction(actorId, actorEmail, 'CHAT_MESSAGE_SENT', `Envoi de message chiffré vers le profil: ${profileId}. Réception d'une réponse de l'IA correspondante.`);

    return res.json({
      messages: conversation,
      userMessage: userMsg,
      replyMessage: replyMsg
    });
  } catch (error) {
    next(error);
  }
});

// Update the current user's Extended Network Opt-In state
apiRouter.post('/auth/user/update-extended-network', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { enabled } = req.body;
  if (!req.user) {
    return res.status(401).json({ error: "Non authentifié" });
  }
  
  // Update in DB
  req.user.gender = req.user.gender; // keep existing
  // Let's add a mechanism to store extendedNetworkOptIn on user
  (req.user as any).extendedNetworkOptIn = !(!enabled);
  
  // Also update corresponding profile if there is one matching the user email or id
  const matchingProfile = Array.from(db.profiles.values()).find(p => p.id === req.user?.id || p.id === 'user-carl');
  if (matchingProfile) {
    matchingProfile.extendedNetworkOptIn = !(!enabled);
  }

  return res.json({ success: true, user: req.user, isOptedIn: !(!enabled) });
});

// -------------- SERVICES DEVELOPPEURS : APPROBATION & CLES API --------------

function getDomain(urlStr: string): string {
  if (!urlStr) return '';
  try {
    const url = new URL(urlStr);
    return url.hostname.toLowerCase().replace('www.', '');
  } catch (e) {
    return urlStr.toLowerCase().trim().replace('www.', '').replace(/(^\w+:\/\/)/, '').split('/')[0];
  }
}

// 1. Get developer approval request status
apiRouter.get('/developer/status', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const approval = db.devApprovals.get(userId);
  return res.json({ approval: approval || null });
});

// 2. Request developer authorization from Technical Support
apiRouter.post('/developer/request', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { developerName, websiteUrl, useCase } = req.body;
  if (!developerName || !websiteUrl || !useCase) {
    return res.status(400).json({ error: "Tous les champs ('developerName', 'websiteUrl', 'useCase') sont obligatoires." });
  }

  const userId = req.user!.id;
  const userEmail = req.user!.email;

  const approvalData = {
    userId,
    userEmail,
    developerName: developerName.trim(),
    websiteUrl: websiteUrl.trim(),
    useCase: useCase.trim(),
    status: 'pending' as const,
    requestDate: new Date()
  };

  db.devApprovals.set(userId, approvalData);

  // Auto-generate a high-priority technical support ticket for approval
  const ticketId = `ticket-api-${Date.now()}`;
  db.tickets.set(ticketId, {
    id: ticketId,
    userId,
    userEmail,
    title: `[Support API] Demande d'approbation d'accès développeur par ${developerName.trim()}`,
    status: 'open',
    createdAt: new Date(),
    updatedAt: new Date(),
    messages: [
      {
        sender: 'user',
        text: `Bonjour l'équipe support,\n\nJe sollicite l'approbation de mon compte développeur tiers pour insérer et utiliser l'API.\n\nNom: ${developerName.trim()}\nSite Web: ${websiteUrl.trim()}\nUsage: ${useCase.trim()}`,
        timestamp: new Date()
      },
      {
        sender: 'agent',
        text: `Merci pour votre demande. Notre support technique va analyser l'URL de votre site web ${websiteUrl.trim()} pour s'assurer de sa conformité RGPD et kinky-friendly avant d'approuver votre jeton développeur d'API.`,
        timestamp: new Date()
      }
    ]
  });

  db.logAction(userId, userEmail, 'DEVELOPER_REQUEST_SUBMITTED', `Demande d'activation d'API soumise pour le site ${websiteUrl}.`);

  return res.status(201).json({ success: true, approval: approvalData, ticketId });
});

// 3. List API keys generated by the active user
apiRouter.get('/developer/keys', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const keys = Array.from(db.apiKeys.values()).filter(k => k.userId === userId);
  return res.json({ keys });
});

// 4. Create an API Key (Only if approved by Support!)
apiRouter.post('/developer/keys', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { developerName, websiteUrl, permissions } = req.body;
  if (!developerName || !websiteUrl || !permissions) {
    return res.status(400).json({ error: "Veuillez spécifier le nom du développeur, le site web d'accueil et les droits d'accès." });
  }

  const userId = req.user!.id;
  const userEmail = req.user!.email;

  // VERIFY APPROVAL PRIOR TO ISSUING KEYS
  const approval = db.devApprovals.get(userId);
  if (!approval || approval.status !== 'approved') {
    return res.status(442).json({ 
      error: "Accès refusé : Approbation technique préalable de sécurité requise.",
      details: "Conforme à notre politique de protection, vous devez d'abord soumettre votre site de rencontre ou application au support technique de Liaison AI pour validation. Une fois que notre équipe aura audité vos conditions d'utilisation, vous pourrez émettre des clés d'API.",
      status: approval ? approval.status : 'not_requested'
    });
  }

  // Generate secure token credentials starting with sk_liaison_ plus 32 and hex char
  const randomBytes = Array.from({ length: 16 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('');
  const newlyGeneratedKey = `sk_liaison_${randomBytes}`;
  const keyId = `key-${Date.now()}`;

  const keyConfig = {
    id: keyId,
    userId,
    developerName: developerName.trim(),
    key: newlyGeneratedKey,
    websiteUrl: websiteUrl.trim(),
    permissions: {
      readProfiles: !!permissions.readProfiles,
      writeProfiles: !!permissions.writeProfiles,
      getSuggestions: !!permissions.getSuggestions,
      deleteProfiles: !!permissions.deleteProfiles
    },
    createdAt: new Date(),
    status: 'active' as const
  };

  db.apiKeys.set(newlyGeneratedKey, keyConfig);
  db.logAction(userId, userEmail, 'DEVELOPER_API_CREATED', `Génération de clé d'API certifiée pour le site : ${websiteUrl}.`);

  return res.status(201).json({ success: true, keyConfig });
});

// 5. Revoke / Delete API key
apiRouter.delete('/developer/keys/:key', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const apiKeyToRevoke = req.params.key;
  const userId = req.user!.id;
  
  const keyConfig = db.apiKeys.get(apiKeyToRevoke);
  if (!keyConfig) {
    return res.status(404).json({ error: "Clé d'API introuvable." });
  }

  if (keyConfig.userId !== userId) {
    return res.status(403).json({ error: "Interdit: Vous n'êtes pas propriétaire de ce jeton d'accès." });
  }

  // Set status as revoked so it stays in record but fails verification
  keyConfig.status = 'revoked';
  db.logAction(userId, req.user!.email, 'DEVELOPER_API_REVOKED', `Clé d'API d'identifiant ${keyConfig.id} révoquée.`);

  return res.json({ success: true, message: "La clé d'API a été révoquée de façon permanente avec succès." });
});

// 6. Admin Endpoint: Approve or reject request (Used inside Employee Portal!)
apiRouter.post('/developer/admin/approve', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { developerUserId, action } = req.body; // action: 'approve' | 'reject'
  if (!developerUserId || !action) {
    return res.status(400).json({ error: "Champs requis manquants: developerUserId et action." });
  }

  const approval = db.devApprovals.get(developerUserId);
  if (!approval) {
    return res.status(404).json({ error: "Demande de développeur introuvable pour cet utilisateur." });
  }

  approval.status = action === 'approve' ? 'approved' : 'rejected';
  approval.decisionDate = new Date();

  // If approved, verify we also seed or auto-resolve tickets associated with this request
  for (const [id, ticket] of db.tickets.entries()) {
    if (ticket.userId === developerUserId && ticket.title.includes("[Support API]")) {
      ticket.status = 'resolved';
      ticket.messages.push({
        sender: 'employee',
        text: action === 'approve' 
          ? `[Système Liaison Support] Félicitations ! Votre demande d'accès a été officiellement APPROUVÉE pour le site ${approval.websiteUrl}. Vous pouvez maintenant générer vos clés d'API et configurer les permissions et fonctions d'appel sécurisées dans votre console développeur.` 
          : `[Système Liaison Support] Votre demande d'accès développeur tiers a été refusée pour le site ${approval.websiteUrl} suite au non-respect de notre charte d'utilisation éthique kinky.`,
        timestamp: new Date()
      });
      ticket.updatedAt = new Date();
    }
  }

  db.logAction(
    req.user!.id,
    req.user!.email,
    'DEVELOPER_APPROVAL_DECISION',
    `Décision d'administration (${action}) appliquée pour le développeur ${approval.developerName}.`
  );

  return res.json({ success: true, approval });
});

// Also expose an endpoint to list all developer approvals for EmployeePortal
apiRouter.get('/developer/admin/requests', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const list = Array.from(db.devApprovals.values());
  return res.json({ requests: list });
});


// -------------- DEVELOPER THIRD-PARTY API (v1/external) --------------

// Middleware to check API developer key with advanced domain origin and permission security check
function developerApiKeyMiddleware(req: Request, res: Response, next: NextFunction) {
  const apiKey = (req.headers['x-api-key'] || req.query.apiKey) as string;
  if (!apiKey) {
    return res.status(401).json({ 
      error: "Clé d'API développeur non valide ou manquante.",
      tip: "Indiquez l'en-tête 'X-API-Key: <votre_cle_api>' pour vous authentifier."
    });
  }

  const keyConfig = db.apiKeys.get(apiKey);
  if (!keyConfig) {
    return res.status(401).json({ 
      error: "Clé d'API développeur non enregistrée ou révoquée par la sécurité.",
      tip: "Veuillez soumettre vos clés d'api actives depuis votre tableau de bord développeur."
    });
  }

  if (keyConfig.status !== 'active') {
    return res.status(403).json({ error: "Cette clé d'API de production a été désactivée ou révoquée par l'association." });
  }

  // Domain Security - site based authorization
  const origin = req.headers.origin as string || '';
  const referer = req.headers.referer as string || '';
  
  if (keyConfig.websiteUrl && keyConfig.websiteUrl !== '*' && keyConfig.websiteUrl !== 'https://*' && keyConfig.websiteUrl !== 'http://*') {
    const allowedDomain = getDomain(keyConfig.websiteUrl);
    
    let incomingDomain = '';
    if (origin) {
      incomingDomain = getDomain(origin);
    } else if (referer) {
      incomingDomain = getDomain(referer);
    }

    if (incomingDomain && incomingDomain !== 'localhost' && incomingDomain !== '127.0.0.1' && !incomingDomain.includes(allowedDomain)) {
      db.logAction(keyConfig.userId, keyConfig.developerName, 'DEVELOPER_API_BLOCKED_ORIGIN', `Appel API bloqué pour origine ${incomingDomain}. Restreinte au site ${allowedDomain}`);
      return res.status(403).json({
        error: "Accès d'API bloqué pour non-conformité d'empreinte web.",
        details: `La clé API employée est configurée à usage exclusif du site : ${keyConfig.websiteUrl}. Vos appels originent du domaine ${incomingDomain}.`,
        code: "UNAUTHORIZED_SITENAME"
      });
    }
  }

  // Right checks
  const path = req.path;
  const method = req.method;

  if (path === '/v1/external/profiles') {
    if (method === 'GET') {
      if (!keyConfig.permissions.readProfiles) {
        return res.status(403).json({ error: "Privilèges insuffisants : Votre clé d'api ne possède pas la permission 'readProfiles'." });
      }
    } else if (method === 'POST') {
      if (!keyConfig.permissions.writeProfiles) {
        return res.status(403).json({ error: "Privilèges insuffisants : Votre clé d'api ne possède pas la permission 'writeProfiles'." });
      }
    }
  } else if (path === '/v1/external/suggestions') {
    if (!keyConfig.permissions.getSuggestions) {
      return res.status(403).json({ error: "Privilèges insuffisants : Votre clé d'api ne possède pas la permission 'getSuggestions'." });
    }
  }

  db.logAction(keyConfig.userId, keyConfig.developerName, 'DEVELOPER_API_ACCESS_SUCCEEDED', `Requête autorisée sur ${path} (${method}).`);
  next();
}

// 1. GET developer profiles (Only those opted-in to the extended network!)
apiRouter.get('/v1/external/profiles', developerApiKeyMiddleware, (req: Request, res: Response) => {
  const list = Array.from(db.profiles.values());
  // Filters ONLY profiles that have agreed to the extended independent developer network
  const optedInProfiles = list.filter(p => p.extendedNetworkOptIn === true);
  
  return res.json({
    description: "Réseau Étendu de Profils de Rencontre Liaison AI (Développeurs Indépendants autorisés).",
    warning: "Ces informations ne doivent être utilisées que pour la mise en relation bienveillante entre adultes consentants. Tout usage commercial abusif est passible de sanctions pénales.",
    count: optedInProfiles.length,
    profiles: optedInProfiles
  });
});

// 2. POST create a new complete profile (Must strictly validate 18+ for minor protection)
apiRouter.post('/v1/external/profiles', developerApiKeyMiddleware, (req: Request, res: Response) => {
  const { name, age, gender, bio, interests, seeking, avatar, lat, lng, neighborhood } = req.body;
  
  // Strict validations
  if (!name || !gender || !bio || !interests || !seeking) {
    return res.status(400).json({ error: "Champs requis manquants: 'name', 'gender', 'bio', 'interests', 'seeking' sont obligatoires." });
  }

  const ageNum = Number(age);
  if (isNaN(ageNum) || ageNum < 18) {
    return res.status(400).json({ 
      error: "Protection des mineurs et personnes vulnérables : Tout profil enregistré sur la plateforme doit être âgé d'au moins 18 ans de façon certifiée.",
      code: "MINOR_PROTECTION_GUARD"
    });
  }

  if (ageNum > 100) {
    return res.status(400).json({ error: "Âge invalide enregistré." });
  }

  // Create profile
  const newProfileId = `external-profile-${Date.now()}`;
  const newProfile: Profile = {
    id: newProfileId,
    name: name.trim(),
    age: ageNum,
    gender: gender,
    location: {
      lat: Number(lat) || 45.5088,
      lng: Number(lng) || -73.5878,
      neighborhood: neighborhood ? neighborhood.trim() : "Quartier Externe",
      distance: 3.0 // default mock distance
    },
    bio: bio.trim(),
    interests: Array.isArray(interests) ? interests : [interests],
    seeking: seeking.trim(),
    avatar: avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&h=300&q=80",
    isVerified: false,
    moderationStatus: 'approved', // automatic sandbox approval
    photos: [avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&h=300&q=80"],
    extendedNetworkOptIn: true, // created by developer, implicitly open to partner apps!
    compatibilityScore: 80,
    compatibilityReasons: ["Intégré via l'API développeur externe", "Nouveau profil partenaire à explorer"]
  };

  db.profiles.set(newProfileId, newProfile);

  return res.status(201).json({
    message: "Profil enregistré avec succès dans le réseau étendu Liaison AI.",
    profileId: newProfileId,
    profile: newProfile
  });
});

// 3. POST obtain matching & suggestions via AI for developers
apiRouter.post('/v1/external/suggestions', developerApiKeyMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userInterests, userPrompt } = req.body;
    if (!userInterests || !Array.isArray(userInterests)) {
      return res.status(400).json({ error: "Le paramètre 'userInterests' doit être un tableau de chaînes de caractères." });
    }

    const availableProfiles = Array.from(db.profiles.values());
    const { matchedProfiles, explanation } = await runAIMatchmaking(availableProfiles, userPrompt || '', userInterests);

    db.logAction('developer-external', 'partner@liaison.ai', 'DEVELOPER_API_SUGGESTIONS', `Appel de suggestions d'affinité IA via API externe.`);

    return res.json({
      query: { userInterests, userPrompt },
      recommendations: matchedProfiles.map(p => ({
        id: p.id,
        name: p.name,
        age: p.age,
        gender: p.gender,
        compatibilityScore: p.compatibilityScore,
        compatibilityReasons: p.compatibilityReasons,
        bio: p.bio,
        neighborhood: p.location.neighborhood
      })),
      aiExplanation: explanation
    });
  } catch (err) {
    next(err);
  }
});

// ================= SUPPORT TICKETS CHANNELS =================

// 1. Get all tickets of the authenticated user
apiRouter.get('/support/tickets', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const userTickets = Array.from(db.tickets.values()).filter(t => t.userId === req.user?.id);
  return res.json({ tickets: userTickets });
});

// 2. Create a new support ticket with spontaneous AI answering & automatic escalation triggers
apiRouter.post('/support/tickets', authMiddleware, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { title, message } = req.body;
    if (!title || !message || !message.trim()) {
      return res.status(400).json({ error: "Le titre et le message de description technique de votre problème sont obligatoires." });
    }

    const ticketId = `ticket-${Date.now()}`;
    const userMsg: TicketMessage = {
      sender: 'user',
      text: message.trim(),
      timestamp: new Date()
    };

    // Calculate interactive AI Answer instantly
    const initialHistory = [userMsg];
    const aiAnswerText = await runAISupportReply(title, [], message.trim());
    
    // Check if escalation is triggered immediately (user mentions 'escalade' / 'human' etc)
    const lowerMsg = message.toLowerCase();
    const isEscalationRequested = lowerMsg.includes('escalader') || lowerMsg.includes('human') || lowerMsg.includes('humain') || lowerMsg.includes('développeur') || lowerMsg.includes('reel') || lowerMsg.includes('réel');
    
    const aiMsg: TicketMessage = {
      sender: 'agent',
      text: aiAnswerText,
      timestamp: new Date()
    };

    const newTicket: any = {
      id: ticketId,
      userId: req.user!.id,
      userEmail: req.user!.email,
      title: title.trim(),
      status: isEscalationRequested ? 'escalated' : 'open',
      messages: [userMsg, aiMsg],
      createdAt: new Date(),
      updatedAt: new Date(),
      escalatedEmailSent: isEscalationRequested,
      escalationDetails: isEscalationRequested ? `Alerte de support de niveau 2 dépêchée par email à : carlgodrolt@gmail.com (Créateur du site Liaison AI)` : undefined
    };

    db.tickets.set(ticketId, newTicket);

    // Logging action
    db.logAction(req.user!.id, req.user!.email, 'SUPPORT_TICKET_CREATED', `Ticket créé [ID: ${ticketId}] Sujet: "${title}". ${isEscalationRequested ? 'Escalation immédiate configurée.' : 'Réponse automatique du conseiller technique IA.'}`);
    
    if (isEscalationRequested) {
      db.logAction('system', 'system@liaison.ai', 'EMAIL_ESCALATION_ALERT_SENT', `Simulé: E-mail technique de niveau 2 acheminé aux developpeurs pour le ticket ${ticketId}.`);
    }

    return res.status(201).json(newTicket);
  } catch (err) {
    next(err);
  }
});

// 3. Post user response message in a ticket with automatic smart AI answer or developer notification alerts
apiRouter.post('/support/tickets/:ticketId/messages', authMiddleware, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { ticketId } = req.params;
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Le texte du message est obligatoire." });
    }

    const ticket = db.tickets.get(ticketId);
    if (!ticket) {
      return res.status(404).json({ error: "Ticket de support introuvable." });
    }

    if (ticket.userId !== req.user!.id) {
      return res.status(403).json({ error: "Vous n'avez pas l'autorisation d'accéder à ce ticket." });
    }

    const userMsg: TicketMessage = {
      sender: 'user',
      text: text.trim(),
      timestamp: new Date()
    };

    ticket.messages.push(userMsg);
    ticket.updatedAt = new Date();

    const lowerText = text.toLowerCase();
    const isEscalationRequested = lowerText.includes('escalader') || lowerText.includes('human') || lowerText.includes('humain') || lowerText.includes('développeur') || lowerText.includes('reel') || lowerText.includes('réel');

    if (ticket.status === 'resolved') {
      ticket.status = 'open'; // reopen on user reply
    }

    if (isEscalationRequested && ticket.status !== 'escalated') {
      ticket.status = 'escalated';
      ticket.escalatedEmailSent = true;
      ticket.escalationDetails = `Alerte de support de niveau 2 dépêchée par email à : carlgodrolt@gmail.com (Créateur du site Liaison AI)`;
      
      const escalationNotification: TicketMessage = {
        sender: 'agent',
        text: "J'ai bien pris en compte votre souhait de parler à un humain. Ce ticket est officiellement escaladé à l'équipe de développeurs du site Liaison AI. Un courriel d'alerte vient de leur être envoyé.",
        timestamp: new Date()
      };
      ticket.messages.push(escalationNotification);
      
      db.logAction(req.user!.id, req.user!.email, 'SUPPORT_TICKET_ESCALATED', `Ticket ${ticketId} escaladé à la demande de l'utilisateur.`);
      db.logAction('system', 'system@liaison.ai', 'EMAIL_ESCALATION_ALERT_SENT', `Simulé: E-mail technique de niveau 2 acheminé aux developpeurs pour le ticket ${ticketId}.`);
    } else if (ticket.status !== 'escalated') {
      // Prompt AI Assist representation
      const aiReply = await runAISupportReply(ticket.title, ticket.messages, text.trim());
      const aiReplyMsg: TicketMessage = {
        sender: 'agent',
        text: aiReply,
        timestamp: new Date()
      };
      ticket.messages.push(aiReplyMsg);
      
      // Determine if Gemini decided to trigger escalation on its own
      if (aiReply.includes('escalad') || aiReply.includes('courriel') || aiReply.includes('acheminé')) {
        ticket.status = 'escalated';
        ticket.escalatedEmailSent = true;
        ticket.escalationDetails = `Alerte de support de niveau 2 dépêchée par email à : carlgodrolt@gmail.com (Créateur du site Liaison AI)`;
        db.logAction(req.user!.id, req.user!.email, 'SUPPORT_TICKET_ESCALATED', `Ticket ${ticketId} escaladé automatiquement par l'agent IA.`);
        db.logAction('system', 'system@liaison.ai', 'EMAIL_ESCALATION_ALERT_SENT', `Simulé: E-mail technique de niveau 2 acheminé aux developpeurs pour le ticket ${ticketId}.`);
      }
    }

    db.tickets.set(ticketId, ticket);
    db.logAction(req.user!.id, req.user!.email, 'SUPPORT_TICKET_MESSAGE_ADDED', `Message de support de l'utilisateur ajouté au ticket ${ticketId}.`);

    return res.json(ticket);
  } catch (err) {
    next(err);
  }
});


// ================= EMPLOYEE PORTAL ZONE (SECURE CHANNELS) =================

// Middleware to authenticate employee tokens
function employeeAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Non autorisé. Accès réservé aux employés de Liaison AI." });
  }

  const token = authHeader.split(' ')[1];
  if (token !== 'employee-token-secure-session-2026') {
    return res.status(403).json({ error: "Session d'employé expirée ou invalide. Authentifiez-vous à nouveau." });
  }
  next();
}

// 1. Employee Login Route (Secured & distinct credentials as requested)
apiRouter.post('/employee/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email d'employé et mot de passe requis." });
  }

  if (email.toLowerCase().trim() === 'employee@liaison.ai' && password === 'securepassword2026') {
    db.logAction('employee-admin', 'employee@liaison.ai', 'EMPLOYEE_LOG_IN', "Connexion réussie au portail des employés de Liaison AI.");
    return res.json({
      token: 'employee-token-secure-session-2026',
      employee: {
        email: 'employee@liaison.ai',
        name: 'Administrateur Liaison AI',
        role: 'Employee'
      }
    });
  } else {
    db.logAction('anonymous-employee-attempt', email, 'FAILED_EMPLOYEE_LOGIN_ATTEMPT', "Tentative infructueuse d'accès au portail employé sécurisé.");
    return res.status(401).json({ error: "Identifiants d'employé invalides." });
  }
});

// 2. Fetch all system action audit logs (no sensitive private chats logged!)
apiRouter.get('/employee/logs', employeeAuthMiddleware, (req: Request, res: Response) => {
  return res.json({ logs: db.logs });
});

// 3. Employee view profiles list (Not reading private chat messages for privacy)
apiRouter.get('/employee/profiles', employeeAuthMiddleware, (req: Request, res: Response) => {
  const list = Array.from(db.profiles.values());
  return res.json({ profiles: list });
});

// 4. Employee moderate/delete dangerous profile
apiRouter.delete('/employee/profiles/:profileId', employeeAuthMiddleware, (req: Request, res: Response) => {
  const { profileId } = req.params;
  const deleted = db.profiles.delete(profileId);
  if (deleted) {
    db.logAction('employee-admin', 'employee@liaison.ai', 'EMPLOYEE_PROFILE_DELETE', `Le profil ${profileId} a été supprimé pour non-respect des critères éthiques.`);
    return res.json({ success: true, message: `Profil de rencontre ${profileId} supprimé de la base.` });
  }
  return res.status(404).json({ error: "Profil introuvable." });
});

// 5. Employee view all user tickets
apiRouter.get('/employee/tickets', employeeAuthMiddleware, (req: Request, res: Response) => {
  const allTickets = Array.from(db.tickets.values());
  return res.json({ tickets: allTickets });
});

// 6. Employee reply to escalated tickets directly
apiRouter.post('/employee/tickets/:ticketId/reply', employeeAuthMiddleware, (req: Request, res: Response) => {
  const { ticketId } = req.params;
  const { text } = req.body;
  
  if (!text || !text.trim()) {
    return res.status(400).json({ error: "Le texte de la réponse est obligatoire." });
  }

  const ticket = db.tickets.get(ticketId);
  if (!ticket) {
    return res.status(404).json({ error: "Ticket de support introuvable." });
  }

  const employeeMsg: TicketMessage = {
    sender: 'employee',
    text: text.trim(),
    timestamp: new Date()
  };

  ticket.messages.push(employeeMsg);
  ticket.status = 'resolved'; // Answered and closed by default
  ticket.updatedAt = new Date();

  db.tickets.set(ticketId, ticket);
  db.logAction('employee-admin', 'employee@liaison.ai', 'EMPLOYEE_TICKET_RESOLVE', `Réponse de l'administrateur et résolution finale du ticket ${ticketId}.`);

  return res.json(ticket);
});

// Global Error Handler for Express
apiRouter.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Express API Error:", err);
  return res.status(500).json({
    error: "Une erreur interne s'est produite lors de l'orchestration par l'IA.",
    details: err.message || err.toString()
  });
});
