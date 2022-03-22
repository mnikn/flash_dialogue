import { AppBar, IconButton, Stack, Toolbar, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useContext } from 'react';
import Context from './context';

const DialogueToolbar = () => {
  const { owner } = useContext(Context);

  return (
    <AppBar
      position="fixed"
      color="primary"
      sx={{ top: 'auto', bottom: 0, background: '#8d697a' }}
    >
      <Toolbar>
        <IconButton
          onClick={() => {
            owner?.owner.dataProvider.createNewDialogue();
          }}
        >
          <AddIcon sx={{ color: '#ffffff' }} />
        </IconButton>

        <Stack
          direction="row"
          spacing={2}
          sx={{ marginLeft: '32px', height: '64px' }}
        >
          {owner?.owner.dataProvider.data.dialogues.map((dialogue) => {
            return (
              <Box
                key={dialogue.id}
                sx={{
                  background:
                    owner.owner.dataProvider.currentDialogue === dialogue
                      ? '#d08159'
                      : 'transparent',
                  minWidth: '120px',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  '&:hover': {
                    background: '#d08159',
                  },
                  userSelect: 'none',
                }}
                onClick={() => {
                  owner.owner.dataProvider.currentDialogue = dialogue;
                }}
              >
                {dialogue.data?.title}
              </Box>
            );
          })}
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default DialogueToolbar;
