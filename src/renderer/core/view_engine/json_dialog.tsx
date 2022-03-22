import CloseIcon from '@mui/icons-material/Close';
import {
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
} from '@mui/material';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import DataProvider from '../data_provider';
import MonacoEditor from 'react-monaco-editor';

const DialogueJsonDialog = ({
  provider,
  close,
}: {
  provider: DataProvider;
  close: () => void;
}) => {
  const handleOnClose = (_: any, reason: string) => {
    if (reason !== 'backdropClick') {
      close();
    }
  };

  return (
    <Dialog
      open
      onClose={handleOnClose}
      PaperProps={{
        style: { borderRadius: '32px' },
      }}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        <Stack direction="row" sx={{ alignItems: 'center' }}>
          <div
            style={{
              userSelect: 'none',
            }}
          >
            Current Dialogue Json
          </div>
          <CloseIcon
            sx={{ marginLeft: 'auto', cursor: 'pointer' }}
            onClick={close}
          />
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ height: '600px', width: '550px' }}>
        <Stack
          spacing={4}
          direction="column"
          sx={{
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            width: '100%',
          }}
        >
          <MonacoEditor
            width="100%"
            height="100%"
            language="json"
            theme="vs-dark"
            value={JSON.stringify(
              provider.currentDialogue?.toRenderJson(),
              null,
              2
            )}
            options={{
              readOnly: true,
            }}
          />
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default DialogueJsonDialog;
