
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { X, Cpu, Save, Plus, Trash2, ArrowUp, ArrowDown, ArrowLeft, Shuffle, CheckSquare, Square, Folder, FolderOpen, Download, Upload, Settings, Edit3, Circle, Zap, Turtle, ToggleRight, ToggleLeft } from 'lucide-react';
import { jobService, generateUUID } from '../services/jobService';
import { Transformation } from '../types';
import { 
    SETTINGS_CATEGORIES, CLOTHING_BY_SETTING, CAMERA_POSITIONS, ASPECT_RATIOS, EXTRA_EFFECT_OPTIONS, 
    SPECIES_CATEGORIES, TIME_OPTIONS, GENDER_OPTIONS, HAIR_STYLES_NESTED, HAIR_COLORS_NESTED, SKIN_COLORS, EYE_COLORS_NESTED,
    RESTRAINT_OPTIONS, 
    TRANSPARENCY_OPTIONS, STYLE_OPTIONS, WEATHER_OPTIONS, MOOD_OPTIONS,
    BODY_PART_OPTIONS, BARE_COVERAGE_OPTIONS,
    ANIMALS_CATEGORIES, OBJECTS_CATEGORIES
} from '../constants/transformationOptions';

const OUTPUT_STYLE_OPTIONS = ["Same as from", ...STYLE_OPTIONS];

const buildConfigTree = () => ({
    "Theme & Setting": {
        "Types": {
             "From": STYLE_OPTIONS,
             "To": OUTPUT_STYLE_OPTIONS
        },
        "Setting": SETTINGS_CATEGORIES,
        "Time of Day": TIME_OPTIONS,
        "Weather": WEATHER_OPTIONS,
        "Mood": MOOD_OPTIONS
    },
    "Subject: Physical": {
        "Species": SPECIES_CATEGORIES,
        "Gender": GENDER_OPTIONS,
        "Hair Style": HAIR_STYLES_NESTED,
        "Hair Color": HAIR_COLORS_NESTED,
        "Skin Color": SKIN_COLORS,
        "Eye Color": EYE_COLORS_NESTED
    },
    "Subject: Animals": ANIMALS_CATEGORIES,
    "Subject: Objects": OBJECTS_CATEGORIES,
    "Subject: Body Parts": BODY_PART_OPTIONS,
    "Subject: Clothing": {
        "Style": CLOTHING_BY_SETTING,
        "Bare": BARE_COVERAGE_OPTIONS,
        "Transparency": TRANSPARENCY_OPTIONS
    },
    "Camera & Framing": {
        "Camera Angle": CAMERA_POSITIONS,
        "Aspect Ratio": ASPECT_RATIOS
    },
    "Effects & Extras": {
        "Visual Effects": EXTRA_EFFECT_OPTIONS,
        "Restraints/Props": RESTRAINT_OPTIONS
    }
});

interface OptionCardProps {
    label: string;
    selected: boolean;
    onClick: () => void;
    isRandom?: boolean;
}

const OptionCard: React.FC<OptionCardProps> = ({ label, selected, onClick, isRandom }) => (
    <div 
        onClick={onClick}
        className={`
            cursor-pointer p-3 rounded-lg border-2 transition-all shadow-sm flex items-center justify-between group h-full
            ${selected 
                ? (isRandom ? 'border-blue-500 bg-blue-900/30' : 'border-violet-500 bg-violet-900/30') 
                : 'border-gray-700 hover:border-violet-500/50 hover:bg-gray-800 bg-gray-900'}
        `}
    >
        <span className={`text-sm font-bold ${selected ? (isRandom ? 'text-blue-300' : 'text-violet-300') : 'text-gray-400 group-hover:text-gray-200'}`}>{label}</span>
        {selected ? (
            <CheckSquare className={`w-5 h-5 ${isRandom ? 'text-blue-400' : 'text-violet-400'}`} />
        ) : (
            <Square className="w-5 h-5 text-gray-600 group-hover:text-gray-500" />
        )}
    </div>
);

