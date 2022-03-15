import DialogueTree from '../../../renderer/core/model/dialogue_tree';

describe('model dialogue tree', () => {
  it('should parse json data correct', () => {
    // single root single node
    const jsonData = {
      roots: [
        {
          data: {
            title: 'Test for good',
          },
          type: 'root',
          children: [],
        },
      ],
    };
    const instance = new DialogueTree(jsonData);
    const rootA = instance.roots[0];
    expect(rootA.data?.title).toBe('Test for good');

    // single root with simple children
    const jsonDataB = {
      roots: [
        {
          type: 'root',
          data: {
            title: 'Test for good',
          },
          children: [
            {
              data: {
                content: 'Child 1',
              },
              type: 'sentence',
              children: [],
            },
            {
              data: {
                content: 'Child 2',
              },
              type: 'sentence',
              children: [],
            },
          ],
        },
      ],
    };
    const instanceB = new DialogueTree(jsonDataB);
    expect(instanceB.roots[0].children[0].data?.content).toBe('Child 1');
    expect(instanceB.roots[0].children[1].data?.content).toBe('Child 2');

    // single root with nested children
    const jsonDataC = {
      roots: [
        {
          type: 'root',
          data: {
            title: 'Test for good',
          },
          children: [
            {
              data: {
                content: 'Child node 1',
              },
              type: 'sentence',
              children: [
                {
                  data: {
                    content: 'Nested child node 1',
                  },
                  type: 'sentence',
                  children: [],
                },
              ],
            },
            {
              data: {
                content: 'Child 2',
              },
              type: 'sentence',
              children: [],
            },
          ],
        },
      ],
    };
    const instanceC = new DialogueTree(jsonDataC);
    expect(instanceC.roots[0].children[0].children[0].data?.content).toBe(
      'Nested child node 1'
    );

    // multi root with nested children
    const jsonDataD = {
      roots: [
        {
          data: {
            title: 'Test for good',
          },
          type: 'root',
          children: [
            {
              data: {
                content: 'Child node 1',
              },
              type: 'sentence',
              children: [
                {
                  data: {
                    content: 'Nested child node 1',
                  },
                  type: 'sentence',
                  children: [],
                },
              ],
            },
            {
              data: {
                content: 'Child 2',
              },
              type: 'sentence',
              children: [],
            },
          ],
        },
        {
          data: {
            title: 'B Test for good',
          },
          type: 'root',
          children: [
            {
              data: {
                content: 'B Child node 1',
              },
              type: 'sentence',
              children: [
                {
                  data: {
                    content: 'B Nested child node 1',
                  },
                  type: 'sentence',
                  children: [],
                },
              ],
            },
            {
              data: {
                content: 'B Child 2',
              },
              type: 'sentence',
              children: [],
            },
          ],
        },
      ],
    };
    const instanceD = new DialogueTree(jsonDataD);
    expect(instanceD.roots[1].children[0].children[0].data?.content).toBe(
      'B Nested child node 1'
    );
  });
});
