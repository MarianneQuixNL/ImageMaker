import React, { useRef, useState } from 'react';
import { User, ChevronDown, Scissors, Layers, FolderInput, BoxSelect, Pencil, ShieldCheck, Maximize2, Play } from 'lucide-react';
import { HistoryItem } from '../../types';
import { jobService } from '../../services/jobService';
import { runSafetyCheck, extractSpecificPerson } from '../../services/jobActions';

interface AppRightSidebarProps {
    liveSelectedImage: HistoryItem | null;
    selectedPersonIndex: number;
    setSelectedPersonIndex: (idx: number) => void;
    toggleModal: (key: string, val: boolean) => void;
    setLightboxData: (data: {url: string, videoUrl?: string, title: string} | null) => void;
    hoveredPersonIndex: number | null;
    setHoveredPersonIndex: (idx: number | null) => void;
}

export const AppRightSidebar: React.FC<AppRightSidebarProps> = ({ 
    liveSelectedImage, selectedPersonIndex, setSelectedPersonIndex, 
    toggleModal, setLightboxData, hoveredPersonIndex, setHoveredPersonIndex 
}) => {
    const imageContainerRef = useRef<HTMLDivElement>(null);
    
    if (!liveSelectedImage) return null;

    const activePersonIndex = hoveredPersonIndex !== null ? hoveredPersonIndex : selectedPersonIndex;
    const activePerson = liveSelectedImage.peopleDetection?.people[activePersonIndex];
    const isActiveSelected = activePersonIndex === selectedPersonIndex;
    const isVideo = !!liveSelectedImage.videoUrl;

    const handleImageMouseMove = (e: React.MouseEvent) => {
        if (!liveSelectedImage?.peopleDetection?.people || !imageContainerRef.current) return;
        const rect = imageContainerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const normX = (x / rect.width) * 1000;
        const normY = (y / rect.height) * 1000;
        let matchIndex = -1;
        let minArea = Infinity;
        liveSelectedImage.peopleDetection.people.forEach((p, idx) => {
            if (!p.box_2d || p.box_2d.length < 4) return;
            const [ymin, xmin, ymax, xmax] = p.box_2d;
            if (normX >= xmin && normX <= xmax && normY >= ymin && normY <= ymax) {
                const area = (xmax - xmin) * (ymax - ymin);
                if (area < minArea) { minArea = area; matchIndex = idx; }
            }
        });
        setHoveredPersonIndex(matchIndex !== -1 ? matchIndex : null);
    };

    return (
        <div className="w-[20vw] min-w-[300px] flex flex-col bg-gray-900 border-l border-gray-800 shrink-0 z-10 overflow-y-auto custom-scrollbar">
            {/* Header Info */}
            <div className="p-3 border-b border-gray-800 bg-gray-900 sticky top-0 z-20 flex justify-between items-center">
                <div className="flex flex-col min-w-0 pr-2">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Selected Image</h3>
                    {liveSelectedImage.origin && (
                        <div className="text-[10px] text-gray-400 truncate max-w-[200px] font-mono flex items-center gap-1 mt-0.5" title={liveSelectedImage.origin}>
                            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 inline-block shrink-0"></span>
                            {liveSelectedImage.origin}
                        </div>
                    )}
                </div>
            </div>

            {/* Image Preview Area */}
            <div className="p-4 border-b border-gray-800 bg-gray-900 z-10">
                <div 
                    ref={imageContainerRef}
                    className="relative shadow-2xl group w-full bg-black rounded-lg overflow-hidden border border-gray-700 cursor-crosshair"
                    onMouseMove={handleImageMouseMove}
                    onMouseLeave={() => setHoveredPersonIndex(null)}
                    onClick={(e) => {
                        if (hoveredPersonIndex !== null) { setSelectedPersonIndex(hoveredPersonIndex); e.stopPropagation(); } 
                        else { setLightboxData({ url: liveSelectedImage.url, videoUrl: liveSelectedImage.videoUrl, title: liveSelectedImage.title }); }
                    }}
                >
                    <img 
                        src={liveSelectedImage.url} 
                        alt={liveSelectedImage.title} 
                        className="w-full h-auto object-contain block pointer-events-none"
                    />
                    {isVideo && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="bg-black/50 p-4 rounded-full backdrop-blur-sm border border-white/20">
                                <Play className="w-10 h-10 text-white fill-white" />
                            </div>
                        </div>
                    )}
                    {activePerson && activePerson.box_2d && (
                        <div 
                            className={`absolute border-2 z-10 pointer-events-none transition-all duration-150 ${isActiveSelected ? 'border-red-500 shadow-[0_0_8px_rgba(220,38,38,0.8)]' : 'border-white shadow-[0_0_8px_rgba(255,255,255,0.8)]'}`}
                            style={{
                                top: `${activePerson.box_2d[0] / 10}%`,
                                left: `${activePerson.box_2d[1] / 10}%`,
                                height: `${(activePerson.box_2d[2] - activePerson.box_2d[0]) / 10}%`,
                                width: `${(activePerson.box_2d[3] - activePerson.box_2d[1]) / 10}%`,
                            }}
                        />
                    )}
                    {/* Floating Controls Overlay */}
                    <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 pointer-events-auto">
                        {!isVideo && (
                            <>
                                <button onClick={(e) => { e.stopPropagation(); toggleModal('crop', true); }} className="p-1.5 bg-black/60 backdrop-blur rounded-lg text-white hover:bg-violet-600 transition-colors" title="Crop"><BoxSelect className="w-3 h-3" /></button>
                                <button onClick={(e) => { e.stopPropagation(); toggleModal('draw', true); }} className="p-1.5 bg-black/60 backdrop-blur rounded-lg text-white hover:bg-violet-600 transition-colors" title="Draw"><Pencil className="w-3 h-3" /></button>
                            </>
                        )}
                        <button onClick={(e) => { e.stopPropagation(); liveSelectedImage && runSafetyCheck(liveSelectedImage); }} className="p-1.5 bg-black/60 backdrop-blur rounded-lg text-white hover:bg-violet-600 transition-colors" title="Safety Check"><ShieldCheck className="w-3 h-3" /></button>
                        <button onClick={(e) => { e.stopPropagation(); setLightboxData({ url: liveSelectedImage.url, videoUrl: liveSelectedImage.videoUrl, title: liveSelectedImage.title }); }} className="p-1.5 bg-black/60 backdrop-blur rounded-lg text-white hover:bg-violet-600 transition-colors" title="Lightbox"><Maximize2 className="w-3 h-3" /></button>
                    </div>
                    <div className="absolute bottom-2 left-2 flex gap-1 flex-wrap z-20 pointer-events-none">
                        {liveSelectedImage.detectedStyle && <span className="px-1.5 py-0.5 bg-black/60 backdrop-blur text-[9px] text-white rounded border border-white/10 font-mono">{liveSelectedImage.detectedStyle}</span>}
                        {liveSelectedImage.fileDetails && <span className="px-1.5 py-0.5 bg-black/60 backdrop-blur text-[9px] text-gray-300 rounded border border-white/10 font-mono">{Math.round(liveSelectedImage.fileDetails.size / 1024)} KB</span>}
                    </div>
                </div>
            </div>

            {/* People Selector */}
            {liveSelectedImage.peopleDetection && liveSelectedImage.peopleDetection.people.length > 0 && (
                <div className="p-3 bg-gray-900 border-b border-gray-800">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Selected Subject</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-4 w-4 text-violet-500" />
                        </div>
                        <select
                            value={selectedPersonIndex}
                            onChange={(e) => setSelectedPersonIndex(Number(e.target.value))}
                            className="block w-full pl-10 pr-10 py-2.5 text-xs font-bold bg-gray-950 border border-gray-700 rounded-lg text-gray-200 focus:ring-1 focus:ring-violet-500 focus:border-violet-500 outline-none appearance-none cursor-pointer hover:border-gray-600 transition-colors"
                        >
                            {liveSelectedImage.peopleDetection.people
                                .map((p, idx) => ({ ...p, originalIndex: idx, area: (p.box_2d && p.box_2d.length === 4) ? (p.box_2d[3] - p.box_2d[1]) * (p.box_2d[2] - p.box_2d[0]) : 0 }))
                                .sort((a, b) => b.area - a.area)
                                .map((p) => (
                                    <option key={p.originalIndex} value={p.originalIndex}>
                                        {p.name || `Person ${p.originalIndex + 1}`} {p.gender ? `• ${p.gender}` : ''}
                                    </option>
                                ))
                            }
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <ChevronDown className="h-4 w-4 text-gray-500" />
                        </div>
                    </div>
                </div>
            )}

            {/* Actions for Selected Person */}
            {liveSelectedImage.peopleDetection && (
                <div className="p-3 bg-gray-900 border-b border-gray-800 grid grid-cols-2 gap-2 shrink-0">
                    <button 
                        onClick={() => {
                            const p = liveSelectedImage.peopleDetection?.people[selectedPersonIndex];
                            if(p) extractSpecificPerson(liveSelectedImage.id, p, false); 
                        }}
                        className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold rounded border border-gray-700 flex items-center justify-center gap-2"
                    >
                        <Scissors className="w-3 h-3" /> Cut Out
                    </button>
                    <button 
                        onClick={() => {
                            const p = liveSelectedImage.peopleDetection?.people[selectedPersonIndex];
                            if(p) extractSpecificPerson(liveSelectedImage.id, p, true);
                        }}
                        className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold rounded border border-gray-700 flex items-center justify-center gap-2"
                    >
                        <Layers className="w-3 h-3" /> Context
                    </button>
                    {liveSelectedImage.peopleDetection.people.length > 0 && (
                        <button 
                            onClick={() => {
                                liveSelectedImage.peopleDetection?.people.forEach(p => {
                                    extractSpecificPerson(liveSelectedImage.id, p, false);
                                });
                            }}
                            className="col-span-2 mt-1 px-3 py-2 bg-green-900/20 hover:bg-green-900/40 text-green-400 text-xs font-bold rounded border border-green-900/50 flex items-center justify-center gap-2 transition-colors"
                        >
                            <FolderInput className="w-3 h-3" /> Extract All to Workspace
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};
