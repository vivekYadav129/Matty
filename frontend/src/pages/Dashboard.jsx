import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { designs, auth } from '../services/api';
import { 
  Menu, Search, Bell, User, Settings, Shield, LogOut, 
  Home, Palette, LayoutTemplate, Sparkles, Award, 
  Camera, FileText, MonitorPlay, Plus, LayoutGrid, List, 
  Image as ImageIcon, Pencil, Trash2, Copy, FolderX 
} from 'lucide-react';

export default function Dashboard() {
  const [userDesigns, setUserDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('matty_user');
    try {
      return saved && saved !== 'undefined' ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchDesigns = async () => {
      try {
        const data = await designs.list();
        setUserDesigns(data.content || []);
      } catch (err) {
        console.error('Failed to fetch designs', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDesigns();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('matty_token');
    localStorage.removeItem('matty_user');
    navigate('/');
  };

  const handleCreateDesign = async (type) => {
    try {
      const newDesign = await designs.create({
        title: `Untitled ${type}`,
        type: type,
        jsonData: {}
      });
      navigate(`/editor?id=${newDesign.id}`);
    } catch (err) {
      alert('Failed to create design');
    }
  };

  const deleteDesign = async (id) => {
    if (!window.confirm('Delete this design?')) return;
    try {
      await designs.delete(id);
      setUserDesigns(userDesigns.filter(d => d.id !== id));
    } catch (err) {
      alert('Failed to delete design');
    }
  };

  return (
    <div className="bg-[#0f0e13] text-white min-h-screen font-sans">
      <header className="bg-[#181622]/80 backdrop-blur-xl text-white border-b border-white/5 flex justify-between items-center w-full px-6 h-16 sticky top-0 z-50">
        <div className="flex items-center gap-6 flex-1">
          <Menu onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="cursor-pointer text-white/70 hover:text-white transition-colors lg:hidden" size={24} />
          <Link to="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent tracking-tight">Matty</Link>

          <div className="hidden md:flex items-center bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full w-full max-w-md border border-white/5 focus-within:border-violet-500/50 transition-all">
            <Search className="text-white/50" size={18} />
            <input placeholder="Search your designs..." className="bg-transparent border-none outline-none px-3 w-full text-white text-sm placeholder:text-white/40" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors relative">
            <Bell size={20} className="text-white/70 hover:text-white" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border border-[#181622]"></span>
          </button>
          <div className="group relative">
            <div className="h-9 w-9 rounded-full border border-white/10 overflow-hidden cursor-pointer hover:border-violet-500/50 transition-all flex items-center justify-center bg-white/5">
              {user.avatar ? <img src={user.avatar} alt="avatar" /> : <User size={18} className="text-white/70" />}
            </div>
            <div className="absolute right-0 mt-2 w-56 bg-[#181622] border border-white/10 rounded-xl shadow-2xl p-2 hidden group-hover:block z-[60] backdrop-blur-xl">
              <Link to="/profile" className="flex items-center gap-3 p-2.5 hover:bg-white/5 rounded-lg transition-colors text-white/90">
                <Settings size={16} />
                <span className="text-sm font-medium">Profile Settings</span>
              </Link>
              {user.role === 'ADMIN' && (
                <Link to="/admin" className="flex items-center gap-3 p-2.5 hover:bg-white/5 rounded-lg transition-colors text-white/90">
                  <Shield size={16} />
                  <span className="text-sm font-medium">Admin Panel</span>
                </Link>
              )}
              <hr className="my-1 border-white/10" />
              <button onClick={handleLogout} className="w-full flex items-center gap-3 p-2.5 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors">
                <LogOut size={16} />
                <span className="text-sm font-semibold">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {isMobileMenuOpen && (
          <div onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden" />
        )}
        <aside className={`bg-[#181622] text-white w-64 border-r border-white/5 fixed left-0 top-0 h-full z-40 flex flex-col p-4 pt-24 transition-transform duration-300 lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <nav className="flex flex-col flex-1 space-y-1">
            <Link to="/dashboard" className="flex items-center gap-3 bg-gradient-to-r from-violet-500/10 to-indigo-500/10 text-violet-400 border-l-2 border-violet-500 px-4 py-3 transition-all rounded-r-lg">
              <Home size={20} />
              <span className="text-sm font-semibold">Home</span>
            </Link>
            <Link to="/dashboard" className="flex items-center gap-3 text-white/60 hover:text-white px-4 py-3 hover:bg-white/5 transition-all rounded-lg">
              <Palette size={20} />
              <span className="text-sm font-medium">My Designs</span>
            </Link>
            <Link to="/templates" className="flex items-center gap-3 text-white/60 hover:text-white px-4 py-3 hover:bg-white/5 transition-all rounded-lg">
              <LayoutTemplate size={20} />
              <span className="text-sm font-medium">Templates</span>
            </Link>
            <Link to="/profile" className="flex items-center gap-3 text-white/60 hover:text-white px-4 py-3 hover:bg-white/5 transition-all rounded-lg">
              <Sparkles size={20} />
              <span className="text-sm font-medium">Brand Kit</span>
            </Link>
          </nav>
          <div className="mt-auto border-t border-white/5 pt-4">
            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/5">
              <div className="flex-1 overflow-hidden">
                <p className="text-sm text-white font-bold truncate">{user.username || 'User'}</p>
                <p className="text-[10px] text-white/50 uppercase tracking-wider font-semibold mt-0.5">{user.plan || 'Free Plan'}</p>
              </div>
              <Award size={24} className="text-indigo-400" />
            </div>
          </div>
        </aside>

        <main className="flex-1 lg:ml-64 px-6 md:px-12 py-10 max-w-7xl mx-auto w-full">
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-white">Create New Design</h2>
              <Link to="/templates" className="text-violet-400 text-sm font-medium hover:text-violet-300 transition-colors">View all presets</Link>
            </div>
            <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar">
              {[
                { id: 'instagram', icon: <Camera size={24} />, label: 'Instagram' },
                { id: 'poster', icon: <FileText size={24} />, label: 'Poster' },
                { id: 'thumbnail', icon: <MonitorPlay size={24} />, label: 'Thumbnail' },
                { id: 'custom', icon: <Plus size={24} />, label: 'Custom Size' }
              ].map(preset => (
                <div key={preset.id} onClick={() => handleCreateDesign(preset.id)} className="min-w-[140px] group cursor-pointer">
                  <div className="aspect-square bg-[#181622] rounded-2xl border border-white/10 flex flex-col items-center justify-center gap-3 group-hover:border-violet-500/50 group-hover:bg-white/[0.02] transition-all">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${preset.id === 'instagram' ? 'bg-gradient-to-br from-violet-500 to-indigo-500 text-white' : 'bg-white/5 text-white/70 group-hover:text-violet-400 transition-colors'}`}>
                      {preset.icon}
                    </div>
                    <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">{preset.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-white">Recent Designs</h2>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white">
                  <LayoutGrid size={20} />
                </button>
                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-white/70">
                  <List size={20} />
                </button>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
                {[1, 2, 3, 4].map(i => <div key={i} className="aspect-[4/3] bg-white/5 rounded-2xl border border-white/5"></div>)}
              </div>
            ) : userDesigns.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {userDesigns.map(design => (
                  <div key={design.id} className="group relative bg-[#181622] rounded-2xl border border-white/10 overflow-hidden hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-300 hover:-translate-y-1">
                    <div className="aspect-[4/3] bg-[#0a090d] overflow-hidden relative border-b border-white/5">
                      {design.thumbnailUrl ? (
                        <img src={design.thumbnailUrl} alt={design.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity group-hover:scale-105 duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/20 group-hover:text-white/30 transition-colors group-hover:scale-105 duration-500">
                          <ImageIcon size={48} />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                        <Link to={`/editor?id=${design.id}`} className="w-10 h-10 rounded-full bg-white text-gray-900 flex items-center justify-center hover:bg-violet-500 hover:text-white transition-colors shadow-lg">
                          <Pencil size={18} />
                        </Link>
                        <button onClick={() => deleteDesign(design.id)} className="w-10 h-10 rounded-full bg-white text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors shadow-lg">
                          <Trash2 size={18} />
                        </button>
                        <button onClick={() => handleCreateDesign(design.type)} className="w-10 h-10 rounded-full bg-white text-gray-900 flex items-center justify-center hover:bg-gray-200 transition-colors shadow-lg">
                          <Copy size={18} />
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-bold text-white truncate">{design.title}</h3>
                      <p className="text-xs text-white/50 mt-1 font-medium">Updated {new Date(design.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-[#181622]/50 rounded-3xl border-2 border-dashed border-white/10">
                <FolderX size={48} className="mx-auto text-white/20 mb-4" />
                <p className="text-sm font-medium text-white/60">No designs found. Create your first masterpiece!</p>
                <button onClick={() => handleCreateDesign('custom')} className="mt-6 px-6 py-3 bg-white text-black rounded-full text-sm font-bold hover:bg-gray-200 transition-colors shadow-lg">Start Creating</button>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}