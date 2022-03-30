import { IconButton, MenuItem, Menu as MuiMenu, Divider } from '@mui/material';
import { MouseEvent, useContext, useState } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import { RECENT_PROJECT_PATH } from 'renderer/constants/storage';
import { previewDialogueJson, saveProject, showProjectSettings } from './event';
import Context from './context';

const Menu = () => {
  const { owner } = useContext(Context);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const showMenu = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const closeMenu = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        sx={{
          backgroundColor: '#fff',
          '&:hover': {
            backgroundColor: 'rgba(255,255,255, 0.6)',
          },
        }}
        onClick={showMenu}
      >
        <MenuIcon />
      </IconButton>

      <MuiMenu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={closeMenu}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem
          onClick={async () => {
            localStorage.removeItem(RECENT_PROJECT_PATH);
              owner?.owner.dataProvider.load();
            closeMenu();
          }}
        >
          New Project
        </MenuItem>
        <MenuItem
          onClick={async () => {
            const res = await window.electron.ipcRenderer.selectFolder();
            if (res) {
              const path = res[0];
              localStorage.setItem(RECENT_PROJECT_PATH, path);
              owner?.owner.dataProvider.load();
            }
            closeMenu();
          }}
        >
          Open Project
        </MenuItem>
        <MenuItem
          onClick={() => {
            saveProject();
            closeMenu();
          }}
        >
          Save Project
        </MenuItem>
        <MenuItem
          onClick={() => {
            showProjectSettings();
            closeMenu();
          }}
        >
          Project Settings
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            previewDialogueJson();
            closeMenu();
          }}
        >
          Preview Dialogue Json
        </MenuItem>
      </MuiMenu>
    </>
  );
};

export default Menu;
