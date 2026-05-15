import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { admin, users as userService } from '../services/api';
import { 
  User, Activity, Shield, Home, 
  LayoutTemplate, LogOut, Search, MoreVertical, 
  Settings, FileText
} from 'lucide-react';

export default function Admin() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('matty_user');
    try {
      return saved && saved !== 'undefined' ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user.role !== 'ADMIN') {
      navigate('/dashboard');
      return;
    }

    const fetchUsers = async () => {
      try {
        const data = await admin.users();
        setUsers(data.content || data);
      } catch (err) {
        console.error('Failed to fetch users', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('matty_token');
    localStorage.removeItem('matty_user');
    navigate('/');
  };

  return (
    <div className="bg-[#0f0e13] font-sans text-white min-h-screen flex selection:bg-violet-500/30">
      {/* Premium Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-[280px] bg-[#14121c]/90 backdrop-blur-3xl border-r border-white/5 flex flex-col z-50">
        <div className="p-8">
          <Link to="/dashboard" className="text-3xl font-black tracking-tighter bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent hover:scale-105 transition-transform inline-block">
            Matty
          </Link>
          <div className="mt-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.8)]"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Control Center</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3.5 text-white/50 hover:text-white hover:bg-white/5 rounded-2xl transition-all group">
            <Home size={20} className="group-hover:scale-110 transition-transform" />
            <span className="text-sm font-bold">Dashboard</span>
          </Link>
          <Link to="/templates" className="flex items-center gap-3 px-4 py-3.5 text-white/50 hover:text-white hover:bg-white/5 rounded-2xl transition-all group">
            <LayoutTemplate size={20} className="group-hover:scale-110 transition-transform" />
            <span className="text-sm font-bold">Templates</span>
          </Link>
          <div className="relative pt-2">
            <div className="absolute left-0 top-[60%] -translate-y-1/2 w-1.5 h-8 bg-violet-500 rounded-r-full shadow-[0_0_15px_rgba(139,92,246,0.8)]"></div>
            <Link to="/admin" className="flex items-center gap-3 px-4 py-3.5 bg-violet-500/10 text-white rounded-2xl transition-all">
              <Shield size={20} className="text-violet-400" />
              <span className="text-sm font-bold">Admin Panel</span>
            </Link>
          </div>
        </nav>

        <div className="p-6 mt-auto">
          <div className="p-4 bg-[#0a090d] border border-white/5 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-300 overflow-hidden">
              {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" alt="" /> : <User size={20} />}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{user.username}</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-violet-400">System Admin</p>
            </div>
            <button onClick={handleLogout} className="text-white/30 hover:text-rose-400 transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-[280px] p-10">
        <header className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white mb-2">Admin Control</h1>
            <p className="text-white/40 text-base font-medium">Manage users, analyze revenue, and monitor studio activity.</p>
          </div>
          <div className="flex gap-4">
            <div className="relative group">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-violet-400 transition-colors" />
              <input 
                type="text" 
                placeholder="Search resources..." 
                className="bg-[#14121c] border border-white/10 rounded-2xl pl-12 pr-6 py-3 text-sm outline-none focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/10 transition-all w-[300px]"
              />
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-[#14121c]/80 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <User size={80} />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-white/30 mb-2">Total Creators</p>
            <h2 className="text-5xl font-black text-white mb-4 tracking-tighter">{users.length}</h2>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
              <Activity size={14} />
              <span>Growth stable</span>
            </div>
          </div>

          <div className="bg-[#14121c]/80 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <Activity size={80} />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-white/30 mb-2">Monthly Revenue</p>
            <h2 className="text-5xl font-black text-white mb-4 tracking-tighter">₹14.2k</h2>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold">
              <Shield size={14} />
              <span>All payments verified</span>
            </div>
          </div>

          <div className="bg-[#14121c]/80 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <Settings size={80} />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-white/30 mb-2">Active Designs</p>
            <h2 className="text-5xl font-black text-white mb-4 tracking-tighter">1,024</h2>
            <div className="flex items-center gap-2 text-violet-400 text-xs font-bold">
              <Activity size={14} />
              <span>Studio capacity at 45%</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Table */}
          <div className="lg:col-span-2 bg-[#14121c]/80 backdrop-blur-xl border border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-white/5 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-white">Creator Management</h3>
                <p className="text-white/40 text-xs mt-1 font-medium">Review and moderate all registered studio accounts.</p>
              </div>
              <button className="bg-white/5 hover:bg-white/10 text-white/70 hover:text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all border border-white/5">Export CSV</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black uppercase tracking-widest text-white/20 border-b border-white/5">
                    <th className="px-8 py-5">Creator</th>
                    <th className="px-8 py-5">System Role</th>
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr><td colSpan="4" className="px-8 py-20 text-center text-white/40 font-bold animate-pulse">Syncing user database...</td></tr>
                  ) : (
                    users.map(u => (
                      <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center text-violet-400 font-black text-sm border border-white/5 group-hover:scale-110 transition-transform">
                              {u.username?.substring(0, 1).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-white group-hover:text-violet-300 transition-colors">{u.username}</span>
                              <span className="text-xs text-white/40 font-medium">{u.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${u.role === 'ADMIN' ? 'bg-violet-500/10 text-violet-400 border-violet-500/20' : 'bg-white/5 text-white/40 border-white/10'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                            <span className="text-xs font-bold text-white/70">Online</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <button className="p-2 text-white/20 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                            <MoreVertical size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity Sidebar */}
          <div className="bg-[#14121c]/80 backdrop-blur-xl border border-white/5 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden">
            <div className="p-8 border-b border-white/5">
              <h3 className="text-xl font-black text-white">System Log</h3>
              <p className="text-white/40 text-xs mt-1 font-medium">Real-time studio event feed.</p>
            </div>
            <div className="p-8 flex-1 space-y-8 overflow-y-auto">
              <div className="flex gap-4 group">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-110 transition-transform">
                  <Activity size={20} />
                </div>
                <div className="flex flex-col">
                  <p className="text-sm font-bold text-white/80 leading-snug"><span className="text-emerald-400">System Ready:</span> Admin workspace fully initialized.</p>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/20 mt-2">Just Now</span>
                </div>
              </div>

              <div className="flex gap-4 group">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 group-hover:scale-110 transition-transform">
                  <User size={20} />
                </div>
                <div className="flex flex-col">
                  <p className="text-sm font-bold text-white/80 leading-snug">New Creator <span className="text-indigo-400">@matty_pro</span> joined the workspace.</p>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/20 mt-2">2 minutes ago</span>
                </div>
              </div>

              <div className="flex gap-4 group">
                <div className="w-10 h-10 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shrink-0 group-hover:scale-110 transition-transform">
                  <FileText size={20} />
                </div>
                <div className="flex flex-col">
                  <p className="text-sm font-bold text-white/80 leading-snug">Design <span className="text-violet-400">#8821</span> exported in 4K resolution.</p>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/20 mt-2">15 minutes ago</span>
                </div>
              </div>
            </div>
            <div className="p-8 bg-[#0a090d]/50">
              <button className="w-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white py-4 rounded-[1.5rem] text-xs font-bold transition-all border border-white/5">View Full Log History</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}