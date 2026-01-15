
import { SPECIES_CATEGORIES } from './speciesOptions';
export { SPECIES_CATEGORIES };

import { CLOTHING_BY_SETTING as CLOTHING_DATA, BARE_COVERAGE_OPTIONS as BARE_DATA, FULL_BODY_STYLES as FULL_BODY_DATA } from './clothingOptions';

import { JewelryStyles, PropStyles, DirtTypes, SkinMarkingStyles, RestraintOptions, ExtraEffectOptions } from '../Other/Nodes/general';
import { TRANSPARENCY_OPTIONS as TRANS_DATA } from './transparencyOptions';
import { WORLD_TREE } from '../Worlds/worldRegistry'; // Replaces SETTINGS_CATEGORIES logic
import { BODY_SHAPE_TREE } from '../BodyShapes/bodyShapeRegistry'; // For Body Parts if needed, but here we use specific constants

export const CLOTHING_BY_SETTING = CLOTHING_DATA;
export const FULL_BODY_STYLES = FULL_BODY_DATA;
export const BARE_COVERAGE_OPTIONS = BARE_DATA;

export const JEWELRY_STYLES = JewelryStyles;
export const PROP_STYLES = PropStyles;
export const DIRT_TYPES = DirtTypes;
export const SKIN_MARKING_STYLES = SkinMarkingStyles;

export const SETTINGS_CATEGORIES: any = WORLD_TREE;

export const SETTINGS: string[] = []; // Derived

export const CAMERA_POSITIONS: string[] = [
    "Back View", "Bird's Eye View", "Close Up", "Dutch Angle", "Full Body", "High Angle", "Knees Up", 
    "Low Angle", "Over the Shoulder", "Portrait (Head & Shoulders)", "Side Profile (Left)", 
    "Side Profile (Right)", "Waist Up", "Wide Angle", "Worm's Eye View"
];

export const BODY_SURFACE_OPTIONS: string[] = [
    "Bandaged", "Body Paint (Black)", "Body Paint (Blue)", "Body Paint (Gold)", "Body Paint (Red)", 
    "Body Paint (Silver)", "Body Paint (Tribal)", "Body Paint (White)", "Clean Skin", "Covered in Ash", 
    "Covered in Blood (Fake/Artistic)", "Covered in Dirt", "Covered in Dust", "Covered in Glitter", 
    "Covered in Mud", "Covered in Oil", "Covered in Slime", "Covered in Soot", "Cybernetic / Robotic", 
    "Fur / Hairy", "Jewelry / Adorned", "Petrified / Stone", "Plastic / Mannequin", "Scaly", "Scarred", 
    "Tattooed (Blackwork)", "Tattooed (Colorful)", "Tattooed (Tribal)", "Wet / Sweaty", "Wet / Water Drops"
];

export const BODY_PART_OPTIONS: any = {
    "head": ["Bandana", "Bare", "Crown", "Cybernetic Implants", "Glasses", "Hat", "Helmet", "Hood", "Mask", "Tattooed Face"],
    "feet": ["Anklets (Barefoot)", "Barefoot", "Boots", "Cybernetic", "Dress Shoes", "Heels", "Sandals", "Sneakers", "Socks"],
    "torso": [], "left_arm": [], "right_arm": [], "left_leg": [], "right_leg": [], "full_body": []
};

export const STYLE_OPTIONS: string[] = [
    "3D Render", "Anime", "Comic Book", "Diagram", "Digital Art", "Drawing", "Laser engraving", "Line Art", "Oil Painting", 
    "Other", "Painting", "Photo", "Sketch", "Watercolor"
];

export const ASPECT_RATIOS: string[] = [
    "1:1 (Square)", "3:4 (Portrait)", "4:3 (Standard)", "9:16 (Story)", "16:9 (Widescreen)", "21:9 (Cinematic)", "Original"
];

export const TIME_OPTIONS: string[] = [
    "Afternoon", "Blue Hour", "Dawn / Sunrise", "Evening", "Golden Hour", "Midnight", "Morning", "Noon", "Sunset / Dusk", "Twilight"
];

export const WEATHER_OPTIONS: string[] = [
    "Clear", "Cloudy", "Foggy / Misty", "Hail", "Overcast", "Rain (Heavy)", "Rain (Light)", "Snow (Blizzard)", "Snow (Light)", "Stormy / Thunderstorm", "Windy"
];

export const MOOD_OPTIONS: string[] = [
    "Angry / Aggressive", "Calm / Peaceful", "Dark / Gritty", "Dreamy / Surreal", "Eerie / Creepy", "Energetic / Dynamic", "Happy / Cheerful", "Hopeful", "Mysterious", "Romantic", "Sad / Melancholic", "Tense / Suspenseful"
];

export const GENDER_OPTIONS: string[] = [
    "Agender", "Androgynous", "Female", "Genderfluid", "Male", "Non-binary", "Robot/Genderless", "Transgender"
];

