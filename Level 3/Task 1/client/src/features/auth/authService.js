import axios from '../../utils/axios';

// Register user
const register = async (userData) => {
  const response = await axios.post('/auth/register', userData);
  return response.data;
};

// Login user
const login = async (userData) => {
  const response = await axios.post('/auth/login', userData);

  if (response?.data?.token) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }

  return response.data;
};

// Logout user
const logout = async () => {
  await axios.get('/auth/logout');
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};

// Verify email
const verifyEmail = async (token) => {
  const response = await axios.get(`/auth/verifyemail/${token}`);
  return response.data;
};

// Forgot password
const forgotPassword = async (email) => {
  const response = await axios.post('/auth/forgotpassword', { email });
  return response.data;
};

// Reset password
const resetPassword = async (token, password) => {
  const response = await axios.put(`/auth/resetpassword/${token}`, { password });
  return response.data;
};

const authService = {
  register,
  login,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
};

export default authService;