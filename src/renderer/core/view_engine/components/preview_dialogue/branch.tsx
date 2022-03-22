import { Button, Stack, Typography } from '@mui/material';
import { BranchData } from 'renderer/core/model/node/branch';
import { NodeLinkJsonData } from 'renderer/core/model/node/link';
import { getFinalImgPath } from 'renderer/utils/pic';

const Branch = ({
  data,
  linkData,
  onOptionClick,
}: {
  data: BranchData;
  linkData: NodeLinkJsonData[];
  onOptionClick: (link: NodeLinkJsonData) => void;
}) => {
  const direction =
    data.actorPosition === 'center'
      ? 'column'
      : data.actorPosition === 'left'
      ? 'row'
      : 'row-reverse';

  console.log('prview b data: ', data, linkData);
  return (
    <Stack
      direction={direction}
      spacing={1}
      sx={{ width: '100%', alignItems: 'center' }}
    >
      {data.actors.length > 0 && (
        <div
          style={{
            width: '72px',
            flexShrink: 0,
            padding: '4px',
            borderRadius: '18px',
            margin: '12px',
            backgroundColor: '#0d2b45',
            display: 'flex',
          }}
        >
          <img
            src={getFinalImgPath(data.actors[0].portrait.pic)}
            style={{
              height: '100%',
              width: '100%',
              backgroundColor: '#0d2b45',
              borderRadius: '18px',
              userSelect: 'none',
            }}
          />
        </div>
      )}

      <Stack
        sx={{
          background: '#7145FF',
          flexGrow: 1,
          alignSelf: 'normal',
          textAlign: direction === 'column' ? 'center' : 'left',
          borderRadius: '18px',
          minHeight: '72px',
          padding: '18px',
          boxShadow:
            'rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px',
        }}
        direction="column"
        spacing={2}
      >
        <Typography
          variant="h6"
          sx={{
            wordBreak: 'break-all',
            color: '#fff',
            userSelect: 'none',
          }}
        >
          {data.content}
        </Typography>

        <Stack direction="column" spacing={1}>
          {linkData.map((l) => {
            return (
              <Button
                variant="contained"
                sx={{
                  backgroundColor: '#ffaa5e',
                  '&:hover': {
                    backgroundColor: '#ffd4a3',
                  },
                  borderRadius: '8px',
                  height: '40px',
                }}
                onClick={() => onOptionClick(l)}
              >
                {l.data.optionName}
              </Button>
            );
          })}
        </Stack>
      </Stack>
    </Stack>
  );
};

export default Branch;
