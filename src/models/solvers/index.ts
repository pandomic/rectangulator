import { LPNewModel, LPSolution } from "@/types";

import * as highs from './highs';

const SOLVER_BACKENDS = { highs };
const DEFAULT_SOLVER: keyof typeof SOLVER_BACKENDS = 'highs';

type SolverBackend = keyof typeof SOLVER_BACKENDS;

const getSolverBackend = (solver: SolverBackend = DEFAULT_SOLVER) => {
  if (SOLVER_BACKENDS?.[solver]) return SOLVER_BACKENDS[solver];
  return SOLVER_BACKENDS[DEFAULT_SOLVER];
};

export const encodeModel = (solver: SolverBackend, model: LPNewModel): string => {
  return getSolverBackend(solver).encodeModel(model);
};
 
export const optimizeModel = (solver: SolverBackend, model: LPNewModel): Promise<LPSolution> => {
  return getSolverBackend(solver).optimizeModel(model);
};
