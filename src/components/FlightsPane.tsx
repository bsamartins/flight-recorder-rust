import * as React from 'react';
import Stack from '@mui/joy/Stack';
import Sheet from '@mui/joy/Sheet';
import Typography from '@mui/joy/Typography';
import {Box, Input} from '@mui/joy';
import List from '@mui/joy/List';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import FlightListItem from './FlightListItem.tsx';
import {Flight} from "../bindings/Flight.ts";

type FlightsPaneProps = {
    flights: Flight[];
    setSelectedFlight: (flight: Flight) => void;
    selectedFlight?: Flight | null;
};

export default function FlightsPane(props: FlightsPaneProps) {
    const { flights, setSelectedFlight, selectedFlight } = props;
    return (
        <Sheet
            sx={{
                borderRight: '1px solid',
                borderColor: 'divider',
                height: 'calc(100dvh - var(--Header-height))',
                overflowY: 'auto',
            }}
        >
            <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                justifyContent="space-between"
                p={2}
                pb={1.5}
            >
                <Typography
                    fontSize={{ xs: 'md', md: 'lg' }}
                    component="h1"
                    fontWeight="lg"
                    sx={{ mr: 'auto' }}
                >
                    Flights
                </Typography>
            </Stack>
            <Box sx={{ px: 2, pb: 1.5 }}>
                <Input
                    size="sm"
                    startDecorator={<SearchRoundedIcon />}
                    placeholder="Search"
                    aria-label="Search"
                />
            </Box>
            <List
                sx={{
                    py: 0,
                    '--ListItem-paddingY': '0.75rem',
                    '--ListItem-paddingX': '1rem',
                }}
            >
                {flights.map((flight) => (
                    <FlightListItem
                        key={flight.id}
                        flight={flight}
                        setSelectedFlight={setSelectedFlight}
                        selectedFlight={selectedFlight}
                    />
                ))}
            </List>
        </Sheet>
    );
}
