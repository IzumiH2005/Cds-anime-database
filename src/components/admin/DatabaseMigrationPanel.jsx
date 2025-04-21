import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/toast";
import { ArrowRightCircle, CheckCircle, Database, XCircle } from 'lucide-react';

// Fonction pour exporter les données de localStorage
const exportDataFromLocalStorage = async () => {
  // Récupérer les données de localStorage/IndexedDB
  const data = {
    users: [],
    decks: [],
    themes: [],
    flashcards: [],
    sharedCodes: [],
    importedDecks: []
  };
  
  // Simuler un chargement des données de localStorage
  // En production, on devrait implémenter une fonction qui récupère les vraies données
  try {
    // Essayer de récupérer les utilisateurs
    const userStr = localStorage.getItem('users');
    if (userStr) {
      data.users = JSON.parse(userStr);
    }
    
    // Essayer de récupérer les decks
    const decksStr = localStorage.getItem('decks');
    if (decksStr) {
      data.decks = JSON.parse(decksStr);
    }
    
    // Essayer de récupérer les thèmes
    const themesStr = localStorage.getItem('themes');
    if (themesStr) {
      data.themes = JSON.parse(themesStr);
    }
    
    // Essayer de récupérer les flashcards
    const flashcardsStr = localStorage.getItem('flashcards');
    if (flashcardsStr) {
      data.flashcards = JSON.parse(flashcardsStr);
    }
    
    // Essayer de récupérer les codes de partage
    const sharedCodesStr = localStorage.getItem('sharedCodes');
    if (sharedCodesStr) {
      data.sharedCodes = JSON.parse(sharedCodesStr);
    }
    
    // Essayer de récupérer les decks importés
    const importedDecksStr = localStorage.getItem('importedDecks');
    if (importedDecksStr) {
      data.importedDecks = JSON.parse(importedDecksStr);
    }
    
    return { success: true, data };
  } catch (error) {
    console.error("Erreur lors de l'exportation des données:", error);
    return { success: false, error: error.message };
  }
};

// Fonction pour migrer les données vers PostgreSQL
const migrateDataToPostgres = async (data) => {
  try {
    // Envoyer les données au serveur pour migration
    const response = await fetch('/api/admin/migrate-to-db', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erreur lors de la migration des données');
    }
    
    const result = await response.json();
    return { success: true, result };
  } catch (error) {
    console.error('Erreur lors de la migration vers PostgreSQL:', error);
    return { success: false, error: error.message };
  }
};

// Fonction pour vérifier l'état de la base de données
const checkDatabaseState = async () => {
  try {
    const response = await fetch('/api/admin/db-status');
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erreur lors de la vérification de la base de données');
    }
    
    const result = await response.json();
    return { success: true, result };
  } catch (error) {
    console.error('Erreur lors de la vérification de la base de données:', error);
    return { success: false, error: error.message };
  }
};

