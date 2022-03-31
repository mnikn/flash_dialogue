import DialogueTree from '../../../renderer/core/model/dialogue_tree';

describe('model dialogue tree', () => {
  it('should parse json data correct', () => {
    // single root single node
    const jsonData = {
      dialogues: [
        {
          data: {
            title: 'Test for good',
          },
          type: 'root',
          children: [],
          links: [],
        },
      ],
      projectSettings: {
        actors: [],
        i18n: [],
      },
      i18nData: {},
    };
    const instance = new DialogueTree(jsonData);
    const rootA = instance.dialogues[0];
    expect(rootA.data?.title).toBe('Test for good');

    // single root with simple children
    const jsonDataB = {
      dialogues: [
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
              links: [],
            },
            {
              data: {
                content: 'Child 2',
              },
              type: 'sentence',
              children: [],
              links: [],
            },
          ],
          links: [],
        },
      ],
      projectSettings: {
        actors: [],
        i18n: [],
      },
      i18nData: {},
    };
    const instanceB = new DialogueTree(jsonDataB);
    expect(instanceB.dialogues[0].children[0].data?.content).toBe('Child 1');
    expect(instanceB.dialogues[0].children[1].data?.content).toBe('Child 2');

    // single root with nested children
    const jsonDataC = {
      dialogues: [
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
                  links: [],
                },
              ],
              links: [],
            },
            {
              data: {
                content: 'Child 2',
              },
              type: 'sentence',
              children: [],
              links: [],
            },
          ],
          links: [],
        },
      ],
      projectSettings: {
        actors: [],
        i18n: [],
      },
      i18nData: {},
    };
    const instanceC = new DialogueTree(jsonDataC);
    expect(instanceC.dialogues[0].children[0].children[0].data?.content).toBe(
      'Nested child node 1'
    );

    // multi root with nested children
    const jsonDataD = {
      dialogues: [
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
                  links: [],
                },
              ],
              links: [],
            },
            {
              data: {
                content: 'Child 2',
              },
              type: 'sentence',
              children: [],

              links: [],
            },
          ],
          links: [],
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
                  links: [],
                },
              ],
              links: [],
            },
            {
              data: {
                content: 'B Child 2',
              },
              type: 'sentence',
              children: [],

              links: [],
            },
          ],
          links: [],
        },
      ],
      projectSettings: {
        actors: [],
        i18n: [],
      },
      i18nData: {},
    };
    const instanceD = new DialogueTree(jsonDataD);
    expect(instanceD.dialogues[1].children[0].children[0].data?.content).toBe(
      'B Nested child node 1'
    );
  });
});
