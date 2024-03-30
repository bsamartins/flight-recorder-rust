import * as React from 'react';
import Box from '@mui/joy/Box';
import ListDivider from '@mui/joy/ListDivider';
import ListItem from '@mui/joy/ListItem';
import ListItemButton, {ListItemButtonProps} from '@mui/joy/ListItemButton';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import {toggleMessagesPane} from '../utils';
import {Flight} from "../bindings/Flight.ts";

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
                            <Typography level="title-sm">Departure: {flight.departure}</Typography>
                            <Typography level="title-sm">Arrival:  {flight.arrival}</Typography>
                            <Typography level="title-sm">Aircraft:  {flight.aircraft}</Typography>
                        </Box>
                    </Stack>
                </ListItemButton>
            </ListItem>
            <ListDivider sx={{ margin: 0 }} />
        </React.Fragment>
    );
}
