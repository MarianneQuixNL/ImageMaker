import { GoogleGenAI, Schema, Type } from "@google/genai";
import { logger } from "./loggerService";
import { LogType, ModelType, LogSource, RPGStats, SocialRelations, CharacterPhysical, CharacterMental, CharacterSpiritual, CharacterBackstory, CharacterPossessions, SkillEntry, PartyMemberConfig } from "../types";
import { PROMPTS, fill } from "../constants/prompts";

// Helper to get AI instance.
const getAI = () => {
  try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) {
        logger.log("API Key is missing", LogType.ERROR, "Please select an API key using the button in the header.", LogSource.SYSTEM);
        throw new Error("API Key is missing");
      }
      return new GoogleGenAI({ apiKey });
  } catch (e: any) {
      console.error("Failed to initialize GoogleGenAI", e);
      throw new Error(`AI Initialization Failed: ${e.message}`);
  }
};

const SAFETY_SETTINGS = [
    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
    { category: 'HARM_CATEGORY_CIVIC_INTEGRITY', threshold: 'BLOCK_NONE' }
];

// Helper to sanitize aspect ratio strings to only valid values accepted by the API.
const sanitizeAspectRatio = (ratio: string | undefined): string | undefined => {
    if (!ratio || ratio === 'Original' || ratio === 'Default' || ratio === 'As-is') return undefined;
    
    const clean = ratio.split(' ')[0]; 
    const [wStr, hStr] = clean.split(':');
    const w = parseFloat(wStr);
    const h = parseFloat(hStr);
    
    if (isNaN(w) || isNaN(h)) return undefined;

    const targetVal = w / h;
    const validRatios = ['1:1', '2:3', '3:2', '3:4', '4:3', '4:5', '5:4', '9:16', '16:9', '21:9'];
    
    const ratioMap = validRatios.map(r => {
        const [rw, rh] = r.split(':').map(Number);
        return { str: r, val: rw / rh };
    });
    
    let closest = ratioMap[0];
    let minDiff = Math.abs(targetVal - closest.val);
    
    for (const r of ratioMap) {
        const diff = Math.abs(targetVal - r.val);
        if (diff < minDiff) {
            minDiff = diff;
            closest = r;
        }
    }
    
    return closest.str;
};

const formatImageData = (base64String: string) => {
    if (base64String.includes('base64,')) {
        const [header, data] = base64String.split('base64,');
        const mimeMatch = header.match(/data:(image\/[a-zA-Z0-9+.-]+);/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
        return { data, mimeType };
    }
    return { data: base64String, mimeType: 'image/png' };
};

const convertToPng = (base64String: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error("Canvas context failed"));
                return;
            }
            ctx.drawImage(img, 0, 0);
            const pngData = canvas.toDataURL('image/png');
            resolve(pngData);
        };
        img.onerror = () => reject(new Error("Failed to load image for conversion"));
        img.src = base64String;
    });
};

