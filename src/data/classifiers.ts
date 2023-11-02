import { murmur3 } from 'murmurhash-js';

import { hashSet, difference, isSubset, intersection } from '@/lib/sets';
import { DataSet, GroupedDataSet, ClassifiedSet, ClassifiedGroup, ClassifiedDataSet } from '@/types';

const nameAlias = (name: string): string => murmur3(name).toString();

const buildSetFromName = (name: string): ClassifiedSet => ({
  name,
  alias: nameAlias(name),
  intersections: new Map(),
  disconnections: new Map(),
});

const buildGroupFromLabelsAndValues = (labels: Set<string>, values: Set<string>): ClassifiedGroup => ({
  labels,
  values,
  inclusionSets: new Map(),
  exclusionSets: new Map(),
  groupAlias: hashSet(labels)
});

export const groupDataSet = (data: DataSet): GroupedDataSet => {
  const groupedData: Map<Set<string>, Set<string>> = new Map();

  // workaround for js set equality
  const hashedGroups: Map<string, Set<string>> = new Map();

  data.dataWithLabels.forEach((labels, value) => {
    const hash = Array.from(labels).sort().join(",");

    if (!hashedGroups.has(hash)) {
      hashedGroups.set(hash, new Set());
    }

    hashedGroups.get(hash)?.add(value);
  });

  // transforming a workarounded map into a normal one
  hashedGroups.forEach((values, labelsString) => {
    groupedData.set(new Set(labelsString.split(",")), values);
  });

  return { ...data, groupedData };
};

export const classifyDataSet = (data: GroupedDataSet): ClassifiedDataSet => {
  const hashedSets: [string, ClassifiedSet][] = [...data.labels].map(
    (label) => [nameAlias(label), buildSetFromName(label)],
  );

  const groups = new Map<string, ClassifiedGroup>();
  const sets = new Map<string, ClassifiedSet>([...hashedSets]);

  // identify set-set relationships
  for (const [label, values] of data.labelsWithData) {
    const setAlias = nameAlias(label);
    const set = sets.get(setAlias);

    if (!set) {
      throw new Error('Something went wrong, set is missing in the hashmap!');
    }

    for (const [otherLabel, otherValues] of data.labelsWithData) {
      if (label === otherLabel) continue;

      const otherSet = sets.get(nameAlias(otherLabel));

      if (!otherSet) throw new Error('Something went wrong, other set is missing in the hashmap!');

      if (isSubset(otherValues, values)) {
        otherSet.parent = set;
        continue;
      }

      const setsIntersection = intersection(values, otherValues);

      if (setsIntersection.size > 0) {
        set.intersections.set(otherSet.alias, otherSet);
      } else {
        set.disconnections.set(otherSet.alias, otherSet);
      }
    }
  }

  // establish group-set relationships
  for (const [labels, values] of data.groupedData) {
    // include this group in each set it appears in
    const group = buildGroupFromLabelsAndValues(labels, values);

    for (const label of labels) {
      const set = sets.get(nameAlias(label));

      if (!set) {
        throw new Error('Something went wrong, set is missing in the hashmap!');
      }

      group.inclusionSets.set(set.alias, set);
    }

    for (const [otherLabels,] of data.groupedData) {
      if (labels === otherLabels) continue;

      // note diff == 0 means we have an error in the grouping logic
      const rejectedLabels = difference(otherLabels, labels);

      if (rejectedLabels.size > 0) {
        for (const rejectedLabel of rejectedLabels) {
          const rejectedSet = sets.get(nameAlias(rejectedLabel));

          if (!rejectedSet) {
            throw new Error('Something went wrong, rejected set is missing in the hashmap!');
          }

          group.exclusionSets.set(rejectedSet.alias, rejectedSet);
        }
      }
    }

    groups.set(group.groupAlias, group);
  }

  return { groups, sets };
};
