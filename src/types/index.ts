import { Solution as LPSolution } from 'highs';

export type { Solution as LPSolution } from 'highs';

export type LabelledData = Map<string, Set<string>>;

export interface DataSet {
  labelsWithData: LabelledData;
  dataWithLabels: LabelledData;
  labels: Set<string>;
  values: Set<string>;
}

export type DataSetPreview = DataSet & {
  name: string;
  description: string;
  image?: string
};

export type GroupedDataSet = DataSet & { groupedData: Map<Set<string>, Set<string>> };

export interface ClassifiedSet {
  name: string;
  alias: string;
  intersections: Map<string, ClassifiedSet>;
  disconnections: Map<string, ClassifiedSet>;
  parent?: ClassifiedSet;
}

export interface ClassifiedGroup {
  groupAlias: string;
  labels: Set<string>;
  values: Set<string>;
  inclusionSets: Map<string, ClassifiedSet>;
  exclusionSets: Map<string, ClassifiedSet>;
}

export interface ClassifiedDataSet {
  sets: Map<string, ClassifiedSet>;
  groups: Map<string, ClassifiedGroup>;
}

export interface CartesianPoint {
  x: number;
  y: number;
}

export interface CartesianSize {
  width: number;
  height: number;
}

export type CartesianObject = CartesianPoint & CartesianSize;

export type GroupDimensions = CartesianSize & {
  titlesOffsets: { x: number, y: number }[];
  markerOffsets: { x: number, y: number }[][];
}

export type LabelDimensions = CartesianSize & {
  label: string;
}

export interface ThemeColorVariation {
  setOutlineColor: string;
  setLabelColor: string;
  setBackgroundColor: string;
  setBackgroundOpacity: string;
  setColor: string;
}

export interface Theme {
  fontSize: number;
  fontFamily: string;
  fontCharacterWidth: number;

  groupItemSpacing: number;
  groupMarkerSpacing: number;
  groupMarkerSize: number;
  groupMarkerColumns: number;
  groupOutlineColor: string;
  groupColor: string;
  groupBackgroundColor: string;
  groupBackgroundOpacity: string;
  groupMarkersBackgroundColor: string;

  groupTooltipPadding: number;
  groupTooltipColor: string;
  groupTooltipBackgroundColor: string;
  groupTooltipBorderRadius: number;
  groupTooltipBorderColor: string;

  setBorderRadius: number;
  setLabelPadding: number;
  groupBorderRadius: number;

  colorVariations: ThemeColorVariation[];
}

// TODO: rename to LP
export type MIPPrimitive = string;

export interface MIPConstraint {
  name?: string;
  variables: Map<MIPPrimitive, number>;
  operator: string;
  rhs: number;
}

export interface LPNewModel {
  objective: MIPPrimitive[];
  constraints: MIPConstraint[];
  binaries: Set<string>;
  generals: Set<string>;
}

export interface LPModel {
  objective: string[];
  constraints: string[];
  binaries: Set<string>;
  generals: Set<string>;
}

export interface LPModelSettings {
  enableObjectiveSquareness: boolean;
  enableIntersectingSetsConstraints: boolean;
  enableNonIntersectingSetsConstraints: boolean;
  enableFullyContainedSetsConstraints: boolean;
  enableSetLabelConstraints: boolean;
  enableGroupExclusionConstraints: boolean;
}

export interface LPModelInput {
  groupSizes: Map<string, CartesianSize>;
  setLabelSizes: Map<string, CartesianSize>;
  groupMargin: number;
  setLabelHeight: number;

  settings: LPModelSettings;
}

export type LPApplicableConstraint = (
  data: ClassifiedDataSet,
  input: LPModelInput,
  model: LPNewModel,
) => unknown;

export type LPSolver = (model: LPNewModel) => Promise<LPSolution>;

export type LPEncoder = (model: LPNewModel) => string;
