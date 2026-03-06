import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Home from './pages/Home'
import Properties from './pages/Properties'
import PropertyDetails from './pages/PropertyDetails'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Favorites from './pages/Favorites'
import MyInquiries from './pages/MyInquiries'
import DashboardInquiries from './pages/DashboardInquiries'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/properties/:id" element={<PropertyDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/inquiries" element={<DashboardInquiries />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/my-inquiries" element={<MyInquiries />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
