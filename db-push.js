import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

async function pushSchemaToDatabase() {
  console.log('Génération et application du schéma à la base de données...');
  
  try {
    // Exécuter drizzle-kit push:pg
    const { stdout, stderr } = await execPromise('npx drizzle-kit push:pg');
    
    if (stderr) {
      console.error('Erreurs lors de l\'exécution de drizzle-kit push:pg:', stderr);
    }
    
    console.log('Résultat de drizzle-kit push:pg:', stdout);
    console.log('Schéma appliqué avec succès à la base de données!');
    
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de l\'application du schéma:', error);
    return { success: false, error: error.message };
  }
}

// Exécuter la fonction pour pousser le schéma vers la base de données
pushSchemaToDatabase();