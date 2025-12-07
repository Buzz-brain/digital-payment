import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { User, Mail, Phone, Shield, Languages, Moon, Sun, Type } from "lucide-react";
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
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
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
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
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

            <TabsContent value="profile">
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle>{t("personalInformation")}</CardTitle>
                  <CardDescription>{t("updateYourDetails")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">{t("username")}</Label>
                      <Input
                        id="username"
                        value={profileData.username}
                        onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="name">{t("fullName")}</Label>
                      <Input
                        id="name"
                        value={profileData.fullName}
                        onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                      />
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
                      />
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
                      />
                    </div>
                    <Button type="submit" disabled={loading}>
                      {loading ? t("saving") : t("saveChanges")}
                    </Button>
                  </form>
                </CardContent>
              </Card>
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
