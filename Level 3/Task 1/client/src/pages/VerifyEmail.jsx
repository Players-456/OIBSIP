import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../utils/axios';

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyUserEmail = async () => {
      try {
        const response = await axios.get(`/auth/verifyemail/${token}`);
        setStatus('success');
        setMessage(response.data.message);
      } catch (error) {
        setStatus('error');
        setMessage(
          error.response?.data?.message || 'Email verification failed. Token might be invalid or expired.'
        );
      }
    };

    verifyUserEmail();
  }, [token]);

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div className="auth-header">
          <h1>Email Verification</h1>
        </div>
        
        {status === 'verifying' && <p>Verifying your email, please wait...</p>}
        {status === 'success' && (
          <div>
            <p style={{ color: 'var(--success)', marginBottom: '20px' }}>{message}</p>
            <Link to="/login" className="btn">Go to Login</Link>
          </div>
        )}
        {status === 'error' && (
          <div>
            <p style={{ color: 'var(--error)', marginBottom: '20px' }}>{message}</p>
            <Link to="/register" className="btn btn-secondary">Back to Register</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
