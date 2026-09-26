import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import MainLayout from '../components/layout/MainLayout'
import BusinessHoursGuard from '../components/layout/BusinessHoursGuard'

import LoginPage from '../pages/LoginPage'
import DashboardPage from '../pages/DashboardPage'
import PosPage from '../pages/PosPage'
import ProductsPage from '../pages/ProductsPage'
import StockPage from '../pages/StockPage'
import SalesPage from '../pages/SalesPage'
import CategoriesPage from '../pages/CategoriesPage'
import UsersPage from '../pages/UsersPage'
import ReportsPage from '../pages/ReportsPage'
import AuditPage from '../pages/AuditPage'
import SettingsPage from '../pages/SettingsPage'

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected routes with business hours check */}
      <Route element={<ProtectedRoute />}>
        <Route element={<BusinessHoursGuard />}>
          <Route element={<MainLayout />}>

          <Route path="/" element={<Navigate to="/pos" replace />} />
          <Route path="/pos" element={<PosPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/sales" element={<SalesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/users" element={<UsersPage />} />

          {/* Admin & Manager only */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'GESTIONNAIRE']} />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/stock" element={<StockPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Route>

          {/* Admin only */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/audit" element={<AuditPage />} />
          </Route>
        </Route>
      </Route>
    </Route>

    {/* Fallback */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
  )
}
