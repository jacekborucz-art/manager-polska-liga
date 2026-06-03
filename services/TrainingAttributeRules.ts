import { PlayerAttributes, PlayerPosition } from '../types';

export const TRAINABLE_PLAYER_ATTRS: (keyof PlayerAttributes)[] = [
  'strength', 'stamina', 'pace', 'defending', 'passing', 'attacking',
  'finishing', 'technique', 'vision', 'dribbling', 'heading', 'positioning',
  'goalkeeping', 'freeKicks', 'penalties', 'corners', 'aggression', 'crossing',
  'leadership', 'mentality', 'workRate'
];

export const getTrainableAttributesForPosition = (
  position: PlayerPosition
): (keyof PlayerAttributes)[] => (
  position === PlayerPosition.GK
    ? TRAINABLE_PLAYER_ATTRS
    : TRAINABLE_PLAYER_ATTRS.filter(attr => attr !== 'goalkeeping')
);
