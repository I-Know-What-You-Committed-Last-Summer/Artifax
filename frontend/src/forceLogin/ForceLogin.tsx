import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUserFromSession } from '../services/authApi';
import './forceLogin.css';

const ForceLogin: React.FC = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkUserSession = async () => {
      // 1. Quick check: Is there even a token saved?
      // (Change 'token' to whatever key you use in localStorage/sessionStorage)
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (!token) {
        setShowModal(true);
        setIsChecking(false);
        return; // Stop here! Do not call the API and cause a 401 error console flood.
      }

      // 2. If a token exists, verify it with your backend
      try {
        const user = await getCurrentUserFromSession();
        if (user && (user.Username || user.username)) {
          setShowModal(false);
        } else {
          setShowModal(true);
        }
      } catch (error) {
        // Token was invalid or expired
        setShowModal(true);
      } finally {
        setIsChecking(false);
      }
    };

    checkUserSession();
  }, []); // Empty dependency array ensures this runs strictly once when layout mounts

  const handleLoginRedirect = () => {
    setShowModal(false);
    navigate('/login', { replace: true });
  };

  if (isChecking) {
    return null; // Or a loading spinner if you want
  }

  if (!showModal) {
    return null; 
  }

  return (
    <div className="force-login-overlay">
      <div className="force-login-modal">
        <div className="force-login-content">
          <h1>Session Expired</h1>
          <p>You need to be logged in to use this application. Please log in with your credentials to continue.</p>
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