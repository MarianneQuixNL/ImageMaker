
import React, { useState, useEffect, useRef } from 'react';
import { X, Shirt, CheckCircle2, Minus, FolderOpen, Folder, Circle, ChevronRight, Gem, Box, Sparkles, Droplets, ListChecks, Fingerprint, ChevronDown, RotateCcw, MessageSquare } from 'lucide-react';
import { HistoryItem } from '../types';
import { SMART_CLOTHES_THEMES } from '../constants/smartClothesThemes';
import { JEWELRY_STYLES, PROP_STYLES, DIRT_TYPES, SKIN_MARKING_STYLES } from '../constants/transformationOptions';

interface SmartClothesModalProps {
    isOpen: boolean;
    onClose: () => void;
    image: HistoryItem;
    onConfirm: (config: { parts: Record<string, PartConfiguration>, theme: string, jewelryStyle: string, propsStyle: string, dirtType: string, skinMarkingStyle: string }, aspectRatio?: string) => void;
    onEditPrompt?: (config: { parts: Record<string, PartConfiguration>, theme: string, jewelryStyle: string, propsStyle: string, dirtType: string, skinMarkingStyle: string }, aspectRatio?: string) => void;
}

// Data types for the new logic
type BaseAction = 'default' | 'clothe' | 'strip';
type AccessoryAction = 'jewelry' | 'props' | 'dirt' | 'skin';
type ClickMode = 'clothe' | 'strip' | 'jewelry' | 'props' | 'dirt' | 'skin';

export interface PartConfiguration {
    base: BaseAction;
    accessories: AccessoryAction[];
}

// T-Pose SVG Paths (400x600 coordinate system)
const MANNEQUIN_PATHS: Record<string, string> = {
    // Central Axis
    crown: "M170,30 L230,30 L230,15 L170,15 Z",
    head: "M200,30 C180,30 165,45 165,70 C165,95 180,110 200,110 C220,110 235,95 235,70 C235,45 220,30 200,30 Z",
    neck: "M185,110 L185,130 L215,130 L215,110 Z",
    chest: "M160,130 L240,130 L235,200 L165,200 Z",
    abdomen: "M165,200 L235,200 L235,260 L165,260 Z",
    hip: "M165,260 L235,260 L245,310 L155,310 Z",
    
    // Left Arm (Screen Right)
    l_upper_arm: "M240,130 L300,130 L300,160 L235,160 Z",
    l_elbow: "M300,130 L320,130 L320,160 L300,160 Z",
    l_lower_arm: "M320,130 L370,135 L370,155 L320,160 Z",
    l_wrist: "M370,135 L385,135 L385,155 L370,155 Z",
    l_hand: "M385,135 L400,125 L400,165 L385,155 Z",
    
    // Right Arm (Screen Left)
    r_upper_arm: "M160,130 L100,130 L100,160 L165,160 Z",
    r_elbow: "M100,130 L80,130 L80,160 L100,160 Z",
    r_lower_arm: "M80,130 L30,135 L30,155 L80,160 Z",
    r_wrist: "M30,135 L15,135 L15,155 L30,155 Z",
    r_hand: "M15,135 L0,125 L0,165 L15,155 Z",
    
    // Left Leg (Screen Right)
    l_upper_leg: "M200,310 L245,310 L240,410 L205,410 Z",
    l_knee: "M205,410 L240,410 L238,440 L207,440 Z",
    l_lower_leg: "M207,440 L238,440 L235,520 L210,520 Z",
    l_ankle: "M210,520 L235,520 L235,540 L210,540 Z",
    l_foot: "M210,540 L235,540 L245,570 L205,570 Z",
    
    // Right Leg (Screen Left)
    r_upper_leg: "M200,310 L155,310 L160,410 L195,410 Z",
    r_knee: "M195,410 L160,410 L162,440 L193,440 Z",
    r_lower_leg: "M193,440 L162,440 L165,520 L190,520 Z",
    r_ankle: "M190,520 L165,520 L165,540 L190,540 Z",
    r_foot: "M190,540 L165,540 L155,570 L195,570 Z"
};

