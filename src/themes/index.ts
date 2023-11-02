import {
  amber,
  blue,
  blueGrey,
  brown,
  cyan,
  deepOrange,
  deepPurple,
  green,
  indigo,
  lightBlue,
  lightGreen,
  lime,
  orange,
  pink,
  purple,
  red,
  teal,
  yellow,
} from '@mui/material/colors';

import { Theme, ThemeColorVariation } from '@/types';

const VARIATION_COLORS = [
  amber[900],
  blue[900],
  blueGrey[900],
  brown[900],
  cyan[900],
  deepOrange[900],
  deepPurple[900],
  green[900],
  indigo[900],
  lightBlue[900],
  lightGreen[900],
  lime[900],
  orange[900],
  pink[900],
  purple[900],
  red[900],
  teal[900],
  yellow[900],
];

const COLOR_VARIATIONS: ThemeColorVariation[] = VARIATION_COLORS.map((color) => ({
  setOutlineColor: color,
  setLabelColor: '#FFFFFF',
  setBackgroundColor: color,
  setBackgroundOpacity: '0.05',
  setColor: '#FFFFFF',
}));

export const DEFAULT_THEME: Theme = {
  fontSize: 16,
  fontFamily: `'Roboto Mono', monospace`,
  fontCharacterWidth: 9.6,

  groupItemSpacing: 10,
  groupMarkerSpacing: 3,
  groupMarkerSize: 5,
  groupMarkerColumns: 2,
  groupOutlineColor: '#000000',
  groupColor: '#000000',
  groupBackgroundColor: '#FFFFFF',
  groupBackgroundOpacity: '0.05',
  groupMarkersBackgroundColor: '#FFFFFF',

  groupTooltipPadding: 5,
  groupTooltipColor: '#000000',
  groupTooltipBackgroundColor: '#FFFFFF',
  groupTooltipBorderRadius: 0,
  groupTooltipBorderColor: '#000000',

  setBorderRadius: 5,
  setLabelPadding: 5,
  groupBorderRadius: 5,

  colorVariations: COLOR_VARIATIONS,
};
