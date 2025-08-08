import { Brain, Info } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-white shadow-material-1 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Brain className="text-primary text-3xl" />
              <h1 className="text-xl font-medium text-gray-900">AI Recruitment Matcher</h1>
            </div>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="#dashboard" className="text-primary font-medium border-b-2 border-primary pb-1">Dashboard</a>
            <a href="#documents" className="text-gray-600 hover:text-primary transition-colors">Documents</a>
            <a href="#analytics" className="text-gray-600 hover:text-primary transition-colors">Analytics</a>
            <a href="#settings" className="text-gray-600 hover:text-primary transition-colors">Settings</a>
          </nav>
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Info className="text-gray-600" />
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
