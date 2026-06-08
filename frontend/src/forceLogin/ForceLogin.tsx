import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCurrentUser } from '../utils/currentUser';
import { getCurrentUserFromSession } from '../services/authApi';
import './forceLogin.css';

const ForceLogin: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useCurrentUser();
  const [showModal, setShowModal] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Don't show modal or call /User/me on any login-related route
  const normalizedPath = location.pathname.toLowerCase();
  const isLoginPage = normalizedPath === '/login' || normalizedPath.startsWith('/login');

  useEffect(() => {
    // Skip check on login page
    if (isLoginPage) {
      setShowModal(false);
      setIsChecking(false);
      return;
    }

    const checkUserSession = async () => {
      try {
        const user = await getCurrentUserFromSession();
        // If user data is returned, session is valid - don't show modal
        if (user && (user.Username || user.username)) {
          setShowModal(false);
        } else {
          // No valid user data returned - show modal
          setShowModal(true);
        }
      } catch (error) {
        // Error fetching user data - show modal
        setShowModal(true);
      } finally {
        setIsChecking(false);
      }
    };

    checkUserSession();
  }, [isLoginPage]);

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  if (!showModal || isChecking) {
    return null;
  }

  return (
    <div className="force-login-overlay">
      <div className="force-login-modal">
        <div className="force-login-content">
          <h1>Session Expired</h1>
          <p>You need to be logged in to use this site. Please log in with your credentials to continue.</p>
        </div>
        <div className="force-login-actions">
          <button 
            type="button" 
            className="force-login-button"
            onClick={handleLoginRedirect}
          >
            Go to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForceLogin;
