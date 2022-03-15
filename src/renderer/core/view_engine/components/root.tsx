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
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flex: '1 0 auto' }}>
          <Typography
            variant="subtitle1"
            color="text.secondary"
            component="div"
            sx={{
              wordBreak: 'break-all',
              color: '#0d2b45',
            }}
          >
            {data.data.title}
          </Typography>
        </CardContent>
      </Box>
    </NodeCard>
  );
};

/* const LinkAction = () => {
 *   return <AddCircleIcon sx={{ color: '#ffd4a3', cursor: 'pointer' }} />;
 * }; */

export default Root;
