
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface RichTooltipProps {
    content: React.ReactNode;
    title?: string; // Explicit title for the panel
    children: React.ReactElement;
    placement?: 'top' | 'bottom' | 'left' | 'right';
    className?: string;
}

export const RichTooltip: React.FC<RichTooltipProps> = ({ content, title, children, placement = 'right', className }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const triggerRef = useRef<HTMLElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<number | null>(null);

    const handleMouseEnter = () => {
        // Small delay to prevent flickering when moving fast
        timeoutRef.current = window.setTimeout(() => {
            updatePosition();
            setIsVisible(true);
        }, 300);
    };

    const handleMouseLeave = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsVisible(false);
    };

    const updatePosition = () => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            let top = 0;
            let left = 0;
            const gap = 12; // Increased gap

            // Default strategy
            switch (placement) {
                case 'top':
                    top = rect.top - gap;
                    left = rect.left + rect.width / 2;
                    break;
                case 'bottom':
                    top = rect.bottom + gap;
                    left = rect.left + rect.width / 2;
                    break;
                case 'left':
                    top = rect.top;
                    left = rect.left - gap;
                    break;
                case 'right':
                    top = rect.top;
                    left = rect.right + gap;
                    break;
            }
            setCoords({ top, left });
        }
    };

    useEffect(() => {
        if (isVisible && tooltipRef.current && triggerRef.current) {
            const tooltipRect = tooltipRef.current.getBoundingClientRect();
            let { top, left } = coords;

            // Adjustments for centering
            if (placement === 'top') {
                top -= tooltipRect.height;
                left -= tooltipRect.width / 2;
            } else if (placement === 'bottom') {
                left -= tooltipRect.width / 2;
            } else if (placement === 'left') {
                left -= tooltipRect.width;
            } 
            // Right placement doesn't need start adjustment

            // Viewport Boundary Detection
            const padding = 16;
            const vw = window.innerWidth;
            const vh = window.innerHeight;

            // X-axis check
            if (left + tooltipRect.width > vw - padding) {
                // Flip to left if it overflows right
                if (placement === 'right') left = triggerRef.current!.getBoundingClientRect().left - tooltipRect.width - padding;
                else left = vw - tooltipRect.width - padding;
            }
            if (left < padding) left = padding;

            // Y-axis check
            if (top + tooltipRect.height > vh - padding) {
                top = vh - tooltipRect.height - padding;
            }
            if (top < padding) top = padding;

            tooltipRef.current.style.top = `${top}px`;
            tooltipRef.current.style.left = `${left}px`;
        }
    }, [isVisible, placement, coords]);

    return (
        <>
            {/* Fix: Casting children to ReactElement<any> to allow ref injection */}
            {React.cloneElement(children as React.ReactElement<any>, {
                ref: triggerRef,
                onMouseEnter: handleMouseEnter,
                onMouseLeave: handleMouseLeave,
                // Suppress browser tooltip
                title: undefined 
            })}
            {isVisible && createPortal(
                <div 
                    ref={tooltipRef}
                    className={`fixed z-[9999] bg-gray-900 border border-gray-700 rounded-xl shadow-2xl p-0 w-[280px] animate-in fade-in zoom-in-95 duration-100 pointer-events-none flex flex-col overflow-hidden ${className || ''}`}
                    style={{ top: coords.top, left: coords.left }}
                >
                    {title && (
                        <div className="bg-gray-800 px-3 py-2 border-b border-gray-700">
                            <h4 className="text-xs font-black text-violet-400 uppercase tracking-wider">{title}</h4>
                        </div>
                    )}
                    <div className="p-3 text-xs text-gray-300 leading-relaxed break-words whitespace-pre-wrap max-h-[300px] overflow-hidden bg-gray-900/95 backdrop-blur">
                        {content}
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};
