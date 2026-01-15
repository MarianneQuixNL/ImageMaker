
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X, Cloud, Folder, ChevronRight, ChevronDown, CheckCircle2, Loader2, Image as ImageIcon, ChevronLeft, Download, RefreshCw, FolderOpen, ChevronsLeft, ChevronsRight, List } from 'lucide-react';
import * as imageMarkerService from '../services/imageMarkerService';
import { jobService } from '../services/jobService';

interface ImageMarkerModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface AsyncThumbnailProps {
    fullPath: string;
    fileName: string;
    isSelected: boolean;
    onToggle: () => void;
}

// Helper component to load individual blobs
const AsyncThumbnail: React.FC<AsyncThumbnailProps> = ({ 
    fullPath, 
    fileName, 
    isSelected, 
    onToggle 
}) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        const fetchImage = async () => {
            setLoading(true);
            const blob = await imageMarkerService.downloadImageBlob(fullPath);
            if (active && blob) {
                const url = URL.createObjectURL(blob);
                setImageUrl(url);
            }
            if (active) setLoading(false);
        };
        fetchImage();
        return () => { 
            active = false;
            if (imageUrl) URL.revokeObjectURL(imageUrl); 
        };
    }, [fullPath]);

    return (
        <div 
            onClick={onToggle}
            className={`
                relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer group transition-all
                ${isSelected ? 'border-violet-500 ring-2 ring-violet-500/50' : 'border-gray-800 hover:border-gray-600'}
                ${loading ? 'bg-gray-900 animate-pulse' : 'bg-black'}
            `}
        >
            {imageUrl ? (
                <img src={imageUrl} alt={fileName} className="w-full h-full object-contain p-1 transition-transform group-hover:scale-105" />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-700">
                    <ImageIcon className="w-8 h-8 opacity-20" />
                </div>
            )}
            
            <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                <div className={`p-2 rounded-full ${isSelected ? 'bg-violet-600 text-white' : 'bg-gray-800/80 text-gray-400'}`}>
                    <CheckCircle2 className="w-6 h-6" />
                </div>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1">
                <p className="text-[10px] text-gray-300 truncate text-center font-mono">{fileName}</p>
            </div>
        </div>
    );
};

interface FolderNode {
    name: string;
    fullPath: string;
    children: FolderNode[];
}

// Convert flat list of paths to nested tree structure
const buildTree = (paths: string[]): FolderNode[] => {
    const root: FolderNode = { name: 'ROOT', fullPath: '', children: [] };
    const sortedPaths = [...paths].sort();

    for (const path of sortedPaths) {
        const normalizedPath = path.replace(/\\/g, '/');
        const parts = normalizedPath.split('/').filter(p => p);
        
        let currentLevel = root.children;
        let currentPath = '';
        
        for (const part of parts) {
            currentPath = currentPath ? `${currentPath}/${part}` : part;
            let existingNode = currentLevel.find(n => n.name === part);
            
            if (!existingNode) {
                existingNode = {
                    name: part,
                    fullPath: currentPath,
                    children: []
                };
                currentLevel.push(existingNode);
            }
            
            currentLevel = existingNode.children;
        }
    }
    return root.children;
};

let lastSelectedFolderGlobal: string | null = null;

