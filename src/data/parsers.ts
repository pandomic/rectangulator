import { DataSet } from '@/types';

export enum ParserType {
  CSV = 'csv'
}

export type ParserFunction = (data: string) => DataSet;

export const parseCsvData: ParserFunction = (data: string): DataSet => {
  const adjustedData = data.replace(/\r/g, "");

  const lines = adjustedData.split("\n");
  const labels = lines[0].split(",");

  const entities: [string, Set<string>][] = labels.map((label) => [label, new Set()]);

  const parsedData: DataSet = {
    labelsWithData: new Map([...entities]),
    dataWithLabels: new Map(),
    labels: new Set(labels),
    values: new Set(),
  };

  for (const line of lines.slice(1)) {
    const values = line.split(",");

    values.forEach(parsedData.values.add, parsedData.values);

    for (const valueIdx in values) {
      if (!values[valueIdx]) continue;

      // map values to labels
      parsedData.labelsWithData.get(labels[valueIdx])?.add(values[valueIdx]);

      // map labels to values
      if (!parsedData.dataWithLabels.has(values[valueIdx])) {
        parsedData.dataWithLabels.set(values[valueIdx], new Set());
      }
      parsedData.dataWithLabels.get(values[valueIdx])?.add(labels[valueIdx]);
    }
  }

  return parsedData;
};

export const parseData = (data: string, type: ParserType): DataSet => {
  switch (type) {
    case ParserType.CSV:
      return parseCsvData(data);
    default:
      throw new Error(`Unknown parser type: ${type}`);
  }
};
