import { IconButton, MenuItem, Menu as MuiMenu, Divider } from '@mui/material';
import { MouseEvent, useState } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import { previewDialogueJson, saveProject, showProjectSettings } from './event';

const Menu = () => {
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
        <MenuItem onClick={closeMenu}>New Project</MenuItem>
        <MenuItem onClick={closeMenu}>Open Project</MenuItem>
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
        >Project Settings</MenuItem>
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