const resolveImageContent = async (input: string): Promise<{ data: string, mimeType: string }> => {
    if (!input) return { data: '', mimeType: 'image/png' };

    if (!input.startsWith('data:image') && !input.startsWith('blob:') && (input.includes(' ') || input.length < 100)) {
        throw new Error(`Invalid Image Data: Input appears to be text/invalid. First 50 chars: "${input.substring(0, 50)}..."`);
    }

    let fullBase64 = input;

    if (input.startsWith('blob:')) {
        try {
            const response = await fetch(input);
            if (!response.ok) throw new Error(`Failed to fetch blob: ${response.statusText}`);
            const blob = await response.blob();
            fullBase64 = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (e) {
            console.error("Failed to resolve blob URL", e);
            throw new Error("Failed to process image data from blob");
        }
    }
    
    if (fullBase64.includes('image/avif')) {
        try {
            fullBase64 = await convertToPng(fullBase64);
        } catch (e) {
            console.error("AVIF Conversion failed", e);
            throw new Error("Failed to convert AVIF image to PNG");
        }
    }

    return formatImageData(fullBase64);
};

const cleanJson = (text: string): string => {
    if (!text) return "";
    return text.replace(/```json\n?|```/g, '').trim();
};

export interface ServiceResult<T> {
    data: T;
    debug: {
        request: any;
        response: any;
    };
}

const logDebug = (source: LogSource, type: LogType, message: string, data: any) => {
    try {
        const details = JSON.stringify(data, (key, value) => {
            if (typeof value === 'string' && value.length > 500 && (value.startsWith('data:') || value.length > 2000)) {
                return value.substring(0, 10) + "..." + value.substring(value.length - 10) + ` [TRUNCATED ${value.length} chars]`;
            }
            return value;
        }, 2);
        logger.log(message, type, details, source);
    } catch (e) {
        logger.log(message, type, "Failed to stringify details", source);
    }
};

const getSystemInstruction = () => {
    return PROMPTS.system?.imageSystemInstruction || "You are an expert digital artist.";
};

// Generic generate content
export const generateContent = async (model: string, prompt: string, imageBase64?: string, schema?: Schema, aspectRatio?: string, quality?: string): Promise<ServiceResult<string>> => {
    try {
        const ai = getAI();
        const parts: any[] = [];
        if (imageBase64) {
            const { data, mimeType } = await resolveImageContent(imageBase64);
            parts.push({ inlineData: { mimeType, data } });
        }

        let finalPrompt = prompt;
        if (model.includes('image')) {
            finalPrompt = `${PROMPTS.common.imageSafetyPreamble}\n\n${prompt}`;
        }
        parts.push({ text: finalPrompt });

        const config: any = {
            safetySettings: SAFETY_SETTINGS,
        };

        // Handle specific long-form content requirements to prevent MAX_TOKENS errors
        const isLongForm = prompt.includes("2,500 words") || prompt.includes("deep dive") || prompt.includes("exhaustive");
        if (isLongForm && !model.includes('image')) {
            config.maxOutputTokens = 8192;
            // reserving thinking budget for reasoning models while ensuring output space
            if (model.includes('gemini-3') || model.includes('gemini-2.5')) {
                config.thinkingConfig = { thinkingBudget: 2048 };
            }
        }

        if (!model.includes('image')) {
            config.systemInstruction = getSystemInstruction();
        }

        if (schema && !model.includes('image')) {
            config.responseMimeType = "application/json";
            config.responseSchema = schema;
        }
        
        if (model.includes('image')) {
            config.imageConfig = config.imageConfig || {};
            if (aspectRatio) {
                const r = sanitizeAspectRatio(aspectRatio);
                if (r) config.imageConfig.aspectRatio = r;
            }
            if (quality && model.includes('pro')) {
                config.imageConfig.imageSize = quality; 
            }
        }

        const requestPayload = {
            model,
            contents: { parts },
            config
        };

        logDebug(LogSource.GEMINI, LogType.INFO, `Sending Request: ${model}`, requestPayload);

        const response = await ai.models.generateContent(requestPayload);
        logDebug(LogSource.GEMINI, LogType.SUCCESS, `Response Received: ${model}`, response);
        
        let imageResult = "";
        let textResult = "";

        // Improved part extraction to handle multi-part responses correctly
        if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    imageResult = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                } else if (part.text) {
                    textResult += part.text;
                }
            }
        }

        // Image generation specific validation
        if (model.includes('image') && !imageResult && !schema) {
            const firstCandidate = response.candidates?.[0];
            const finishReason = firstCandidate?.finishReason;
            const safetyRatings = firstCandidate?.safetyRatings;
            
            let errorMsg = "Image generation failed.";
            if (finishReason === 'SAFETY') {
                errorMsg = "The request was blocked by the safety filter.";
                if (safetyRatings) {
                    const triggered = safetyRatings.filter((r: any) => r.probability !== 'NEGLIGIBLE');
                    if (triggered.length > 0) {
                        errorMsg += " Triggered: " + triggered.map((r: any) => `${r.category} (${r.probability})`).join(', ');
                    }
                }
            } else if (finishReason === 'STOP' && !imageResult) {
                errorMsg = "Model refused to generate image (STOP) despite no safety block. This usually indicates an implicit content refusal. Try a different prompt.";
            } else if (finishReason) {
                errorMsg = `Model stopped with reason: ${finishReason}`;
            } else if (!response.candidates || response.candidates.length === 0) {
                errorMsg = "No candidates returned. The content was likely filtered immediately.";
            } else if (textResult) {
                errorMsg = `Refusal message from model: ${textResult}`;
            }

            throw new Error(errorMsg);
        }

        if (imageResult) {
            return {
                data: imageResult,
                debug: { request: requestPayload, response }
            };
        }

        if (!textResult && response.candidates?.[0]?.finishReason) {
             const reason = response.candidates[0].finishReason;
             if (reason === 'STOP') {
                 throw new Error(`Model Refusal: STOP. The model completed successfully but returned no text content. This often happens if the output was post-generation filtered or if the instructions were too restrictive.`);
             }
             if (reason === 'MAX_TOKENS') {
                 throw new Error(`Model Error: MAX_TOKENS. The response was too long and reached the model's limit.`);
             }
             throw new Error(`Model Error: ${reason}`);
        }

        return {
            data: textResult,
            debug: { request: requestPayload, response }
        };
    } catch (e: any) {
        logDebug(LogSource.GEMINI, LogType.ERROR, `API Error: ${e.message}`, { error: e, prompt });
        const enhancedError = new Error(e.message || "Unknown Gemini API Error");
        (enhancedError as any).debug = { request: { model, prompt }, response: e.response || e };
        throw enhancedError;
    }
};

