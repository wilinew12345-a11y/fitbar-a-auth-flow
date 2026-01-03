import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { UserProfileDialog } from './UserProfileDialog';
import { User, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface UserMenuProps {
  onSignOut: () => void;
}

export const UserMenu = ({ onSignOut }: UserMenuProps) => {
  const { t, isRtl } = useLanguage();
  const { getInitials, profile } = useUserProfile();
  const [profileOpen, setProfileOpen] = useState(false);

  const initials = getInitials();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-transparent rounded-full">
            <Avatar className="h-10 w-10 cursor-pointer hover:ring-2 hover:ring-white/30 transition-all">
              <AvatarFallback className="bg-blue-600 text-white font-semibold text-sm">
                {initials || <User className="h-5 w-5" />}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align={isRtl ? 'start' : 'end'}
          className="w-48 bg-[#0a1628] border-blue-800/50 text-white z-50"
        >
          {profile && (
            <div className="px-3 py-2 border-b border-blue-800/30">
              <p className="text-sm font-medium text-white">
                {profile.first_name} {profile.last_name}
              </p>
              <p className="text-xs text-blue-400 truncate">
                {profile.email}
              </p>
            </div>
          )}
          
          <DropdownMenuItem 
            onClick={() => setProfileOpen(true)}
            className="cursor-pointer text-white hover:bg-blue-900/50 focus:bg-blue-900/50 gap-2"
          >
            <User className="h-4 w-4" />
            <span>{t('userProfile') || 'פרטי משתמש'}</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator className="bg-blue-800/30" />
          
          <DropdownMenuItem 
            onClick={onSignOut}
            className="cursor-pointer text-red-400 hover:bg-red-900/30 focus:bg-red-900/30 gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span>{t('logout') || 'התנתקות'}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <UserProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
    </>
  );
};
