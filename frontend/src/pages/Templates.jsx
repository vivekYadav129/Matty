import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { templates, designs } from '../services/api';
import { 
  Menu, LogOut, User, Home, Palette, LayoutTemplate, 
  Sparkles, Shield, Search, Crown, SearchX 
} from 'lucide-react';

export default function Templates() {
  const [templateList, setTemplateList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const user = (() => {
    const saved = localStorage.getItem('matty_user');
    try {
      return saved && saved !== 'undefined' ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  })();

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const data = await templates.list({ category, search });
        setTemplateList(data.content || []);
      } catch (err) {
        console.error('Failed to fetch templates', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, [category, search]);

  const handleUseTemplate = async (template) => {
    try {
      const newDesign = await designs.create({
        title: `Design from ${template.title}`,
        type: template.category,
        jsonData: template.jsonData,
        thumbnailUrl: template.thumbnailUrl
      });
      navigate(`/editor?id=${newDesign.id}`);
    } catch (err) {
      alert('Failed to start design from template');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('matty_token');
    localStorage.removeItem('matty_user');
    navigate('/');
  };

  return (
    <div className="bg-[#0f0e13] text-white font-sans min-h-screen">
      <header className="flex justify-between items-center w-full px-6 h-16 sticky top-0 z-50 bg-[#181622]/80 backdrop-blur-xl border-b border-white/5 shadow-sm">
        <div className="flex items-center gap-6">
          <Menu onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white/70 hover:text-white transition-colors cursor-pointer lg:hidden" size={24} />
          <Link to="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent tracking-tight">Matty</Link>
        </div>
        <nav className="hidden md:flex items-center gap-2">
          <Link to="/dashboard" className="text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all px-4 py-2 rounded-lg">Home</Link>
          <Link to="/dashboard" className="text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all px-4 py-2 rounded-lg">Designs</Link>
          <Link to="/templates" className="text-sm font-bold text-violet-400 bg-violet-500/10 transition-all px-4 py-2 rounded-lg">Templates</Link>
          <Link to="/profile" className="text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all px-4 py-2 rounded-lg">Brand Kit</Link>
        </nav>
        <div className="flex items-center gap-6">
          <button onClick={handleLogout} className="text-white/60 hover:text-red-400 transition-colors">
            <LogOut size={20} />
          </button>
          <button onClick={() => navigate('/dashboard')} className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-5 py-2 rounded-full text-sm font-bold hover:shadow-lg hover:shadow-violet-500/25 transition-all active:scale-95">My Workspace</button>
        </div>
      </header>

      <div className="flex max-w-7xl mx-auto">
        {isMobileMenuOpen && (
          <div onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden" />
        )}
        <aside className={`flex flex-col p-4 fixed left-0 top-16 h-[calc(100vh-64px)] z-40 bg-[#181622] border-r border-white/5 w-64 transition-transform duration-300 lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="mb-8 flex items-center gap-4 p-2">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 flex items-center justify-center bg-white/5">
              {user.avatar ? <img src={user.avatar} alt="avatar" /> : <User size={20} className="text-white/70" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white truncate w-32">{user.username || 'User'}</h3>
              <p className="text-[10px] text-white/50 uppercase tracking-wider font-semibold mt-0.5">{user.plan || 'Free Plan'}</p>
            </div>
          </div>
          <nav className="space-y-1">
            <Link to="/dashboard" className="flex items-center gap-3 text-white/60 px-4 py-3 hover:text-white hover:bg-white/5 transition-all rounded-lg cursor-pointer">
              <Home size={20} />
              <span className="text-sm font-medium">Home</span>
            </Link>
            <Link to="/dashboard" className="flex items-center gap-3 text-white/60 px-4 py-3 hover:text-white hover:bg-white/5 transition-all rounded-lg cursor-pointer">
              <Palette size={20} />
              <span className="text-sm font-medium">Designs</span>
            </Link>
            <Link to="/templates" className="flex items-center gap-3 bg-gradient-to-r from-violet-500/10 to-indigo-500/10 text-violet-400 border-l-2 border-violet-500 px-4 py-3 transition-all rounded-r-lg cursor-pointer">
              <LayoutTemplate size={20} />
              <span className="text-sm font-semibold">Templates</span>
            </Link>
            <Link to="/profile" className="flex items-center gap-3 text-white/60 px-4 py-3 hover:text-white hover:bg-white/5 transition-all rounded-lg cursor-pointer">
              <Sparkles size={20} />
              <span className="text-sm font-medium">Brand Kit</span>
            </Link>
            {user.role === 'ADMIN' && (
              <Link to="/admin" className="flex items-center gap-3 text-white/60 px-4 py-3 hover:text-white hover:bg-white/5 transition-all rounded-lg cursor-pointer">
                <Shield size={20} />
                <span className="text-sm font-medium">Admin Panel</span>
              </Link>
            )}
          </nav>
          
          <div className="mt-auto border-t border-white/5 pt-6">
            <h4 className="text-xs font-bold text-white/50 px-4 mb-4 uppercase tracking-widest">Categories</h4>
            <div className="px-4 space-y-3">
              {['Social', 'Presentations', 'Posters', 'Web'].map(cat => (
                <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${category === cat ? 'bg-violet-500 border-violet-500' : 'border-white/20 group-hover:border-violet-400'}`}>
                    {category === cat && <div className="w-2 h-2 bg-white rounded-sm" />}
                  </div>
                  <span className={`text-sm transition-colors ${category === cat ? 'text-white font-semibold' : 'text-white/60 group-hover:text-white'}`}>{cat}</span>
                </label>
              ))}
              {category && (
                <button onClick={() => setCategory('')} className="text-xs text-violet-400 hover:text-violet-300 font-medium mt-4">Clear Filter</button>
              )}
            </div>
          </div>
        </aside>

        <main className="flex-1 lg:ml-64 p-6 md:p-12 w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Template Gallery</h1>
              <p className="text-white/50 text-base max-w-2xl">Fuel your next project with professional layouts designed for high-end impact.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="relative flex-1 sm:w-72">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input 
                  placeholder="Search templates..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:border-violet-500/50 focus:bg-white/10 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {[1,2,3,4,5,6].map(i => <div key={i} className="aspect-[3/4] bg-white/5 animate-pulse rounded-2xl border border-white/5"></div>)}
            </div>
          ) : templateList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {templateList.map(template => (
                <div 
                  key={template.id} 
                  onClick={() => handleUseTemplate(template)}
                  className="group bg-[#181622] rounded-2xl overflow-hidden border border-white/10 hover:shadow-2xl hover:shadow-violet-500/10 hover:-translate-y-1 transition-all duration-300 relative flex flex-col cursor-pointer"
                >
                  <div className="absolute top-4 left-4 z-10">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-md border ${template.isPro ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'}`}>
                      {template.isPro && <Crown size={14} />}
                      {template.isPro ? 'Pro' : 'Free'}
                    </span>
                  </div>
                  <div className="aspect-[4/3] bg-[#0a090d] overflow-hidden relative border-b border-white/5">
                    <img src={template.thumbnailUrl} alt={template.title} className="w-full h-full object-cover group-hover:scale-105 group-hover:opacity-60 transition-all duration-500" />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <span className="bg-white text-gray-900 px-6 py-2.5 rounded-full font-bold shadow-xl flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                         Use Template
                       </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-white truncate">{template.title}</h3>
                    <p className="text-sm text-white/50 capitalize mt-1 font-medium">{template.category} • Professional</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-[#181622]/50 rounded-3xl border-2 border-dashed border-white/10">
              <SearchX size={48} className="mx-auto text-white/20 mb-4" />
              <p className="text-sm font-medium text-white/60">No templates found matching your criteria.</p>
              <button onClick={() => {setCategory(''); setSearch('')}} className="mt-6 px-6 py-3 text-violet-400 font-bold hover:text-violet-300 transition-colors">Clear all filters</button>
            </div>
          )}
        </main>
      </div>

      <footer className="w-full py-8 px-6 bg-[#181622] border-t border-white/5 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0 text-center md:text-left">
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">Matty Creative</span>
            <p className="text-xs text-white/40 mt-1 font-medium">© 2024 Matty Creative. All rights reserved.</p>
          </div>
          <div className="flex gap-6">
            <Link to="#" className="text-xs font-medium text-white/50 hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="#" className="text-xs font-medium text-white/50 hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}