"use client";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";

export type Language = "en" | "bm";

interface LanguageToggleProps {
	currentLanguage: Language;
	onLanguageChange: (language: Language) => void;
}

const languages = {
	en: { code: "en", name: "English", flag: "🇬🇧" },
	bm: { code: "bm", name: "Bahasa Melayu", flag: "🇲🇾" },
};

export function LanguageToggle({ currentLanguage, onLanguageChange }: LanguageToggleProps) {
	const currentLanguageConfig = languages[currentLanguage];

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					size="sm"
					className="gap-2 hover:bg-muted/50"
					aria-label="Select language"
				>
					<Globe className="h-4 w-4" />
					<span className="hidden sm:inline">
						{currentLanguageConfig.flag} {currentLanguageConfig.name}
					</span>
					<span className="sm:hidden">
						{currentLanguageConfig.flag}
					</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="min-w-[160px]">
				{Object.values(languages).map((language) => (
					<DropdownMenuItem
						key={language.code}
						onClick={() => onLanguageChange(language.code as Language)}
						className={`cursor-pointer gap-2 ${
							currentLanguage === language.code
								? "bg-accent text-accent-foreground"
								: ""
						}`}
					>
						<span>{language.flag}</span>
						<span>{language.name}</span>
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}