export const generateCharacterSheet = async (sourceImage: string, templateImage: string, prompt: string, model: string = "gemini-3-pro-image-preview"): Promise<ServiceResult<string>> => {
    try {
        const ai = getAI();
        
        const source = await resolveImageContent(sourceImage);
        const template = await resolveImageContent(templateImage);

        const finalPrompt = `${PROMPTS.common.imageSafetyPreamble}\n\n${prompt}`;

        const parts: any[] = [
            { inlineData: { mimeType: source.mimeType, data: source.data } },
            { inlineData: { mimeType: template.mimeType, data: template.data } },
            { text: finalPrompt }
        ];

        const config: any = {
            safetySettings: SAFETY_SETTINGS,
            imageConfig: {
                aspectRatio: "4:3",
                imageSize: "4K"
            }
        };

        const requestPayload = {
            model,
            contents: { parts },
            config
        };

        logDebug(LogSource.GEMINI, LogType.INFO, `Generate Char Sheet: ${model}`, requestPayload);

        const response = await ai.models.generateContent(requestPayload);
        logDebug(LogSource.GEMINI, LogType.SUCCESS, `Char Sheet Success`, response);
        
        let imageResult = "";
        let textResult = "";
        
        if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    imageResult = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                } else if (part.text) {
                    textResult += part.text;
                }
            }
        }
        
        if (!imageResult) {
             const finishReason = response.candidates?.[0]?.finishReason;
             let msg = finishReason ? `Safety Block: ${finishReason}` : "No image generated.";
             if (textResult) msg += `\nModel Message: ${textResult}`;
             throw new Error(msg);
        }
        return { data: imageResult, debug: { request: requestPayload, response } };
    } catch (e: any) {
        logDebug(LogSource.GEMINI, LogType.ERROR, `Char Sheet Error: ${e.message}`, { error: e });
        const enhancedError = new Error(e.message || "Char Sheet Generation Failed");
        (enhancedError as any).debug = e.debug || { response: e };
        throw enhancedError;
    }
};

export const generateImageFromPrompt = async (prompt: string, negativePrompt?: string): Promise<ServiceResult<string>> => {
    try {
        const ai = getAI();
        const model = 'imagen-4.0-generate-001';
        
        let finalPrompt = `${PROMPTS.common.imageSafetyPreamble}\n\n${prompt}`;
        if (negativePrompt) {
            finalPrompt += ` --no ${negativePrompt}`; 
        }
        
        const requestPayload = {
            model,
            prompt: finalPrompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '1:1',
            }
        };

        logDebug(LogSource.IMAGEN, LogType.INFO, `Sending Imagen Request`, requestPayload);

        const response = await ai.models.generateImages(requestPayload);
        logDebug(LogSource.IMAGEN, LogType.SUCCESS, `Imagen Response`, response);
        
        const base64EncodeString = response.generatedImages?.[0]?.image?.imageBytes;
        if (!base64EncodeString) {
            throw new Error("No image bytes returned from Imagen.");
        }
        
        const imageUrl = `data:image/jpeg;base64,${base64EncodeString}`;
        return {
            data: imageUrl,
            debug: { request: requestPayload, response }
        };
    } catch (e: any) {
        logDebug(LogSource.IMAGEN, LogType.ERROR, `Imagen Error: ${e.message}`, { error: e, prompt });
        const enhancedError = new Error(e.message || "Imagen Generation Failed");
        (enhancedError as any).debug = { response: e };
        throw enhancedError;
    }
};

