export default function Export() { return (<>
<div className="bg-surface-dim font-body-md text-on-surface">

<div className="fixed inset-0 overflow-hidden pointer-events-none select-none opacity-40">
<div className="flex h-screen">

<div className="w-64 bg-surface-container-low border-r border-outline-variant/20 flex flex-col p-md gap-md">
<div className="h-8 w-32 bg-primary/20 rounded-full"></div>
<div className="space-y-sm">
<div className="h-10 w-full bg-surface-container-highest rounded-lg"></div>
<div className="h-10 w-full bg-surface-container-highest rounded-lg"></div>
<div className="h-10 w-full bg-surface-container-highest rounded-lg"></div>
</div>
</div>

<div className="flex-1 bg-surface-bright p-xl flex items-center justify-center">
<div className="w-full max-w-4xl aspect-video bg-white shadow-2xl rounded-lg flex items-center justify-center relative overflow-hidden">
<img />
</div>
</div>
</div>
</div>

<div className="fixed inset-0 z-50 bg-on-background/40 backdrop-blur-sm flex items-center justify-center p-md">

<div className="bg-surface-container-lowest w-full max-w-[640px] rounded-[16px] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">

<div className="bg-surface-container-low px-lg py-md border-b border-outline-variant/30 flex justify-between items-center">
<div className="flex flex-col">
<h2 className="font-h3 text-h3 text-on-surface">Download</h2>
<p className="font-caption text-caption text-on-surface-variant">Choose your export settings for "Portfolio_Draft_01"</p>
</div>
<button className="p-sm rounded-full hover:bg-surface-container-high transition-colors">
<span className="material-symbols-outlined text-on-surface-variant">close</span>
</button>
</div>

<div className="flex flex-col md:flex-row p-lg gap-lg">

<div className="w-full md:w-5/12 flex flex-col gap-md">
<div className="aspect-square w-full rounded-xl border border-outline-variant/50 bg-surface-container overflow-hidden group relative">
<img />
<div className="absolute bottom-sm right-sm bg-on-background/60 backdrop-blur-md px-sm py-xs rounded text-white font-caption text-caption">
                            1920 × 1080 px
                        </div>
</div>
<div className="bg-surface-container-low p-md rounded-xl border border-outline-variant/30">
<div className="flex items-center justify-between mb-xs">
<span className="font-label-sm text-label-sm text-on-surface-variant">Estimated size</span>
<span className="font-label-sm text-label-sm font-bold text-on-surface">1.2 MB</span>
</div>
<div className="flex items-center justify-between">
<span className="font-label-sm text-label-sm text-on-surface-variant">Format</span>
<span className="font-label-sm text-label-sm font-bold text-on-surface">PNG (Original)</span>
</div>
</div>
</div>

<div className="w-full md:w-7/12 flex flex-col gap-lg">

<div className="flex flex-col gap-xs">
<label className="font-label-sm text-label-sm text-on-surface-variant px-xs">File name</label>
<input />
</div>

<div className="grid grid-cols-2 gap-md">
<div className="flex flex-col gap-xs">
<label className="font-label-sm text-label-sm text-on-surface-variant px-xs">File format</label>
<div className="relative group">
<select className="h-10 w-full pl-md pr-xl rounded-lg border border-outline-variant bg-surface-container-lowest appearance-none focus:border-primary outline-none cursor-pointer font-body-md text-on-surface">
<option>PNG</option>
<option selected="">JPG</option>
<option>PDF</option>
<option>SVG</option>
</select>
<span className="material-symbols-outlined absolute right-md top-2 pointer-events-none text-on-surface-variant">expand_more</span>
</div>
</div>
<div className="flex flex-col gap-xs">
<label className="font-label-sm text-label-sm text-on-surface-variant px-xs">Size</label>
<div className="flex p-1 bg-surface-container rounded-lg border border-outline-variant/30">
<button className="flex-1 py-1 px-md rounded-md bg-white shadow-sm font-label-sm text-label-sm text-primary font-bold">1x</button>
<button className="flex-1 py-1 px-md rounded-md hover:bg-surface-container-highest transition-colors font-label-sm text-label-sm text-on-surface-variant">2x</button>
</div>
</div>
</div>

<div className="flex flex-col gap-xs">
<div className="flex justify-between items-center px-xs">
<label className="font-label-sm text-label-sm text-on-surface-variant">Quality</label>
<span className="font-label-sm text-label-sm font-bold text-primary">85%</span>
</div>
<input />
</div>

<div className="flex flex-col gap-sm">
<label className="font-label-sm text-label-sm text-on-surface-variant px-xs">Background</label>
<div className="flex gap-md">
<label className="flex-1 flex items-center gap-md p-md rounded-xl border border-primary bg-primary/5 cursor-pointer transition-all">
<input />
<div className="flex flex-col">
<span className="font-label-sm text-label-sm font-bold text-on-surface">White</span>
<span className="font-caption text-caption text-on-surface-variant">Solid canvas color</span>
</div>
</label>
<label className="flex-1 flex items-center gap-md p-md rounded-xl border border-outline-variant hover:border-primary/50 cursor-pointer transition-all">
<input />
<div className="flex flex-col">
<span className="font-label-sm text-label-sm font-bold text-on-surface">Transparent</span>
<span className="font-caption text-caption text-on-surface-variant">No background</span>
</div>
</label>
</div>
</div>
</div>
</div>

<div className="px-lg py-md bg-surface-container-low border-t border-outline-variant/30 flex flex-col md:flex-row justify-between items-center gap-md">
<div className="flex items-center gap-sm">
<span className="material-symbols-outlined text-secondary-container" style={{"fontVariationSettings":"'FILL' 1"}}>auto_awesome</span>
<span className="font-label-sm text-label-sm font-bold text-secondary">PRO FEATURE: Ultra HD Export</span>
</div>
<div className="flex items-center gap-md w-full md:w-auto">
<button className="flex-1 md:flex-none px-xl h-11 rounded-lg font-label-sm text-label-sm font-semibold text-on-surface-variant hover:bg-surface-container-highest transition-all">
                        Cancel
                    </button>
<button className="flex-1 md:flex-none px-xl h-11 rounded-lg font-label-sm text-label-sm font-bold text-white bg-gradient-to-r from-primary to-secondary shadow-lg hover:shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-sm">
<span className="material-symbols-outlined text-[20px]">download</span>
                        Download
                    </button>
</div>
</div>
</div>
</div>

<footer className="fixed bottom-0 left-0 w-full py-md px-gutter flex flex-col md:flex-row justify-between items-center max-w-container-max mx-auto pointer-events-none opacity-0">
<div className="font-h3 text-h3 font-bold text-on-surface">Matty</div>
<div className="font-body-md text-body-md text-on-surface-variant">© 2024 Matty Creative. All rights reserved.</div>
</footer>

</div></>); }