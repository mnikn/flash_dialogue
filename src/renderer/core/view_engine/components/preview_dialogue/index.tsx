import CloseIcon from '@mui/icons-material/Close';
import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { NodeJsonData } from 'renderer/core/model/node';
import { BranchData } from 'renderer/core/model/node/branch';
import { findLink, findNodeById } from 'renderer/core/model/node/factory';
import { NodeLinkJsonData } from 'renderer/core/model/node/link';
import { RootNodeJsonData } from 'renderer/core/model/node/root';
import { SentenceData } from 'renderer/core/model/node/sentence';
import DeleteItcon from '@mui/icons-material/Delete';
import Branch from './branch';
import Sentence from './sentence';

interface Flag {
  id: string;
  match: boolean;
}

const FlagItem = ({
  data,
  onChange,
  onDelete,
}: {
  data: Flag;
  onChange: (val: Flag) => void;
  onDelete: () => void;
}) => {
  return (
    <Stack spacing={1} direction="row" sx={{ alignItems: 'center' }}>
      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox
              checked={data.match}
              value={data.match}
              size="small"
              onChange={(e) => {
                onChange({
                  ...data,
                  match: e.target.checked,
                });
              }}
            />
          }
          label="Match"
        />
      </FormGroup>
      <TextField
        margin="dense"
        label="Flag"
        type="text"
        size="small"
        fullWidth
        required
        value={data.id}
        onChange={(e: any) => {
          onChange({
            ...data,
            id: e.target.value,
          });
        }}
      />
      <DeleteItcon sx={{ cursor: 'pointer' }} onClick={onDelete} />
    </Stack>
  );
};

class DialogueProcessor {
  public currentNode: NodeJsonData | null;
  private rootNode: NodeJsonData;

  public flags: Flag[] = [];

  constructor(root: RootNodeJsonData) {
    this.currentNode = root;
    this.rootNode = root;
  }

  public next(): NodeJsonData | null {
    if (!this.currentNode) {
      return null;
    }

    const matchLink = this.currentNode.links.find((link) => {
      if ((link.data.transferFlags || []).length <= 0) {
        return link;
      }

      const matchFlag = link.data.transferFlags.find((flag: Flag) => {
        return this.flags.find(
          (df) => df.id === flag.id && df.match === flag.match
        );
      });
      return !!matchFlag;
    });

    if (matchLink) {
      const nextNode = findNodeById(this.rootNode, matchLink.targetId);
      this.currentNode = nextNode;
      return nextNode;
    } else {
      return null;
    }
  }

  public jumpToTargetNode(link: NodeLinkJsonData): NodeJsonData | null {
    if (!this.currentNode || !link.targetId) {
      return null;
    }

    const nextNode = findNodeById(this.rootNode, link.targetId);
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
  const [flags, setFlags] = useState<Flag[]>([]);
  const handleOnClose = (_: any, reason: string) => {
    if (reason !== 'backdropClick') {
      close();
    }
  };

  const next = useCallback(
    (link?: NodeLinkJsonData) => {
      if (
        finished ||
        (dialogueProcessorRef.current.currentNode?.type === 'branch' && !link)
      ) {
        return;
      }

      let node: NodeJsonData | null = null;
      if (link) {
        node = dialogueProcessorRef.current.jumpToTargetNode(link);
      } else {
        node = dialogueProcessorRef.current.next();
      }

      if (!node) {
        setFinished(true);
        return;
      }
      setChatList((prev) => {
        return [...prev, node];
      });
    },
    [finished]
  );

  const onDomMounted = (dom: HTMLDivElement) => {
    if (!dom) {
      return;
    }

    contentDomRef.current = dom;
    contentDomRef.current.addEventListener('click', () => {
      next();
    });
  };

  useEffect(() => {
    dialogueProcessorRef.current.flags = flags;
  }, [flags]);

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
          paddingTop: '20px!important',
          background: '#544e68',
        }}
      >
        <div
          style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Stack
            spacing={1}
            sx={{
              background: '#fff',
              height: '100px',
              padding: '12px',
              borderRadius: '18px',
            }}
            direction="column"
          >
            {flags.length === 0 && (
              <Typography
                variant="body2"
                sx={{
                  color: '#707070',
                  userSelect: 'none',
                  textAlign: 'center',
                  verticalAlign: 'middle',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                }}
              >
                Empty
              </Typography>
            )}
            <Grid
              container
              spacing={2}
              sx={{
                overflow: 'auto',
              }}
            >
              {flags.map((item, i) => {
                return (
                  <Grid item xs={6} key={i}>
                    <FlagItem
                      key={i}
                      data={item}
                      onChange={(val) => {
                        setFlags((prev) => {
                          return prev.map((f, j) => (j === i ? val : f));
                        });
                      }}
                      onDelete={() => {
                        setFlags((prev) => {
                          return prev.filter((_, j) => j !== i);
                        });
                      }}
                    />
                  </Grid>
                );
              })}
            </Grid>
            <Button
              variant="contained"
              sx={{
                borderRadius: '8px',
                marginTop: 'auto!important',
              }}
              onClick={() => {
                setFlags((prev) => {
                  return [...prev, { id: '', match: true }];
                });
              }}
            >
              Add flag
            </Button>
          </Stack>
          <Stack
            spacing={4}
            direction="column"
            sx={{
              alignItems: 'center',
              height: '600px',
              cursor: 'pointer',
              overflow: 'auto',
              paddingTop: '20px',
            }}
            ref={onDomMounted}
          >
            {chatList.map((item) => {
              if (item.type === 'branch') {
                return (
                  <Branch
                    key={item.id}
                    data={item.data as BranchData}
                    linkData={item.links}
                    onOptionClick={next}
                  />
                );
              }
              return (
                <Sentence key={item.id} data={item.data as SentenceData} />
              );
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PreviewDialogue;
