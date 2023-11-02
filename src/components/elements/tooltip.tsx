import { ReactElement } from 'react';

import { Theme, CartesianPoint } from "@/types";
import { calculateTooltipDimensions } from "@/layouts";

interface TooltipRendererProps {
  theme: Theme;
  tooltip: string;
  active?: boolean;
  position: CartesianPoint;
}

export const TooltipRenderer = ({ theme, tooltip, position, active }: TooltipRendererProps): ReactElement => {
  const size = calculateTooltipDimensions(theme, tooltip);

  return (
    <g
      transform={`translate(${position.x},${position.y})`}
      className={`svg-tooltip ${active ? 'active' : ''}`}
    >
      <rect
        width={size.width}
        height={size.height}
        fill={theme.groupTooltipBackgroundColor}
        stroke={theme.groupTooltipBorderColor}
      />
      <text
        fill={theme.groupTooltipColor}
        x={theme.groupTooltipPadding}
        y={theme.groupTooltipPadding + theme.fontSize}
      >
        {tooltip}
      </text>
    </g>
  );
};
