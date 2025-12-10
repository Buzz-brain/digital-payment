import { Link } from 'react-router-dom';
import { Wallet, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                <Wallet className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                DPI
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Digital Payment Initiative - Empowering rural communities through accessible and secure digital financial services.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('footer.about')}
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('footer.services')}
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('footer.faq')}
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('footer.support')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">{t('footer.legal')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('footer.privacyPolicy')}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('footer.terms')}
                </Link>
              </li>
              <li>
                <Link to="/security" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('footer.security')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">{t('footer.contactUs')}</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>{t('footer.contactEmail')}</span>
              </li>
              <li className="flex items-center space-x-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>{t('footer.contactPhone')}</span>
              </li>
              <li className="flex items-center space-x-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{t('footer.contactAddress')}</span>
              </li>
            </ul>
            
            {/* Social Media */}
            <div className="flex space-x-3 mt-4">
              <a
                href="#"
                className="w-8 h-8 rounded-full bg-accent flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-full bg-accent flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-full bg-accent flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>{t('footer.rights')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
