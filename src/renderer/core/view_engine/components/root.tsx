import {
  Box,
  Button,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { RootNodeJsonData } from 'renderer/core/model/node/root';
import { listenEdit, listenShowDialogueSettings } from '../event';
import NodeCard from './node_card';

const FormDialog = ({
  close,
  data,
  onSubmit,
}: {
  close: () => void;
  data: RootNodeJsonData;
  onSubmit: (form: RootNodeJsonData) => void;
}) => {
  const [form, setForm] = useState<RootNodeJsonData>(data);
  const handleOnClose = (_: any, reason: string) => {
    if (reason !== 'backdropClick') {
      close();
    }
  };

  const submit = () => {
    onSubmit(form);
  };

  return (
    <Dialog open onClose={handleOnClose}>
      <DialogTitle>Edit Dialogue</DialogTitle>
      <DialogContent sx={{ width: '500px', paddingTop: '20px!important' }}>
        <Stack spacing={2}>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            type="text"
            value={form.data.title}
            fullWidth
            multiline
            onChange={(e: any) => {
              setForm((prev: any) => {
                return {
                  ...prev,
                  data: {
                    ...prev.data,
                    title: e.target.value,
                  },
                };
              });
            }}
            rows={5}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleOnClose}>Cancel</Button>
        <Button onClick={submit}>Confirm</Button>
      </DialogActions>
    </Dialog>
  );
};

const Root = ({
  selecting,
  data,
  onEdit,
  onEditFinish,
}: {
  selecting: boolean;
  data: RootNodeJsonData;
  onEdit: () => void;
  onEditFinish: (confirm: boolean, form?: RootNodeJsonData) => void;
}) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const showEditDialog = () => {
    setEditDialogOpen(true);
    onEdit();
  };

  const closeEditDialog = () => {
    setEditDialogOpen(false);
    onEditFinish(false);
  };

  useEffect(() => {
    const unlistenEdit = listenEdit(() => {
      if (selecting) {
        setEditDialogOpen(true);
      }
    });
    const unlistenShowDialogueEdit = listenShowDialogueSettings(() => {
      setEditDialogOpen(true);
    });

    return () => {
      unlistenEdit();
      unlistenShowDialogueEdit();
    };
  }, [selecting]);
  return (
    <>
      <NodeCard
        selecting={selecting}
        onDoubleClick={showEditDialog}
        normalColor="#ffaa5e"
        hoverColor="#ffd4a3"
        activeColor="#ffecd6"
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          <CardContent
            sx={{
              flex: '1 0 auto',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography
              variant="h4"
              component="div"
              sx={{
                wordBreak: 'break-all',
                color: '#0d2b45',
                userSelect: 'none',
                textAlign: 'center',
              }}
            >
              {data.data.title}
            </Typography>
          </CardContent>
        </Box>
      </NodeCard>
      {editDialogOpen && (
        <FormDialog
          close={closeEditDialog}
          data={data}
          onSubmit={(form) => {
            onEditFinish(true, form);
            setEditDialogOpen(false);
          }}
        />
      )}
    </>
  );
};

export default Root;
