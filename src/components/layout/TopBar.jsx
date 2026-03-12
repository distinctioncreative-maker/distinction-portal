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
    <header className="h-16 border-b border-border/50 bg-card/50 backdrop-blur-2xl flex items-center justify-between px-8 flex-shrink-0">
      <div className="flex items-center gap-4">
        {organization && !isSupportMode && (
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />
            <span className="text-sm font-medium text-foreground/80">{organization.name}</span>
          </div>
        )}
      </div>

      {/* Support Mode Banner */}
      {isSupportMode && (
        <div className="flex items-center gap-3 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 shadow-lg shadow-amber-500/5">
          <Shield className="w-4 h-4 text-amber-400" />
          <span className="text-[13px] font-bold text-amber-400 tracking-wide">
            SUPPORT MODE — {supportMode.orgName}
          </span>
          <button onClick={exitSupportMode} className="text-amber-400 hover:text-amber-300 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative hover:bg-muted/50 rounded-xl" asChild>
          <Link to="/Notifications">
            <Bell className="w-[18px] h-[18px]" />
          </Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 rounded-xl px-3 py-1.5 hover:bg-muted/50 transition-all duration-200">
              <Avatar className="w-8 h-8 ring-2 ring-border/50">
                <AvatarFallback className="text-[11px] font-bold bg-gradient-to-br from-accent/20 to-accent/5 text-accent border border-accent/20">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-2">
            <div className="px-3 py-2 mb-1">
              <p className="text-sm font-semibold truncate">{user?.full_name || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/Profile')} className="rounded-lg">
              <User className="w-4 h-4 mr-2" /> Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => base44.auth.logout()} className="rounded-lg text-destructive">
              <LogOut className="w-4 h-4 mr-2" /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}