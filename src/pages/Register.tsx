import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuthStore();
  const { toast } = useToast();
  const { t } = useTranslation();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [otpSent, setOtpSent] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    nin: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    otp: '',
  });

  const validateNIN = (nin: string) => {
    return /^\d{11}$/.test(nin);
  };

  const validatePhone = (phone: string) => {
    return /^0\d{10}$/.test(phone);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateNIN(formData.nin)) {
      toast({
        title: 'Invalid NIN',
        description: 'NIN must be exactly 11 digits',
        variant: 'destructive',
      });
      return;
    }

    if (!validatePhone(formData.phone)) {
      toast({
        title: 'Invalid Phone Number',
        description: 'Phone number must start with 0 and be 11 digits',
        variant: 'destructive',
      });
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

    // Simulate OTP sending
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLoading(false);
    setOtpSent(true);
    setStep(2);
    
    toast({
      title: 'OTP Sent',
      description: `Verification code sent to ${formData.phone}`,
    });
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.otp.length !== 6) {
      toast({
        title: 'Invalid OTP',
        description: 'Please enter the 6-digit code',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    
    const success = await register({
      fullName: formData.fullName,
      nin: formData.nin,
      phone: formData.phone,
      password: formData.password,
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
        description: 'An account with this NIN already exists',
        variant: 'destructive',
      });
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
              <CardTitle className="text-2xl font-bold">
                {step === 1 ? t('register') : 'Verify Your Account'}
              </CardTitle>
              <Link to="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
            </div>
            <CardDescription>
              {step === 1
                ? 'Create your DPI account to get started'
                : 'Enter the OTP sent to your phone number'}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {step === 1 ? (
              <form onSubmit={handleStep1Submit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">{t('fullName')}</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    placeholder="Enter your full name"
                    value={formData.fullName}
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

                <div className="space-y-2">
                  <Label htmlFor="phone">{t('phone')}</Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="08012345678"
                    maxLength={11}
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t('email')}</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your.email@example.com (optional)"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
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

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? t('loading') : t('continueText')}
                </Button>

                <div className="text-center text-sm">
                  <span className="text-muted-foreground">{t('alreadyHaveAccount')} </span>
                  <Link to="/login" className="text-primary hover:underline">
                    {t('login')}
                  </Link>
                </div>
              </form>
            ) : (
              <form onSubmit={handleStep2Submit} className="space-y-6">
                <div className="bg-primary/5 p-4 rounded-lg flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium">OTP sent successfully</p>
                    <p className="text-muted-foreground">Check your phone for the 6-digit code</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="otp">Verification Code</Label>
                  <Input
                    id="otp"
                    name="otp"
                    placeholder="123456"
                    maxLength={6}
                    value={formData.otp}
                    onChange={handleInputChange}
                    required
                    className="text-center text-2xl tracking-widest"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setStep(1)}
                  >
                    {t('back')}
                  </Button>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? t('loading') : 'Verify & Register'}
                  </Button>
                </div>

                <button
                  type="button"
                  className="w-full text-center text-sm text-primary hover:underline"
                  onClick={handleStep1Submit}
                >
                  Resend OTP
                </button>
              </form>
            )}
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
