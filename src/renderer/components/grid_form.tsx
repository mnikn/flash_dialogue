import { Button, Grid, Stack } from '@mui/material';
import DeleteItcon from '@mui/icons-material/Delete';
import { ReactNode, useEffect, useState } from 'react';

const GridItem = ({
  item,
  onChange,
  onDelete,
  renderItem,
}: {
  item: any;
  onChange: (val: any) => void;
  onDelete: () => void;
  renderItem: (val: any, onChange: (val: any) => void) => ReactNode;
}) => (
  <Grid item xs={6}>
    <Stack spacing={1} direction="row" sx={{ alignItems: 'center' }}>
      {renderItem(item, onChange)}
      <DeleteItcon sx={{ cursor: 'pointer' }} onClick={onDelete} />
    </Stack>
  </Grid>
);

const GridForm = ({
  data,
  renderItem,
  createNewItem,
  onChange,
}: {
  data: any[];
  onChange: (val: any[]) => void;
  createNewItem: () => any;
  renderItem: (val: any, onChange: (val: any) => void) => ReactNode;
}) => {
  const [list, setList] = useState<any[]>(data);

  useEffect(() => {
    onChange(list);
  }, [list]);

  return (
    <Stack spacing={1}>
      <Grid container spacing={2} sx={{ maxHeight: '150px', overflow: 'auto' }}>
        {list.map((item, i) => {
          return (
            <GridItem
              key={i}
              item={item}
              renderItem={renderItem}
              onChange={(val) => {
                list[i] = val;
                setList((prev) => {
                  return [...prev];
                });
              }}
              onDelete={() => {
                setList((prev) => {
                  return prev.filter((_, j) => j !== i);
                });
              }}
            />
          );
        })}
      </Grid>
      <Button
        variant="contained"
        onClick={() => {
          setList((prev) => {
            return prev.concat(createNewItem());
          });
        }}
      >
        Add item
      </Button>
    </Stack>
  );
};

export default GridForm;
