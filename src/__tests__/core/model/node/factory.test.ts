import {
  appendChildNode,
  appendSameLevelNode,
} from '../../../../renderer/core/model/node/factory';
import SentenceNode from '../../../../renderer/core/model/node/sentence';
import RootNode from '../../../../renderer/core/model/node/root';
import BranchNode from '../../../../renderer/core/model/node/branch';

describe('node factory', () => {
  it('should add same level node correct', () => {
    const node = new RootNode();
    const childA = new BranchNode();
    const childAA = new SentenceNode();
    node.children = [childA];
    childA.children = [childAA];
    appendSameLevelNode(childAA, 'sentence');
    expect(childA.children[1]).toBeInstanceOf(SentenceNode);
  });

  it('should add child node correct', () => {
    const node = new RootNode();
    const childA = new SentenceNode();
    node.children = [childA];
    appendChildNode(childA, 'sentence');
    expect(childA.children[0]).toBeInstanceOf(SentenceNode);
  });
});
