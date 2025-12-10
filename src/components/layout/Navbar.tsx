import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Wallet, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'ha', name: 'Hausa' },
    { code: 'yo', name: 'Yoruba' },
    { code: 'ig', name: 'Igbo' },
  ];

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const isActivePath = (path: string) => location.pathname === path;

  const navLinks = isAuthenticated
    ? [
        { path: '/dashboard', label: t('dashboard') },
        { path: '/transactions', label: t('transactions') },
        { path: '/polls', label: t('pollsTitle') },
        { path: '/announcements', label: t('announcements') },
      ]
    : [];

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <Wallet className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
              DPI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isActivePath(link.path)
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Globe className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={i18n.language === lang.code ? 'bg-accent' : ''}
                  >
                    {lang.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {isAuthenticated ? (
              <>
                <Link to="/profile">
                  <Button variant="ghost">
                    {user?.fullName.split(' ')[0]}
                  </Button>
                </Link>
                <Button onClick={() => void logout()} variant="outline">
                  {t('logout')}
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">{t('login')}</Button>
                </Link>
                <Link to="/register">
                  <Button>{t('register')}</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-accent"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-border overflow-hidden"
            >
              <div className="py-4 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-2 rounded-lg ${
                      isActivePath(link.path)
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-accent'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                
                <div className="pt-4 border-t border-border space-y-2">
                  {isAuthenticated ? (
                    <>
                      <Link
                        to="/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-4 py-2 rounded-lg hover:bg-accent"
                      >
                        {user?.fullName}
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setMobileMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 rounded-lg hover:bg-accent text-destructive"
                      >
                        {t('logout')}
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-4 py-2 rounded-lg hover:bg-accent"
                      >
                        {t('login')}
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Button className="w-full">{t('register')}</Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
