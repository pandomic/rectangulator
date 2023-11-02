import { chunk } from 'lodash';

import { ClassifiedGroup, Theme, GroupDimensions } from "@/types";

const calculateLabelOffset = (theme: Theme, labelIdx: number) => ({
  x: theme.groupItemSpacing,
  y: Math.ceil((labelIdx + 1) * (theme.fontSize + theme.groupItemSpacing)),
});

/**
 * Note `x` value has to be shifted by the titles area width!
 */
const calculateMarkerOffset = (theme: Theme, rowIdx: number, columnIdx: number) => ({
  x: Math.ceil(theme.groupMarkerSize / 2 + columnIdx * (theme.groupMarkerSpacing + theme.groupMarkerSize * 2)),
  y: Math.ceil(theme.groupItemSpacing + theme.groupMarkerSize / 2 + rowIdx * (theme.groupMarkerSpacing + theme.groupMarkerSize * 2)),
});

export const computeGroupDimensions = (theme: Theme, group: ClassifiedGroup): GroupDimensions => {
  // how many rows of markers do we need, important to calculate group height
  const markerRows = Math.ceil(group.labels.size / theme.groupMarkerColumns);

  const maxTitleLength = Math.max(...[...group.values].map((label) => label.length));

  // calculate the maximum width the titles area needs
  const titlesWidth = theme.groupItemSpacing * 2 + theme.fontCharacterWidth * maxTitleLength;
  const titlesHeight = group.values.size * theme.fontSize + (group.values.size + 1) * theme.groupItemSpacing;

  const maxMarkersYOffset = calculateMarkerOffset(theme, markerRows - 1, 0).y;
  const maxMarkersXOffset = calculateMarkerOffset(theme, 0, theme.groupMarkerColumns - 1).x;

  const totalMarkersHeight = maxMarkersYOffset + theme.groupMarkerSize / 2 + theme.groupItemSpacing;

  const width = Math.ceil(titlesWidth + maxMarkersXOffset + theme.groupMarkerSize / 2 + theme.groupItemSpacing);
  const height = Math.ceil(Math.max(titlesHeight, totalMarkersHeight));

  const titlesOffsets = [...group.values].map(
    (label, labelIdx) => calculateLabelOffset(theme, labelIdx),
  );

  const markerChunks = chunk([...group.labels], theme.groupMarkerColumns);
  const markerOffsets = markerChunks.map((row, rowIdx) => {
    return row.map((marker, markerIdx) => {
      const baseOffset = calculateMarkerOffset(theme, rowIdx, markerIdx);
      return { x: titlesWidth + baseOffset.x, y: baseOffset.y }
    });
  });

  return { width, height, titlesOffsets, markerOffsets };
};