export function DatabaseMigrationPanel() {
  const [migrationStatus, setMigrationStatus] = useState('idle'); // idle, exporting, migrating, success, error
  const [dbStatus, setDbStatus] = useState(null);
  const [exportedData, setExportedData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [migrationStats, setMigrationStats] = useState(null);
  
  // Gérer le clic sur le bouton de vérification de la base de données
  const handleCheckDatabase = async () => {
    setMigrationStatus('checking');
    
    try {
      const result = await checkDatabaseState();
      
      if (result.success) {
        setDbStatus(result.result);
        toast({
          title: 'Vérification réussie',
          description: 'La base de données est accessible',
          status: 'success',
        });
      } else {
        setErrorMessage(result.error);
        toast({
          title: 'Erreur de vérification',
          description: result.error,
          status: 'error',
        });
      }
    } catch (error) {
      setErrorMessage(error.message);
      toast({
        title: 'Erreur inattendue',
        description: error.message,
        status: 'error',
      });
    } finally {
      setMigrationStatus('idle');
    }
  };
  
  // Gérer le clic sur le bouton d'exportation des données
  const handleExportData = async () => {
    setMigrationStatus('exporting');
    setErrorMessage('');
    
    try {
      const result = await exportDataFromLocalStorage();
      
      if (result.success) {
        setExportedData(result.data);
        toast({
          title: 'Exportation réussie',
          description: 'Les données ont été exportées avec succès',
          status: 'success',
        });
        setMigrationStatus('exported');
      } else {
        setErrorMessage(result.error);
        toast({
          title: 'Erreur d\'exportation',
          description: result.error,
          status: 'error',
        });
        setMigrationStatus('error');
      }
    } catch (error) {
      setErrorMessage(error.message);
      toast({
        title: 'Erreur inattendue',
        description: error.message,
        status: 'error',
      });
      setMigrationStatus('error');
    }
  };
  
  // Gérer le clic sur le bouton de migration des données
  const handleMigrateData = async () => {
    if (!exportedData) {
      toast({
        title: 'Erreur',
        description: 'Veuillez d\'abord exporter les données',
        status: 'error',
      });
      return;
    }
    
    setMigrationStatus('migrating');
    setErrorMessage('');
    
    try {
      const result = await migrateDataToPostgres(exportedData);
      
      if (result.success) {
        setMigrationStats(result.result);
        toast({
          title: 'Migration réussie',
          description: 'Les données ont été migrées avec succès vers PostgreSQL',
          status: 'success',
        });
        setMigrationStatus('success');
      } else {
        setErrorMessage(result.error);
        toast({
          title: 'Erreur de migration',
          description: result.error,
          status: 'error',
        });
        setMigrationStatus('error');
      }
    } catch (error) {
      setErrorMessage(error.message);
      toast({
        title: 'Erreur inattendue',
        description: error.message,
        status: 'error',
      });
      setMigrationStatus('error');
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Migration de données vers PostgreSQL
        </CardTitle>
        <CardDescription>
          Migrez vos données de localStorage vers la base de données PostgreSQL pour une persistance permanente.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="migration" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="migration">Migration</TabsTrigger>
            <TabsTrigger value="status">État de la BD</TabsTrigger>
          </TabsList>
          
          <TabsContent value="migration" className="space-y-4">
            <div className="rounded-md bg-muted p-4 mt-4">
              <h3 className="text-sm font-medium mb-2">Étapes de migration</h3>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full border bg-background">
                      1
                    </span>
                    <span>Exporter depuis localStorage</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleExportData}
                    disabled={migrationStatus === 'exporting' || migrationStatus === 'migrating'}
                  >
                    {migrationStatus === 'exporting' ? 'Exportation...' : 'Exporter'}
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full border bg-background">
                      2
                    </span>
                    <span>Migrer vers PostgreSQL</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleMigrateData}
                    disabled={!exportedData || migrationStatus === 'migrating'}
                  >
                    {migrationStatus === 'migrating' ? 'Migration...' : 'Migrer'}
                  </Button>
                </div>
              </div>
            </div>
            
            {/* État de la migration */}
            {migrationStatus === 'success' && (
              <div className="rounded-md bg-green-50 p-4 mt-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      Migration réussie
                    </h3>
                    {migrationStats && (
                      <div className="mt-2 text-sm text-green-700">
                        <p>Données migrées:</p>
                        <ul className="list-disc pl-5 space-y-1 mt-1">
                          <li>Utilisateurs: {migrationStats.users || 0}</li>
                          <li>Decks: {migrationStats.decks || 0}</li>
                          <li>Thèmes: {migrationStats.themes || 0}</li>
                          <li>Flashcards: {migrationStats.flashcards || 0}</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {migrationStatus === 'error' && (
              <div className="rounded-md bg-red-50 p-4 mt-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <XCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Erreur lors de la migration
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      {errorMessage}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {exportedData && migrationStatus !== 'error' && (
              <div className="rounded-md bg-blue-50 p-4 mt-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <ArrowRightCircle className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Données prêtes pour la migration
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>Données à migrer:</p>
                      <ul className="list-disc pl-5 space-y-1 mt-1">
                        <li>Utilisateurs: {exportedData.users.length || 0}</li>
                        <li>Decks: {exportedData.decks.length || 0}</li>
                        <li>Thèmes: {exportedData.themes.length || 0}</li>
                        <li>Flashcards: {exportedData.flashcards.length || 0}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="status">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">État de la base de données</h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCheckDatabase}
                >
                  Vérifier
                </Button>
              </div>
              
              {dbStatus && (
                <div className="rounded-md bg-muted p-4">
                  <h4 className="text-sm font-medium mb-2">Informations de la base de données</h4>
                  
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="font-medium">État:</span>
                      <span className="text-green-600">Connecté</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="font-medium">Tables:</span>
                      <span>{dbStatus.tables ? dbStatus.tables.length : 0} tables</span>
                    </div>
                    
                    {dbStatus.tables && dbStatus.tables.length > 0 && (
                      <div>
                        <span className="text-sm font-medium">Tables disponibles:</span>
                        <ul className="list-disc pl-5 space-y-1 mt-1 text-sm">
                          {dbStatus.tables.map((table, index) => (
                            <li key={index}>{table}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t p-4">
        <div className="text-xs text-muted-foreground">
          La migration peut prendre du temps selon la quantité de données.
        </div>
      </CardFooter>
    </Card>
  );
}