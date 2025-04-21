import { pool } from '../../db.js';

export async function dbStatusHandler(req, res) {
  try {
    // Tester la connexion à la base de données
    const connectionResult = await pool.query('SELECT NOW() as now');
    
    // Vérifier les tables existantes
    const tablesResult = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    // Récupérer le nombre de lignes dans les tables principales
    const counts = {};
    
    if (tablesResult.rows.length > 0) {
      const tableNames = tablesResult.rows.map(row => row.table_name);
      
      // Vérifier si la table users existe
      if (tableNames.includes('users')) {
        const usersCount = await pool.query('SELECT COUNT(*) as count FROM users');
        counts.users = parseInt(usersCount.rows[0].count);
      }
      
      // Vérifier si la table decks existe
      if (tableNames.includes('decks')) {
        const decksCount = await pool.query('SELECT COUNT(*) as count FROM decks');
        counts.decks = parseInt(decksCount.rows[0].count);
      }
      
      // Vérifier si la table themes existe
      if (tableNames.includes('themes')) {
        const themesCount = await pool.query('SELECT COUNT(*) as count FROM themes');
        counts.themes = parseInt(themesCount.rows[0].count);
      }
      
      // Vérifier si la table flashcards existe
      if (tableNames.includes('flashcards')) {
        const flashcardsCount = await pool.query('SELECT COUNT(*) as count FROM flashcards');
        counts.flashcards = parseInt(flashcardsCount.rows[0].count);
      }
      
      // Vérifier si la table shared_codes existe
      if (tableNames.includes('shared_codes')) {
        const sharedCodesCount = await pool.query('SELECT COUNT(*) as count FROM shared_codes');
        counts.sharedCodes = parseInt(sharedCodesCount.rows[0].count);
      }
      
      // Vérifier si la table imported_decks existe
      if (tableNames.includes('imported_decks')) {
        const importedDecksCount = await pool.query('SELECT COUNT(*) as count FROM imported_decks');
        counts.importedDecks = parseInt(importedDecksCount.rows[0].count);
      }
    }
    
    return res.status(200).json({
      success: true,
      connected: true,
      tables: tablesResult.rows.map(row => row.table_name),
      counts,
      timestamp: connectionResult.rows[0].now
    });
  } catch (error) {
    console.error('Erreur lors de la vérification de la base de données:', error);
    
    return res.status(500).json({
      success: false,
      connected: false,
      error: error.message
    });
  }
}