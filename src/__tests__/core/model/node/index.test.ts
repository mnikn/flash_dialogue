import Node from '../../../../renderer/core/model/node';

describe('model node', () => {
  it('should handle connection correct', () => {
    // check chilren append parent
    const root = new Node<any>();
    const childA = new Node<any>();
    const childB = new Node<any>();
    root.children = [childA, childB];
    expect(childA.parent).toBe(root);
    expect(childB.parent).toBe(root);

    // check chilren remove parent
    const childC = new Node<any>();
    const childD = new Node<any>();
    root.children = [childC, childD];
    expect(childA.parent).toBeNull();
    expect(childB.parent).toBeNull();
    expect(childC.parent).toBe(root);
    expect(childD.parent).toBe(root);

    // check multi root
    root.children = [childA, childB, childC, childD];
    const rootB = new Node<any>();
    rootB.children = [childB, childC];
    expect(childA.parent).toBe(root);
    expect(childB.parent).toBe(rootB);
    expect(childC.parent).toBe(rootB);
    expect(childD.parent).toBe(root);
  });

  it('should delete node correct', () => {
    // check chilren append parent
    const root = new Node<any>();
    const childA = new Node<any>();
    const childB = new Node<any>();
    const childAA = new Node<any>();
    const childBB = new Node<any>();
    root.children = [childA, childB];
    childA.children = [childAA];
    childB.children = [childBB];
    root.deleteChildNode(childBB.id);
    expect(childB.children.length).toBe(0);
  });

  it('should create link correct', () => {
    // check chilren append parent
    const root = new Node<any>();
    const childA = new Node<any>();
    const childB = new Node<any>();
    const childAA = new Node<any>();
    const childBB = new Node<any>();
    root.children = [childA, childB];
    childA.children = [childAA];
    childB.children = [childBB];
    expect(root.links[0].source).toBe(root);
    expect(root.links[0].target).toBe(childA);
    expect(root.links[1].target).toBe(childB);
    expect(root.children[0].links[0].source).toBe(childA);
    expect(root.children[0].links[0].target).toBe(childAA);
  });
});
