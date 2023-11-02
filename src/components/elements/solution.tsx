import { ReactElement, useState, useMemo, forwardRef, RefObject } from 'react';

import { GroupDimensions, LPSolution, ClassifiedDataSet, ClassifiedSet, ClassifiedGroup, Theme } from "@/types";

import { SetLabelRenderer } from "@/components";
import { intersection } from "@/lib/sets";
import { computeGroupDimensions } from "@/layouts";
import { DEFAULT_THEME } from "@/themes";

import { GroupRenderer } from './group';
import { SetRenderer } from './set';

const SVG_STYLES = `
.svg-set {
  transition: all 0.3s ease-in-out;
}
.svg-set.inactive {
  opacity: 0.1;
}

.svg-group {
  cursor: pointer;
  transition: all 0.3s ease-in-out;
}
.svg-group.inactive {
  opacity: 0.05;
}
.svg-group.intermediate {
  opacity: 0.3;
}

.svg-label {
  cursor: pointer;
  transition: all 0.3s ease-in-out;
}
.svg-label.inactive {
  opacity: 0.1;
}

.svg-tooltip {
  opacity: 0;
  transition: all 0.3s ease-in-out;
  pointer-events: none;
}
.svg-tooltip.active {
  opacity: 1;
}
`;

export interface SolutionRendererProps {
  theme: Theme;
  dataset: ClassifiedDataSet;
  solution: LPSolution;
}

export const SolutionRenderer = forwardRef(({ theme, dataset, solution }: SolutionRendererProps, ref): ReactElement => {
  const [activeSet, setActiveSet] = useState<ClassifiedSet | null>(null);
  const [activeGroup, setActiveGroup] = useState<ClassifiedGroup | null>(null);

  const [mouseDown, setMouseDown] = useState<boolean>(false);

  const [canvasOffset, setCanvasOffset] = useState<[number, number]>([0, 0]);
  const [canvasScale, setCanvasScale] = useState<number>(1);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!mouseDown) return;

    const [deltaX, deltaY] = [e.movementX, e.movementY];
    setCanvasOffset([canvasOffset[0] + deltaX, canvasOffset[1] + deltaY]);
  };

  const groupDimensions = useMemo(() => {
    const groupSizesMapData: [string, GroupDimensions][] = [...dataset.groups.values()].map(
      (group) => [group.groupAlias, computeGroupDimensions(DEFAULT_THEME, group)],
    );
    return new Map<string, GroupDimensions>([...groupSizesMapData])
  }, [dataset]);

  return (
    <svg
      ref={ref as RefObject<SVGSVGElement>}
      width="100%"
      height="100%"
      onPointerDown={() => setMouseDown(true)}
      onMouseDown={() => setMouseDown(true)}
      onMouseUp={() => setMouseDown(false)}
      onPointerUp={() => setMouseDown(true)}
      onMouseMove={handleMouseMove}
      onWheel={(e) => {
        setCanvasScale(canvasScale + e.deltaY * 0.001);
      }}
    >
      <defs>
        <style type="text/css">{SVG_STYLES}</style>
      </defs>
      <g
        transform={`translate(${canvasOffset[0]}, ${canvasOffset[1]}),scale(${canvasScale}, ${canvasScale})`}
      >
        <g>
          {/* Render sets  */}
          {[...dataset.sets.values()].map((set, setIdx) => (
            <SetRenderer
              key={set.alias}
              theme={theme}
              set={set}
              setIndex={setIdx}
              active={activeSet === set}
              inactive={
                (!!activeSet && activeSet !== set) ||
                (!!activeGroup && !Array.from(activeGroup.labels).includes(set.name))
              }
              dimensions={{
                x: solution.Columns[`s_${set.alias}_x1`].Primal!,
                y: solution.Columns[`s_${set.alias}_y1`].Primal!,
                width: solution.Columns[`s_${set.alias}_x2`].Primal! - solution.Columns[`s_${set.alias}_x1`].Primal!,
                height: solution.Columns[`s_${set.alias}_y2`].Primal! - solution.Columns[`s_${set.alias}_y1`].Primal!,
              }}
            />
          ))}
          {/* Render groups */}
          {[...dataset.groups.values()].map((group) => (
            <GroupRenderer
              key={group.groupAlias}
              theme={theme}
              group={group}
              dataset={dataset}
              dimensions={groupDimensions.get(group.groupAlias)!}
              active={activeGroup === group}
              intermediate={
                !!activeGroup && activeGroup !== group && intersection(activeGroup.labels, group.labels).size > 0
              }
              inactive={
                (!!activeSet && !Array.from(group.labels).includes(activeSet.name)) ||
                (!!activeGroup && activeGroup !== group)
              }
              position={{
                x: solution.Columns[`g_${group.groupAlias}_x1`].Primal!,
                y: solution.Columns[`g_${group.groupAlias}_y1`].Primal!,
              }}
              onHover={(hovered) => {
                setActiveGroup(hovered ? group : null);
              }}
            />
          ))}
          {/* Render set labels */}
          {[...dataset.sets.values()].map((set, setIdx) => (
            <SetLabelRenderer
              key={set.alias}
              theme={theme}
              colorVariation={theme.colorVariations[setIdx]}
              label={set.name}
              setWidth={solution.Columns[`s_${set.alias}_x2`].Primal! - solution.Columns[`s_${set.alias}_x1`].Primal!}
              active={activeSet === set}
              inactive={
                (!!activeSet && activeSet !== set) ||
                (!!activeGroup && !Array.from(activeGroup.labels).includes(set.name))
              }
              position={{
                x: solution.Columns[`s_${set.alias}_x1`].Primal!,
                y: solution.Columns[`s_${set.alias}_y1`].Primal!,
              }}
              onHover={(hovered) => {
                setActiveSet(hovered ? set : null);
              }}
            />
          ))}
        </g>
      </g>
    </svg>
  );
});
