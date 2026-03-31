import React from 'react';
import { AuthenticateWithRedirectCallback } from '@clerk/react';

const SsoCallbackPage: React.FC = () => {
  return <AuthenticateWithRedirectCallback />;
};

export default SsoCallbackPage;
