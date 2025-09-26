import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "./ui/dropdown-menu";
import { useAuth } from "../hooks/useAuth";
import { LogOut, Shield, User, Settings } from "lucide-react";

interface AuthStatusProps {
  showFullInfo?: boolean;
  onSettings?: () => void;
}

export function AuthStatus({ showFullInfo = true, onSettings }: AuthStatusProps) {
  const { user, authenticated, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-muted animate-pulse rounded-full"></div>
        {showFullInfo && (
          <div className="space-y-1">
            <div className="w-20 h-3 bg-muted animate-pulse rounded"></div>
            <div className="w-16 h-2 bg-muted animate-pulse rounded"></div>
          </div>
        )}
      </div>
    );
  }

  if (!authenticated || !user) {
    return null;
  }

  const userInitials = user.name 
    ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : user.email.substring(0, 2).toUpperCase();

  const handleSignOut = async () => {
    await signOut();
  };

  if (!showFullInfo) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-emerald-400 text-black">
                {userInitials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm leading-none">{user.name || 'Usuário'}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {onSettings && (
            <DropdownMenuItem onClick={onSettings}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Configurações</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sair</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-card/30 border border-border">
      <Avatar className="h-10 w-10">
        <AvatarFallback className="bg-emerald-400 text-black">
          {userInitials}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm text-foreground truncate">
            {user.name || 'Usuário'}
          </p>
          <Badge variant="outline" className="text-xs bg-emerald-400/10 border-emerald-400/20 text-emerald-400">
            <Shield className="w-3 h-3 mr-1" />
            {user.role || 'Admin'}
          </Badge>
        </div>
        <p className="text-xs text-foreground/60 truncate">
          {user.email}
        </p>
        {user.last_sign_in_at && (
          <p className="text-xs text-foreground/40">
            Último acesso: {new Date(user.last_sign_in_at).toLocaleDateString('pt-BR')}
          </p>
        )}
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="text-foreground/60 hover:text-foreground">
            <User className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {onSettings && (
            <DropdownMenuItem onClick={onSettings}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Configurações</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={handleSignOut} className="text-red-400">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sair</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}