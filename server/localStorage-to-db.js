import { storage } from './storage.js';
import { v4 as uuidv4 } from 'uuid';

// Récupérer les données du localStorage
function getLocalStorageData() {
  try {
    // Dans un environnement de navigateur, on utiliserait
    // const decks = JSON.parse(localStorage.getItem('flashcards-decks') || '[]');
    // const themes = JSON.parse(localStorage.getItem('flashcards-themes') || '[]');
    // const cards = JSON.parse(localStorage.getItem('flashcards-cards') || '[]');
    
    // Pour les besoins de ce script, on utilise des données statiques
    return {
      decks: [],
      themes: [],
      cards: []
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des données du localStorage:", error);
    return {
      decks: [],
      themes: [],
      cards: []
    };
  }
}

// Migrer les données vers la base de données
async function migrateDataToDB(data) {
  const { decks, themes, cards } = data;
  
  // Créer un utilisateur administrateur s'il n'existe pas
  let adminUser;
  try {
    adminUser = await storage.getUserByExternalId('admin-user');
    if (!adminUser) {
      adminUser = await storage.createUser({
        externalId: 'admin-user',
        name: 'Administrateur',
        email: 'admin@example.com',
        avatar: 'https://api.dicebear.com/7.x/micah/svg?seed=admin',
        bio: 'Administrateur système'
      });
    }
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur admin:", error);
    return;
  }
  
  // Migrer les decks
  for (const deck of decks) {
    try {
      const existingDeck = await storage.getDeckByExternalId(deck.id);
      if (!existingDeck) {
        const newDeck = await storage.createDeck({
          externalId: deck.id,
          title: deck.title,
          description: deck.description || 'Aucune description',
          coverImage: deck.coverImage,
          authorId: adminUser.id,
          isPublic: deck.isPublic || false,
          isPublished: true,
          publishedAt: new Date(),
          tags: deck.tags || []
        });
        
        console.log(`Deck migré: ${newDeck.title}`);
        
        // Migrer les thèmes du deck
        const deckThemes = themes.filter(t => t.deckId === deck.id);
        for (const theme of deckThemes) {
          const newTheme = await storage.createTheme({
            externalId: theme.id,
            deckId: newDeck.id,
            title: theme.title,
            description: theme.description || 'Aucune description',
            coverImage: theme.coverImage
          });
          
          console.log(`Thème migré: ${newTheme.title}`);
          
          // Migrer les cartes du thème
          const themeCards = cards.filter(c => c.themeId === theme.id);
          for (const card of themeCards) {
            await storage.createFlashcard({
              externalId: card.id,
              deckId: newDeck.id,
              themeId: newTheme.id,
              front: card.front,
              back: card.back
            });
          }
        }
        
        // Migrer les cartes sans thème
        const deckCards = cards.filter(c => c.deckId === deck.id && !c.themeId);
        for (const card of deckCards) {
          await storage.createFlashcard({
            externalId: card.id,
            deckId: newDeck.id,
            front: card.front,
            back: card.back
          });
        }
      }
    } catch (error) {
      console.error(`Erreur lors de la migration du deck ${deck.title}:`, error);
    }
  }
  
  console.log("Migration terminée avec succès!");
}

// Fonction pour générer un script de migration
export function generateMigrationScript() {
  const data = getLocalStorageData();
  
  console.log("Génération du script de migration...");
  console.log(`Nombre de decks à migrer: ${data.decks.length}`);
  console.log(`Nombre de thèmes à migrer: ${data.themes.length}`);
  console.log(`Nombre de cartes à migrer: ${data.cards.length}`);
  
  return `
// Script de migration
(async () => {
  try {
    const adminUser = await storage.createUser({
      externalId: 'admin-user',
      name: 'Administrateur',
      email: 'admin@example.com',
      avatar: 'https://api.dicebear.com/7.x/micah/svg?seed=admin',
      bio: 'Administrateur système'
    });
    
    console.log("Utilisateur administrateur créé:", adminUser);
    
    // Ici, code pour migrer les données...
    
    console.log("Migration terminée avec succès!");
  } catch (error) {
    console.error("Erreur lors de la migration:", error);
  }
})();
  `;
}

// Exécuter la migration si appelé directement
if (typeof require !== 'undefined' && require.main === module) {
  const data = getLocalStorageData();
  migrateDataToDB(data)
    .then(() => console.log("Migration terminée"))
    .catch(error => console.error("Erreur de migration:", error))
    .finally(() => process.exit(0));
}