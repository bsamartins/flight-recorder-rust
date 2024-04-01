import * as React from 'react';
import GlobalStyles from '@mui/joy/GlobalStyles';
import IconButton from '@mui/joy/IconButton';
import Sheet from '@mui/joy/Sheet';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import { toggleSidebar } from '../utils.ts';
import Typography from "@mui/joy/Typography";
import {Box} from "@mui/joy";
import ConnectingAirportsIcon from "@mui/icons-material/ConnectingAirportsRounded";

export default function Header() {
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
            }}
        >
            <GlobalStyles
                styles={{
                    ':root': {
                        '--Header-height': '52px',
                    },
                }}
            />
            <IconButton
                onClick={() => toggleSidebar()}
                variant="outlined"
                color="neutral"
                size="sm"
            >
                <MenuRoundedIcon />
            </IconButton>
            <ConnectingAirportsIcon/>
            <Typography level="title-lg">Flight Recorder</Typography>
        </Sheet>
    );
}
