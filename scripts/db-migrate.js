import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db, pool } from '../server/db.ts';

// Fonction pour effectuer les migrations
async function runMigrations() {
  console.log('Démarrage des migrations...');
  
  try {
    // Exécuter les migrations
    await migrate(db, { migrationsFolder: 'drizzle' });
    console.log('Migrations terminées avec succès');
  } catch (error) {
    console.error('Erreur lors des migrations:', error);
    process.exit(1);
  } finally {
    // Fermer la connexion à la base de données
    await pool.end();
  }
}

// Exécuter les migrations
runMigrations();