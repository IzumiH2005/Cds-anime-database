import { storage } from './enhancedLocalStorage';

// Clés de stockage
const SESSION_KEY = 'session';
const SESSION_STATS_KEY = 'session-stats';

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

// Interface pour les statistiques d'étude
interface StudyStats {
  totalCards: number;
  correctAnswers: number;
  wrongAnswers: number;
  studyTime: number; // en secondes
  lastStudyDate: string;
  streakDays: number;
  studySessions?: number;
  totalStudyTime?: number;
  deckProgress: Record<string, {
    total: number;
    mastered: number;
    lastStudied: string;
  }>;
  cardHistory: Record<string, {
    correct: number;
    wrong: number;
    lastReviewed: string;
    nextReview?: string;
  }>;
}

/**
 * Retourne la clé de session pour l'utilisateur actuel
 */
export function getSessionKey(): string {
  const userId = getCurrentUserId();
  return userId ? `${SESSION_STATS_KEY}-${userId}` : SESSION_STATS_KEY;
}

/**
 * Génère une nouvelle clé de session
 */
export function generateSessionKey(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
}

/**
 * Sauvegarde une clé de session
 */
export function saveSessionKey(key: string): void {
  localStorage.setItem('session_backup_key', key);
}

/**
 * Récupère les statistiques d'étude
 */
export function getSessionStats(): StudyStats {
  const key = getSessionKey();
  const defaultStats: StudyStats = {
    totalCards: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    studyTime: 0,
    lastStudyDate: new Date().toISOString(),
    streakDays: 0,
    deckProgress: {},
    cardHistory: {}
  };
  
  return storage.get<StudyStats>(key, { defaultValue: defaultStats });
}

/**
 * Met à jour les statistiques pour une carte étudiée
 */
export function recordCardStudy(
  cardId: string,
  deckId: string = "",
  correct: boolean = false,
  studyTimeSeconds: number = 0
): void {
  const key = getSessionKey();
  const stats = getSessionStats();
  const now = new Date().toISOString();
  
  // Mettre à jour les statistiques globales
  const updatedStats: StudyStats = {
    ...stats,
    totalCards: stats.totalCards + 1,
    correctAnswers: correct ? stats.correctAnswers + 1 : stats.correctAnswers,
    wrongAnswers: !correct ? stats.wrongAnswers + 1 : stats.wrongAnswers,
    studyTime: stats.studyTime + studyTimeSeconds,
    lastStudyDate: now
  };
  
  // Mettre à jour l'historique de la carte
  const cardStats = stats.cardHistory[cardId] || { correct: 0, wrong: 0, lastReviewed: now };
  updatedStats.cardHistory[cardId] = {
    ...cardStats,
    correct: correct ? cardStats.correct + 1 : cardStats.correct,
    wrong: !correct ? cardStats.wrong + 1 : cardStats.wrong,
    lastReviewed: now
  };
  
  // Mettre à jour la progression du deck
  const deckStats = stats.deckProgress[deckId] || { total: 0, mastered: 0, lastStudied: now };
  const isMastered = updatedStats.cardHistory[cardId].correct >= 3 && 
                  updatedStats.cardHistory[cardId].correct / 
                    (updatedStats.cardHistory[cardId].correct + updatedStats.cardHistory[cardId].wrong) >= 0.8;
                    
  updatedStats.deckProgress[deckId] = {
    ...deckStats,
    lastStudied: now,
    mastered: isMastered && !deckStats.mastered ? deckStats.mastered + 1 : deckStats.mastered
  };
  
  // Mettre à jour la série de jours d'étude
  const lastDateObj = new Date(stats.lastStudyDate);
  const nowObj = new Date(now);
  const isNewDay = nowObj.getDate() !== lastDateObj.getDate() || 
                  nowObj.getMonth() !== lastDateObj.getMonth() || 
                  nowObj.getFullYear() !== lastDateObj.getFullYear();
  
  if (isNewDay) {
    const dayDiff = Math.floor((nowObj.getTime() - lastDateObj.getTime()) / (1000 * 60 * 60 * 24));
    updatedStats.streakDays = dayDiff === 1 ? stats.streakDays + 1 : 1;
  }
  
  // Sauvegarder les statistiques
  storage.set(key, updatedStats);
}

/**
 * Met à jour manuellement les statistiques de session
 */
export function updateSessionStats(updates: Partial<StudyStats>): StudyStats {
  const key = getSessionKey();
  const stats = getSessionStats();
  const updatedStats = { ...stats, ...updates };
  storage.set(key, updatedStats);
  return updatedStats;
}

/**
 * Exporte les données de session pour sauvegarde
 */
export function exportSessionData(): { session: SessionData | null, stats: StudyStats } {
  return {
    session: getSession(),
    stats: getSessionStats()
  };
}

/**
 * Importe des données de session depuis une sauvegarde
 */
export function importSessionData(data: { session: SessionData | null, stats: StudyStats }): boolean {
  try {
    if (data.session) {
      storage.set(SESSION_KEY, data.session);
    }
    
    if (data.stats) {
      const key = getSessionKey();
      storage.set(key, data.stats);
    }
    
    return true;
  } catch (error) {
    console.error("Erreur lors de l'importation des données de session:", error);
    return false;
  }
}