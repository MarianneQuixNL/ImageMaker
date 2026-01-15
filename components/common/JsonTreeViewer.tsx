
import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Copy } from 'lucide-react';

interface JsonTreeViewerProps {
    data: any;
    label?: string;
    level?: number;
}

export const JsonTreeViewer: React.FC<JsonTreeViewerProps> = ({ data, label, level = 0 }) => {
    const [isExpanded, setIsExpanded] = useState(level < 2); // Default expand top 2 levels
    
    const isObject = data !== null && typeof data === 'object';
    const isArray = Array.isArray(data);
    const isEmpty = isObject && Object.keys(data).length === 0;

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    };

    if (!isObject) {
        return (
            <div className="flex gap-2 font-mono text-xs py-0.5 hover:bg-white/5 px-1 rounded">
                {label && <span className="text-violet-400 font-bold">{label}:</span>}
                <span className={typeof data === 'string' ? 'text-green-300' : typeof data === 'number' ? 'text-blue-300' : 'text-yellow-300'}>
                    {JSON.stringify(data)}
                </span>
            </div>
        );
    }

    return (
        <div className="font-mono text-xs">
            <div 
                className="flex items-center gap-1 cursor-pointer hover:bg-white/5 px-1 rounded py-0.5 group"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <span className="text-gray-500 w-4 h-4 flex items-center justify-center">
                    {!isEmpty && (isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />)}
                </span>
                
                {label && <span className="text-violet-400 font-bold">{label}: </span>}
                <span className="text-gray-400">
                    {isArray ? '[' : '{'} 
                    {!isExpanded && !isEmpty && <span className="text-gray-600 italic px-1">...</span>}
                    {isEmpty && (isArray ? ']' : '}')}
                </span>
                
                <button 
                    onClick={handleCopy} 
                    className="ml-auto opacity-0 group-hover:opacity-100 p-1 hover:text-white text-gray-500"
                    title="Copy JSON"
                >
                    <Copy className="w-3 h-3" />
                </button>
            </div>

            {isExpanded && !isEmpty && (
                <div className="pl-4 border-l border-gray-800 ml-2">
                    {Object.entries(data).map(([key, value]) => (
                        <JsonTreeViewer key={key} label={isArray ? undefined : key} data={value} level={level + 1} />
                    ))}
                    <div className="text-gray-400 pl-1">{isArray ? ']' : '}'}</div>
                </div>
            )}
            {!isExpanded && !isEmpty && <div className="inline-block text-gray-400">{isArray ? ']' : '}'}</div>}
        </div>
    );
};
