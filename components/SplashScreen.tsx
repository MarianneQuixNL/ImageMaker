

import React from 'react';
import { Spinner } from './common/Spinner';

const KatjeLogo = ({ className = "w-24 h-24" }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="katjeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
        </defs>
        <g stroke="url(#katjeGradient)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)">
            {/* K Stem */}
            <path d="M35 30 V80" />
            {/* K Arms */}
            <path d="M75 30 L35 55 L75 80" />
            {/* Tail */}
            <path d="M35 80 Q 15 105 5 80" strokeWidth="6" />
        </g>
        <g fill="url(#katjeGradient)">
            {/* Left Ear */}
            <path d="M30 32 L20 10 L50 32 Z" />
            {/* Right Ear (Suggestive) */}
            <path d="M70 32 L80 15 L60 40 Z" opacity="0.8" />
        </g>
    </svg>
);

interface SplashScreenProps {
    status: string;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ status }) => {
    return (
        <div className="fixed inset-0 bg-gray-950 flex flex-col items-center justify-center z-[9999] animate-in fade-in duration-700">
            <div className="relative mb-10 flex flex-col items-center">
                <div className="absolute inset-0 bg-violet-500/10 blur-3xl rounded-full scale-150 animate-pulse"></div>
                <KatjeLogo className="w-32 h-32 text-violet-500 relative z-10" />
                
                <h1 className="text-5xl font-black text-white mt-6 tracking-tighter drop-shadow-lg">
                    Image<span className="text-violet-500">Maker</span>
                </h1>
                <p className="text-gray-500 text-xs font-bold tracking-[0.3em] uppercase mt-2 opacity-70">
                    Katje B.V.
                </p>
            </div>
            
            <div className="flex flex-col items-center gap-6 mt-4 w-64">
                <div className="h-1 w-full bg-gray-900 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-600 animate-loading-bar rounded-full"></div>
                </div>
                
                <div className="flex items-center gap-3">
                    <Spinner size={50} color="violet" />
                    <span className="text-gray-400 text-sm font-mono animate-pulse whitespace-nowrap">
                        {status}
                    </span>
                </div>
            </div>

            <style>{`
                @keyframes loading-bar {
                    0% { width: 0%; margin-left: 0; }
                    50% { width: 100%; margin-left: 0; }
                    100% { width: 0%; margin-left: 100%; }
                }
                .animate-loading-bar {
                    animation: loading-bar 1.5s infinite ease-in-out;
                }
            `}</style>
        </div>
    );
};