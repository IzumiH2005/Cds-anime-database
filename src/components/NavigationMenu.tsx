import * as React from "react";
import { Link } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

export default function NavMenu() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Étudier</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <Link
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-indigo-500 to-purple-600 p-6 no-underline outline-none focus:shadow-md"
                    to="/my-decks"
                  >
                    <div className="mt-4 mb-2 text-lg font-medium text-white">
                      Mes Decks
                    </div>
                    <p className="text-sm leading-tight text-white/90">
                      Accédez à vos decks personnels et commencez à étudier.
                    </p>
                  </Link>
                </NavigationMenuLink>
              </li>
              <ListItem to="/study" title="Mode Étude">
                Révisez vos cartes avec différentes méthodes d'apprentissage.
              </ListItem>
              <ListItem to="/stats" title="Statistiques">
                Suivez votre progression et analysez vos performances.
              </ListItem>
              <ListItem to="/learning-methods" title="Méthodes d'apprentissage">
                Découvrez différentes techniques pour mémoriser efficacement.
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Créer</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              <ListItem to="/create" title="Nouveau Deck">
                Créez un nouveau deck de flashcards personnalisé.
              </ListItem>
              <ListItem to="/import" title="Importer">
                Importez un deck partagé par un autre utilisateur.
              </ListItem>
              <ListItem to="/themes" title="Thèmes">
                Organisez vos flashcards par thèmes pour mieux structurer votre apprentissage.
              </ListItem>
              <ListItem to="/share" title="Partager">
                Partagez vos decks avec d'autres utilisateurs.
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link to="/explore" className={navigationMenuTriggerStyle()}>
            Explorer
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

interface ListItemProps extends React.ComponentPropsWithoutRef<"a"> {
  to: string;
  title: string;
  children?: React.ReactNode;
}

const ListItem = React.forwardRef<React.ElementRef<"a">, ListItemProps>(
  ({ className, title, children, to, ...props }, ref) => {
    return (
      <li>
        <NavigationMenuLink asChild>
          <Link
            ref={ref}
            to={to}
            className={cn(
              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
              className
            )}
            {...props}
          >
            <div className="text-sm font-medium leading-none">{title}</div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
              {children}
            </p>
          </Link>
        </NavigationMenuLink>
      </li>
    );
  }
);