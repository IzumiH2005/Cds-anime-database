import express from 'express';
import { dbStatusHandler } from './db-status.js';
import { migrateToDbHandler } from './migrate-to-db.js';

const router = express.Router();

// Route pour vérifier l'état de la base de données
router.get('/db-status', dbStatusHandler);

// Route pour migrer les données de localStorage vers PostgreSQL
router.post('/migrate-to-db', migrateToDbHandler);

export default router;