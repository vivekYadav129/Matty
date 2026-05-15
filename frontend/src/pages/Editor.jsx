import React, { useState, useEffect } from "react";
import { Excalidraw, exportToBlob } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import { useSearchParams, useNavigate } from 'react-router-dom';
import { designs } from '../services/api';
import { ArrowLeft, Save, Loader2, Share2, Download } from 'lucide-react';

export default function Editor() {
  const [searchParams] = useSearchParams();
  const designId = searchParams.get('id');
  const navigate = useNavigate();
  const [excalidrawAPI, setExcalidrawAPI] = useState(null);
  const [initialData, setInitialData] = useState(null);
  const [title, setTitle] = useState('Untitled Design');
  const [saving, setSaving] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const fetchDesign = async () => {
      if (!designId) {
         setIsLoaded(true);
         return;
      }
      try {
        const data = await designs.get(designId);
        setTitle(data.title);
        if (data.jsonData && data.jsonData.elements) {
          setInitialData({
            elements: data.jsonData.elements,
            appState: data.jsonData.appState,
          });
        }
      } catch (err) {
        console.error('Failed to fetch design', err);
      } finally {
        setIsLoaded(true);
      }
    };
    fetchDesign();
  }, [designId]);

  const saveDesign = async () => {
    if (!excalidrawAPI || !designId) return;
    setSaving(true);
    try {
      const elements = excalidrawAPI.getSceneElements();
      const appState = excalidrawAPI.getAppState();
      
      let base64data = '';
      if (elements.length > 0) {
        const blob = await exportToBlob({
          elements,
          appState,
          mimeType: "image/png",
        });
        
        const reader = new FileReader();
        base64data = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
      }
      
      await designs.update(designId, {
        title,
        jsonData: { elements, appState: { viewBackgroundColor: appState.viewBackgroundColor } },
        thumbnailUrl: base64data || null
      });
    } catch (err) {
      console.error(err);
      alert('Failed to save design');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-[#0f0e13] font-sans text-white flex flex-col h-screen overflow-hidden selection:bg-violet-500/30">
      
      {/* Premium Glassmorphic Top Nav */}
      <header className="h-16 bg-[#14121c]/80 backdrop-blur-2xl border-b border-white/5 flex items-center justify-between px-6 z-50 shrink-0 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-indigo-500/5 pointer-events-none" />
        
        <div className="flex items-center gap-6 relative z-10">
          <button onClick={() => navigate('/dashboard')} className="font-bold text-2xl tracking-tighter bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent hover:scale-105 transition-transform drop-shadow-[0_0_15px_rgba(139,92,246,0.3)]">Matty</button>
          <div className="w-px h-6 bg-white/10" />
          <nav className="flex gap-1">
            <button className="text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 px-3 py-1.5 rounded-lg transition-all duration-300">File</button>
            <button className="text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 px-3 py-1.5 rounded-lg transition-all duration-300">Export</button>
          </nav>
        </div>

        <div className="flex items-center relative z-10 group">
          <input 
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            className="bg-transparent text-center font-semibold text-[15px] hover:bg-white/5 px-4 py-1.5 rounded-xl outline-none w-56 focus:bg-white/10 focus:ring-2 focus:ring-violet-500/50 transition-all duration-300 placeholder:text-white/30" 
            placeholder="Name your design"
          />
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button onClick={saveDesign} disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl text-sm font-semibold transition-all duration-300 hover:shadow-lg">
            {saving ? <Loader2 size={16} className="animate-spin text-violet-400" /> : <Save size={16} className="text-white/70" />}
            <span>Save</span>
          </button>
          <button className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-xl text-sm font-bold transition-all duration-300 shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] active:scale-95">
            <Share2 size={16} /> <span>Share</span>
          </button>
        </div>
      </header>

      <div className="flex-1 relative bg-[#121212]">
        {isLoaded ? (
            <Excalidraw
              excalidrawAPI={(api) => setExcalidrawAPI(api)}
              initialData={initialData}
              theme="dark"
            />
        ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0f0e13]">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 size={48} className="animate-spin text-violet-500 drop-shadow-[0_0_15px_rgba(139,92,246,0.5)]" />
                  <p className="text-sm text-white/50 font-medium tracking-widest uppercase">Loading Workspace</p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}