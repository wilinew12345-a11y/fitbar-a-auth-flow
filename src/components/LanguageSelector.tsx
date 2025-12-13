import { useLanguage, Language, translations } from '@/contexts/LanguageContext';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const languageFlags: Record<Language, string> = {
  he: '🇮🇱',
  en: '🇬🇧',
  es: '🇪🇸',
  ar: '🇸🇦'
};

const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();

  const languages: Language[] = ['he', 'en', 'es', 'ar'];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-white/80 hover:text-yellow-400 hover:bg-white/10 transition-colors"
        >
          <Globe className="h-4 w-4" />
          <span className="text-lg">{languageFlags[language]}</span>
          <span className="hidden sm:inline text-sm">{translations[language].label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="bg-[#061E40]/95 backdrop-blur-xl border-blue-800 min-w-[160px]"
      >
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang}
            onClick={() => setLanguage(lang)}
            className={`flex items-center gap-3 cursor-pointer transition-colors ${
              language === lang 
                ? 'bg-yellow-400/20 text-yellow-400' 
                : 'text-blue-200 hover:text-white hover:bg-blue-800/50'
            }`}
          >
            <span className="text-lg">{languageFlags[lang]}</span>
            <span>{translations[lang].label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
