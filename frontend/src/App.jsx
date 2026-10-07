import React, { lazy, Suspense } from 'react';
import { Routes, Route, Outlet, Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { ToastProvider } from './components/ui/Toast.jsx';
import { AuthProvider, useAuth } from './lib/auth.jsx';
import ErrorBoundary from './components/ui/ErrorBoundary.jsx';
import ReAuthModal from './components/ui/ReAuthModal.jsx';
import PublicHeader from './components/layout/PublicHeader.jsx';
import PublicFooter from './components/layout/PublicFooter.jsx';
import PortalLayout from './components/layout/PortalLayout.jsx';

/* Route chunks are code-split so each portal + public section loads on demand.
   HomePage (the LCP entry) and the auth shell stay small. */

/* ---------- Public pages ---------- */
const HomePage = lazy(() => import('./pages/Public/HomePage.jsx'));
const AboutPage = lazy(() => import('./pages/Public/AboutPage.jsx'));
const FindDoctorPage = lazy(() => import('./pages/Public/FindDoctorPage.jsx'));
const FindLocationPage = lazy(() => import('./pages/Public/FindLocationPage.jsx'));
const ServicesPage = lazy(() => import('./pages/Public/ServicesPage.jsx'));
const HealthLibraryPage = lazy(() => import('./pages/Public/HealthLibraryPage.jsx'));
const VirtualCarePage = lazy(() => import('./pages/Public/VirtualCarePage.jsx'));
const ClinicalTrialsPage = lazy(() => import('./pages/Public/ClinicalTrialsPage.jsx'));
const NewsPage = lazy(() => import('./pages/Public/NewsPage.jsx'));
const PatientStoriesPage = lazy(() => import('./pages/Public/PatientStoriesPage.jsx'));
const InternationalPage = lazy(() => import('./pages/Public/InternationalPage.jsx'));
const DepartmentsPage = lazy(() => import('./pages/Public/DepartmentsPage.jsx'));
const CommunityEquityPage = lazy(() => import('./pages/Public/CommunityEquityPage.jsx'));
const ContactPage = lazy(() => import('./pages/Public/ContactPage.jsx'));
const DonatePage = lazy(() => import('./pages/Public/DonatePage.jsx'));
const SearchResultsPage = lazy(() => import('./pages/Public/SearchResultsPage.jsx'));
const PharmacyPage = lazy(() => import('./pages/Public/PharmacyPage.jsx'));

/* ---------- Auth ---------- */
const LoginPage = lazy(() => import('./pages/Auth/LoginPage.jsx'));
const SignupPage = lazy(() => import('./pages/Auth/SignupPage.jsx'));
const MfaPage = lazy(() => import('./pages/Auth/MfaPage.jsx'));
const ResetPasswordPage = lazy(() => import('./pages/Auth/ResetPasswordPage.jsx'));

/* ---------- Patient portal ---------- */
const PatientDashboardPage = lazy(() => import('./pages/Patient/PatientDashboardPage.jsx'));
const PatientAppointmentsPage = lazy(() => import('./pages/Patient/AppointmentsPage.jsx'));
const AppointmentDetailPage = lazy(() => import('./pages/Patient/AppointmentDetailPage.jsx'));
const PatientBookingPage = lazy(() => import('./pages/Patient/BookingPage.jsx'));
const PatientMessagesPage = lazy(() => import('./pages/Patient/MessagesPage.jsx'));
const PatientPrescriptionsPage = lazy(() => import('./pages/Patient/PrescriptionsPage.jsx'));
const PatientLabsPage = lazy(() => import('./pages/Patient/LabResultsPage.jsx'));
const PatientBillingPage = lazy(() => import('./pages/Patient/BillingPage.jsx'));
const PatientProfilePage = lazy(() => import('./pages/Patient/ProfilePage.jsx'));
const PatientVisitHistoryPage = lazy(() => import('./pages/Patient/VisitHistoryPage.jsx'));
const PatientPharmacyPage = lazy(() => import('./pages/Patient/PharmacyStorePage.jsx'));

/* ---------- Provider portal ---------- */
const ProviderDashboardPage = lazy(() => import('./pages/Provider/DashboardPage.jsx'));
const ProviderSchedulePage = lazy(() => import('./pages/Provider/SchedulePage.jsx'));
const ProviderMessagesPage = lazy(() => import('./pages/Provider/MessagesPage.jsx'));
const ProviderOrdersPage = lazy(() => import('./pages/Provider/OrdersPage.jsx'));
const ProviderResultsPage = lazy(() => import('./pages/Provider/ResultsPage.jsx'));

/* ---------- Nurse portal ---------- */
const NurseDashboardPage = lazy(() => import('./pages/Nurse/DashboardPage.jsx'));
const NurseQueuePage = lazy(() => import('./pages/Nurse/QueuePage.jsx'));
const NurseVitalsPage = lazy(() => import('./pages/Nurse/VitalsPage.jsx'));

/* ---------- Pharmacist portal ---------- */
const PharmacistDashboardPage = lazy(() => import('./pages/Pharmacist/DashboardPage.jsx'));
const PharmacistOrdersPage = lazy(() => import('./pages/Pharmacist/OrdersPage.jsx'));
const PharmacistFulfillPage = lazy(() => import('./pages/Pharmacist/FulfillPage.jsx'));
const PharmacistOnlineOrdersPage = lazy(() => import('./pages/Pharmacist/OnlineOrdersPage.jsx'));
const PharmacistProductsPage = lazy(() => import('./pages/Pharmacist/ProductsPage.jsx'));

/* ---------- Lab portal ---------- */
const LabDashboardPage = lazy(() => import('./pages/Lab/DashboardPage.jsx'));
const LabOrdersPage = lazy(() => import('./pages/Lab/OrdersPage.jsx'));
const LabResultsPage = lazy(() => import('./pages/Lab/ResultsPage.jsx'));

/* ---------- Admin portal ---------- */
const AdminDashboardPage = lazy(() => import('./pages/Admin/DashboardPage.jsx'));
const AdminMasterSchedulePage = lazy(() => import('./pages/Admin/MasterSchedulePage.jsx'));
const AdminCheckinsPage = lazy(() => import('./pages/Admin/CheckinsPage.jsx'));
const PatientWardsPage = lazy(() => import('./pages/Admin/PatientWardsPage.jsx'));
const AdminBillingPage = lazy(() => import('./pages/Admin/BillingPage.jsx'));
const AdminStaffPage = lazy(() => import('./pages/Admin/StaffPage.jsx'));
const AdminReportsPage = lazy(() => import('./pages/Admin/ReportsPage.jsx'));
const AdminAdmissionsPage = lazy(() => import('./pages/Admin/AdmissionsPage.jsx'));
const AdminWardsPage = lazy(() => import('./pages/Admin/WardsPage.jsx'));
const AdminDepartmentsPage = lazy(() => import('./pages/Admin/DepartmentsPage.jsx'));
const AdminUsersPage = lazy(() => import('./pages/Admin/UsersPage.jsx'));
const AdminRecordsPage = lazy(() => import('./pages/Admin/RecordsPage.jsx'));
const AdminContentPage = lazy(() => import('./pages/Admin/ContentPage.jsx'));
const AdminTlsSettingsPage = lazy(() => import('./pages/Admin/TlsSettingsPage.jsx'));

/* ---------- Front desk portal ---------- */
const FrontDeskDashboardPage = lazy(() => import('./pages/FrontDesk/DashboardPage.jsx'));
const FrontDeskCheckinsPage = lazy(() => import('./pages/FrontDesk/CheckinsPage.jsx'));
const FrontDeskSchedulingPage = lazy(() => import('./pages/FrontDesk/SchedulingPage.jsx'));

/* ---------- Shared portal pages ---------- */
const NotificationsPage = lazy(() => import('./pages/Shared/NotificationsPage.jsx'));
const SettingsPage = lazy(() => import('./pages/Shared/SettingsPage.jsx'));
const HelpPage = lazy(() => import('./pages/Shared/HelpPage.jsx'));

/* ================= Layouts ================= */

function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="skip-link">Skip to main content</a>
      <PublicHeader />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
}

