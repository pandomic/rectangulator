import type { Story } from "@ladle/react";

import { DEFAULT_THEME } from '@/themes';
import { ClassifiedGroup } from '@/types';
import { computeGroupDimensions } from '@/layouts';

import { GroupRenderer } from './group';

const SAMPLE_GROUP_ONE: ClassifiedGroup = {
  groupAlias: 'group-1',
  labels: new Set(['SetA', 'SetB', 'SetC']),
  values: new Set(['Value1', 'Value2', 'Value3']),
  inclusionSets: new Map(),
  exclusionSets: new Map(),
};

const SAMPLE_GROUP_TWO: ClassifiedGroup = {
  groupAlias: 'group-1',
  labels: new Set(['SetA', 'SetB', 'SetC', 'SetD', "SetE"]),
  values: new Set(['Value1']),
  inclusionSets: new Map(),
  exclusionSets: new Map(),
};

export const HeightInheritedFromValues: Story = () => (
  <svg width="100%" height="100%">
    <GroupRenderer
      theme={DEFAULT_THEME}
      group={SAMPLE_GROUP_ONE}
      dataset={{}}
      dimensions={computeGroupDimensions(DEFAULT_THEME, SAMPLE_GROUP_ONE)}
      position={{ x: 0, y: 0 }}
    />
  </svg>
);

export const HeightInheritedFromLabels: Story = () => (
  <svg width="100%" height="100%">
    <GroupRenderer
      theme={DEFAULT_THEME}
      group={SAMPLE_GROUP_TWO}
      dataset={{}}
      dimensions={computeGroupDimensions(DEFAULT_THEME, SAMPLE_GROUP_TWO)}
      position={{ x: 0, y: 0 }}
    />
  </svg>
);
