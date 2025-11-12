import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface LanguageToggleProps {
  currentLanguage: 'bm' | 'en';
  onLanguageChange: (language: 'bm' | 'en') => void;
  className?: string;
}

const LanguageToggle = React.forwardRef<HTMLDivElement, LanguageToggleProps>(
  ({ currentLanguage, onLanguageChange, className, ...props }, ref) => {
    const handleLanguageChange = (language: 'bm' | 'en') => {
      if (language !== currentLanguage) {
        onLanguageChange(language);
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-lg bg-background border border-border p-1 shadow-xs",
          className
        )}
        role="group"
        aria-label="Language selection"
        {...props}
      >
        <Button
          variant={currentLanguage === 'bm' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handleLanguageChange('bm')}
          className={cn(
            "h-8 px-3 text-sm font-medium transition-all",
            currentLanguage === 'bm'
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
          )}
          aria-pressed={currentLanguage === 'bm'}
          aria-label="Bahasa Malaysia"
        >
          <span className="flex items-center gap-2">
            <span className="text-base" aria-hidden="true">🇲🇾</span>
            <span className="hidden sm:inline">BM</span>
          </span>
        </Button>

        <Button
          variant={currentLanguage === 'en' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handleLanguageChange('en')}
          className={cn(
            "h-8 px-3 text-sm font-medium transition-all",
            currentLanguage === 'en'
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
          )}
          aria-pressed={currentLanguage === 'en'}
          aria-label="English"
        >
          <span className="flex items-center gap-2">
            <span className="text-base" aria-hidden="true">🇬🇧</span>
            <span className="hidden sm:inline">EN</span>
          </span>
        </Button>
      </div>
    );
  }
);

LanguageToggle.displayName = "LanguageToggle";

export { LanguageToggle };