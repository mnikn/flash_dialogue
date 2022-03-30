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
import { useContext, useState } from 'react';
import { SchemaConfigEditor } from 'react-dynamic-material-form';
import DeleteIcon from '@mui/icons-material/Delete';
import Context from '../context';
import { ProjectSettings } from 'renderer/core/model/dialogue_tree';
import GridForm from 'renderer/components/grid_form';

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
    }
  };

  const ActorSettings = () => {
    return (
      <Card>
        <CardHeader subheader="Actors"></CardHeader>
        <CardContent
          sx={{
            maxHeight: '400px',
            overflow: 'auto',
          }}
        >
          <Stack spacing={2}>
            {globalSettings.actors.map((actor, i) => {
              return (
                <Stack
                  key={i}
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
                      value={actor.id}
                      onChange={(e) => {
                        actor.id = e.target.value;
                        setGlobalSettings((prev) => {
                          return { ...prev };
                        });
                      }}
                    />
                    <TextField
                      size="small"
                      style={{ flexGrow: 1 }}
                      label="Actor name"
                      required
                      value={actor.name}
                      onChange={(e) => {
                        actor.name = e.target.value;
                        setGlobalSettings((prev) => {
                          return { ...prev };
                        });
                      }}
                    />
                  </Stack>

                  <Card sx={{ width: '300px' }}>
                    <CardContent>
                      <Stack spacing={2} direction="column">
                        {actor.protraits.map((protrait, j) => {
                          return (
                            <Stack
                              key={actor.id + '-' + j}
                              spacing={1}
                              direction="row"
                              sx={{ alignItems: 'center' }}
                            >
                              <TextField
                                size="small"
                                style={{ flexGrow: 1 }}
                                label="Protrait id"
                                required
                                value={protrait.id}
                                onChange={(e) => {
                                  protrait.id = e.target.value;
                                  setGlobalSettings((prev) => {
                                    return { ...prev };
                                  });
                                }}
                              />

                              {!protrait.pic && (
                                <label htmlFor="contained-button-file">
                                  <Input
                                    accept="image/*"
                                    id="contained-button-file"
                                    type="file"
                                    sx={{ display: 'none' }}
                                    onChange={(e) => {
                                      setGlobalSettings((prev) => {
                                        actor.protraits = actor.protraits.map(
                                          (p, index) =>
                                            index === j
                                              ? {
                                                  ...protrait,
                                                  pic: e.target.files[0].path,
                                                }
                                              : p
                                        );

                                        return { ...prev };
                                      });
                                    }}
                                  />
                                  <Button variant="contained" component="span">
                                    Upload
                                  </Button>
                                </label>
                              )}

                              {protrait.pic && (
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
                                    src={'file://' + protrait.pic}
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
                                  setGlobalSettings((prev) => {
                                    actor.protraits = actor.protraits.filter(
                                      (_, index) => index !== j
                                    );
                                    return {
                                      ...prev,
                                    };
                                  });
                                }}
                              />
                            </Stack>
                          );
                        })}
                        <Button
                          variant="contained"
                          onClick={() => {
                            setGlobalSettings((prev) => {
                              actor.protraits.push({
                                id: '',
                                pic: '',
                              });
                              return {
                                ...prev,
                              };
                            });
                          }}
                        >
                          Add Protrait
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                  <DeleteIcon
                    sx={{ cursor: 'pointer' }}
                    onClick={() => {
                      setGlobalSettings((prev) => {
                        return {
                          ...prev,
                          actors: prev.actors.filter((_, index) => i !== index),
                        };
                      });
                    }}
                  />
                </Stack>
              );
            })}

            <Button
              variant="contained"
              onClick={() => {
                setGlobalSettings((prev) => {
                  return {
                    ...prev,
                    actors: [
                      ...prev.actors,
                      {
                        id: '',
                        name: '',
                        protraits: [],
                      },
                    ],
                  };
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
                  onChange={(i18nForm) => {
                    setGlobalSettings((prev) => {
                      return {
                        ...prev,
                        i18n: [...i18nForm],
                      };
                    });
                  }}
                  renderItem={(val, onChange) => {
                    return (
                      <TextField
                        margin="dense"
                        label="Language"
                        type="text"
                        size="small"
                        fullWidth
                        required
                        disabled={val === 'en'}
                        value={val}
                        onChange={(e: any) => {
                          onChange(e.target.value);
                        }}
                      />
                    );
                  }}
                  canDelete={(val: any) => {
                    return val !== 'en';
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
