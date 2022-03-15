import { useLayoutEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import RootNode from '../model/node/root';
import Sentence from './components/sentence';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Root from './components/root';
import Branch from './components/branch';
import Connection from './components/connection';
import { appendChildNode, appendSameLevelNode } from '../model/node/factory';
/* import useClickOutside from 'renderer/hooks/use_click_outside'; */

const View = ({
  container,
  rootNode,
}: {
  container: HTMLElement;
  rootNode: RootNode;
}) => {
  const domRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<any>(null);
  const [selectingNode, setSelectingNode] = useState<any>(null);
  const [editing, setEditing] = useState(false);

  const [rootData, setRootData] = useState<RootNode>(rootNode);
  const [treeData, setTreeData] = useState<any[]>([]);
  const [linkData, setLinkData] = useState<any[]>([]);

  /* const selectNode = (item) => {
   *   setSelectingNode(item);
   * } */

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

  useLayoutEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        editing ||
        !selectingNode ||
        (selectingNode instanceof RootNode && selectingNode.children.length > 0)
      ) {
        return;
      }
      if (e.code === 'Enter') {
        appendSameLevelNode(selectingNode, e.ctrlKey ? 'branch' : 'sentence');
        setRootData((prev) => {
          const updateNode = new RootNode(prev.data, prev.id);
          updateNode.children = prev.children;
          return updateNode;
        });
      }

      if (e.code === 'Tab') {
        appendChildNode(selectingNode, e.ctrlKey ? 'branch' : 'sentence');
        setRootData((prev) => {
          const updateNode = new RootNode(prev.data, prev.id);
          updateNode.children = prev.children;
          return updateNode;
        });
      }

      console.log(e.code);
      if (e.code === 'Backspace' && !(selectingNode instanceof RootNode)) {
        selectingNode.parent.deleteChildNode(selectingNode.id);
        setRootData((prev) => {
          const updateNode = new RootNode(prev.data, prev.id);
          updateNode.children = prev.children;
          return updateNode;
        });
        setSelectingNode(null);
      }
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [editing, selectingNode]);

  /* useClickOutside(domRef.current as HTMLElement, () => {
   *   setSelectingNode(null);
   * }); */

  return (
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
                  setSelectingNode(
                    item.data.id === selectingNode?.id
                      ? null
                      : rootData.findChildNode(item.data.id)
                  );
                }}
              >
                {item.data.type === 'sentence' && (
                  <Sentence
                    selecting={selectingNode?.id === item.data.id}
                    data={item.data}
                    onEdit={() => {
                      setSelectingNode(rootData.findChildNode(item.data.id));
                      setEditing(true);
                    }}
                    onEditFinish={(confirm, form) => {
                      setEditing(false);
                      setSelectingNode(null);
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
                      setSelectingNode(rootData.findChildNode(item.data.id));
                      setEditing(true);
                    }}
                    onEditFinish={(confirm, form) => {
                      setEditing(false);
                      setSelectingNode(null);
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
                linkData={data}
              />
            );
          })}
        </div>
      </div>
      <Menu
        open={contextMenu !== null}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={handleClose}>Copy</MenuItem>
        <MenuItem onClick={handleClose}>Print</MenuItem>
        <MenuItem onClick={handleClose}>Highlight</MenuItem>
        <MenuItem onClick={handleClose}>Email</MenuItem>
      </Menu>
    </div>
  );
};

export default View;
