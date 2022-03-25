import Node, { NodeJsonData } from '.';
import RootNode from './root';
import SentenceNode from './sentence';
import BranchNode from './branch';

export const appendSameLevelNode = (
  sourceNode: Node<any>,
  type: 'sentence' | 'branch'
) => {
  if (
    !(
      sourceNode instanceof RootNode ||
      sourceNode.parent instanceof RootNode ||
      !sourceNode.parent
    )
  ) {
    let newNode: Node<any>;
    switch (type) {
      case 'sentence': {
        newNode = new SentenceNode();
        break;
      }
      case 'branch': {
        newNode = new BranchNode();
        break;
      }
    }

    sourceNode.parent.children = [...sourceNode.parent.children, newNode];
    return newNode;
  }

  return null;
};

export const appendChildNode = (
  sourceNode: Node<any>,
  type: 'sentence' | 'branch'
) => {
  // if (sourceNode instanceof SentenceNode && sourceNode.children.length >= 1) {
  //   return null;
  // }
  let newNode: Node<any>;
  switch (type) {
    case 'sentence': {
      newNode = new SentenceNode();
      break;
    }
    case 'branch': {
      newNode = new BranchNode();
      break;
    }
  }

  sourceNode.children = [...sourceNode.children, newNode];
  return newNode;
};

export const findNodeById = (
  json: NodeJsonData,
  id: string
): NodeJsonData | null => {
  if (!json) {
    return null;
  }
  if (json.id === id) {
    return json;
  }

  let res: NodeJsonData | null = null;
  json.children.forEach((item) => {
    res = res || findNodeById(item, id);
  });

  return res;
};

export const findLink = (
  root: NodeJsonData,
  sourceId: string,
  targetId: string
): { [key: string]: any } | null => {
  const source = findNodeById(root, sourceId);
  return source?.links.find((l) => l.sourceId === sourceId && l.targetId === targetId) || null;
};
