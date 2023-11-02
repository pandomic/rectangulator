import { ReactElement, useState, Fragment } from 'react';
import { chunk } from 'lodash';

import { ClassifiedGroup, ClassifiedDataSet, Theme, GroupDimensions, CartesianPoint, ThemeColorVariation } from '@/types';

import { TooltipRenderer } from './tooltip';

const groupRendererStyles = (theme: Theme) => ({
  root: {
    fontFamily: theme.fontFamily,
    fontSize: `${theme.fontSize}px`,
    lineHeight: `${theme.fontSize}px`,
    letterSpacing: '0px',
    color: theme.groupColor,
  },
});

export interface GroupRendererProps {
  theme: Theme;
  group: ClassifiedGroup;
  dataset: ClassifiedDataSet;
  dimensions: GroupDimensions;
  position: CartesianPoint;
  onHover: (hovered: boolean) => void;
  active?: boolean;
  inactive?: boolean;
  intermediate?: boolean;
}

/**
 * Render a group element.
 *
 * NOTE it is important to precompute the group size in advance!
 */
export const GroupRenderer = ({ theme, group, dataset, dimensions, position, onHover, active, inactive, intermediate }: GroupRendererProps): ReactElement => {
  const styles = groupRendererStyles(theme);
  const setColors = new Map<string, ThemeColorVariation>([...dataset.sets.values()].map(
    (set, idx) => [set.name, theme.colorVariations[idx]]),
  );

  const [activeMarker, setActiveMarker] = useState<string | null>(null);

  return (
    <g
      data-type="group"
      transform={`translate(${position.x},${position.y})`}
      style={styles.root}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      className={`svg-group ${active ? 'active' : ''} ${inactive ? 'inactive' : ''} ${intermediate ? 'intermediate' : ''}`}
    >
      <rect
        x={0}
        y={0}
        width={dimensions.width}
        height={dimensions.height}
        stroke={theme.groupOutlineColor}
        fill={theme.groupBackgroundColor}
        fillOpacity={theme.groupBackgroundOpacity}
      />
      {[...group.values].map((value, valueIdx) => (
        <text
          key={value}
          x={dimensions.titlesOffsets[valueIdx].x}
          y={dimensions.titlesOffsets[valueIdx].y}
          fill={theme.groupColor}
        >
          {value}
        </text>
      ))}
      {chunk([...group.labels], theme.groupMarkerColumns).map((markerRow, markerRowIdx) => (
        markerRow.map((marker, markerIdx) => (
          dimensions.markerOffsets?.[markerRowIdx]?.[markerIdx] && (
            <Fragment key={`${markerRowIdx}-${markerIdx}`}>
              <circle
                r={theme.groupMarkerSize}
                cx={dimensions.markerOffsets[markerRowIdx][markerIdx].x}
                cy={dimensions.markerOffsets[markerRowIdx][markerIdx].y}
                // aa={!setColors.get(marker)?.setBackgroundColor ? console.log(`No color for ${marker}`) : undefined}
                fill={setColors.get(marker)!.setBackgroundColor}
                onMouseEnter={() => setActiveMarker(marker)}
                onMouseLeave={() => setActiveMarker(null)}
              />
              <TooltipRenderer
                theme={theme}
                tooltip={marker}
                active={activeMarker === marker}
                position={{
                  x: dimensions.markerOffsets[markerRowIdx][markerIdx].x,
                  y: dimensions.markerOffsets[markerRowIdx][markerIdx].y,
                }}
              />
            </Fragment>
          )
        ))
      ))}
    </g>
  );
};
