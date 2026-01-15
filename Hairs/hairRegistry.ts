
import { Style } from './Nodes/style';
import { Color } from './Nodes/color';
import { Length } from './Nodes/length';
import { Movement } from './Nodes/movement';
import { FacialHair } from './Nodes/facialHair';
import { TextureCondition } from './Nodes/texture';
import { FantasyHair } from './Nodes/fantasy_styles';
import { HistoricHair } from './Nodes/historic';
import { BaldingAging } from './Nodes/balding';

export const HAIR_TREE = {
    "Style": Style,
    "Color": Color,
    "Length": Length,
    "Movement": Movement,
    "Fantasy & Elemental": FantasyHair,
    "Historic & Cultural": HistoricHair,
    "Balding & Aging": BaldingAging,
    "Facial Hair": FacialHair,
    "Texture & Accessories": TextureCondition
};
