
import React from 'react';
import { User, Activity, ScanFace, ShoppingBag, Brain, Users, Hand, BookOpen, Flame, Sparkles, FileJson, FileText, ImagePlus, Printer, Pencil } from 'lucide-react';
import { jobService } from '../services/jobService';
import { Person, HistoryItem, JobType } from '../types';
import { logger } from '../services/loggerService'; // Import logger
import { LogType, LogSource } from '../types';

const blobToBase64 = (blob: Blob): Promise<string> => { 
    return new Promise((resolve, reject) => { 
        const reader = new FileReader(); 
        reader.onloadend = () => resolve(reader.result as string); 
        reader.onerror = reject; 
        reader.readAsDataURL(blob); 
    }); 
};

// Helper to escape XML/HTML special characters to prevent broken SVG rendering
const escapeXML = (str: any): string => {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
};

// Helper to resize image for the sheet to prevent massive Data URIs
const getResizedImageDataUrl = (src: string, targetWidth: number, targetHeight: number): Promise<string> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
            const canvas = document.createElement('canvas');
            // Maintain aspect ratio with CONTAIN (fit inside) instead of COVER
            const ratio = Math.min(targetWidth / img.width, targetHeight / img.height);
            const w = img.width * ratio;
            const h = img.height * ratio;
            
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                // Fill with white background to ensure no transparency issues
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, targetWidth, targetHeight);
                // Center the image
                ctx.drawImage(img, (targetWidth - w) / 2, (targetHeight - h) / 2, w, h);
                resolve(canvas.toDataURL('image/jpeg', 0.85));
            } else {
                resolve(src);
            }
        };
        img.onerror = () => resolve(src);
        img.src = src;
    });
};

const renderKeyValue = (obj: any) => { 
    if (!obj) return null; 
    return ( 
        <div className="grid grid-cols-1 gap-2 text-xs"> 
            {Object.entries(obj).map(([k, v]) => { 
                if (Array.isArray(v)) return ( 
                    <div key={k} className="border-t border-gray-800 pt-2 mt-1"> 
                        <span className="text-gray-500 font-bold uppercase block mb-1">{k.replace(/_/g, ' ')}</span> 
                        <div className="flex flex-wrap gap-1"> {v.map((item: any, i: number) => <span key={i} className="bg-gray-800 text-gray-300 px-1.5 py-0.5 rounded text-[10px]">{String(item)}</span>)} </div> 
                    </div> 
                ); 
                if (typeof v === 'object') return null; 
                return ( 
                    <div key={k} className="flex flex-col"> 
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">{k.replace(/_/g, ' ')}</span> 
                        <span className="text-gray-300">{String(v)}</span> 
                    </div> 
                ); 
            })} 
        </div> 
    ); 
}; 

