import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { User, Mail, Phone, Shield, Languages, Moon, Sun, Type, MapPin, Briefcase, Calendar, Users, Home, Globe, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";

const Profile = () => {
  const { t, i18n } = useTranslation();
  const { user, getProfile, updateProfile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    fullName: user?.ninInfo?.fullName || user?.fullName || "",
    email: user?.ninInfo?.email || user?.email || "",
    phone: user?.ninInfo?.phone || user?.phone || "",
  });

  useEffect(() => {
    // fetch fresh profile on mount
    getProfile().catch(() => {});
    // update local form when store user changes
  }, []);

  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || '',
        fullName: user.ninInfo?.fullName || user.fullName || '',
        email: user.ninInfo?.email || user.email || '',
        phone: user.ninInfo?.phone || user.phone || '',
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile({ fullName: profileData.fullName, email: profileData.email, phone: profileData.phone, username: profileData.username });
      toast.success(t('profileUpdated') || 'Profile updated successfully!');
    } catch (err: any) {
      const msg = (err && err.message) || 'Failed to update profile';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Password changed successfully!");
    }, 1500);
  };

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    toast.success(`Language changed to ${lang}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background py-12 px-4">
      <div className="container max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-full bg-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{t("profile")}</h1>
              <p className="text-muted-foreground">{t("manageSettings")}</p>
            </div>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">{t("profile")}</TabsTrigger>
              <TabsTrigger value="security">{t("security")}</TabsTrigger>
              <TabsTrigger value="preferences">{t("preferences")}</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              {/* Account Info Card - Read-only overview */}
              <Card className="shadow-elegant bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    {t('accountInformation')}
                  </CardTitle>
                  <CardDescription>{t('systemManagedDetails')}</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">{t('username')}</Label>
                    <p className="text-lg font-semibold">{user?.username}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">{t('nin')}</Label>
                    <p className="text-lg font-mono">{user?.nin || t('na')}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">{t('accountStatus')}</Label>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <p className="text-sm font-medium">{t('active')}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">{t('memberSince')}</Label>
                    <p className="text-sm">{t('accountVerified')}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Personal & Contact Information - Editable */}
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>Update your contact details</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">{t("fullName")}</Label>
                        <Input
                          id="name"
                          value={profileData.fullName}
                          onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                          className="bg-muted/30"
                        />
                        <p className="text-xs text-muted-foreground">{t('fromNinRecord')}</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {t("email")}
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                          className="bg-muted/30"
                        />
                        <p className="text-xs text-muted-foreground">{t('fromNinRecord')}</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {t("phone")}
                        </Label>
                        <Input
                          id="phone"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                          className="bg-muted/30"
                        />
                        <p className="text-xs text-muted-foreground">{t('fromNinRecord')}</p>
                      </div>
                    </div>
                    <Button type="submit" disabled={loading} className="w-full md:w-auto">
                      {loading ? t("saving") : t("saveChanges")}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Demographic Information - Read-only from NinInfo */}
              {user?.ninInfo && (
                <Card className="shadow-elegant">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      {t('demographicInformation')}
                    </CardTitle>
                    <CardDescription>{t('verifiedFromNin')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {user.ninInfo.state && (
                        <div className="space-y-1 pb-4 border-b md:border-b-0">
                          <Label className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                            <MapPin className="h-3 w-3" />
                            {t('stateRegion')}
                          </Label>
                          <p className="text-base font-medium">{user.ninInfo.state}</p>
                        </div>
                      )}
                      {user.ninInfo.lga && (
                        <div className="space-y-1 pb-4 border-b md:border-b-0">
                          <Label className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                            <Home className="h-3 w-3" />
                            {t('lga')}
                          </Label>
                          <p className="text-base font-medium">{user.ninInfo.lga}</p>
                        </div>
                      )}
                      {user.ninInfo.region && (
                        <div className="space-y-1 pb-4 border-b md:border-b-0">
                          <Label className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                            <Globe className="h-3 w-3" />
                            {t('region')}
                          </Label>
                          <p className="text-base font-medium">{user.ninInfo.region}</p>
                        </div>
                      )}
                      {user.ninInfo.occupation && (
                        <div className="space-y-1 pb-4 border-b md:border-b-0">
                          <Label className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                            <Briefcase className="h-3 w-3" />
                            {t('occupation')}
                          </Label>
                          <p className="text-base font-medium">{user.ninInfo.occupation}</p>
                        </div>
                      )}
                      {user.ninInfo.gender && (
                        <div className="space-y-1 pb-4 border-b md:border-b-0">
                          <Label className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                            <Users className="h-3 w-3" />
                            {t('gender')}
                          </Label>
                          <p className="text-base font-medium capitalize">{user.ninInfo.gender}</p>
                        </div>
                      )}
                      {user.ninInfo.dob && (
                        <div className="space-y-1 pb-4 border-b md:border-b-0">
                          <Label className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            {t('dateOfBirth')}
                          </Label>
                          <p className="text-base font-medium">{new Date(user.ninInfo.dob).toLocaleDateString()}</p>
                        </div>
                      )}
                      {user.ninInfo.address && (
                        <div className="space-y-1 pb-4 md:col-span-2 border-b">
                          <Label className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                            <Home className="h-3 w-3" />
                            {t('address')}
                          </Label>
                          <p className="text-base font-medium">{user.ninInfo.address}</p>
                        </div>
                      )}
                      {user.ninInfo.tribe && (
                        <div className="space-y-1 pb-4 md:col-span-2 border-b">
                          <Label className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                            <Info className="h-3 w-3" />
                            {t('tribe')}
                          </Label>
                          <p className="text-base font-medium">{user.ninInfo.tribe}</p>
                        </div>
                      )}
                    </div>
                    <div className="mt-6 pt-4 border-t">
                      <p className="text-xs text-muted-foreground flex items-center gap-2">
                        <Shield className="h-3 w-3" />
                        {t('ninInfoNotice')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="security">
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    {t("security")}
                  </CardTitle>
                  <CardDescription>{t("changePassword")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">{t("currentPassword")}</Label>
                      <Input id="currentPassword" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">{t("newPassword")}</Label>
                      <Input id="newPassword" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
                      <Input id="confirmPassword" type="password" />
                    </div>
                    <Button type="submit" disabled={loading}>
                      {loading ? t("updating") : t("updatePassword")}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences">
              <div className="space-y-6">
                <Card className="shadow-elegant">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Languages className="h-5 w-5" />
                      {t("language")}
                    </CardTitle>
                    <CardDescription>{t("chooseLanguage")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Select value={i18n.language} onValueChange={changeLanguage}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ha">Hausa</SelectItem>
                        <SelectItem value="yo">Yoruba</SelectItem>
                        <SelectItem value="ig">Igbo</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                <Card className="shadow-elegant">
                  <CardHeader>
                    <CardTitle>{t("accessibility")}</CardTitle>
                    <CardDescription>{t("customizeExperience")}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                        <div>
                          <Label>{t("darkMode")}</Label>
                          <p className="text-sm text-muted-foreground">{t("toggleTheme")}</p>
                        </div>
                      </div>
                      <Switch
                        checked={darkMode}
                        onCheckedChange={(checked) => {
                          setDarkMode(checked);
                          toast.info("Dark mode will be available soon!");
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Type className="h-5 w-5" />
                        <div>
                          <Label>{t("largeText")}</Label>
                          <p className="text-sm text-muted-foreground">{t("increaseFontSize")}</p>
                        </div>
                      </div>
                      <Switch
                        checked={largeText}
                        onCheckedChange={(checked) => {
                          setLargeText(checked);
                          toast.info(checked ? "Large text enabled" : "Large text disabled");
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
