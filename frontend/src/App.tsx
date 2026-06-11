import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import VenueListPage from './pages/VenueListPage'
import VenueDetailPage from './pages/VenueDetailPage'
import MyBookingsPage from './pages/MyBookingsPage'
import MatchPage from './pages/MatchPage'
import MyMatchRequestsPage from './pages/MyMatchRequestsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<VenueListPage />} />
          <Route path="/venues/:id" element={<ProtectedRoute><VenueDetailPage /></ProtectedRoute>} />
          <Route path="/bookings" element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>} />
          <Route path="/match" element={<ProtectedRoute><MatchPage /></ProtectedRoute>} />
          <Route path="/match/requests" element={<ProtectedRoute><MyMatchRequestsPage /></ProtectedRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
