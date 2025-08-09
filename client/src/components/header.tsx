import { Brain, Moon, Sun, User, LogOut, Settings, Mail } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import NotificationBell from "./notification-bell";

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const [location, navigate] = useLocation();
  const [user, setUser] = useState<{email: string, isAuthenticated: boolean} | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('hr_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = () => {
    navigate('/login');
  };

  const handleLogout = () => {
    localStorage.removeItem('hr_user');
    setUser(null);
    navigate('/login');
  };

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
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
            </button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                    HR
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">HR Portal</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Account Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={handleLogin} variant="default" size="sm" className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>HR Login</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}