import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";

import LoadingScreen from "./components/LoadingScreen";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Navbar from "./components/Navbar";
import Breadcrumbs from "./components/Breadcrumbs";

const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const EditProfile = lazy(() => import("./pages/EditProfile"));
const Settings = lazy(() => import("./pages/Settings"));
const EmailNotificationPreferences = lazy(() => import("./pages/EmailNotificationPreferences"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const Directory = lazy(() => import("./pages/Directory"));
const AlumniPublicProfile = lazy(() => import("./pages/AlumniPublicProfile"));
const StudentPublicProfile = lazy(() => import("./pages/StudentPublicProfile"));
const RequestMentorship = lazy(() => import("./pages/RequestMentorship"));
const EndMentorship = lazy(() => import("./pages/EndMentorship"));
const StudentRequests = lazy(() => import("./pages/StudentRequests"));
const MentorRequests = lazy(() => import("./pages/MentorRequests"));
const MyMentors = lazy(() => import("./pages/MyMentors"));
const MyMentees = lazy(() => import("./pages/MyMentees"));
const Events = lazy(() => import("./pages/Events"));
const CreateEvent = lazy(() => import("./pages/CreateEvent"));
const AdminEvents = lazy(() => import("./pages/AdminEvents"));
const MyEvents = lazy(() => import("./pages/MyEvents"));
const EventDetails = lazy(() => import("./pages/EventDetails"));
const Chat = lazy(() => import("./pages/Chat"));
const MyCreatedEvents = lazy(() => import("./pages/MyCreatedEvents"));
const EditEvent = lazy(() => import("./pages/EditEvent"));

function AppLayout({ children }) {
  return (
    <div className="appRouteFrame">
      <style>{appLayoutCss}</style>
      <Navbar />
      <Breadcrumbs />
      {children}
    </div>
  );
}

const appLayoutCss = `
.appRouteFrame{
  position:relative;
  min-height:100vh;
  overflow-x:hidden;
  background:
    linear-gradient(180deg, #afd6ff 0%, #cfe7f7 28%, #f6e8ee 52%, #eef7fb 100%);
  isolation:isolate;
}

.appRouteFrame::before{
  content:"";
  position:fixed;
  inset:0;
  z-index:-1;
  background:
    linear-gradient(135deg, rgba(255,255,255,.48), rgba(255,255,255,0) 42%),
    radial-gradient(circle at 50% 24%, rgba(255,232,238,.66), rgba(255,232,238,0) 44%),
    radial-gradient(circle at 50% 14%, rgba(255,255,255,.62), rgba(255,255,255,0) 36%);
  pointer-events:none;
}
`;

export default function App() {
  return (
    <Router>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          <Route
            path="/my-created-events"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <MyCreatedEvents />
                </AppLayout>
              </ProtectedRoute>
            }
          />

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Profile />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit-profile"
          element={
            <ProtectedRoute>
              <AppLayout>
                <EditProfile />
              </AppLayout>
            </ProtectedRoute>
          }
        />


        <Route
          path="/settings"
          element={<ProtectedRoute><AppLayout><Settings /></AppLayout></ProtectedRoute>}
        />
        <Route
          path="/settings/email-notifications"
          element={<ProtectedRoute><AppLayout><EmailNotificationPreferences /></AppLayout></ProtectedRoute>}
        />

        <Route
          path="/directory"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Directory />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/directory/:id"
          element={
            <ProtectedRoute>
              <AppLayout>
                <AlumniPublicProfile />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/students/:id"
          element={
            <ProtectedRoute>
              <AppLayout>
                <StudentPublicProfile />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/request-mentorship/:id"
          element={
            <ProtectedRoute>
              <AppLayout>
                <RequestMentorship />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/end-mentorship/:id"
          element={
            <ProtectedRoute>
              <AppLayout>
                <EndMentorship />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-requests"
          element={
            <ProtectedRoute>
              <AppLayout>
                <StudentRequests />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/mentor-requests"
          element={
            <ProtectedRoute>
              <AppLayout>
                <MentorRequests />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-mentors"
          element={
            <ProtectedRoute>
              <AppLayout>
                <MyMentors />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-mentees"
          element={
            <ProtectedRoute>
              <AppLayout>
                <MyMentees />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Chat />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/events"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Events />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/create-event"
          element={
            <ProtectedRoute>
              <AppLayout>
                <CreateEvent />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-events"
          element={
            <ProtectedRoute>
              <AppLayout>
                <MyEvents />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AppLayout>
                <AdminDashboard />
              </AppLayout>
            </AdminRoute>
          }
        />

        <Route
          path="/admin-events"
          element={
            <AdminRoute>
              <AppLayout>
                <AdminEvents />
              </AppLayout>
            </AdminRoute>
          }
        />

        <Route
          path="/admin-users"
          element={
            <AdminRoute>
              <AppLayout>
                <AdminUsers />
              </AppLayout>
            </AdminRoute>
          }
        />

        <Route
          path="/events/:id/edit"
          element={
            <ProtectedRoute>
              <AppLayout>
                <EditEvent />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/events/:id"
          element={
            <ProtectedRoute>
              <AppLayout>
                <EventDetails />
              </AppLayout>
            </ProtectedRoute>
          }
        />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
