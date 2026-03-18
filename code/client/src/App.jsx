import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import AdminDashboard from "./pages/AdminDashboard";
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

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Navbar from "./components/Navbar";

function AppLayout({ children }) {
  return (
    <div>
      <Navbar />
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

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}