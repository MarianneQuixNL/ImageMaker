
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { X, Globe, ChevronRight, Circle, Folder, FolderOpen, Upload, Layers, CheckSquare, Square, User, Shirt, Footprints, Settings, Image as ImageIcon, Sun, ScanFace, Eye, Smile, Scissors, Fingerprint, RotateCcw, Radio, Sparkles, ChevronLeft, Cpu, Dog, Flower, Box, Home, MessageSquare } from 'lucide-react';
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
import { HistoryItem } from '../types';

export interface TraitSelections {
    World: string[];
    Pose: string[];
    Clothes: string[];
    Lighting: string[];
    Species: string[];
    'Body Shape': string[];
    Skin: string[];
    Hair: string[];
    Eyes: string[];
    Expression: string[];
    Prosthesis: string[];
    Animals: string[];
    Plants: string[];
    Objects: string[];
    Structures: string[];
}

interface BackgroundSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    // Updated signature for unified handling
    onSelectBackground: (
        data: TraitSelections, 
        isUpload: boolean, 
        uploadId?: string, 
        aspectRatio?: string, 
        barefoot?: boolean
    ) => void;
    onEditPrompt?: (
        data: TraitSelections, 
        aspectRatio?: string, 
        barefoot?: boolean
    ) => void;
    history: HistoryItem[];
}

type Tab = keyof TraitSelections | 'Settings';

