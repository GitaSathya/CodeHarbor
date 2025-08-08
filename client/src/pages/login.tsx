
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Brain, Mail, Lock, Building2 } from 'lucide-react';
import { useLocation } from 'wouter';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [, navigate] = useLocation();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation for work email
    if (!email.includes('@') || !email.includes('.')) {
      alert('Please enter a valid work email address');
      return;
    }
    
    // For MVP, just redirect to dashboard on any valid email format
    localStorage.setItem('hr_user', JSON.stringify({ email, isAuthenticated: true }));
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-4 pb-6">
          <div className="flex items-center justify-center space-x-2">
            <Brain className="text-primary text-3xl" />
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">AI Recruitment Matcher</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">HR Portal</p>
            </div>
          </div>
          <CardTitle className="text-center text-xl flex items-center justify-center space-x-2">
            <Building2 className="text-primary" size={24} />
            <span>HR Login</span>
          </CardTitle>
          <p className="text-center text-gray-600 dark:text-gray-400">
            Sign in with your work email to access the recruitment platform
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center space-x-2">
                <Mail size={16} />
                <span>Work Email</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="hr@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center space-x-2">
                <Lock size={16} />
                <span>Password</span>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
            </div>
            
            <Button type="submit" className="w-full mt-6 bg-primary hover:bg-primary/90">
              Sign In to HR Portal
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>Need help? Contact your IT administrator</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
