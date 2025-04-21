import { storage } from './enhancedLocalStorage';

// Clé de session dans le localStorage
const SESSION_KEY = 'session';

// Interface pour les données de session
interface SessionData {
  userId: string;
  username?: string;
  email?: string;
  avatarUrl?: string;
  createdAt: string;
  expiresAt?: string;
}

/**
 * Crée une nouvelle session utilisateur
 */
export function createSession(userData: Omit<SessionData, 'createdAt'>): SessionData {
  const session: SessionData = {
    ...userData,
    createdAt: new Date().toISOString()
  };
  
  // 14 jours d'expiration par défaut
  if (!session.expiresAt) {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 14);
    session.expiresAt = expiry.toISOString();
  }
  
  // Stocker la session
  storage.set(SESSION_KEY, session);
  
  return session;
}

/**
 * Récupère la session actuelle
 */
export function getSession(): SessionData | null {
  const session = storage.get<SessionData>(SESSION_KEY);
  
  if (!session) return null;
  
  // Vérifier si la session est expirée
  if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
    clearSession();
    return null;
  }
  
  return session;
}

/**
 * Vérifie si une session valide existe
 */
export function hasSession(): boolean {
  return getSession() !== null;
}

/**
 * Supprime la session actuelle
 */
export function clearSession(): void {
  storage.remove(SESSION_KEY);
}

/**
 * Met à jour les données de session
 */
export function updateSession(data: Partial<SessionData>): SessionData | null {
  const currentSession = getSession();
  if (!currentSession) return null;
  
  const updatedSession: SessionData = {
    ...currentSession,
    ...data
  };
  
  storage.set(SESSION_KEY, updatedSession);
  return updatedSession;
}

/**
 * Récupère l'ID de l'utilisateur connecté
 */
export function getCurrentUserId(): string | null {
  const session = getSession();
  return session ? session.userId : null;
}

/**
 * Connexion rapide pour la démo
 */
export function quickLogin(username: string): SessionData {
  // Générer un ID utilisateur unique basé sur le nom d'utilisateur
  const userId = `user_${username.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
  
  return createSession({
    userId,
    username,
    email: `${username.toLowerCase().replace(/\s+/g, '.')}@example.com`,
    avatarUrl: `https://api.dicebear.com/7.x/micah/svg?seed=${username}`
  });
}