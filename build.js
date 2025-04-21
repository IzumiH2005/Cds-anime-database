import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

async function buildProduction() {
  try {
    console.log('Vérification de la base de données...');
    
    // Vérifier que la base de données est accessible
    try {
      await new Promise((resolve, reject) => {
        exec('node scripts/db-check.js', (error, stdout, stderr) => {
          if (error) {
            reject(new Error(`Erreur lors de la vérification de la base de données: ${error.message}`));
          } else {
            console.log('Base de données vérifiée avec succès.');
            resolve();
          }
        });
      });
    } catch (error) {
      console.warn('Avertissement:', error.message);
      console.warn('Poursuite du build malgré l\'erreur de base de données...');
    }
    
    // Générer le build de production avec Vite
    console.log('Génération du build de production...');
    await new Promise((resolve, reject) => {
      exec('npm run build', (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Erreur lors de la génération du build: ${error.message}`));
        } else {
          console.log(stdout);
          resolve();
        }
      });
    });
    
    console.log('Build de production généré avec succès dans le dossier dist/');
    
    // Créer le fichier de configuration pour le déploiement
    try {
      const configContent = {
        name: "CDS Flashcard Base",
        version: "1.0.0",
        scripts: {
          start: "node server/server.js"
        },
        engines: {
          node: ">=18.0.0"
        }
      };
      
      await fs.writeFile(
        path.join(process.cwd(), 'dist', 'deployment-config.json'),
        JSON.stringify(configContent, null, 2)
      );
      
      console.log('Configuration de déploiement créée avec succès.');
    } catch (configError) {
      console.warn('Avertissement: Impossible de créer la configuration de déploiement:', configError.message);
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors du build de production:', error);
    return false;
  }
}

// Exécuter le build de production
buildProduction();