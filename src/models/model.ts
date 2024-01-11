import { ClassifiedDataSet, LPModelInput, LPNewModel } from '@/types';

import {
  applyObjectiveFunction,
  applyObjectiveSquareness,
  applyVariableTypes,
  applySetBoundingBoxConstraints,
  applyNonIntersectingSetsConstraints,
  applyIntersectingSetsConstraints,
  applySetLabelConstraints,
  applyFullyContainedSetConstraints,
  applyGroupSizeConstraints,
  applyGroupInclusionConstraints,
  applyGroupExclusionConstraints,
} from './constraints';


export const buildNewModel = (
  data: ClassifiedDataSet,
  input: LPModelInput,
): LPNewModel => {
  const applicableConstraints = [
    applyObjectiveFunction,
    applyVariableTypes,
    applySetBoundingBoxConstraints,
    applyGroupSizeConstraints,
    applyGroupInclusionConstraints,
  ];

  if (input.settings.enableObjectiveSquareness) {
    applicableConstraints.push(applyObjectiveSquareness);
  }
  if (input.settings.enableIntersectingSetsConstraints) {
    applicableConstraints.push(applyIntersectingSetsConstraints);
  }
  if (input.settings.enableNonIntersectingSetsConstraints) {
    applicableConstraints.push(applyNonIntersectingSetsConstraints);
  }
  if (input.settings.enableSetLabelConstraints) {
    applicableConstraints.push(applySetLabelConstraints);
  }
  if (input.settings.enableFullyContainedSetsConstraints) {
    applicableConstraints.push(applyFullyContainedSetConstraints);
  }
  if (input.settings.enableGroupExclusionConstraints) {
    applicableConstraints.push(applyGroupExclusionConstraints);
  }

  const model: LPNewModel = {
    objective: [],
    constraints: [],
    binaries: new Set(),
    generals: new Set(),
  };

  for (const constraint of applicableConstraints) {
    constraint(data, input, model);
  }

  return model;
};
