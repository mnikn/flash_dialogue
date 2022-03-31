import DeleteItcon from '@mui/icons-material/Delete';
import { Button, Grid, Stack } from '@mui/material';
import { ReactNode, useEffect } from 'react';
import useListWithKey from 'renderer/hooks/use_list_with_key';

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
  onItemAdd,
  onItemRemove,
  onItemUpdate,
}: {
  data: any[];
  onChange: (val: any[]) => void;
  onItemAdd?: (val: any) => void;
  onItemRemove?: (i: number) => void;
  onItemUpdate?: (i: number, val: any) => void;
  createNewItem: () => any;
  renderItem: (val: any, onChange: (val: any) => void) => ReactNode;
  canDelete?: (val: any) => boolean;
}) => {
  const [list, { updateAt, removeAt, push }] = useListWithKey(data);

  useEffect(() => {
    onChange(list.map((item) => item.data));
  }, [list, onChange]);

  return (
    <Stack spacing={1}>
      <Grid container spacing={2} sx={{ maxHeight: '150px', overflow: 'auto' }}>
        {list.map((item, i) => {
          return (
            <GridItem
              key={item.key}
              item={item.data}
              renderItem={renderItem}
              onChange={(val) => {
                updateAt(i, val);
                if (onItemUpdate) {
                  onItemUpdate(i, val);
                }
              }}
              canDelete={canDelete}
              onDelete={() => {
                removeAt(i);
                if (onItemRemove) {
                  onItemRemove(i);
                }
              }}
            />
          );
        })}
      </Grid>
      <Button
        variant="contained"
        onClick={() => {
          const newVal = createNewItem();
          push(newVal);
          if (onItemAdd) {
            onItemAdd(newVal);
          }
        }}
      >
        Add item
      </Button>
    </Stack>
  );
};

export default GridForm;
