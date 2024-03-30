import * as React from 'react';
import Box from '@mui/joy/Box';
import ListDivider from '@mui/joy/ListDivider';
import ListItem from '@mui/joy/ListItem';
import ListItemButton, {ListItemButtonProps} from '@mui/joy/ListItemButton';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import {toggleMessagesPane} from '../utils';
import {Flight} from "../bindings/Flight.ts";
import {FlightLandRounded, FlightTakeoffRounded} from "@mui/icons-material";

type FlightListItemProps = ListItemButtonProps & {
    flight: Flight;
    selectedFlight?: Flight | null;
    setSelectedFlight: (flight: Flight) => void;
};

export default function FlightListItem(props: FlightListItemProps) {
    const { flight, selectedFlight, setSelectedFlight } = props;
    const selected = selectedFlight?.id === flight.id;
    return (
        <React.Fragment>
            <ListItem>
                <ListItemButton
                    onClick={() => {
                        toggleMessagesPane();
                        setSelectedFlight(flight);
                    }}
                    selected={selected}
                    color="neutral"
                    sx={{
                        flexDirection: 'column',
                        alignItems: 'initial',
                        gap: 1,
                    }}
                >
                    <Stack direction="row" spacing={1.5}>
                        <Box sx={{ flex: 1 }}>
                            <Box>
                                <Typography level="body-sm"><FlightTakeoffRounded/> {flight.departure}</Typography>
                            </Box>
                            <Box>
                                <Typography level="body-sm"><FlightLandRounded/> {flight.arrival}</Typography>
                            </Box>
                            <Box>
                                <Typography level="body-sm">Aircraft: {flight.aircraft}</Typography>
                            </Box>
                        </Box>
                    </Stack>
                </ListItemButton>
            </ListItem>
            <ListDivider sx={{ margin: 0 }} />
        </React.Fragment>
    );
}
