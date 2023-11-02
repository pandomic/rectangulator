import { LabelDimensions, Theme } from "@/types";

export const computeLabelDimensions = (theme: Theme, label: string, width: number): LabelDimensions => {
  const height = theme.fontSize + theme.setLabelPadding * 2;
  const maxContentWidth = width - theme.setLabelPadding * 2;
  const maxTextWidth = Math.floor(maxContentWidth / theme.fontCharacterWidth);

  if (label.length > maxTextWidth) {
    const truncatedLabel = label.slice(0, maxTextWidth - 3) + '...';
    const labelWidth = truncatedLabel.length * theme.fontCharacterWidth + theme.setLabelPadding * 2;

    return {
      label: truncatedLabel,
      width: labelWidth,
      height,
    };
  }

  const labelWidth = label.length * theme.fontCharacterWidth + theme.setLabelPadding * 2;

  return { label, width: labelWidth, height }
};
