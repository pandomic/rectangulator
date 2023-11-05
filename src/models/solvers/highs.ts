import * as path from 'path';
import highs from 'highs';
import { app } from 'electron';
import isDev from 'electron-is-dev';
import child_process from 'child_process';
import tmp from 'tmp';
import fs from 'fs';
import { Column, Row, Solution } from 'highs';
import util from 'util';

import { LPEncoder, LPNewModel, LPSolution, LPSolver } from "@/types";

const binariesPath: string = isDev
  ? path.join(app.getAppPath(), 'dist', 'binaries')
  : path.join(process.resourcesPath, 'dist', 'binaries');

const exec = util.promisify(child_process.exec);

const HIGHS_MAP: Record<string, Record<string, string>> = {
  darwin: {
    arm64: path.join(binariesPath, 'highs_darwin_arm64'),
  },
};

const highs_settings = {
  locateFile: (file: string) => path.join(binariesPath, file),
};

const getWasmOptimizer = async () => highs(highs_settings);

const getBinaryOptimizer = async (platform: string, arch: string) => {
  const binary = HIGHS_MAP[platform][arch];

  const solve = async (model: string): Promise<Solution> => {
    const tempPath = app.getPath('temp');

    const tempModelFile = tmp.fileSync({ dir: tempPath, postfix: '.lp' });
    const tempSolutionFile = tmp.fileSync({ dir: tempPath, postfix: '.sol' });

    fs.writeSync(tempModelFile.fd, model);

    const settings = {
      '--parallel': 'on',
      '--presolve': 'on',
      '--model_file': tempModelFile.name,
      '--solution_file': tempSolutionFile.name,
    };

    const settingsString = Object.entries(settings).map(([key, value]) => `${key} ${value}`).join(' ');
    const highsCmd = `${binary} ${settingsString}`;

    let status = 'Infeasible';
    const columns: Record<string, Column> = {};
    const rows: Row[] = [];

    try {
      console.log(highsCmd);

      const { stderr, stdout } = await exec(highsCmd);

      console.log(stdout);
      console.error(stderr);

      const solutionContent = fs.readFileSync(tempSolutionFile.name, 'utf8');
      const fileRows = solutionContent.split('\n');

      let collectingColumns = false;
      let collectingRows = false;
      let collectingStatus = false;

      for (const row of fileRows) {
        if (row.startsWith('Model status')) {
          collectingStatus = true;
          collectingColumns = false;
          collectingRows = false;
          continue;
        }

        if (row.startsWith('# Columns')) {
          collectingColumns = true;
          collectingRows = false;
          continue;
        }

        if (row.startsWith('# Rows')) {
          collectingRows = true;
          collectingColumns = false;
          continue;
        }

        if (collectingStatus) {
          status = row;
          collectingStatus = false;
        }

        if (collectingColumns) {
          const [colName, colValue] = row.split(' ');
          columns[colName] = {
            Index: 0,
            Lower: 0,
            Upper: 0,
            Primal: colValue.includes('.') ? Number.parseFloat(colValue) : Number.parseInt(colValue),
            Type: colValue.includes('.') ? 'continuous' : 'integer',
            Name: colName,
          };
          continue;
        }

        if (collectingRows) {
          const [rowName,] = row.split(' ');
          rows.push({
            Index: 0,
            Lower: 0,
            Upper: 0,
            Name: rowName,
          });
        }
      }
    } catch (error) {
      console.error(error);
    }

    return {
      Status: status as 'Optimal' | 'Infeasible' | 'Unbounded',
      Columns: columns,
      Rows: rows,
    };
  };

  return { solve };
};

const getOptimizer = async () => {
  const platform = process.platform;
  const arch = process.arch;

  // fallback options - WASM build
  if (!HIGHS_MAP[platform]?.[arch]) {
    return getWasmOptimizer();
  }

  return getBinaryOptimizer(platform, arch);
};

export const encodeModel: LPEncoder = (model: LPNewModel): string => {
  const objective = model.objective.join(' + ');

  const constraints = model.constraints.map((constraint) => {
    const constraintName = constraint.name ? `${constraint.name}: ` : '';

    const constraintString = Array.from(constraint.variables.entries()).map(([variable, coefficient]) => (
      `${coefficient} ${variable}`
    )).join(' + ');

    return `${constraintName}${constraintString} ${constraint.operator} ${constraint.rhs}`;
  }).join('\n');

  const binaries = Array.from(model.binaries).join('\n');
  const generals = Array.from(model.generals).join('\n');

  const modelParts = [
    'Minimize',
    `objective: ${objective}`,
    'Subject To',
    constraints,
    'BINARY',
    binaries,
    'GENERAL',
    generals,
    'End',
  ];

  return modelParts.join('\n');
};

export const optimizeModel: LPSolver = async (model: LPNewModel): Promise<LPSolution> => {
  const optimizer = await getOptimizer();
  return optimizer.solve(encodeModel(model));
};
