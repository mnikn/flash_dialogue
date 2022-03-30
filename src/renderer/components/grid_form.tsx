import { Button, Grid, Stack } from '@mui/material';
import DeleteItcon from '@mui/icons-material/Delete';
import { ReactNode, useEffect, useState } from 'react';

const GridItem = ({
  item,
  onChange,
  onDelete,
  renderItem,
  canDelete,
}: {
  item: any;
  onChange: (val: any) => void;
  onDelete: () => void;
  renderItem: (val: any, onChange: (val: any) => void) => ReactNode;
  canDelete?: (val: any) => boolean;
}) => (
  <Grid item xs={6}>
    <Stack spacing={1} direction="row" sx={{ alignItems: 'center' }}>
      {renderItem(item, onChange)}
      {(!canDelete || canDelete(item)) && (
        <DeleteItcon sx={{ cursor: 'pointer' }} onClick={onDelete} />
      )}
    </Stack>
  </Grid>
);

const GridForm = ({
  data,
  renderItem,
  createNewItem,
  onChange,
  canDelete,
}: {
  data: any[];
  onChange: (val: any[]) => void;
  createNewItem: () => any;
  renderItem: (val: any, onChange: (val: any) => void) => ReactNode;
  canDelete?: (val: any) => boolean;
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
              canDelete={canDelete}
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