export const suggestVideoPrompt = async (base64Image: string): Promise<ServiceResult<string>> => {
    const prompt = PROMPTS.analysis?.suggestVideo || "Analyze this image.";
    return await generateContent("gemini-3-flash-preview", prompt, base64Image);
};

export const generateVideo = async (base64Image: string, prompt: string, model: string, resolution: '720p' | '1080p', aspectRatio: '16:9' | '9:16'): Promise<ServiceResult<string>> => {
    try {
        const ai = getAI();
        
        const { data, mimeType } = await resolveImageContent(base64Image);
        
        const requestPayload = {
            model,
            prompt,
            image: {
                imageBytes: data,
                mimeType: mimeType
            },
            config: {
                numberOfVideos: 1,
                resolution: resolution,
                aspectRatio: aspectRatio
            }
        };

        logDebug(LogSource.VEO, LogType.INFO, `Starting Video Gen`, requestPayload);

        let operation = await ai.models.generateVideos(requestPayload);
        
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }
        
        logDebug(LogSource.VEO, LogType.SUCCESS, `Video Gen Complete`, operation);

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) {
            throw new Error("Video generation completed but no URI returned.");
        }

        const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        
        if (!videoResponse.ok) {
            throw new Error(`Failed to download video bytes: ${videoResponse.statusText}`);
        }

        const blob = await videoResponse.blob();
        
        return {
            data: URL.createObjectURL(blob),
            debug: { request: requestPayload, response: operation }
        };

    } catch (e: any) {
        logDebug(LogSource.VEO, LogType.ERROR, `Video Error: ${e.message}`, { error: e });
        const enhancedError = new Error(e.message || "Video Generation Failed");
        (enhancedError as any).debug = { response: e };
        throw enhancedError;
    }
};

export const rephrasePromptForSafety = async (originalPrompt: string, base64Image: string): Promise<string> => {
    logger.log("Analyzing prohibited prompt for safety fix...", LogType.INFO, undefined, LogSource.GEMINI);
    const prompt = fill(PROMPTS.analysis?.rephraseSafety || "{{originalPrompt}}", { originalPrompt });
    const { data } = await generateContent("gemini-3-flash-preview", prompt, base64Image);
    return data;
};

export const sanitizeAndEnhancePrompt = async (originalPrompt: string): Promise<string> => {
    logger.log("Sanitizing and enhancing prompt...", LogType.INFO, undefined, LogSource.GEMINI);
    const prompt = fill(PROMPTS.analysis?.safeEnhance || "{{originalPrompt}}", { originalPrompt });
    const { data } = await generateContent("gemini-3-flash-preview", prompt);
    return data;
};

export const analyzePromptSafety = async (originalPrompt: string, errorMsg?: string): Promise<{ analysis: string, fixedPrompt: string }> => {
    const prompt = fill(PROMPTS.analysis?.analyzeSafety || "{{originalPrompt}}", { errorMsg: errorMsg || 'Unknown Safety Block', originalPrompt });

    const schema: Schema = {
        type: Type.OBJECT,
        properties: {
            analysis: { type: Type.STRING },
            fixedPrompt: { type: Type.STRING }
        },
        required: ["analysis", "fixedPrompt"]
    };

    const { data } = await generateContent("gemini-3-flash-preview", prompt, undefined, schema);
    return JSON.parse(cleanJson(data));
};

export const detectImageStyle = async (base64Image: string, prompt: string, model: string = "gemini-3-flash-preview"): Promise<ServiceResult<string>> => {
    const result = await generateContent(model, prompt, base64Image);
    result.data = result.data.replace(/\*/g, '').trim();
    return result;
};

