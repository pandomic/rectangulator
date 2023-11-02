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

const dataset: DataSetPreview = {
  name: '4 Venn',
  description: 'A dataset with 4 groups and 4 sets',
  image: 'datasets/dataset_venn.png',
  ...parseData(CSV_DATA, ParserType.CSV),
};

export default dataset;
