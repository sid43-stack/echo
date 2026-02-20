import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AccountProvider } from "./context/AccountContext";
import { UserStateProvider } from "./context/UserStateContext";
import { WalletProvider } from "./blockchain/walletProvider";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import Memory from "./pages/Memory";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AccountProvider>
        <UserStateProvider>
          <WalletProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
              <div className="h-screen w-screen overflow-hidden bg-background">
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/app" element={<Index />} />
                  <Route path="/dashboard" element={<UserDashboard />} />
                  <Route path="/memory" element={<Memory />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
              </BrowserRouter>
            </TooltipProvider>
          </WalletProvider>
        </UserStateProvider>
      </AccountProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

