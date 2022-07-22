import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Menu,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import useEventState from 'renderer/hooks/use_event_state';
import Context from './context';
import { listenShowNameDialog, showNameDialog } from './event';

export interface FileTreeFolder {
  type: 'folder';
  partName: string;
  currentPath: string;
  children: (FileTreeFile | FileTreeFolder)[];
}

export interface FileTreeFile {
  type: 'file';
  partName: string;
  currentPath: string | null;
}

function NameDialog() {
  const { owner } = useContext(Context);
  const [name, setName] = useState<string>('');
  const [source, setSource] = useState<FileTreeFile | FileTreeFolder | null>(
    null
  );
  const [action, setAction] = useState<
    'create_file' | 'create_folder' | 'rename_file' | 'rename_folder'
  >('create_file');
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    const show = ({
      sourceData = null,
      actionData = 'create_file',
    }: {
      sourceData: FileTreeFile | FileTreeFolder | null;
      actionData:
        | 'create_file'
        | 'create_folder'
        | 'rename_file'
        | 'rename_folder';
    }) => {
      setSource(sourceData);
      setAction(actionData);
      setName(
        actionData === 'rename_file' || actionData === 'rename_folder'
          ? sourceData?.partName.replace('.json', '') || ''
          : ''
      );
      setVisible(true);
    };
    const unlisten = listenShowNameDialog(show);
    return () => {
      unlisten();
    };
  }, []);

  if (!visible) {
    return null;
  }
  return (
    <Dialog
      open
      aria-labelledby="draggable-dialog-title"
      PaperProps={{
        sx: {
          background: '#fff',
          color: '#2c2c2c',
          padding: '20px 60px',
        },
      }}
    >
      <DialogTitle>Name</DialogTitle>
      <DialogContent>
        <TextField
          sx={{}}
          inputProps={{
            sx: {
              padding: '20px',
            },
          }}
          autoFocus
          placeholder="file name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
        />
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center' }}>
        <Button
          variant="contained"
          onClick={() => {
            setVisible(false);
          }}
          color="error"
        >
          Cancel
        </Button>
        <Button
          onClick={() => {
            if (action === 'create_file') {
              owner?.owner.dataProvider.createNewDialogue(
                name,
                source as FileTreeFolder
              );
            } else if (action === 'rename_file') {
              console.log(action);
            } else if (action === 'create_folder') {
              console.log(action);
            }
            setVisible(false);
          }}
          variant="contained"
          color="primary"
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function FileTree({
  data,
  level,
  showMenu,
}: {
  data: any;
  level: number;
  showMenu: (event: any, data: FileTreeFile | FileTreeFolder) => void;
}) {
  const { owner } = useContext(Context);
  const [expanded, setExpanded] = useState(data.expanded);
  if (data.type === 'file') {
    return (
      <Button
        onContextMenu={(e) => {
          showMenu(e, data);
        }}
        sx={{
          borderRadius: '0px',
          display: 'flow-root',
          textTransform: 'none',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          direction: 'rtl',
          textAlign: 'left',
          marginLeft: `${level * 20}px`,
          backgroundColor:
            owner?.owner.dataProvider.currentDialogueFile?.currentPath ===
            data.currentPath
              ? 'rgba(240, 233, 108, 0.20)'
              : undefined,
          color: '#fff',
          '&:hover': {
            backgroundColor: 'rgba(240, 233, 108, 0.4)',
          },
        }}
        onClick={() => {
          owner?.owner.dataProvider.loadDialouge(data.currentPath);
          // localStorage.setItem(FILE_PATH, data.fullPath);
          // eventBus.emit(EVENT.SET_CURRENT_FILE, data);
        }}
      >
        {data.partName.replace('.fd', '')}
      </Button>
    );
  }
  return (
    <>
      <Stack
        direction="row"
        sx={{
          width: '100%',
          paddingLeft: `${level * 20}px`,
          alignItems: 'center',
        }}
        onClick={() => setExpanded((prev) => !prev)}
        onContextMenu={(e) => {
          showMenu(e, data);
        }}
      >
        <Box
          className="icon"
          sx={{
            width: 0,
            height: 0,
            border: expanded
              ? '8px solid transparent'
              : '6px solid transparent',
            marginTop: expanded ? '8px' : undefined,
            marginRight: expanded ? '6px' : '4px',
            borderTop: expanded ? `8px solid #000` : undefined,
            borderLeft: expanded ? undefined : `10px solid #2c2c2c`,
            cursor: 'pointer',
            '&:hover': {
              filter: 'brightness(1.5)',
            },
          }}
        />
        {expanded ? <FolderOpenIcon /> : <FolderIcon />}

        <Button
          sx={{
            borderRadius: '0px',
            display: 'flow-root',
            textTransform: 'none',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            direction: 'rtl',
            textAlign: 'left',
            flexGrow: 1,
            color: '#fff',
          }}
        >
          {data.partName}
        </Button>
      </Stack>
      {expanded && (
        <>
          {data.children.map((d) => {
            return (
              <FileTree
                key={d.currentPath}
                data={d}
                level={level + 1}
                showMenu={showMenu}
              />
            );
          })}
        </>
      )}
    </>
  );
}

function Sidebar() {
  const { owner } = useContext(Context);
  const projectTree = useEventState<FileTreeFolder>({
    event: owner.owner.dataProvider.event,
    property: 'projectTree',
    initialVal: owner.owner.dataProvider.projectTree,
  });

  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [menuPos, setMenuPos] = useState<any>({ x: 0, y: 0 });
  const menuOpen = Boolean(menuAnchorEl);
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  const [menuActions, setMenuActions] = useState<
    { fn: () => void; title: string }[]
  >([]);

  const newFile = (folder?: FileTreeFolder) => {
    showNameDialog({
      source: folder,
      action: 'create_file',
    });
  };

  return (
    <Stack
      sx={{
        height: '100%',
        backgroundColor: '#8d697a',
        width: '300px',
        overflow: 'auto',
        padding: '20px',
        color: '#fff',
        zIndex: 10,
      }}
    >
      <div style={{ fontWeight: 'bold' }}>Folders</div>

      <Stack
        sx={{ width: '100%', flexGrow: 1, padding: '5px' }}
        onContextMenu={(e) => {
          setMenuAnchorEl(e.currentTarget);
          setMenuPos({ x: e.screenX, y: e.screenY });
          setMenuActions([
            {
              title: 'New file',
              fn: () => {
                newFile();
              },
            },
            {
              title: 'New folder',
              fn: () => {},
            },
          ]);
        }}
      >
        {(projectTree?.children || []).map((f: any) => {
          return (
            <FileTree
              key={f.currentPath}
              data={f}
              level={0}
              showMenu={(e, d) => {
                setMenuPos({ x: e.screenX, y: e.screenY });
                e.stopPropagation();
                setMenuAnchorEl(e.currentTarget);
                if (d.type === 'file') {
                  setMenuActions([
                    {
                      title: 'Rename...',
                      fn: () => {
                        console.log('rename');
                      },
                    },
                    {
                      title: 'Delete file',
                      fn: () => {
                        console.log('delete');
                      },
                    },
                  ]);
                } else if (d.type === 'folder') {
                  setMenuActions([
                    {
                      title: 'New file',
                      fn: () => {
                        newFile(d);
                      },
                    },
                  ]);
                }
              }}
            />
          );
        })}
      </Stack>
      <Menu
        id="sidebar-menu"
        open={menuOpen}
        onClose={handleMenuClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
        anchorReference="anchorPosition"
        anchorPosition={{
          left: menuPos.x,
          top: menuPos.y,
        }}
        sx={{
          '& .MuiPaper-root': {
            width: '200px',
            borderRadius: '32px',
          },
        }}
      >
        {menuActions.map((m) => {
          return (
            <MenuItem
              key={m.title}
              sx={{ display: 'flex', justifyContent: 'center' }}
              onClick={() => {
                setMenuAnchorEl(null);
                m.fn();
              }}
            >
              {m.title}
            </MenuItem>
          );
        })}
      </Menu>
      <NameDialog />
    </Stack>
  );
}

export default Sidebar;
