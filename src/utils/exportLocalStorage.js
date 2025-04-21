/**
 * Utilitaire pour exporter les données stockées dans localStorage
 */

export const exportLocalStorageData = () => {
  try {
    // Récupérer les données de localStorage/IndexedDB
    const data = {
      users: [],
      decks: [],
      themes: [],
      flashcards: [],
      sharedCodes: [],
      importedDecks: []
    };
    
    // Récupérer les utilisateurs
    try {
      const usersStr = localStorage.getItem('users');
      if (usersStr) {
        data.users = JSON.parse(usersStr);
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des utilisateurs:', err);
    }
    
    // Récupérer les decks
    try {
      const decksStr = localStorage.getItem('decks');
      if (decksStr) {
        data.decks = JSON.parse(decksStr);
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des decks:', err);
    }
    
    // Récupérer les thèmes
    try {
      const themesStr = localStorage.getItem('themes');
      if (themesStr) {
        data.themes = JSON.parse(themesStr);
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des thèmes:', err);
    }
    
    // Récupérer les flashcards
    try {
      const flashcardsStr = localStorage.getItem('flashcards');
      if (flashcardsStr) {
        data.flashcards = JSON.parse(flashcardsStr);
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des flashcards:', err);
    }
    
    // Récupérer les codes de partage
    try {
      const sharedCodesStr = localStorage.getItem('sharedCodes');
      if (sharedCodesStr) {
        data.sharedCodes = JSON.parse(sharedCodesStr);
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des codes de partage:', err);
    }
    
    // Récupérer les decks importés
    try {
      const importedDecksStr = localStorage.getItem('importedDecks');
      if (importedDecksStr) {
        data.importedDecks = JSON.parse(importedDecksStr);
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des decks importés:', err);
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Erreur lors de l\'exportation des données:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Utilitaire pour vérifier l'existence des données dans localStorage
 */
export const checkLocalStorageData = () => {
  const storageInfo = {
    users: false,
    decks: false,
    themes: false,
    flashcards: false,
    sharedCodes: false,
    importedDecks: false
  };
  
  let totalItems = 0;
  
  // Vérifier utilisateurs
  try {
    const usersStr = localStorage.getItem('users');
    if (usersStr) {
      const users = JSON.parse(usersStr);
      storageInfo.users = users.length > 0;
      totalItems += users.length;
    }
  } catch (err) {}
  
  // Vérifier decks
  try {
    const decksStr = localStorage.getItem('decks');
    if (decksStr) {
      const decks = JSON.parse(decksStr);
      storageInfo.decks = decks.length > 0;
      totalItems += decks.length;
    }
  } catch (err) {}
  
  // Vérifier thèmes
  try {
    const themesStr = localStorage.getItem('themes');
    if (themesStr) {
      const themes = JSON.parse(themesStr);
      storageInfo.themes = themes.length > 0;
      totalItems += themes.length;
    }
  } catch (err) {}
  
  // Vérifier flashcards
  try {
    const flashcardsStr = localStorage.getItem('flashcards');
    if (flashcardsStr) {
      const flashcards = JSON.parse(flashcardsStr);
      storageInfo.flashcards = flashcards.length > 0;
      totalItems += flashcards.length;
    }
  } catch (err) {}
  
  // Vérifier codes de partage
  try {
    const sharedCodesStr = localStorage.getItem('sharedCodes');
    if (sharedCodesStr) {
      const sharedCodes = JSON.parse(sharedCodesStr);
      storageInfo.sharedCodes = sharedCodes.length > 0;
      totalItems += sharedCodes.length;
    }
  } catch (err) {}
  
  // Vérifier decks importés
  try {
    const importedDecksStr = localStorage.getItem('importedDecks');
    if (importedDecksStr) {
      const importedDecks = JSON.parse(importedDecksStr);
      storageInfo.importedDecks = importedDecks.length > 0;
      totalItems += importedDecks.length;
    }
  } catch (err) {}
  
  return {
    hasData: Object.values(storageInfo).some(value => value),
    storageInfo,
    totalItems
  };
};