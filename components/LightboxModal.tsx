

import React, { useState, useRef, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, Download, Maximize, ArrowLeftRight, ArrowUpDown } from 'lucide-react';

interface LightboxModalProps {
    imageUrl: string;
    videoUrl?: string;
    title: string;
    onClose: () => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({ imageUrl, videoUrl, title, onClose }) => {
    const [scale, setScale] = useState(1.0);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });
    const lastPos = useRef({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const imgDimensions = useRef<{w: number, h: number}>({w: 0, h: 0});

    // Zoom limits
    const MIN_SCALE = 0.05; // 5%
    const MAX_SCALE = 10.0; // 1000%
    const ZOOM_STEP = 0.05; // 5%
    const PAN_STEP = 50;

    useEffect(() => {
        // Preload to get dimensions and fit only for images
        if (!videoUrl) {
            const img = new Image();
            img.onload = () => {
                imgDimensions.current = { w: img.width, h: img.height };
                handleFit();
            };
            img.src = imageUrl;
        }
    }, [imageUrl, videoUrl]);

    const handleZoom = (delta: number) => {
        setScale(prev => Math.max(MIN_SCALE, Math.min(prev + delta, MAX_SCALE)));
    };

    const handleFit = () => {
        if (!containerRef.current || !imgDimensions.current.w) return;
        const cw = containerRef.current.clientWidth;
        const ch = containerRef.current.clientHeight;
        const iw = imgDimensions.current.w;
        const ih = imgDimensions.current.h;
        
        const scaleX = cw / iw;
        const scaleY = ch / ih;
        const fitScale = Math.min(scaleX, scaleY) * 0.95; // 95% to leave margin
        
        setScale(Math.max(MIN_SCALE, fitScale));
        setPosition({ x: 0, y: 0 });
    };

    const handleFitHorizontal = () => {
        if (!containerRef.current || !imgDimensions.current.w) return;
        const cw = containerRef.current.clientWidth;
        const iw = imgDimensions.current.w;
        const fitScale = (cw / iw) * 0.95;
        setScale(Math.max(MIN_SCALE, fitScale));
        setPosition({ x: 0, y: 0 });
    };

    const handleFitVertical = () => {
        if (!containerRef.current || !imgDimensions.current.h) return;
        const ch = containerRef.current.clientHeight;
        const ih = imgDimensions.current.h;
        const fitScale = (ch / ih) * 0.95;
        setScale(Math.max(MIN_SCALE, fitScale));
        setPosition({ x: 0, y: 0 });
    };

    const handleSet100 = () => {
        setScale(1.0);
        setPosition({ x: 0, y: 0 });
    };

    // Mouse Wheel Zoom
    const handleWheel = (e: React.WheelEvent) => {
        if (videoUrl) return; // Disable custom zoom for video
        e.preventDefault();
        e.stopPropagation();
        const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
        handleZoom(delta);
    };

    // Drag to Pan
    const handleMouseDown = (e: React.MouseEvent) => {
        if (videoUrl) return; // Disable pan for video
        e.preventDefault();
        setIsDragging(true);
        dragStart.current = { x: e.clientX, y: e.clientY };
        lastPos.current = { x: position.x, y: position.y };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        e.preventDefault();
        const dx = e.clientX - dragStart.current.x;
        const dy = e.clientY - dragStart.current.y;
        setPosition({
            x: lastPos.current.x + dx,
            y: lastPos.current.y + dy
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown'].includes(e.key)) {
                e.preventDefault();
            }

            switch (e.key) {
                case 'Escape':
                    onClose();
                    break;
                case 'PageUp':
                    if (!videoUrl) handleZoom(ZOOM_STEP);
                    break;
                case 'PageDown':
                    if (!videoUrl) handleZoom(-ZOOM_STEP);
                    break;
                case 'ArrowLeft':
                    if (!videoUrl) setPosition(prev => ({ ...prev, x: prev.x + PAN_STEP }));
                    break;
                case 'ArrowRight':
                    if (!videoUrl) setPosition(prev => ({ ...prev, x: prev.x - PAN_STEP }));
                    break;
                case 'ArrowUp':
                    if (!videoUrl) setPosition(prev => ({ ...prev, y: prev.y + PAN_STEP }));
                    break;
                case 'ArrowDown':
                    if (!videoUrl) setPosition(prev => ({ ...prev, y: prev.y - PAN_STEP }));
                    break;
                case 'Home':
                    if (!videoUrl) handleFit();
                    break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, videoUrl]);

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = videoUrl || imageUrl;
        const ext = videoUrl ? (title.endsWith('.mp4') ? '' : '.mp4') : (title.endsWith('.png') || title.endsWith('.jpg') ? '' : '.png');
        link.download = `${title}${ext}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-2xl animate-in fade-in duration-300 flex flex-col">
            {/* Header / Controls */}
            <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-[210] bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                <div className="pointer-events-auto">
                    <h2 className="text-xl font-black text-white uppercase tracking-tighter shadow-black drop-shadow-md truncate max-w-md">{title}</h2>
                    {!videoUrl && <p className="text-xs text-gray-400 font-mono mt-1">Scale: {(scale * 100).toFixed(0)}%</p>}
                </div>
                <div className="flex items-center gap-4 pointer-events-auto">
                    {!videoUrl && (
                        <div className="flex bg-gray-900/80 backdrop-blur rounded-xl border border-gray-800 p-1 shadow-2xl">
                            <button onClick={() => handleZoom(ZOOM_STEP)} className="p-2.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-all active:scale-90" title="Zoom In (PageUp)"><ZoomIn className="w-5 h-5" /></button>
                            <button onClick={() => handleZoom(-ZOOM_STEP)} className="p-2.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-all active:scale-90" title="Zoom Out (PageDown)"><ZoomOut className="w-5 h-5" /></button>
                            <div className="w-px bg-gray-800 mx-1" />
                            <button onClick={handleFit} className="p-2.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-all active:scale-90" title="Zoom to Fit (Default)"><Maximize className="w-5 h-5" /></button>
                            <button onClick={handleFitHorizontal} className="p-2.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-all active:scale-90" title="Fit Horizontally"><ArrowLeftRight className="w-5 h-5" /></button>
                            <button onClick={handleFitVertical} className="p-2.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-all active:scale-90" title="Fit Vertically"><ArrowUpDown className="w-5 h-5" /></button>
                            <button onClick={handleSet100} className="p-2.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-all active:scale-90 flex items-center justify-center font-bold text-xs w-10" title="Zoom 100%">1:1</button>
                        </div>
                    )}
                    
                    <button onClick={handleDownload} className="p-3 bg-gray-800/80 hover:bg-gray-700 text-gray-400 hover:text-white rounded-xl border border-gray-700 transition-all group active:scale-90" title="Download">
                        <Download className="w-6 h-6" />
                    </button>

                    <button onClick={onClose} className="p-3 bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white rounded-xl border border-red-500/30 transition-all group active:scale-90" title="Close Lightbox (Esc)">
                        <X className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Viewport */}
            <div 
                ref={containerRef}
                className={`flex-1 relative overflow-hidden bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat flex items-center justify-center ${!videoUrl ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : ''}`}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                {videoUrl ? (
                    <video 
                        src={videoUrl} 
                        controls 
                        autoPlay 
                        className="max-w-full max-h-full outline-none shadow-2xl rounded-sm"
                    />
                ) : (
                    <img 
                        src={imageUrl} 
                        alt={title} 
                        style={{
                            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                            maxWidth: 'none',
                            maxHeight: 'none',
                            userSelect: 'none'
                        }}
                        className="shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-sm pointer-events-none"
                        draggable={false}
                    />
                )}
            </div>

            {/* Legend Overlay */}
            {!videoUrl && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 px-8 py-3 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full text-[10px] font-black text-white/40 uppercase tracking-[0.3em] pointer-events-none z-[210]">
                    <div className="flex items-center gap-2"><Maximize className="w-3 h-3" /> Wheel/PgUp/PgDn to Zoom</div>
                    <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                    <div className="flex items-center gap-2">Drag/Arrows to Scroll</div>
                </div>
            )}
        </div>
    );
};