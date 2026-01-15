import React, { useState, useRef, useEffect } from 'react';
import { X, Sparkles, ChevronRight, Circle, Folder, FolderOpen, CheckSquare, Square, RotateCcw, User, Globe, Shirt, Sun, Fingerprint, Scissors, Eye, Smile, Cpu, Dog, Flower, Box, Home, Calendar, LayoutTemplate, ScanFace } from 'lucide-react';
// @FIX: Use action creator instead of jobService
import { generateNewImage } from '../../services/jobActions';

// Import Registries
import { WORLD_TREE } from '../Worlds/worldRegistry';
import { POSE_TREE } from '../Poses/poseRegistry';
import { CLOTHING_TREE } from '../Clothes/clothingRegistry';
import { LIGHTING_TREE } from '../Lighting/lightingRegistry';
import { SPECIES_TREE } from '../Species/speciesRegistry';
import { BODY_SHAPE_TREE } from '../BodyShapes/bodyShapeRegistry';
import { SKIN_TREE } from '../Skins/skinRegistry';
import { HAIR_TREE } from '../Hairs/hairRegistry';
import { EYE_TREE } from '../Eyes/eyeRegistry';
import { EXPRESSION_TREE } from '../Expressions/expressionRegistry';
import { PROSTHESIS_TREE } from '../Prosthesis/prosthesisRegistry';
import { ANIMAL_TREE } from '../Animals/animalRegistry';
import { PLANT_TREE } from '../Plants/plantRegistry';
import { OBJECT_TREE } from '../Objects/objectRegistry';
import { STRUCTURE_TREE } from '../Structures/structureRegistry';
import { STYLE_OPTIONS } from '../constants/transformationOptions';

interface GenerateImageModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// Age Ranges
const AGE_RANGES = [
    "Toddler (2-4)", "Child (5-10)", "Teenager (13-17)", "Young Adult (18-25)", 
    "Adult (30-40)", "Middle Aged (45-60)", "Elderly (70+)", "Ancient (100+)"
];

const GENDER_OPTIONS = [
    "Female", "Male", "Non-Binary", "Androgynous", "Transfeminine", "Transmasculine"
];

// Tabs
type Tab = 'Identity' | 'Species' | 'World' | 'Pose' | 'Clothes' | 'Lighting' | 'Body Shape' | 'Skin' | 'Hair' | 'Eyes' | 'Expression' | 'Prosthesis' | 'Animals' | 'Plants' | 'Objects' | 'Structures' | 'Style';