export const ImageMarkerModal: React.FC<ImageMarkerModalProps> = ({ isOpen, onClose }) => {
    const [folders, setFolders] = useState<string[]>([]);
    const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
    const [images, setImages] = useState<string[]>([]);
    const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(12);
    const [pageInput, setPageInput] = useState("1");
    const [loadingFolders, setLoadingFolders] = useState(false);
    const [loadingImages, setLoadingImages] = useState(false);
    const [importing, setImporting] = useState(false);
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
    
    useEffect(() => {
        if (isOpen) {
            if (folders.length === 0) {
                loadFolders();
            }
            setImages([]);
            setSelectedPaths(new Set());
            
            if (lastSelectedFolderGlobal) {
                setSelectedFolder(lastSelectedFolderGlobal);
                const parts = lastSelectedFolderGlobal.split('/');
                const partsToExpand = new Set<string>();
                let accumulator = '';
                for (let i = 0; i < parts.length - 1; i++) {
                    accumulator = accumulator ? `${accumulator}/${parts[i]}` : parts[i];
                    partsToExpand.add(accumulator);
                }
                setExpandedFolders(prev => {
                    const next = new Set(prev);
                    partsToExpand.forEach(p => next.add(p));
                    return next;
                });
            }
        }
    }, [isOpen]);

    useEffect(() => {
        if (selectedFolder) {
            lastSelectedFolderGlobal = selectedFolder;
            loadImages(selectedFolder);
        } else {
            setImages([]);
        }
    }, [selectedFolder]);

    useEffect(() => {
        if (!selectedFolder || images.length === 0 || pageSize === Infinity) return;
        
        const totalPages = Math.ceil(images.length / pageSize);
        if (page >= totalPages) return;

        const nextStartIndex = page * pageSize;
        const nextEndIndex = nextStartIndex + pageSize;
        const nextImages = images.slice(nextStartIndex, nextEndIndex);

        nextImages.forEach(path => {
            imageMarkerService.downloadImageBlob(path);
        });
    }, [page, selectedFolder, images, pageSize]);

    useEffect(() => {
        setPageInput(page.toString());
    }, [page]);

    const loadFolders = async () => {
        setLoadingFolders(true);
        const data = await imageMarkerService.getImageFolders();
        setFolders(data);
        setLoadingFolders(false);
    };

    const loadImages = async (path: string) => {
        setLoadingImages(true);
        setPage(1);
        const data = await imageMarkerService.getImagesInFolder(path);
        setImages(data);
        setLoadingImages(false);
    };

    const toggleFolderExpand = (path: string) => {
        setExpandedFolders(prev => {
            const next = new Set(prev);
            if (next.has(path)) next.delete(path);
            else next.add(path);
            return next;
        });
    };

    const toggleSelection = (fullPath: string) => {
        const next = new Set(selectedPaths);
        if (next.has(fullPath)) next.delete(fullPath);
        else next.add(fullPath);
        setSelectedPaths(next);
    };

    const handleImport = async () => {
        setImporting(true);
        const paths = Array.from(selectedPaths) as string[];
        let successCount = 0;

        for (const path of paths) {
            const blob = await imageMarkerService.downloadImageBlob(path);
            if (blob) {
                const filename = (path as string).split('/').pop() || "imported_image";
                // Pass Cloud Path as Origin
                jobService.addHistoryItemFromBlob(blob, filename, `Cloud Import: ${path}`, 'uploaded');
                successCount++;
            }
        }

        setImporting(false);
        onClose();
        if (successCount > 0) setSelectedPaths(new Set());
    };

    const handlePageInputSubmit = () => {
        const totalPages = Math.ceil(images.length / pageSize);
        const newPage = parseInt(pageInput);
        if (!isNaN(newPage) && newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        } else {
            setPageInput(page.toString());
        }
    };

    const treeData = useMemo(() => buildTree(folders), [folders]);

    const visibleNodes = useMemo(() => {
        const nodes: { node: FolderNode, depth: number }[] = [];
        const traverse = (list: FolderNode[], depth: number) => {
            for (const item of list) {
                nodes.push({ node: item, depth });
                if (expandedFolders.has(item.fullPath)) {
                    traverse(item.children, depth + 1);
                }
            }
        };
        traverse(treeData, 0);
        return nodes;
    }, [treeData, expandedFolders]);

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                const currentIndex = visibleNodes.findIndex(n => n.node.fullPath === selectedFolder);
                let nextIndex = -1;
                
                if (e.key === 'ArrowDown') {
                    nextIndex = Math.min(currentIndex + 1, visibleNodes.length - 1);
                } else {
                    nextIndex = Math.max(currentIndex - 1, 0);
                }
                
                if (nextIndex !== -1 && visibleNodes[nextIndex]) {
                    setSelectedFolder(visibleNodes[nextIndex].node.fullPath);
                }
            }
            
            if (e.key === 'ArrowRight') {
                if (selectedFolder && !expandedFolders.has(selectedFolder)) {
                    toggleFolderExpand(selectedFolder);
                }
            }
            
            if (e.key === 'ArrowLeft') {
                if (selectedFolder) {
                    if (expandedFolders.has(selectedFolder)) {
                        toggleFolderExpand(selectedFolder);
                    } else {
                        const parentPath = selectedFolder.substring(0, selectedFolder.lastIndexOf('/'));
                        if (parentPath) setSelectedFolder(parentPath);
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, visibleNodes, selectedFolder, expandedFolders]);

    if (!isOpen) return null;

    const renderFolder = (node: FolderNode, depth: number) => {
        const isSelected = selectedFolder === node.fullPath;
        const isExpanded = expandedFolders.has(node.fullPath);
        const hasChildren = node.children && node.children.length > 0;

        return (
            <div key={node.fullPath}>
                <div 
                    onClick={() => setSelectedFolder(node.fullPath)}
                    className={`
                        flex items-center gap-2 px-3 py-1.5 cursor-pointer text-sm font-medium transition-colors border-l-2
                        ${isSelected ? 'bg-violet-900/30 text-violet-300 border-violet-500' : 'text-gray-400 hover:text-gray-200 border-transparent hover:bg-gray-900'}
                    `}
                    style={{ paddingLeft: `${depth * 12 + 12}px` }}
                >
                    <div 
                        onClick={(e) => { e.stopPropagation(); toggleFolderExpand(node.fullPath); }}
                        className={`p-0.5 rounded hover:bg-white/10 ${hasChildren ? 'visible' : 'invisible'}`}
                    >
                        {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    </div>
                    {isExpanded ? <FolderOpen className="w-4 h-4 text-violet-500" /> : <Folder className="w-4 h-4" />}
                    <span className="truncate">{node.name}</span>
                </div>
                {isExpanded && hasChildren && node.children.map(child => renderFolder(child, depth + 1))}
            </div>
        );
    };

    const currentImages = images.slice((page - 1) * pageSize, page * pageSize);
    const totalPages = Math.ceil(images.length / pageSize);

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-gray-950 rounded-xl shadow-2xl w-[95vw] h-[90vh] flex flex-col overflow-hidden border border-gray-800">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-900/30 rounded-lg">
                            <Cloud className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-100">Cloud Library</h2>
                            <p className="text-xs text-gray-500">Browse remote assets</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar */}
                    <div className="w-80 bg-gray-950 border-r border-gray-800 flex flex-col">
                        <div className="p-4 border-b border-gray-800 bg-gray-900/50 flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Folders</span>
                            <button onClick={loadFolders} className="p-1 hover:bg-gray-800 rounded text-gray-500 hover:text-white" title="Refresh Folders">
                                <RefreshCw className={`w-3 h-3 ${loadingFolders ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
                            {folders.length === 0 && !loadingFolders && (
                                <div className="text-center p-8 text-gray-600">No folders found</div>
                            )}
                            {treeData.map(node => renderFolder(node, 0))}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col bg-gray-900/30">
                        {/* Toolbar */}
                        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                {selectedFolder ? (
                                    <>
                                        <FolderOpen className="w-4 h-4 text-violet-500" />
                                        <span className="font-mono text-gray-300">/{selectedFolder}</span>
                                        <span className="text-gray-600">({images.length} items)</span>
                                    </>
                                ) : (
                                    <span>Select a folder to view images</span>
                                )}
                            </div>
                            
                            {/* Pagination Controls */}
                            {images.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => setPage(1)} 
                                        disabled={page === 1}
                                        className="p-1.5 rounded hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed text-gray-400"
                                    >
                                        <ChevronsLeft className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => setPage(p => Math.max(1, p - 1))} 
                                        disabled={page === 1}
                                        className="p-1.5 rounded hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed text-gray-400"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    
                                    <div className="flex items-center bg-gray-950 border border-gray-700 rounded px-2">
                                        <input 
                                            type="text" 
                                            value={pageInput}
                                            onChange={(e) => setPageInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handlePageInputSubmit()}
                                            onBlur={handlePageInputSubmit}
                                            className="w-8 bg-transparent text-center text-xs font-bold text-white outline-none py-1"
                                        />
                                        <span className="text-xs text-gray-500 border-l border-gray-700 pl-2 ml-1">/ {totalPages}</span>
                                    </div>

                                    <button 
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                                        disabled={page === totalPages}
                                        className="p-1.5 rounded hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed text-gray-400"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => setPage(totalPages)} 
                                        disabled={page === totalPages}
                                        className="p-1.5 rounded hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed text-gray-400"
                                    >
                                        <ChevronsRight className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Grid */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {loadingImages ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                                    <Loader2 className="w-12 h-12 animate-spin mb-4 text-violet-500" />
                                    <p>Loading contents...</p>
                                </div>
                            ) : images.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-600">
                                    <Folder className="w-16 h-16 mb-4 opacity-20" />
                                    <p>No images in this folder</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                    {currentImages.map((path, idx) => (
                                        <AsyncThumbnail 
                                            key={path} 
                                            fullPath={path} 
                                            fileName={path.split('/').pop() || 'image'}
                                            isSelected={selectedPaths.has(path)}
                                            onToggle={() => toggleSelection(path)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-gray-800 bg-gray-900 flex justify-between items-center">
                            <div className="text-sm text-gray-400">
                                <span className="font-bold text-white">{selectedPaths.size}</span> images selected
                            </div>
                            <div className="flex gap-3">
                                {selectedPaths.size > 0 && (
                                    <button 
                                        onClick={() => setSelectedPaths(new Set())}
                                        className="px-4 py-2 text-gray-400 hover:text-white font-medium text-xs transition-colors"
                                    >
                                        Clear Selection
                                    </button>
                                )}
                                <button 
                                    onClick={handleImport}
                                    disabled={selectedPaths.size === 0 || importing}
                                    className="flex items-center gap-2 px-6 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-bold shadow-lg shadow-violet-900/20 transition-all active:scale-95"
                                >
                                    {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                    {importing ? 'Importing...' : 'Import Selected'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
