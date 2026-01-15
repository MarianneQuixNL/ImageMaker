
import { Transformation } from '../types';

export const DEFAULT_TRANSFORMATIONS: Transformation[] = [
    {
        id: 'default_photo',
        name: 'To Photorealistic',
        enabled: true,
        applyToStyle: ['Any'],
        outputStyle: ['Photo', 'Photorealistic', '8k', 'Highly Detailed'],
        parts: { head: {}, torso: {}, left_arm: {}, right_arm: {}, left_leg: {}, right_leg: {}, feet: {}, full_body: {} },
        fullBody: { clothingItems: [], clothingStyle: '' },
        background: { mode: 'keep' },
        quality: '4K',
        isRandom: false
    },
    {
        id: 'default_engrave',
        name: 'To Laser Engraving',
        enabled: true,
        applyToStyle: ['Any'],
        outputStyle: ['Laser engraving', 'Woodcut', 'Monochrome', 'High Contrast'],
        parts: { head: {}, torso: {}, left_arm: {}, right_arm: {}, left_leg: {}, right_leg: {}, feet: {}, full_body: {} },
        fullBody: { clothingItems: [], clothingStyle: '' },
        background: { mode: 'keep' },
        aspectRatio: '1:1 (Square)',
        isRandom: false
    },
    {
        id: 'default_comic',
        name: 'To Comic Book',
        enabled: true,
        applyToStyle: ['Any'],
        outputStyle: ['Comic Book', 'Bold Lines', 'Vibrant Colors', 'Cel Shaded'],
        parts: { head: {}, torso: {}, left_arm: {}, right_arm: {}, left_leg: {}, right_leg: {}, feet: {}, full_body: {} },
        fullBody: { clothingItems: [], clothingStyle: '' },
        background: { mode: 'keep' },
        isRandom: false
    },
    {
        id: 'default_3d',
        name: 'To 3D Render',
        enabled: true,
        applyToStyle: ['Any'],
        outputStyle: ['3D Render', 'Unreal Engine 5', 'Octane Render', 'Ray Tracing'],
        parts: { head: {}, torso: {}, left_arm: {}, right_arm: {}, left_leg: {}, right_leg: {}, feet: {}, full_body: {} },
        fullBody: { clothingItems: [], clothingStyle: '' },
        background: { mode: 'keep' },
        quality: '4K',
        isRandom: false
    },
    {
        id: 'default_drawing',
        name: 'To Drawing',
        enabled: true,
        applyToStyle: ['Any'],
        outputStyle: ['Drawing', 'Pencil Sketch', 'Charcoal', 'Artistic'],
        parts: { head: {}, torso: {}, left_arm: {}, right_arm: {}, left_leg: {}, right_leg: {}, feet: {}, full_body: {} },
        fullBody: { clothingItems: [], clothingStyle: '' },
        background: { mode: 'keep' },
        isRandom: false
    },
    {
        id: 'default_anime',
        name: 'To Anime Style',
        enabled: true,
        applyToStyle: ['Any'],
        outputStyle: ['Anime', 'Studio Ghibli', 'Vibrant'],
        parts: { head: {}, torso: {}, left_arm: {}, right_arm: {}, left_leg: {}, right_leg: {}, feet: {}, full_body: {} },
        fullBody: { clothingItems: [], clothingStyle: '' },
        background: { mode: 'keep' },
        isRandom: false
    },
    {
        id: 'default_marble',
        name: 'To Marble Statue',
        enabled: true,
        applyToStyle: ['Any'],
        outputStyle: ['Marble Statue', 'Classical Sculpture', 'Stone Texture', 'Museum Lighting'],
        parts: { head: {}, torso: {}, left_arm: {}, right_arm: {}, left_leg: {}, right_leg: {}, feet: {}, full_body: {} },
        fullBody: { clothingItems: [], clothingStyle: '' },
        background: { mode: 'keep' },
        isRandom: false
    }
];
