import GlobalStyles from '@mui/joy/GlobalStyles';
import Sheet from '@mui/joy/Sheet';
import Typography from '@mui/joy/Typography';
import ConnectingAirportsIcon from '@mui/icons-material/ConnectingAirportsRounded';
import { Box, IconButton } from '@mui/joy';
import { useWindowMaximized } from '../tauri/react.ts';
import { getCurrent } from '@tauri-apps/api/window';
import MinimizeIcon from '@mui/icons-material/Minimize';
import MaximizeIcon from '@mui/icons-material/Maximize';
import FilterNoneIcon from '@mui/icons-material/FilterNone';
import CloseSharpIcon from '@mui/icons-material/CloseSharp';

export default function Header() {
  const maximized = useWindowMaximized();
  const toggleMaximize = () => {
    getCurrent()
      .toggleMaximize()
      .then(() => console.log('maximized'))
      .catch((err) => console.error(err));
  };
  const minimize = () => {
    getCurrent()
      .minimize()
      .then(() => console.log('minimized'))
      .catch((err) => console.error(err));
  };

  const close = () => {
    getCurrent()
      .close()
      .then(() => console.log('closed'))
      .catch((err) => console.error(err));
  };

  return (
    <Sheet
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100vw',
        height: 'var(--Header-height)',
        p: 2,
        gap: 1,
        borderBottom: '1px solid',
        borderColor: 'background.level1',
        boxShadow: 'sm',
        '& > *': {
          userSelect: 'none',
        },
      }}
      onDoubleClick={() => toggleMaximize()}
    >
      <GlobalStyles
        styles={{
          ':root': {
            '--Header-height': '52px',
          },
        }}
      />
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          justifyContent: 'space-between',
        }}
      >
        <ConnectingAirportsIcon />
        <Typography level='title-lg'>Flight Recorder</Typography>
      </Box>
      <Box data-tauri-drag-region>&nbsp;</Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'nowrap',
          gap: 1,
          justifyContent: 'flex-end',
          alignItems: 'center',
        }}
      >
        <IconButton size='sm' onClick={() => minimize()}>
          <MinimizeIcon />
        </IconButton>
        <IconButton size='sm' onClick={() => toggleMaximize()}>
          {maximized ? <FilterNoneIcon /> : <MaximizeIcon />}
        </IconButton>
        <IconButton
          size='sm'
          onClick={() => close()}
          sx={{
            '&:hover': {
              backgroundColor: (theme) => theme.palette.danger.softHoverBg,
            },
          }}
        >
          <CloseSharpIcon />
        </IconButton>
      </Box>
    </Sheet>
  );
}
