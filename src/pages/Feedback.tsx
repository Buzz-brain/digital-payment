import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { MessageSquare, ArrowLeft, ThumbsUp, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { apiPost, apiGet } from "@/lib/api";

const Feedback = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(false);
  const [myFeedback, setMyFeedback] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    category: "",
    message: "",
  });

  // Fetch user's feedback history on mount
  useEffect(() => {
    fetchMyFeedback();
  }, []);

  const fetchMyFeedback = async () => {
    try {
      setFetchingHistory(true);
      const res: any = await apiGet("/api/feedback/mine");
      setMyFeedback(Array.isArray(res) ? res : []);
    } catch (err: any) {
      toast.error(err?.message || t('feedbackFetchFailed'));
    } finally {
      setFetchingHistory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.category || !formData.message.trim()) {
      toast.error(t('fillAllFields'));
      return;
    }

    setLoading(true);
    try {
      await apiPost("/api/feedback", {
        category: formData.category,
        message: formData.message,
        type: "other",
      });
      toast.success(t('feedbackThankYou'));
      setFormData({ category: "", message: "" });
      // Refresh history
      fetchMyFeedback();
    } catch (err: any) {
      toast.error(err?.message || t('feedbackSubmitFailed'));
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "reviewed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "resolved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "reviewed":
        return <AlertCircle className="w-4 h-4" />;
      case "resolved":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
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
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("back")}
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Submit Feedback Form */}
            <div className="lg:col-span-1">
              <Card className="shadow-elegant sticky top-4">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-primary/10">
                      <MessageSquare className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle>{t("feedback")}</CardTitle>
                      <CardDescription>{t("feedbackDescription")}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">{t("category")}</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) =>
                          setFormData({ ...formData, category: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t("selectCategoryPlaceholder")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technical">{t('technicalIssue')}</SelectItem>
                          <SelectItem value="suggestion">{t('suggestion')}</SelectItem>
                          <SelectItem value="complaint">{t('complaint')}</SelectItem>
                          <SelectItem value="inquiry">{t('inquiry')}</SelectItem>
                          <SelectItem value="other">{t('other')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">{t('message')}</Label>
                      <Textarea
                        id="message"
                        placeholder={t('messagePlaceholder')}
                        rows={5}
                        value={formData.message}
                        onChange={(e) =>
                          setFormData({ ...formData, message: e.target.value })
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        {formData.message.length}/2000
                      </p>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                      <ThumbsUp className="mr-2 h-4 w-4" />
                      {loading ? t("submitting") : t("submitFeedback")}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Feedback History */}
            <div className="lg:col-span-2">
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle>{t('feedbackHistoryTitle')}</CardTitle>
                  <CardDescription>
                    {t('feedbackHistoryDescription')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {fetchingHistory ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {t('loadingFeedback')}
                    </div>
                  ) : myFeedback.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {t('noFeedbackYet')}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {myFeedback.map((fb: any) => (
                        <motion.div
                          key={fb._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(fb.status)}>
                                {getStatusIcon(fb.status)}
                                <span className="ml-1">{t(fb.status)}</span>
                              </Badge>
                              <Badge variant="outline" className="capitalize">
                                {fb.category || fb.type}
                              </Badge>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(fb.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          <p className="text-sm mb-3">{fb.message}</p>

                          {fb.response?.text && (
                            <div className="bg-muted/50 rounded p-3 mt-3">
                              <p className="text-xs font-medium text-muted-foreground mb-1">
                                {t('adminResponseLabel')}
                              </p>
                              <p className="text-sm">{fb.response.text}</p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {fb.response.by?.fullName || t('admin')} -{" "}
                                {new Date(fb.response.at).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Feedback;
