
import React from 'react';

type SpinnerColor = 'white' | 'black' | 'red' | 'green' | 'blue' | 'yellow' | 'violet' | 'brown' | 'orange' | 'rainbow';
type SpinnerSize = 50 | 100 | 200 | 400;

interface SpinnerProps {
    color?: SpinnerColor;
    size?: SpinnerSize;
    className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ color = 'violet', size = 50, className = '' }) => {
    const getSizeClass = () => {
        switch (size) {
            case 50: return 'w-[50px] h-[50px]';
            case 100: return 'w-[100px] h-[100px]';
            case 200: return 'w-[200px] h-[200px]';
            case 400: return 'w-[400px] h-[400px]';
            default: return 'w-[50px] h-[50px]';
        }
    };

    const getColorClass = () => {
        switch (color) {
            case 'white': return 'text-white';
            case 'black': return 'text-black';
            case 'red': return 'text-red-500';
            case 'green': return 'text-green-500';
            case 'blue': return 'text-blue-500';
            case 'yellow': return 'text-yellow-500';
            case 'violet': return 'text-violet-500';
            case 'brown': return 'text-amber-800'; // Approximation for brown
            case 'orange': return 'text-orange-500';
            case 'rainbow': return 'text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-green-500 to-blue-500'; // Special handling needed for stroke
            default: return 'text-violet-500';
        }
    };

    const isRainbow = color === 'rainbow';

    return (
        <div className={`${getSizeClass()} ${className} flex items-center justify-center`}>
            <svg 
                viewBox="0 0 100 100" 
                className={`animate-spin ${isRainbow ? '' : getColorClass()}`}
                xmlns="http://www.w3.org/2000/svg"
            >
                {isRainbow && (
                    <defs>
                        <linearGradient id="rainbow" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#ef4444" />
                            <stop offset="50%" stopColor="#22c55e" />
                            <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                    </defs>
                )}
                <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    stroke={isRainbow ? "url(#rainbow)" : "currentColor"} 
                    strokeWidth="8" 
                    fill="none" 
                    strokeDasharray="200" 
                    strokeDashoffset="100"
                    strokeLinecap="round"
                />
            </svg>
        </div>
    );
};
