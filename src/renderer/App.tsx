import { useLayoutEffect } from 'react';
import './App.css';
import DialogueTree from './core';

export default function App() {
  useLayoutEffect(() => {
    const tree = new DialogueTree({
      containerId: 'dialogue-tree-container',
    });
    tree.init();
    tree.load({
      dialogues: [
        {
          data: {
            title: 'flare',
          },
          type: 'root',
          children: [
            {
              id: 'branch1',
              data: {
                content: 'This is a test?',
              },
              type: 'branch',
              children: [
                {
                  id: 'bs1',
                  type: 'sentence',
                  data: {
                    content: 'Good',
                  },
                  children: [],
                  links: [],
                },
                {
                  id: 'bs2',
                  type: 'sentence',
                  data: {
                    content: 'Bad',
                  },
                  children: [],
                  links: [],
                },
              ],
              links: [
                {
                  sourceId: 'branch1',
                  targetId: 'bs1',
                  data: {
                    optionId: 'true',
                    optionName: 'True',
                  },
                },
                {
                  sourceId: 'branch1',
                  targetId: 'bs2',
                  data: {
                    optionId: 'false',
                    optionName: 'False',
                  },
                },
              ],
            },
          ],
        },
      ],
    });
  }, []);
  return (
    <>
      <div
        id="dialogue-tree-container"
        style={{
          height: '100%',
          width: '100%',
          padding: '30px',
        }}
      ></div>
    </>
  );
}
