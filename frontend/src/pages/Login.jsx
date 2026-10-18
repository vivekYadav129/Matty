import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { auth, getOAuthUrl } from '../services/api';
import { 
  Mail, Lock, User, Eye, EyeOff, 
  CheckCircle2, AlertCircle, Link as LinkIcon 
} from 'lucide-react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [linkingState, setLinkingState] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem('matty_token');
    const user = localStorage.getItem('matty_user');
    if (token && user && !searchParams.get('token') && !searchParams.get('error')) {
      // User has existing session
      navigate('/dashboard', { replace: true });
      return;
    }

    const errorParam = searchParams.get('error');
    const tokenParam = searchParams.get('token');
    const linkEmail = searchParams.get('linkEmail');
    const linkProvider = searchParams.get('linkProvider');
    const linkProviderId = searchParams.get('linkProviderId');

    if (tokenParam) {
      // Clean query params from URL bar immediately
      window.history.replaceState({}, document.title, window.location.pathname);
      localStorage.setItem('matty_token', tokenParam);
      auth.me()
        .then((userData) => {
          auth.setSession({ ...userData, token: tokenParam });
          navigate('/dashboard', { replace: true });
        })
        .catch((err) => {
          auth.logout();
          setError(err.message || 'Failed to complete OAuth sign in');
        });
      return;
    }

    if (linkEmail && linkProvider && linkProviderId) {
      setLinkingState({
        email: linkEmail,
        provider: linkProvider,
        providerId: linkProviderId,
      });
      setFormData((prev) => ({ ...prev, email: linkEmail }));
      setIsLogin(true);
      setError(errorParam || `Please enter your password to link your ${linkProvider.toUpperCase()} account.`);
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (errorParam) {
      setError(decodeURIComponent(errorParam));
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [searchParams, navigate]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOAuthLogin = (provider) => {
    if (loading || oauthLoading) return;
    setError('');
    setSuccess('');
    setOauthLoading(provider);
    window.location.href = getOAuthUrl(provider);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (linkingState) {
        // Handle explicit account linking with verified password
        const response = await auth.linkAccount({
          email: formData.email,
          password: formData.password,
          provider: linkingState.provider,
          providerId: linkingState.providerId,
        });
        auth.setSession(response);
        navigate('/dashboard');
        return;
      }

      if (isLogin) {
        const response = await auth.login({ email: formData.email, password: formData.password });
        auth.setSession(response);
        navigate('/dashboard');
      } else {
        await auth.register(formData);
        setSuccess('Registration successful! Please sign in with your credentials.');
        setIsLogin(true);
        setFormData((prev) => ({ ...prev, password: '' }));
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0f0e13] font-sans text-white min-h-screen flex flex-col selection:bg-violet-500/30 overflow-x-hidden">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-violet-600/10 rounded-full blur-[150px] animate-pulse"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] bg-indigo-600/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-fuchsia-600/5 rounded-full blur-[100px]"></div>
      </div>

      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        {/* Logo Section */}
        <div className="mb-8 text-center group cursor-default">
          <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-r from-violet-400 via-indigo-400 to-fuchsia-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all duration-500 group-hover:scale-105 group-hover:drop-shadow-[0_0_30px_rgba(139,92,246,0.5)]">
            Matty
          </h1>
          <p className="text-white/40 text-sm font-medium mt-2 tracking-widest uppercase">Studio</p>
        </div>

        {/* Glass Card */}
        <div className="w-full max-w-[460px] bg-[#14121c]/80 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="p-8 md:p-10">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
                {linkingState ? 'Link Account' : isLogin ? 'Welcome Back' : 'Get Started'}
              </h2>
              <p className="text-white/50 text-sm">
                {linkingState 
                  ? `Verify your password to link ${linkingState.provider.toUpperCase()} to this account`
                  : isLogin ? 'Enter your details to access your studio' : 'Create your account to start designing'}
              </p>
            </div>

            {/* Mode Switcher (hidden during account linking flow) */}
            {!linkingState && (
              <div className="flex bg-[#0a090d] rounded-2xl p-1 mb-8 border border-white/5">
                <button 
                  type="button"
                  onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${isLogin ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20' : 'text-white/40 hover:text-white/70'}`}
                >
                  Login
                </button>
                <button 
                  type="button"
                  onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${!isLogin ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20' : 'text-white/40 hover:text-white/70'}`}
                >
                  Register
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 rounded-xl flex items-start gap-3 text-sm font-semibold border bg-rose-500/10 text-rose-400 border-rose-500/20 animate-in fade-in slide-in-from-top-2 duration-300">
                  <AlertCircle size={18} className="shrink-0 mt-0.5 text-rose-400" />
                  <div className="flex-1">{error}</div>
                </div>
              )}

              {success && (
                <div className="p-4 rounded-xl flex items-center gap-3 text-sm font-semibold border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 animate-in fade-in slide-in-from-top-2 duration-300">
                  <CheckCircle2 size={18} className="shrink-0 text-emerald-400" />
                  <div className="flex-1">{success}</div>
                </div>
              )}

              <div className="space-y-4">
                {!isLogin && !linkingState && (
                  <div className="group relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-violet-400 transition-colors">
                      <User size={18} />
                    </div>
                    <input 
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                      placeholder="Username"
                      className="w-full bg-[#0a090d] border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-sm outline-none focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/10 transition-all text-white placeholder:text-white/20"
                    />
                  </div>
                )}

                <div className="group relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-violet-400 transition-colors">
                    <Mail size={18} />
                  </div>
                  <input 
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    readOnly={Boolean(linkingState)}
                    placeholder="Email Address"
                    className={`w-full bg-[#0a090d] border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-sm outline-none focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/10 transition-all text-white placeholder:text-white/20 ${linkingState ? 'opacity-80 cursor-not-allowed' : ''}`}
                  />
                </div>

                <div className="group relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-violet-400 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    placeholder={linkingState ? "Account Password" : "Password"}
                    className="w-full bg-[#0a090d] border border-white/10 rounded-2xl pl-12 pr-12 py-3.5 text-sm outline-none focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/10 transition-all text-white placeholder:text-white/20"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {isLogin && !linkingState && (
                <div className="flex items-center justify-between px-1">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className="relative w-4 h-4 rounded border border-white/20 bg-white/5 flex items-center justify-center group-hover:border-violet-500 transition-colors">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-2.5 h-2.5 bg-violet-500 rounded-sm opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-xs font-medium text-white/40 group-hover:text-white/60 transition-colors">Remember me</span>
                  </label>
                  <button type="button" className="text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors">Forgot Password?</button>
                </div>
              )}

              {linkingState && (
                <div className="flex items-center justify-between px-1">
                  <button 
                    type="button" 
                    onClick={() => { setLinkingState(null); setError(''); }}
                    className="text-xs font-bold text-white/40 hover:text-white transition-colors"
                  >
                    Cancel Linking
                  </button>
                </div>
              )}

              <button 
                type="submit"
                disabled={loading || Boolean(oauthLoading)}
                className="w-full h-14 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-2xl font-bold shadow-xl shadow-violet-600/20 hover:shadow-violet-600/40 hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:scale-100 disabled:hover:scale-100 flex items-center justify-center gap-3 group"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  <>
                    {linkingState && <LinkIcon size={18} />}
                    <span>{linkingState ? 'Verify & Link Account' : isLogin ? 'Sign In' : 'Create Account'}</span>
                  </>
                )}
              </button>
            </form>

            {!linkingState && (
              <div className="mt-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex-1 h-px bg-white/10"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Social Connect</span>
                  <div className="flex-1 h-px bg-white/10"></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button 
                    type="button"
                    onClick={() => handleOAuthLogin('google')}
                    disabled={loading || Boolean(oauthLoading)}
                    className="flex items-center justify-center gap-3 bg-[#0a090d] hover:bg-white/5 border border-white/10 rounded-2xl py-3 text-sm font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {oauthLoading === 'google' ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                      </svg>
                    )}
                    <span>Google</span>
                  </button>

                  <button 
                    type="button"
                    onClick={() => handleOAuthLogin('github')}
                    disabled={loading || Boolean(oauthLoading)}
                    className="flex items-center justify-center gap-3 bg-[#0a090d] hover:bg-white/5 border border-white/10 rounded-2xl py-3 text-sm font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {oauthLoading === 'github' ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.042-1.416-4.042-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                    )}
                    <span>GitHub</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="mt-8 text-center text-white/30 text-xs max-w-[300px] leading-relaxed">
          By continuing, you agree to Matty's 
          <button className="text-white/60 hover:text-white font-bold mx-1">Terms</button> and 
          <button className="text-white/60 hover:text-white font-bold ml-1">Privacy Policy</button>.
        </p>
      </main>

      <footer className="p-8 text-center border-t border-white/5 bg-[#0a090d]/30 backdrop-blur-xl relative z-10">
        <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">© 2024 Matty Creative Engine. Built for performance.</p>
      </footer>
    </div>
  );
}