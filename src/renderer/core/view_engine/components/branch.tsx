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
  ListSubheader,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { ProjectSettings } from 'renderer/core/model/dialogue_tree';
import { BranchNodeJsonData } from 'renderer/core/model/node/branch';
import { getFinalImgPath } from 'renderer/utils/pic';
import Context from '../context';
import { listenEdit } from '../event';
import NodeCard from './node_card';

interface FormData extends BranchNodeJsonData {
  contentI18n: string;
}

const FormDialog = ({
  close,
  data,
  onSubmit,
}: {
  close: () => void;
  data: FormData;
  onSubmit: (form: FormData) => void;
}) => {
  const [form, setForm] = useState<FormData>(data);
  const { owner } = useContext(Context);
  const globalSettings = owner?.owner.dataProvider.data
    .projectSettings as ProjectSettings;
  const handleOnClose = (_: any, reason: string) => {
    if (reason !== 'backdropClick') {
      close();
    }
  };

  const submit = () => {
    onSubmit(form);
  };

  // flatten actor portrait to support group select
  const selectOptions = globalSettings.actors.reduce((res: any[], item) => {
    return [
      ...res,
      { id: item.id, name: item.name, type: 'actor' },
      ...item.portraits.map((p) => {
        return {
          ...p,
          actor: item,
          type: 'portrait',
        };
      }),
    ];
  }, []);

  return (
    <Dialog open onClose={handleOnClose}>
      <DialogTitle>Edit sentence</DialogTitle>
      <DialogContent sx={{ width: '500px', paddingTop: '20px!important' }}>
        <Stack spacing={2}>
          <Stack spacing={2} direction="row">
            <FormControl sx={{ flexGrow: 1 }}>
              <InputLabel id="demo-simple-select-label">Actors</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                label="Actors"
                size="small"
                multiple
                value={form.data.actors.map(
                  (item) => item.id + ',' + item.portrait.id
                )}
                onChange={(e) => {
                  if (
                    (e.target.value as any).length > 0 &&
                    !e.target.value[0]
                  ) {
                    return;
                  }
                  setForm((prev) => {
                    return {
                      ...prev,
                      data: {
                        ...prev.data,
                        actors: (e.target.value as any).map((item: string) => {
                          const actorId = item.split(',')[0];
                          const portraitId = item.split(',')[1];
                          return {
                            id: actorId,
                            portrait: {
                              id: portraitId,
                              pic:
                                globalSettings.actors
                                  .find((a) => a.id === actorId)
                                  ?.portraits.find((p) => {
                                    return p.id === portraitId;
                                  })?.pic || '',
                            },
                          };
                        }),
                      },
                    };
                  });
                }}
              >
                {selectOptions.map((item) => {
                  if (item.type === 'actor') {
                    return (
                      <ListSubheader key={item.id}>{item.name}</ListSubheader>
                    );
                  }
                  return (
                    <MenuItem
                      key={item.actor.id + item.id}
                      value={item.actor.id + ',' + item.id}
                    >
                      <img
                        src={getFinalImgPath(item.pic)}
                        style={{
                          height: '24px',
                          marginRight: '4px',
                        }}
                      />
                      {item.actor.name} / {item.id}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>

            <FormControl sx={{ flexGrow: 1 }}>
              <InputLabel id="demo-simple-select-label">
                Actor position
              </InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                label="Actor position"
                size="small"
                value={form.data.actorPosition}
                onChange={(e) => {
                  setForm((prev) => {
                    return {
                      ...prev,
                      data: {
                        ...prev.data,
                        actorPosition: e.target.value as any,
                      },
                    };
                  });
                }}
              >
                {['left', 'center', 'right'].map((item) => {
                  return (
                    <MenuItem key={item} value={item}>
                      {item}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Stack>

          <TextField
            margin="dense"
            label="Content i18n key"
            type="text"
            required
            value={form.data.content}
            onChange={(e: any) => {
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
          />
          <TextField
            autoFocus
            margin="dense"
            label="Content"
            type="text"
            value={form.contentI18n}
            fullWidth
            multiline
            onChange={(e: any) => {
              if (form.data.content) {
                setForm((prev) => {
                  return {
                    ...prev,
                    contentI18n: e.target.value,
                  };
                });
              }
            }}
            rows={5}
          />
        </Stack>
      </DialogContent>

      {/* <Stack spacing={1}>
          <FormLabel
          sx={{
          paddingLeft: '20px',
          }}
          >
          Custom Property:
          </FormLabel>
          <FieldWrapper
          schema={
          buildSchema({
          type: 'object',
          fields: {
          position: {
          id: 'position',
          name: 'position',
          type: 'select',
          options: ['Left', 'Right'],
          defaultValue: 'Left',
          },
          },
          config: {
          colSpan: 12,
          enableWhen: null,
          initialExpand: true,
          summary: '#{{___index}}',
          },
          }) as any
          }
          config={{ i18n: [] }}
          value={{}}
          />
          </Stack> */}
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
  data: BranchNodeJsonData;
  onEdit: () => void;
  onEditFinish: (confirm: boolean, form?: BranchNodeJsonData) => void;
}) => {
  const { owner } = useContext(Context);
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

    return () => {
      unlistenEdit();
    };
  }, [selecting]);

  const contentI18n =
    owner?.owner.dataProvider.data.i18nData[
      owner?.owner.dataProvider.currentLang
    ][data.data.content] || '';
  return (
    <>
      <NodeCard
        selecting={selecting}
        onDoubleClick={showEditDialog}
        normalColor="#7145FF"
        hoverColor="#B48AFF"
        activeColor="#D5BDFF"
      >
        {data.data.actors.length > 0 && (
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
              src={getFinalImgPath(data.data.actors[0].portrait.pic)}
              style={{
                height: '100%',
                width: '100%',
                backgroundColor: '#0d2b45',
                borderRadius: '36px',
              }}
            />
          </div>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <CardContent sx={{ flex: '1 0 auto' }}>
            <Typography
              variant="subtitle1"
              color="text.secondary"
              component="div"
              sx={{
                wordBreak: 'break-all',
                color: '#fff',
              }}
            >
              {contentI18n}
            </Typography>
          </CardContent>
        </Box>
      </NodeCard>
      {editDialogOpen && (
        <FormDialog
          close={closeEditDialog}
          data={{ ...data, contentI18n }}
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
