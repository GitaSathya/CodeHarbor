
import { Bell, Mail, CheckCircle, AlertTriangle, Settings as SettingsIcon, Save, User } from "lucide-react";
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
import { useState } from "react";

interface NotificationSettings {
  emailNotifications: boolean;
  processingAlerts: boolean;
  matchNotifications: boolean;
  highSimilarityThreshold: number;
  emailAddress: string;
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

  const [isSaving, setIsSaving] = useState(false);

  const handleSettingChange = (key: keyof NotificationSettings, value: any) => {
    setSettings(prev => ({
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

          <TabsContent value="general">
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
