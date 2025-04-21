import { db } from '../../db.js';
import { users, decks, themes, flashcards, sharedCodes, importedDecks } from '../../../shared/schema.js';
import { v4 as uuidv4 } from 'uuid';

export async function migrateToDbHandler(req, res) {
  const data = req.body;
  
  if (!data) {
    return res.status(400).json({
      success: false,
      message: 'Aucune donnée fournie pour la migration'
    });
  }
  
  // Statistiques pour suivre le nombre d'éléments migrés
  const stats = {
    users: 0,
    decks: 0,
    themes: 0,
    flashcards: 0,
    sharedCodes: 0,
    importedDecks: 0
  };
  
  try {
    // Migrer les utilisateurs
    if (data.users && Array.isArray(data.users) && data.users.length > 0) {
      // Créer une map pour garder trace des IDs originaux et nouveaux
      const userIdMap = new Map();
      
      for (const user of data.users) {
        try {
          // Préparer les données utilisateur
          const userInsert = {
            externalId: user.id || uuidv4(),
            name: user.name || 'Utilisateur',
            email: user.email || `user_${Date.now()}@example.com`,
            avatar: user.avatar || null,
            bio: user.bio || null,
            createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
            updatedAt: user.updatedAt ? new Date(user.updatedAt) : new Date()
          };
          
          // Insérer l'utilisateur
          const [insertedUser] = await db.insert(users).values(userInsert).returning();
          
          // Mémoriser la correspondance des IDs
          userIdMap.set(user.id, insertedUser.id);
          
          stats.users++;
        } catch (err) {
          console.error('Erreur lors de la migration d\'un utilisateur:', err);
          // Continuer avec le prochain utilisateur
        }
      }
      
      // Migrer les decks
      if (data.decks && Array.isArray(data.decks) && data.decks.length > 0) {
        // Créer une map pour garder trace des IDs originaux et nouveaux des decks
        const deckIdMap = new Map();
        
        for (const deck of data.decks) {
          try {
            // Trouver l'ID de l'auteur (s'il est disponible)
            const authorId = deck.authorId && userIdMap.has(deck.authorId) 
              ? userIdMap.get(deck.authorId) 
              : (userIdMap.size > 0 ? userIdMap.values().next().value : 1);
            
            // Préparer les données du deck
            const deckInsert = {
              externalId: deck.id || uuidv4(),
              title: deck.title || 'Deck sans titre',
              description: deck.description || 'Pas de description',
              coverImage: deck.coverImage || null,
              authorId,
              isPublic: deck.isPublic || false,
              isPublished: deck.isPublished || false,
              publishedAt: deck.publishedAt ? new Date(deck.publishedAt) : null,
              tags: deck.tags || [],
              createdAt: deck.createdAt ? new Date(deck.createdAt) : new Date(),
              updatedAt: deck.updatedAt ? new Date(deck.updatedAt) : new Date()
            };
            
            // Insérer le deck
            const [insertedDeck] = await db.insert(decks).values(deckInsert).returning();
            
            // Mémoriser la correspondance des IDs
            deckIdMap.set(deck.id, insertedDeck.id);
            
            stats.decks++;
          } catch (err) {
            console.error('Erreur lors de la migration d\'un deck:', err);
            // Continuer avec le prochain deck
          }
        }
        
        // Migrer les thèmes
        if (data.themes && Array.isArray(data.themes) && data.themes.length > 0) {
          // Créer une map pour garder trace des IDs originaux et nouveaux des thèmes
          const themeIdMap = new Map();
          
          for (const theme of data.themes) {
            try {
              // Trouver l'ID du deck (s'il est disponible)
              if (!theme.deckId || !deckIdMap.has(theme.deckId)) {
                continue; // Ignorer ce thème s'il n'a pas de deck valide
              }
              
              const deckId = deckIdMap.get(theme.deckId);
              
              // Préparer les données du thème
              const themeInsert = {
                externalId: theme.id || uuidv4(),
                deckId,
                title: theme.title || 'Thème sans titre',
                description: theme.description || 'Pas de description',
                coverImage: theme.coverImage || null,
                createdAt: theme.createdAt ? new Date(theme.createdAt) : new Date(),
                updatedAt: theme.updatedAt ? new Date(theme.updatedAt) : new Date()
              };
              
              // Insérer le thème
              const [insertedTheme] = await db.insert(themes).values(themeInsert).returning();
              
              // Mémoriser la correspondance des IDs
              themeIdMap.set(theme.id, insertedTheme.id);
              
              stats.themes++;
            } catch (err) {
              console.error('Erreur lors de la migration d\'un thème:', err);
              // Continuer avec le prochain thème
            }
          }
          
          // Migrer les flashcards
          if (data.flashcards && Array.isArray(data.flashcards) && data.flashcards.length > 0) {
            for (const flashcard of data.flashcards) {
              try {
                // Trouver l'ID du deck (s'il est disponible)
                if (!flashcard.deckId || !deckIdMap.has(flashcard.deckId)) {
                  continue; // Ignorer cette flashcard si elle n'a pas de deck valide
                }
                
                const deckId = deckIdMap.get(flashcard.deckId);
                
                // Trouver l'ID du thème (s'il est disponible)
                let themeId = null;
                if (flashcard.themeId && themeIdMap.has(flashcard.themeId)) {
                  themeId = themeIdMap.get(flashcard.themeId);
                }
                
                // Préparer les données de la flashcard
                const flashcardInsert = {
                  externalId: flashcard.id || uuidv4(),
                  deckId,
                  themeId,
                  front: flashcard.front || { content: 'Recto vide' },
                  back: flashcard.back || { content: 'Verso vide' },
                  createdAt: flashcard.createdAt ? new Date(flashcard.createdAt) : new Date(),
                  updatedAt: flashcard.updatedAt ? new Date(flashcard.updatedAt) : new Date()
                };
                
                // Insérer la flashcard
                await db.insert(flashcards).values(flashcardInsert);
                
                stats.flashcards++;
              } catch (err) {
                console.error('Erreur lors de la migration d\'une flashcard:', err);
                // Continuer avec la prochaine flashcard
              }
            }
          }
          
          // Migrer les codes de partage
          if (data.sharedCodes && Array.isArray(data.sharedCodes) && data.sharedCodes.length > 0) {
            for (const sharedCode of data.sharedCodes) {
              try {
                // Trouver l'ID du deck (s'il est disponible)
                if (!sharedCode.deckId || !deckIdMap.has(sharedCode.deckId)) {
                  continue; // Ignorer ce code de partage s'il n'a pas de deck valide
                }
                
                const deckId = deckIdMap.get(sharedCode.deckId);
                
                // Préparer les données du code de partage
                const sharedCodeInsert = {
                  code: sharedCode.code || `share-${uuidv4().substring(0, 8)}`,
                  deckId,
                  expiresAt: sharedCode.expiresAt ? new Date(sharedCode.expiresAt) : null,
                  createdAt: sharedCode.createdAt ? new Date(sharedCode.createdAt) : new Date()
                };
                
                // Insérer le code de partage
                await db.insert(sharedCodes).values(sharedCodeInsert);
                
                stats.sharedCodes++;
              } catch (err) {
                console.error('Erreur lors de la migration d\'un code de partage:', err);
                // Continuer avec le prochain code de partage
              }
            }
          }
          
          // Migrer les decks importés
          if (data.importedDecks && Array.isArray(data.importedDecks) && data.importedDecks.length > 0) {
            for (const importedDeck of data.importedDecks) {
              try {
                // Trouver l'ID du deck local (s'il est disponible)
                if (!importedDeck.localDeckId || !deckIdMap.has(importedDeck.localDeckId)) {
                  continue; // Ignorer ce deck importé s'il n'a pas de deck local valide
                }
                
                const localDeckId = deckIdMap.get(importedDeck.localDeckId);
                
                // Préparer les données du deck importé
                const importedDeckInsert = {
                  originalDeckId: importedDeck.originalDeckId || uuidv4(),
                  localDeckId,
                  createdAt: importedDeck.createdAt ? new Date(importedDeck.createdAt) : new Date()
                };
                
                // Insérer le deck importé
                await db.insert(importedDecks).values(importedDeckInsert);
                
                stats.importedDecks++;
              } catch (err) {
                console.error('Erreur lors de la migration d\'un deck importé:', err);
                // Continuer avec le prochain deck importé
              }
            }
          }
        }
      }
      
      return res.status(200).json({
        success: true,
        message: 'Migration réussie',
        stats
      });
    } else {
      return res.status(200).json({
        success: true,
        message: 'Aucune donnée d\'utilisateur à migrer',
        stats
      });
    }
  } catch (error) {
    console.error('Erreur lors de la migration des données:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la migration des données',
      error: error.message
    });
  }
}