import AddIcon from '@mui/icons-material/Add';
import {
  AppBar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
} from '@mui/material';
import { useContext, useState } from 'react';
import Context from './context';
import { showDialogueSettings } from './event';

const DialogueToolbar = () => {
  const { owner } = useContext(Context);
  const [contextMenu, setContextMenu] = useState<any>(null);

  const handleContextMenu = (event: any) => {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX - 2,
            mouseY: event.clientY - 4,
          }
        : // repeated contextmenu when it is already open closes it with Chrome 84 on Ubuntu
          // Other native context menus might behave different.
          // With this behavior we prevent contextmenu from the backdrop to re-locale existing context menus.
          null
    );
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

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
          sx={{ marginLeft: '32px', height: '64px', overflow: 'auto' }}
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
                onContextMenu={handleContextMenu}
              >
                {dialogue.data?.title}
              </Box>
            );
          })}
          <Menu
            open={contextMenu !== null}
            onClose={closeContextMenu}
            anchorReference="anchorPosition"
            anchorPosition={
              contextMenu !== null
                ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                : undefined
            }
          >
            <MenuItem
              onClick={() => {
                if (!owner) {
                  return;
                }
                owner.selectingNode = owner.owner.dataProvider.currentDialogue;
                showDialogueSettings();
                closeContextMenu();
              }}
            >
              Settings
            </MenuItem>
            <MenuItem
              onClick={() => {
                if (!owner) {
                  return;
                }
                owner.owner.dataProvider.data.dialogues =
                  owner.owner.dataProvider.data.dialogues.filter(
                    (node) =>
                      node.id !== owner.owner.dataProvider.currentDialogue?.id
                  );
                owner.owner.dataProvider.currentDialogue =
                  owner.owner.dataProvider.data.dialogues[
                    owner.owner.dataProvider.data.dialogues.length - 1
                  ] || null;
                closeContextMenu();
              }}
            >
              Delete
            </MenuItem>
          </Menu>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default DialogueToolbar;
