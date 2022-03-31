import DeleteItcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
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
  Divider,
  FormControlLabel,
  FormGroup,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useCallback, useContext, useEffect, useState } from 'react';
import { LinkData } from 'renderer/core/model/node/link';
import useListWithKey from 'renderer/hooks/use_list_with_key';
import Context from '../context';

const FlagItem = ({
  item,
  onChange,
  onDelete,
}: {
  item: { id: string; match: boolean };
  onChange: (val: { id: string; match: boolean }) => void;
  onDelete: () => void;
}) => (
  <Grid item xs={6}>
    <Stack spacing={1} direction="row" sx={{ alignItems: 'center' }}>
      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox
              checked={item.match}
              value={item.match}
              size="small"
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
        size="small"
        fullWidth
        required
        value={item.id}
        onChange={(e: any) => {
          onChange({ ...item, id: e.target.value });
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
  flags: { id: string; match: boolean }[];
  onChange: (val: { id: string; match: boolean }[]) => void;
}) => {
  const [list, { updateAt, removeAt, push }] =
    useListWithKey<{ id: string; match: boolean }>(flags);

  useEffect(() => {
    onChange(list.map((item) => item.data));
  }, [list, onChange]);

  return (
    <Stack spacing={1}>
      <Grid container spacing={2}>
        {list.map((item, i) => {
          return (
            <FlagItem
              key={item.key}
              item={item.data}
              onChange={(val) => {
                updateAt(i, val);
              }}
              onDelete={() => {
                removeAt(i);
              }}
            />
          );
        })}
      </Grid>
      <Button
        variant="contained"
        onClick={() => {
          push({
            id: '',
            match: true,
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
  const { owner } = useContext(Context);
  const [form, setForm] = useState<LinkData>({
    ...data,
    contentI18n:
      source.type === 'branch'
        ? owner?.owner.dataProvider.data.i18nData[
            owner?.owner.dataProvider.currentLang
          ][data.optionName] || ''
        : '',
  });
  const handleOnClose = (_: any, reason: string) => {
    if (reason !== 'backdropClick') {
      close();
    }
  };

  const submit = () => {
    onSubmit(form);
    close();
  };

  const onFlagListChange = useCallback((val) => {
    setForm((prev) => {
      return { ...prev, transferFlags: val };
    });
  }, []);

  const onOptionIdChange = useCallback((e) => {
    setForm((prev) => {
      return { ...prev, optionId: e.target.value };
    });
  }, []);

  const onOptionNameI18nKeyChange = useCallback((e) => {
    setForm((prev) => {
      return { ...prev, optionName: e.target.value };
    });
  }, []);

  const onOptionNameContentChange = useCallback(
    (e) => {
      if (!owner) {
        return;
      }

      setForm((prev) => {
        const currentLang = owner.owner.dataProvider.currentLang as string;
        owner.owner.dataProvider.data.i18nData[currentLang][prev.optionName] =
          e.target.value;
        return { ...prev, contentI18n: e.target.value };
      });
    },
    [owner]
  );

  const onHiddenOptionFlagsChange = useCallback((val) => {
    setForm((prev) => {
      return { ...prev, hiddenOptionFlags: val };
    });
  }, []);
  const onDisableOptionFlagsChange = useCallback((val) => {
    setForm((prev) => {
      return { ...prev, disableOptionFlags: val };
    });
  }, []);
  const sentenceContent = (
    <Card>
      <CardHeader subheader="Transfer flags" />
      <CardContent>
        <FlagList
          flags={form.transferFlags || []}
          onChange={onFlagListChange}
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
          onChange={onOptionIdChange}
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          margin="dense"
          label="Option name i18n key"
          type="text"
          fullWidth
          size="small"
          required
          value={form.optionName || ''}
          onChange={onOptionNameI18nKeyChange}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          margin="dense"
          label="Option name"
          type="text"
          fullWidth
          size="small"
          required
          value={form.contentI18n}
          onChange={onOptionNameContentChange}
        />
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardHeader subheader="Hidden option flags" />
          <CardContent>
            <FlagList
              flags={form.hiddenOptionFlags || []}
              onChange={onHiddenOptionFlagsChange}
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
              onChange={onDisableOptionFlagsChange}
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
  const midpoint = [
    (from.x + target.x) / 2 - (from.data.type === 'branch' ? 120 : 55),
    (from.y + target.y) / 2 - (from.data.type === 'branch' ? 70 : 15),
  ];

  const { owner } = useContext(Context);
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

  const contentI18n =
    from.data.type === 'branch'
      ? owner?.owner.dataProvider.data.i18nData[
          owner?.owner.dataProvider.currentLang
        ][linkData.optionName] || ''
      : '';
  return (
    <div
      style={{
        transform: `translate(${midpoint[1]}px,${midpoint[0]}px)`,
        position: 'absolute',
      }}
    >
      <Stack spacing={1} sx={{ alignItems: 'center' }}>
        {from.data.type === 'branch' && (
          <Stack
            sx={{
              alignItems: 'center',
              backgroundColor: '#ffaa5e',
              padding: '4px',
              borderRadius: '24px',
              width: '150px',
              height: '50px',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                userSelect: 'none',
                color: '#0d2b45',
                textAlign: 'center',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                width: '100%',
                lineHeight: 1.2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <div>{linkData.optionId}</div>
              {linkData.optionName && linkData.optionId && (
                <Divider sx={{ backgroundColor: '#0d2b45', width: '80%' }} />
              )}
              <div>{contentI18n}</div>
            </Typography>
          </Stack>
        )}
        <SettingsIcon
          sx={{
            color: '#ffd4a3',
            cursor: 'pointer',
            fontSize: '48px',
            pointerEvents: 'initial',
          }}
          onClick={showEditDialog}
        />
      </Stack>

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
