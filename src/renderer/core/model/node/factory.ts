import Node from '.';
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
    if (sourceNode.parent instanceof SentenceNode) {
      return null;
    }
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
  if (sourceNode instanceof SentenceNode && sourceNode.children.length >= 1) {
    return null;
  }
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

// static findNodeById(json: any, id: string) {
//   if (!json) {
//     return null;
//   }
//   if (json.id === id) {
//     return json;
//   }

//   let res: any = null;
//   json.children.forEach((item: any) => {
//     res = res || this.findNodeById(item, id);
//   });

//   return res;
// }
