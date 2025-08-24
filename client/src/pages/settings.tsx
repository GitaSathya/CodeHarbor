
import { Bell, Mail, CheckCircle, AlertTriangle, Settings as SettingsIcon, Save, User, Key, TestTube, Eye, EyeOff } from "lucide-react";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/theme-context";
import { useState, useEffect } from "react";

interface NotificationSettings {
  emailNotifications: boolean;
  processingAlerts: boolean;
  matchNotifications: boolean;
  highSimilarityThreshold: number;
  emailAddress: string;
}

interface GeminiSettings {
  apiKey: string;
  isConfigured: boolean;
  lastTested: string | null;
}

export default function Settings() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    processingAlerts: true,
    matchNotifications: true,
    highSimilarityThreshold: 80,
    emailAddress: 'hr@company.com',
  });

  const [geminiSettings, setGeminiSettings] = useState<GeminiSettings>({
    apiKey: '',
    isConfigured: false,
    lastTested: null,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSettingChange = (key: keyof NotificationSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleGeminiSettingChange = (key: keyof GeminiSettings, value: any) => {
    setGeminiSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Settings saved",
        description: "Your notification preferences have been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveGeminiSettings = async () => {
    if (!geminiSettings.apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your Gemini API key to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      // Save to localStorage for demo purposes
      localStorage.setItem('geminiApiKey', geminiSettings.apiKey);
      localStorage.setItem('geminiConfigured', 'true');
      
      setGeminiSettings(prev => ({
        ...prev,
        isConfigured: true,
        lastTested: new Date().toISOString()
      }));

      toast({
        title: "Gemini API Configured",
        description: "Your Gemini API key has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save Gemini API settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    if (!geminiSettings.apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your Gemini API key first.",
        variant: "destructive",
      });
      return;
    }

    setIsTesting(true);
    try {
      // Test the API key by making a simple request
      const response = await fetch('/api/test-gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey: geminiSettings.apiKey }),
      });

      if (response.ok) {
        toast({
          title: "Connection Successful",
          description: "Your Gemini API key is working correctly.",
        });
        
        setGeminiSettings(prev => ({
          ...prev,
          isConfigured: true,
          lastTested: new Date().toISOString()
        }));
      } else {
        throw new Error('API test failed');
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Unable to connect to Gemini API. Please check your API key.",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Load saved Gemini settings on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('geminiApiKey');
    const isConfigured = localStorage.getItem('geminiConfigured') === 'true';
    
    if (savedApiKey && isConfigured) {
      setGeminiSettings(prev => ({
        ...prev,
        apiKey: savedApiKey,
        isConfigured: true,
        lastTested: localStorage.getItem('geminiLastTested')
      }));
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your account and notification preferences</p>
        </div>

        <Tabs defaultValue="notifications" className="space-y-6">
          <TabsList>
            <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="general" className="flex items-center space-x-2">
              <SettingsIcon className="w-4 h-4" />
              <span>General</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="w-5 h-5 text-primary" />
                  <span>Notification Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Email Notifications */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-blue-600" />
                      <div>
                        <h3 className="font-medium">Email Notifications</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Receive email updates about matches and processing
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                    />
                  </div>

                  {settings.emailNotifications && (
                    <div className="ml-8 space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={settings.emailAddress}
                          onChange={(e) => handleSettingChange('emailAddress', e.target.value)}
                          placeholder="Enter your HR email address"
                        />
                        <p className="text-xs text-gray-500">
                          This email will receive all notification alerts
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Processing Alerts */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <h3 className="font-medium">Processing Alerts</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Get notified when document processing completes
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.processingAlerts}
                    onCheckedChange={(checked) => handleSettingChange('processingAlerts', checked)}
                  />
                </div>

                <Separator />

                {/* Match Notifications */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                      <div>
                        <h3 className="font-medium">Match Notifications</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Receive alerts for new matches above similarity threshold
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.matchNotifications}
                      onCheckedChange={(checked) => handleSettingChange('matchNotifications', checked)}
                    />
                  </div>

                  {settings.matchNotifications && (
                    <div className="ml-8 space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="threshold">High Similarity Threshold (%)</Label>
                        <div className="flex items-center space-x-3">
                          <Input
                            id="threshold"
                            type="number"
                            min="50"
                            max="100"
                            value={settings.highSimilarityThreshold}
                            onChange={(e) => handleSettingChange('highSimilarityThreshold', parseInt(e.target.value))}
                            className="w-24"
                          />
                          <span className="text-sm text-gray-500">
                            Send alerts for matches above {settings.highSimilarityThreshold}% similarity
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          You'll receive immediate notifications for high-quality matches
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Notification Preview */}
                <div className="space-y-3">
                  <h3 className="font-medium">Notification Types</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-sm">Processing Complete</p>
                        <p className="text-xs text-gray-600">When analysis finishes</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                      <div>
                        <p className="font-medium text-sm">High Similarity Match</p>
                        <p className="text-xs text-gray-600">80%+ similarity found</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button onClick={handleSave} disabled={isSaving} className="w-full md:w-auto">
                    {isSaving ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Settings
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">Company Name</Label>
                    <Input id="company" placeholder="Your HR Company" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="Your full name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Input id="role" placeholder="HR Manager" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="general" className="space-y-6">
            {/* Gemini API Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Key className="w-5 h-5 text-primary" />
                  <span>Gemini AI Configuration</span>
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Configure your Gemini API key to enable AI-powered recruitment analysis
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="gemini-api-key">Gemini API Key</Label>
                    <div className="relative">
                      <Input
                        id="gemini-api-key"
                        type={showApiKey ? "text" : "password"}
                        value={geminiSettings.apiKey}
                        onChange={(e) => handleGeminiSettingChange('apiKey', e.target.value)}
                        placeholder="Enter your Gemini API key"
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowApiKey(!showApiKey)}
                      >
                        {showApiKey ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Get your API key from{" "}
                      <a 
                        href="https://makersuite.google.com/app/apikey" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Google AI Studio
                      </a>
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Button 
                      onClick={handleTestConnection} 
                      disabled={isTesting || !geminiSettings.apiKey.trim()}
                      variant="outline"
                      className="flex items-center space-x-2"
                    >
                      {isTesting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          <span>Testing...</span>
                        </>
                      ) : (
                        <>
                          <TestTube className="w-4 h-4" />
                          <span>Test Connection</span>
                        </>
                      )}
                    </Button>

                    <Button 
                      onClick={handleSaveGeminiSettings} 
                      disabled={isSaving || !geminiSettings.apiKey.trim()}
                      className="flex items-center space-x-2"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Save API Key</span>
                        </>
                      )}
                    </Button>
                  </div>

                  {geminiSettings.isConfigured && (
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                          <h4 className="font-medium text-green-800 dark:text-green-200">API Configured</h4>
                          <p className="text-sm text-green-700 dark:text-green-300">
                            Gemini AI is ready to analyze your recruitment documents
                          </p>
                          {geminiSettings.lastTested && (
                            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                              Last tested: {new Date(geminiSettings.lastTested).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="text-sm text-blue-800 dark:text-blue-200">
                        <p className="font-medium mb-1">How it works:</p>
                        <ul className="space-y-1 text-blue-700 dark:text-blue-300">
                          <li>• Upload job descriptions and applicant resumes</li>
                          <li>• Gemini AI analyzes document similarity and skills matching</li>
                          <li>• Get detailed reports with candidate rankings</li>
                          <li>• Receive email notifications with analysis results</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* General Settings */}
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Dark Mode</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Switch between light and dark theme
                      </p>
                    </div>
                    <Switch 
                      checked={theme === "dark"}
                      onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