function AuthLayout() {
  return (
    <div className="min-h-screen">
      <a href="#auth-main" className="skip-link">Skip to main content</a>
      <Outlet />
    </div>
  );
}

function RouteLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-accent-soft">
      <span className="flex items-center gap-2 text-sm font-semibold text-ink-muted">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" aria-hidden />
        Loading…
      </span>
    </div>
  );
}

/**
 * Guards portal routes. Public CTAs deep-link to booking with ?guest=1 and
 * must work without a session; everything else bounces to the login page.
 */
function RequireAuth() {
  const { user, authLoading } = useAuth();
  const location = useLocation();
  const [params] = useSearchParams();

  const isGuestBooking =
    location.pathname === '/portal/patient/book' && params.get('guest') === '1';

  if (authLoading && !isGuestBooking) return <RouteLoader />;
  if (!user && !isGuestBooking) {
    return <Navigate to="/auth/login" state={{ from: location.pathname + location.search }} replace />;
  }
  return <Outlet />;
}

/* Mirrors the role->portal mapping so portal base index routes resolve. */
const ROLE_HOME = {
  patient: '/portal/patient',
  provider: '/portal/provider',
  nurse: '/portal/nurse',
  pharmacist: '/portal/pharmacist',
  lab_tech: '/portal/lab',
  admin: '/portal/admin',
  front_desk: '/portal/front-desk',
};

