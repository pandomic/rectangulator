import { murmur3 } from 'murmurhash-js';

export const difference = <T>(setA: Set<T>, setB: Set<T>): Set<T> => {
  return new Set([...setA].filter((x) => !setB.has(x)));
}

export const intersection = <T>(setA: Set<T>, setB: Set<T>): Set<T> => {
  return new Set([...setA].filter((x) => setB.has(x)));
}

export const union = <T>(setA: Set<T>, setB: Set<T>): Set<T> => {
  return new Set([...setA, ...setB]);
}

/**
 * Checks if setA is a subset of setB
 * @param setA
 * @param setB
 */
export const isSubset = <T>(setA: Set<T>, setB: Set<T>): boolean => {
  return [...setA].every(val => [...setB].includes(val));
}

export const hashSet = (set: Set<string>): string => {
  return murmur3(Array.from(set).sort().join(",")).toString();
}