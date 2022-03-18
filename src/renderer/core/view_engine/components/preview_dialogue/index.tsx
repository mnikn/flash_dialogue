import CloseIcon from '@mui/icons-material/Close';
import {
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
} from '@mui/material';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { NodeJsonData } from 'renderer/core/model/node';
import { BranchData } from 'renderer/core/model/node/branch';
import { RootNodeJsonData } from 'renderer/core/model/node/root';
import { SentenceData } from 'renderer/core/model/node/sentence';
import Branch from './branch';
import Sentence from './sentence';

class DialogueProcessor {
  public currentNode: NodeJsonData;

  constructor(root: RootNodeJsonData) {
    this.currentNode = root;
  }

  public next(): NodeJsonData | null {
    if (!this.currentNode) {
      return null;
    }

    const nextNode = this.currentNode.children[0];
    this.currentNode = nextNode;
    return nextNode;
  }
}

const PreviewDialogue = ({
  close,
  data,
}: {
  close: () => void;
  data: RootNodeJsonData;
}) => {
  const [chatList, setChatList] = useState<NodeJsonData[]>([]);
  const [finished, setFinished] = useState<boolean>(false);
  const contentDomRef = useRef<HTMLDivElement>();
  const dialogueProcessorRef = useRef<DialogueProcessor>(
    new DialogueProcessor(data)
  );
  const handleOnClose = (_: any, reason: string) => {
    if (reason !== 'backdropClick') {
      close();
    }
  };

  const next = useCallback(() => {
    if (finished) {
      return;
    }

    const node = dialogueProcessorRef.current.next();
    if (!node) {
      setFinished(true);
      return;
    }
    setChatList((prev) => {
      return [...prev, node];
    });
  }, [finished]);

  useLayoutEffect(() => {
    if (!contentDomRef.current) {
      return;
    }

    return () => {
      contentDomRef.current?.removeEventListener('click', next);
    };
  }, []);

  const onDomMounted = (dom: HTMLDivElement) => {
    if (!dom) {
      return;
    }

    contentDomRef.current = dom;
    contentDomRef.current.addEventListener('click', next);
  };

  return (
    <Dialog
      open
      onClose={handleOnClose}
      PaperProps={{
        style: { borderRadius: '32px' },
      }}
    >
      <DialogTitle>
        <Stack direction="row" sx={{ alignItems: 'center' }}>
          <div
            style={{
              userSelect: 'none',
            }}
          >
            Preview Dialogue -- {data.data.title}
          </div>
          <CloseIcon
            sx={{ marginLeft: 'auto', cursor: 'pointer' }}
            onClick={close}
          />
        </Stack>
      </DialogTitle>
      <DialogContent
        sx={{
          width: '550px',
          height: '600px',
          paddingTop: '20px!important',
          cursor: 'pointer',
          background: '#544e68',
        }}
        ref={onDomMounted}
      >
        <Stack spacing={4} direction="column" sx={{ alignItems: 'center' }}>
          {chatList.map((item) => {
            if (item.type === 'branch') {
              return <Branch key={item.id} data={item.data as BranchData} />;
            }
            return <Sentence key={item.id} data={item.data as SentenceData} />;
          })}
          {finished && (
            <DialogContentText
              sx={{
                marginTop: '32px!important',
                color: '#fff',
                userSelect: 'none',
              }}
            >
              Dialogue finished
            </DialogContentText>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default PreviewDialogue;
