
import { RealWorldHumans, FantasyHumans } from './Nodes/humans';
import { ElvenLineages, EthnoCodedElves, FaeryFolk } from './Nodes/elvesFaeries';
import { Dwarves } from './Nodes/dwarves';
import { Smallfolk } from './Nodes/smallfolk';
import { OrcsGoblinoids } from './Nodes/orcsGoblinoids';
import { Giants } from './Nodes/giants';
import { PlanarExotic } from './Nodes/planar';
import { PopCultureSpecies } from './Nodes/popCultureSpecies';
import { BeastKin } from './Nodes/beastKin';
import { HybridTauric } from './Nodes/hybridTauric';
import { UndeadCursed } from './Nodes/undeadCursed';
import { ConstructsArtificial } from './Nodes/constructs';
import { SciFiAlien } from './Nodes/scifiAlien';
import { Aquatic } from './Nodes/aquatic';
import { Insectoid } from './Nodes/insectoid';

export const SPECIES_TREE = {
    "Humans (Real World)": RealWorldHumans,
    "Humans (Fantasy & Literature)": FantasyHumans,
    "Elves (High, Wood, Dark)": ElvenLineages,
    "Elves (Ethno-Coded Variations)": EthnoCodedElves,
    "Dwarves (Hill, Mountain, Deep)": Dwarves,
    "Smallfolk (Halflings, Gnomes)": Smallfolk,
    "Orcs & Goblinoids": OrcsGoblinoids,
    "Giants & Giant-Kin": Giants,
    "Planar & Exotic (Tiefling/Aasimar)": PlanarExotic,
    "Pop Culture & Sci-Fi Universes": PopCultureSpecies,
    "Faeries & Fey Folk": FaeryFolk,
    "Beast-Kin (Anthropomorphic)": BeastKin,
    "Hybrid & Tauric": HybridTauric,
    "Aquatic & Amphibian": Aquatic,
    "Insectoid & Swarm": Insectoid,
    "Undead & Cursed": UndeadCursed,
    "Constructs & Artificial": ConstructsArtificial,
    "Sci-Fi & Alien (Generic)": SciFiAlien
};
