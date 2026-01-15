
export const ClassHierarchy = {
    "Warrior": {
      "Knight": ["Paladin", "Dark Knight", "Cavalier", "Templar"],
      "Barbarian": ["Berserker", "Tribal Warrior", "Storm Herald"],
      "Fighter": ["Gladiator", "Mercenary", "Soldier", "Samurai", "Viking"]
    },
    "Magic User": {
      "Wizard": ["Archmage", "Necromancer", "Illusionist", "Pyromancer", "Cryomancer"],
      "Sorcerer": ["Draconic Bloodline", "Wild Magic", "Shadow Sorcerer"],
      "Warlock": ["Fiend Pact", "Fey Pact", "Hexblade"]
    },
    "Rogue": {
      "Assassin": ["Shadowblade", "Ninja", "Poisoner"],
      "Thief": ["Burglar", "Pickpocket", "Treasure Hunter"],
      "Ranger": ["Beast Master", "Sniper", "Bounty Hunter", "Gloom Stalker"]
    },
    "Support": {
      "Cleric": ["Life Domain", "War Domain", "Healer", "Priest"],
      "Druid": ["Shapeshifter", "Elementalist", "Circle of Spores"],
      "Bard": ["Minstrel", "Skald", "Lore Keeper"]
    },
    "Modern/Sci-Fi": {
      "Combat": ["Space Marine", "Cyber-Ninja", "Gunslinger"],
      "Tech": ["Hacker", "Engineer", "Pilot", "Scientist"],
      "Civilian": ["Doctor", "Detective", "Student", "Artist"]
    }
};

export const LocationHierarchy = {
    "Indoors": {
      "Social & Public": {
        "Tavern": ["Busy Bar Counter", "Warm Fireplace Hearth", "Brawling Hall", "Dark Corner Table"],
        "Library": ["Ancient Scroll Room", "Forbidden Section", "Wizard's Study"],
        "Market": ["Indoor Bazaar", "Magic Shop", "Blacksmith Forge"]
      },
      "Royal & Noble": {
        "Castle": ["Throne Room", "Grand Ballroom", "Council Chamber", "Royal Bedchamber"],
        "Mansion": ["Victorian Parlor", "Dining Hall", "Art Gallery"]
      },
      "Dungeon & Dangerous": {
        "Crypt": ["Sarcophagus Room", "Bone Hall", "Catacombs"],
        "Cave": ["Crystal Cavern", "Underground Lake", "Spider Nest", "Dragon's Lair"],
        "Prison": ["Dungeon Cell", "Torture Chamber"]
      }
    },
    "Outdoors": {
      "Nature": {
        "Forest": ["Ancient Grove", "Dense Thicket", "Elven Treehouse Village", "Misty Swamp"],
        "Mountain": ["Snowy Peak", "Cliff Edge", "Volcano Rim", "Mountain Pass"],
        "Water": ["Tropical Beach", "Waterfall", "Raging River", "Calm Lake"]
      },
      "Urban": {
        "City": ["Bustling Market Square", "Dark Alleyway", "Rooftops at Night", "City Gates"],
        "Village": ["Farm Fields", "Town Square", "Thatched Cottages"],
        "Ruins": ["Overgrown Temple", "Destroyed City", "Ancient Monoliths"]
      }
    }
};

export const AtmosphereHierarchy = {
    "Time of Day": {
      "Day": ["Dawn (Sunrise)", "Noon (Harsh Sun)", "Golden Hour (Soft Light)", "Sunset (Orange/Purple)"],
      "Night": ["Twilight (Blue Hour)", "Midnight (Full Moon)", "Pitch Black (Torchlight only)"]
    },
    "Weather": {
      "Clear": ["Sunny & Bright", "Cloudless Blue Sky", "Starry Night"],
      "Cloudy": ["Overcast (Soft Light)", "Gloomy & Grey", "Storm Clouds Gathering"],
      "Precipitation": ["Light Rain", "Heavy Thunderstorm", "Snowfall", "Blizzard"],
      "Atmospheric": ["Foggy", "Misty Morning", "Sandstorm", "Smog/Haze"]
    }
};

export const InteractionHierarchy = {
    "Action & Movement": {
      "Travel": ["Walking casually", "Marching in rank", "Hiking steep terrain", "Running/Sprinting", "Sneaking/Stealth"],
      "Riding": ["Riding Horses", "Driving Vehicle", "Riding Monsters", "Flying on Mounts"],
      "Exploration": ["Searching area", "Tracking footprints", "Climbing a wall", "Pushing through vegetation"]
    },
    "Combat & Conflict": {
      "Engagement": {
        "Melee": ["Clashing swords", "Shield wall defense", "Brawling", "Back-to-back defense", "Charging into battle"],
        "Ranged": ["Firing bows", "Casting offensive magic", "Throwing weapons", "Taking cover"]
      },
      "Aftermath": ["Standing over defeated foes", "Tending to wounds", "Looting bodies", "Capturing prisoners", "Retreating"]
    },
    "Rest & Social": {
      "Campfire": ["Sitting around fire", "Cooking food", "Sleeping/Resting", "Cleaning gear", "Keeping watch"],
      "Tavern/Inn": ["Drinking & Toasting", "Playing cards/dice", "Eating a feast", "Brawling (Non-lethal)", "Ordering from bar"],
      "Communication": ["Planning/Strategizing", "Arguing/Debating", "Trading/Bartering", "Whispering secrets", "Laughing/Celebrating"]
    },
    "Specialized Activities": {
      "Magic": ["Ritual casting", "Summoning entity", "Examining magical artifact", "Meditating"],
      "Crafting/Work": ["Blacksmithing", "Alchemy brewing", "Reading ancient scrolls", "Picking a lock"]
    }
};
