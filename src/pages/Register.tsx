import { useState } from 'react';
import apiFetch from '@/lib/api';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

const Register = () => {
    const [ninInfo, setNinInfo] = useState<{ fullName: string; phone: string; email: string } | null>(null);
    const [ninLoading, setNinLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuthStore();
  const { toast } = useToast();
  const { t } = useTranslation();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  // ...existing code...
  
  const [formData, setFormData] = useState({
    username: '',
    nin: '',
    password: '',
    confirmPassword: '',
    role: 'citizen',
  });

  const validateNIN = (nin: string) => {
    return /^\d{11}$/.test(nin);
  };

  // phone validation removed — phone is obtained from NIN info on the backend

  const handleInputChange = (e: React.ChangeEvent<any>) => {
        if (e.target.name === 'nin' && e.target.value.length === 11) {
          setNinLoading(true);
          apiFetch(`/api/nininfo/${e.target.value}`)
            .then((data: any) => {
              setNinInfo({ fullName: data.fullName, phone: data.phone, email: data.email });
            })
            .catch(() => {
              setNinInfo(null);
            })
            .finally(() => setNinLoading(false));
        }
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateNIN(formData.nin)) {
      toast({
        title: 'Invalid NIN',
        description: 'NIN must be exactly 11 digits',
        variant: 'destructive',
      });
      return;
    }

    // Ensure we have fetched NIN info before attempting registration
    if (!ninInfo) {
      toast({
        title: 'NIN Not Verified',
        description: 'Please ensure your NIN is valid and NIN details are loaded before registering.',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: 'Weak Password',
        description: 'Password must be at least 6 characters',
        variant: 'destructive',
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please ensure both passwords are the same',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const success = await register({
        username: formData.username,
        nin: formData.nin,
        password: formData.password,
        role: formData.role,
      });
      setLoading(false);

      if (success) {
        toast({
          title: 'Registration Successful!',
          description: 'Welcome to DPI. Your account has been created.',
        });
        navigate('/dashboard');
      } else {
        toast({
          title: 'Registration Failed',
          description: 'An account with this NIN or username already exists',
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      setLoading(false);
      const message = err?.message || 'Server error';
      toast({ title: 'Registration Failed', description: message, variant: 'destructive' });
    }
  };

  // Form readiness: require username, valid NIN, matching passwords of sufficient length, and loaded NIN info
  const isFormReady = Boolean(
    formData.username &&
    validateNIN(formData.nin) &&
    formData.password &&
    formData.password.length >= 6 &&
    formData.password === formData.confirmPassword &&
    ninInfo &&
    !loading
  );

  // helper state and handlers

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
              <CardTitle className="text-2xl font-bold">
                {t('register')}
              </CardTitle>
              <Link to="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
            </div>
            <CardDescription>
              {'Create your DPI account to get started'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">{t('username') || 'Username'}</Label>
                  <Input
                    id="username"
                    name="username"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nin">{t('nin')}</Label>
                  <Input
                    id="nin"
                    name="nin"
                    placeholder="12345678901"
                    maxLength={11}
                    value={formData.nin}
                    onChange={handleInputChange}
                    required
                  />
                  <p className="text-xs text-muted-foreground">11-digit National Identity Number</p>
                </div>

                {formData.nin.length === 11 && (
                  <div className="space-y-2">
                    {ninLoading ? (
                      <p className="text-sm text-muted-foreground">Fetching NIN details...</p>
                    ) : ninInfo ? (
                      <div className="bg-primary/10 p-4 rounded-lg border border-primary/20 mt-2">
                        <p className="font-semibold mb-2">NIN Details Preview</p>
                        <div className="grid grid-cols-1 gap-1 text-sm">
                          <div><span className="font-medium">Full Name:</span> {ninInfo.fullName}</div>
                          <div><span className="font-medium">Phone:</span> {ninInfo.phone}</div>
                          <div><span className="font-medium">Email:</span> {ninInfo.email}</div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-destructive">NIN not found or invalid.</p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="citizen">Citizen</option>
                    <option value="admin">Admin</option>
                    <option value="agent">Agent</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">{t('password')}</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a strong password"
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

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={!isFormReady}>
                  {loading ? t('loading') : t('register')}
                </Button>

                {!isFormReady && (
                  <p className="text-xs text-muted-foreground mt-2">You must enter a valid NIN and have NIN details loaded before registering.</p>
                )}

                <div className="text-center text-sm">
                  <span className="text-muted-foreground">{t('alreadyHaveAccount')} </span>
                  <Link to="/login" className="text-primary hover:underline">
                    {t('login')}
                  </Link>
                </div>
              </form>
          </CardContent>
        </Card>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          By registering, you agree to DPI's Terms of Service and Privacy Policy
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