export const ANIMALS_CATEGORIES: any = {
    "Carnivores": {
      "Felines": ["Lion", "Tiger", "Leopard", "Panther", "Jaguar", "Sabretooth Tiger", "Cheetah", "Cougar"],
      "Canines": ["Wolf", "Fox", "Coyote", "Jackal", "Husky", "Wild Dog"],
      "Others": ["Polar Bear", "Grizzly Bear", "Hyena", "Shark (Great White)", "Killer Whale"]
    },
    "Herbivores": {
      "Large": ["Elephant", "Mammoth", "Rhino", "Hippo", "Giraffe", "Brachiosaurus"],
      "Ungulates": ["Horse", "Zebra", "Deer", "Moose", "Cow", "Bison", "Unicorn (Horse-like)"],
      "Small": ["Rabbit", "Beaver", "Squirrel", "Capybara"]
    },
    "Omnivores": {
      "General": ["Pig", "Boar", "Raccoon", "Badger", "Chimpanzee", "Gorilla"]
    },
    "Birds": {
      "Raptors": ["Eagle", "Hawk", "Falcon", "Owl"],
      "Exotic": ["Parrot", "Flamingo", "Peacock", "Toucan"],
      "Flightless": ["Penguin", "Ostrich", "Cassowary"],
      "Mythical": ["Phoenix", "Griffin", "Roc"]
    },
    "Reptiles & Dinosaurs": {
      "Dinosaurs": ["T-Rex", "Raptor", "Triceratops", "Stegosaurus", "Pterodactyl", "Spinosaurus"],
      "Modern": ["Crocodile", "Komodo Dragon", "Python", "Cobra", "Turtle"],
      "Mythical": ["Dragon (Western)", "Dragon (Eastern)", "Wyvern", "Hydra", "Basilisk"]
    },
    "Mythical & Fantastic": {
      "Equine": ["Unicorn", "Pegasus", "Nightmare"],
      "Hybrids": ["Manticore", "Chimera", "Cerberus", "Sphinx"],
      "Aquatic": ["Kraken", "Leviathan", "Sea Serpent"]
    }
};

export const OBJECTS_CATEGORIES: any = {
    "Vehicles": {
      "Land": ["Sports Car", "Muscle Car", "SUV", "Truck", "Tank", "Motorcycle", "Bicycle", "Bus", "F1 Car"],
      "Air": ["Fighter Jet", "Airliner", "Helicopter", "Biplane", "Drone", "Airship / Zeppelin"],
      "Sea": ["Yacht", "Speedboat", "Sailboat", "Cruise Ship", "Submarine", "Aircraft Carrier"],
      "Sci-Fi": ["Spaceship", "UFO", "Hovercar", "Mech Walker"]
    },
    "Weapons": {
      "Melee": ["Katana", "Longsword", "Greatsword", "Battle Axe", "Warhammer", "Spear", "Dagger", "Lightsaber"],
      "Ranged": ["Pistol", "Revolver", "Assault Rifle", "Sniper Rifle", "Shotgun", "Sci-Fi Blaster", "Bow & Arrow", "Crossbow"],
      "Heavy": ["Rocket Launcher", "Minigun", "Flamethrower", "Cannon"]
    },
    "Furniture & Interior": {
      "Seating": ["Office Chair", "Gaming Chair", "Wingback Chair", "Sofa", "Throne", "Bar Stool"],
      "Tables": ["Dining Table", "Coffee Table", "Desk", "Workbench"],
      "Storage": ["Bookshelf", "Wardrobe", "Chest", "Cabinet"],
      "Decor": ["Lamp", "Chandelier", "Rug", "Mirror", "Painting"]
    },
    "Tech & Gadgets": {
      "Computing": ["Gaming PC", "Laptop", "Server Rack", "Holographic Terminal"],
      "Robotics": ["Industrial Robot Arm", "Service Droid", "Cybernetic Eye"],
      "Everyday": ["Smartphone", "Camera", "Headphones", "Watch"]
    },
    "Miscellaneous": {
      "Statues": ["Marble Statue", "Bronze Statue", "Mannequin", "Gargoyle"],
      "Toys": ["Action Figure", "Doll", "Teddy Bear", "Lego Structure"],
      "Food": ["Burger", "Pizza", "Cake", "Fruit Basket", "Fancy Dinner"]
    }
};

export const SPECIES_OPTIONS: string[] = []; // Derived
export const ANIMALS_OPTIONS: string[] = []; // Derived
export const OBJECTS_OPTIONS: string[] = []; // Derived

export const HAIR_STYLES_NESTED: any = {
    "Short": ["Bald", "Buzz Cut", "Crew Cut", "Pixie Cut", "Short Back and Sides", "Fade", "Caesar Cut"],
    "Medium": ["Bob Cut", "Shag", "Mullet", "Layered", "Curtains"],
    "Long": ["Straight Long", "Wavy Long", "Curly Long", "Layered Long"],
    "Updo/Tied": ["Ponytail (High)", "Ponytail (Low)", "Bun (Messy)", "Bun (Tight)", "Top Knot", "Twin Tails", "Updo (Elegant)"],
    "Braids/Locs": ["Cornrows", "Dreadlocks", "Box Braids", "French Braid", "Braided Ponytail"],
    "Unique": ["Afro", "Mohawk", "Faux Hawk", "Spiky", "Slicked Back", "Beehive", "Undercut"]
};
export const HAIR_STYLES: string[] = []; // Derived

