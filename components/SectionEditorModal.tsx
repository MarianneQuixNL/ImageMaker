
import React, { useState, useEffect } from 'react';
import { Edit3, X, Save, Trash2, Plus } from 'lucide-react';

interface FormFieldRendererProps {
    data: any;
    onChange: (newData: any) => void;
    label?: string;
}

const FormFieldRenderer: React.FC<FormFieldRendererProps> = ({ data, onChange, label }) => {
    if (Array.isArray(data)) {
        return (
            <div className="mb-4">
                {label && <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{label}</label>}
                <div className="space-y-2">
                    {data.map((item: any, idx: number) => (
                        <div key={idx} className="flex gap-2">
                            <input
                                type="text"
                                value={String(item)}
                                onChange={(e) => {
                                    const newData = [...data];
                                    newData[idx] = e.target.value;
                                    onChange(newData);
                                }}
                                className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white"
                            />
                            <button
                                onClick={() => onChange(data.filter((_, i) => i !== idx))}
                                className="p-2 bg-red-900/20 text-red-400 hover:text-red-300 rounded border border-red-900/50"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    <button
                        onClick={() => onChange([...data, "New Item"])}
                        className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded border border-gray-700 border-dashed text-xs font-bold flex items-center justify-center gap-2"
                    >
                        <Plus className="w-3 h-3" /> Add Item
                    </button>
                </div>
            </div>
        );
    }
    
    if (typeof data === 'object' && data !== null) {
        return (
            <div className="pl-4 border-l border-gray-800 mb-4">
                {label && <h4 className="text-xs font-bold text-violet-400 mb-2 uppercase">{label}</h4>}
                {Object.entries(data).map(([key, val]) => (
                    <FormFieldRenderer
                        key={key}
                        label={key.replace(/_/g, ' ')}
                        data={val}
                        onChange={(newVal) => onChange({ ...data, [key]: newVal })}
                    />
                ))}
            </div>
        );
    }
    
    return (
        <div className="mb-3">
            <label className="block text-xs font-bold text-gray-400 mb-1">{label || "Value"}</label>
            <input
                type={typeof data === 'number' ? 'number' : 'text'}
                value={data}
                onChange={(e) => onChange(typeof data === 'number' ? parseFloat(e.target.value) : e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:border-violet-500 outline-none"
            />
        </div>
    );
};

interface SectionEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    data: any;
    onSave: (newData: any) => void;
}

export const SectionEditorModal: React.FC<SectionEditorModalProps> = ({ isOpen, onClose, title, data, onSave }) => {
    const [formData, setFormData] = useState<any>(null);
    
    useEffect(() => {
        if (isOpen) {
            setFormData(data ? JSON.parse(JSON.stringify(data)) : {});
        }
    }, [isOpen, data]);
    
    const handleSave = () => {
        onSave(formData);
        onClose();
    };
    
    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in">
            <div className="bg-gray-950 w-[95vw] h-[95vh] rounded-2xl border border-gray-800 flex flex-col shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-gray-900">
                    <h2 className="text-xl font-bold text-white flex items-center gap-3">
                        <Edit3 className="w-5 h-5 text-violet-500" /> Edit {title}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors"><X className="w-6 h-6 text-gray-500" /></button>
                </div>
                <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                    {formData ? (
                        <div className="max-w-4xl mx-auto space-y-6"><FormFieldRenderer data={formData} onChange={setFormData} /></div>
                    ) : (
                        <div className="text-gray-500 text-center mt-20">No data to edit</div>
                    )}
                </div>
                <div className="p-6 border-t border-gray-800 bg-gray-900 flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2.5 text-gray-400 hover:text-white font-bold text-sm">Cancel</button>
                    <button onClick={handleSave} className="px-8 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-bold shadow-lg transition-all flex items-center gap-2">
                        <Save className="w-4 h-4" /> Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};
