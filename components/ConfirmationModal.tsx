
import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    isDanger?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
    isOpen, onClose, onConfirm, title, message, confirmLabel = "Confirm", isDanger = false 
}) => {
    
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'Enter') {
                onConfirm();
                onClose();
            }
        };
        if (isOpen) window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, onConfirm]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm animate-in fade-in">
            <div className="bg-gray-900 rounded-xl shadow-2xl w-96 max-w-[90vw] overflow-hidden transform transition-all scale-100 border border-gray-800">
                <div className="flex items-center justify-between p-4 border-b border-gray-800">
                    <h3 className={`font-bold flex items-center gap-2 ${isDanger ? 'text-red-500' : 'text-gray-100'}`}>
                        {isDanger && <AlertTriangle className="w-5 h-5" />}
                        {title}
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-800 rounded-full text-gray-500 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6">
                    <p className="text-gray-300 text-sm leading-relaxed">{message}</p>
                </div>
                <div className="p-4 bg-gray-950 flex justify-end gap-3 border-t border-gray-800">
                    <button 
                        onClick={onClose} 
                        className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 text-sm font-medium hover:bg-gray-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={() => { onConfirm(); onClose(); }} 
                        className={`px-4 py-2 rounded-lg text-white text-sm font-bold shadow-md transition-colors ${isDanger ? 'bg-red-600 hover:bg-red-700' : 'bg-violet-600 hover:bg-violet-700'}`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};
