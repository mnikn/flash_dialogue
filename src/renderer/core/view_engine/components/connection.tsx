import SettingsIcon from '@mui/icons-material/Settings';
import DeleteItcon from '@mui/icons-material/Delete';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  Grid,
  Stack,
  TextField,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { LinkData } from 'renderer/core/model/node/link';

const FlagItem = ({
  item,
  onChange,
  onDelete,
}: {
  item: { flag: string; match: boolean };
  onChange: (val: { flag: string; match: boolean }) => void;
  onDelete: () => void;
}) => (
  <Grid item xs={6}>
    <Stack spacing={0} direction="row" sx={{ alignItems: 'center' }}>
      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox
              checked={item.match}
              value={item.match}
              onChange={(e) => {
                onChange({ ...item, match: e.target.checked });
              }}
            />
          }
          label="Match"
        />
      </FormGroup>
      <TextField
        margin="dense"
        label="Flag"
        type="text"
        fullWidth
        required
        value={item.flag}
        onChange={(e: any) => {
          onChange({ ...item, flag: e.target.value });
        }}
      />
      <DeleteItcon sx={{ cursor: 'pointer' }} onClick={onDelete} />
    </Stack>
  </Grid>
);

const FlagList = ({
  flags,
  onChange,
}: {
  flags: { flag: string; match: boolean }[];
  onChange: (val: { flag: string; match: boolean }[]) => void;
}) => {
  const [list, setList] = useState<{ flag: string; match: boolean }[]>(flags);

  useEffect(() => {
    onChange(list);
  }, [list]);

  return (
    <Stack spacing={1}>
      <Grid container spacing={2}>
        {list.map((item, i) => {
          return (
            <FlagItem
              key={i}
              item={item}
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
            return prev.concat({ flag: '', match: true });
          });
        }}
      >
        Add flag
      </Button>
    </Stack>
  );
};

const FormDialog = ({
  close,
  data,
  source,
  onSubmit,
}: {
  close: () => void;
  data: LinkData;
  source: any;
  onSubmit: (form: LinkData) => void;
}) => {
  const [form, setForm] = useState<LinkData>(data);
  const handleOnClose = (_: any, reason: string) => {
    if (reason !== 'backdropClick') {
      close();
    }
  };

  const submit = () => {
    onSubmit(form);
    close();
  };

  const sentenceContent = (
    <Card>
      <CardHeader subheader="Transfer flags" />
      <CardContent>
        <FlagList
          flags={form.transferFlags || []}
          onChange={(val) => {
            form.transferFlags = val;
            setForm((prev) => {
              return { ...prev };
            });
          }}
        />
      </CardContent>
    </Card>
  );

  const branchContent = (
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <TextField
          margin="dense"
          label="Option id"
          type="text"
          fullWidth
          size="small"
          required
          value={form.optionId || ''}
          onChange={(e) => {
            form.optionId = e.target.value;
            setForm((prev) => {
              return { ...prev };
            });
          }}
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          margin="dense"
          label="Option name"
          type="text"
          fullWidth
          size="small"
          required
          value={form.optionName || ''}
          onChange={(e) => {
            form.optionName = e.target.value;
            setForm((prev) => {
              return { ...prev };
            });
          }}
        />
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardHeader subheader="Hidden option flags" />
          <CardContent>
            <FlagList
              flags={form.hiddenOptionFlags || []}
              onChange={(val) => {
                form.hiddenOptionFlags = val;
                setForm((prev) => {
                  return { ...prev };
                });
              }}
            />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardHeader subheader="Disable option flags" />
          <CardContent>
            <FlagList
              flags={form.disableOptionFlags || []}
              onChange={(val) => {
                form.disableOptionFlags = val;
                setForm((prev) => {
                  return { ...prev };
                });
              }}
            />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <Dialog open onClose={handleOnClose}>
      <DialogTitle>Edit link</DialogTitle>
      <DialogContent
        sx={{
          width: '500px',
          minHeight: '300px',
          paddingTop: '20px!important',
        }}
      >
        {(source.type === 'sentence' || source.type === 'root') &&
          sentenceContent}
        {source.type === 'branch' && branchContent}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleOnClose}>Cancel</Button>
        <Button onClick={submit}>Confirm</Button>
      </DialogActions>
    </Dialog>
  );
};

const Connection = ({
  from,
  target,
  linkData,
  onChange,
  onEdit,
  onEditFinish,
}: {
  from: any;
  target: any;
  linkData: any;
  onChange: (val: LinkData) => void;
  onEdit?: () => void;
  onEditFinish?: () => void;
}) => {
  const midpoint = [(from.x + target.x) / 2 - 55, (from.y + target.y) / 2 - 15];

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const showEditDialog = () => {
    setEditDialogOpen(true);
    if (onEdit) {
      onEdit();
    }
  };

  const closeEditDialog = () => {
    setEditDialogOpen(false);
    if (onEditFinish) {
      onEditFinish();
    }
  };

  return (
    <div
      style={{
        transform: `translate(${midpoint[1]}px,${midpoint[0]}px)`,
        position: 'absolute',
      }}
    >
      <SettingsIcon
        sx={{
          color: '#ffd4a3',
          cursor: 'pointer',
          fontSize: '48px',
          pointerEvents: 'initial',
        }}
        onClick={showEditDialog}
      />

      {editDialogOpen && (
        <FormDialog
          close={closeEditDialog}
          data={linkData}
          source={from.data}
          onSubmit={(data) => {
            onChange(data);
          }}
        />
      )}
    </div>
  );
};

export default Connection;
