import React from 'react';
import { useAuth } from '../../lib/auth.jsx';
import Modal from './Modal.jsx';
import OtpStepUp from './OtpStepUp.jsx';

/* ==========================================================================
   Global "re-auth" step-up.
   Mounted once in <App> beneath AuthProvider. Any page can await
   `requireReAuth(purpose)` from useAuth() to gate a sensitive action behind
   an OTP code sent to the user's email. Email is the delivery channel only;
   it is not used as a primary sign-in identifier anywhere in the app.
   ========================================================================== */

export default function ReAuthModal() {
  const { reAuth, confirmReAuth, cancelReAuth, user } = useAuth();
  return (
    <Modal
      open={Boolean(reAuth?.open)}
      onClose={cancelReAuth}
      title="Confirm it's you"
      size="md"
    >
      <OtpStepUp
        purpose={reAuth?.purpose}
        email={user?.email}
        onVerified={confirmReAuth}
        onCancel={cancelReAuth}
      />
    </Modal>
  );
}