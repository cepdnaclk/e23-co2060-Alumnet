import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import Directory from "./pages/Directory";
import AlumniPublicProfile from "./pages/AlumniPublicProfile";
import RequestMentorship from "./pages/RequestMentorship";
import StudentRequests from "./pages/StudentRequests";
import MentorRequests from "./pages/MentorRequests";
import MyMentors from "./pages/MyMentors";
import MyMentees from "./pages/MyMentees";
import Events from "./pages/Events";
import CreateEvent from "./pages/CreateEvent";
import AdminEvents from "./pages/AdminEvents";
import MyEvents from "./pages/MyEvents";
import EventDetails from "./pages/EventDetails";
import Chat from "./pages/Chat";
import MyCreatedEvents from "./pages/MyCreatedEvents";
import EditEvent from "./pages/EditEvent";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Navbar from "./components/Navbar";
import Breadcrumbs from "./components/Breadcrumbs";

function AppLayout({ children }) {
  return (
    <div className="appRouteFrame">
      <Navbar />
      <Breadcrumbs />
      {children}
    </div>
  );
}

export default function App() {
  return (
    <Router>
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
    </Router>
  );
}
