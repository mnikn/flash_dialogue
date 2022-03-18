import { Box, CardContent, Typography } from '@mui/material';
import { RootNodeJsonData } from 'renderer/core/model/node/root';
import NodeCard from './node_card';

const Root = ({
  selecting,
  data,
}: {
  selecting: boolean;
  data: RootNodeJsonData;
}) => {
  return (
    <NodeCard
      selecting={selecting}
      normalColor={'#ffaa5e'}
      hoverColor={'#ffd4a3'}
      activeColor={'#ffecd6'}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <CardContent
          sx={{
            flex: '1 0 auto',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography
            variant="h4"
            component="div"
            sx={{
              wordBreak: 'break-all',
              color: '#0d2b45',
              userSelect: 'none',
              textAlign: 'center',
            }}
          >
            {data.data.title}
          </Typography>
        </CardContent>
      </Box>
    </NodeCard>
  );
};

export default Root;