const INITIAL_TRANSFORMATION: Transformation = {
    id: '', name: 'New Transformation', enabled: true, applyToStyle: ['Line Art'], outputStyle: ['Photo'],
    parts: { head: {}, torso: {}, left_arm: {}, right_arm: {}, left_leg: {}, right_leg: {}, feet: {}, full_body: {} },
    fullBody: { clothingItems: [], clothingStyle: '' }, background: { mode: 'keep', prompt: '' }, extraEffects: [], restraints: [],
    setting: '', cameraPosition: '', weather: '', mood: '', species: '', gender: '', hairStyle: '', hairColor: '',
    skinColor: '', eyeColor: '', timeOfDay: '', aspectRatio: '', quality: 'Standard', transparency: '',
    isRandom: true 
};

interface ConfigurationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type SystemTab = 'global';

export const ConfigurationModal: React.FC<ConfigurationModalProps> = ({ isOpen, onClose }) => {
  const [transformations, setTransformations] = useState<Transformation[]>([]);
  const [concurrency, setConcurrency] = useState(5);
  const [freeTierMode, setFreeTierMode] = useState(false);
  const [aiSettings, setAiSettings] = useState({
      analysisModel: 'gemini-3-flash-preview',
      generationModel: 'gemini-2.5-flash-image',
      transformationModel: 'gemini-2.5-flash-image'
    });
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeSystemTab, setActiveSystemTab] = useState<SystemTab | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [selectedPath, setSelectedPath] = useState<string[]>([]);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFilename, setExportFilename] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const exportInputRef = useRef<HTMLInputElement>(null);
  
  const editingTrans = useMemo(() => transformations.find(t => t.id === editingId), [transformations, editingId]);
  const CONFIG_TREE = useMemo(() => buildConfigTree(), []);

  useEffect(() => { 
      if (isOpen) {
          const snap = jobService.getSnapshot();
          setTransformations(snap.transformations);
          setConcurrency(jobService.concurrencyLimit);
          setFreeTierMode(snap.freeTierMode);
          if (snap.aiSettings) setAiSettings(snap.aiSettings);
      }
  }, [isOpen]);

  useEffect(() => {
      if (showExportDialog && exportInputRef.current) {
          exportInputRef.current.select();
      }
  }, [showExportDialog]);

  const isOptionSelected = (path: string[], option: string): boolean => {
      if (!editingTrans) return false;
      const [group, sub, ...rest] = path;
      if (sub === "Setting") return editingTrans.setting === option;
      if (sub === "Types") {
          if (rest[0] === "From") return editingTrans.applyToStyle.includes(option);
          if (rest[0] === "To") return editingTrans.outputStyle.includes(option);
      }
      if (sub === "Species") return editingTrans.species === option;
      if (sub === "Animals") return editingTrans.animal === option;
      if (sub === "Objects") return editingTrans.objectItem === option;
      if (sub === "Gender") return editingTrans.gender === option;
      if (sub === "Hair Style") return editingTrans.hairStyle === option;
      if (sub === "Hair Color") return editingTrans.hairColor === option;
      if (sub === "Skin Color") return editingTrans.skinColor === option;
      if (sub === "Eye Color") return editingTrans.eyeColor === option;
      if (sub === "Camera Angle") return editingTrans.cameraPosition === option;
      if (sub === "Aspect Ratio") return editingTrans.aspectRatio === option;
      if (sub === "Time of Day") return editingTrans.timeOfDay === option;
      if (sub === "Weather") return editingTrans.weather === option;
      if (sub === "Mood") return editingTrans.mood === option;
      if (sub === "Transparency") return editingTrans.transparency === option;
      if (sub === "Visual Effects") return editingTrans.extraEffects?.includes(option) || false;
      if (sub === "Restraints/Props") return editingTrans.restraints?.includes(option) || false;
      if (group === "Subject: Body Parts") {
          const partKey = sub.toLowerCase().replace(' ', '_') as any;
          return editingTrans.parts[partKey]?.option === option;
      }
      if (sub === "Style") return editingTrans.fullBody.clothingStyle === option;
      if (sub === "Bare") {
          if (editingTrans.fullBody.clothingStyle === "Bare") {
              return editingTrans.fullBody.clothingItems.includes(option);
          }
          return false;
      }
      return false;
  };

  useEffect(() => {
      if (!editingTrans) return;
      const newExpanded: Record<string, boolean> = {};
      const traverse = (nodes: any, currentPath: string[]): boolean => {
          if (Array.isArray(nodes)) return nodes.some(opt => isOptionSelected(currentPath, opt));
          let branchHasSelection = false;
          Object.entries(nodes).forEach(([key, value]) => {
              const childSelected = traverse(value, [...currentPath, key]);
              if (childSelected) branchHasSelection = true;
          });
          if (branchHasSelection) newExpanded[currentPath.join('::')] = true;
          return branchHasSelection;
      };
      traverse(CONFIG_TREE, []);
      setExpandedNodes(prev => ({ ...prev, ...newExpanded }));
  }, [editingTrans]);

  const handleOptionToggle = (path: string[], option: string) => {
      if (!editingTrans) return;
      let updates: Partial<Transformation> = {};
      const [group, sub, ...rest] = path;
      const mapField = (field: keyof Transformation, val: string) => (editingTrans[field] === val ? '' : val);

      if (sub === "Setting") updates = { setting: mapField('setting', option) };
      else if (sub === "Types") {
          if (rest[0] === "From") {
              const current = editingTrans.applyToStyle || [];
              updates = { applyToStyle: current.includes(option) ? current.filter(x => x !== option) : [...current, option] };
          }
          if (rest[0] === "To") {
              const current = editingTrans.outputStyle || [];
              updates = { outputStyle: current.includes(option) ? current.filter(x => x !== option) : [...current, option] };
              if (option === "Laser engraving" && !current.includes(option)) updates.aspectRatio = "1:1 (Square)";
          }
      }
      else if (sub === "Species") updates = { species: mapField('species', option) };
      else if (sub === "Animals") updates = { animal: mapField('animal', option) };
      else if (sub === "Objects") updates = { objectItem: mapField('objectItem', option) };
      else if (sub === "Gender") updates = { gender: mapField('gender', option) };
      else if (sub === "Hair Style") updates = { hairStyle: mapField('hairStyle', option) };
      else if (sub === "Hair Color") updates = { hairColor: mapField('hairColor', option) };
      else if (sub === "Skin Color") updates = { skinColor: mapField('skinColor', option) };
      else if (sub === "Eye Color") updates = { eyeColor: mapField('eyeColor', option) };
      else if (sub === "Camera Angle") updates = { cameraPosition: mapField('cameraPosition', option) };
      else if (sub === "Aspect Ratio") updates = { aspectRatio: mapField('aspectRatio', option) };
      else if (sub === "Time of Day") updates = { timeOfDay: mapField('timeOfDay', option) };
      else if (sub === "Weather") updates = { weather: mapField('weather', option) };
      else if (sub === "Mood") updates = { mood: mapField('mood', option) };
      else if (sub === "Transparency") updates = { transparency: mapField('transparency', option) };
      else if (sub === "Visual Effects") {
          const current = editingTrans.extraEffects || [];
          updates = { extraEffects: current.includes(option) ? current.filter(x => x !== option) : [...current, option] };
      }
      else if (sub === "Restraints/Props") {
          const current = editingTrans.restraints || [];
          updates = { restraints: current.includes(option) ? current.filter(x => x !== option) : [...current, option] };
      }
      else if (group === "Subject: Body Parts") {
          const partKey = sub.toLowerCase().replace(' ', '_') as any;
          const currentPart = editingTrans.parts[partKey] || {};
          updates = { parts: { ...editingTrans.parts, [partKey]: { ...currentPart, option: (currentPart.option === option ? '' : option) } } };
      }
      else if (sub === "Style") {
           updates = { fullBody: { ...editingTrans.fullBody, clothingStyle: editingTrans.fullBody.clothingStyle === option ? '' : option } };
      }
      else if (sub === "Bare") {
          const isBare = editingTrans.fullBody.clothingStyle === "Bare";
          const current = isBare ? (editingTrans.fullBody.clothingItems || []) : [];
          const newItems = current.includes(option) ? current.filter(x => x !== option) : [...current, option];
          updates = { fullBody: { clothingStyle: "Bare", clothingItems: newItems } };
      }
      setTransformations(prev => prev.map(t => t.id === editingId ? { ...t, ...updates } : t));
  };

  const handleSave = () => {
      jobService.updateConfiguration({
          transformations,
          concurrencyLimit: concurrency,
          freeTierMode: freeTierMode,
          aiSettings
      });
      onClose();
  };

  const handleOpenExportDialog = () => {
      const date = new Date().toISOString().split('T')[0];
      setExportFilename(`imagemaker_config_${date}`);
      setShowExportDialog(true);
  };

  const handleConfirmExport = () => {
      try {
          let filename = exportFilename.trim();
          if (!filename) filename = `config_backup_${Date.now()}`;
          if (!filename.toLowerCase().endsWith('.mqc')) filename += '.mqc';
          const exportData = {
              version: "1.1",
              exportedAt: new Date().toISOString(),
              concurrencyLimit: concurrency,
              freeTierMode: freeTierMode,
              aiSettings,
              transformations
          };
          const jsonStr = JSON.stringify(exportData, null, 2);
          const blob = new Blob([jsonStr], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          setShowExportDialog(false);
      } catch (e) {
          alert("Failed to export configuration: " + (e instanceof Error ? e.message : String(e)));
      }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
          try {
              const content = evt.target?.result as string;
              const json = JSON.parse(content);
              jobService.importConfig(json, file.name);
              const snap = jobService.getSnapshot();
              setTransformations(snap.transformations);
              setConcurrency(jobService.concurrencyLimit);
              setFreeTierMode(snap.freeTierMode);
              if (snap.aiSettings) setAiSettings(snap.aiSettings);
              alert("Configuration loaded successfully. Review settings and click 'Save Changes' to apply.");
          } catch(e) { 
              alert("Invalid configuration file format."); 
          } finally {
              if (fileInputRef.current) fileInputRef.current.value = '';
          }
      };
      reader.readAsText(file);
  };

  const handleMoveTransformation = (id: string, direction: 'up' | 'down') => {
      const index = transformations.findIndex(t => t.id === id);
      if (index === -1) return;
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= transformations.length) return;
      const newTrans = [...transformations];
      [newTrans[index], newTrans[newIndex]] = [newTrans[newIndex], newTrans[index]];
      setTransformations(newTrans);
  };

  const hasBranchSelection = (obj: any, path: string[]): boolean => {
      if (Array.isArray(obj)) return obj.some(opt => isOptionSelected(path, opt));
      return Object.entries(obj).some(([key, val]) => hasBranchSelection(val, [...path, key]));
  };

  const renderTree = (nodes: any, path: string[] = []) => {
      const isLeaf = Array.isArray(nodes);
      if (isLeaf) return null;
      return (
          <div className="pl-4 border-l border-gray-700 ml-2">
              {Object.entries(nodes).map(([key, value]) => {
                  const currentPath = [...path, key];
                  const currentPathKey = currentPath.join('::');
                  const isNodeLeaf = Array.isArray(value);
                  const hasSelection = hasBranchSelection(value, currentPath);
                  const isSelectedPath = selectedPath.join('::') === currentPathKey;
                  return (
                      <div key={key}>
                          <div 
                              className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-sm mb-1 transition-colors ${isSelectedPath ? 'bg-violet-900/40 text-violet-300 font-bold' : 'hover:bg-gray-800 text-gray-300'}`}
                              onClick={() => {
                                  if (isNodeLeaf) setSelectedPath(currentPath);
                                  else setExpandedNodes(prev => ({ ...prev, [currentPathKey]: !prev[currentPathKey] }));
                              }}
                          >
                              {!isNodeLeaf && (expandedNodes[currentPathKey] ? <FolderOpen className="w-4 h-4 text-violet-500" /> : <Folder className="w-4 h-4 text-gray-500" />)}
                              {hasSelection && <Circle className="w-2 h-2 fill-green-500 text-green-500" />}
                              {!hasSelection && editingTrans?.isRandom && <Square className="w-2 h-2 fill-blue-400 text-blue-400" />}
                              <span>{key}</span>
                          </div>
                          {!isNodeLeaf && expandedNodes[currentPathKey] && renderTree(value, currentPath)}
                      </div>
                  );
              })}
          </div>
      );
  };

  const renderOptions = () => {
      if (!selectedPath.length) return <div className="text-gray-500 text-center mt-20">Select a category</div>;
      let options: any = CONFIG_TREE;
      for (const p of selectedPath) options = options[p];
      const renderRandom = () => (
           <OptionCard 
              key="Random" 
              label="Random" 
              selected={isOptionSelected(selectedPath, "Random")} 
              onClick={() => handleOptionToggle(selectedPath, "Random")}
              isRandom 
           />
      );
      if (!Array.isArray(options)) return null;
      return (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {renderRandom()}
              {options.map((opt: string) => (
                  <OptionCard key={opt} label={opt} selected={isOptionSelected(selectedPath, opt)} onClick={() => handleOptionToggle(selectedPath, opt)} />
              ))}
          </div>
      );
  };

  const renderGlobalSettings = () => (
      <div className="p-8">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-200 border-b border-gray-800 pb-3"><Settings className="w-6 h-6 text-gray-500" /> Global Settings</h2>
          
          <div className="space-y-6">
            <div className="p-5 bg-gray-900 rounded-xl border border-gray-800 shadow-inner">
                <h3 className="text-sm font-bold text-gray-200 mb-4 flex items-center gap-2 uppercase tracking-widest"><Cpu className="w-4 h-4 text-violet-500" /> AI Engine Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 mb-1">Analysis & Vision (Cloud Vision)</label>
                        <select 
                            value={aiSettings.analysisModel} 
                            onChange={(e) => setAiSettings({...aiSettings, analysisModel: e.target.value})}
                            className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
                        >
                            <option value="gemini-3-flash-preview">Gemini 3 Flash (Recommended)</option>
                            <option value="gemini-3-pro-preview">Gemini 3 Pro (High Quality)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 mb-1">Editing & Transformation</label>
                        <select 
                            value={aiSettings.transformationModel} 
                            onChange={(e) => setAiSettings({...aiSettings, transformationModel: e.target.value})}
                            className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
                        >
                            <option value="gemini-2.5-flash-image">Gemini 2.5 Flash Image</option>
                            <option value="gemini-3-pro-image-preview">Gemini 3 Pro Image (Slower)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 mb-1">Generation</label>
                        <select 
                            value={aiSettings.generationModel} 
                            onChange={(e) => setAiSettings({...aiSettings, generationModel: e.target.value})}
                            className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
                        >
                            <option value="gemini-2.5-flash-image">Gemini 2.5 Flash Image</option>
                            <option value="imagen-4.0-generate-001">Imagen 4</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="p-5 bg-gray-900 rounded-xl border border-gray-800 shadow-inner">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-sm font-bold text-gray-200 flex items-center gap-2 uppercase tracking-widest">
                            {freeTierMode ? <Turtle className="w-4 h-4 text-green-500" /> : <Zap className="w-4 h-4 text-amber-500" />}
                            Queue Mode: {freeTierMode ? "Free Tier Optimization" : "Standard (Paid)"}
                        </h3>
                        <p className="text-xs text-gray-400 mt-2 max-w-lg leading-relaxed">
                            {freeTierMode 
                                ? "Optimized for the free tier. Enforces strictly serialized execution and introduces mandatory delays between tasks to prevent 429 quota exhaustion." 
                                : "Standard performance. Uses maximum configured concurrency. Recommended only for paid billing tiers."}
                        </p>
                    </div>
                    <button 
                        onClick={() => setFreeTierMode(!freeTierMode)}
                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-gray-950 ${freeTierMode ? 'bg-green-600' : 'bg-gray-700'}`}
                    >
                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform ${freeTierMode ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
                <div className={`transition-all duration-300 ${freeTierMode ? 'opacity-30 grayscale pointer-events-none' : 'opacity-100'}`}>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Maximum Concurrent Job Execution</label>
                    <input 
                        type="number" 
                        min="1" 
                        max="10" 
                        value={concurrency} 
                        onChange={(e) => setConcurrency(parseInt(e.target.value))}
                        className="w-full max-w-[120px] bg-gray-950 border border-gray-700 rounded-lg px-4 py-2 text-white font-mono"
                    />
                </div>
            </div>
          </div>
      </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-gray-950 rounded-xl shadow-2xl w-[95vw] h-[95vh] overflow-hidden m-4 flex flex-col relative border border-gray-800">
        <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-950 flex-none gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
             <div className="flex items-center gap-2 text-xl font-bold text-gray-100 whitespace-nowrap">
                 <Cpu className="w-6 h-6 text-violet-500" /> Configuration
             </div>
             {editingTrans && !activeSystemTab && (
                 <div className="flex items-center gap-2 flex-1 min-w-0 ml-4 animate-in fade-in slide-in-from-left-2">
                     <div className="h-6 w-px bg-gray-800 mx-2" />
                     <button onClick={() => setEditingId(null)} className="flex items-center gap-1 text-sm text-gray-400 hover:text-violet-400 bg-gray-900 border border-gray-700 px-3 py-1.5 rounded-lg transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to list
                     </button>
                     <input type="text" value={editingTrans.name} onChange={(e) => setTransformations(prev => prev.map(t => t.id === editingId ? { ...t, name: e.target.value } : t))} className="flex-1 min-w-0 font-bold text-lg bg-transparent border-b border-gray-700 focus:border-violet-500 outline-none px-2 py-1 ml-2 text-white" />
                 </div>
             )}
             {activeSystemTab && (
                 <div className="flex items-center gap-2 ml-4 animate-in fade-in">
                     <div className="h-6 w-px bg-gray-800 mx-2" />
                     <button onClick={() => setActiveSystemTab(null)} className="flex items-center gap-1 text-sm text-gray-400 hover:text-violet-400 bg-gray-900 border border-gray-700 px-3 py-1.5 rounded-lg transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to transformations
                     </button>
                 </div>
             )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full"><X className="w-6 h-6 text-gray-500" /></button>
        </div>
        <div className="flex flex-1 overflow-hidden">
            <div className="w-72 bg-gray-900 border-r border-gray-800 flex flex-col">
                <div className="p-3 border-b border-gray-800 bg-gray-900 grid grid-cols-2 gap-2">
                    <button onClick={handleSave} className="col-span-2 flex items-center justify-center gap-2 px-3 py-2 bg-violet-600 text-white rounded hover:bg-violet-700 font-bold text-sm shadow-lg shadow-violet-900/20"><Save className="w-4 h-4" /> Save Changes</button>
                    <button onClick={handleOpenExportDialog} className="flex items-center justify-center gap-2 px-2 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded hover:bg-gray-700 text-xs"><Download className="w-3 h-3" /> Export</button>
                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-2 px-2 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded hover:bg-gray-700 text-xs"><Upload className="w-3 h-3" /> Load</button>
                    <input type="file" ref={fileInputRef} className="hidden" accept=".mqc" onChange={handleImport} />
                </div>
                {!editingTrans && !activeSystemTab ? (
                    <div className="flex-1 overflow-y-auto p-3 space-y-4">
                        <div className="space-y-1">
                            <h3 className="font-bold text-[10px] text-gray-500 uppercase tracking-widest mb-2 px-1">Settings</h3>
                            <button onClick={() => setActiveSystemTab('global')} className="w-full flex items-center gap-2 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-750 transition-all text-xs font-bold text-gray-300"><Settings className="w-4 h-4 text-violet-400" /> Global Settings</button>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-2 px-1">
                                <h3 className="font-bold text-[10px] text-gray-500 uppercase tracking-widest">Transformations</h3>
                                <button onClick={() => {
                                    const newId = generateUUID();
                                    const newT = { ...INITIAL_TRANSFORMATION, id: newId };
                                    setTransformations([...transformations, newT]);
                                    setEditingId(newId);
                                }} className="p-1 bg-violet-900/30 text-violet-400 rounded hover:bg-violet-900/50"><Plus className="w-4 h-4" /></button>
                            </div>
                            <ul className="space-y-2">
                                {transformations.map((t, idx) => (
                                    <li key={t.id} onClick={() => setEditingId(t.id)} className="cursor-pointer bg-gray-800 p-3 rounded border border-gray-700 hover:border-violet-500/50 flex flex-col group transition-all text-gray-200">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-medium text-sm truncate pr-2">{t.name}</span>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={(e) => { e.stopPropagation(); setTransformations(prev => prev.map(x => x.id === t.id ? { ...x, enabled: !x.enabled } : x)); }} className="p-1">{t.enabled ? <ToggleRight className="w-4 h-4 text-green-500" /> : <ToggleLeft className="w-4 h-4 text-gray-500" />}</button>
                                                <button onClick={(e) => { e.stopPropagation(); setTransformations(prev => prev.filter(x => x.id !== t.id)); }} className="text-gray-500 hover:text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={(e) => { e.stopPropagation(); handleMoveTransformation(t.id, 'up'); }} disabled={idx === 0} className="p-1 hover:bg-gray-700 rounded disabled:opacity-20"><ArrowUp className="w-3 h-3 text-gray-400" /></button>
                                            <button onClick={(e) => { e.stopPropagation(); handleMoveTransformation(t.id, 'down'); }} disabled={idx === transformations.length - 1} className="p-1 hover:bg-gray-700 rounded disabled:opacity-20"><ArrowDown className="w-3 h-3 text-gray-400" /></button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ) : activeSystemTab ? (
                    <div className="flex-1 p-4" />
                ) : (
                    <div className="flex-1 overflow-y-auto p-2">
                       <div className="space-y-1 text-sm overflow-x-hidden pt-2">{renderTree(CONFIG_TREE)}</div>
                    </div>
                )}
            </div>
            <div className="flex-1 bg-gray-950 overflow-y-auto">
                {activeSystemTab === 'global' ? renderGlobalSettings() : (
                    editingTrans && selectedPath.length > 0 ? (
                        <div className="p-8 animate-in fade-in slide-in-from-right-4 duration-200">
                            <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
                                <h3 className="text-xl font-bold text-gray-200">{selectedPath.join(' / ')}</h3>
                                <button onClick={() => setTransformations(prev => prev.map(t => t.id === editingId ? { ...t, isRandom: !t.isRandom } : t))} className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-bold border transition-colors ${editingTrans.isRandom ? 'bg-blue-900/30 text-blue-300 border-blue-500/50' : 'bg-gray-900 text-gray-400 border-gray-700'}`}><Shuffle className="w-4 h-4" /> Random Fallback</button>
                            </div>
                            {renderOptions()}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-600 p-8">
                            {editingTrans ? <><Settings className="w-16 h-16 mb-4 opacity-10" /><p>Select a category from the sidebar to edit options.</p></> : <><Edit3 className="w-16 h-16 mb-4 opacity-10" /><p>Select a transformation to edit or view System Settings.</p></>}
                        </div>
                    )
                )}
            </div>
        </div>

        {/* Custom Export Dialog */}
        {showExportDialog && (
            <div className="absolute inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center animate-in fade-in">
                <div className="bg-gray-900 rounded-lg shadow-2xl p-6 w-96 max-w-full m-4 border border-gray-800">
                    <h3 className="text-lg font-bold text-gray-100 mb-4 flex items-center gap-2">
                        <Download className="w-5 h-5 text-violet-500" /> Export Configuration
                    </h3>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-400 mb-1">Filename</label>
                        <div className="flex items-center">
                            <input 
                                ref={exportInputRef}
                                type="text" 
                                value={exportFilename}
                                onChange={(e) => setExportFilename(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleConfirmExport()}
                                className="flex-1 bg-gray-950 border border-gray-700 rounded-l-md px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none text-white placeholder-gray-600"
                                placeholder="config_name"
                            />
                            <span className="bg-gray-800 border border-l-0 border-gray-700 rounded-r-md px-3 py-2 text-gray-400 text-sm font-mono">.mqc</span>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button 
                            onClick={() => setShowExportDialog(false)} 
                            className="px-4 py-2 text-gray-400 hover:bg-gray-800 rounded-md font-medium text-sm transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleConfirmExport} 
                            className="px-4 py-2 bg-violet-600 text-white rounded-md font-bold text-sm hover:bg-violet-700 shadow-md transition-colors"
                        >
                            Export
                        </button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