function PortalIndex() {
  const { user } = useAuth();
  if (!user) return null;
  return <Navigate to={ROLE_HOME[user.role] ?? '/portal/patient'} replace />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <ReAuthModal />
          <Suspense fallback={<RouteLoader />}>
            <Routes>
              {/* Public marketing site */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/find-a-doctor" element={<FindDoctorPage />} />
                <Route path="/find-a-location" element={<FindLocationPage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/services/:id" element={<ServicesPage />} />
                <Route path="/health-library" element={<HealthLibraryPage />} />
                <Route path="/virtual-care" element={<VirtualCarePage />} />
                <Route path="/clinical-trials" element={<ClinicalTrialsPage />} />
                <Route path="/news-and-insights" element={<NewsPage />} />
                <Route path="/patient-stories" element={<PatientStoriesPage />} />
                <Route path="/international" element={<InternationalPage />} />
                <Route path="/departments" element={<DepartmentsPage />} />
                <Route path="/community-equity" element={<CommunityEquityPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/donate" element={<DonatePage />} />
                <Route path="/search" element={<SearchResultsPage />} />
                <Route path="/pharmacy" element={<PharmacyPage />} />
              </Route>

              {/* Auth */}
              <Route element={<AuthLayout />}>
                <Route path="/auth/login" element={<LoginPage />} />
                <Route path="/auth/signup" element={<SignupPage />} />
                <Route path="/auth/mfa" element={<MfaPage />} />
                <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
              </Route>

              {/* Portal (authenticated; booking allows guest=1) */}
              <Route element={<RequireAuth />}>
                <Route path="/portal" element={<PortalIndex />} />
                <Route element={<PortalLayout />}>
                  {/* Shared across roles */}
                  <Route path="/portal/notifications" element={<NotificationsPage />} />
                  <Route path="/portal/settings" element={<SettingsPage />} />
                  <Route path="/portal/help" element={<HelpPage />} />

                  {/* Patient */}
                  <Route path="/portal/patient/book" element={<PatientBookingPage />} />
                  <Route path="/portal/patient" element={<PatientDashboardPage />} />
                  <Route path="/portal/patient/appointments" element={<PatientAppointmentsPage />} />
                  <Route path="/portal/patient/appointments/:id" element={<AppointmentDetailPage />} />
                  <Route path="/portal/patient/messages" element={<PatientMessagesPage />} />
                  <Route path="/portal/patient/prescriptions" element={<PatientPrescriptionsPage />} />
                  <Route path="/portal/patient/pharmacy" element={<PatientPharmacyPage />} />
                  <Route path="/portal/patient/labs" element={<PatientLabsPage />} />
                  <Route path="/portal/patient/billing" element={<PatientBillingPage />} />
                  <Route path="/portal/patient/profile" element={<PatientProfilePage />} />
                  <Route path="/portal/patient/visits" element={<PatientVisitHistoryPage />} />

                  {/* Provider */}
                  <Route path="/portal/provider" element={<ProviderDashboardPage />} />
                  <Route path="/portal/provider/schedule" element={<ProviderSchedulePage />} />
                  <Route path="/portal/provider/messages" element={<ProviderMessagesPage />} />
                  <Route path="/portal/provider/orders" element={<ProviderOrdersPage />} />
                  <Route path="/portal/provider/results" element={<ProviderResultsPage />} />

                  {/* Nurse */}
                  <Route path="/portal/nurse" element={<NurseDashboardPage />} />
                  <Route path="/portal/nurse/queue" element={<NurseQueuePage />} />
                  <Route path="/portal/nurse/vitals" element={<NurseVitalsPage />} />
                  <Route path="/portal/nurse/patients" element={<PatientWardsPage />} />

                  {/* Pharmacist */}
                  <Route path="/portal/pharmacist" element={<PharmacistDashboardPage />} />
                  <Route path="/portal/pharmacist/orders" element={<PharmacistOrdersPage />} />
                  <Route path="/portal/pharmacist/online-orders" element={<PharmacistOnlineOrdersPage />} />
                  <Route path="/portal/pharmacist/fulfill" element={<PharmacistFulfillPage />} />

                  {/* Lab */}
                  <Route path="/portal/lab" element={<LabDashboardPage />} />
                  <Route path="/portal/lab/orders" element={<LabOrdersPage />} />
                  <Route path="/portal/lab/results" element={<LabResultsPage />} />

                  {/* Admin */}
                  <Route path="/portal/admin" element={<AdminDashboardPage />} />
                  <Route path="/portal/admin/schedule" element={<AdminMasterSchedulePage />} />
                  <Route path="/portal/admin/checkins" element={<AdminCheckinsPage />} />
                  <Route path="/portal/admin/patients" element={<PatientWardsPage />} />
                  <Route path="/portal/admin/billing" element={<AdminBillingPage />} />
                  <Route path="/portal/admin/staff" element={<AdminStaffPage />} />
                  <Route path="/portal/admin/reports" element={<AdminReportsPage />} />
                  <Route path="/portal/admin/admissions" element={<AdminAdmissionsPage />} />
                  <Route path="/portal/admin/wards" element={<AdminWardsPage />} />
                  <Route path="/portal/admin/departments" element={<AdminDepartmentsPage />} />
                  <Route path="/portal/admin/users" element={<AdminUsersPage />} />
                  <Route path="/portal/admin/records" element={<AdminRecordsPage />} />
                  <Route path="/portal/admin/content" element={<AdminContentPage />} />
<Route path="/portal/admin/settings/tls" element={<AdminTlsSettingsPage />} />

                  {/* Pharmacist */}
                  <Route path="/portal/pharmacist" element={<PharmacistDashboardPage />} />
                  <Route path="/portal/pharmacist/orders" element={<PharmacistOrdersPage />} />
                  <Route path="/portal/pharmacist/online-orders" element={<PharmacistOnlineOrdersPage />} />
                  <Route path="/portal/pharmacist/fulfill" element={<PharmacistFulfillPage />} />
                  <Route path="/portal/pharmacist/products" element={<PharmacistProductsPage />} />

                  {/* Front desk */}
                  <Route path="/portal/front-desk" element={<FrontDeskDashboardPage />} />
                  <Route path="/portal/front-desk/checkins" element={<FrontDeskCheckinsPage />} />
                  <Route path="/portal/front-desk/scheduling" element={<FrontDeskSchedulingPage />} />
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}