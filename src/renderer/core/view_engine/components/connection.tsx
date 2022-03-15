import SettingsIcon from '@mui/icons-material/Settings';

const Connection = ({
  from,
  target,
  linkData,
}: {
  from: any;
  target: any;
  linkData: any;
}) => {
  const midpoint = [(from.x + target.x) / 2 - 55, (from.y + target.y) / 2 - 15];
  return (
    <div
      style={{
        transform: `translate(${midpoint[1]}px,${midpoint[0]}px)`,
        position: 'absolute',
      }}
    >
      <SettingsIcon
        sx={{
          color: '#ffd4a3',
          cursor: 'pointer',
          fontSize: '48px',
          pointerEvents: 'initial',
        }}
      />
    </div>
  );
};

export default Connection;
