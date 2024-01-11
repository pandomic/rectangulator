import {
  ClassifiedDataSet,
  LPModelInput,
  LPNewModel,
  LPApplicableConstraint,
  ClassifiedGroup,
  ClassifiedSet
} from "@/types";

// default objective - bounding box minimization and squareness
const DEFAULT_OBJECTIVE = ['br_x2', '-br_x1', 'br_y2', '-br_y1', 'square'];
const DEFAULT_GENERALS = ['br_x1', 'br_x2', 'br_y1', 'br_y2', 'square'];

const combinedAlias = (left: string, right: string) => [left, right].sort().join('_');

const calculateBigM = (input: LPModelInput): number => {
  // authors suggest using 2 * (sum of max widths + max heights of each element) as a value for M
  const sidesSum = Array.from(input.groupSizes.values()).map(({ width, height }) => width + height).reduce(
    (sum, val) => sum + val, 0,
  );
  // NOTE: currently works better and faster without labels
  // const labelsSum = Array.from(input.setLabelSizes.values()).map(({ width }) => width).reduce(
  //   (sum, val) => sum + val, 0,
  // );
  return (sidesSum) * 2;
};

/**
 * Optimize group exclusions, as if a group is exlcuded from a parent set,
 * this automatically means it should be excluded from all children sets as well.
  */
const buildOptimizedExclusionSets = (group: ClassifiedGroup) => {
  const optimizedExclusionSets: Map<string, ClassifiedSet> = new Map();

  for (const exclSet of group.exclusionSets.values()) {
    let pointer: ClassifiedSet = exclSet;
    let pointerCondition = true;

    while (pointerCondition) {
      if (pointer.parent && group.exclusionSets.has(pointer.parent.alias)) {
        pointer = pointer.parent;
        pointerCondition = true;
      } else {
        pointerCondition = false;
      }
    }

    optimizedExclusionSets.set(pointer.alias, pointer);
  }

  return optimizedExclusionSets.values();
};



/**
 * Apply objective function for sets minimization, squarness and bounding box
 */
export const applyObjectiveFunction: LPApplicableConstraint = (
  data: ClassifiedDataSet,
  input: LPModelInput,
  model: LPNewModel,
) => {
  model.objective = DEFAULT_OBJECTIVE;
  model.generals = new Set(DEFAULT_GENERALS);

  // diagram minimization
  for (const set of data.sets.values()) {
    model.objective.push(`s_${set.alias}_x2`);
    model.objective.push(`-s_${set.alias}_x1`);
    model.objective.push(`s_${set.alias}_y2`);
    model.objective.push(`-s_${set.alias}_y1`);
  }

  // put the bounding box in the left top corner
  model.constraints.push({
    variables: new Map([['br_x1', 1]]),
    operator: '=',
    rhs: 0,
  });
  model.constraints.push({
    variables: new Map([['br_y1', 1]]),
    operator: '=',
    rhs: 0,
  });
};

export const applyObjectiveSquareness: LPApplicableConstraint = (
  data: ClassifiedDataSet,
  input: LPModelInput,
  model: LPNewModel,
) => {
  model.constraints.push({
    variables: new Map([
      ['br_x2', 1],
      ['br_y2', -1],
      ['square', -1]
    ]),
    operator: '<=',
    rhs: 0,
  });
  model.constraints.push({
    variables: new Map([
      ['br_y2', 1],
      ['br_x2', -1],
      ['square', -1]
    ]),
    operator: '<=',
    rhs: 0,
  });
}

export const applyVariableTypes = (
  data: ClassifiedDataSet,
  input: LPModelInput,
  model: LPNewModel,
) => {
  for (const set of data.sets.values()) {
    model.generals.add(`s_${set.alias}_x1`);
    model.generals.add(`s_${set.alias}_x2`);
    model.generals.add(`s_${set.alias}_y1`);
    model.generals.add(`s_${set.alias}_y2`);
  }

  for (const groupAlias of input.groupSizes.keys()) {
    model.generals.add(`g_${groupAlias}_x1`);
    model.generals.add(`g_${groupAlias}_x2`);
    model.generals.add(`g_${groupAlias}_y1`);
    model.generals.add(`g_${groupAlias}_y2`);
  }
};