// Center points for icons overlay
const PART_CENTERS: Record<string, {x: number, y: number}> = {
    crown: {x: 200, y: 22},
    head: {x: 200, y: 70},
    neck: {x: 200, y: 120},
    chest: {x: 200, y: 165},
    abdomen: {x: 200, y: 230},
    hip: {x: 200, y: 285},
    
    l_upper_arm: {x: 270, y: 145},
    l_elbow: {x: 310, y: 145},
    l_lower_arm: {x: 345, y: 145},
    l_wrist: {x: 377, y: 145},
    l_hand: {x: 395, y: 145},
    
    r_upper_arm: {x: 130, y: 145},
    r_elbow: {x: 90, y: 145},
    r_lower_arm: {x: 55, y: 145},
    r_wrist: {x: 22, y: 145},
    r_hand: {x: 5, y: 145},
    
    l_upper_leg: {x: 225, y: 360},
    l_knee: {x: 222, y: 425},
    l_lower_leg: {x: 222, y: 480},
    l_ankle: {x: 222, y: 530},
    l_foot: {x: 225, y: 555},
    
    r_upper_leg: {x: 175, y: 360},
    r_knee: {x: 178, y: 425},
    r_lower_leg: {x: 178, y: 480},
    r_ankle: {x: 178, y: 530},
    r_foot: {x: 175, y: 555}
};

const BODY_PARTS: Record<string, string> = {
    crown: "Crown", head: "Head", neck: "Neck", chest: "Chest", abdomen: "Abdomen", hip: "Hips",
    l_upper_arm: "L Shoulder", l_elbow: "L Elbow", l_lower_arm: "L Forearm", l_wrist: "L Wrist", l_hand: "L Hand",
    r_upper_arm: "R Shoulder", r_elbow: "R Elbow", r_lower_arm: "R Forearm", r_wrist: "R Wrist", r_hand: "R Hand",
    l_upper_leg: "L Thigh", l_knee: "L Knee", l_lower_leg: "L Shin", l_ankle: "L Ankle", l_foot: "L Foot",
    r_upper_leg: "R Thigh", r_knee: "R Knee", r_lower_leg: "R Shin", r_ankle: "R Ankle", r_foot: "R Foot"
};

const PART_GROUPS: Record<string, string[]> = {
    'Full Body': Object.keys(BODY_PARTS),
    'Torso': ['neck', 'chest', 'abdomen', 'hip'],
    'Arms': ['l_upper_arm', 'l_elbow', 'l_lower_arm', 'l_wrist', 'l_hand', 'r_upper_arm', 'r_elbow', 'r_lower_arm', 'r_wrist', 'r_hand'],
    'Legs': ['l_upper_leg', 'l_knee', 'l_lower_leg', 'l_ankle', 'l_foot', 'r_upper_leg', 'r_knee', 'r_lower_leg', 'r_ankle', 'r_foot'],
    'Head': ['crown', 'head', 'neck'],
    'Hands & Feet': ['l_hand', 'l_wrist', 'r_hand', 'r_wrist', 'l_foot', 'l_ankle', 'r_foot', 'r_ankle'],
    'Joints': ['l_elbow', 'r_elbow', 'l_knee', 'r_knee']
};

const AspectRatioSelector = ({ value, onChange }: { value: string, onChange: (v: string) => void }) => (
    <div className="flex flex-col gap-2 bg-gray-900 p-3 rounded-lg border border-gray-700 mt-2">
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Aspect Ratio</label>
        <div className="grid grid-cols-3 gap-2">
            {["As-is", "1:1", "16:9", "4:3", "3:4", "9:16"].map(r => (
                <button
                    key={r}
                    onClick={() => onChange(r)}
                    className={`px-2 py-1.5 rounded text-[10px] font-bold border transition-all ${value === r ? 'bg-violet-600 border-violet-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'}`}
                >
                    {r}
                </button>
            ))}
        </div>
    </div>
);

