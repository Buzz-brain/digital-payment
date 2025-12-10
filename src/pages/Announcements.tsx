import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Megaphone, X, Calendar, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Announcement as AnnouncementType } from "@/data/mockData";
import { apiGet } from "@/lib/api";
import i18n from '@/i18n/config';
import { format } from "date-fns";
import TextToSpeechButton from '@/components/TextToSpeechButton';

const Announcements = () => {
  const { t } = useTranslation();
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementType | null>(null);
  const [announcements, setAnnouncements] = useState<AnnouncementType[]>([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const data = await apiGet('/api/announcements');
        if (!mounted) return;
        const mapped = (data || []).map((a: any) => ({
          id: a._id || a.id,
          title: a.title,
          content: a.content || a.body || '',
          category: a.category || 'general',
          priority: a.priority || 'low',
          publishedAt: a.publishedAt || a.createdAt || new Date().toISOString(),
          createdBy: a.createdBy,
          published: !!a.published,
        }));
        setAnnouncements(mapped);
      } catch (err) {
        // fallback to mock data (already set)
        console.warn('Failed to load announcements, using mock data', err);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const getPriorityColor = (priority: string): "default" | "destructive" | "secondary" => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "default";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "disbursement":
        return "💰";
      case "update":
        return "🔄";
      case "maintenance":
        return "🔧";
      default:
        return "📢";
    }
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
              <Megaphone className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{t("announcements")}</h1>
              <p className="text-muted-foreground">{t("latestUpdates")}</p>
            </div>
          </div>

          <div className="space-y-4">
            {announcements.map((announcement, index) => (
              <motion.div
                key={announcement.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className="cursor-pointer hover:shadow-lg transition-all duration-300 hover-scale"
                  onClick={() => setSelectedAnnouncement(announcement)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">
                          {getCategoryIcon(announcement.category)}
                        </span>
                        <div>
                          <CardTitle className="text-xl">
                            {announcement.title}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-2">
                              <Badge
                                variant={getPriorityColor(announcement.priority)}
                              >
                                {t(announcement.priority) ?? announcement.priority}
                              </Badge>
                              <span className="text-sm text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(
                                new Date(announcement.publishedAt),
                                "MMM dd, yyyy"
                              )}
                            </span>
                              <Badge variant="outline">{t(announcement.category) ?? announcement.category}</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <p className="text-muted-foreground line-clamp-2 flex-1">
                        {announcement.content}
                      </p>
                      <TextToSpeechButton text={announcement.content} lang={i18n.language} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <Dialog
          open={!!selectedAnnouncement}
          onOpenChange={() => setSelectedAnnouncement(null)}
        >
                <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <span className="text-3xl">
                  {selectedAnnouncement &&
                    getCategoryIcon(selectedAnnouncement.category)}
                </span>
                {selectedAnnouncement?.title}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    (selectedAnnouncement &&
                      getPriorityColor(selectedAnnouncement.priority)) ||
                    "default"
                  }
                >
                  {t(selectedAnnouncement?.priority) ?? selectedAnnouncement?.priority}
                </Badge>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {selectedAnnouncement &&
                    format(
                      new Date(selectedAnnouncement.publishedAt),
                      "MMMM dd, yyyy"
                    )}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-foreground leading-relaxed flex-1">
                  {selectedAnnouncement?.content}
                </p>
                {selectedAnnouncement?.content && (
                  <TextToSpeechButton text={selectedAnnouncement.content} lang={i18n.language} />
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Announcements;
