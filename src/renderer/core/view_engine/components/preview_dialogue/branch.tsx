import { Stack, Typography } from "@mui/material";
import { BranchData } from "renderer/core/model/node/branch";
import { getFinalImgPath } from "renderer/utils/pic";

const Branch = ({ data }: { data: BranchData }) => {
  const direction =
    data.actorPosition === 'center'
      ? 'column'
      : data.actorPosition === 'left'
      ? 'row'
      : 'row-reverse';
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
            }}
          />
        </div>
      )}

      <div
        style={{
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
      </div>
    </Stack>
  );
};

export default Branch;
