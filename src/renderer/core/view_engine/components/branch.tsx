import {
  Box,
  Button,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  TextField,
  Typography,
  MenuItem,
} from '@mui/material';
import { useState } from 'react';
import { DialogueTreeSentenceJson } from 'renderer/core';
import NodeCard from './node_card';

const FormDialog = ({
  close,
  data,
  onSubmit,
}: {
  close: () => void;
  data: DialogueTreeSentenceJson;
  onSubmit: (form: DialogueTreeSentenceJson) => void;
}) => {
  const [form, setForm] = useState<any>(data);
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
      <DialogTitle>Edit sentence</DialogTitle>
      <DialogContent sx={{ width: '500px' }}>
        <FormControl fullWidth>
          <InputLabel id="demo-simple-select-label">Actor</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            label={'Actor'}
            size="small"
          >
            <MenuItem>None</MenuItem>
            <MenuItem>Test</MenuItem>
          </Select>
        </FormControl>
        <TextField
          autoFocus
          margin="dense"
          label="Content"
          type="text"
          value={form.data.content}
          fullWidth
          multiline
          onChange={(e) => {
            setForm((prev: any) => {
              return {
                ...prev,
                data: {
                  ...prev.data,
                  content: e.target.value,
                },
              };
            });
          }}
          rows={5}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleOnClose}>Cancel</Button>
        <Button onClick={submit}>Confirm</Button>
      </DialogActions>
    </Dialog>
  );
};

const Branch = ({
  selecting,
  data,
  onEdit,
  onEditFinish,
}: {
  selecting: boolean;
  data: DialogueTreeSentenceJson;
  onEdit: () => void;
  onEditFinish: (confirm: boolean, form?: DialogueTreeSentenceJson) => void;
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
  return (
    <>
      <NodeCard
        selecting={selecting}
        onDoubleClick={showEditDialog}
        normalColor={'#7145FF'}
        hoverColor={'#B48AFF'}
        activeColor={'#D5BDFF'}
      >
        <div
          style={{
            width: '144px',
            flexShrink: 0,
            padding: '4px',
            borderRadius: '36px',
            margin: '12px',
            backgroundColor: '#0d2b45',
          }}
        >
          <img
            src="https://isscdn.mildom.tv/download/file/jp/mildom/nnphotos/2ac6c6a908675de29d61ff299f983d0e.png?size=mini&format=jpg&quality=80"
            style={{
              height: '100%',
              width: '100%',
              backgroundColor: '#0d2b45',
              borderRadius: '36px',
            }}
          />
        </div>

        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <CardContent sx={{ flex: '1 0 auto' }}>
            <Typography
              className="testss"
              variant="subtitle1"
              color="text.secondary"
              component="div"
              sx={{
                wordBreak: 'break-all',
                color: '#fff',
              }}
            >
              {data.data?.content}
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

/* const LinkAction = () => {
 *   return <AddCircleIcon sx={{ color: '#ffd4a3', cursor: 'pointer' }} />;
 * }; */

export default Branch;
