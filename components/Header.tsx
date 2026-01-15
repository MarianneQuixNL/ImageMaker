import React, { useState, useRef, useEffect } from 'react';
import { PanelLeft, Wand2, Check, ChevronRight, AlertTriangle, Key, Turtle, Zap } from 'lucide-react';
import { RichTooltip } from './RichTooltip';

export interface MenuItemDef { 
    label: string; 
    icon?: React.ElementType; 
    action?: () => void; 
    disabled?: boolean; 
    shortcut?: string; 
    divider?: boolean; 
    submenu?: MenuItemDef[]; 
    danger?: boolean; 
    checked?: boolean;
    // New fields for tooltip
    tooltipTitle?: string;
    tooltipDesc?: string;
}

interface MenuDropdownProps {
    items: MenuItemDef[];
    isOpen: boolean;
    onClose: () => void;
    parentRef: React.RefObject<HTMLElement>;
}

const MenuDropdown: React.FC<MenuDropdownProps> = ({ items, isOpen, onClose, parentRef }) => {
    const [activeSubmenu, setActiveSubmenu] = useState<number | null>(null);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => { 
            if (parentRef.current && !parentRef.current.contains(event.target as Node)) { 
                onClose(); 
            } 
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose, parentRef]);
    
    if (!isOpen) return null;
    
    return (
        <div className="absolute top-full left-0 mt-1 min-w-[240px] bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 py-1 animate-in fade-in zoom-in-95 duration-100">
            {items.map((item, idx) => {
                if (item.divider) return <div key={idx} className="h-px bg-gray-800 my-1 mx-2" />;
                
                const ButtonContent = (
                    <button 
                        onClick={() => { 
                            if (!item.submenu) { 
                                if (item.action && !item.disabled) { 
                                    item.action(); 
                                    onClose(); 
                                } 
                            } 
                        }} 
                        disabled={item.disabled} 
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors ${item.disabled ? 'opacity-40 cursor-not-allowed' : item.danger ? 'text-red-400 hover:bg-red-900/20' : 'text-gray-300 hover:bg-violet-900/30 hover:text-white'}`}
                    >
                        <div className="flex items-center gap-2">
                            {item.checked !== undefined && (
                                <div className="w-3.5 h-3.5 flex items-center justify-center">
                                    {item.checked && <Check className="w-3 h-3 text-violet-400" />}
                                </div>
                            )}
                            {item.icon && <item.icon className="w-3.5 h-3.5" />}
                            <span>{item.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {item.shortcut && <span className="text-[9px] text-gray-500 font-mono tracking-tighter">{item.shortcut}</span>}
                            {item.submenu && <ChevronRight className="w-3 h-3 text-gray-500" />}
                        </div>
                    </button>
                );

                return (
                    <div key={idx} className="relative group" onMouseEnter={() => item.submenu && setActiveSubmenu(idx)} onMouseLeave={() => setActiveSubmenu(null)}>
                        {item.tooltipDesc ? (
                            <RichTooltip 
                                title={item.tooltipTitle || item.label} 
                                content={item.tooltipDesc} 
                                placement="right"
                            >
                                {ButtonContent}
                            </RichTooltip>
                        ) : (
                            ButtonContent
                        )}
                        
                        {item.submenu && activeSubmenu === idx && (
                            <div className="absolute top-0 left-full ml-1">
                                <MenuDropdown items={item.submenu} isOpen={true} onClose={onClose} parentRef={{ current: null } as any} />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

const MenuBarItem: React.FC<{ item: MenuItemDef }> = ({ item }) => {
    const [isOpen, setIsOpen] = useState(false); 
    const ref = useRef<HTMLDivElement>(null);

    // Render simple button if no submenu
    if (!item.submenu || item.submenu.length === 0) {
        return (
            <button 
                onClick={item.action} 
                disabled={item.disabled}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${item.disabled ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'}`}
            >
                {item.label}
            </button>
        );
    }

    return (
        <div ref={ref} className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${isOpen ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'}`}>{item.label}</button>
            <MenuDropdown items={item.submenu} isOpen={isOpen} onClose={() => setIsOpen(false)} parentRef={ref} />
        </div>
    );
};

interface HeaderProps {
    isSidebarOpen: boolean;
    onToggleSidebar: () => void;
    menuStructure: MenuItemDef[];
    apiKeySet: boolean;
    onApiKeySelect: () => void;
    freeTierMode: boolean;
    onToggleFreeTierMode: () => void;
    isQueuePaused: boolean;
    onResumeQueue: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
    isSidebarOpen, 
    onToggleSidebar, 
    menuStructure, 
    apiKeySet, 
    onApiKeySelect, 
    freeTierMode,
    onToggleFreeTierMode,
    isQueuePaused, 
    onResumeQueue 
}) => {
    return (
        <header className="h-12 bg-gray-950 border-b border-gray-800 flex items-center justify-between px-4 select-none z-50">
            <div className="flex items-center gap-4">
                <button 
                    onClick={onToggleSidebar}
                    className={`p-1.5 rounded-lg transition-colors ${!isSidebarOpen ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-white hover:bg-gray-900'}`}
                    title={isSidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
                >
                    <PanelLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2 text-violet-500 font-black text-lg tracking-tight">
                    <Wand2 className="w-5 h-5" />
                    <span>Image Maker</span>
                </div>
                <div className="h-6 w-px bg-gray-800 mx-2" />
                <div className="flex items-center gap-1">
                    {menuStructure.map((menu, idx) => (
                        <MenuBarItem key={idx} item={menu} />
                    ))}
                </div>
            </div>
            <div className="flex items-center gap-3">
                {isQueuePaused && (
                    <div className="flex items-center gap-2 bg-red-900/20 px-3 py-1 rounded border border-red-900/50 animate-pulse">
                        <AlertTriangle className="w-3 h-3 text-red-500" />
                        <span className="text-xs font-bold text-red-400">Queue Paused (429)</span>
                        <button onClick={onResumeQueue} className="text-[10px] underline text-red-300 hover:text-white">Resume</button>
                    </div>
                )}
                <button 
                    onClick={onToggleFreeTierMode}
                    className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded border transition-colors ${freeTierMode ? 'bg-green-900/30 text-green-400 border-green-900/50 hover:bg-green-900/50' : 'bg-amber-900/30 text-amber-400 border-amber-900/50 hover:bg-amber-900/50'}`}
                    title={freeTierMode ? "Switch to Paid Mode (Higher Concurrency)" : "Switch to Free Tier Mode (Throttled)"}
                >
                    {freeTierMode ? <Turtle className="w-3 h-3"/> : <Zap className="w-3 h-3"/>}
                    {freeTierMode ? "Free Tier" : "Paid Tier"}
                </button>
                <button onClick={onApiKeySelect} className="text-[10px] font-mono text-gray-500 hover:text-gray-300 flex items-center gap-1">
                    <Key className="w-3 h-3" /> {apiKeySet ? "Switch Key" : "Set Key"}
                </button>
            </div>
        </header>
    );
};