interface SectionCardProps {
    title: string;
    data: any;
    type: JobType;
    icon: any;
    objKey: keyof Person;
    onEditSection: (title: string, key: keyof Person, data: any) => void;
    onGenerate: (type: JobType) => void;
    children?: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({ title, data, type, icon: Icon, objKey, onEditSection, onGenerate, children }) => ( 
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 relative group hover:border-gray-700 transition-colors shadow-sm"> 
        <div className="flex justify-between items-start mb-4 border-b border-gray-800 pb-2"> 
            <h3 className="text-sm font-bold text-gray-200 flex items-center gap-2 uppercase tracking-wide"> <Icon className="w-4 h-4 text-violet-500" /> {title} </h3> 
            <div className="flex gap-2"> 
                {data && ( 
                    <button onClick={() => onEditSection(title, objKey, data)} className="p-1 text-gray-500 hover:text-white transition-colors" title="Edit Data"> <Pencil className="w-3 h-3" /> </button> 
                )} 
                <button onClick={() => onGenerate(type)} className="text-[10px] font-bold text-violet-400 hover:text-white bg-gray-800 hover:bg-violet-600 px-2 py-1 rounded transition-colors"> {data ? "Re-roll" : "Generate"} </button> 
            </div> 
        </div> 
        {children ? children : (data ? ( <div className="text-xs text-gray-300 leading-relaxed"> {typeof data === 'string' ? data : renderKeyValue(data)} </div> ) : ( <div className="text-xs text-gray-600 italic py-2">No data generated.</div> ))} 
    </div> 
); 

interface CharacterSheetProps {
    person?: Person;
    image: HistoryItem;
    onGenerate: (type: JobType) => void;
    onGenerateAll: () => void;
    onEditSection: (title: string, key: keyof Person, data: any) => void;
}

export const CharacterSheetView: React.FC<CharacterSheetProps> = ({ person, image, onGenerate, onGenerateAll, onEditSection }) => { 
    
    const getSheetHTML = async () => { 
        let imgSrc = image.url; 
        if (imgSrc.startsWith('blob:')) { 
            try { 
                const response = await fetch(imgSrc); 
                const blob = await response.blob(); 
                imgSrc = await blobToBase64(blob); 
            } catch (e) { console.error(e); } 
        }
        imgSrc = await getResizedImageDataUrl(imgSrc, 300, 360);
        
        const styleH2 = "font-size: 16px; color: #444; margin: 0 0 10px 0; border-bottom: 2px solid #ddd; font-weight: 800; text-transform: uppercase; padding-bottom: 5px;";
        const styleLi = "margin-bottom: 4px; font-size: 13px; color: #333;";
        const styleLabel = "font-weight: 800; color: #555; font-size: 11px; text-transform: uppercase; margin-right: 5px;";

        const rpgStatsHtml = person?.rpgStats ? `
            <div style="margin-bottom: 20px; background: #f9f9f9; padding: 15px; border-radius: 8px; border: 1px solid #eee;">
                <h2 style="${styleH2}">Core Attributes</h2>
                <div style="display: flex; justify-content: space-between; gap: 10px;">
                    ${Object.entries(person.rpgStats).map(([k, v]) => `
                        <div style="text-align: center; flex: 1;">
                            <span style="font-size: 10px; font-weight: bold; color: #666; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 5px;">${escapeXML(k.substring(0,3))}</span>
                            <div style="font-size: 20px; font-weight: 900; color: #222;">${escapeXML(v)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>` : '';

        const skillsHtml = person?.skills ? `
            <div style="margin-bottom: 20px;">
                <h2 style="${styleH2}">Skills</h2>
                <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                    <thead><tr style="background: #eee; text-align: left;"><th style="padding: 4px;">Skill</th><th style="padding: 4px;">Attr</th><th style="padding: 4px;">Level</th></tr></thead>
                    <tbody>
                        ${person.skills.map(s => `<tr><td style="padding: 4px; border-bottom: 1px solid #eee;">${escapeXML(s.name)}</td><td style="padding: 4px; border-bottom: 1px solid #eee;">${escapeXML(s.attribute)}</td><td style="padding: 4px; border-bottom: 1px solid #eee;">${escapeXML(s.level)}</td></tr>`).join('')}
                    </tbody>
                </table>
            </div>` : '';

        const renderList = (title: string, list?: string[]) => {
            if (!list || list.length === 0) return '';
            return `<div style="margin-bottom: 15px;">
                <h3 style="font-size: 12px; font-weight: bold; color: #666; text-transform: uppercase; margin-bottom: 5px;">${escapeXML(title)}</h3>
                <ul style="list-style: disc; padding-left: 15px; margin: 0;">
                    ${list.map(i => `<li style="font-size: 12px; margin-bottom: 2px;">${escapeXML(i)}</li>`).join('')}
                </ul>
            </div>`;
        };

        const traitsHtml = person?.mentalAttributes ? `
            <div style="margin-bottom: 20px;">
                <h2 style="${styleH2}">Traits</h2>
                ${renderList("Advantages", person.mentalAttributes.advantages)}
                ${renderList("Disadvantages", person.mentalAttributes.disadvantages)}
                ${renderList("Quirks", person.mentalAttributes.quirks)}
            </div>` : '';

        const socialHtml = person?.social ? `
            <div style="margin-bottom: 20px;">
                <h2 style="${styleH2}">Social Connections</h2>
                ${renderList("Family", person.social.family)}
                ${renderList("Friends", person.social.friends)}
                ${renderList("Enemies", person.social.enemies)}
            </div>` : '';

        const backstoryHtml = person?.backstory ? `
            <div style="margin-top: 20px; border-top: 1px solid #eee; padding-top: 20px;">
                <h2 style="${styleH2}">Biography</h2>
                <p style="text-align: justify; margin-bottom: 10px; font-size: 13px;"><strong>Origin:</strong> ${escapeXML(person.backstory.origin_place)}</p>
                <p style="text-align: justify; font-size: 13px;">${escapeXML(person.backstory.short_biography)}</p>
            </div>` : '';

        const identitySection = `
            <div style="display: flex; gap: 30px; margin-bottom: 30px; align-items: flex-start; border-bottom: 2px solid #eee; padding-bottom: 30px;">
                <img src="${imgSrc}" style="width: 150px; height: 180px; object-fit: contain; border-radius: 4px; border: 1px solid #ccc; background-color: #fff;" />
                <div style="flex: 1;">
                    <h1 style="font-size: 32px; border-bottom: 4px solid #333; padding-bottom: 10px; margin: 0 0 20px 0; text-transform: uppercase; letter-spacing: 2px;">${escapeXML(person?.name || "Unknown Character")}</h1>
                    <ul style="list-style: none; padding: 0;">
                        <li style="${styleLi}"><span style="${styleLabel}">Age</span> ${escapeXML(person?.age || '?')}</li>
                        <li style="${styleLi}"><span style="${styleLabel}">Gender</span> ${escapeXML(person?.gender || 'Unknown')}</li>
                        ${person?.physicalAttributes ? Object.entries(person.physicalAttributes).filter(([k]) => typeof person!.physicalAttributes![k as keyof typeof person.physicalAttributes] === 'string').map(([k, v]) => `<li style="${styleLi}"><span style="${styleLabel}">${escapeXML(k.replace(/_/g, ' '))}</span> ${escapeXML(v)}</li>`).join('') : ''}
                    </ul>
                </div>
            </div>
        `;

        const inventoryHtml = person?.possessions ? `
            <div style="margin-bottom: 20px;">
                <h2 style="${styleH2}">Inventory</h2>
                ${renderList("Equipped", person.possessions.equipped_items)}
                ${renderList("Carried", person.possessions.carried_inventory)}
            </div>
        ` : '';

        const spiritualHtml = person?.spiritualAttributes ? `
            <div style="margin-bottom: 20px;">
                <h2 style="${styleH2}">Spiritual</h2>
                <ul style="list-style: none; padding: 0;">
                    ${Object.entries(person.spiritualAttributes).map(([k,v]) => `<li style="${styleLi}"><span style="${styleLabel}">${escapeXML(k.replace(/_/g, ' '))}</span> ${escapeXML(v)}</li>`).join('')}
                </ul>
            </div>
        ` : '';

        // Note: xmlns is crucial for foreignObject content
        return `
            <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: 'Georgia', serif; color: #1a1a1a; line-height: 1.5; font-size: 14px; background: white; padding: 40px; width: 800px; box-sizing: border-box;">
                ${identitySection}
                ${rpgStatsHtml}
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
                    <div>
                        ${traitsHtml}
                        ${inventoryHtml}
                    </div>
                    <div>
                        ${skillsHtml}
                        ${socialHtml}
                        ${spiritualHtml}
                    </div>
                </div>
                ${backstoryHtml}
            </div>
        `;
    };
    
    const handlePrint = async () => { 
        const printWindow = window.open('', '_blank'); 
        if (printWindow) { 
            const html = await getSheetHTML(); 
            printWindow.document.write(`<html><head><title>${person?.name}</title></head><body style="margin:0; padding:0;">${html}</body></html>`); 
            printWindow.document.close(); 
            printWindow.focus(); 
            setTimeout(() => { printWindow.print(); printWindow.close(); }, 500); 
        } 
    }; 
    
    const handleSaveAsImage = async () => { 
        if (!person) return; 
        try {
            logger.log("Generating character sheet image...", LogType.INFO, "Constructing HTML/SVG buffer", LogSource.SYSTEM);
            const html = await getSheetHTML();
            
            // Measure height
            const measureDiv = document.createElement('div');
            measureDiv.style.position = 'absolute';
            measureDiv.style.visibility = 'hidden';
            measureDiv.style.pointerEvents = 'none';
            measureDiv.innerHTML = html;
            document.body.appendChild(measureDiv);
            const height = Math.max(measureDiv.scrollHeight, 800); // Min height 800
            const width = 800;
            document.body.removeChild(measureDiv);

            const svg = `
                <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
                    <foreignObject width="100%" height="100%">
                        ${html}
                    </foreignObject>
                </svg>
            `;
            
            const img = new Image();
            // Using encodeURIComponent is safer for SVG content
            img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
            
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if(ctx) {
                    ctx.fillStyle = 'white';
                    ctx.fillRect(0, 0, width, height);
                    ctx.drawImage(img, 0, 0);
                    
                    canvas.toBlob((blob) => {
                        if(blob) {
                            const filename = `character_sheet_${(person.name || 'unknown').replace(/\s+/g, '_').toLowerCase()}.png`;
                            
                            // 1. Add to App History
                            jobService.addHistoryItemFromBlob(blob, `Character Sheet - ${person.name || 'Unknown'}`, 'Sheet Generator', 'generated');
                            
                            // 2. Trigger Download
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = filename;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                            
                            logger.log("Character sheet saved successfully", LogType.SUCCESS, filename, LogSource.SYSTEM);
                        } else {
                            logger.log("Failed to create image blob", LogType.ERROR, "Canvas conversion failed", LogSource.SYSTEM);
                        }
                    });
                }
            };
            
            img.onerror = (e) => {
                logger.log("Failed to render character sheet SVG", LogType.ERROR, "SVG Data URI likely invalid or too large. XML Error?", LogSource.SYSTEM);
                console.error("SVG Error", e);
            };
        } catch (e: any) {
            logger.log("Character sheet generation exception", LogType.ERROR, e.message, LogSource.SYSTEM);
        }
    }; 
    
    const handleDownloadMarkdown = () => { 
        if (!person) return; 
        let md = `# Character Sheet: ${person.name || "Unknown"}\n\n`; 
        md += `**Age**: ${person.age || '?'} \n`; 
        md += `**Gender**: ${person.gender || 'Unknown'} \n`; 
        
        if (person.rpgStats) { md += `## Core Attributes\n`; Object.entries(person.rpgStats).forEach(([k, v]) => { md += `- **${k.toUpperCase()}**: ${v}\n`; }); md += `\n`; } 
        
        if (person.mentalAttributes) {
            md += `## Mental Traits\n`;
            if (person.mentalAttributes.advantages?.length) md += `### Advantages\n${person.mentalAttributes.advantages.map(a => `- ${a}`).join('\n')}\n`;
            if (person.mentalAttributes.disadvantages?.length) md += `### Disadvantages\n${person.mentalAttributes.disadvantages.map(d => `- ${d}`).join('\n')}\n`;
            if (person.mentalAttributes.quirks?.length) md += `### Quirks\n${person.mentalAttributes.quirks.map(q => `- ${q}`).join('\n')}\n`;
            md += `\n`;
        }

        if (person.skills) {
            md += `## Skills\n| Skill | Attribute | Level |\n|---|---|---|\n`;
            person.skills.forEach(s => { md += `| ${s.name} | ${s.attribute} | ${s.level} |\n`; });
            md += `\n`;
        }

        if (person.physicalAttributes) { md += `## Physical Traits\n`; Object.entries(person.physicalAttributes).forEach(([k, v]) => { md += `- **${k}**: ${Array.isArray(v) ? v.join(', ') : v}\n`; }); md += `\n`; } 
        if (person.social) {
            md += `## Social Connections\n`;
            if (person.social.family?.length) md += `**Family**: ${person.social.family.join(', ')}\n`;
            if (person.social.friends?.length) md += `**Friends**: ${person.social.friends.join(', ')}\n`;
            if (person.social.enemies?.length) md += `**Enemies**: ${person.social.enemies.join(', ')}\n`;
            md += `\n`;
        }
        
        if (person.backstory) { md += `## Biography\n`; md += `**Origin**: ${person.backstory.origin_place}\n\n`; md += `${person.backstory.short_biography}\n`; } 
        const blob = new Blob([md], { type: 'text/markdown' }); 
        const url = URL.createObjectURL(blob); 
        const a = document.createElement('a'); 
        a.href = url; 
        a.download = `${(person.name || "character").replace(/\s+/g, "_")}_sheet.md`; 
        document.body.appendChild(a); 
        a.click(); 
        document.body.removeChild(a); 
    }; 
    
    const handleDownloadJSON = () => { 
        if (!person) return; 
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(person, null, 2)); 
        const downloadAnchorNode = document.createElement('a'); 
        downloadAnchorNode.setAttribute("href", dataStr); 
        downloadAnchorNode.setAttribute("download", `${(person.name || "character").replace(/\s+/g, "_")}_sheet.json`); 
        document.body.appendChild(downloadAnchorNode); 
        downloadAnchorNode.click(); 
        downloadAnchorNode.remove(); 
    }; 
    
    if (!person) return ( 
        <div className="flex flex-col items-center justify-center h-full text-gray-500"> 
            <User className="w-16 h-16 mb-4 opacity-20" /> 
            <p>Select a subject to view character sheet</p> 
        </div> 
    ); 
    
    return ( 
        <div className="h-full flex flex-col bg-gray-950"> 
            <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-gray-900 sticky top-0 z-10 shadow-md"> 
                <div className="flex items-center gap-4"> 
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg border-2 border-gray-700 shadow-lg"> 
                        {person.gender === 'Female' ? 'F' : person.gender === 'Male' ? 'M' : '?'} 
                    </div> 
                    <div> 
                        <h1 className="text-lg font-black text-white leading-tight tracking-tight uppercase">{person.name || "Unknown Identity"}</h1> 
                        <p className="text-xs text-gray-400 font-mono">Lvl 1 • {person.age} Years • {person.gender}</p> 
                    </div> 
                </div> 
                <div className="flex gap-2"> 
                    <button onClick={onGenerateAll} className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-bold text-xs flex items-center gap-2 shadow-lg shadow-violet-900/20 transition-all"> <Sparkles className="w-3 h-3" /> Analyze All </button> 
                    <div className="w-px bg-gray-700 h-8 mx-1" /> 
                    <button onClick={handleDownloadJSON} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors border border-gray-700 hover:border-gray-500" title="Download JSON"> <FileJson className="w-4 h-4" /> </button> 
                    <button onClick={handleDownloadMarkdown} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors border border-gray-700 hover:border-gray-500" title="Download Markdown"> <FileText className="w-4 h-4" /> </button> 
                    <button onClick={handleSaveAsImage} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors border border-gray-700 hover:border-gray-500" title="Save as Image"> <ImagePlus className="w-4 h-4" /> </button> 
                    <button onClick={handlePrint} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors border border-gray-700 hover:border-gray-500" title="Print Sheet"> <Printer className="w-4 h-4" /> </button> 
                </div> 
            </div> 
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar"> 
                <div className="max-w-6xl mx-auto space-y-6"> 
                    <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 shadow-sm relative group"> 
                        <div className="flex justify-between items-center mb-4"> 
                            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2"> <Activity className="w-4 h-4 text-violet-500" /> Core Attributes </h3> 
                            <div className="flex gap-2"> {person.rpgStats && <button onClick={() => onEditSection("RPG Stats", "rpgStats", person.rpgStats)} className="p-1 text-gray-500 hover:text-white"><Pencil className="w-3 h-3" /></button>} <button onClick={() => onGenerate(JobType.ANALYZE_RPG_STATS)} className="text-[10px] uppercase font-bold text-violet-400 hover:underline">Roll Stats</button> </div> 
                        </div> 
                        {person.rpgStats ? ( 
                            <div className="grid grid-cols-3 md:grid-cols-6 gap-4"> 
                                {Object.entries(person.rpgStats).map(([key, val]) => ( 
                                    <div key={key} className="bg-black/40 border border-gray-800 rounded-lg p-3 text-center group hover:border-violet-500/50 transition-colors"> 
                                        <div className="text-xs text-gray-500 uppercase font-black tracking-wider mb-1">{key.substring(0,3)}</div> 
                                        <div className="text-2xl font-black text-white">{val}</div> 
                                    </div> 
                                ))} 
                            </div> 
                        ) : ( 
                            <div className="p-4 bg-black/20 rounded-lg border border-gray-800 border-dashed text-center text-gray-600 text-xs">Stats not generated</div> 
                        )} 
                    </div> 
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"> 
                        <div className="space-y-6"> 
                            <SectionCard title="Physical Traits" data={person.physicalAttributes} type={JobType.ANALYZE_PHYSICAL} icon={ScanFace} objKey="physicalAttributes" onEditSection={onEditSection} onGenerate={onGenerate} /> 
                            <SectionCard title="Possessions" data={person.possessions} type={JobType.ANALYZE_POSSESSIONS} icon={ShoppingBag} objKey="possessions" onEditSection={onEditSection} onGenerate={onGenerate} /> 
                        </div> 
                        <div className="space-y-6"> 
                            <SectionCard title="Personality & Traits" data={person.mentalAttributes} type={JobType.ANALYZE_MENTAL} icon={Brain} objKey="mentalAttributes" onEditSection={onEditSection} onGenerate={onGenerate}>
                                {person.mentalAttributes ? (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4 text-xs">
                                            <div><span className="font-bold text-gray-500 block mb-1">Archetype</span> {person.mentalAttributes.personality_archetype}</div>
                                            <div><span className="font-bold text-gray-500 block mb-1">Alignment</span> {person.mentalAttributes.social_alignment}</div>
                                        </div>
                                        {person.mentalAttributes.advantages && (
                                            <div>
                                                <span className="font-bold text-[10px] text-green-500 uppercase tracking-wider block mb-1">Advantages</span>
                                                <div className="flex flex-wrap gap-1">{person.mentalAttributes.advantages.map((a, i) => <span key={i} className="px-2 py-0.5 bg-green-900/20 text-green-300 text-[10px] rounded border border-green-900/50">{a}</span>)}</div>
                                            </div>
                                        )}
                                        {person.mentalAttributes.disadvantages && (
                                            <div>
                                                <span className="font-bold text-[10px] text-red-500 uppercase tracking-wider block mb-1">Disadvantages</span>
                                                <div className="flex flex-wrap gap-1">{person.mentalAttributes.disadvantages.map((a, i) => <span key={i} className="px-2 py-0.5 bg-red-900/20 text-red-300 text-[10px] rounded border border-red-900/50">{a}</span>)}</div>
                                            </div>
                                        )}
                                        {person.mentalAttributes.quirks && (
                                            <div>
                                                <span className="font-bold text-[10px] text-yellow-500 uppercase tracking-wider block mb-1">Quirks</span>
                                                <ul className="list-disc list-inside text-xs text-gray-400 space-y-0.5">
                                                    {person.mentalAttributes.quirks.map((q, i) => <li key={i}>{q}</li>)}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                ) : <div className="text-xs text-gray-600 italic py-2">No traits generated.</div>}
                            </SectionCard>
                            
                            <SectionCard title="Social Connections" data={person.social} type={JobType.ANALYZE_SOCIAL} icon={Users} objKey="social" onEditSection={onEditSection} onGenerate={onGenerate} /> 
                            
                            <div className="bg-gray-900 rounded-xl border border-gray-800 p-5"> 
                                <div className="flex justify-between items-start mb-4"> <h3 className="text-sm font-bold text-gray-200 flex items-center gap-2 uppercase tracking-wide"><Hand className="w-4 h-4 text-violet-500" /> Skills</h3> <div className="flex gap-2">{person.skills && <button onClick={() => onEditSection("Skills", "skills", person.skills)} className="p-1 text-gray-500 hover:text-white"><Pencil className="w-3 h-3" /></button>}<button onClick={() => onGenerate(JobType.ANALYZE_SKILLS)} className="text-[10px] font-bold text-violet-400 hover:text-white bg-gray-800 hover:bg-violet-600 px-2 py-1 rounded">Generate</button></div> </div> 
                                {person.skills ? ( 
                                    <div className="space-y-1">
                                        {person.skills.map((s, i) => (
                                            <div key={i} className="flex justify-between items-center text-xs border-b border-gray-800 pb-1 last:border-0">
                                                <span className="text-gray-300">{s.name}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] text-gray-500 uppercase font-mono">{s.attribute}</span>
                                                    <span className="font-bold text-white bg-gray-800 px-1.5 rounded min-w-[20px] text-center">{s.level}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div> 
                                ) : <div className="text-xs text-gray-600 italic">No skills.</div>} 
                            </div> 
                        </div> 
                        <div className="space-y-6"> 
                            <SectionCard title="Backstory" data={person.backstory} type={JobType.GENERATE_PERSON_BACKSTORY} icon={BookOpen} objKey="backstory" onEditSection={onEditSection} onGenerate={onGenerate} /> 
                            <SectionCard title="Spiritual" data={person.spiritualAttributes} type={JobType.ANALYZE_SPIRITUAL} icon={Flame} objKey="spiritualAttributes" onEditSection={onEditSection} onGenerate={onGenerate} /> 
                        </div> 
                    </div> 
                </div> 
            </div> 
        </div> 
    ); 
};
