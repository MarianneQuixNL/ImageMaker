
import React, { useState, useRef } from 'react';
import { X, Printer, ZoomIn, ZoomOut, FileText } from 'lucide-react';
import Markdown from 'react-markdown';

interface MarkdownViewerModalProps {
    isOpen: boolean;
    onClose: () => void;
    content: string;
    title?: string;
}

export const MarkdownViewerModal: React.FC<MarkdownViewerModalProps> = ({ isOpen, onClose, content, title = "Report" }) => {
    const [fontSize, setFontSize] = useState(16);
    const contentRef = useRef<HTMLDivElement>(null);

    if (!isOpen) return null;

    const handlePrint = () => {
        // Create a new window for printing to isolate content
        const printWindow = window.open('', '_blank');
        if (printWindow && contentRef.current) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>${title}</title>
                        <style>
                            body { font-family: sans-serif; line-height: 1.6; color: #000; padding: 40px; }
                            img { max-width: 100%; border-radius: 8px; margin: 20px 0; }
                            h1, h2, h3 { color: #333; }
                            blockquote { border-left: 4px solid #ccc; padding-left: 1em; color: #666; }
                            code { background: #eee; padding: 2px 4px; border-radius: 3px; }
                            table { width: 100%; border-collapse: collapse; margin-bottom: 1em; }
                            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
                            th { background-color: #f0f0f0; }
                        </style>
                    </head>
                    <body>
                        ${contentRef.current.innerHTML}
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 250);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-gray-900 rounded-xl shadow-2xl w-[95vw] h-[95vh] flex flex-col overflow-hidden border border-gray-800 ring-1 ring-white/10">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-800 bg-gray-950/90 backdrop-blur flex-none">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-violet-900/30 rounded-lg">
                            <FileText className="w-6 h-6 text-violet-500" />
                        </div>
                        <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
                        
                        <div className="h-6 w-px bg-gray-800 mx-2" />
                        
                        {/* Font Controls */}
                        <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1 border border-gray-700">
                            <button onClick={() => setFontSize(Math.max(12, fontSize - 2))} className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors" title="Decrease Font Size">
                                <ZoomOut className="w-4 h-4" />
                            </button>
                            <span className="text-xs font-mono text-gray-400 w-8 text-center">{fontSize}px</span>
                            <button onClick={() => setFontSize(Math.min(32, fontSize + 2))} className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors" title="Increase Font Size">
                                <ZoomIn className="w-4 h-4" />
                            </button>
                        </div>
                        
                        <button onClick={handlePrint} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors flex items-center gap-2 border border-transparent hover:border-gray-700" title="Print Document">
                            <Printer className="w-5 h-5" /> <span className="text-xs font-bold hidden sm:inline">Print</span>
                        </button>
                    </div>
                    
                    <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-12 bg-gray-950 scroll-smooth">
                    <div 
                        ref={contentRef}
                        className="markdown-body max-w-4xl mx-auto"
                        style={{ fontSize: `${fontSize}px` }}
                    >
                        <Markdown>{content}</Markdown>
                    </div>
                </div>
            </div>
        </div>
    );
};
