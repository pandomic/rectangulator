import { ReactElement } from 'react';
import { Card, CardContent, CardMedia, Typography, CardActions, Button } from '@mui/material';
import { DataSetPreview } from "@/types";

export interface DatasetProps {
  dataset: DataSetPreview;
  onClick?: (dataset: DataSetPreview) => unknown;
}


export const Dataset = ({ dataset, onClick }: DatasetProps): ReactElement => {
  return (
    <Card>
      <CardContent>
        {dataset.image && (
          <CardMedia
            sx={{ height: 140 }}
            image={dataset.image}
            title={`Dataset Preview: ${dataset.name}`}
          />
        )}
        <Typography gutterBottom variant="h5" component="div">
         {dataset.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {dataset.description}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" onClick={() => onClick?.(dataset)}>Explore</Button>
      </CardActions>
    </Card>
  );
};
