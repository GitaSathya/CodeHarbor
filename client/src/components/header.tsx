import { Brain, Info, Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const [location] = useLocation();

  return (
    <header className="bg-white dark:bg-gray-900 shadow-material-1 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Brain className="text-primary text-3xl" />
              <h1 className="text-xl font-medium text-gray-900 dark:text-gray-100">AI Recruitment Matcher</h1>
            </div>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a
              href="/"
              className={`pb-2 font-medium transition-colors ${
                location === "/" || location === "/dashboard"
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
            >
              Dashboard
            </a>
            <a
              href="/documents"
              className={`pb-2 font-medium transition-colors ${
                location === "/documents"
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
            >
              Documents
            </a>
            <a
              href="/analytics"
              className={`pb-2 font-medium transition-colors ${
                location === "/analytics"
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
            >
              Analytics
            </a>
            <a
              href="/settings"
              className={`pb-2 font-medium transition-colors ${
                location === "/settings"
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
            >
              Settings
            </a>
          </nav>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <Info className="text-gray-600 dark:text-gray-400" />
            </button>
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">HR</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}