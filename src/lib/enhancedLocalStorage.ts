import { v4 as uuidv4 } from 'uuid';

// Type pour les options
interface StorageOptions {
  prefix?: string;
  defaultValue?: any;
}

// Classe pour gérer le localStorage avec des fonctionnalités avancées
class EnhancedLocalStorage {
  private prefix: string;
  
  constructor(prefix: string = 'app') {
    this.prefix = prefix;
  }
  
  // Préfixer les clés
  private getKey(key: string): string {
    return `${this.prefix}-${key}`;
  }
  
  // Vérifier si localStorage est disponible
  private isLocalStorageAvailable(): boolean {
    try {
      const testKey = "__test__";
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }
  
  // Obtenir des données
  get<T>(key: string, options: StorageOptions = {}): T {
    if (!this.isLocalStorageAvailable()) {
      console.warn("localStorage n'est pas disponible");
      return options.defaultValue || null;
    }
    
    const prefixedKey = this.getKey(key);
    const item = localStorage.getItem(prefixedKey);
    
    if (item === null) {
      return options.defaultValue || null;
    }
    
    try {
      return JSON.parse(item);
    } catch (e) {
      console.error(`Erreur lors de la récupération de "${key}" depuis localStorage:`, e);
      return item as unknown as T;
    }
  }
  
  // Stocker des données
  set<T>(key: string, value: T): void {
    if (!this.isLocalStorageAvailable()) {
      console.warn("localStorage n'est pas disponible");
      return;
    }
    
    const prefixedKey = this.getKey(key);
    
    try {
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
      
      // Vérifier la taille avant de sauvegarder
      const estimatedSize = new Blob([serializedValue]).size;
      
      // Si la taille est trop grande, essayons de compresser ou diviser les données
      if (estimatedSize > 4500000) { // ~4.5MB pour être prudent
        console.warn(`Données trop volumineuses pour "${key}" (${estimatedSize} bytes). Compression en cours...`);
        
        // Pour les tableaux, nous pouvons les diviser en plusieurs parties
        if (Array.isArray(value)) {
          const chunks = this.chunkArray(value, 50); // Diviser en chunks de 50 éléments
          
          // Stocker chaque chunk séparément
          chunks.forEach((chunk, index) => {
            const chunkKey = `${prefixedKey}_chunk_${index}`;
            const chunkValue = JSON.stringify(chunk);
            localStorage.setItem(chunkKey, chunkValue);
          });
          
          // Stocker les métadonnées
          const metadata = {
            isChunked: true,
            totalChunks: chunks.length,
            originalKey: prefixedKey
          };
          localStorage.setItem(`${prefixedKey}_metadata`, JSON.stringify(metadata));
          localStorage.setItem(prefixedKey, JSON.stringify({ isChunkedData: true }));
          
          return;
        }
      }
      
      localStorage.setItem(prefixedKey, serializedValue);
    } catch (e) {
      console.error(`Erreur lors du stockage de "${key}" dans localStorage:`, e);
      
      // Si l'erreur est due à la limite de quota, essayons de libérer de l'espace
      if (e instanceof DOMException && 
          (e.name === 'QuotaExceededError' || 
           e.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
        this.handleStorageLimit(key, value);
      }
    }
  }
  
  // Méthode auxiliaire pour diviser un tableau en plus petits morceaux
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }
  
  // Gérer le dépassement de la limite de stockage
  private handleStorageLimit<T>(key: string, value: T): void {
    console.warn("Limite de stockage atteinte, tentative de libération d'espace...");
    
    // Stratégie 1: Supprimer les anciennes données temporaires
    const keysToKeep = ['decks', 'themes', 'cards', 'users', 'session'];
    const prefixedKeysToKeep = keysToKeep.map(k => this.getKey(k));
    
    Object.keys(localStorage).forEach(storageKey => {
      if (storageKey.startsWith(`${this.prefix}-`) && 
          !prefixedKeysToKeep.some(k => storageKey.startsWith(k))) {
        localStorage.removeItem(storageKey);
      }
    });
    
    // Réessayer après nettoyage
    try {
      const prefixedKey = this.getKey(key);
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(prefixedKey, serializedValue);
    } catch (e) {
      console.error("Impossible de stocker les données même après nettoyage", e);
    }
  }
  
  // Supprimer des données
  remove(key: string): void {
    if (!this.isLocalStorageAvailable()) {
      return;
    }
    
    const prefixedKey = this.getKey(key);
    localStorage.removeItem(prefixedKey);
  }
  
  // Vider toutes les données avec ce préfixe
  clear(): void {
    if (!this.isLocalStorageAvailable()) {
      return;
    }
    
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(`${this.prefix}-`)) {
        localStorage.removeItem(key);
      }
    });
  }
  
  // Manipuler des tableaux
  getArray<T>(key: string): T[] {
    const data = this.get<any>(key, { defaultValue: [] });
    
    // Vérifier si les données sont en format chunked
    if (data && typeof data === 'object' && data.isChunkedData) {
      // Récupérer les métadonnées
      const prefixedKey = this.getKey(key);
      const metadataKey = `${prefixedKey}_metadata`;
      const metadata = JSON.parse(localStorage.getItem(metadataKey) || '{"totalChunks": 0}');
      
      if (metadata.isChunked) {
        // Reconstruire le tableau à partir des chunks
        const result: T[] = [];
        for (let i = 0; i < metadata.totalChunks; i++) {
          const chunkKey = `${prefixedKey}_chunk_${i}`;
          const chunkData = localStorage.getItem(chunkKey);
          
          if (chunkData) {
            const chunk = JSON.parse(chunkData) as T[];
            result.push(...chunk);
          }
        }
        return result;
      }
    }
    
    return Array.isArray(data) ? data : [];
  }
  
  // Ajouter un élément à un tableau
  addToArray<T extends { id?: string | number }>(key: string, item: T): T {
    const array = this.getArray<T>(key);
    
    // Ajouter un ID unique si non fourni
    if (!item.id) {
      item.id = uuidv4();
    }
    
    array.push(item);
    this.set(key, array);
    return item;
  }
  
  // Mettre à jour un élément dans un tableau
  updateInArray<T extends { id: string | number }>(key: string, item: T): boolean {
    const array = this.getArray<T>(key);
    const index = array.findIndex(i => i.id === item.id);
    
    if (index === -1) {
      return false;
    }
    
    array[index] = { ...array[index], ...item };
    this.set(key, array);
    return true;
  }
  
  // Supprimer un élément d'un tableau
  removeFromArray<T extends { id: string | number }>(key: string, id: string | number): boolean {
    const array = this.getArray<T>(key);
    const filteredArray = array.filter(item => item.id !== id);
    
    if (filteredArray.length === array.length) {
      return false;
    }
    
    this.set(key, filteredArray);
    return true;
  }
  
  // Obtenir un élément d'un tableau par ID
  getFromArray<T extends { id: string | number }>(key: string, id: string | number): T | null {
    const array = this.getArray<T>(key);
    return array.find(item => item.id === id) || null;
  }
}

// Exporter une instance avec le préfixe 'flashcards'
export const storage = new EnhancedLocalStorage('flashcards');

// Exporter la classe pour les tests ou les instances personnalisées
export default EnhancedLocalStorage;