export const HAIR_COLORS_NESTED: any = {
    "Black": ["Jet Black", "Soft Black", "Blue-Black"],
    "Brown": ["Dark Brown", "Chocolate", "Chestnut", "Light Brown", "Ash Brown"],
    "Blonde": ["Platinum", "Ash Blonde", "Golden Blonde", "Dirty Blonde", "Strawberry Blonde"],
    "Red/Ginger": ["Bright Red", "Ginger", "Auburn", "Burgundy", "Copper"],
    "Grey/White": ["Silver", "Grey", "White", "Salt and Pepper"],
    "Unnatural": ["Electric Blue", "Midnight Blue", "Emerald Green", "Lime Green", "Hot Pink", "Pastel Pink", "Purple", "Lavender", "Teal", "Orange", "Yellow"],
    "Multi": ["Ombre", "Rainbow", "Highlights", "Two-Tone", "Rooted"]
};
export const HAIR_COLORS: string[] = []; // Derived

export const SKIN_COLORS: string[] = [
    "Albino", "Beige", "Black (Dark)", "Blue (Light / Avatar)", "Blue (Navy)", "Bronze", "Brown (Dark)", 
    "Brown (Light)", "Brown (Medium)", "Copper", "Ebony", "Fair / Pale", "Gold (Metallic)", "Green (Alien)", 
    "Green (Olive)", "Grey / Gray", "Ivory", "Orange", "Pinkish", "Porcelain", "Purple", "Red (Demon/Alien)", 
    "Silver (Metallic)", "Tan", "Tan Lines", "Transparent / Ghostly", "Vitiligo", "White (Chalk)"
];

export const EYE_COLORS_NESTED: any = {
    "Blue": ["Ice Blue", "Deep Blue", "Baby Blue", "Steel Blue"],
    "Brown": ["Light Brown", "Dark Brown", "Hazel", "Amber", "Honey"],
    "Green": ["Emerald", "Forest Green", "Olive", "Sea Green"],
    "Grey": ["Silver", "Charcoal", "Cloudy Grey"],
    "Unnatural": ["Red", "Pink", "Purple", "Violet", "Yellow", "Orange", "Gold", "White (Blind)", "Black (Solid)"],
    "Heterochromia": ["Blue & Brown", "Green & Blue", "Left: Blue, Right: Green", "Left: Green, Right: Blue", "Red & Black"]
};
export const EYE_COLORS: string[] = []; // Derived

export const RESTRAINT_OPTIONS = RestraintOptions;
export const EXTRA_EFFECT_OPTIONS = ExtraEffectOptions;
export const TRANSPARENCY_OPTIONS = TRANS_DATA;

const flattenDeep = (obj: any): string[] => {
    if (Array.isArray(obj)) return obj;
    return Object.values(obj).flatMap(v => flattenDeep(v));
};

export const updateDerivedTransformationOptions = () => {
    // Populate SETTINGS from SETTINGS_CATEGORIES
    if(Object.keys(SETTINGS_CATEGORIES).length > 0) {
        SETTINGS.length = 0;
        SETTINGS.push(...Object.values(SETTINGS_CATEGORIES).flatMap((cat: any) => Object.values(cat).flat()).sort() as string[]);
    }

    // Populate derived arrays
    SPECIES_OPTIONS.length = 0;
    if(Object.keys(SPECIES_CATEGORIES).length > 0) {
        SPECIES_OPTIONS.push(...flattenDeep(SPECIES_CATEGORIES).sort());
    }

    ANIMALS_OPTIONS.length = 0;
    if(Object.keys(ANIMALS_CATEGORIES).length > 0) {
        ANIMALS_OPTIONS.push(...flattenDeep(ANIMALS_CATEGORIES).sort());
    }

    OBJECTS_OPTIONS.length = 0;
    if(Object.keys(OBJECTS_CATEGORIES).length > 0) {
        OBJECTS_OPTIONS.push(...flattenDeep(OBJECTS_CATEGORIES).sort());
    }

    HAIR_STYLES.length = 0;
    if(Object.keys(HAIR_STYLES_NESTED).length > 0) {
        HAIR_STYLES.push(...Object.values(HAIR_STYLES_NESTED).flat().sort() as string[]);
    }

    HAIR_COLORS.length = 0;
    if(Object.keys(HAIR_COLORS_NESTED).length > 0) {
        HAIR_COLORS.push(...Object.values(HAIR_COLORS_NESTED).flat().sort() as string[]);
    }

    EYE_COLORS.length = 0;
    if(Object.keys(EYE_COLORS_NESTED).length > 0) {
        EYE_COLORS.push(...Object.values(EYE_COLORS_NESTED).flat().sort() as string[]);
    }
}
updateDerivedTransformationOptions(); // Init immediately
