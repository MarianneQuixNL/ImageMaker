
import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, Maximize, Copy, Download } from 'lucide-react';

interface ImageViewerProps {
    src: string;
    alt?: string;
    className?: string;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({ src, alt, className }) => {
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const lastPos = useRef({ x: 0, y: 0 });

    const handleWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            setZoom(z => Math.min(Math.max(0.1, z + delta), 10));
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        lastPos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            const dx = e.clientX - lastPos.current.x;
            const dy = e.clientY - lastPos.current.y;
            setPan(p => ({ x: p.x + dx, y: p.y + dy }));
            lastPos.current = { x: e.clientX, y: e.clientY };
        }
    };

    const handleMouseUp = () => setIsDragging(false);

    const reset = () => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    };

    const copyImage = async () => {
        try {
            const response = await fetch(src);
            const blob = await response.blob();
            await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
        } catch (e) {
            console.error("Failed to copy image", e);
        }
    };

    return (
        <div className={`relative overflow-hidden bg-gray-950 border border-gray-800 rounded-lg group ${className}`}>
            <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={copyImage} className="p-1.5 bg-black/60 text-white rounded hover:bg-violet-600 transition-colors" title="Copy to Clipboard">
                    <Copy className="w-4 h-4" />
                </button>
                <a href={src} download="image.png" className="p-1.5 bg-black/60 text-white rounded hover:bg-violet-600 transition-colors" title="Download">
                    <Download className="w-4 h-4" />
                </a>
            </div>

            <div 
                ref={containerRef}
                className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <img 
                    src={src} 
                    alt={alt} 
                    style={{ 
                        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                        transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                    }}
                    className="max-w-full max-h-full object-contain select-none"
                    draggable={false}
                />
            </div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/70 backdrop-blur rounded-full px-3 py-1.5 border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setZoom(z => Math.max(0.1, z - 0.25))} className="p-1 hover:text-violet-400"><ZoomOut className="w-4 h-4" /></button>
                <span className="text-[10px] font-mono min-w-[3rem] text-center">{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom(z => Math.min(10, z + 0.25))} className="p-1 hover:text-violet-400"><ZoomIn className="w-4 h-4" /></button>
                <div className="w-px h-3 bg-white/20 mx-1" />
                <button onClick={reset} className="p-1 hover:text-violet-400" title="Fit to Window"><Maximize className="w-4 h-4" /></button>
            </div>
        </div>
    );
};
