import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { auth, users as userService, upload } from '../services/api';
import { ArrowLeft, Home, Palette, LayoutTemplate, UserCircle, Settings, Crown, Lock, LogOut, CheckCircle, Camera } from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState(() => {
    const saved = localStorage.getItem('matty_user');
    try {
      return saved && saved !== 'undefined' ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const updatedUser = await userService.update(userData);
      localStorage.setItem('matty_user', JSON.stringify(updatedUser));
      setUserData(updatedUser);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      const res = await upload.image(file);
      const updatedUser = await userService.update({ ...userData, profilePicUrl: res.url });
      localStorage.setItem('matty_user', JSON.stringify(updatedUser));
      setUserData(updatedUser);
      setMessage({ type: 'success', text: 'Profile photo updated!' });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err.message || 'Failed to upload photo.' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('matty_token');
    localStorage.removeItem('matty_user');
    navigate('/');
  };

  return (
    <div className="bg-[#0f0e13] font-sans text-white min-h-screen flex flex-col selection:bg-violet-500/30">
      
      {/* Premium Glassmorphic Top Nav */}
      <header className="h-16 bg-[#14121c]/80 backdrop-blur-2xl border-b border-white/5 flex items-center justify-between px-6 z-50 shrink-0 sticky top-0">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-indigo-500/5 pointer-events-none" />
        
        <div className="flex items-center gap-6 relative z-10">
          <Link to="/dashboard" className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white">
             <ArrowLeft size={20} />
          </Link>
          <div className="w-px h-6 bg-white/10" />
          <Link to="/dashboard" className="font-bold text-2xl tracking-tighter bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent hover:scale-105 transition-transform drop-shadow-[0_0_15px_rgba(139,92,246,0.3)]">Matty</Link>
        </div>

        <div className="flex items-center gap-6 relative z-10">
          <nav className="hidden md:flex gap-1">
            <Link className="text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 px-4 py-2 rounded-lg transition-all duration-300" to="/dashboard">Dashboard</Link>
            <Link className="text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 px-4 py-2 rounded-lg transition-all duration-300" to="/templates">Templates</Link>
            <Link className="text-sm font-bold text-violet-400 bg-violet-500/10 px-4 py-2 rounded-lg transition-all duration-300 shadow-[0_0_10px_rgba(139,92,246,0.1)]" to="/profile">Profile</Link>
          </nav>
          
          <div className="w-px h-6 bg-white/10 hidden md:block" />
          
          <button onClick={handleLogout} className="flex items-center gap-2 p-2 hover:bg-red-500/20 text-white/70 hover:text-red-400 rounded-lg transition-colors group">
            <LogOut size={18} className="group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium hidden md:block">Logout</span>
          </button>
        </div>
      </header>

      <div className="flex-1 max-w-7xl w-full mx-auto flex p-6 gap-8">
        {/* Animated Left Sidebar */}
        <aside className="hidden md:flex w-[280px] flex-col gap-6 shrink-0">
          <div className="bg-[#14121c]/90 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.3)]">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-300 overflow-hidden border border-violet-500/30">
                {userData.profilePicUrl ? <img src={userData.profilePicUrl} alt="avatar" className="w-full h-full object-cover" /> : <UserCircle size={32} />}
              </div>
              <div>
                <h3 className="font-bold text-lg text-white truncate w-32">{userData.username || 'User'}</h3>
                <p className="text-xs font-semibold text-violet-400 uppercase tracking-wider">{userData.plan || 'Free Plan'}</p>
              </div>
            </div>
            
            <nav className="flex flex-col gap-1">
              <Link className="flex items-center gap-3 text-white/60 hover:text-white hover:bg-white/5 transition-all px-4 py-3 rounded-xl group" to="/dashboard">
                <Home size={18} className="group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-sm">Dashboard</span>
              </Link>
              <Link className="flex items-center gap-3 text-white/60 hover:text-white hover:bg-white/5 transition-all px-4 py-3 rounded-xl group" to="/dashboard">
                <Palette size={18} className="group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-sm">My Designs</span>
              </Link>
              <Link className="flex items-center gap-3 text-white/60 hover:text-white hover:bg-white/5 transition-all px-4 py-3 rounded-xl group" to="/templates">
                <LayoutTemplate size={18} className="group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-sm">Templates</span>
              </Link>
              <div className="relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-violet-500 rounded-r-full shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
                <Link className="flex items-center gap-3 bg-violet-500/10 text-white transition-all px-4 py-3 rounded-xl" to="/profile">
                  <UserCircle size={18} className="text-violet-400" />
                  <span className="font-semibold text-sm">Profile Settings</span>
                </Link>
              </div>
              {userData.role === 'ADMIN' && (
                <Link className="flex items-center gap-3 text-white/60 hover:text-white hover:bg-white/5 transition-all px-4 py-3 rounded-xl group mt-2 border-t border-white/5 pt-3" to="/admin">
                  <Settings size={18} className="group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-sm">Admin Panel</span>
                </Link>
              )}
            </nav>
          </div>
        </aside>

        {/* Main Profile Area */}
        <main className="flex-1 flex flex-col min-w-0">
          <header className="mb-8">
            <h1 className="font-bold text-3xl text-white mb-2 tracking-tight">Account Settings</h1>
            <p className="text-white/50 text-sm">Manage your profile, security preferences, and billing details.</p>
          </header>

          {message.text && (
            <div className={`p-4 rounded-xl mb-6 text-sm font-semibold flex items-center gap-2 ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
              {message.type === 'success' ? <CheckCircle size={18} /> : <div className="w-2 h-2 rounded-full bg-red-400" />}
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <section className="lg:col-span-2 space-y-8">
              
              {/* Profile Editor Card */}
              <div className="bg-[#14121c]/90 backdrop-blur-xl border border-white/5 rounded-2xl p-8 shadow-[0_10px_40px_rgba(0,0,0,0.3)]">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 mb-8">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#1a1825] flex items-center justify-center bg-[#0a090d] shadow-xl">
                      {userData.profilePicUrl ? <img src={userData.profilePicUrl} alt="avatar" className="w-full h-full object-cover" /> : <UserCircle size={64} className="text-white/20" />}
                    </div>
                    <input 
                      type="file" 
                      id="avatarUpload" 
                      className="hidden" 
                      accept="image/png, image/jpeg" 
                      onChange={handlePhotoUpload} 
                    />
                    <label 
                      htmlFor="avatarUpload" 
                      className="absolute bottom-2 right-2 bg-violet-600 hover:bg-violet-500 text-white p-2.5 rounded-full shadow-lg hover:shadow-[0_0_15px_rgba(139,92,246,0.6)] transition-all cursor-pointer flex items-center justify-center active:scale-95"
                    >
                      <Camera size={18} />
                    </label>
                  </div>
                  <div className="flex-1 text-center sm:text-left mt-2">
                    <h2 className="font-bold text-lg text-white mb-2">Profile Picture</h2>
                    <p className="text-sm text-white/40 leading-relaxed">Upload a high-resolution PNG or JPG. Recommended size 400x400px. This image will be displayed across your Matty workspaces.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/50 uppercase tracking-widest ml-1">Username</label>
                    <input 
                      name="username"
                      value={userData.username || ''}
                      onChange={handleChange}
                      className="w-full bg-[#0a090d] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all text-white placeholder:text-white/20" 
                      placeholder="Enter username"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/50 uppercase tracking-widest ml-1">Email Address</label>
                    <input 
                      name="email"
                      value={userData.email || ''}
                      readOnly
                      className="w-full bg-[#1a1825]/50 border border-white/5 rounded-xl px-4 py-3 text-sm outline-none text-white/50 cursor-not-allowed" 
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-white/50 uppercase tracking-widest ml-1">Bio</label>
                    <textarea 
                      name="bio"
                      value={userData.bio || ''}
                      onChange={handleChange}
                      className="w-full bg-[#0a090d] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all text-white placeholder:text-white/20 resize-none" 
                      rows="4" 
                      placeholder="Tell us about your creative journey..."
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button 
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-xl text-sm font-bold transition-all duration-300 shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] active:scale-95"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>

              {/* Security Card */}
              <div className="bg-[#14121c]/90 backdrop-blur-xl border border-white/5 rounded-2xl p-8 shadow-[0_10px_40px_rgba(0,0,0,0.3)]">
                <h2 className="font-bold text-lg text-white mb-6">Security & Privacy</h2>
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 p-5 bg-[#0a090d] border border-white/5 rounded-xl">
                    <div>
                      <h4 className="font-bold text-sm text-white mb-1">Two-Factor Authentication</h4>
                      <p className="text-xs text-white/50">Add an extra layer of security to your account.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-500"></div>
                    </label>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                        <Lock size={18} className="text-white/60" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white mb-0.5">Password</h4>
                        <p className="text-xs text-white/50">Last changed 3 months ago</p>
                      </div>
                    </div>
                    <button className="text-sm font-semibold text-violet-400 hover:text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 px-4 py-2 rounded-lg transition-all border border-violet-500/20">
                      Update Password
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className="lg:col-span-1 space-y-8">
              
              {/* Billing Info */}
              <div className="bg-[#14121c]/90 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.3)]">
                <h2 className="font-bold text-lg text-white mb-6">Billing & Plan</h2>
                <div className="mb-8">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm text-white/50 font-medium">Current Plan</span>
                    <span className="text-sm font-black text-violet-400 uppercase tracking-widest">{userData.plan || 'Free'}</span>
                  </div>
                  <div className="space-y-3 mt-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-xs text-white/50 font-semibold uppercase tracking-wider">Cloud Storage</span>
                        <span className="text-xs font-bold text-white">0.1 GB / 2.0 GB</span>
                      </div>
                      <div className="w-full bg-[#0a090d] rounded-full h-2 border border-white/5">
                        <div className="bg-gradient-to-r from-violet-500 to-indigo-500 h-2 rounded-full shadow-[0_0_10px_rgba(139,92,246,0.5)]" style={{"width":"5%"}}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Go Pro Upsell Card */}
                <div className="bg-gradient-to-br from-violet-600 to-indigo-700 p-6 rounded-xl text-white shadow-[0_10px_30px_rgba(139,92,246,0.3)] relative overflow-hidden group">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition-colors duration-500"></div>
                  <div className="flex items-center gap-2 mb-4 relative z-10">
                    <Crown size={20} className="text-yellow-300 drop-shadow-[0_0_10px_rgba(253,224,71,0.5)]" />
                    <span className="text-sm font-black tracking-widest uppercase text-yellow-300">Matty Pro</span>
                  </div>
                  <div className="mb-6 relative z-10">
                    <span className="text-3xl font-black">₹499</span>
                    <span className="text-sm text-white/70 font-medium">/month</span>
                  </div>
                  <ul className="space-y-2.5 mb-8 relative z-10">
                    <li className="flex items-center gap-2 text-sm font-medium text-white/90">
                      <CheckCircle size={16} className="text-violet-300" />
                      Unlimited Workspaces
                    </li>
                    <li className="flex items-center gap-2 text-sm font-medium text-white/90">
                      <CheckCircle size={16} className="text-violet-300" />
                      4K Export & SVG Output
                    </li>
                    <li className="flex items-center gap-2 text-sm font-medium text-white/90">
                      <CheckCircle size={16} className="text-violet-300" />
                      100GB Cloud Storage
                    </li>
                  </ul>
                  <button className="w-full bg-white text-indigo-900 font-bold py-3 rounded-xl hover:scale-[1.02] transition-transform active:scale-95 shadow-xl relative z-10">
                    Upgrade to Pro
                  </button>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}