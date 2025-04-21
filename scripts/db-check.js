import { pool, db } from '../server/db.ts';
import fs from 'fs';

// Fonction pour vérifier la connexion à la base de données
async function checkDatabase() {
  console.log('Connexion à la base de données...');
  
  try {
    // Tester la connexion à la base de données
    const result = await pool.query('SELECT NOW() as now');
    console.log('Connexion à la base de données réussie:', result.rows[0]);
    
    // Vérifier les tables existantes
    const tables = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('Tables existantes:');
    tables.rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });
    
    return {
      success: true,
      tables: tables.rows.map(row => row.table_name)
    };
  } catch (error) {
    console.error('Erreur de connexion à la base de données:', error);
    return {
      success: false,
      error: error.message
    };
  } finally {
    // Fermer la connexion à la base de données
    await pool.end();
  }
}

// Exécuter la vérification
checkDatabase();