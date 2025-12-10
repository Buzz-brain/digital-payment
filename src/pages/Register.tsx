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
import i18n from '@/i18n/config';
import { speakText } from '@/utils/speakText';
import NinRegisterModal from '@/components/NinRegisterModal';

const Register = () => {
    const [ninInfo, setNinInfo] = useState<{ fullName: string; phone: string; email: string; isVerified: boolean } | null>(null);
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
  const [showNinModal, setShowNinModal] = useState(false);

  const validateNIN = (nin: string) => {
    return /^\d{11}$/.test(nin);
  };

  // phone validation removed — phone is obtained from NIN info on the backend

  const handleInputChange = (e: React.ChangeEvent<any>) => {
        if (e.target.name === 'nin' && e.target.value.length === 11) {
          setNinLoading(true);
          apiFetch(`/api/nininfo/${e.target.value}`)
            .then((data: any) => {
              // Ensure the response includes isVerified (backend now returns it).
              setNinInfo({
                fullName: data.fullName,
                phone: data.phone,
                email: data.email,
                isVerified: Boolean(data.isVerified),
              });
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
      const title = 'Invalid NIN';
      const desc = 'NIN must be exactly 11 digits';
      toast({ title, description: desc, variant: 'destructive' });
      speakText(`${title}. ${desc}`, i18n.language);
      return;
    }

    // Ensure we have fetched NIN info before attempting registration
    if (!ninInfo) {
      const title = 'NIN Not Found';
      const desc = 'Please ensure your NIN is valid and NIN details are loaded before registering.';
      toast({ title, description: desc, variant: 'destructive' });
      speakText(`${title}. ${desc}`, i18n.language);
      setLoading(false);
      return;
    }

    // Ensure NIN is verified
    if (!ninInfo.isVerified) {
      const title = 'NIN Not Verified';
      const desc = 'Your NIN has not been verified yet. Please wait for administrator verification before registering. This typically takes 24-48 hours.';
      toast({ title, description: desc, variant: 'destructive' });
      speakText(`${title}. ${desc}`, i18n.language);
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      const title = 'Weak Password';
      const desc = 'Password must be at least 6 characters';
      toast({ title, description: desc, variant: 'destructive' });
      speakText(`${title}. ${desc}`, i18n.language);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      const title = 'Passwords do not match';
      const desc = 'Please ensure both passwords are the same';
      toast({ title, description: desc, variant: 'destructive' });
      speakText(`${title}. ${desc}`, i18n.language);
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
        const title = 'Registration Successful!';
        const desc = 'Welcome to DPI. Your account has been created.';
        toast({ title, description: desc });
        speakText(`${title}. ${desc}`, i18n.language);
        navigate('/dashboard');
      } else {
        const title = 'Registration Failed';
        const desc = 'An account with this NIN or username already exists';
        toast({ title, description: desc, variant: 'destructive' });
        speakText(`${title}. ${desc}`, i18n.language);
      }
    } catch (err: any) {
      setLoading(false);
      const message = err?.message || 'Server error';
      const title = 'Registration Failed';
      toast({ title, description: message, variant: 'destructive' });
      speakText(`${title}. ${message}`, i18n.language);
    }
  };

  // Form readiness: require username, valid NIN, matching passwords of sufficient length, and loaded verified NIN info
  const isFormReady = Boolean(
    formData.username &&
    validateNIN(formData.nin) &&
    formData.password &&
    formData.password.length >= 6 &&
    formData.password === formData.confirmPassword &&
    ninInfo &&
    ninInfo.isVerified &&
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
                      <div className={`p-4 rounded-lg border ${ninInfo.isVerified ? 'bg-green-50 border-green-300' : 'bg-amber-50 border-amber-300'} mt-2`}>
                        <div className="flex items-start justify-between mb-3">
                          <p className="font-semibold">NIN Details Preview</p>
                          {ninInfo.isVerified ? (
                            <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                              <span>✓</span>
                              <span>Verified</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs font-medium">
                              <span>⏱</span>
                              <span>Pending Verification</span>
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-1 gap-2 text-sm mb-3">
                          <div><span className="font-medium">Full Name:</span> {ninInfo.fullName}</div>
                          <div><span className="font-medium">Phone:</span> {ninInfo.phone}</div>
                          <div><span className="font-medium">Email:</span> {ninInfo.email}</div>
                        </div>
                        {!ninInfo.isVerified && (
                          <div className="bg-white rounded p-3 text-sm text-amber-800 border border-amber-200">
                            <p className="font-medium mb-1">⚠️ NIN Not Yet Verified</p>
                            <p>Your NIN has been found in the system but has not been verified by an administrator yet. Please wait for verification to be completed before you can register. This typically takes 24-48 hours.</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm text-destructive mb-2">NIN not found or invalid.</p>
                        <div>
                          <Button type="button" onClick={() => setShowNinModal(true)} className="px-3 py-1">Register NIN</Button>
                        </div>
                      </div>
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
                  <p className="text-xs text-muted-foreground mt-2">
                    {!ninInfo ? 'You must enter a valid NIN to proceed.' : !ninInfo.isVerified ? 'Your NIN is pending verification. You cannot register until it is verified by an administrator.' : 'Please complete all required fields with valid information.'}
                  </p>
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
      <NinRegisterModal
        isOpen={showNinModal}
        initialNin={formData.nin}
        onClose={() => setShowNinModal(false)}
        onSuccess={(created) => {
          // populate the ninInfo so the user can continue registration
          setNinInfo(created);
        }}
      />
    </div>
  );
};

export default Register;
