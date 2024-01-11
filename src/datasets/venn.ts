import { parseData, ParserType } from '@/data';
import { DataSetPreview } from '@/types';

const CSV_DATA = `A,B,C,D
a,b,c,d
ab,abc,cd,cd
abc,abcd,ac,acd
abcd,abd,acd,ad
abd,ab,abc,abcd
acd,bc,abcd,abd
ad,bcd,bc,bcd
ac,bd,bcd,bd`;

const parsedData = parseData(CSV_DATA, ParserType.CSV);

const dataset: DataSetPreview = {
  name: '4 Venn',
  description: `A custom dataset with ${parsedData.labels.size} labels and ${parsedData.dataWithLabels.size} data points`,
  image: 'datasets/dataset_venn.png',
  ...parsedData,
};

export default dataset;
