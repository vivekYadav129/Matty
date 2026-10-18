import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { auth } from '../services/api';

export default function OAuth2RedirectHandler() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [statusMessage, setStatusMessage] = useState('Completing authentication...');

  useEffect(() => {
    const processOAuth = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');
      const email = searchParams.get('email');
      const provider = searchParams.get('provider');
      const providerId = searchParams.get('providerId');
      const message = searchParams.get('message');

      // Strip query parameters from browser URL bar immediately to protect tokens
      window.history.replaceState({}, document.title, window.location.pathname);

      if (error) {
        if (error === 'account_linking_required') {
          const linkParams = new URLSearchParams({
            error: message || 'Account already exists. Please verify your password to link your account.',
            linkEmail: email || '',
            linkProvider: provider || '',
            linkProviderId: providerId || '',
          });
          navigate(`/?${linkParams.toString()}`, { replace: true });
          return;
        }

        navigate(`/?error=${encodeURIComponent(error)}`, { replace: true });
        return;
      }

      if (token) {
        try {
          localStorage.setItem('matty_token', token);
          setStatusMessage('Retrieving profile...');
          const userProfile = await auth.me();

          auth.setSession({
            ...userProfile,
            token,
          });

          navigate('/dashboard', { replace: true });
        } catch (err) {
          console.error('Failed to authenticate session:', err);
          auth.logout();
          navigate(`/?error=${encodeURIComponent(err.message || 'Failed to authenticate session')}`, { replace: true });
        }
      } else {
        navigate('/', { replace: true });
      }
    };

    processOAuth();
  }, [searchParams, navigate]);

  return (
    <div className="bg-[#0f0e13] font-sans text-white min-h-screen flex flex-col items-center justify-center p-6 selection:bg-violet-500/30">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[30%] left-[30%] w-[40%] h-[40%] bg-violet-600/10 rounded-full blur-[120px] animate-pulse"></div>
      </div>

      <div className="w-full max-w-sm bg-[#14121c]/80 backdrop-blur-3xl border border-white/10 rounded-3xl p-8 text-center shadow-2xl relative z-10">
        <div className="w-12 h-12 mx-auto mb-4 border-3 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></div>
        <h2 className="text-xl font-bold tracking-tight mb-2">Authenticating</h2>
        <p className="text-white/40 text-sm">{statusMessage}</p>
      </div>
    </div>
  );
}
