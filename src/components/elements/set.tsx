import { ReactElement } from 'react';

import { CartesianObject, Theme, ClassifiedSet } from '@/types';

interface SetRendererProps {
  theme: Theme;
  set: ClassifiedSet;
  setIndex: number;
  dimensions: CartesianObject;
  active?: boolean;
  inactive?: boolean;
}

export const SetRenderer = ({ theme, set, setIndex, dimensions, active, inactive }: SetRendererProps): ReactElement => {
  const colorVariation= theme.colorVariations[setIndex];

  return (
    <g
      data-type="set"
      data-alias={set.alias}
      data-name={set.name}
      transform={`translate(${dimensions.x},${dimensions.y})`}
      className={`svg-set ${active ? 'active' : ''} ${inactive ? 'inactive' : ''}`}
    >
      <rect
        x={0}
        y={0}
        width={dimensions.width}
        height={dimensions.height}
        stroke={colorVariation.setOutlineColor}
        fill={colorVariation.setBackgroundColor}
        fillOpacity={colorVariation.setBackgroundOpacity}
      />
    </g>
  );
};