export const SmartClothesModal: React.FC<SmartClothesModalProps> = ({ isOpen, onClose, image, onConfirm, onEditPrompt }) => {
    const [theme, setTheme] = useState("Modern World > Casual");
    const [partsConfig, setPartsConfig] = useState<Record<string, PartConfiguration>>({});
    const [clickMode, setClickMode] = useState<ClickMode>('clothe');
    const [expandedThemes, setExpandedThemes] = useState<Record<string, boolean>>({});
    const [jewelryStyle, setJewelryStyle] = useState("Tribal/Bone");
    const [propsStyle, setPropsStyle] = useState("None");
    const [dirtType, setDirtType] = useState("Mud / Clay");
    const [skinMarkingStyle, setSkinMarkingStyle] = useState("Tan Lines (Swimwear/Underwear)");
    const [aspectRatio, setAspectRatio] = useState("As-is");
    
    // State for managing dropdown menus
    const [activeDropdown, setActiveDropdown] = useState<ClickMode | null>(null);
    const [dropdownPos, setDropdownPos] = useState<{top: number, left: number} | null>(null);

    const resetDefaults = () => {
        const initialConfig: Record<string, PartConfiguration> = {};
        Object.keys(BODY_PARTS).forEach(part => {
            initialConfig[part] = { base: 'default', accessories: [] };
        });
        setPartsConfig(initialConfig);
        setTheme("Modern World > Casual");
        setJewelryStyle("Tribal/Bone");
        setPropsStyle("None");
        setDirtType("Mud / Clay");
        setSkinMarkingStyle("Tan Lines (Swimwear/Underwear)");
        setAspectRatio("As-is");
        setClickMode('clothe');
    };

    // Initialize config
    useEffect(() => {
        if (isOpen) {
            resetDefaults();
        }
    }, [isOpen]);

    const getActiveConfig = () => {
        const activeConfig: Record<string, PartConfiguration> = {};
        Object.entries(partsConfig).forEach(([key, val]) => {
            const conf = val as PartConfiguration;
            if (conf.base !== 'default' || conf.accessories.length > 0) {
                activeConfig[key] = conf;
            }
        });
        return {
            parts: activeConfig,
            theme,
            jewelryStyle,
            propsStyle,
            dirtType,
            skinMarkingStyle
        };
    };

    const handleConfirm = () => {
        onConfirm(getActiveConfig(), aspectRatio === "As-is" ? undefined : aspectRatio);
        onClose();
    };

    const handleEdit = () => {
        if (onEditPrompt) {
            onEditPrompt(getActiveConfig(), aspectRatio === "As-is" ? undefined : aspectRatio);
            onClose();
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'Enter') handleConfirm();
        };
        if (isOpen) window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, partsConfig, theme, jewelryStyle, propsStyle, dirtType, skinMarkingStyle, aspectRatio]);

    const handlePartClick = (partKey: string) => {
        setPartsConfig(prev => {
            const current: PartConfiguration = prev[partKey] || { base: 'default', accessories: [] };
            const next = { ...current };

            if (clickMode === 'clothe') {
                next.base = next.base === 'clothe' ? 'default' : 'clothe';
            } else if (clickMode === 'strip') {
                next.base = next.base === 'strip' ? 'default' : 'strip';
            } else if (clickMode === 'jewelry' || clickMode === 'props' || clickMode === 'dirt' || clickMode === 'skin') {
                if (next.accessories.includes(clickMode)) {
                    next.accessories = next.accessories.filter(a => a !== clickMode);
                } else {
                    next.accessories = [...next.accessories, clickMode];
                }
            }
            return { ...prev, [partKey]: next };
        });
    };

    const applyToGroup = (mode: ClickMode, groupName: string) => {
        const parts = PART_GROUPS[groupName];
        if (!parts) return;

        setPartsConfig(prev => {
            const nextState = { ...prev };
            const allActive = parts.every(key => {
                const conf = nextState[key] || { base: 'default', accessories: [] };
                if (mode === 'clothe') return conf.base === 'clothe';
                if (mode === 'strip') return conf.base === 'strip';
                return conf.accessories?.includes(mode as AccessoryAction);
            });

            parts.forEach(key => {
                const existing = nextState[key] || { base: 'default', accessories: [] };
                
                if (mode === 'clothe') {
                    nextState[key] = { ...existing, base: allActive ? 'default' : 'clothe' };
                } else if (mode === 'strip') {
                    nextState[key] = { ...existing, base: allActive ? 'default' : 'strip' };
                } else {
                    const acc = new Set(existing.accessories || []);
                    if (allActive) acc.delete(mode as AccessoryAction);
                    else acc.add(mode as AccessoryAction);
                    nextState[key] = { ...existing, accessories: Array.from(acc) };
                }
            });
            return nextState;
        });
        setActiveDropdown(null);
    };

    const toggleThemeExpand = (category: string) => {
        setExpandedThemes(prev => ({ ...prev, [category]: !prev[category] }));
    };

    const handleDropdownClick = (e: React.MouseEvent, mode: ClickMode) => {
        e.stopPropagation();
        if (activeDropdown === mode) {
            setActiveDropdown(null);
        } else {
            const rect = e.currentTarget.getBoundingClientRect();
            // Calculate center bottom of button
            setDropdownPos({
                top: rect.bottom + 5,
                left: rect.left
            });
            setActiveDropdown(mode);
        }
    };

    const GroupDropdown = () => {
        if (!activeDropdown || !dropdownPos) return null;
        
        return (
            <>
                <div className="fixed inset-0 z-[100]" onClick={() => setActiveDropdown(null)} />
                <div 
                    className="fixed bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-[101] min-w-[140px] overflow-hidden animate-in fade-in zoom-in-95 duration-100 p-1"
                    style={{ top: dropdownPos.top, left: dropdownPos.left }}
                >
                    <div className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-800 mb-1">Apply to Group</div>
                    {Object.keys(PART_GROUPS).map(group => (
                        <button 
                            key={group} 
                            onClick={(e) => { e.stopPropagation(); applyToGroup(activeDropdown, group); }}
                            className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-violet-900/30 hover:text-white rounded-lg transition-colors flex items-center justify-between group"
                        >
                            {group}
                            <span className="text-[9px] text-gray-600 group-hover:text-gray-400">{PART_GROUPS[group].length}</span>
                        </button>
                    ))}
                </div>
            </>
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-gray-950 rounded-[2.5rem] shadow-2xl w-[95vw] h-[95vh] flex flex-col overflow-hidden border border-white/10 ring-1 ring-white/5">
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gray-950/50 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-violet-600 rounded-xl shadow-lg shadow-violet-900/40">
                            <Shirt className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white tracking-tighter uppercase">Smart Wardrobe</h2>
                            <p className="text-xs text-gray-500 font-mono">Generative Outfit & Accessory Tool</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={resetDefaults} className="p-2 hover:bg-white/10 rounded-full transition-all group" title="Reset">
                            <RotateCcw className="w-6 h-6 text-gray-500 group-hover:text-white" />
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all group active:scale-90">
                            <X className="w-6 h-6 text-gray-500 group-hover:text-white" />
                        </button>
                    </div>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Left: Theme Selection */}
                    <div className="w-80 border-r border-white/10 overflow-y-auto bg-gray-900/30 p-4 flex flex-col gap-4">
                        <div>
                            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Outfit Theme</h3>
                            <button 
                                onClick={() => setTheme("AI Auto-Context > Context Aware > As-Is (Minimal/Fitting)")}
                                className="w-full flex items-center gap-2 px-3 py-2 mb-3 bg-violet-900/20 border border-violet-500/30 rounded-lg text-xs font-bold text-violet-300 hover:bg-violet-900/40 hover:text-white transition-all text-left"
                            >
                                <Sparkles className="w-4 h-4" /> Auto-Detect (As-Is)
                            </button>

                            <div className="space-y-1">
                                {Object.entries(SMART_CLOTHES_THEMES).map(([category, subcats]) => (
                                    <div key={category}>
                                        <div 
                                            className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer hover:bg-white/5 transition-colors group"
                                            onClick={() => toggleThemeExpand(category)}
                                        >
                                            {expandedThemes[category] ? <FolderOpen className="w-4 h-4 text-violet-400" /> : <Folder className="w-4 h-4 text-gray-500 group-hover:text-gray-400" />}
                                            <span className="text-sm font-bold text-gray-300 group-hover:text-white">{category}</span>
                                            <ChevronRight className={`w-3 h-3 ml-auto text-gray-600 transition-transform ${expandedThemes[category] ? 'rotate-90' : ''}`} />
                                        </div>
                                        
                                        {expandedThemes[category] && (
                                            <div className="ml-4 mt-1 space-y-1 border-l border-white/10 pl-2">
                                                {Object.entries(subcats as Record<string, string[]>).map(([subcat, styles]) => (
                                                    <div key={subcat}>
                                                        {styles.map(style => {
                                                            const fullTheme = `${category} > ${subcat} > ${style}`;
                                                            const isSelected = theme === fullTheme;
                                                            return (
                                                                <div 
                                                                    key={style}
                                                                    onClick={() => setTheme(fullTheme)}
                                                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer text-xs transition-colors ${isSelected ? 'bg-violet-600 text-white font-bold' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                                                >
                                                                    <Circle className={`w-1.5 h-1.5 ${isSelected ? 'fill-current' : 'fill-transparent stroke-current'}`} />
                                                                    {style}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        {/* Original Image Thumbnail */}
                        <div className="mt-auto border-t border-white/10 pt-4">
                            <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">Original Reference</h3>
                            <div className="rounded-lg overflow-hidden border border-white/10 opacity-70 hover:opacity-100 transition-opacity bg-black">
                                <img src={image.url} alt="Reference" className="w-full h-auto object-contain max-h-48" />
                            </div>
                        </div>
                    </div>

                    {/* Middle: Visual Editor (SVG Drawing) */}
                    <div className="flex-1 bg-black/20 relative flex items-center justify-center p-0">
                        {/* Blob container with overflow hidden */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/5 rounded-full blur-3xl opacity-50" />
                        </div>

                        <div className="relative w-full h-full flex flex-col items-center justify-center z-10">
                            {/* Toolbar */}
                            <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-gray-900/90 backdrop-blur-xl border border-white/20 rounded-full p-1.5 flex gap-1 z-20 shadow-2xl overflow-x-auto max-w-[95%] no-scrollbar">
                                <div className="flex items-center gap-1 group shrink-0 relative">
                                    <button 
                                        onClick={() => setClickMode('clothe')}
                                        className={`px-4 py-2 rounded-l-full text-xs font-bold transition-all flex items-center gap-2 ${clickMode === 'clothe' ? 'bg-violet-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                    >
                                        <Shirt className="w-3.5 h-3.5" /> Clothe
                                    </button>
                                    <button onClick={(e) => handleDropdownClick(e, 'clothe')} className="px-2 py-2 rounded-r-full bg-gray-800 hover:bg-violet-700 text-gray-400 hover:text-white border-l border-gray-700 transition-colors relative" title="Group Select"><ChevronDown className="w-3 h-3" /></button>
                                </div>
                                <div className="w-px bg-white/10 mx-1 shrink-0" />
                                <div className="flex items-center gap-1 group shrink-0 relative">
                                    <button 
                                        onClick={() => setClickMode('strip')}
                                        className={`px-4 py-2 rounded-l-full text-xs font-bold transition-all flex items-center gap-2 ${clickMode === 'strip' ? 'bg-rose-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                    >
                                        <Minus className="w-3.5 h-3.5" /> Strip
                                    </button>
                                    <button onClick={(e) => handleDropdownClick(e, 'strip')} className="px-2 py-2 rounded-r-full bg-gray-800 hover:bg-rose-700 text-gray-400 hover:text-white border-l border-gray-700 transition-colors" title="Group Select"><ChevronDown className="w-3 h-3" /></button>
                                </div>
                                <div className="w-px bg-white/20 my-1 mx-1 shrink-0" />
                                <div className="flex items-center gap-1 group shrink-0 relative">
                                    <button 
                                        onClick={() => setClickMode('jewelry')}
                                        className={`px-4 py-2 rounded-l-full text-xs font-bold transition-all flex items-center gap-2 ${clickMode === 'jewelry' ? 'bg-amber-500 text-black shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                    >
                                        <Gem className="w-3.5 h-3.5" /> Jewelry
                                    </button>
                                    <button onClick={(e) => handleDropdownClick(e, 'jewelry')} className="px-2 py-2 rounded-r-full bg-gray-800 hover:bg-amber-600 text-gray-400 hover:text-white border-l border-gray-700 transition-colors" title="Group Select"><ChevronDown className="w-3 h-3" /></button>
                                </div>
                                <div className="flex items-center gap-1 group shrink-0 relative">
                                    <button 
                                        onClick={() => setClickMode('props')}
                                        className={`px-4 py-2 rounded-l-full text-xs font-bold transition-all flex items-center gap-2 ${clickMode === 'props' ? 'bg-zinc-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                    >
                                        <Box className="w-3.5 h-3.5" /> Props
                                    </button>
                                    <button onClick={(e) => handleDropdownClick(e, 'props')} className="px-2 py-2 rounded-r-full bg-gray-800 hover:bg-zinc-700 text-gray-400 hover:text-white border-l border-gray-700 transition-colors" title="Group Select"><ChevronDown className="w-3 h-3" /></button>
                                </div>
                                <div className="flex items-center gap-1 group shrink-0 relative">
                                    <button 
                                        onClick={() => setClickMode('dirt')}
                                        className={`px-4 py-2 rounded-l-full text-xs font-bold transition-all flex items-center gap-2 ${clickMode === 'dirt' ? 'bg-yellow-800 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                    >
                                        <Droplets className="w-3.5 h-3.5" /> Dirt
                                    </button>
                                    <button onClick={(e) => handleDropdownClick(e, 'dirt')} className="px-2 py-2 rounded-r-full bg-gray-800 hover:bg-yellow-900 text-gray-400 hover:text-white border-l border-gray-700 transition-colors" title="Group Select"><ChevronDown className="w-3 h-3" /></button>
                                </div>
                                <div className="flex items-center gap-1 group shrink-0 relative">
                                    <button 
                                        onClick={() => setClickMode('skin')}
                                        className={`px-4 py-2 rounded-l-full text-xs font-bold transition-all flex items-center gap-2 ${clickMode === 'skin' ? 'bg-orange-700 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                    >
                                        <Fingerprint className="w-3.5 h-3.5" /> Skin
                                    </button>
                                    <button onClick={(e) => handleDropdownClick(e, 'skin')} className="px-2 py-2 rounded-r-full bg-gray-800 hover:bg-orange-800 text-gray-400 hover:text-white border-l border-gray-700 transition-colors" title="Group Select"><ChevronDown className="w-3 h-3" /></button>
                                </div>
                            </div>

                            {/* SVG Mannequin (T-Pose) */}
                            <svg 
                                viewBox="0 0 400 600" 
                                className="h-[85%] w-auto max-w-full filter drop-shadow-[0_0_15px_rgba(0,0,0,0.5)] z-10"
                                preserveAspectRatio="xMidYMid meet"
                            >
                                <defs>
                                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                        <feGaussianBlur stdDeviation="3" result="blur" />
                                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                    </filter>
                                </defs>
                                
                                {Object.entries(MANNEQUIN_PATHS).map(([part, pathData]) => {
                                    // Explicit typing ensures TS knows what config is
                                    const config: PartConfiguration = partsConfig[part] || { base: 'default', accessories: [] };
                                    
                                    let fill = "#1f2937"; // default gray-800
                                    let stroke = "#374151"; // gray-700
                                    let filter = "";

                                    if (config.base === 'clothe') {
                                        fill = "#7c3aed"; // violet-600
                                        stroke = "#a78bfa"; // violet-400
                                        filter = "url(#glow)";
                                    } else if (config.base === 'strip') {
                                        fill = "#be123c"; // rose-700 (darker skin tone metaphor)
                                        stroke = "#f43f5e"; // rose-500
                                    }

                                    return (
                                        <g 
                                            key={part} 
                                            onClick={() => handlePartClick(part)}
                                            className="cursor-pointer transition-all duration-300 hover:opacity-90"
                                            style={{ transformOrigin: "center" }}
                                        >
                                            <path 
                                                d={pathData} 
                                                fill={fill} 
                                                stroke={stroke} 
                                                strokeWidth="2"
                                                filter={filter}
                                                className="transition-colors duration-200 ease-in-out"
                                            />
                                            {/* Accessories Indicators */}
                                            {config.accessories.includes('jewelry') && (
                                                <circle cx={PART_CENTERS[part].x - 8} cy={PART_CENTERS[part].y} r="4" fill="#f59e0b" stroke="white" strokeWidth="1" />
                                            )}
                                            {config.accessories.includes('props') && (
                                                <rect x={PART_CENTERS[part].x + 5} y={PART_CENTERS[part].y - 3} width="6" height="6" fill="#52525b" stroke="white" strokeWidth="1" />
                                            )}
                                            {config.accessories.includes('dirt') && (
                                                <path 
                                                    d={`M${PART_CENTERS[part].x},${PART_CENTERS[part].y + 10} m-5,-5 l10,0 l-5,10 z`} 
                                                    fill="#854d0e" stroke="white" strokeWidth="1" 
                                                />
                                            )}
                                            {config.accessories.includes('skin') && (
                                                <path 
                                                    d={`M${PART_CENTERS[part].x},${PART_CENTERS[part].y - 15} l5,5 l-5,5 l-5,-5 z`} 
                                                    fill="#c2410c" stroke="white" strokeWidth="1" 
                                                />
                                            )}
                                        </g>
                                    );
                                })}
                            </svg>
                            
                            {/* Legend / Info */}
                            <div className="absolute bottom-6 flex gap-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-gray-900/50 px-4 py-2 rounded-full border border-white/5 backdrop-blur-sm">
                                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-violet-600"></div> Clothed</div>
                                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-700"></div> Stripped</div>
                                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-gray-800 border border-gray-600"></div> Default</div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Summary & Options */}
                    <div className="w-72 bg-gray-950 border-l border-white/10 p-6 flex flex-col gap-6 overflow-y-auto">
                        <div>
                            <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.2em] mb-4">Summary</h3>
                            <div className="bg-gray-900 rounded-xl p-4 border border-white/5 space-y-3">
                                <div>
                                    <div className="text-[10px] font-bold text-gray-500 uppercase">Selected Theme</div>
                                    <div className="text-sm font-bold text-violet-400">{theme}</div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <div className="text-[10px] font-bold text-gray-500 uppercase">Clothed</div>
                                        <div className="text-lg font-mono text-white">{Object.values(partsConfig).filter((c: PartConfiguration) => c.base === 'clothe').length}</div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-[10px] font-bold text-gray-500 uppercase">Stripped</div>
                                        <div className="text-lg font-mono text-white">{Object.values(partsConfig).filter((c: PartConfiguration) => c.base === 'strip').length}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Extra Styles */}
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-2">Jewelry Style</label>
                                <select 
                                    value={jewelryStyle} 
                                    onChange={(e) => setJewelryStyle(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-500 outline-none"
                                >
                                    {JEWELRY_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-2">Props / Items</label>
                                <select 
                                    value={propsStyle} 
                                    onChange={(e) => setPropsStyle(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:border-zinc-500 outline-none"
                                >
                                    <option value="None">None</option>
                                    {PROP_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-2">Dirt Type</label>
                                <select 
                                    value={dirtType} 
                                    onChange={(e) => setDirtType(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:border-yellow-800 outline-none"
                                >
                                    {DIRT_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-2">Skin Markings</label>
                                <select 
                                    value={skinMarkingStyle} 
                                    onChange={(e) => setSkinMarkingStyle(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:border-orange-700 outline-none"
                                >
                                    {SKIN_MARKING_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <AspectRatioSelector value={aspectRatio} onChange={setAspectRatio} />
                        </div>

                        <div className="mt-auto flex flex-col gap-2">
                            {onEditPrompt && (
                                <button 
                                    onClick={handleEdit}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-bold text-xs uppercase tracking-widest transition-all border border-gray-700"
                                >
                                    <MessageSquare className="w-4 h-4" /> Edit Prompt
                                </button>
                            )}
                            <button 
                                onClick={handleConfirm}
                                className="w-full flex items-center justify-center gap-3 py-4 bg-white text-black hover:bg-gray-200 rounded-xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-xl"
                            >
                                <CheckCircle2 className="w-5 h-5" /> Generate Outfit
                            </button>
                        </div>
                    </div>
                </div>
                {/* Global Dropdown Render */}
                <GroupDropdown />
            </div>
        </div>
    );
};
