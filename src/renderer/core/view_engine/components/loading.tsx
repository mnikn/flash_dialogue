import { Alert, CircularProgress, Stack } from '@mui/material';

const Loading = ({ content }: { content: string }) => {
  return (
    <Alert
      sx={{
        position: 'fixed',
        width: '50%',
        transform: 'translateX(50%)',
        zIndex: 10,
        top: '50px',
        height: '100px',
        borderRadius: '8px',
      }}
      icon={<></>}
      variant="standard"
      color="info"
    >
      <Stack
        spacing={2}
        direction="row"
        sx={{ alignItems: 'center', height: '100%', width: '100%' }}
      >
        <CircularProgress />
        <div style={{ fontSize: '18px' }}>{content}</div>
      </Stack>
    </Alert>
  );
};

export default Loading;
