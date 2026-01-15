
import React, { useState, useRef, useEffect } from 'react';
import { X, CheckCircle2, Paintbrush, Eraser, Move, ZoomIn, ZoomOut, RotateCcw, Palette, Hand } from 'lucide-react';
import { HistoryItem } from '../types';

interface DrawModalProps {
    isOpen: boolean;
    onClose: () => void;
    image: HistoryItem;
    onConfirm: (dataUrl: string, wasRemoveUsed: boolean) => void;
}

type Tool = 'brush' | 'eraser' | 'remove' | 'pan';

export const DrawModal: React.FC<DrawModalProps> = ({ isOpen, onClose, image, onConfirm }) => {
    const [tool, setTool] = useState<Tool>('brush');
    const [brushSize, setBrushSize] = useState(50);
    const [brushColor, setBrushColor] = useState('#e2c4b5'); // Default skin-ish tone
    const [hardness, setHardness] = useState(0.5); // 0 to 1
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [wasRemoveUsed, setWasRemoveUsed] = useState(false);
    
    // Cursor State
    const [cursorPos, setCursorPos] = useState<{ x: number, y: number } | null>(null);
    const [showCursor, setShowCursor] = useState(false);
    
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const isDrawing = useRef(false);
    const isPanning = useRef(false);
    const lastPos = useRef<{ x: number, y: number } | null>(null);

    // Initialize Canvas
    useEffect(() => {
        if (isOpen && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                if (ctx) {
                    ctx.drawImage(img, 0, 0);
                }
                // Center image initially
                if (containerRef.current) {
                    const cw = containerRef.current.clientWidth;
                    const ch = containerRef.current.clientHeight;
                    // Fit to screen logic
                    const scaleX = cw / img.width;
                    const scaleY = ch / img.height;
                    const fitScale = Math.min(scaleX, scaleY) * 0.9;
                    setScale(fitScale);
                    setPosition({
                        x: (cw - img.width * fitScale) / 2,
                        y: (ch - img.height * fitScale) / 2
                    });
                }
            };
            img.src = image.url;
        }
    }, [isOpen, image]);

    const getMousePos = (e: React.MouseEvent | MouseEvent) => {
        if (!containerRef.current) return { x: 0, y: 0 };
        const rect = containerRef.current.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (tool === 'pan' || e.button === 1 || e.shiftKey) {
            isPanning.current = true;
            lastPos.current = getMousePos(e);
            return;
        }

        if (e.button !== 0) return;

        isDrawing.current = true;
        const pos = getMousePos(e);
        draw(pos.x, pos.y);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        const pos = getMousePos(e);
        setCursorPos(pos);

        if (isPanning.current && lastPos.current) {
            const dx = pos.x - lastPos.current.x;
            const dy = pos.y - lastPos.current.y;
            setPosition(prev => ({ x: prev.x + dx, y: prev.y + dy }));
            lastPos.current = pos;
            return;
        }

        if (isDrawing.current) {
            draw(pos.x, pos.y);
        }
    };

    const handleMouseUp = () => {
        isDrawing.current = false;
        isPanning.current = false;
        lastPos.current = null;
    };

    const handleMouseEnter = () => setShowCursor(true);
    const handleMouseLeave = () => {
        setShowCursor(false);
        isDrawing.current = false;
        isPanning.current = false;
    };

    const draw = (screenX: number, screenY: number) => {
        if (!canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        // Map screen coordinates to canvas coordinates
        // screenX = canvasX * scale + position.x
        // canvasX = (screenX - position.x) / scale
        const x = (screenX - position.x) / scale;
        const y = (screenY - position.y) / scale;

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = brushSize;

        // Create soft brush gradient
        // Since gradients are expensive on stroke, we use shadowBlur for softness or just globalAlpha/Composite
        // For performance, we stick to simple drawing but simulate hardness via shadow
        
        ctx.shadowBlur = (1 - hardness) * (brushSize / 2);
        
        if (tool === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.shadowColor = 'rgba(0,0,0,1)'; // Shadow needed for eraser softness
            ctx.strokeStyle = 'rgba(0,0,0,1)';
        } else {
            ctx.globalCompositeOperation = 'source-over';
            
            if (tool === 'remove') {
                setWasRemoveUsed(true);
                ctx.strokeStyle = '#FF00FF'; // High vis magenta for masking logic (visually)
                ctx.shadowColor = '#FF00FF';
            } else {
                ctx.strokeStyle = brushColor;
                ctx.shadowColor = brushColor;
            }
        }

        ctx.beginPath();
        // Quick stroke interpolation logic for React
        ctx.lineTo(x, y); 
        ctx.stroke();
        
        // Reset composite
        ctx.globalCompositeOperation = 'source-over';
        ctx.shadowBlur = 0;
    };

    const handleWheel = (e: React.WheelEvent) => {
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newScale = Math.min(Math.max(scale * delta, 0.1), 10);
        
        // Zoom towards mouse pointer logic
        const pos = getMousePos(e);
        const imageX = (pos.x - position.x) / scale;
        const imageY = (pos.y - position.y) / scale;
        
        const newX = pos.x - imageX * newScale;
        const newY = pos.y - imageY * newScale;

        setScale(newScale);
        setPosition({ x: newX, y: newY });
    };

    const handleSave = () => {
        if (!canvasRef.current) return;
        const dataUrl = canvasRef.current.toDataURL('image/png');
        onConfirm(dataUrl, wasRemoveUsed);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-gray-950 w-[95vw] h-[95vh] rounded-3xl overflow-hidden flex shadow-2xl border border-gray-800">
                
                {/* Canvas Area */}
                <div 
                    ref={containerRef}
                    className={`flex-1 relative overflow-hidden bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-gray-900 ${tool === 'pan' ? 'cursor-grab active:cursor-grabbing' : 'cursor-none'}`}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onWheel={handleWheel}
                >
                    <canvas 
                        ref={canvasRef}
                        className="absolute origin-top-left shadow-2xl"
                        style={{ 
                            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                            imageRendering: scale > 2 ? 'pixelated' : 'auto' 
                        }}
                    />
                    
                    {/* Brush Cursor Overlay */}
                    {showCursor && tool !== 'pan' && cursorPos && (
                        <div 
                            className="pointer-events-none absolute rounded-full border border-white/80 shadow-[0_0_4px_rgba(0,0,0,0.5)] z-50 mix-blend-difference"
                            style={{
                                width: brushSize * scale,
                                height: brushSize * scale,
                                left: cursorPos.x - (brushSize * scale) / 2,
                                top: cursorPos.y - (brushSize * scale) / 2,
                            }}
                        >
                            {/* Center Crosshair */}
                            <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-white/50 -translate-x-1/2 -translate-y-1/2 rounded-full" />
                        </div>
                    )}

                    {/* Floating Zoom Controls */}
                    <div className="absolute bottom-6 left-6 flex gap-2 z-50">
                        <div className="bg-black/60 backdrop-blur-md rounded-xl border border-white/10 p-2 flex gap-2">
                            <button onClick={() => setScale(s => Math.min(s * 1.2, 10))} className="p-2 hover:bg-white/10 rounded-lg text-white"><ZoomIn className="w-5 h-5" /></button>
                            <span className="text-white text-xs font-mono py-2 w-12 text-center">{(scale * 100).toFixed(0)}%</span>
                            <button onClick={() => setScale(s => Math.max(s * 0.8, 0.1))} className="p-2 hover:bg-white/10 rounded-lg text-white"><ZoomOut className="w-5 h-5" /></button>
                            <div className="w-px bg-white/20 mx-1" />
                            <button onClick={() => { setScale(1); setPosition({x:0, y:0}); }} className="p-2 hover:bg-white/10 rounded-lg text-white"><RotateCcw className="w-5 h-5" /></button>
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col p-6 gap-6 z-10 shadow-xl">
                    <div className="flex justify-between items-center border-b border-gray-800 pb-6">
                        <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                            <Paintbrush className="w-5 h-5 text-violet-500" /> Draw
                        </h2>
                        <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full text-gray-500 hover:text-white transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="space-y-6 flex-1 overflow-y-auto">
                        {/* Tools Grid */}
                        <div>
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Tools</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={() => setTool('brush')}
                                    className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${tool === 'brush' ? 'bg-violet-600 border-violet-500 text-white shadow-lg' : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-750'}`}
                                >
                                    <Paintbrush className="w-6 h-6" />
                                    <span className="text-xs font-bold">Brush</span>
                                </button>
                                <button 
                                    onClick={() => setTool('remove')}
                                    className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${tool === 'remove' ? 'bg-pink-600 border-pink-500 text-white shadow-lg' : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-750'}`}
                                >
                                    <Eraser className="w-6 h-6" />
                                    <span className="text-xs font-bold">Remove</span>
                                </button>
                                <button 
                                    onClick={() => setTool('eraser')}
                                    className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${tool === 'eraser' ? 'bg-gray-200 border-white text-black shadow-lg' : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-750'}`}
                                >
                                    <div className="w-6 h-6 border-2 border-current rounded-sm" />
                                    <span className="text-xs font-bold">Eraser</span>
                                </button>
                                <button 
                                    onClick={() => setTool('pan')}
                                    className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${tool === 'pan' ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-750'}`}
                                >
                                    <Hand className="w-6 h-6" />
                                    <span className="text-xs font-bold">Pan</span>
                                </button>
                            </div>
                        </div>

                        {/* Brush Settings */}
                        {tool !== 'pan' && (
                            <div className="space-y-4 bg-gray-850 p-4 rounded-xl border border-gray-800">
                                <div>
                                    <div className="flex justify-between text-xs font-bold text-gray-400 mb-2">
                                        <span>Size</span>
                                        <span>{brushSize}px</span>
                                    </div>
                                    <input 
                                        type="range" min="1" max="300" value={brushSize} 
                                        onChange={(e) => setBrushSize(parseInt(e.target.value))}
                                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
                                    />
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs font-bold text-gray-400 mb-2">
                                        <span>Hardness</span>
                                        <span>{(hardness * 100).toFixed(0)}%</span>
                                    </div>
                                    <input 
                                        type="range" min="0" max="1" step="0.1" value={hardness} 
                                        onChange={(e) => setHardness(parseFloat(e.target.value))}
                                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
                                    />
                                </div>
                                
                                {/* Color Picker (Only for Brush) */}
                                {tool === 'brush' && (
                                    <div>
                                        <div className="flex justify-between text-xs font-bold text-gray-400 mb-2">
                                            <span>Color</span>
                                        </div>
                                        <div className="flex gap-2 mb-2">
                                            {['#e2c4b5', '#8d5524', '#000000', '#ffffff', '#ef4444', '#22c55e', '#3b82f6'].map(c => (
                                                <button 
                                                    key={c}
                                                    onClick={() => setBrushColor(c)}
                                                    className={`w-6 h-6 rounded-full border border-gray-600 ${brushColor === c ? 'ring-2 ring-white scale-110' : ''}`}
                                                    style={{ backgroundColor: c }}
                                                />
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-2 bg-gray-900 p-2 rounded-lg border border-gray-700">
                                            <Palette className="w-4 h-4 text-gray-500" />
                                            <input 
                                                type="color" 
                                                value={brushColor}
                                                onChange={(e) => setBrushColor(e.target.value)}
                                                className="bg-transparent border-none w-full h-6 cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                )}
                                
                                {tool === 'remove' && (
                                    <div className="p-3 bg-pink-900/20 border border-pink-900/50 rounded-lg">
                                        <p className="text-[10px] text-pink-300 leading-tight">
                                            <span className="font-bold">Remove Mode:</span> Painting with this brush marks the area for the AI. When you save, a "Fix and Repair" job will automatically run to regenerate the marked areas.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="pt-4 border-t border-gray-800">
                        <button 
                            onClick={handleSave}
                            className="w-full flex items-center justify-center gap-2 py-4 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-violet-900/20"
                        >
                            <CheckCircle2 className="w-5 h-5" /> Save Image
                        </button>
                        {wasRemoveUsed && (
                            <p className="text-[10px] text-center mt-2 text-pink-400 font-bold animate-pulse">
                                + Auto-Fix Job will start
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
