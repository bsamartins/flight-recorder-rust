import { Box, IconButton } from '@mui/joy';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import GpsNotFixedIcon from '@mui/icons-material/GpsNotFixed';

interface MapControlsProps {
  isFollowing: boolean;
  onFollowToggle: (following: boolean) => void;
}

export default function MapControls({ isFollowing, onFollowToggle }: MapControlsProps) {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 'calc(var(--Header-height) + 16px)',
        right: 16,
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      <IconButton
        onClick={() => onFollowToggle(!isFollowing)}
        variant={isFollowing ? 'solid' : 'outlined'}
        color={isFollowing ? 'primary' : 'neutral'}
        title={isFollowing ? 'Stop following flight' : 'Follow flight'}
      >
        {isFollowing ? <GpsFixedIcon /> : <GpsNotFixedIcon />}
      </IconButton>
    </Box>
  );
}
