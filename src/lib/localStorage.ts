import { storage } from './enhancedLocalStorage';
import { v4 as uuidv4 } from 'uuid';

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SharedDeckExport {
  deck: Deck;
  themes: Theme[];
  flashcards: Flashcard[];
}

export interface Deck {
  id: string;
  title: string;
  description: string;
  coverImage?: string;
  isPublic: boolean;
  author: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export interface Theme {
  id: string;
  deckId: string;
  title: string;
  description: string;
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FlashcardContent {
  text: string;
  image?: string;
  audio?: string;
  additionalInfo?: string;
}

export interface Flashcard {
  id: string;
  deckId: string;
  themeId?: string;
  front: FlashcardContent;
  back: FlashcardContent;
  createdAt: string;
  updatedAt: string;
}

// Clés de stockage
const USERS_KEY = 'users';
const DECKS_KEY = 'decks';
const THEMES_KEY = 'themes';
const CARDS_KEY = 'cards';
const USER_PREFERENCE_KEY = 'user-preferences';
const SESSION_KEY = 'session';

// Vérifier si la structure de données existe
export function generateSampleData() {
  // Vérifier si les données existent déjà
  const decks = storage.getArray<Deck>(DECKS_KEY);
  
  if (decks.length === 0) {
    console.log("Génération de données d'exemple...");
    
    // Créer quelques decks d'exemple
    const sampleDecks: Deck[] = [
      {
        id: uuidv4(),
        title: "Anime populaires",
        description: "Cartes mémo sur les animes populaires",
        coverImage: "https://source.unsplash.com/random/300x200/?anime",
        isPublic: true,
        author: "Admin",
        authorId: "admin-123",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ["anime", "populaire", "série"]
      },
      {
        id: uuidv4(),
        title: "Personnages de manga classiques",
        description: "Découvrez les personnages emblématiques du manga",
        coverImage: "https://source.unsplash.com/random/300x200/?manga",
        isPublic: true,
        author: "Admin",
        authorId: "admin-123",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ["manga", "personnages", "classique"]
      }
    ];
    
    // Ajouter les decks
    sampleDecks.forEach(deck => storage.addToArray(DECKS_KEY, deck));
    
    // Créer des thèmes pour le premier deck
    const themes: Theme[] = [
      {
        id: uuidv4(),
        deckId: sampleDecks[0].id,
        title: "Shonen",
        description: "Animes shonen populaires",
        coverImage: "https://source.unsplash.com/random/300x200/?shonen",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        deckId: sampleDecks[0].id,
        title: "Seinen",
        description: "Animes seinen populaires",
        coverImage: "https://source.unsplash.com/random/300x200/?seinen",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    // Ajouter les thèmes
    themes.forEach(theme => storage.addToArray(THEMES_KEY, theme));
    
    // Créer des flashcards pour le premier thème
    const flashcards: Flashcard[] = [
      {
        id: uuidv4(),
        deckId: sampleDecks[0].id,
        themeId: themes[0].id,
        front: {
          text: "One Piece",
          image: "https://source.unsplash.com/random/300x200/?one-piece"
        },
        back: {
          text: "Créé par Eiichiro Oda en 1997, One Piece est l'un des mangas les plus populaires au monde.",
          additionalInfo: "L'histoire suit Monkey D. Luffy et son équipage dans leur quête du trésor 'One Piece'."
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        deckId: sampleDecks[0].id,
        themeId: themes[0].id,
        front: {
          text: "Naruto",
          image: "https://source.unsplash.com/random/300x200/?naruto"
        },
        back: {
          text: "Créé par Masashi Kishimoto, Naruto raconte l'histoire d'un jeune ninja qui cherche à devenir Hokage.",
          additionalInfo: "La série a été publiée de 1999 à 2014."
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    // Ajouter les flashcards
    flashcards.forEach(card => storage.addToArray(CARDS_KEY, card));
    
    console.log("Données d'exemple générées avec succès!");
  }
}

// Fonctions d'accès aux données

// Decks
export const getDecks = () => storage.getArray<Deck>(DECKS_KEY);
export const getDeckById = (id: string) => storage.getFromArray<Deck>(DECKS_KEY, id);
export const createDeck = (deck: Omit<Deck, 'id' | 'createdAt' | 'updatedAt'>) => {
  const now = new Date().toISOString();
  return storage.addToArray<Deck>(DECKS_KEY, {
    ...deck,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now
  });
};
export const updateDeck = (id: string, data: Partial<Deck>) => {
  const deck = getDeckById(id);
  if (!deck) return false;
  
  return storage.updateInArray<Deck>(DECKS_KEY, {
    ...deck,
    ...data,
    updatedAt: new Date().toISOString()
  });
};
export const deleteDeck = (id: string) => storage.removeFromArray<Deck>(DECKS_KEY, id);

// Thèmes
export const getThemes = () => storage.getArray<Theme>(THEMES_KEY);
export const getThemesByDeckId = (deckId: string) => 
  storage.getArray<Theme>(THEMES_KEY).filter(theme => theme.deckId === deckId);
export const getThemeById = (id: string) => storage.getFromArray<Theme>(THEMES_KEY, id);
export const createTheme = (theme: Omit<Theme, 'id' | 'createdAt' | 'updatedAt'>) => {
  const now = new Date().toISOString();
  return storage.addToArray<Theme>(THEMES_KEY, {
    ...theme,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now
  });
};
export const updateTheme = (id: string, data: Partial<Theme>) => {
  const theme = getThemeById(id);
  if (!theme) return false;
  
  return storage.updateInArray<Theme>(THEMES_KEY, {
    ...theme,
    ...data,
    updatedAt: new Date().toISOString()
  });
};
export const deleteTheme = (id: string) => storage.removeFromArray<Theme>(THEMES_KEY, id);

// Flashcards
export const getFlashcards = () => storage.getArray<Flashcard>(CARDS_KEY);
export const getFlashcardsByDeckId = (deckId: string) => 
  storage.getArray<Flashcard>(CARDS_KEY).filter(card => card.deckId === deckId);
export const getFlashcardsByThemeId = (themeId: string) => 
  storage.getArray<Flashcard>(CARDS_KEY).filter(card => card.themeId === themeId);
export const getFlashcardById = (id: string) => storage.getFromArray<Flashcard>(CARDS_KEY, id);
export const createFlashcard = (card: Omit<Flashcard, 'id' | 'createdAt' | 'updatedAt'>) => {
  const now = new Date().toISOString();
  return storage.addToArray<Flashcard>(CARDS_KEY, {
    ...card,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now
  });
};
export const updateFlashcard = (id: string, data: Partial<Flashcard>) => {
  const card = getFlashcardById(id);
  if (!card) return false;
  
  return storage.updateInArray<Flashcard>(CARDS_KEY, {
    ...card,
    ...data,
    updatedAt: new Date().toISOString()
  });
};
export const deleteFlashcard = (id: string) => storage.removeFromArray<Flashcard>(CARDS_KEY, id);

// Session utilisateur
export const setSession = (userId: string) => {
  storage.set(SESSION_KEY, {
    userId,
    createdAt: new Date().toISOString()
  });
};

export const getSession = () => storage.get(SESSION_KEY);

export const clearSession = () => storage.remove(SESSION_KEY);

// Préférences utilisateur
export const getUserPreferences = () => storage.get<Record<string, any>>(USER_PREFERENCE_KEY, { defaultValue: {} });

export const updateUserPreferences = (prefs: Record<string, any>) => {
  const currentPrefs = getUserPreferences();
  storage.set(USER_PREFERENCE_KEY, { ...currentPrefs, ...prefs });
};

// Partage de Decks
export const generateShareCode = (deckId: string) => {
  // Dans une implémentation réelle, nous enverrions cela au serveur
  // Pour l'instant, générons simplement un code court
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};
export const createShareCode = generateShareCode;

// Fonctions pour la gestion des utilisateurs
export const getUsers = () => storage.getArray<User>(USERS_KEY);
export const getUser = (id: string) => storage.getFromArray<User>(USERS_KEY, id);
export const createUser = (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
  const now = new Date().toISOString();
  return storage.addToArray<User>(USERS_KEY, {
    ...user,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now
  });
};
export const updateUser = (id: string, data: Partial<User>) => {
  const user = getUser(id);
  if (!user) return false;
  
  return storage.updateInArray<User>(USERS_KEY, {
    ...user,
    ...data,
    updatedAt: new Date().toISOString()
  });
};

export const initializeDefaultUser = () => {
  const users = getUsers();
  if (users.length === 0) {
    const userId = uuidv4();
    createUser({
      name: "Utilisateur",
      email: "utilisateur@example.com",
      avatar: "https://source.unsplash.com/random/100x100/?avatar"
    });
    return userId;
  }
  return users[0].id;
};

// Export/Import fonctionnalités
export const exportDeckToJson = (deckId: string) => {
  const deck = getDeckById(deckId);
  if (!deck) return null;
  
  const themes = getThemesByDeckId(deckId);
  const flashcards = getFlashcardsByDeckId(deckId);
  
  return {
    deck,
    themes,
    flashcards
  };
};

export const importDeckFromJson = (data: SharedDeckExport, userId: string): string | null => {
  try {
    // Créer une copie du deck avec un nouvel ID et le nouvel auteur
    const now = new Date().toISOString();
    const user = getUser(userId);
    
    if (!user) return null;
    
    // Créer un nouveau deck basé sur celui importé
    const newDeck = createDeck({
      title: `${data.deck.title} (Importé)`,
      description: data.deck.description,
      coverImage: data.deck.coverImage,
      isPublic: false,
      author: user.name,
      authorId: userId,
      tags: [...data.deck.tags, 'importé']
    });
    
    // Créer de nouveaux thèmes
    const themeIdMap = new Map<string, string>();
    data.themes.forEach(theme => {
      const newTheme = createTheme({
        deckId: newDeck.id,
        title: theme.title,
        description: theme.description,
        coverImage: theme.coverImage
      });
      themeIdMap.set(theme.id, newTheme.id);
    });
    
    // Créer de nouvelles flashcards
    data.flashcards.forEach(card => {
      createFlashcard({
        deckId: newDeck.id,
        themeId: card.themeId ? themeIdMap.get(card.themeId) : undefined,
        front: { ...card.front },
        back: { ...card.back }
      });
    });
    
    return newDeck.id;
  } catch (error) {
    console.error("Erreur lors de l'importation du deck:", error);
    return null;
  }
};

export const updateDeckFromJson = (deckId: string, data: SharedDeckExport): boolean => {
  try {
    const deck = getDeckById(deckId);
    if (!deck) return false;
    
    // Mettre à jour les thèmes existants et ajouter les nouveaux
    const existingThemes = getThemesByDeckId(deckId);
    const themeIdMap = new Map<string, string>();
    
    // Supprimer les anciens thèmes
    existingThemes.forEach(theme => {
      deleteTheme(theme.id);
    });
    
    // Ajouter les nouveaux thèmes
    data.themes.forEach(theme => {
      const newTheme = createTheme({
        deckId: deckId,
        title: theme.title,
        description: theme.description,
        coverImage: theme.coverImage
      });
      themeIdMap.set(theme.id, newTheme.id);
    });
    
    // Supprimer les anciennes flashcards
    const existingCards = getFlashcardsByDeckId(deckId);
    existingCards.forEach(card => {
      deleteFlashcard(card.id);
    });
    
    // Ajouter les nouvelles flashcards
    data.flashcards.forEach(card => {
      createFlashcard({
        deckId: deckId,
        themeId: card.themeId ? themeIdMap.get(card.themeId) : undefined,
        front: { ...card.front },
        back: { ...card.back }
      });
    });
    
    // Mettre à jour le deck
    updateDeck(deckId, {
      title: data.deck.title,
      description: data.deck.description,
      coverImage: data.deck.coverImage,
      tags: data.deck.tags
    });
    
    return true;
  } catch (error) {
    console.error("Erreur lors de la mise à jour du deck:", error);
    return false;
  }
};

// Fonctions d'exploration et partage
export const getSharedImportedDecks = (): Deck[] => {
  const decks = getDecks();
  // On pourrait stocker les decks partagés dans le stockage local
  // Pour l'instant, retournons simplement les decks publics
  return decks.filter(deck => deck.isPublic);
};

export const getSharedDeck = (sharedCode: string): Deck | null => {
  // Dans une implémentation réelle, on utiliserait le code de partage
  // pour récupérer un deck partagé depuis le serveur
  // Pour l'instant, on retourne simplement le premier deck public
  const sharedDecks = getSharedImportedDecks();
  return sharedDecks.length > 0 ? sharedDecks[0] : null;
};

// Fonctions pour la publication des decks
export const publishDeck = (deckId: string): boolean => {
  const deck = getDeckById(deckId);
  if (!deck) return false;
  
  return updateDeck(deckId, { isPublic: true });
};

export const unpublishDeck = (deckId: string): boolean => {
  const deck = getDeckById(deckId);
  if (!deck) return false;
  
  return updateDeck(deckId, { isPublic: false });
};

export const updatePublishedDeck = (deckId: string, data: Partial<Deck>): boolean => {
  return updateDeck(deckId, data);
};

export const getFlashcardsByDeck = getFlashcardsByDeckId;
export const getDeck = getDeckById;
export const getThemesByDeck = getThemesByDeckId;
export const getTheme = getThemeById;
export const getFlashcardsByTheme = getFlashcardsByThemeId;

// Utilitaires
export const getBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};