export const BackgroundSelectionModal: React.FC<BackgroundSelectionModalProps> = ({ isOpen, onClose, onSelectBackground, onEditPrompt, history }) => {
    const [activeTab, setActiveTab] = useState<Tab>('World');
    
    // Navigation State
    const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

    // Unified Selection State
    const [selections, setSelections] = useState<Record<keyof TraitSelections, Set<string>>>({
        World: new Set(),
        Pose: new Set(),
        Clothes: new Set(),
        Lighting: new Set(),
        Species: new Set(),
        'Body Shape': new Set(),
        Skin: new Set(),
        Hair: new Set(),
        Eyes: new Set(),
        Expression: new Set(),
        Prosthesis: new Set(),
        Animals: new Set(),
        Plants: new Set(),
        Objects: new Set(),
        Structures: new Set()
    });

    // Auto-Fit State (Context Aware Selection)
    const [autoFit, setAutoFit] = useState<Record<keyof TraitSelections, boolean>>({
        World: false,
        Pose: false,
        Clothes: false,
        Lighting: false,
        Species: false,
        'Body Shape': false,
        Skin: false,
        Hair: false,
        Eyes: false,
        Expression: false,
        Prosthesis: false,
        Animals: false,
        Plants: false,
        Objects: false,
        Structures: false
    });

    // Multi-Select Mode Control (Per Tab)
    const [multiSelectEnabled, setMultiSelectEnabled] = useState<Record<keyof TraitSelections, boolean>>({
        World: false,
        Pose: false,
        Clothes: false,
        Lighting: false,
        Species: false,
        'Body Shape': false,
        Skin: false,
        Hair: false,
        Eyes: false,
        Expression: false,
        Prosthesis: false,
        Animals: true,
        Plants: true,
        Objects: true,
        Structures: true
    });

    // Settings
    const [aspectRatio, setAspectRatio] = useState("As-is");
    const [barefoot, setBarefoot] = useState(false);
    
    const tabsRef = useRef<HTMLDivElement>(null);

    const uploadedBackgrounds = useMemo(() => {
        return history.filter(item => item.isBackground && item.url);
    }, [history]);

    // Reset navigation when tab changes
    useEffect(() => {
        setSelectedCategory([]);
        setExpandedCategories({});
    }, [activeTab]);

    if (!isOpen) return null;

    const scrollTabs = (direction: 'left' | 'right') => {
        if (tabsRef.current) {
            const scrollAmount = 200;
            tabsRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
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

    const toggleOption = (option: string, tab: keyof TraitSelections) => {
        const isMulti = multiSelectEnabled[tab];
        
        setSelections(prev => {
            const currentSet = new Set(prev[tab]);
            
            if (isMulti) {
                // Toggle behavior
                if (currentSet.has(option)) currentSet.delete(option);
                else currentSet.add(option);
            } else {
                // Single select behavior (Radio)
                if (currentSet.has(option)) {
                    currentSet.clear(); // Deselect if clicking same
                } else {
                    currentSet.clear();
                    currentSet.add(option);
                }
            }
            
            return { ...prev, [tab]: currentSet };
        });
    };

    const handleReset = () => {
        setSelections({
            World: new Set(),
            Pose: new Set(),
            Clothes: new Set(),
            Lighting: new Set(),
            Species: new Set(),
            'Body Shape': new Set(),
            Skin: new Set(),
            Hair: new Set(),
            Eyes: new Set(),
            Expression: new Set(),
            Prosthesis: new Set(),
            Animals: new Set(),
            Plants: new Set(),
            Objects: new Set(),
            Structures: new Set()
        });
        setAutoFit({
            World: false,
            Pose: false,
            Clothes: false,
            Lighting: false,
            Species: false,
            'Body Shape': false,
            Skin: false,
            Hair: false,
            Eyes: false,
            Expression: false,
            Prosthesis: false,
            Animals: false,
            Plants: false,
            Objects: false,
            Structures: false
        });
        setAspectRatio("As-is");
        setBarefoot(false);
    };

    const getTraitSelections = (): TraitSelections => {
        return {
            World: autoFit.World ? ["Context Appropriate"] : Array.from(selections.World),
            Pose: autoFit.Pose ? ["Context Appropriate"] : Array.from(selections.Pose),
            Clothes: autoFit.Clothes ? ["Context Appropriate"] : Array.from(selections.Clothes),
            Lighting: autoFit.Lighting ? ["Context Appropriate"] : Array.from(selections.Lighting),
            Species: autoFit.Species ? ["Context Appropriate"] : Array.from(selections.Species),
            'Body Shape': autoFit['Body Shape'] ? ["Context Appropriate"] : Array.from(selections['Body Shape']),
            Skin: autoFit.Skin ? ["Context Appropriate"] : Array.from(selections.Skin),
            Hair: autoFit.Hair ? ["Context Appropriate"] : Array.from(selections.Hair),
            Eyes: autoFit.Eyes ? ["Context Appropriate"] : Array.from(selections.Eyes),
            Expression: autoFit.Expression ? ["Context Appropriate"] : Array.from(selections.Expression),
            Prosthesis: autoFit.Prosthesis ? ["Context Appropriate"] : Array.from(selections.Prosthesis),
            Animals: autoFit.Animals ? ["Context Appropriate"] : Array.from(selections.Animals),
            Plants: autoFit.Plants ? ["Context Appropriate"] : Array.from(selections.Plants),
            Objects: autoFit.Objects ? ["Context Appropriate"] : Array.from(selections.Objects),
            Structures: autoFit.Structures ? ["Context Appropriate"] : Array.from(selections.Structures)
        };
    };

    const handleConfirm = () => {
        const result = getTraitSelections();
        onSelectBackground(
            result,
            false, 
            undefined,
            aspectRatio === "As-is" ? undefined : aspectRatio,
            barefoot
        );
        onClose();
    };

    const handleEditPrompt = () => {
        if (onEditPrompt) {
            onEditPrompt(getTraitSelections(), aspectRatio === "As-is" ? undefined : aspectRatio, barefoot);
            onClose();
        }
    };

    const getTreeSource = (tab: Tab) => {
        switch (tab) {
            case 'World': return WORLD_TREE;
            case 'Pose': return POSE_TREE;
            case 'Clothes': return CLOTHING_TREE;
            case 'Lighting': return LIGHTING_TREE;
            case 'Species': return SPECIES_TREE;
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
            default: return {};
        }
    };

    const renderTree = (nodes: any, path: string[] = []) => {
        if (!nodes) return null;
        
        return (
            <div className="pl-4 border-l border-gray-700 ml-2">
                {Object.entries(nodes).map(([key, value]) => {
                    const newPath = [...path, key];
                    const newPathStr = newPath.join('::');
                    const isNodeLeaf = Array.isArray(value);
                    const isSelected = selectedCategory.join('::') === newPathStr;
                    const isExpanded = expandedCategories[newPathStr];
                    
                    let activeColorClass = 'text-violet-300';
                    let activeBgClass = 'bg-violet-900/40';
                    let iconColorClass = 'text-violet-400';

                    return (
                        <div key={key}>
                            <div 
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm mb-1 transition-colors ${isSelected ? `${activeBgClass} ${activeColorClass} font-bold` : 'hover:bg-gray-800 text-gray-300'}`}
                                onClick={() => {
                                    if (isNodeLeaf) handleSelectCategory(newPath);
                                    else toggleExpand(newPathStr);
                                }}
                            >
                                {isNodeLeaf ? <Circle className={`w-2 h-2 ${iconColorClass} fill-current`} /> : (isExpanded ? <FolderOpen className={`w-4 h-4 ${iconColorClass}`} /> : <Folder className="w-4 h-4 text-gray-500" />)}
                                <span>{key}</span>
                                {!isNodeLeaf && <ChevronRight className={`w-3 h-3 ml-auto transition-transform ${isExpanded ? 'rotate-90' : ''}`} />}
                            </div>
                            {!isNodeLeaf && isExpanded && renderTree(value, newPath)}
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderUploadedSection = () => {
        const isSelected = selectedCategory[0] === 'Uploaded Backgrounds';
        return (
            <div className="mb-2">
                <div 
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm mb-1 transition-colors ${isSelected ? 'bg-green-900/40 text-green-300 font-bold' : 'hover:bg-gray-800 text-gray-300'}`}
                    onClick={() => handleSelectCategory(['Uploaded Backgrounds'])}
                >
                    <Upload className="w-4 h-4 text-green-500" />
                    <span>Uploaded Backgrounds</span>
                    <span className="ml-auto text-xs bg-green-900 text-green-300 px-2 py-0.5 rounded-full border border-green-800">{uploadedBackgrounds.length}</span>
                </div>
            </div>
        );
    };

    const getOptions = (tree: any) => {
        if (selectedCategory.length === 0) return null;
        if (selectedCategory[0] === 'Uploaded Backgrounds') return 'UPLOADED';
        let current: any = tree;
        for (const key of selectedCategory) {
            if (current) current = current[key];
        }
        return Array.isArray(current) ? current : null;
    };

    const renderOptionsGrid = (options: string[] | 'UPLOADED' | null, type: Tab) => {
        const currentTab = type as keyof TraitSelections;
        const isMulti = multiSelectEnabled[currentTab];

        if (options === 'UPLOADED') {
            return uploadedBackgrounds.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {uploadedBackgrounds.map((bg) => {
                        const key = `__UPLOAD__${bg.id}`;
                        const isSelected = selections.World.has(key);
                        return (
                            <div 
                                key={bg.id}
                                onClick={() => toggleOption(key, 'World')}
                                className={`group cursor-pointer rounded-lg overflow-hidden border transition-all relative aspect-video bg-gray-900 ${isSelected ? 'border-green-500 ring-2 ring-green-900' : 'border-gray-700 hover:border-green-500'}`}
                            >
                                <img src={bg.url} alt={bg.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100" />
                                <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white p-2 text-xs truncate">
                                    {bg.title}
                                </div>
                                {isSelected && (
                                    <div className="absolute top-2 right-2 bg-green-600 rounded-full p-1 shadow-lg">
                                        <CheckSquare className="w-4 h-4 text-white" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-600">
                    <Upload className="w-16 h-16 mb-4 opacity-10" />
                    <p>No uploaded images without people found.</p>
                </div>
            );
        }

        if (!options) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-gray-600">
                    <p>Select a category from the sidebar</p>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {options.map((option: string) => {
                    const isSelected = selections[currentTab].has(option);
                    let highlightClass = 'bg-violet-900/30 border-violet-500 text-violet-300'; 

                    return (
                        <button
                            key={option}
                            onClick={() => toggleOption(option, currentTab)}
                            className={`p-4 rounded-xl border transition-all text-left group relative ${isSelected ? `${highlightClass} shadow-md` : 'bg-gray-900 border-gray-800 hover:border-gray-600 hover:bg-gray-800'}`}
                        >
                            <span className="font-bold text-sm block mb-1">{option.split('(')[0]}</span>
                            {option.includes('(') && <span className="text-[10px] text-gray-500 block">{option.match(/\(([^)]+)\)/)?.[1]}</span>}
                            <div className="absolute top-4 right-4">
                                {isMulti ? (
                                    isSelected ? <CheckSquare className="w-5 h-5 fill-current opacity-80" /> : <Square className="w-5 h-5 text-gray-700 group-hover:text-gray-600" />
                                ) : (
                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-violet-400' : 'border-gray-600'}`}>
                                        {isSelected && <div className="w-2 h-2 rounded-full bg-violet-400" />}
                                    </div>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        );
    };

    const tabs: {id: Tab, icon: any}[] = [
        { id: 'World', icon: Globe },
        { id: 'Pose', icon: User },
        { id: 'Clothes', icon: Shirt },
        { id: 'Lighting', icon: Sun },
        { id: 'Species', icon: ScanFace },
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
        { id: 'Settings', icon: Settings },
    ];

    const totalSelected = (Object.values(selections) as Set<string>[]).reduce((acc, set) => acc + set.size, 0);
    const totalAutoFit = Object.values(autoFit).filter(Boolean).length;

    // Calculate Cartesian Product Size estimate
    const combinationsCount = (Object.values(selections) as Set<string>[]).reduce((acc, set) => {
        return acc * (set.size > 0 ? set.size : 1);
    }, 1);

    const jobCountDisplay = totalSelected > 0 ? combinationsCount : 0;

    const renderContent = () => {
        if (activeTab === 'Settings') {
            return (
                <div className="p-8 max-w-2xl mx-auto w-full">
                    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 space-y-6">
                        <div>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Output Configuration</h3>
                            <div className="flex flex-col gap-4">
                                <label className="flex items-center justify-between p-4 bg-gray-950 rounded-lg border border-gray-800 cursor-pointer group hover:border-gray-700 transition-colors">
                                    <div>
                                        <span className="text-sm font-bold text-gray-300 group-hover:text-white">Barefoot Mode</span>
                                        <p className="text-[10px] text-gray-600 mt-0.5">Force subject to be barefoot regardless of context</p>
                                    </div>
                                    <div className={`w-12 h-6 rounded-full p-1 transition-colors ${barefoot ? 'bg-violet-600' : 'bg-gray-700'}`}>
                                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${barefoot ? 'translate-x-6' : 'translate-x-0'}`} />
                                    </div>
                                    <input type="checkbox" checked={barefoot} onChange={(e) => setBarefoot(e.target.checked)} className="hidden" />
                                </label>
                                
                                <div>
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Aspect Ratio</span>
                                    <div className="grid grid-cols-3 gap-2">
                                        {["As-is", "1:1", "16:9", "4:3", "3:4", "9:16"].map(r => (
                                            <button
                                                key={r}
                                                onClick={() => setAspectRatio(r)}
                                                className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${aspectRatio === r ? 'bg-violet-600 border-violet-500 text-white' : 'bg-gray-950 border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200'}`}
                                            >
                                                {r}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        const currentTabKey = activeTab as keyof TraitSelections;
        const treeSource = getTreeSource(activeTab);
        const options = getOptions(treeSource);

        return (
            <div className="flex flex-1 overflow-hidden">
                <div className="w-1/3 border-r border-gray-800 bg-gray-900/50 flex flex-col min-w-[250px]">
                    {/* Multi-Select Toggle */}
                    <div className="px-4 py-2 border-b border-gray-800 flex items-center justify-between bg-gray-900/30">
                         <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Selection Mode</span>
                         <button 
                            onClick={() => setMultiSelectEnabled(prev => ({...prev, [currentTabKey]: !prev[currentTabKey]}))}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold transition-colors ${multiSelectEnabled[currentTabKey] ? 'bg-violet-900/30 text-violet-300 border border-violet-500/30' : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'}`}
                         >
                             {multiSelectEnabled[currentTabKey] ? <CheckSquare className="w-3 h-3" /> : <Radio className="w-3 h-3" />}
                             {multiSelectEnabled[currentTabKey] ? 'Multi' : 'Single'}
                         </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        {activeTab === 'World' && renderUploadedSection()}
                        {renderTree(treeSource)}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 bg-gray-950 pb-24 custom-scrollbar relative">
                    {autoFit[currentTabKey] ? (
                        <div className="flex flex-col items-center justify-center h-full text-emerald-600/30 select-none">
                            <Sparkles className="w-24 h-24 mb-4" />
                            <p className="text-sm font-bold uppercase tracking-widest text-emerald-500/80">Auto-Fit Enabled</p>
                            <p className="text-xs text-gray-500 mt-2 max-w-xs text-center">The AI will choose the best {activeTab} options based on the rest of the scene.</p>
                        </div>
                    ) : (
                        renderOptionsGrid(options, activeTab)
                    )}
                    
                    {/* Floating Selection Counter */}
                    {!autoFit[currentTabKey] && selections[currentTabKey].size > 0 && (
                        <div className="absolute bottom-6 right-6 bg-violet-600 text-white px-4 py-2 rounded-full text-xs font-bold shadow-xl animate-in fade-in slide-in-from-bottom-4 border border-violet-400/50 z-10">
                            {selections[currentTabKey].size} {activeTab} Selected
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm animate-in fade-in">
            <div className="bg-gray-950 rounded-xl shadow-2xl w-[95vw] h-[95vh] flex flex-col overflow-hidden relative border border-gray-800">
                
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold flex items-center gap-3 text-gray-100">
                            <Globe className="w-6 h-6 text-violet-500"/> Traits
                        </h2>
                        
                        <div className="h-6 w-px bg-gray-800 mx-2" />
                        
                        {/* Moved Buttons to Header */}
                        <div className="flex items-center gap-3">
                            {/* Auto-Fit Checkbox - Now in Header */}
                            {activeTab !== 'Settings' && (
                                <label className="flex items-center gap-2 cursor-pointer select-none group mr-4 border-r border-gray-700 pr-4">
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${autoFit[activeTab as keyof TraitSelections] ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-gray-800 border-gray-700 group-hover:border-emerald-500/50'}`}>
                                        {autoFit[activeTab as keyof TraitSelections] && <CheckSquare className="w-3 h-3" />}
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        checked={autoFit[activeTab as keyof TraitSelections]} 
                                        onChange={(e) => setAutoFit(prev => ({...prev, [activeTab as keyof TraitSelections]: e.target.checked}))} 
                                        className="hidden" 
                                    />
                                    <div className="flex items-center gap-1.5">
                                        <Sparkles className={`w-3 h-3 ${autoFit[activeTab as keyof TraitSelections] ? 'text-emerald-400' : 'text-gray-500'}`} />
                                        <span className={`text-xs font-bold ${autoFit[activeTab as keyof TraitSelections] ? 'text-emerald-400' : 'text-gray-400 group-hover:text-gray-300'}`}>Auto-Fit</span>
                                    </div>
                                </label>
                            )}

                            <button 
                                onClick={handleReset}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-400 hover:text-red-400 hover:bg-red-900/20 transition-colors border border-transparent hover:border-red-900/50"
                            >
                                <RotateCcw className="w-3 h-3" /> Reset
                            </button>
                            
                            {onEditPrompt && (
                                <button 
                                    onClick={handleEditPrompt}
                                    disabled={jobCountDisplay > 1}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 rounded-lg font-bold text-xs border border-gray-700 transition-all"
                                    title={jobCountDisplay > 1 ? "Cannot edit prompt for multiple combinations" : "Edit Prompt"}
                                >
                                    <MessageSquare className="w-3 h-3" /> Edit Prompt
                                </button>
                            )}
                            
                            <button 
                                onClick={handleConfirm}
                                className="flex items-center gap-2 px-4 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-bold text-xs shadow-lg transition-all"
                            >
                                <Sparkles className="w-3 h-3" /> Generate ({jobCountDisplay > 1 ? `${jobCountDisplay} Combinations` : `${totalSelected + totalAutoFit}`})
                            </button>
                        </div>
                    </div>

                    <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
                        <X className="w-6 h-6 text-gray-500"/>
                    </button>
                </div>

                {/* Scrollable Tabs */}
                <div className="flex items-center border-b border-gray-800 bg-gray-900/50 shrink-0">
                    <button onClick={() => scrollTabs('left')} className="p-3 hover:bg-gray-800 text-gray-500 hover:text-white transition-colors border-r border-gray-800 bg-gray-900 z-10">
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div ref={tabsRef} className="flex overflow-x-auto no-scrollbar scroll-smooth flex-1">
                        {tabs.map(tab => {
                            const isAuto = tab.id !== 'Settings' && autoFit[tab.id as keyof TraitSelections];
                            const count = tab.id !== 'Settings' ? (selections[tab.id as keyof TraitSelections]?.size || 0) : 0;
                            return (
                                <button 
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)} 
                                    className={`flex-none py-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors border-b-2 whitespace-nowrap ${activeTab === tab.id ? 'text-violet-400 border-violet-500 bg-gray-800/50' : 'text-gray-500 border-transparent hover:text-white hover:bg-gray-800'}`}
                                >
                                    <tab.icon className="w-3.5 h-3.5" /> 
                                    {tab.id}
                                    {isAuto && <Sparkles className="w-3 h-3 text-emerald-500 ml-1" />}
                                    {!isAuto && count > 0 && <span className="ml-1 text-[9px] bg-gray-700 px-1.5 rounded-full text-white">{count}</span>}
                                </button>
                            );
                        })}
                    </div>
                    <button onClick={() => scrollTabs('right')} className="p-3 hover:bg-gray-800 text-gray-500 hover:text-white transition-colors border-l border-gray-800 bg-gray-900 z-10">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                {/* Content - Removed bottom padding since footer is gone */}
                <div className="flex-1 overflow-hidden h-full flex flex-col relative">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};
