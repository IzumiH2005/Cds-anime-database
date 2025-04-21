import { storage } from './enhancedLocalStorage';
import { v4 as uuidv4 } from 'uuid';

// Types
interface Deck {
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

interface Theme {
  id: string;
  deckId: string;
  title: string;
  description: string;
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
}

interface FlashcardContent {
  text: string;
  image?: string;
  audio?: string;
  additionalInfo?: string;
}

interface Flashcard {
  id: string;
  deckId: string;
  themeId?: string;
  front: FlashcardContent;
  back: FlashcardContent;
  createdAt: string;
  updatedAt: string;
}

// Clés de stockage
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