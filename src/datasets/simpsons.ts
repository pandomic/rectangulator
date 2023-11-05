import { parseData, ParserType } from '@/data';
import { DataSetPreview } from '@/types';

const CSV_DATA = `Male,Duff Fan,Power Plant,Evil,School,Blue Hair
Kent Brockman,Barney,Lenny Leonard,Krusty,Martin Prince,Milhouse
Grampa,Mo,Carl Carlson,Nelson,Bart,Marge
Ned,Krusty,Homer,Mr. Burns,Ralph,Jacqueline Bouvier
Barney,Lenny Leonard,,Smithers,Nelson,
Mo,Carl Carlson,,Sideshow Bob,Milhouse,
Martin Prince,Homer,,Fat Tony,Lisa,
Bart,,,,,
Ralph,,,,,
Krusty,,,,,
Nelson,,,,,
Milhouse,,,,,
Lenny Leonard,,,,,
Carl Carlson,,,,,
Homer,,,,,
Mr. Burns,,,,,
Smithers,,,,,
Sideshow Bob,,,,,
Fat Tony,,,,,`;

const parsedData = parseData(CSV_DATA, ParserType.CSV);

const dataset: DataSetPreview = {
  name: 'Simpsons',
  description: `A dataset with ${parsedData.labels.size} labels and ${parsedData.dataWithLabels.size} data points`,
  image: 'datasets/dataset_simpsons.png',
  ...parsedData,
};

export default dataset;
