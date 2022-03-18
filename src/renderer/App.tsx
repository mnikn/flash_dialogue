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
              data: {
                content: 'This is a test',
              },
              type: 'sentence',
              children: [],
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
