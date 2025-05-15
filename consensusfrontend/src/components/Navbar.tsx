import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOutIcon, UserIcon, ShieldIcon } from 'lucide-react';
const Navbar = () => {
  const {
    user,
    logout
  } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  return <nav className="bg-blue-700 text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <ShieldIcon size={28} />
            <span className="text-xl font-bold">ZKHealth</span>
          </Link>
          <div className="flex items-center space-x-6">
            <Link to="/" className="hover:text-blue-200 transition-colors">
              Home
            </Link>
            {user ? <>
                <Link to={user.role === 'patient' ? '/patient-dashboard' : '/provider-dashboard'} className="hover:text-blue-200 transition-colors">
                  Dashboard
                </Link>
                <div className="flex items-center">
                  <span className="mr-2">{user.name}</span>
                  <button onClick={handleLogout} className="flex items-center text-sm bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded">
                    <LogOutIcon size={16} className="mr-1" />
                    Logout
                  </button>
                </div>
              </> : <div className="flex items-center space-x-4">
                <Link to="/signin" className="hover:text-blue-200 transition-colors flex items-center">
                  <UserIcon size={16} className="mr-1" />
                  Sign In
                </Link>
                <Link to="/create-account" className="bg-white text-blue-600 hover:bg-blue-50 px-4 py-1 rounded-md transition-colors">
                  Create Account
                </Link>
              </div>}
          </div>
        </div>
      </div>
    </nav>;
};
export default Navbar;