export const GenerateImageModal: React.FC<GenerateImageModalProps> = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState<Tab>('Identity');
    
    // Core Identity State
    const [gender, setGender] = useState("Female");
    const [ageSelections, setAgeSelections] = useState<Set<string>>(new Set(["Young Adult (18-25)"]));
    
    // Trait State
    const [selections, setSelections] = useState<Record<string, Set<string>>>({});
    const [autoFit, setAutoFit] = useState<Record<string, boolean>>({});
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
    const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
    
    // Technical Settings
    const [aspectRatio, setAspectRatio] = useState("2:3");
    const [model, setModel] = useState("imagen-4.0-generate-001");
    const [customPrompt, setCustomPrompt] = useState("");

    const tabsRef = useRef<HTMLDivElement>(null);

    // Initial Setup
    useEffect(() => {
        if (isOpen) {
            // Initialize selections map
            const initialSelections: Record<string, Set<string>> = {};
            const initialAutoFit: Record<string, boolean> = {};
            const tabs: Tab[] = ['Identity', 'Species', 'World', 'Pose', 'Clothes', 'Lighting', 'Body Shape', 'Skin', 'Hair', 'Eyes', 'Expression', 'Prosthesis', 'Animals', 'Plants', 'Objects', 'Structures', 'Style'];
            tabs.forEach(t => {
                initialSelections[t] = new Set();
                initialAutoFit[t] = false;
            });
            setSelections(initialSelections);
            setAutoFit(initialAutoFit);
            setAgeSelections(new Set(["Young Adult (18-25)"]));
            setGender("Female");
        }
    }, [isOpen]);

    // Reset navigation on tab change
    useEffect(() => {
        setSelectedCategory([]);
        setExpandedCategories({});
    }, [activeTab]);

    if (!isOpen) return null;

    const handleReset = () => {
        const resetSelections: Record<string, Set<string>> = {};
        const resetAutoFit: Record<string, boolean> = {};
        Object.keys(selections).forEach(k => {
            resetSelections[k] = new Set();
            resetAutoFit[k] = false;
        });
        setSelections(resetSelections);
        setAutoFit(resetAutoFit);
        setAgeSelections(new Set(["Young Adult (18-25)"]));
        setGender("Female");
        setCustomPrompt("");
    };

    const toggleExpand = (pathStr: string) => {
        setExpandedCategories(prev => {
            const isExpanding = !prev[pathStr];
            if (!isExpanding) return { ...prev, [pathStr]: false };
            const parentPath = pathStr.includes('::') ? pathStr.substring(0, pathStr.lastIndexOf('::')) : '';
            const nextState = { ...prev };
            Object.keys(nextState).forEach(key => {
                if (nextState[key]) {
                    const keyParent = key.includes('::') ? key.substring(0, key.lastIndexOf('::')) : '';
                    if (keyParent === parentPath && key !== pathStr) nextState[key] = false;
                }
            });
            nextState[pathStr] = true;
            return nextState;
        });
    };

    const handleSelectCategory = (path: string[]) => {
        setSelectedCategory(path);
    };

    const toggleOption = (option: string, categoryKey: string) => {
        setSelections(prev => {
            const currentSet = new Set(prev[categoryKey] || []);
            if (currentSet.has(option)) currentSet.delete(option);
            else currentSet.add(option);
            return { ...prev, [categoryKey]: currentSet };
        });
    };

    const toggleAge = (age: string) => {
        setAgeSelections(prev => {
            const next = new Set(prev);
            if (next.has(age)) next.delete(age);
            else next.add(age);
            return next;
        });
    };

    // --- Tree Data Resolution ---
    const getTreeSource = (tab: Tab) => {
        switch (tab) {
            case 'Species': return SPECIES_TREE; 
            case 'World': return WORLD_TREE;
            case 'Pose': return POSE_TREE;
            case 'Clothes': return CLOTHING_TREE;
            case 'Lighting': return LIGHTING_TREE;
            case 'Body Shape': return BODY_SHAPE_TREE;
            case 'Skin': return SKIN_TREE;
            case 'Hair': return HAIR_TREE;
            case 'Eyes': return EYE_TREE;
            case 'Expression': return EXPRESSION_TREE;
            case 'Prosthesis': return PROSTHESIS_TREE;
            case 'Animals': return ANIMAL_TREE;
            case 'Plants': return PLANT_TREE;
            case 'Objects': return OBJECT_TREE;
            case 'Structures': return STRUCTURE_TREE;
            case 'Style': return { "Art Styles": STYLE_OPTIONS };
            default: return {};
        }
    };

    const renderTree = (nodes: any, path: string[] = []) => {
        if (!nodes) return null;
        return (
            <div className="pl-3 border-l border-gray-800 ml-1.5">
                {Object.entries(nodes).map(([key, value]) => {
                    const newPath = [...path, key];
                    const newPathStr = newPath.join('::');
                    const isNodeLeaf = Array.isArray(value);
                    const isSelected = selectedCategory.join('::') === newPathStr;
                    const isExpanded = expandedCategories[newPathStr];
                    
                    return (
                        <div key={key}>
                            <div 
                                className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-xs mb-0.5 transition-colors ${isSelected ? 'bg-violet-900/40 text-violet-300 font-bold' : 'hover:bg-gray-800 text-gray-400'}`}
                                onClick={() => {
                                    if (isNodeLeaf) handleSelectCategory(newPath);
                                    else toggleExpand(newPathStr);
                                }}
                            >
                                {isNodeLeaf ? <Circle className="w-1.5 h-1.5 text-violet-400 fill-current" /> : (isExpanded ? <FolderOpen className="w-3.5 h-3.5 text-violet-400" /> : <Folder className="w-3.5 h-3.5 text-gray-500" />)}
                                <span className="truncate">{key}</span>
                                {!isNodeLeaf && <ChevronRight className={`w-3 h-3 ml-auto transition-transform ${isExpanded ? 'rotate-90' : ''}`} />}
                            </div>
                            {!isNodeLeaf && isExpanded && renderTree(value, newPath)}
                        </div>
                    );
                })}
            </div>
        );
    };

    const getOptions = (tree: any) => {
        if (selectedCategory.length === 0) return null;
        let current: any = tree;
        for (const key of selectedCategory) {
            if (current) current = current[key];
        }
        return Array.isArray(current) ? current : null;
    };

    // --- Generation Logic ---
    const generatePrompts = () => {
        const lists: { key: string, values: string[] }[] = [];
        
        // Age
        if (ageSelections.size > 0) lists.push({ key: 'Age', values: Array.from(ageSelections) });
        else lists.push({ key: 'Age', values: ["Adult (20-30)"] }); // Default

        // Traits
        Object.entries(selections).forEach(([key, val]) => {
            const set = val as Set<string>;
            if (autoFit[key]) {
                lists.push({ key, values: [`Context appropriate ${key}`] });
            } else if (set.size > 0) {
                lists.push({ key, values: Array.from(set) });
            }
        });

        // Cartesian Product
        const combinations = lists.reduce((acc, curr) => {
            const newAcc: any[] = [];
            if (acc.length === 0) {
                return curr.values.map(v => ({ [curr.key]: v }));
            }
            acc.forEach(existing => {
                curr.values.forEach(v => {
                    newAcc.push({ ...existing, [curr.key]: v });
                });
            });
            return newAcc;
        }, [] as any[]);

        return combinations;
    };

    const handleGenerate = () => {
        const combos = generatePrompts();

        combos.forEach(combo => {
            let prompt = `(Photorealistic:1.4), (Full Body:1.3), `;
            prompt += `${combo['Age']} ${gender}`;
            
            if (combo['Species']) prompt += ` ${combo['Species']}`;
            prompt += `. `;

            if (combo['Body Shape']) prompt += `Body: ${combo['Body Shape']}. `;
            if (combo['Skin']) prompt += `Skin: ${combo['Skin']}. `;
            if (combo['Hair']) prompt += `Hair: ${combo['Hair']}. `;
            if (combo['Eyes']) prompt += `Eyes: ${combo['Eyes']}. `;
            if (combo['Expression']) prompt += `Expression: ${combo['Expression']}. `;
            if (combo['Prosthesis']) prompt += `Prosthetics: ${combo['Prosthesis']}. `;
            
            if (combo['Clothes']) prompt += `Wearing: ${combo['Clothes']}. `;
            else prompt += `Wearing: Context appropriate clothing. `;

            if (combo['Pose']) prompt += `Action: ${combo['Pose']}. `;
            
            if (combo['World']) prompt += `Setting: ${combo['World']}. `;
            else prompt += `Setting: Simple studio background. `;

            if (combo['Lighting']) prompt += `Lighting: ${combo['Lighting']}. `;
            
            const envs = [];
            if (combo['Animals']) envs.push(combo['Animals']);
            if (combo['Plants']) envs.push(combo['Plants']);
            if (combo['Objects']) envs.push(combo['Objects']);
            if (combo['Structures']) envs.push(combo['Structures']);
            
            if (envs.length > 0) prompt += `\nSurroundings: ${envs.join(', ')}. `;
            
            if (combo['Style']) prompt += `\nArt Style: ${combo['Style']}. `;
            
            if (customPrompt) prompt += `\n${customPrompt}`;

            // @FIX: Use action creator
            generateNewImage(prompt, undefined, model);
        });

        onClose();
    };

    const scrollTabs = (direction: 'left' | 'right') => {
        if (tabsRef.current) {
            tabsRef.current.scrollBy({ left: direction === 'left' ? -200 : 200, behavior: 'smooth' });
        }
    };

    const tabsList: {id: Tab, icon: any}[] = [
        { id: 'Identity', icon: User },
        { id: 'Species', icon: ScanFace },
        { id: 'World', icon: Globe },
        { id: 'Pose', icon: User },
        { id: 'Clothes', icon: Shirt },
        { id: 'Lighting', icon: Sun },
        { id: 'Body Shape', icon: User },
        { id: 'Skin', icon: Fingerprint },
        { id: 'Hair', icon: Scissors },
        { id: 'Eyes', icon: Eye },
        { id: 'Expression', icon: Smile },
        { id: 'Prosthesis', icon: Cpu },
        { id: 'Animals', icon: Dog },
        { id: 'Plants', icon: Flower },
        { id: 'Objects', icon: Box },
        { id: 'Structures', icon: Home },
        { id: 'Style', icon: LayoutTemplate },
    ];

    const jobCount = generatePrompts().length;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm animate-in fade-in">
            <div className="bg-gray-950 rounded-xl shadow-2xl w-[95vw] h-[95vh] flex flex-col overflow-hidden relative border border-gray-800">
                
                {/* Header */}
                <div className="flex items-center justify-between p-3 border-b border-gray-800 bg-gray-900 shrink-0">
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-bold flex items-center gap-2 text-gray-100">
                            <Sparkles className="w-5 h-5 text-violet-500"/> Generate New Image
                        </h2>
                        
                        <div className="h-6 w-px bg-gray-800 mx-2" />
                        
                        <div className="flex items-center gap-2">
                            <select 
                                value={aspectRatio}
                                onChange={(e) => setAspectRatio(e.target.value)}
                                className="bg-gray-950 border border-gray-700 text-gray-300 text-xs rounded px-2 py-1 focus:border-violet-500 outline-none"
                            >
                                <option value="2:3">2:3 (Portrait)</option>
                                <option value="3:2">3:2 (Landscape)</option>
                                <option value="1:1">1:1 (Square)</option>
                                <option value="3:4">3:4 (Portrait)</option>
                                <option value="4:3">4:3 (Landscape)</option>
                                <option value="4:5">4:5 (Social)</option>
                                <option value="5:4">5:4 (Social)</option>
                                <option value="16:9">16:9</option>
                                <option value="9:16">9:16</option>
                            </select>

                            <select 
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                                className="bg-gray-950 border border-gray-700 text-gray-300 text-xs rounded px-2 py-1 focus:border-violet-500 outline-none"
                            >
                                <option value="imagen-4.0-generate-001">Imagen 3</option>
                                <option value="gemini-2.5-flash-image">Gemini Flash</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button onClick={handleReset} className="p-1.5 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white" title="Reset All">
                            <RotateCcw className="w-4 h-4" />
                        </button>
                        <button onClick={onClose} className="p-1.5 hover:bg-gray-800 rounded-full transition-colors">
                            <X className="w-5 h-5 text-gray-500"/>
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center border-b border-gray-800 bg-gray-900/50 shrink-0">
                    <button onClick={() => scrollTabs('left')} className="p-2 hover:bg-gray-800 text-gray-500 hover:text-white border-r border-gray-800 bg-gray-900 z-10"><ChevronRight className="w-3 h-3 rotate-180" /></button>
                    <div ref={tabsRef} className="flex overflow-x-auto no-scrollbar scroll-smooth flex-1">
                        {tabsList.map(tab => {
                            const count = (tab.id === 'Identity' && activeTab === 'Identity') ? 0 : (selections[tab.id]?.size || 0);
                            const isAuto = autoFit[tab.id];
                            return (
                                <button 
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)} 
                                    className={`flex-none py-2 px-3 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors border-b-2 whitespace-nowrap ${activeTab === tab.id ? 'text-violet-400 border-violet-500 bg-gray-800/50' : 'text-gray-500 border-transparent hover:text-white hover:bg-gray-800'}`}
                                >
                                    <tab.icon className="w-3 h-3" /> 
                                    {tab.id}
                                    {isAuto && <Sparkles className="w-2.5 h-2.5 text-emerald-500" />}
                                    {!isAuto && count > 0 && <span className="ml-0.5 text-[9px] bg-violet-600 text-white px-1 rounded-full">{count}</span>}
                                </button>
                            );
                        })}
                    </div>
                    <button onClick={() => scrollTabs('right')} className="p-2 hover:bg-gray-800 text-gray-500 hover:text-white border-l border-gray-800 bg-gray-900 z-10"><ChevronRight className="w-3 h-3" /></button>
                </div>

                {/* Main Content Area */}
                <div className="flex flex-1 overflow-hidden">
                    
                    {/* Identity Tab (Gender + Age Only) */}
                    {activeTab === 'Identity' && (
                        <div className="flex-1 p-6 overflow-hidden bg-gray-950 flex gap-6">
                            {/* Gender Column */}
                            <div className="w-1/3 flex flex-col gap-3 min-w-[250px] border-r border-gray-800 pr-6 overflow-y-auto">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-2">
                                    <User className="w-4 h-4"/> Gender Identity
                                </h3>
                                <div className="space-y-2">
                                    {GENDER_OPTIONS.map(g => (
                                        <button
                                            key={g}
                                            onClick={() => setGender(g)}
                                            className={`w-full px-4 py-4 rounded-xl text-sm font-bold transition-all border text-left flex justify-between items-center ${gender === g ? 'bg-violet-600 border-violet-500 text-white shadow-lg' : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600'}`}
                                        >
                                            {g}
                                            {gender === g && <CheckSquare className="w-4 h-4" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Age Column */}
                            <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-2">
                                    <Calendar className="w-4 h-4"/> Age Range
                                </h3>
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                                    {AGE_RANGES.map(age => {
                                        const isSelected = ageSelections.has(age);
                                        return (
                                            <button
                                                key={age}
                                                onClick={() => toggleAge(age)}
                                                className={`p-4 rounded-xl border transition-all text-left flex items-center justify-between group ${isSelected ? 'bg-violet-900/30 border-violet-500 shadow-md' : 'bg-gray-900 border-gray-800 hover:border-gray-600'}`}
                                            >
                                                <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-gray-400'}`}>{age}</span>
                                                {isSelected ? <CheckSquare className="w-4 h-4 text-violet-400" /> : <Square className="w-4 h-4 text-gray-700" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Standard Layout for Other Tabs */}
                    {activeTab !== 'Identity' && (
                        <>
                            {/* Sidebar Navigation */}
                            <div className="w-64 border-r border-gray-800 bg-gray-900/50 flex flex-col shrink-0">
                                {/* Auto-Fit Toggle in Sidebar Header */}
                                <div className="p-3 border-b border-gray-800 bg-gray-900 flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase">Category</span>
                                    <label className="flex items-center gap-1.5 cursor-pointer select-none group">
                                        <div className={`w-3 h-3 rounded border flex items-center justify-center transition-colors ${autoFit[activeTab] ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-gray-800 border-gray-600 group-hover:border-emerald-500/50'}`}>
                                            {autoFit[activeTab] && <CheckSquare className="w-2 h-2" />}
                                        </div>
                                        <input type="checkbox" checked={autoFit[activeTab]} onChange={(e) => setAutoFit(prev => ({...prev, [activeTab]: e.target.checked}))} className="hidden" />
                                        <span className={`text-[10px] font-bold ${autoFit[activeTab] ? 'text-emerald-400' : 'text-gray-500 group-hover:text-gray-300'}`}>Auto-Fit</span>
                                    </label>
                                </div>
                                <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                                    {renderTree(getTreeSource(activeTab))}
                                </div>
                            </div>

                            {/* Main Grid */}
                            <div className="flex-1 overflow-y-auto p-6 bg-gray-950 pb-24 custom-scrollbar relative">
                                {autoFit[activeTab] ? (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-700 select-none">
                                        <Sparkles className="w-16 h-16 mb-4 opacity-20 text-emerald-500" />
                                        <p className="text-sm font-bold uppercase tracking-widest text-emerald-500/50">Auto-Fit Enabled</p>
                                        <p className="text-xs mt-2 max-w-xs text-center opacity-60">AI will automatically select the best options for this category based on context.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                        {getOptions(getTreeSource(activeTab))?.map((option: string) => {
                                            const isSelected = selections[activeTab]?.has(option);
                                            return (
                                                <button
                                                    key={option}
                                                    onClick={() => toggleOption(option, activeTab)}
                                                    className={`p-3 rounded-lg border transition-all text-left group relative flex justify-between items-start ${isSelected ? 'bg-violet-900/30 border-violet-500 shadow-sm' : 'bg-gray-900 border-gray-800 hover:border-gray-600 hover:bg-gray-800'}`}
                                                >
                                                    <span className={`font-bold text-xs block mb-1 ${isSelected ? 'text-violet-300' : 'text-gray-300 group-hover:text-white'}`}>{option.split('(')[0]}</span>
                                                    <div className="ml-2">
                                                        {isSelected ? <CheckSquare className="w-4 h-4 text-violet-400" /> : <Square className="w-4 h-4 text-gray-700 group-hover:text-gray-500" />}
                                                    </div>
                                                </button>
                                            );
                                        }) || <div className="col-span-full flex flex-col items-center justify-center mt-20 text-gray-600"><p className="text-xs">Select a category from the sidebar</p></div>}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Footer / Custom Prompt */}
                <div className="p-3 border-t border-gray-800 bg-gray-900 z-10 flex flex-col gap-3">
                    <div className="flex gap-2 items-center">
                        <input 
                            type="text"
                            value={customPrompt}
                            onChange={(e) => setCustomPrompt(e.target.value)}
                            className="flex-1 bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-200 focus:border-violet-500 outline-none"
                            placeholder="Additional prompt details (e.g. 'wearing a red scarf', 'holding a sword')..."
                        />
                        <div className="text-xs text-gray-500 whitespace-nowrap min-w-[100px] text-right">
                            <span className="text-white font-bold">{jobCount}</span> Combos
                        </div>
                        <button 
                            onClick={handleGenerate}
                            className="flex items-center gap-2 px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-bold text-xs shadow-lg transition-all active:scale-95 whitespace-nowrap"
                        >
                            <Sparkles className="w-4 h-4" /> Generate
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};