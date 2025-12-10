import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n/config';
import { speakText } from '@/utils/speakText';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { toast } = useToast();
  const { t } = useTranslation();
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // allow either NIN (11 digits) or username
    if (!formData.identifier || formData.identifier.trim().length === 0) {
      const title = t('missingIdentifierTitle');
      const desc = t('missingIdentifierDesc');
      toast({ title, description: desc, variant: 'destructive' });
      speakText(`${title}. ${desc}`, i18n.language);
      return;
    }

    setLoading(true);
    try {
      const success = await login(formData.identifier, formData.password);
      setLoading(false);

      if (success) {
        const title = t('welcomeBackTitle');
        const desc = t('loginSuccessDesc');
        toast({ title, description: desc });
        speakText(`${title}. ${desc}`, i18n.language);
        navigate('/dashboard');
      } else {
        const title = t('loginFailedTitle');
        const desc = t('loginFailedDesc');
        toast({ title, description: desc, variant: 'destructive' });
        speakText(`${title}. ${desc}`, i18n.language);
      }
    } catch (err: any) {
      setLoading(false);
      const message = err?.message || 'Server error';
      const title = t('loginFailedTitle');
      toast({ title, description: message, variant: 'destructive' });
      speakText(`${title}. ${message}`, i18n.language);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/5 py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-border shadow-lg">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold">{t('login')}</CardTitle>
              <Link to="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
            </div>
            <CardDescription>
              {t('loginDescription')}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="identifier">{t('identifierLabel')}</Label>
                <Input
                  id="identifier"
                  name="identifier"
                  placeholder={t('identifierPlaceholder')}
                  value={formData.identifier}
                  onChange={handleInputChange}
                  required
                />
                <p className="text-xs text-muted-foreground">{t('identifierHelp')}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">{t('password')}</Label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-primary hover:underline"
                  >
                    {t('forgotPassword')}
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('passwordPlaceholder')}
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <label
                  htmlFor="remember"
                  className="text-sm text-muted-foreground cursor-pointer"
                >
                  {t('rememberMe')}
                </label>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t('loading') : t('login')}
              </Button>

              <div className="text-center text-sm">
                <span className="text-muted-foreground">{t('dontHaveAccount')} </span>
                <Link to="/register" className="text-primary hover:underline">
                  {t('register')}
                </Link>
              </div>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
              <p className="text-xs font-medium mb-2">{t('demoCredentialsTitle')}</p>
              <p className="text-xs text-muted-foreground">NIN: 12345678901</p>
              <p className="text-xs text-muted-foreground">Password: password123</p>
            </div>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {t('securedByGovernment')}
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
