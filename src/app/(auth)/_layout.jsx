import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import Signup from './Signup.jsx';
import SignupRole from './SignupRole.jsx';
import Signup2 from './Signup2.jsx';
import Signup3 from './Signup3.jsx';
import Login from './Login.jsx';
import ForgotPassword from './ForgotPassword.jsx';
import EmailRecovery from './EmailRecovery.jsx'; // Added import for EmailRecovery component

function AuthLayout() {
  return (
    <div>
      <Routes>
        <Route path="/*" element={<Outlet />}>
          <Route path="signup" element={<Signup />} />
          <Route path="signup-role" element={<SignupRole />} />
          <Route path="signup2" element={<Signup2 />} />
          <Route path="signup3" element={<Signup3 />} />
          <Route path="login" element={<Login />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="email-recovery" element={<EmailRecovery />} /> {/* New route for EmailRecovery */}
        </Route>
      </Routes>
    </div>
  );
}

export default AuthLayout;