import { parseData, ParserType } from '@/data';
import { DataSetPreview } from '@/types';

const CSV_DATA = `Vitamin A,Vitamin B,Vitamin C,Vitamin D,Vitamin E,Vitamin K
Papaya,Tomato,Cabbage,Cod-Liver Oil,Butter,Soy-Beans
Mango,Vegetables,Cucumber,Fish,Milk,Tomato
Carrot,Wholegrain cereals,Orange,Butter,Egg,Vegetables
Liver,Peanut,Grapes,Milk,Green vegetables,Vegetable Oil
Cod-Liver Oil,Mutton,Lemon,Egg,Wheat Germ Oil,Meat
Butter,Potato,Guava,,Banana,
Milk,Yeast,Amla,,Apple,
Egg,,Green vegetables,,Soy-Beans,
,,Tomato,,,`;

const parsedData = parseData(CSV_DATA, ParserType.CSV);

const dataset: DataSetPreview = {
  name: 'Vitamins',
  description: `A custom dataset with ${parsedData.labels.size} labels and ${parsedData.dataWithLabels.size} data points`,
  image: 'datasets/dataset_vitamins.png',
  ...parsedData,
};

export default dataset;