export const performSafetyCheck = async (base64Image: string, prompt: string, model: string = "gemini-3-flash-preview"): Promise<ServiceResult<string>> => {
    return await generateContent(model, prompt, base64Image);
};

export const performFullVisionAnalysis = async (base64Image: string, prompt: string, model: string = "gemini-3-pro-preview"): Promise<ServiceResult<string>> => {
    const result = await generateContent(model, prompt, base64Image);
    return result;
};

export const generateStory = async (base64Image: string, prompt: string, model: string = "gemini-3-pro-preview"): Promise<ServiceResult<string>> => {
    const result = await generateContent(model, prompt, base64Image);
    return result;
};

export const generatePersona = async (base64Image: string, prompt: string, model: string = "gemini-3-pro-preview"): Promise<ServiceResult<{ firstName: string, lastName: string, filename: string, markdown: string }>> => {
    const schema: Schema = {
        type: Type.OBJECT,
        properties: {
            firstName: { type: Type.STRING },
            lastName: { type: Type.STRING },
            filename: { type: Type.STRING },
            markdown: { type: Type.STRING }
        },
        required: ["firstName", "lastName", "filename", "markdown"]
    };

    const { data, debug } = await generateContent(model, prompt, base64Image, schema);
    try {
        return { data: JSON.parse(cleanJson(data)), debug };
    } catch (e) {
        return { data: { firstName: "Unknown", lastName: "Person", filename: "Unknown.Person.md", markdown: data }, debug };
    }
};

export const countPeople = async (base64Image: string, prompt: string, model: string = "gemini-3-flash-preview"): Promise<ServiceResult<{ count: number; people: { description: string; box_2d: number[]; age: number; gender: 'Male' | 'Female' | 'Unknown'; name: string }[] }>> => {
    const schema: Schema = {
        type: Type.OBJECT,
        properties: {
            count: { type: Type.INTEGER },
            people: { 
                type: Type.ARRAY, 
                items: { 
                    type: Type.OBJECT, 
                    properties: {
                        description: { type: Type.STRING },
                        box_2d: { type: Type.ARRAY, items: { type: Type.INTEGER } },
                        age: { type: Type.INTEGER, description: "Estimated age of the person" },
                        gender: { type: Type.STRING, enum: ['Male', 'Female', 'Unknown'], description: "Biological sex/gender presentation"},
                        name: { type: Type.STRING, description: "Assigned First and Last Name" }
                    }
                } 
            }
        },
        required: ["count", "people"]
    };
    
    const { data, debug } = await generateContent(model, prompt, base64Image, schema);
    try {
        return { data: JSON.parse(cleanJson(data)), debug };
    } catch (e) {
        return { data: { count: 0, people: [] }, debug };
    }
};

export const generateFilename = async (base64Image: string, prompt: string, model: string = "gemini-3-flash-preview"): Promise<ServiceResult<{ filename: string, folder_path: string }>> => {
    const schema: Schema = {
        type: Type.OBJECT,
        properties: {
            filename: { type: Type.STRING },
            folder_path: { type: Type.STRING, description: "Format: /Type/Setting/Location/Clothing" }
        },
        required: ["filename", "folder_path"]
    };

    const { data, debug } = await generateContent(model, prompt, base64Image, schema);
    try {
        return { data: JSON.parse(cleanJson(data)), debug };
    } catch (e) {
        return { data: { filename: "unknown_image", folder_path: "/Unknown/Unknown/Unknown/Unknown" }, debug };
    }
};

export const describeImage = async (base64Image: string, prompt: string, model: string = "gemini-3-flash-preview"): Promise<ServiceResult<{ description: string }>> => {
    const schema: Schema = {
        type: Type.OBJECT,
        properties: {
            description: { type: Type.STRING }
        },
        required: ["description"]
    };

    const { data, debug } = await generateContent(model, prompt, base64Image, schema);
    return { data: JSON.parse(cleanJson(data)), debug };
};

