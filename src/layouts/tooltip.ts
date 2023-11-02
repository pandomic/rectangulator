import { CartesianSize, Theme } from "@/types";

export const calculateTooltipDimensions = (theme: Theme, tooltip: string): CartesianSize => {
  const height = theme.fontSize + theme.groupTooltipPadding * 2;
  const width = tooltip.length * theme.fontCharacterWidth + theme.groupTooltipPadding * 2;
  return { width, height }
};
