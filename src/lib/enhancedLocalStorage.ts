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
      localStorage.setItem(prefixedKey, serializedValue);
    } catch (e) {
      console.error(`Erreur lors du stockage de "${key}" dans localStorage:`, e);
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
    return this.get<T[]>(key, { defaultValue: [] });
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