import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronDown, UserCircle } from 'lucide-react';

export function ChildSelector() {
  const { currentChild, childProfiles, selectChild } = useAuth();

  if (childProfiles.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={currentChild?.avatar_url} alt={currentChild?.name} />
            <AvatarFallback>
              {currentChild?.name?.charAt(0).toUpperCase() || <UserCircle className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline">{currentChild?.name || 'Sélectionner un enfant'}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Profils enfants</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {childProfiles.map((child) => (
          <DropdownMenuItem
            key={child.id}
            onClick={() => selectChild(child.id)}
            className={currentChild?.id === child.id ? 'bg-accent' : ''}
          >
            <Avatar className="h-6 w-6 mr-2">
              <AvatarImage src={child.avatar_url} alt={child.name} />
              <AvatarFallback>{child.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium">{child.name}</span>
              <span className="text-xs text-muted-foreground">{child.age} ans</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
