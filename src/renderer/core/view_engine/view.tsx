import PreviewIcon from '@mui/icons-material/Preview';
import MenuIcon from '@mui/icons-material/Menu';
import {
  Button,
  IconButton,
  Stack,
  Menu as MuiMenu,
  CircularProgress,
  Alert,
} from '@mui/material';
import Menu from './menu';
import MenuItem from '@mui/material/MenuItem';
import * as d3 from 'd3';
import {
  MouseEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import useEventState from 'renderer/hooks/use_event_state';
import Node from '../model/node';
import BranchNode from '../model/node/branch';
import { appendChildNode, appendSameLevelNode } from '../model/node/factory';
import RootNode from '../model/node/root';
import SentenceNode from '../model/node/sentence';
import ViewProvider from '../view_provider';
import Branch from './components/branch';
import Connection from './components/connection';
import PreviewDialogue from './components/preview_dialogue';
import Root from './components/root';
import Sentence from './components/sentence';
import SettingsDialog from './components/settings';
import Context, { GlobalSettings } from './context';
import {
  listenPreviewDialogueJson,
  listenSaveProject,
  listenShowProjectSettings,
  previewDialogueJson,
  saveProject,
  showEdit,
} from './event';
import DialogueToolbar from './toolbar';
import DialogueJsonDialog from './json_dialog';
import { setPriority } from 'os';

const View = ({
  container,
  dialogue,
  owner,
}: {
  container: HTMLElement;
  dialogue: RootNode;
  owner: ViewProvider;
}) => {
  const domRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<any>(null);

  const editing = useEventState<boolean>({
    event: owner.event,
    property: 'editing',
    initialVal: false,
  });
  const selectingNode = useEventState<Node<any> | null>({
    event: owner.event,
    property: 'selectingNode',
    initialVal: null,
  });
  const [settingDialogVisible, setSettingDialogVisible] = useState(false);
  const [previewDialogueVisible, setPreviewDialogueVisible] = useState(false);

  const [saving, setSaving] = useState(false);

  const [rootData, setRootData] = useState<RootNode>(dialogue);
  const [treeData, setTreeData] = useState<any[]>([]);
  const [linkData, setLinkData] = useState<any[]>([]);

  const [dialogueJsonDialogueVisible, setDialogueJsonDialogueVisible] =
    useState(false);

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

  const handleClose = () => {
    setContextMenu(null);
  };

  // handle zoom
  useLayoutEffect(() => {
    d3.select(container).call(
      (d3 as any).zoom().on('zoom', function () {
        const transfromRes = d3.zoomTransform(this);
        d3.select(domRef.current).style(
          'transform',
          `translate(${transfromRes.x}px,${transfromRes.y}px) scale(${transfromRes.k})`
        );
      })
    );

    d3.select(container).on('dblclick.zoom', null);
  }, []);

  useLayoutEffect(() => {
    const root = d3.hierarchy(
      rootData.toRenderJson()
    ) as d3.HierarchyRectangularNode<any>;
    root.x0 = 0;
    root.y0 = 0;
    const tree = d3.tree().nodeSize([240, 700]);
    tree(root);

    root.descendants().forEach((d: any, i: any) => {
      d.id = i;
      d._children = d.children;
    });

    const updateNodeTree = (source: any) => {
      const nodes = root.descendants().reverse();
      setTreeData(nodes);

      // Stash the old positions for transition.
      root.eachBefore((d: any) => {
        d.x0 = d.x;
        d.y0 = d.y;
      });

      const diagonal = d3
        .linkHorizontal()
        .x((d: any) => d.y)
        .y((d: any) => d.x);
      const svg = d3.select('#dialogue-tree-links-container');
      svg.selectAll('*').remove();
      const gLink = svg
        .append('g')
        .attr('id', 'dialogue-tree-links')
        .style('position', 'absolute')
        .attr('fill', 'none')
        .attr('stroke', '#ffd4a3')
        .attr('stroke-opacity', 1)
        .attr('stroke-width', 5);

      const transition = svg
        .transition()
        .duration(300)
        .tween(
          'resize',
          (window as any).ResizeObserver
            ? null
            : () => () => svg.dispatch('toggle')
        );

      const link = gLink
        .selectAll('path')
        .data(root.links(), (d: any) => d.target.id)
        .style('position', 'absolute');
      // Enter any new links at the parent's previous position.
      const linkEnter = link.enter().append('path');
      // Transition links to their new position.

      const links: any[] = [];
      link
        .merge(linkEnter)
        .transition(transition)
        .attr('d', (c) => {
          const nodeSource = {
            ...(c as any).source,
          };
          nodeSource.x = nodeSource.x + 80;
          nodeSource.y = nodeSource.y + 400;
          const targetSource = {
            ...(c as any).target,
          };
          targetSource.x = targetSource.x + 80;

          links.push({
            from: nodeSource,
            target: targetSource,
            data:
              (nodeSource.data?.links || []).find(
                (l) =>
                  l.sourceId === nodeSource.data.id &&
                  l.targetId === targetSource.data.id
              )?.data || {},
          });
          /* targetSource.y = targetSource.y - 30; */
          return diagonal({
            source: nodeSource,
            target: targetSource,
          });
        });

      setLinkData(links);

      // Transition exiting nodes to the parent's new position.
      link
        .exit()
        .transition(transition)
        .remove()
        .attr('d', () => {
          const o = { x: source.x, y: source.y };
          return diagonal({ source: o, target: o });
        });
    };

    updateNodeTree(root);
  }, [rootData]);

  const doAppendSameLevelNode = useCallback(
    (type: 'sentence' | 'branch') => {
      if (!owner.selectingNode) {
        return;
      }
      appendSameLevelNode(owner.selectingNode, type);
      setRootData((prev) => {
        const updateNode = new RootNode(prev.data, prev.id);
        updateNode.children = prev.children;
        return updateNode;
      });
    },
    [owner]
  );

  const doAppendChildNode = useCallback(
    (type: 'sentence' | 'branch') => {
      if (!selectingNode) {
        return;
      }
      appendChildNode(selectingNode, type);
      setRootData((prev) => {
        const updateNode = new RootNode(prev.data, prev.id);
        updateNode.children = prev.children;
        return updateNode;
      });
    },
    [selectingNode]
  );

  const doDeleteNode = useCallback(() => {
    if (
      !owner ||
      !owner.selectingNode ||
      owner.selectingNode instanceof RootNode
    ) {
      return;
    }
    const snode = owner.selectingNode as Node<any>;
    snode.parent?.deleteChildNode(snode.id);
    setRootData((prev) => {
      const updateNode = new RootNode(prev.data, prev.id);
      updateNode.children = prev.children;
      return updateNode;
    });
    owner.selectingNode = null;
  }, [owner]);

  useLayoutEffect(() => {
    const onKeyDown = async (e: KeyboardEvent) => {
      /* e.preventDefault(); */
      if (owner.editing) {
        return;
      }

      if (owner.selectingNode) {
        if (e.code === 'Enter') {
          doAppendSameLevelNode(e.ctrlKey ? 'branch' : 'sentence');
        }

        if (e.code === 'Tab') {
          doAppendChildNode(e.ctrlKey ? 'branch' : 'sentence');
        }

        if (e.code === 'Backspace') {
          doDeleteNode();
        }

        if (e.code === 'Space') {
          owner.editing = true;
          showEdit();
        }
      }

      if (e.code === 'KeyS' && e.ctrlKey && !owner.owner.dataProvider.saving) {
        saveProject();
      }

      if (e.code === 'KeyP' && e.ctrlKey && !e.shiftKey) {
        setPreviewDialogueVisible(true);
      }

      if (e.code === 'KeyP' && e.ctrlKey && e.shiftKey) {
        previewDialogueJson();
      }
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [owner, doDeleteNode, doAppendSameLevelNode, doAppendChildNode]);

  const sentenceActionMenu = useMemo(() => {
    let insertChildActions: any[] = [];
    insertChildActions = [
      {
        key: 'sentence_insert_child_sentence',
        name: 'Insert child sentence',
        action: () => doAppendChildNode('sentence'),
      },
      {
        key: 'sentence_insert_child_branch',
        name: 'Insert child branch',
        action: () => doAppendChildNode('branch'),
      },
    ];

    let insertSlbingActions: any[] = [];
    if (selectingNode?.parent instanceof BranchNode) {
      insertSlbingActions = [
        {
          key: 'sentence_insert_sibling_sentence',
          name: 'Insert sibling sentence',
          action: () => doAppendSameLevelNode('sentence'),
        },
        {
          key: 'sentence_insert_sibling_branch',
          name: 'Insert sibling branch',
          action: () => doAppendSameLevelNode('branch'),
        },
      ];
    }

    return [
      ...insertChildActions,
      ...insertSlbingActions,
      {
        key: 'sentence_delete_node',
        name: 'Delete',
        action: () => doDeleteNode(),
      },
    ];
  }, [selectingNode, doAppendChildNode, doAppendSameLevelNode, doDeleteNode]);

  const branchActionMenu = useMemo(() => {
    const insertChildActions = [
      {
        key: 'branch_insert_child_sentence',
        name: 'Insert child sentence',
        action: () => doAppendChildNode('sentence'),
      },
      {
        key: 'branch_insert_child_branch',
        name: 'Insert child branch',
        action: () => doAppendChildNode('branch'),
      },
    ];

    let insertSlbingActions: any[] = [];
    if (selectingNode?.parent instanceof BranchNode) {
      insertSlbingActions = [
        {
          key: 'branch_insert_sibling_sentence',
          name: 'Insert sibling sentence',
          action: () => doAppendSameLevelNode('sentence'),
        },
        {
          key: 'branch_insert_sibling_branch',
          name: 'Insert sibling branch',
          action: () => doAppendSameLevelNode('branch'),
        },
      ];
    }

    return [
      ...insertChildActions,
      ...insertSlbingActions,
      {
        key: 'sentence_delete_node',
        name: 'Delete',
        action: () => doDeleteNode(),
      },
    ];
  }, [selectingNode, doAppendChildNode, doAppendSameLevelNode, doDeleteNode]);

  useEffect(() => {
    owner.owner.dataProvider.currentDialogue = rootData;
  }, [owner, rootData]);

  useEffect(() => {
    console.log('lle:', linkData);
    linkData.forEach((item) => {
      owner.owner.dataProvider.currentDialogue?.iterateChildren((node) => {
        const nodeLink = node.links.find((l) => {
          const hasSource =
            l.source instanceof Node
              ? l.source.id === item.from?.data?.id
              : l.source === item.from?.data?.id;
          const hasTarget =
            l.target instanceof Node
              ? l.target.id === item.target?.data?.id
              : l.target === item.target?.data?.id;
          return hasSource && hasTarget;
        });
        if (nodeLink) {
          nodeLink.data = item.data;
        }
      });
    });
  }, [owner, linkData]);

  useEffect(() => {
    const previewJson = () => {
      setDialogueJsonDialogueVisible(true);
    };
    const saveProject = async () => {
      setSaving(true);
      await owner.owner.dataProvider.save();
      setTimeout(() => {
        setSaving(false);
      }, 300);
    };

    const showProjectSettings = () => {
      setSettingDialogVisible(true);
    };
    const unlistenPreviewJson = listenPreviewDialogueJson(previewJson);
    const unlistenSaveProject = listenSaveProject(saveProject);
    const unlistenShowProjectSettigs =
      listenShowProjectSettings(showProjectSettings);
    return () => {
      unlistenPreviewJson();
      unlistenSaveProject();
      unlistenShowProjectSettigs();
    };
  }, [owner]);

  return (
    <Context.Provider
      value={{
        owner,
      }}
    >
      <div
        id="dialogue_tree"
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onContextMenu={handleContextMenu}
      >
        <div
          id="dialogue_tree_core"
          ref={domRef}
          style={{
            width: '100%',
            height: '100%',
          }}
        >
          <div id="nodes" style={{ position: 'relative', cursor: 'pointer' }}>
            {treeData.map((item) => {
              return (
                <div
                  key={item.id}
                  style={{
                    transform: `translate(${item.y0}px,${item.x0}px)`,
                    position: 'absolute',
                  }}
                  onClick={() => {
                    if (editing) {
                      return;
                    }
                    owner.selectingNode =
                      item.data.id === selectingNode?.id
                        ? null
                        : rootData.findChildNode(item.data.id);
                  }}
                >
                  {item.data.type === 'sentence' && (
                    <Sentence
                      selecting={selectingNode?.id === item.data.id}
                      data={item.data}
                      onEdit={() => {
                        owner.selectingNode = rootData.findChildNode(
                          item.data.id
                        );
                        owner.editing = true;
                      }}
                      onEditFinish={(confirm, form) => {
                        owner.editing = false;
                        owner.selectingNode = null;
                        if (confirm) {
                          item.data = form;
                          setRootData((prev) => {
                            const node = prev.findChildNode(item.data.id);
                            node.data = form?.data;

                            const updateNode = new RootNode(prev.data, prev.id);
                            updateNode.children = prev.children;
                            return updateNode;
                          });
                        }
                      }}
                    />
                  )}
                  {item.data.type === 'branch' && (
                    <Branch
                      selecting={selectingNode?.id === item.data.id}
                      data={item.data}
                      onEdit={() => {
                        owner.selectingNode = rootData.findChildNode(
                          item.data.id
                        );
                        owner.editing = true;
                      }}
                      onEditFinish={(confirm, form) => {
                        owner.editing = false;
                        owner.selectingNode = null;
                        if (confirm) {
                          item.data = form;
                          setRootData((prev) => {
                            const node = prev.findChildNode(item.data.id);
                            node.data = form?.data;

                            const updateNode = new RootNode(prev.data, prev.id);
                            updateNode.children = prev.children;
                            return updateNode;
                          });
                        }
                      }}
                    />
                  )}
                  {item.data.type === 'root' && (
                    <Root
                      selecting={selectingNode?.id === item.data.id}
                      data={item.data}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <svg
            id="dialogue-tree-links-container"
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              overflow: 'inherit',
              pointerEvents: 'none',
            }}
          ></svg>
          <div
            id="connections"
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              overflow: 'inherit',
              pointerEvents: 'none',
            }}
          >
            {linkData.map((item) => {
              const data = item.from.data.links.find(
                (d) =>
                  d.sourceId === item.from.data.id &&
                  d.targetId === item.target.data.id
              );
              return (
                <Connection
                  key={item.from.data.id + '-' + item.target.data.id}
                  from={item.from}
                  target={item.target}
                  linkData={item.data}
                  onChange={(val) => {
                    item.data = val;
                    setLinkData((prev) => {
                      return [...prev];
                    });
                  }}
                  onEdit={() => {
                    owner.editing = true;
                  }}
                  onEditFinish={() => {
                    owner.editing = false;
                  }}
                />
              );
            })}
          </div>
        </div>
        <MuiMenu
          open={contextMenu !== null}
          onClose={handleClose}
          anchorReference="anchorPosition"
          anchorPosition={
            contextMenu !== null
              ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
              : undefined
          }
        >
          {!selectingNode && (
            <MenuItem
              onClick={() => {
                setSettingDialogVisible(true);
                handleClose();
              }}
            >
              Settings
            </MenuItem>
          )}
          {selectingNode instanceof SentenceNode &&
            sentenceActionMenu.map((item) => {
              return (
                <MenuItem
                  key={item.key}
                  onClick={() => {
                    item.action();
                    handleClose();
                  }}
                >
                  {item.name}
                </MenuItem>
              );
            })}

          {selectingNode instanceof BranchNode &&
            branchActionMenu.map((item) => {
              return (
                <MenuItem
                  key={item.key}
                  onClick={() => {
                    item.action();
                    handleClose();
                  }}
                >
                  {item.name}
                </MenuItem>
              );
            })}
        </MuiMenu>

        {settingDialogVisible && (
          <SettingsDialog
            close={() => {
              setSettingDialogVisible(false);
            }}
          />
        )}

        {previewDialogueVisible && (
          <PreviewDialogue
            data={rootData.toRenderJson()}
            close={() => {
              setPreviewDialogueVisible(false);
            }}
          />
        )}

        {dialogueJsonDialogueVisible && (
          <DialogueJsonDialog
            provider={owner.owner.dataProvider}
            close={() => {
              setDialogueJsonDialogueVisible(false);
            }}
          />
        )}
        <Stack
          direction="row"
          spacing={2}
          sx={{
            position: 'absolute',
            top: '32px',
            width: '100%',
          }}
        >
          <Menu />
          <Button
            variant="contained"
            startIcon={<PreviewIcon />}
            size="large"
            onClick={() => {
              setPreviewDialogueVisible(true);
            }}
            sx={{
              position: 'absolute',
              right: '64px',
            }}
            disableFocusRipple
          >
            Preview Dialogue!
          </Button>
        </Stack>
      </div>

      {saving && (
        <Alert
          sx={{
            position: 'fixed',
            width: '50%',
            transform: 'translateX(50%)',
            zIndex: 10,
            top: '50px',
            height: '100px',
            borderRadius: '8px',
          }}
          icon={<></>}
          variant="standard"
          color="info"
        >
          <Stack
            spacing={2}
            direction="row"
            sx={{ alignItems: 'center', height: '100%', width: '100%' }}
          >
            <CircularProgress />
            <div style={{ fontSize: '18px' }}>
              Saving...Please wait for a while
            </div>
          </Stack>
        </Alert>
      )}

      <DialogueToolbar />
    </Context.Provider>
  );
};

export default View;
