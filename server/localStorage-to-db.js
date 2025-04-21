import pg from 'pg';
import { v4 as uuidv4 } from 'uuid';
const { Pool } = pg;

// Fonction pour récupérer les données de localStorage (à appeler depuis le navigateur)
function getLocalStorageData() {
  // Récupérer les données de localStorage
  const data = {
    users: JSON.parse(localStorage.getItem('users') || '[]'),
    decks: JSON.parse(localStorage.getItem('decks') || '[]'),
    themes: JSON.parse(localStorage.getItem('themes') || '[]'),
    flashcards: JSON.parse(localStorage.getItem('flashcards') || '[]'),
    sharedCodes: JSON.parse(localStorage.getItem('sharedCodes') || '[]'),
    importedDecks: JSON.parse(localStorage.getItem('importedDecks') || '[]')
  };
  
  return data;
}

// Fonction pour migrer les données vers PostgreSQL (côté serveur)
async function migrateDataToDB(data) {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL n'est pas défini");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Migrer les utilisateurs
    console.log(`Migration de ${data.users.length} utilisateurs...`);
    const users = [];
    for (const user of data.users) {
      const [dbUser] = await client.query(`
        INSERT INTO users (external_id, name, email, avatar, bio)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (external_id) DO UPDATE 
        SET name = $2, email = $3, avatar = $4, bio = $5
        RETURNING *
      `, [
        user.id || uuidv4(),
        user.name || 'Utilisateur',
        user.email || `user_${uuidv4().substring(0, 8)}@example.com`,
        user.avatar || null,
        user.bio || null
      ]);
      users.push({ ...user, dbId: dbUser.id });
    }

    // 2. Migrer les decks
    console.log(`Migration de ${data.decks.length} decks...`);
    const decks = [];
    for (const deck of data.decks) {
      // Trouver l'utilisateur correspondant ou utiliser un par défaut
      let authorId = 1; // ID par défaut
      const user = users.find(u => u.id === deck.authorId);
      if (user && user.dbId) {
        authorId = user.dbId;
      }

      const [dbDeck] = await client.query(`
        INSERT INTO decks (
          external_id, title, description, cover_image, 
          author_id, is_public, is_published, published_at, tags
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (external_id) DO UPDATE 
        SET title = $2, description = $3, cover_image = $4,
            is_public = $6, is_published = $7, published_at = $8, tags = $9
        RETURNING *
      `, [
        deck.id || uuidv4(),
        deck.title || 'Deck sans titre',
        deck.description || 'Pas de description',
        deck.coverImage || null,
        authorId,
        deck.isPublic || false,
        deck.isPublished || false,
        deck.publishedAt ? new Date(deck.publishedAt) : null,
        deck.tags || []
      ]);
      decks.push({ ...deck, dbId: dbDeck.id });
    }

    // 3. Migrer les thèmes
    console.log(`Migration de ${data.themes.length} thèmes...`);
    const themes = [];
    for (const theme of data.themes) {
      // Trouver le deck correspondant
      let deckId = null;
      const deck = decks.find(d => d.id === theme.deckId);
      if (deck && deck.dbId) {
        deckId = deck.dbId;
      } else {
        console.warn(`Deck introuvable pour le thème ${theme.id}, ignoré`);
        continue;
      }

      const [dbTheme] = await client.query(`
        INSERT INTO themes (
          external_id, deck_id, title, description, cover_image
        )
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (external_id) DO UPDATE 
        SET deck_id = $2, title = $3, description = $4, cover_image = $5
        RETURNING *
      `, [
        theme.id || uuidv4(),
        deckId,
        theme.title || 'Thème sans titre',
        theme.description || 'Pas de description',
        theme.coverImage || null
      ]);
      themes.push({ ...theme, dbId: dbTheme.id });
    }

    // 4. Migrer les flashcards
    console.log(`Migration de ${data.flashcards.length} flashcards...`);
    for (const card of data.flashcards) {
      // Trouver le deck correspondant
      let deckId = null;
      const deck = decks.find(d => d.id === card.deckId);
      if (deck && deck.dbId) {
        deckId = deck.dbId;
      } else {
        console.warn(`Deck introuvable pour la flashcard ${card.id}, ignorée`);
        continue;
      }

      // Trouver le thème correspondant (optionnel)
      let themeId = null;
      if (card.themeId) {
        const theme = themes.find(t => t.id === card.themeId);
        if (theme && theme.dbId) {
          themeId = theme.dbId;
        }
      }

      await client.query(`
        INSERT INTO flashcards (
          external_id, deck_id, theme_id, front, back
        )
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (external_id) DO UPDATE 
        SET deck_id = $2, theme_id = $3, front = $4, back = $5
        RETURNING *
      `, [
        card.id || uuidv4(),
        deckId,
        themeId,
        card.front || { text: "Question" },
        card.back || { text: "Réponse" }
      ]);
    }

    // 5. Migrer les codes de partage
    if (data.sharedCodes && data.sharedCodes.length > 0) {
      console.log(`Migration de ${data.sharedCodes.length} codes de partage...`);
      for (const code of data.sharedCodes) {
        // Trouver le deck correspondant
        let deckId = null;
        const deck = decks.find(d => d.id === code.deckId);
        if (deck && deck.dbId) {
          deckId = deck.dbId;
        } else {
          console.warn(`Deck introuvable pour le code ${code.code}, ignoré`);
          continue;
        }

        await client.query(`
          INSERT INTO shared_codes (
            code, deck_id, expires_at
          )
          VALUES ($1, $2, $3)
          ON CONFLICT (code) DO UPDATE 
          SET deck_id = $2, expires_at = $3
          RETURNING *
        `, [
          code.code || uuidv4().substring(0, 8),
          deckId,
          code.expiresAt ? new Date(code.expiresAt) : null
        ]);
      }
    }

    // 6. Migrer les decks importés
    if (data.importedDecks && data.importedDecks.length > 0) {
      console.log(`Migration de ${data.importedDecks.length} decks importés...`);
      for (const imported of data.importedDecks) {
        // Trouver le deck local correspondant
        let localDeckId = null;
        const deck = decks.find(d => d.id === imported.localDeckId);
        if (deck && deck.dbId) {
          localDeckId = deck.dbId;
        } else {
          console.warn(`Deck local introuvable pour l'import ${imported.id}, ignoré`);
          continue;
        }

        await client.query(`
          INSERT INTO imported_decks (
            original_deck_id, local_deck_id
          )
          VALUES ($1, $2)
          ON CONFLICT (local_deck_id) DO UPDATE 
          SET original_deck_id = $1
          RETURNING *
        `, [
          imported.originalDeckId || uuidv4(),
          localDeckId
        ]);
      }
    }

    await client.query('COMMIT');
    console.log("Migration terminée avec succès");
    return { success: true, message: "Migration terminée avec succès" };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Erreur lors de la migration:", error);
    return { success: false, error: error.message };
  } finally {
    client.release();
    await pool.end();
  }
}

// Fonction pour générer un script de migration à exécuter côté client
export function generateMigrationScript() {
  return `
    // Récupérer les données de localStorage
    const data = {
      users: JSON.parse(localStorage.getItem('users') || '[]'),
      decks: JSON.parse(localStorage.getItem('decks') || '[]'),
      themes: JSON.parse(localStorage.getItem('themes') || '[]'),
      flashcards: JSON.parse(localStorage.getItem('flashcards') || '[]'),
      sharedCodes: JSON.parse(localStorage.getItem('sharedCodes') || '[]'),
      importedDecks: JSON.parse(localStorage.getItem('importedDecks') || '[]')
    };
    
    // Envoyer les données au serveur
    fetch('/api/admin/migrate-to-db', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
      console.log('Résultat de la migration:', result);
      if (result.success) {
        alert('Migration terminée avec succès');
      } else {
        alert('Erreur lors de la migration: ' + result.error);
      }
    })
    .catch(error => {
      console.error('Erreur:', error);
      alert('Erreur lors de la communication avec le serveur');
    });
  `;
}

export { getLocalStorageData, migrateDataToDB };