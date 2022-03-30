import PreviewIcon from '@mui/icons-material/Preview';
import {
  Alert,
  Button,
  CircularProgress,
  Menu as MuiMenu,
  Stack,
  Box,
  Select,
} from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import * as d3 from 'd3';
import {
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
import {
  appendChildNode,
  appendSameLevelNode,
  findNodeById,
} from '../model/node/factory';
import RootNode from '../model/node/root';
import SentenceNode from '../model/node/sentence';
import ViewProvider from '../view_provider';
import Branch from './components/branch';
import Connection from './components/connection';
import Loading from './components/loading';
import PreviewDialogue from './components/preview_dialogue';
import Root from './components/root';
import Sentence from './components/sentence';
import SettingsDialog from './components/settings';
import Context from './context';
import {
  listenPreviewDialogueJson,
  listenSaveProject,
  listenShowProjectSettings,
  previewDialogueJson,
  saveProject,
  showEdit,
} from './event';
import DialogueJsonDialog from './json_dialog';
import Menu from './menu';
import DialogueToolbar from './toolbar';

const NodeCard = ({
  data,
  selecting = false,
  select,
  startEdit,
  endEdit,
  canDrag = true,
  startDrag,
  onDrag,
  endDrag,
}: {
  data: any;
  selecting?: boolean;
  select?: () => void;
  canDrag?: boolean;
  startEdit?: () => void;
  endEdit?: (confirm: boolean, form: any) => void;
  startDrag?: (e: any) => void;
  onDrag?: (e: any) => void;
  endDrag?: (e: any) => void;
}) => {
  return (
    <div
      key={data.id}
      style={{
        transform: `translate(${data.y0}px,${data.x0}px)`,
        position: 'absolute',
      }}
      onClick={(e) => {
        if (e.defaultPrevented) return;
        select && select();
      }}
      ref={(dom) => {
        if (dom && canDrag) {
          const dragListener = d3
            .drag()
            .on('start', (d) => startDrag && startDrag(d))
            .on('drag', (d) => onDrag && onDrag(d))
            .on('end', (d) => endDrag && endDrag(d));
          dragListener(d3.select(dom));
        }
      }}
    >
      {data.data.type === 'sentence' && (
        <Sentence
          selecting={selecting}
          data={data.data}
          onEdit={() => startEdit && startEdit()}
          onEditFinish={(confirm, form) => endEdit && endEdit(confirm, form)}
        />
      )}
      {data.data.type === 'branch' && (
        <Branch
          selecting={selecting}
          data={data.data}
          onEdit={() => startEdit && startEdit()}
          onEditFinish={(confirm, form) => endEdit && endEdit(confirm, form)}
        />
      )}
      {data.data.type === 'root' && (
        <Root
          selecting={selecting}
          data={data.data}
          onEdit={() => startEdit && startEdit()}
          onEditFinish={(confirm, form) => endEdit && endEdit(confirm, form)}
        />
      )}
    </div>
  );
};

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
  const currentLang = useEventState<string>({
    event: owner.owner.dataProvider.event,
    property: 'currentLang',
    initialVal: owner.owner.dataProvider.currentLang,
  });
  const [settingDialogVisible, setSettingDialogVisible] = useState(false);
  const [previewDialogueVisible, setPreviewDialogueVisible] = useState(false);

  const [saving, setSaving] = useState(false);

  const [rootData, setRootData] = useState<RootNode>(dialogue);
  const [treeData, setTreeData] = useState<any[]>([]);
  const [dragingTreeNode, setDragingTreeNode] = useState<any | null>(null);
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
        owner.zoom = transfromRes.k;
        d3.select(domRef.current).style(
          'transform',
          `translate(${transfromRes.x}px,${transfromRes.y}px) scale(${transfromRes.k})`
        );
      })
    );

    d3.select(container).on('dblclick.zoom', null);
  }, [owner]);

  useLayoutEffect(() => {
    const json = rootData.toRenderJson();
    if (dragingTreeNode) {
      const pnode = findNodeById(
        json,
        findNodeById(json, dragingTreeNode.data.id)?.parentId as string
      );
      if (pnode) {
        pnode.children = pnode.children.filter(
          (n) => n.id !== dragingTreeNode.data.id
        );
      }
    }
    const root = d3.hierarchy(json) as d3.HierarchyRectangularNode<any>;
    root.x0 = 0;
    root.y0 = 0;
    const tree = d3.tree().nodeSize([240, 700]);
    tree(root);

    root.descendants().forEach((d: any, i: any) => {
      d.id = d.data.id;
      d._children = d.children;
    });

    const updateNodeTree = (source: any) => {
      let nodes = root.descendants().reverse();
      if (dragingTreeNode) {
        nodes = nodes.concat(dragingTreeNode);
      }
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
  }, [rootData, dragingTreeNode]);

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

  const rootActionMenu = useMemo(() => {
    return [
      {
        key: 'root_edit',
        name: 'Edit',
        action: () => showEdit(),
      },
    ];
  }, []);
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
        key: 'sentence_edit',
        name: 'Edit',
        action: () => showEdit(),
      },
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
        key: 'branch_edit',
        name: 'Edit',
        action: () => showEdit(),
      },
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
    linkData.forEach((item) => {
      owner.owner.dataProvider.currentDialogue?.iterate((node) => {
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
                <div key={item.id}>
                  {dragingTreeNode && item !== dragingTreeNode && (
                    <>
                      {item.data.type !== 'root' && (
                        <Box
                          sx={{
                            width: '100px',
                            height: '100px',
                            background: '#CC3775',
                            opacity: 0.8,
                            position: 'absolute',
                            borderRadius: '50%',
                            left: item.y - 50,
                            top: item.x + 30,
                            zIndex: 10,
                            '&:hover': {
                              opacity: 1,
                            },
                          }}
                          onMouseEnter={() => {
                            if (!owner) {
                              return;
                            }
                            const currentNode = rootData.findChildNode(
                              item.data.id
                            ) as Node<any>;
                            owner.dragTarget = {
                              node: currentNode,
                              type: 'parent',
                            };
                          }}
                          onMouseLeave={() => {
                            if (!owner) {
                              return;
                            }
                            owner.dragTarget = null;
                          }}
                        />
                      )}
                      <Box
                        sx={{
                          width: '100px',
                          height: '100px',
                          background: '#CC3775',
                          opacity: 0.8,
                          position: 'absolute',
                          borderRadius: '50%',
                          left: item.y + 350,
                          top: item.x + 30,
                          zIndex: 10,
                          '&:hover': {
                            opacity: 1,
                          },
                        }}
                        onMouseEnter={() => {
                          if (!owner) {
                            return;
                          }
                          const currentNode = rootData.findChildNode(
                            item.data.id
                          ) as Node<any>;
                          owner.dragTarget = {
                            node: currentNode,
                            type: 'child',
                          };
                        }}
                        onMouseLeave={() => {
                          if (!owner) {
                            return;
                          }
                          owner.dragTarget = null;
                        }}
                      />
                    </>
                  )}
                  <NodeCard
                    data={item}
                    canDrag={item.data.type !== 'root' && !dragingTreeNode}
                    select={() => {
                      if (editing) {
                        return;
                      }
                      owner.selectingNode =
                        item.data.id === selectingNode?.id
                          ? null
                          : rootData.findChildNode(item.data.id);
                    }}
                    selecting={selectingNode?.id === item.data.id}
                    startEdit={() => {
                      owner.selectingNode = rootData.findChildNode(
                        item.data.id
                      );
                      owner.editing = true;
                    }}
                    endEdit={(confirm, form) => {
                      owner.editing = false;
                      owner.selectingNode = null;
                      if (confirm) {
                        item.data = form;
                        setRootData((prev) => {
                          const node = prev.findChildNode(item.data.id);
                          node.data = form?.data;

                          if (
                            node instanceof SentenceNode ||
                            node instanceof BranchNode
                          ) {
                            owner.owner.dataProvider.data.i18nData[
                              owner.owner.dataProvider.currentLang
                            ][node.data?.content] = form.contentI18n;
                          }

                          const updateNode = new RootNode(prev.data, prev.id);
                          updateNode.children = prev.children;
                          return updateNode;
                        });
                      }
                    }}
                    onDrag={(d) => {
                      if (!owner.draging) {
                        owner.draging = true;
                        owner.selectingNode = rootData.findChildNode(
                          item.data.id
                        );
                        d.sourceEvent.stopPropagation();
                        setDragingTreeNode(item);
                      }
                      item.x0 += d.dy / owner.zoom;
                      item.y0 += d.dx / owner.zoom;
                      setTreeData((prev) => {
                        return [...prev];
                      });
                    }}
                    endDrag={() => {
                      setDragingTreeNode(null);
                      if (owner.dragTarget && owner.selectingNode) {
                        owner.selectingNode?.parent?.deleteChildNode(
                          owner.selectingNode.id
                        );
                        const node = owner.dragTarget.node;
                        if (owner.dragTarget.type === 'child') {
                          node.addChildNode(owner.selectingNode);
                        } else if (owner.dragTarget.type === 'parent') {
                          let index: number | null =
                            node.parent?.children.findIndex((n) => {
                              return n.id === node.id;
                            });
                          index = index === -1 ? null : index;
                          node.parent?.addChildNode(owner.selectingNode, index);
                        }
                      }
                      owner.draging = false;
                      owner.dragTarget = null;
                      setRootData((prev) => {
                        const updateNode = new RootNode(prev.data, prev.id);
                        updateNode.children = prev.children;
                        return updateNode;
                      });
                    }}
                  />
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

          {selectingNode instanceof RootNode &&
            rootActionMenu.map((item) => {
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
          <Stack
            direction="row"
            sx={{
              position: 'absolute',
              right: '64px',
            }}
            spacing={2}
          >
            <Select
              labelId="i18n-select-label"
              id="i18n-select"
              value={currentLang}
              label="I18n"
              size="small"
              sx={{ backgroundColor: '#fff', width: '120px' }}
              onChange={(e) => {
                owner.owner.dataProvider.currentLang = e.target.value;
              }}
            >
              {owner.owner.dataProvider.data.projectSettings.i18n.map(
                (item2, j) => {
                  return (
                    <MenuItem key={j} value={item2}>
                      {item2}
                    </MenuItem>
                  );
                }
              )}
            </Select>
            <Button
              variant="contained"
              startIcon={<PreviewIcon />}
              size="large"
              onClick={() => {
                setPreviewDialogueVisible(true);
              }}
              disableFocusRipple
            >
              Preview Dialogue!
            </Button>
          </Stack>
        </Stack>
      </div>

      {saving && <Loading content={'Saving...Please wait for a while'} />}

      <DialogueToolbar />
    </Context.Provider>
  );
};

export default View;
