import DeleteIcon from '@mui/icons-material/Delete';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormLabel,
  Input,
  Stack,
  Tab,
  Tabs,
  TextField,
} from '@mui/material';
import { useCallback, useContext, useEffect, useState } from 'react';
import { SchemaConfigEditor } from 'react-dynamic-material-form';
import GridForm from 'renderer/components/grid_form';
import * as Base64 from 'js-base64';
import { ProjectSettings } from 'renderer/core/model/dialogue_tree';
import useListWithKey from 'renderer/hooks/use_list_with_key';
import Context from '../context';

const SettingsDialog = ({ close }: { close: () => void }) => {
  const [currentTab, setCurrentTab] = useState(0);
  const { owner } = useContext(Context);
  const [globalSettings, setGlobalSettings] = useState<ProjectSettings>(
    owner?.owner.dataProvider.data.projectSettings as ProjectSettings
  );
  const handleOnClose = (_: any, reason: string) => {
    if (reason !== 'backdropClick') {
      close();
    }
  };

  const submit = () => {
    if (owner) {
      owner.owner.dataProvider.data.projectSettings = globalSettings;

      globalSettings.i18n.forEach((i18nKey) => {
        if (!owner.owner.dataProvider.data.i18nData[i18nKey]) {
          owner.owner.dataProvider.data.i18nData[i18nKey] = {};
        }
      });
    }
  };

  const [
    actors,
    { push: pushActor, removeAt: removeActor, updateAt: updateActor },
  ] = useListWithKey(globalSettings.actors);

  useEffect(() => {
    setGlobalSettings((prev) => {
      return {
        ...prev,
        actors: actors.map((item) => {
          return item.data;
        }),
      };
    });
  }, [actors]);

  const ActorSettings = () => {
    return (
      <Card>
        <CardHeader subheader="Actors" />
        <CardContent
          sx={{
            maxHeight: '400px',
            overflow: 'auto',
          }}
        >
          <Stack spacing={2}>
            {actors.map((actor, i) => {
              return (
                <Stack
                  key={actor.key}
                  spacing={1}
                  direction="row"
                  sx={{ alignItems: 'center' }}
                >
                  <Stack spacing={1}>
                    <TextField
                      size="small"
                      style={{ flexGrow: 1 }}
                      label="Actor id"
                      required
                      value={actor.data.id}
                      onChange={(e) => {
                        updateActor(i, {
                          ...actor.data,
                          id: e.target.value,
                        });
                      }}
                    />
                    <TextField
                      size="small"
                      style={{ flexGrow: 1 }}
                      label="Actor name"
                      required
                      value={actor.data.name}
                      onChange={(e) => {
                        updateActor(i, {
                          ...actor.data,
                          name: e.target.value,
                        });
                      }}
                    />
                  </Stack>

                  <Card sx={{ width: '300px' }}>
                    <CardContent>
                      <Stack spacing={2} direction="column">
                        {actor.data.portraits.map((portrait, j) => {
                          return (
                            <Stack
                              /* eslint-disable-next-line */
                              key={actor.data.id + '-' + j}
                              spacing={1}
                              direction="row"
                              sx={{ alignItems: 'center' }}
                            >
                              <TextField
                                size="small"
                                style={{ flexGrow: 1 }}
                                label="Portrait id"
                                required
                                value={portrait.id}
                                onChange={(e) => {
                                  portrait.id = e.target.value;
                                  updateActor(i, {
                                    ...actor.data,
                                  });
                                }}
                              />

                              {!portrait.pic.data && (
                                <label htmlFor="contained-button-file">
                                  <Input
                                    accept="image/*"
                                    id="contained-button-file"
                                    type="file"
                                    sx={{ display: 'none' }}
                                    onChange={async (e: any) => {
                                      const { res } =
                                        await window.electron.ipcRenderer.loadImageFile(
                                          { path: e.target.files[0].path }
                                        );
                                      updateActor(i, {
                                        ...actor.data,
                                        portraits: actor.data.portraits.map(
                                          (p, index) =>
                                            index === j
                                              ? {
                                                  ...portrait,
                                                  pic: {
                                                    path: Base64.encode(
                                                      e.target.files[0].path
                                                    ),
                                                    data: res,
                                                  },
                                                }
                                              : p
                                        ),
                                      });
                                    }}
                                  />
                                  <Button variant="contained" component="span">
                                    Upload
                                  </Button>
                                </label>
                              )}

                              {portrait.pic.data && (
                                <div
                                  style={{
                                    width: '32px',
                                    flexShrink: 0,
                                    padding: '4px',
                                    borderRadius: '4px',
                                    margin: '4px',
                                    backgroundColor: '#0d2b45',
                                    display: 'flex',
                                  }}
                                >
                                  <img
                                    src={`data:image/png;base64, ${portrait.pic.data}`}
                                    style={{
                                      height: '100%',
                                      width: '100%',
                                      backgroundColor: '#0d2b45',
                                      borderRadius: '4px',
                                    }}
                                  />
                                </div>
                              )}

                              <DeleteIcon
                                sx={{ cursor: 'pointer' }}
                                onClick={() => {
                                  updateActor(i, {
                                    ...actor.data,
                                    portraits: actor.data.portraits.filter(
                                      (_, index) => index !== j
                                    ),
                                  });
                                }}
                              />
                            </Stack>
                          );
                        })}
                        <Button
                          variant="contained"
                          onClick={() => {
                            actor.data.portraits.push({
                              id: '',
                              pic: { path: '', data: '' },
                            });
                            updateActor(i, {
                              ...actor.data,
                            });
                          }}
                        >
                          Add Portrait
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                  <DeleteIcon
                    sx={{ cursor: 'pointer' }}
                    onClick={() => {
                      removeActor(i);
                    }}
                  />
                </Stack>
              );
            })}

            <Button
              variant="contained"
              onClick={() => {
                pushActor({
                  id: '',
                  name: '',
                  portraits: [],
                });
              }}
            >
              Add Actor
            </Button>
          </Stack>
        </CardContent>
      </Card>
    );
  };

  const onGridFromChange = useCallback(
    (i18nForm) => {
      if (!owner) {
        return;
      }
      setGlobalSettings((prev) => {
        return {
          ...prev,
          i18n: i18nForm,
        };
      });
    },
    [owner]
  );

  return (
    <Dialog open onClose={handleOnClose}>
      <DialogTitle>Settings</DialogTitle>
      <DialogContent sx={{ width: '500px' }}>
        <Tabs
          value={currentTab}
          onChange={(_: any, val: number) => {
            setCurrentTab(val);
          }}
          sx={{ marginBottom: '32px' }}
        >
          <Tab label="Global" id="global" />
          {/* <Tab label="Sentence" id="sentence" />
              <Tab label="Branch" id="branch" /> */}
        </Tabs>
        {currentTab === 0 && (
          <Stack spacing={2}>
            {ActorSettings()}

            <Card>
              <CardHeader subheader="I18n" />
              <CardContent>
                <GridForm
                  data={globalSettings.i18n}
                  createNewItem={() => ''}
                  onChange={onGridFromChange}
                  renderItem={(val, i, onChange) => {
                    return (
                      <TextField
                        margin="dense"
                        label="Language"
                        type="text"
                        size="small"
                        fullWidth
                        required
                        disabled={i === 0}
                        value={val}
                        onChange={(e: any) => {
                          onChange(e.target.value);
                        }}
                      />
                    );
                  }}
                  canDelete={(_: any, i: number) => {
                    return i !== 0;
                  }}
                />
              </CardContent>
            </Card>
          </Stack>
        )}
        {currentTab === 1 && (
          <Stack spacing={2}>
            <Stack spacing={1}>
              <FormLabel>Custom Property:</FormLabel>
              <SchemaConfigEditor
                width="500px"
                height="300px"
                initialValue={{
                  i18n: [],
                  schema: {
                    type: 'object',
                    fields: {
                      position: {
                        id: 'position',
                        name: 'position',
                        type: 'select',
                        options: [
                          {
                            label: 'Left',
                            value: 'left',
                          },
                          {
                            label: 'Right',
                            value: 'right',
                          },
                        ],
                        defaultValue: 'left',
                      },
                    },
                    config: {
                      colSpan: 12,
                      enableWhen: null,
                      initialExpand: true,
                      summary: '#{{___index}}',
                    },
                  },
                }}
              />
            </Stack>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleOnClose}>Cancel</Button>
        <Button
          onClick={() => {
            submit();
            close();
          }}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SettingsDialog;
