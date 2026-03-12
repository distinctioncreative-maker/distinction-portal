import React from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useOrg } from '../OrgContext';
import { base44 } from '@/api/base44Client';
import { Bell, LogOut, Shield, X, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function TopBar() {
  const { user } = useAuth();
  const { isSupportMode, supportMode, exitSupportMode, organization } = useOrg();
  const navigate = useNavigate();
  const initials = (user?.full_name || user?.email || '??').slice(0, 2).toUpperCase();

  return (
    <header className="h-14 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between px-6 flex-shrink-0">
      <div className="flex items-center gap-3">
        {organization && !isSupportMode && (
          <span className="text-sm font-medium text-muted-foreground">{organization.name}</span>
        )}
      </div>

      {/* Support Mode Banner */}
      {isSupportMode && (
        <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
          <Shield className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-xs font-semibold text-amber-500">
            SUPPORT MODE — {supportMode.orgName}
          </span>
          <button onClick={exitSupportMode} className="text-amber-500 hover:text-amber-400">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative" asChild>
          <Link to="/Notifications">
            <Bell className="w-4 h-4" />
          </Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full p-1 hover:bg-muted transition-colors">
              <Avatar className="w-7 h-7">
                <AvatarFallback className="text-[10px] font-semibold bg-accent text-accent-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium truncate">{user?.full_name || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/Profile')}>
              <User className="w-3.5 h-3.5 mr-2" /> Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => base44.auth.logout()}>
              <LogOut className="w-3.5 h-3.5 mr-2" /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}