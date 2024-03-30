import * as React from 'react';
import {useEffect, useState} from 'react';
import Sheet from '@mui/joy/Sheet';
import FlightsPane from './FlightsPane.tsx';
import {listFlights} from "../commands";
import {Flight} from "../bindings/Flight.ts";

export default function MyFlights() {
    const [selectedFlight, setSelectedFlight] = React.useState<Flight | null>(null);
    const [flights, setFlights] = useState<Flight[]>([]);
    useEffect(() => {
        listFlights()
            .then(res => setFlights(res))
            .catch(err => console.error(err));
    }, []);
    return (
        <Sheet
            sx={{
                flex: 1,
                width: '100%',
                mx: 'auto',
                pt: { xs: 'var(--Header-height)', sm: 0 },
                display: 'grid',
                gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'minmax(min-content, min(30%, 400px)) 1fr',
                },
            }}
        >
            <Sheet
                sx={{
                    position: { xs: 'fixed', sm: 'sticky' },
                    transform: {
                        xs: 'translateX(calc(100% * (var(--MessagesPane-slideIn, 0) - 1)))',
                        sm: 'none',
                    },
                    transition: 'transform 0.4s, width 0.4s',
                    zIndex: 100,
                    width: '100%',
                    top: 52,
                }}
            >
                <FlightsPane
                    flights={flights}
                    setSelectedFlight={flight => setSelectedFlight(flight)}
                    selectedFlight={selectedFlight}
                />
            </Sheet>
            {/*<MessagesPane chat={selectedChat} />*/}
        </Sheet>
    );
}