export const generateSDPrompt = async (base64Image: string, prompt: string, model: string = "gemini-3-flash-preview"): Promise<ServiceResult<{ prompt: string, negativePrompt: string, suggestions: string }>> => {
    const schema: Schema = {
        type: Type.OBJECT,
        properties: {
            prompt: { type: Type.STRING },
            negativePrompt: { type: Type.STRING },
            suggestions: { type: Type.STRING }
        },
        required: ["prompt", "negativePrompt", "suggestions"]
    };

    const { data, debug } = await generateContent(model, prompt, base64Image, schema);
    try {
        return { data: JSON.parse(cleanJson(data)), debug };
    } catch (e) {
        return { data: { prompt: "", negativePrompt: "", suggestions: "" }, debug };
    }
};

export const analyzeClothingLayers = async (base64Image: string, prompt: string, model: string = "gemini-3-flash-preview"): Promise<ServiceResult<{ items: string[] }>> => {
    const schema: Schema = {
        type: Type.OBJECT,
        properties: {
            items: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["items"]
    };

    const { data, debug } = await generateContent(model, prompt, base64Image, schema);
    try {
        return { data: JSON.parse(cleanJson(data)), debug };
    } catch (e) {
        return { data: { items: [] }, debug };
    }
};

export const cropImage = async (base64Image: string, box_2d: number[], padding: number = 0): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const [ymin, xmin, ymax, xmax] = box_2d;
            
            const x = (xmin / 1000) * img.width;
            const y = (ymin / 1000) * img.height;
            const w = ((xmax - xmin) / 1000) * img.width;
            const h = ((ymax - ymin) / 1000) * img.height;

            const sx = Math.max(0, x - padding);
            const sy = Math.max(0, y - padding);
            const sw = Math.min(img.width - sx, w + (padding * 2));
            const sh = Math.min(img.height - sy, h + (padding * 2));

            canvas.width = sw;
            canvas.height = sh;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject("Canvas context failed");
                return;
            }
            
            ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = (e) => reject(e);
        img.src = base64Image;
    });
};

export const editImage = async (base64Image: string, prompt: string, model: string, aspectRatio?: string, quality?: string): Promise<ServiceResult<string>> => {
    return await generateContent(model, prompt, base64Image, undefined, aspectRatio, quality);
};

export const combineImages = async (images: string[], prompt: string, aspectRatio?: string): Promise<ServiceResult<string>> => {
    try {
        const ai = getAI();
        const parts: any[] = [];
        
        const resolvedImages = await Promise.all(images.map(img => resolveImageContent(img)));

        resolvedImages.forEach(({ data, mimeType }) => {
            parts.push({ inlineData: { mimeType, data } });
        });
        
        const finalPrompt = `${PROMPTS.common.imageSafetyPreamble}\n\n${prompt}`;
        parts.push({ text: finalPrompt });

        const config: any = {
            safetySettings: SAFETY_SETTINGS,
        };
        
        if (aspectRatio) {
            const r = sanitizeAspectRatio(aspectRatio);
            if (r) config.imageConfig = { aspectRatio: r };
        }

        const requestPayload = {
            model: 'gemini-2.5-flash-image', 
            contents: { parts },
            config
        };

        logDebug(LogSource.GEMINI, LogType.INFO, `Combine Images`, requestPayload);

        const response = await ai.models.generateContent(requestPayload);
        let imageResult = "";
        let textResult = "";

        if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    imageResult = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                } else if (part.text) {
                    textResult += part.text;
                }
            }
        }
        if (!imageResult) {
             const finishReason = response.candidates?.[0]?.finishReason;
             let msg = finishReason ? `Safety Block: ${finishReason}` : "No image generated.";
             if (textResult) msg += `\nModel Message: ${textResult}`;
             throw new Error(msg);
        }
        return { data: imageResult, debug: { request: requestPayload, response } };
    } catch (e: any) {
        logDebug(LogSource.GEMINI, LogType.ERROR, `Combine Error: ${e.message}`, { error: e });
        const enhancedError = new Error(e.message || "Combine Images Failed");
        (enhancedError as any).debug = { response: e };
        throw enhancedError;
    }
};

export const mirrorImage = async (base64Image: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) { reject("Canvas error"); return; }
            
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = reject;
        img.src = base64Image;
    });
};