/**
 * [H0] apply group size constraints
 */
export const applyGroupSizeConstraints: LPApplicableConstraint = (
  data: ClassifiedDataSet,
  input: LPModelInput,
  model: LPNewModel,
) => {
  for (const [groupAlias, { width, height }] of input.groupSizes) {
    model.constraints.push({
      variables: new Map([
        [`g_${groupAlias}_x2`, 1],
        [`g_${groupAlias}_x1`, -1],
      ]),
      operator: '=',
      rhs: width,
    });
    model.constraints.push({
      variables: new Map([
        [`g_${groupAlias}_y2`, 1],
        [`g_${groupAlias}_y1`, -1],
      ]),
      operator: '=',
      rhs: height,
    });
  }
};

/**
 * [H1] apply group-set inclusion constraints
 */
export const applyGroupInclusionConstraints: LPApplicableConstraint = (
  data: ClassifiedDataSet,
  input: LPModelInput,
  model: LPNewModel,
) => {
  for (const group of data.groups.values()) {
    for (const set of group.inclusionSets.values()) {
      model.constraints.push({
        variables: new Map([
          [`g_${group.groupAlias}_x1`, 1],
          [`s_${set.alias}_x1`, -1],
        ]),
        operator: '>=',
        rhs: input.groupMargin,
      });
      model.constraints.push({
        variables: new Map([
          [`g_${group.groupAlias}_y1`, 1],
          [`s_${set.alias}_y1`, -1],
        ]),
        operator: '>=',
        rhs: input.groupMargin + input.setLabelHeight,
      });
      model.constraints.push({
        variables: new Map([
          [`g_${group.groupAlias}_x2`, 1],
          [`s_${set.alias}_x2`, -1],
        ]),
        operator: '<=',
        rhs: -input.groupMargin,
      });
      model.constraints.push({
        variables: new Map([
          [`g_${group.groupAlias}_y2`, 1],
          [`s_${set.alias}_y2`, -1],
        ]),
        operator: '<=',
        rhs: -input.groupMargin,
      });
    }
  }
};

/**
 * [H2] constraints to keep groups outside sets they do not belong to
 */
export const applyGroupExclusionConstraints: LPApplicableConstraint = (
  data: ClassifiedDataSet,
  input: LPModelInput,
  model: LPNewModel,
) => {
  const appliedConstraints: Set<string> = new Set();
  const M = calculateBigM(input);

  for (const group of data.groups.values()) {
    for (const set of buildOptimizedExclusionSets(group)) {
      const constraintId = `${group.groupAlias}_outside_set_${set.alias}`;

      if (appliedConstraints.has(constraintId)) continue;

      model.constraints.push({
        variables: new Map([
          [`g_${group.groupAlias}_x2`, 1],
          [`s_${set.alias}_x1`, -1],
          [`g_${group.groupAlias}_${set.alias}_h2_b1`, -M],
        ]),
        operator: '<=',
        rhs: -input.groupMargin,
      });
      model.constraints.push({
        variables: new Map([
          [`s_${set.alias}_x2`, 1],
          [`g_${group.groupAlias}_x1`, -1],
          [`g_${group.groupAlias}_${set.alias}_h2_b2`, -M],
        ]),
        operator: '<=',
        rhs: -input.groupMargin,
      });
      model.constraints.push({
        variables: new Map([
          [`g_${group.groupAlias}_y2`, 1],
          [`s_${set.alias}_y1`, -1],
          [`g_${group.groupAlias}_${set.alias}_h2_b3`, -M],
        ]),
        operator: '<=',
        rhs: -input.groupMargin,
      });
      model.constraints.push({
        variables: new Map([
          [`s_${set.alias}_y2`, 1],
          [`g_${group.groupAlias}_y1`, -1],
          [`g_${group.groupAlias}_${set.alias}_h2_b4`, -M],
        ]),
        operator: '<=',
        rhs: -input.groupMargin,
      });
      model.constraints.push({
        variables: new Map([
          [`g_${group.groupAlias}_${set.alias}_h2_b1`, 1],
          [`g_${group.groupAlias}_${set.alias}_h2_b2`, 1],
          [`g_${group.groupAlias}_${set.alias}_h2_b3`, 1],
          [`g_${group.groupAlias}_${set.alias}_h2_b4`, 1],
        ]),
        operator: '<=',
        rhs: 3,
      });

      model.binaries.add(`g_${group.groupAlias}_${set.alias}_h2_b1`);
      model.binaries.add(`g_${group.groupAlias}_${set.alias}_h2_b2`);
      model.binaries.add(`g_${group.groupAlias}_${set.alias}_h2_b3`);
      model.binaries.add(`g_${group.groupAlias}_${set.alias}_h2_b4`);

      appliedConstraints.add(constraintId);
    }
  }
};

