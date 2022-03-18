import { Card, Stack } from '@mui/material';
import { ReactNode } from 'react';

const NodeCard = ({
  selecting,
  children,
  onDoubleClick,
  normalColor = '#ffaa5e',
  hoverColor = '#ffd4a3',
  activeColor = '#ffecd6',
}: {
  selecting: boolean;
  children: ReactNode;
  normalColor?: string;
  hoverColor?: string;
  activeColor?: string;
  onDoubleClick?: () => void;
}) => {
  return (
    <Stack direction="row" sx={{ alignItems: 'center' }} spacing={2}>
      <Card
        sx={{
          display: 'flex',
          width: '400px',
          height: '176px',
          borderRadius: '36px',
          background: selecting ? activeColor : normalColor,
          transition: selecting ? '' : 'background 0.5s',
          boxShadow:
            'rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px',
          '&:hover': {
            background: selecting ? activeColor : hoverColor,
          },
        }}
        onDoubleClick={onDoubleClick}
      >
        {children}
      </Card>
    </Stack>
  );
};

export default NodeCard;