const runExtraction = async (prompt: string, schema: Schema, base64Image: string, model: string) => {
    const { data, debug } = await generateContent(model, prompt, base64Image, schema);
    try {
        return { data: JSON.parse(cleanJson(data)), debug };
    } catch (e) {
        return { data: {}, debug };
    }
};

export const extractPose = (base64Image: string, model: string) => runExtraction(
    PROMPTS.analysis?.extractPose || "Analyze the pose of the main subject. Return a JSON object describing the position of head, torso, arms, and legs. Also suggest a filename.",
    {
        type: Type.OBJECT,
        properties: {
            filename: { type: Type.STRING },
            head: { type: Type.STRING },
            torso: { type: Type.STRING },
            left_arm: { type: Type.STRING },
            right_arm: { type: Type.STRING },
            left_leg: { type: Type.STRING },
            right_leg: { type: Type.STRING }
        },
        required: ["head", "torso"]
    },
    base64Image, model
);

export const extractClothes = (base64Image: string, prompt: string, model: string) => runExtraction(
    prompt,
    {
        type: Type.OBJECT,
        properties: {
            clothing_items: { 
                type: Type.ARRAY, 
                items: { 
                    type: Type.OBJECT,
                    properties: {
                        type: { type: Type.STRING },
                        color: { type: Type.STRING },
                        material: { type: Type.STRING }
                    }
                }
            }
        },
        required: ["clothing_items"]
    },
    base64Image, model
);

export const extractHair = (base64Image: string, model: string) => runExtraction(
    PROMPTS.analysis?.extractHair || "Analyze the hair. Describe color, style, length.",
    {
        type: Type.OBJECT,
        properties: {
            color: { type: Type.STRING },
            style: { type: Type.STRING },
            length: { type: Type.STRING }
        },
        required: ["color", "style"]
    },
    base64Image, model
);

export const extractHead = (base64Image: string, model: string) => runExtraction(
    PROMPTS.analysis?.extractHead || "Analyze the head/face. Describe shape, eyes, skin color.",
    {
        type: Type.OBJECT,
        properties: {
            shape: { type: Type.STRING },
            eyes: { type: Type.STRING },
            skin_color: { type: Type.STRING }
        },
        required: ["shape", "eyes"]
    },
    base64Image, model
);

export const analyzeRPGStats = async (base64Image: string, prompt: string, model: string = "gemini-3-flash-preview"): Promise<ServiceResult<RPGStats>> => {
    const schema: Schema = {
        type: Type.OBJECT,
        properties: {
            strength: { type: Type.INTEGER },
            dexterity: { type: Type.INTEGER },
            constitution: { type: Type.INTEGER },
            intelligence: { type: Type.INTEGER },
            wisdom: { type: Type.INTEGER },
            charisma: { type: Type.INTEGER }
        },
        required: ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"]
    };

    const { data, debug } = await generateContent(model, prompt, base64Image, schema);
    try {
        return { data: JSON.parse(cleanJson(data)), debug };
    } catch (e) {
        return { data: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 }, debug };
    }
};

export const analyzeSkills = async (base64Image: string, prompt: string, model: string = "gemini-3-flash-preview"): Promise<ServiceResult<SkillEntry[]>> => {
    const schema: Schema = {
        type: Type.OBJECT,
        properties: {
            skills: { 
                type: Type.ARRAY, 
                items: { 
                    type: Type.OBJECT, 
                    properties: {
                        name: { type: Type.STRING },
                        attribute: { type: Type.STRING },
                        level: { type: Type.INTEGER }
                    }
                } 
            }
        },
        required: ["skills"]
    };

    const { data, debug } = await generateContent(model, prompt, base64Image, schema);
    try {
        const parsed = JSON.parse(cleanJson(data));
        return { data: parsed.skills || [], debug };
    } catch (e) {
        return { data: [], debug };
    }
};

