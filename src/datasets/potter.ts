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

const dataset: DataSetPreview = {
  name: 'Harry Potter',
  description: 'A dataset with 4 groups and 4 sets',
  image: 'datasets/dataset_potter.png',
  ...parseData(CSV_DATA, ParserType.CSV),
};

export default dataset;
