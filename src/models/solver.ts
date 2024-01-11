import * as path from 'path';
import highs from 'highs';
import { app } from 'electron';
import child_process from 'child_process';
import tmp from 'tmp';
import fs from 'fs';
import { Column, Row, Solution } from 'highs';
import util from 'util';

const exec = util.promisify(child_process.exec);

const HIGHS_MAP: Record<string, Record<string, [string, string]>> = {
  darwin: {
    arm64: [path.join(app.getAppPath(), 'dist', 'binaries'), './highs_darwin_arm64'],
  },
};

const highs_settings = {
  locateFile: (file: string) => `/${file}`
};

export const getWasmMIPOptimizer = async (overrides?: Record<string, string>) =>
  highs({ ...highs_settings, ...overrides });

export const getBinaryMIPOptimizer = async (platform: string, arch: string, overrides?: Record<string, string>) => {
  const [cwd, binary] = HIGHS_MAP[platform][arch];

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
      ...overrides,
    };
    const settingsString = Object.entries(settings).map(([key, value]) => `${key} ${value}`).join(' ');

    const highsCmd = `${binary} ${settingsString}`;


    let status = 'Infeasible';
    const columns: Record<string, Column> = {};
    const rows: Row[] = [];

    try {
      console.log('cwd', cwd);
      console.log(highsCmd);

      const { stderr, stdout } = await exec(highsCmd, { cwd });

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


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getMIPOptimizer = async (overrides?: any) => {
  const platform = process.platform;
  const arch = process.arch;

  // fallback options - WASM build
  if (!HIGHS_MAP[platform]?.[arch]) {
    return getWasmMIPOptimizer(overrides);
  }

  return getBinaryMIPOptimizer(platform, arch, overrides);
};