import React, { useState, useEffect } from 'react';
import { ModeProvider } from './context/ModeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { VoiceProvider } from './context/VoiceContext';
import { SplashScreen } from './components/SplashScreen';
import { OnboardingScreen } from './components/OnboardingScreen';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { LoginModal } from './components/LoginModal';
import { CustomerDashboard } from './components/CustomerDashboard';
import { TailorDiscovery } from './components/TailorDiscovery';
import { TailorProfileModal } from './components/TailorProfileModal';
import { AppointmentModal } from './components/AppointmentModal';
import { MeasurementVault } from './components/MeasurementVault';
import { OrderWizard } from './components/OrderWizard';
import { OrderTracking } from './components/OrderTracking';
import { TailorDashboard } from './components/TailorDashboard';
import { TailorCustomerManagement } from './components/TailorCustomerManagement';
import { OldRecordScanner } from './components/OldRecordScanner';
import { AIStyleAssistant } from './components/AIStyleAssistant';
import { PaymentModal } from './components/PaymentModal';
import { ChatDrawer } from './components/ChatDrawer';
import { TailorAnalytics } from './components/TailorAnalytics';
import { AdminDashboard } from './components/AdminDashboard';

const MainApp: React.FC = () => {
  const { user, tailorProfile } = useAuth();
  const { t } = useLanguage();

  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const [activeTab, setActiveTab] = useState<string>('tailor-dashboard');
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Modal States
  const [selectedTailorId, setSelectedTailorId] = useState<string | null>(null);
  const [appointmentModalData, setAppointmentModalData] = useState<{ tailor: any; service?: any } | null>(null);
  const [orderWizardData, setOrderWizardData] = useState<{ tailor?: any; service?: any } | null>(null);
  const [showOrderWizard, setShowOrderWizard] = useState(false);
  const [chatOrder, setChatOrder] = useState<any | null>(null);
  const [paymentOrder, setPaymentOrder] = useState<any | null>(null);

  useEffect(() => {
    if (user?.role === 'TAILOR' && (activeTab === 'home' || !activeTab)) {
      setActiveTab('tailor-dashboard');
    } else if (user?.role === 'CUSTOMER' && (activeTab === 'tailor-dashboard' || activeTab === 'admin-dashboard' || !activeTab)) {
      setActiveTab('home');
    } else if (user?.role === 'ADMIN' && (activeTab === 'tailor-dashboard' || activeTab === 'home' || !activeTab)) {
      setActiveTab('admin-dashboard');
    }
  }, [user]);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navbar */}
      <Navbar
        onOpenLogin={() => setIsLoginOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Customer Views */}
        {activeTab === 'home' && (
          <CustomerDashboard
            onSelectTab={setActiveTab}
            onSelectTailor={(id) => setSelectedTailorId(id)}
            onOpenOrderWizard={() => setShowOrderWizard(true)}
          />
        )}

        {activeTab === 'tailors' && (
          <TailorDiscovery onSelectTailor={(id) => setSelectedTailorId(id)} />
        )}

        {activeTab === 'orders' && (
          <OrderTracking />
        )}

        {activeTab === 'measurements' && (
          <MeasurementVault />
        )}

        {activeTab === 'ai-style' && (
          <AIStyleAssistant
            onUseRecommendation={() => {
              setShowOrderWizard(true);
            }}
          />
        )}

        {/* Tailor Views */}
        {activeTab === 'tailor-dashboard' && (
          <TailorDashboard onSelectTab={setActiveTab} />
        )}

        {activeTab === 'customers' && (
          <TailorCustomerManagement
            onOpenLens={() => setActiveTab('ocr-scan')}
            onOpenNewOrderWithCustomer={(cust, meas) => {
              setOrderWizardData({ tailor: tailorProfile, service: null });
              setShowOrderWizard(true);
            }}
          />
        )}

        {activeTab === 'ocr-scan' && (
          <OldRecordScanner onSuccess={() => setActiveTab('tailor-dashboard')} />
        )}

        {activeTab === 'analytics' && (
          <TailorAnalytics />
        )}

        {/* Admin View */}
        {activeTab === 'admin-dashboard' && (
          <AdminDashboard />
        )}
      </main>

      {/* Bottom Navigation for Mobile */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Interactive Modals */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />

      <TailorProfileModal
        tailorId={selectedTailorId}
        onClose={() => setSelectedTailorId(null)}
        onOpenAppointment={(tailor, service) => setAppointmentModalData({ tailor, service })}
        onOpenOrder={(tailor, service) => {
          setOrderWizardData({ tailor, service });
          setShowOrderWizard(true);
        }}
        onOpenChat={(tailor) => setChatOrder({ order_number: 'TH-2026-000101', garment_type: 'Shirt' })}
      />

      <AppointmentModal
        tailor={appointmentModalData?.tailor}
        service={appointmentModalData?.service}
        isOpen={!!appointmentModalData}
        onClose={() => setAppointmentModalData(null)}
        onSuccess={() => setActiveTab('orders')}
      />

      <OrderWizard
        initialTailor={orderWizardData?.tailor}
        initialService={orderWizardData?.service}
        isOpen={showOrderWizard}
        onClose={() => setShowOrderWizard(false)}
        onSuccess={() => setActiveTab('orders')}
      />

      <PaymentModal
        order={paymentOrder}
        isOpen={!!paymentOrder}
        onClose={() => setPaymentOrder(null)}
        onSuccess={() => setActiveTab('orders')}
      />

      <ChatDrawer
        order={chatOrder}
        isOpen={!!chatOrder}
        onClose={() => setChatOrder(null)}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ModeProvider>
      <AuthProvider>
        <LanguageProvider>
          <VoiceProvider>
            <MainApp />
          </VoiceProvider>
        </LanguageProvider>
      </AuthProvider>
    </ModeProvider>
  );
};
export default App;
