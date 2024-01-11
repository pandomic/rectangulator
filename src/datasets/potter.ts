import { parseData, ParserType } from '@/data';
import { DataSetPreview } from '@/types';

const CSV_DATA =
`Animal,Ghost,Deatheater,Animagus,Alive,Student,Muggle-born,Griffindor,Wizard
Ms.Norris,Myrte,Wormtail,Remus,Ms.Norris,Draco,Hermione,Dumbledore,Dumbledore
,,Draco,Sirius,Dumbledore,Harry,Lily,Hagrid,Hagrid
,,,Wormtail,Hagrid,Ron,,Remus,Remus
,,,,Remus,Hermione,,Sirius,Sirius
,,,,Sirius,,,Wormtail,Wormtail
,,,,Wormtail,,,Harry,Draco
,,,,Draco,,,Ron,Harry
,,,,Harry,,,Hermione,Ron
,,,,Ron,,,Lily,Hermione
,,,,Hermione,,,James,Lily
,,,,Petunia,,,,James
,,,,Dudley,,,,Myrte
,,,,Vernon,,,,Grindelwald`;

const parsedData = parseData(CSV_DATA, ParserType.CSV);

const dataset: DataSetPreview = {
  name: 'Harry Potter',
  description: `A custom dataset with ${parsedData.labels.size} labels and ${parsedData.dataWithLabels.size} data points`,
  image: 'datasets/dataset_potter.png',
  ...parsedData,
};

export default dataset;
