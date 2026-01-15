import React, { useState, useSyncExternalStore } from 'react';
import { X, ChevronLeft, ChevronRight, Info, CheckCircle, AlertTriangle, AlertOctagon, Copy, Download, Layers } from 'lucide-react';
import { logger } from '../services/loggerService';
import { LogType, LogSource } from '../types';

interface ConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ITEMS_PER_PAGE = 10;

const TABS = ['All', 'Info', 'Success', 'Warning', 'Error', 'Gemini', 'Imagen', 'System'];

export const ConsoleModal: React.FC<ConsoleModalProps> = ({ isOpen, onClose }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('All');
  
  const logs = useSyncExternalStore(logger.subscribe, logger.getSnapshot, logger.getServerSnapshot);

  if (!isOpen) return null;

  const filteredLogs = logs.filter(log => {
      if (activeTab === 'All') return true;
      if (activeTab === 'Gemini') return log.source === LogSource.GEMINI;
      if (activeTab === 'Imagen') return log.source === LogSource.IMAGEN;
      if (activeTab === 'System') return log.source === LogSource.SYSTEM;
      return log.type === activeTab.toUpperCase();
  });

  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentLogs = filteredLogs.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const getIcon = (type: LogType) => {
    switch (type) {
      case LogType.SUCCESS: return <CheckCircle className="w-5 h-5 text-green-500" />;
      case LogType.WARNING: return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case LogType.ERROR: return <AlertOctagon className="w-5 h-5 text-red-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const copyLog = (log: any) => {
      navigator.clipboard.writeText(JSON.stringify(log, null, 2));
  };

  const downloadLogs = () => {
      let md = `# System Logs Report - ${new Date().toLocaleString()}\n\n`;
      filteredLogs.forEach(log => {
          md += `### [${log.timestamp.toLocaleTimeString()}] [${log.source}] ${log.type}\n`;
          md += `**Message**: ${log.message}\n`;
          if (log.details) md += `**Details**: \n\`\`\`\n${log.details}\n\`\`\`\n`;
          md += `\n---\n`;
      });
      
      const blob = new Blob([md], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `system_logs_${new Date().toISOString().replace(/[:.]/g, '-')}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-[95vw] h-[95vh] flex flex-col overflow-hidden border border-gray-200 dark:border-gray-800">
        
        {/* Header */}
        <div className="flex flex-col border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-950">
            <div className="flex items-center justify-between p-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                    <Layers className="w-6 h-6 text-indigo-600" />
                    System Console
                </h2>
                <div className="flex items-center gap-2">
                    <button onClick={downloadLogs} className="flex items-center gap-1 text-xs px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 font-medium">
                        <Download className="w-4 h-4" /> Export Log
                    </button>
                    <button 
                        onClick={onClose}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>
            </div>
            
            {/* Tabs */}
            <div className="flex gap-1 px-4 overflow-x-auto no-scrollbar">
                {TABS.map(tab => (
                    <button
                        key={tab}
                        onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-100 dark:bg-black font-mono text-sm">
          {currentLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Layers className="w-12 h-12 mb-2 opacity-20" />
              <p>No logs found for this filter</p>
            </div>
          ) : (
            <div className="space-y-3">
              {currentLogs.map((log) => (
                <div 
                  key={log.id} 
                  className={`p-3 rounded-lg border-l-4 bg-white dark:bg-gray-900 shadow-sm relative group ${
                    log.type === LogType.ERROR ? 'border-red-500' :
                    log.type === LogType.WARNING ? 'border-yellow-500' :
                    log.type === LogType.SUCCESS ? 'border-green-500' :
                    'border-blue-500'
                  }`}
                >
                  <button onClick={() => copyLog(log)} className="absolute top-2 right-2 p-1 text-gray-400 hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" title="Copy JSON">
                      <Copy className="w-4 h-4" />
                  </button>
                  
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getIcon(log.type)}</div>
                    <div className="flex-1 pr-8">
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex gap-2 items-center">
                            <span className={`font-bold ${
                            log.type === LogType.ERROR ? 'text-red-600 dark:text-red-400' :
                            log.type === LogType.SUCCESS ? 'text-green-600 dark:text-green-400' :
                            log.type === LogType.WARNING ? 'text-yellow-600 dark:text-yellow-400' :
                            'text-blue-600 dark:text-blue-400'
                            }`}>
                            {log.type}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 border border-gray-200 dark:border-gray-700">
                                {log.source}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-300 dark:text-gray-600 font-mono" title={`ID: ${log.id}`}>
                                #{log.id.split('-')[0]}
                            </span>
                            <span className="text-xs text-gray-400">
                            {log.timestamp.toLocaleTimeString()}
                            </span>
                        </div>
                      </div>
                      <p className="text-gray-800 dark:text-gray-200 break-words whitespace-pre-wrap">{log.message}</p>
                      {log.details && (
                        <div className="mt-2">
                           <div className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wider">Details</div>
                           <div className="p-2 bg-gray-50 dark:bg-black rounded border border-gray-200 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-400 overflow-x-auto">
                             <pre>{log.details}</pre>
                           </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 flex justify-between items-center">
          <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>Total: {logs.length}</span>
              <span>Filtered: {filteredLogs.length}</span>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <span className="text-gray-600 dark:text-gray-300 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
          
          <button 
            onClick={() => logger.clear()}
            className="text-xs text-red-500 hover:text-red-700 font-semibold px-3 py-1 rounded border border-red-200 hover:bg-red-50 transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
};