/**
 * [H3] build boundaries for intersecting sets
 */
export const applyIntersectingSetsConstraints: LPApplicableConstraint = (
  data: ClassifiedDataSet,
  input: LPModelInput,
  model: LPNewModel,
) => {
  const appliedConstraints: Set<string> = new Set();
  const M = calculateBigM(input);

  for (const set of data.sets.values()) {
    for (const intersection of set.intersections.values()) {
      const constraintId = combinedAlias(set.alias, intersection.alias);

      if (appliedConstraints.has(constraintId)) continue;

      model.constraints.push({
        variables: new Map([
          [`s_${set.alias}_x2`, 1],
          [`s_${intersection.alias}_x2`, -1],
          [`s_${set.alias}_${intersection.alias}_h3_b1`, M],
        ]),
        operator: '>=',
        rhs: input.groupMargin,
      });
      model.constraints.push({
        variables: new Map([
          [`s_${intersection.alias}_x2`, 1],
          [`s_${set.alias}_x2`, -1],
          [`s_${set.alias}_${intersection.alias}_h3_b1`, -M],
        ]),
        operator: '>=',
        rhs: input.groupMargin - M,
      });

      model.constraints.push({
        variables: new Map([
          [`s_${set.alias}_x1`, 1],
          [`s_${intersection.alias}_x1`, -1],
          [`s_${set.alias}_${intersection.alias}_h3_b2`, M],
        ]),
        operator: '>=',
        rhs: input.groupMargin,
      });
      model.constraints.push({
        variables: new Map([
          [`s_${intersection.alias}_x1`, 1],
          [`s_${set.alias}_x1`, -1],
          [`s_${set.alias}_${intersection.alias}_h3_b2`, -M],
        ]),
        operator: '>=',
        rhs: input.groupMargin - M,
      });

      model.constraints.push({
        variables: new Map([
          [`s_${set.alias}_y1`, 1],
          [`s_${intersection.alias}_y1`, -1],
          [`s_${set.alias}_${intersection.alias}_h3_b3`, M],
        ]),
        operator: '>=',
        rhs: input.groupMargin,
      });
      model.constraints.push({
        variables: new Map([
          [`s_${intersection.alias}_y1`, 1],
          [`s_${set.alias}_y1`, -1],
          [`s_${set.alias}_${intersection.alias}_h3_b3`, -M],
        ]),
        operator: '>=',
        rhs: input.groupMargin - M,
      });

      model.constraints.push({
        variables: new Map([
          [`s_${set.alias}_y2`, 1],
          [`s_${intersection.alias}_y2`, -1],
          [`s_${set.alias}_${intersection.alias}_h3_b4`, M],
        ]),
        operator: '>=',
        rhs: input.groupMargin,
      });
      model.constraints.push({
        variables: new Map([
          [`s_${intersection.alias}_y2`, 1],
          [`s_${set.alias}_y2`, -1],
          [`s_${set.alias}_${intersection.alias}_h3_b4`, -M],
        ]),
        operator: '>=',
        rhs: input.groupMargin - M,
      });

      model.binaries.add(`s_${set.alias}_${intersection.alias}_h3_b1`);
      model.binaries.add(`s_${set.alias}_${intersection.alias}_h3_b2`);
      model.binaries.add(`s_${set.alias}_${intersection.alias}_h3_b3`);
      model.binaries.add(`s_${set.alias}_${intersection.alias}_h3_b4`);

      appliedConstraints.add(constraintId);
    }
  }
};

