import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './index.css'

import { AuthProvider } from './contexts/AuthContext.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/NewDashboard.jsx'
import Profile from './pages/Profile.jsx'
import Chat from './pages/Chat.jsx'
import Careers from './pages/Careers.jsx'
import Analytics from './pages/Analytics.jsx'
import Resume from './pages/Resume.jsx'
import Roadmap from './pages/Roadmap.jsx'
import EducationIndia from './pages/EducationIndia.jsx'

import PrivateRoute from './components/PrivateRoute.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Login defaultSignUp={true} />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <PrivateRoute>
                <Chat />
              </PrivateRoute>
            }
          />
          <Route
            path="/careers"
            element={
              <PrivateRoute>
                <Careers />
              </PrivateRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <PrivateRoute>
                <Analytics />
              </PrivateRoute>
            }
          />
          <Route
            path="/resume"
            element={
              <PrivateRoute>
                <Resume />
              </PrivateRoute>
            }
          />
          <Route
            path="/roadmap"
            element={
              <PrivateRoute>
                <Roadmap />
              </PrivateRoute>
            }
          />
          <Route
            path="/education-india"
            element={
              <PrivateRoute>
                <EducationIndia />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <Toaster position="top-right" />
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
