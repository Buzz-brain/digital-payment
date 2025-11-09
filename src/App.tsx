import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useAdminStore } from "@/store/adminStore";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Landing from "./pages/Landing";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import SendMoney from "./pages/SendMoney";
import Withdraw from "./pages/Withdraw";
import Announcements from "./pages/Announcements";
import Feedback from "./pages/Feedback";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Beneficiaries from "./pages/admin/Beneficiaries";
import Disbursements from "./pages/admin/Disbursements";
import Analytics from "./pages/admin/Analytics";
import AnnouncementsManagement from "./pages/admin/AnnouncementsManagement";
import FeedbackReview from "./pages/admin/FeedbackReview";
import NINManagement from "./pages/admin/NINManagement";
import PollsManagement from "./pages/admin/PollsManagement";
import AdminNotifications from "./pages/admin/AdminNotifications";
import Polls from "./pages/Polls";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AdminProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAdminStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/admin/login" />;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Admin routes without Navbar/Footer */}
            <Route path="/admin/*" element={
              <Routes>
                <Route path="login" element={<AdminLogin />} />
                <Route
                  path="dashboard"
                  element={
                    <AdminProtectedRoute>
                      <AdminDashboard />
                    </AdminProtectedRoute>
                  }
                />
                <Route
                  path="beneficiaries"
                  element={
                    <AdminProtectedRoute>
                      <Beneficiaries />
                    </AdminProtectedRoute>
                  }
                />
                <Route
                  path="disbursements"
                  element={
                    <AdminProtectedRoute>
                      <Disbursements />
                    </AdminProtectedRoute>
                  }
                />
                <Route
                  path="analytics"
                  element={
                    <AdminProtectedRoute>
                      <Analytics />
                    </AdminProtectedRoute>
                  }
                />
                <Route
                  path="announcements"
                  element={
                    <AdminProtectedRoute>
                      <AnnouncementsManagement />
                    </AdminProtectedRoute>
                  }
                />
                <Route
                  path="feedback"
                  element={
                    <AdminProtectedRoute>
                      <FeedbackReview />
                    </AdminProtectedRoute>
                  }
                />
                <Route
                  path="nin-management"
                  element={
                    <AdminProtectedRoute>
                      <NINManagement />
                    </AdminProtectedRoute>
                  }
                />
                <Route
                  path="polls"
                  element={
                    <AdminProtectedRoute>
                      <PollsManagement />
                    </AdminProtectedRoute>
                  }
                />
                <Route
                  path="notifications"
                  element={
                    <AdminProtectedRoute>
                      <AdminNotifications />
                    </AdminProtectedRoute>
                  }
                />
              </Routes>
            } />

            {/* Citizen routes with Navbar/Footer */}
            <Route path="/*" element={
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/transactions"
                      element={
                        <ProtectedRoute>
                          <Transactions />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/send"
                      element={
                        <ProtectedRoute>
                          <SendMoney />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/withdraw"
                      element={
                        <ProtectedRoute>
                          <Withdraw />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/announcements"
                      element={
                        <ProtectedRoute>
                          <Announcements />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/feedback"
                      element={
                        <ProtectedRoute>
                          <Feedback />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/notifications"
                      element={
                        <ProtectedRoute>
                          <Notifications />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/polls"
                      element={
                        <ProtectedRoute>
                          <Polls />
                        </ProtectedRoute>
                      }
                    />
                    
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            } />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