/**
 * [H4] put the set into the bounding box
 */
export const applySetBoundingBoxConstraints: LPApplicableConstraint = (
  data: ClassifiedDataSet,
  input: LPModelInput,
  model: LPNewModel,
) => {
  for (const set of data.sets.values()) {
    model.constraints.push({
      variables: new Map([[`s_${set.alias}_x1`, 1], ['br_x1', -1]]),
      operator: '>=',
      rhs: 0,
    });
    model.constraints.push({
      variables: new Map([[`s_${set.alias}_y1`, 1], ['br_y1', -1]]),
      operator: '>=',
      rhs: 0,
    });
    model.constraints.push({
      variables: new Map([['br_x2', 1], [`s_${set.alias}_x2`, -1]]),
      operator: '>=',
      rhs: 0,
    });
    model.constraints.push({
      variables: new Map([['br_y2', 1], [`s_${set.alias}_y2`, -1]]),
      operator: '>=',
      rhs: 0,
    });
  }
};

/**
 * [H5] keep minimum distance between set labels this is likely to occur only on intersections,
 * therefore we are saving some complexity here by just ignoring all other cases. Also note
 * we do not introduce new variables here, but rather reuse existing ones from sets for performance
 * optimization reasons.
 */
export const applySetLabelConstraints: LPApplicableConstraint = (
  data: ClassifiedDataSet,
  input: LPModelInput,
  model: LPNewModel,
) => {
  const appliedConstraints: Set<string> = new Set();
  const M = calculateBigM(input);

  for (const set of data.sets.values()) {
    const labelSize = input.setLabelSizes.get(set.alias)!;

    for (const otherSet of set.intersections.values()) {
      const otherLabelSize = input.setLabelSizes.get(otherSet.alias)!;
      const constraintId = combinedAlias(set.alias, otherSet.alias);

      if (appliedConstraints.has(constraintId)) continue;

      model.constraints.push({
        variables: new Map([
          [`s_${set.alias}_x1`, 1],
          [`${labelSize.width}`, 1],
          [`s_${otherSet.alias}_x1`, -1],
          [`l_${set.alias}_${otherSet.alias}_h5_b1`, -M],
        ]),
        operator: '<=',
        rhs: -(labelSize.width + input.groupMargin),
      });
      model.constraints.push({
        variables: new Map([
          [`s_${otherSet.alias}_x1`, 1],
          [`${otherLabelSize.width}`, 1],
          [`s_${set.alias}_x1`, -1],
          [`l_${set.alias}_${otherSet.alias}_h5_b2`, -M],
        ]),
        operator: '<=',
        rhs: -(otherLabelSize.width + input.groupMargin),
      });
      model.constraints.push({
        variables: new Map([
          [`s_${set.alias}_y1`, 1],
          [`${labelSize.height}`, 1],
          [`s_${otherSet.alias}_y1`, -1],
          [`l_${set.alias}_${otherSet.alias}_h5_b3`, -M],
        ]),
        operator: '<=',
        rhs: -(labelSize.height + input.groupMargin),
      });
      model.constraints.push({
        variables: new Map([
          [`s_${otherSet.alias}_y1`, 1],
          [`${otherLabelSize.height}`, 1],
          [`s_${set.alias}_y1`, -1],
          [`l_${set.alias}_${otherSet.alias}_h5_b4`, -M],
        ]),
        operator: '<=',
        rhs: -(otherLabelSize.height + input.groupMargin),
      });
      model.constraints.push({
        variables: new Map([
          [`l_${set.alias}_${otherSet.alias}_h5_b1`, 1],
          [`l_${set.alias}_${otherSet.alias}_h5_b2`, 1],
          [`l_${set.alias}_${otherSet.alias}_h5_b3`, 1],
          [`l_${set.alias}_${otherSet.alias}_h5_b4`, 1],
        ]),
        operator: '<=',
        rhs: 3,
      });

      model.binaries.add(`l_${set.alias}_${otherSet.alias}_h5_b1`);
      model.binaries.add(`l_${set.alias}_${otherSet.alias}_h5_b2`);
      model.binaries.add(`l_${set.alias}_${otherSet.alias}_h5_b3`);
      model.binaries.add(`l_${set.alias}_${otherSet.alias}_h5_b4`);

      appliedConstraints.add(constraintId);
    }
  }
};