export const analyzeSocialRelations = async (base64Image: string, prompt: string, model: string = "gemini-3-flash-preview"): Promise<ServiceResult<SocialRelations>> => {
    const schema: Schema = {
        type: Type.OBJECT,
        properties: {
            family: { type: Type.ARRAY, items: { type: Type.STRING } },
            friends: { type: Type.ARRAY, items: { type: Type.STRING } },
            enemies: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["family", "friends", "enemies"]
    };

    const { data, debug } = await generateContent(model, prompt, base64Image, schema);
    try {
        return { data: JSON.parse(cleanJson(data)), debug };
    } catch (e) {
        return { data: { family: [], friends: [], enemies: [] }, debug };
    }
};

export const analyzePhysical = async (base64Image: string, prompt: string, model: string): Promise<ServiceResult<CharacterPhysical>> => {
    const schema: Schema = {
        type: Type.OBJECT,
        properties: {
            height_build: { type: Type.STRING },
            hair: { type: Type.STRING },
            eyes: { type: Type.STRING },
            skin: { type: Type.STRING },
            distinctive_features: { type: Type.ARRAY, items: { type: Type.STRING } },
            clothing_style: { type: Type.STRING }
        },
        required: ["height_build", "hair", "eyes", "skin", "distinctive_features", "clothing_style"]
    };
    const { data, debug } = await generateContent(model, prompt, base64Image, schema);
    return { data: JSON.parse(cleanJson(data)), debug };
};

export const analyzeMental = async (base64Image: string, prompt: string, model: string): Promise<ServiceResult<CharacterMental>> => {
    const schema: Schema = {
        type: Type.OBJECT,
        properties: {
            personality_archetype: { type: Type.STRING },
            emotional_state: { type: Type.STRING },
            social_alignment: { type: Type.STRING },
            advantages: { type: Type.ARRAY, items: { type: Type.STRING } },
            disadvantages: { type: Type.ARRAY, items: { type: Type.STRING } },
            quirks: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["personality_archetype", "emotional_state", "social_alignment", "advantages", "disadvantages", "quirks"]
    };
    const { data, debug } = await generateContent(model, prompt, base64Image, schema);
    return { data: JSON.parse(cleanJson(data)), debug };
};

export const analyzeSpiritual = async (base64Image: string, prompt: string, model: string): Promise<ServiceResult<CharacterSpiritual>> => {
    const schema: Schema = {
        type: Type.OBJECT,
        properties: {
            belief_system: { type: Type.STRING },
            karma: { type: Type.STRING },
            spirit_animal_totem: { type: Type.STRING },
            soul_description: { type: Type.STRING }
        },
        required: ["belief_system", "karma", "spirit_animal_totem", "soul_description"]
    };
    const { data, debug } = await generateContent(model, prompt, base64Image, schema);
    return { data: JSON.parse(cleanJson(data)), debug };
};

export const analyzeBackstory = async (base64Image: string, prompt: string, model: string): Promise<ServiceResult<CharacterBackstory>> => {
    const schema: Schema = {
        type: Type.OBJECT,
        properties: {
            origin_place: { type: Type.STRING },
            key_life_event: { type: Type.STRING },
            current_motivation: { type: Type.STRING },
            secret: { type: Type.STRING },
            short_biography: { type: Type.STRING }
        },
        required: ["origin_place", "key_life_event", "current_motivation", "secret", "short_biography"]
    };
    const { data, debug } = await generateContent(model, prompt, base64Image, schema);
    return { data: JSON.parse(cleanJson(data)), debug };
};

export const analyzePossessions = async (base64Image: string, prompt: string, model: string): Promise<ServiceResult<CharacterPossessions>> => {
    const schema: Schema = {
        type: Type.OBJECT,
        properties: {
            equipped_items: { type: Type.ARRAY, items: { type: Type.STRING } },
            carried_inventory: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["equipped_items", "carried_inventory"]
    };
    const { data, debug } = await generateContent(model, prompt, base64Image, schema);
    return { data: JSON.parse(cleanJson(data)), debug };
};

export const describeParty = async (base64Image: string, partyList: PartyMemberConfig[], model: string = "gemini-3-pro-preview"): Promise<ServiceResult<string>> => {
    const partyDescription = partyList.map((p, i) => 
        `${i + 1}. [${p.gender}] [${p.species}] [${p.class}] (${p.wealth})`
    ).join('\n');

    const prompt = fill(PROMPTS.analysis?.describeParty, { partyList: partyDescription });
    const { data, debug } = await generateContent(model, prompt, base64Image);
    return { data, debug };
};