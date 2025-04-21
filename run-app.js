// Script pour lancer l'application avec gestion de base de données
import { exec } from 'child_process';

// Vérifie la base de données puis lance l'application
exec('node scripts/db-check.js', (error, stdout, stderr) => {
  if (error) {
    console.error('Erreur lors de la vérification de la base de données:', error);
    console.error('Tentative de démarrage de l\'application sans vérification...');
  } else {
    console.log('Résultat de la vérification:', stdout);
  }
  
  // Lance l'application
  console.log('Démarrage de l\'application...');
  exec('npm run dev', (err, out, stdErr) => {
    if (err) {
      console.error('Erreur au démarrage de l\'application:', err);
      process.exit(1);
    }
    console.log(out);
    if (stdErr) console.error(stdErr);
  });
});