import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Home from './components/Home';
import Navbar from './components/Navbar.jsx';
import WeaponList from './Weapon/WeaponList';
import WeaponForm from './Weapon/WeaponForm';
import TransactionList from './Transaction/TransactionList';
import TransactionForm from './Transaction/TransactionForm';
import UserList from './User/UserList';
import UserForm from './User/UserForm';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  return user?.role === 'admin' ? children : <Navigate to="/home" />;
};

const PetugasAdminRoute = ({ children }) => {
  const { user } = useAuth();
  // Izinkan admin dan petugas
  return ['admin', 'petugas'].includes(user?.role) ? children : <Navigate to="/home" />;
};


const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
          
          {/* Weapons Routes */}
          {/* Protected Routes */}
          <Route path="/weapons" element={<PrivateRoute><WeaponList /></PrivateRoute>} />
          
          <Route path="/transactions" element={<PrivateRoute><TransactionList /></PrivateRoute>} />
          
          <Route path="/update-weapons/:id" element={
            <PrivateRoute>
              <PetugasAdminRoute>
                <WeaponForm />
              </PetugasAdminRoute>
            </PrivateRoute>
          } />
          
          {/* Transactions Routes */}
          <Route path="/add-transaction" element={
            <PrivateRoute>
              <PetugasAdminRoute>
                <TransactionForm />
              </PetugasAdminRoute>
            </PrivateRoute>
          } />
          <Route path="/add-weapons" element={
            <PrivateRoute>
              <PetugasAdminRoute>
                <WeaponForm />
              </PetugasAdminRoute>
            </PrivateRoute>
          } />
          <Route path="/transaction/:id" element={
            <PrivateRoute>
              <PetugasAdminRoute>
                <TransactionForm />
              </PetugasAdminRoute>
            </PrivateRoute>
          } />
          
          {/* Users Routes (Admin only) */}
          <Route path="/users" element={
            <PrivateRoute>
              <AdminRoute>
                <UserList />
              </AdminRoute>
            </PrivateRoute>
          } />
          <Route path="/users/add" element={
            <PrivateRoute>
              <AdminRoute>
                <UserForm />
              </AdminRoute>
            </PrivateRoute>
          } />
          <Route path="/users/update/:id" element={
            <PrivateRoute>
              <AdminRoute>
                <UserForm />
              </AdminRoute>
            </PrivateRoute>
          } />
          
          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/home" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;