/**
 * [H6] build boundaries for non-intersecting sets
 */
export const applyNonIntersectingSetsConstraints: LPApplicableConstraint = (
  data: ClassifiedDataSet,
  input: LPModelInput,
  model: LPNewModel,
) => {
  const appliedConstraints: Set<string> = new Set();
  const M = calculateBigM(input);

  for (const set of data.sets.values()) {
    for (const otherSet of set.disconnections.values()) {
      const constraintId = combinedAlias(set.alias, otherSet.alias);

      if (appliedConstraints.has(constraintId)) continue;

      model.constraints.push({
        variables: new Map([
          [`s_${set.alias}_x2`, 1],
          [`s_${otherSet.alias}_x1`, -1],
          [`s_${set.alias}_${otherSet.alias}_h6_b1`, -M],
        ]),
        operator: '<=',
        rhs: -input.groupMargin,
      });
      model.constraints.push({
        variables: new Map([
          [`s_${otherSet.alias}_x2`, 1],
          [`s_${set.alias}_x1`, -1],
          [`s_${set.alias}_${otherSet.alias}_h6_b2`, -M],
        ]),
        operator: '<=',
        rhs: -input.groupMargin,
      });
      model.constraints.push({
        variables: new Map([
          [`s_${set.alias}_y2`, 1],
          [`s_${otherSet.alias}_y1`, -1],
          [`s_${set.alias}_${otherSet.alias}_h6_b3`, -M],
        ]),
        operator: '<=',
        rhs: -input.groupMargin,
      });
      model.constraints.push({
        variables: new Map([
          [`s_${otherSet.alias}_y2`, 1],
          [`s_${set.alias}_y1`, -1],
          [`s_${set.alias}_${otherSet.alias}_h6_b4`, -M],
        ]),
        operator: '<=',
        rhs: -input.groupMargin,
      });
      model.constraints.push({
        variables: new Map([
          [`s_${set.alias}_${otherSet.alias}_h6_b1`, 1],
          [`s_${set.alias}_${otherSet.alias}_h6_b2`, 1],
          [`s_${set.alias}_${otherSet.alias}_h6_b3`, 1],
          [`s_${set.alias}_${otherSet.alias}_h6_b4`, 1],
        ]),
        operator: '<=',
        rhs: 3,
      });

      model.binaries.add(`s_${set.alias}_${otherSet.alias}_h6_b1`);
      model.binaries.add(`s_${set.alias}_${otherSet.alias}_h6_b2`);
      model.binaries.add(`s_${set.alias}_${otherSet.alias}_h6_b3`);
      model.binaries.add(`s_${set.alias}_${otherSet.alias}_h6_b4`);

      appliedConstraints.add(constraintId);
    }
  }
};

/**
 * [H7] handle fully-contained sets
 */
export const applyFullyContainedSetConstraints: LPApplicableConstraint = (
  data: ClassifiedDataSet,
  input: LPModelInput,
  model: LPNewModel,
) => {
  for (const set of data.sets.values()) {
    if (!set.parent) continue;

    model.constraints.push({
      variables: new Map([
        [`s_${set.alias}_x1`, 1],
        [`s_${set.parent.alias}_x1`, -1],
      ]),
      operator: '>=',
      rhs: input.groupMargin,
    });
    model.constraints.push({
      variables: new Map([
        [`s_${set.alias}_y1`, 1],
        [`s_${set.parent.alias}_y1`, -1],
      ]),
      operator: '>=',
      rhs: input.groupMargin + input.setLabelHeight,
    });
    model.constraints.push({
      variables: new Map([
        [`s_${set.alias}_x2`, 1],
        [`s_${set.parent.alias}_x2`, -1],
      ]),
      operator: '<=',
      rhs: -input.groupMargin,
    });
    model.constraints.push({
      variables: new Map([
        [`s_${set.alias}_y2`, 1],
        [`s_${set.parent.alias}_y2`, -1],
      ]),
      operator: '<=',
      rhs: -input.groupMargin,
    });
  }
};
