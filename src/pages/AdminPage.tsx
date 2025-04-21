import React from 'react';
import { Layout } from '@/components/Layout';
import DatabaseMigrationPanel from '@/components/admin/DatabaseMigrationPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, Shield, Settings } from 'lucide-react';

export default function AdminPage() {
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Administration
          </h1>
        </div>
        
        <Tabs defaultValue="database" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
            <TabsTrigger value="database" className="flex gap-2 items-center">
              <Database className="h-4 w-4" />
              Base de données
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex gap-2 items-center">
              <Settings className="h-4 w-4" />
              Paramètres
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="database" className="mt-4">
            <DatabaseMigrationPanel />
          </TabsContent>
          
          <TabsContent value="settings" className="mt-4">
            <div className="bg-card border rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">Paramètres de l'application</h3>
              <p className="text-muted-foreground">
                Les paramètres de l'application seront disponibles prochainement.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}