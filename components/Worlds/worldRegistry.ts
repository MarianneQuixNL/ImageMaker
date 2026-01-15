
import * as Historic from './Nodes/historic';
import * as SciFi from './Nodes/scifi';
import * as Nature from './Nodes/nature';
import * as Urban from './Nodes/urban';
import * as Abstract from './Nodes/abstract';
import * as Literature from './Nodes/literature';
import * as ModernMedia from './Nodes/modernMedia';
import * as TVMovies from './Nodes/tvMovies';
import * as Comics from './Nodes/comics';
import * as Horror from './Nodes/horror';
import * as Dreamscapes from './Nodes/dreamscapes';
import * as Detention from './Nodes/detention';
import * as Intimate from './Nodes/intimate';
import * as Geological from './Nodes/geological';
import * as Species from './Nodes/speciesWorlds';

export const WORLD_TREE = {
    "Species Homelands": {
        "Elven Realms": Species.ElfWorlds,
        "Dwarven Strongholds": Species.DwarfWorlds,
        "Orc & Goblin Territories": Species.OrcGoblinWorlds,
        "Smallfolk Settlements": Species.SmallfolkWorlds,
        "Giant Lands": Species.GiantWorlds,
        "Planar & Celestial": Species.PlanarWorlds,
        "Feywild & Magic": Species.FeyWorlds,
        "Beast & Hybrid Habitats": Species.BeastHybridWorlds,
        "Aquatic Dominions": Species.AquaticWorlds,
        "Insectoid Hives": Species.InsectoidWorlds,
        "Undead & Cursed Lands": Species.UndeadWorlds,
        "Construct & Artificial": Species.ConstructWorlds,
        "Alien Planets": Species.AlienWorlds
    },
    "Geological Time & Events": {
        "Geological Periods": Geological.GeologicalPeriods,
        "Extinction Events": Geological.ExtinctionEvents
    },
    "Comics & Superheroes": {
        "DC Universe (Batman, Superman)": Comics.DCUniverse,
        "Marvel Universe (Avengers, X-Men)": Comics.MarvelUniverse,
        "Indie, Dark & Vertigo": Comics.IndieAndDark
    },
    "Intimate & Sensual": {
        "Boudoir & Bedroom": Intimate.IntimateSensual,
        "Luxury Dungeon": Intimate.IntimateSensual
    },
    "TV & Movie Universes": {
        "Star Trek": TVMovies.StarTrek,
        "Star Wars": TVMovies.StarWars,
        "Stargate": TVMovies.Stargate,
        "Cult Classics (B5, Firefly, BSG)": TVMovies.CultSciFiTV,
        "Military Sci-Fi & Horror": TVMovies.MilitarySciFiHorror,
        "British Sci-Fi": TVMovies.BritishSciFi
    },
    "Modern Media & Games": {
        "School of Magic (Potter)": ModernMedia.WizardingSchools,
        "Dark Fantasy Anime (Goblin Slayer/Berserk)": ModernMedia.DarkFantasyAnime,
        "Epic Sagas (GoT/Witcher)": ModernMedia.EpicSagas,
        "Dystopian YA (Hunger Games)": ModernMedia.DystopianYA
    },
    "Literature & Storybook": {
        "High Fantasy (LotR, Conan)": Literature.HighFantasy,
        "Pulp Adventure (Mars, Tarzan)": Literature.PulpAdventure,
        "Classic Literature (Arthur, Robin Hood)": Literature.ClassicLiterature,
        "Storybook Fantasy (Oz, Wonderland)": Literature.StorybookFantasy,
        "Gothic Horror (Dracula, Lovecraft)": Literature.GothicHorror
    },
    "Atmospheric & Abstract": {
        "Horror & Spooky": Horror.HorrorWorlds,
        "Dreamscapes & Surreal": Dreamscapes.Dreamscapes,
        "Studio & Abstract": Abstract.StudioAbstract
    },
    "Confinement & Detention": {
        "Jails & Prisons": Detention.JailsAndPrisons,
        "Dungeons & Torture": Detention.DungeonsAndTorture
    },
    "Historic Interiors & Time Periods": {
        "Prehistoric": Historic.Prehistoric,
        "Ancient Civilizations": Historic.AncientCivilizations,
        "Medieval & Renaissance": Historic.MedievalRenaissance,
        "18th-19th Century": Historic.Century18_19,
        "20th Century": Historic.Century20
    },
    "Sci-Fi & Future Interiors": {
        "Starships": SciFi.Starships,
        "Cyberpunk": SciFi.Cyberpunk,
        "Post-Apocalyptic": SciFi.PostApocalyptic
    },
    "Nature: Forests & Flora": Nature.ForestsFlora,
    "Nature: Water & Coast": Nature.WaterCoast,
    "Nature: Mountains & Deserts": Nature.MountainsDeserts,
    "Nature: Rural & Farm": Nature.RuralFarm,
    "Urban: Modern World": Urban.ModernWorld
};
