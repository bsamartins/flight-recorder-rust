import * as React from 'react';
import ListItem from '@mui/joy/ListItem';
import ListItemButton, { ListItemButtonProps } from '@mui/joy/ListItemButton';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import { toggleMessagesPane } from '../utils';
import { Flight } from '../bindings/Flight.ts';
import { useSelectedFlight } from '../state/flights.ts';
import dayjs, { Dayjs } from 'dayjs';
import duration, { Duration } from 'dayjs/plugin/duration';

dayjs.extend(duration);

type FlightListItemProps = ListItemButtonProps & {
  flight: Flight;
};

export default function FlightListItem(props: FlightListItemProps) {
  const [selectedFlight, setSelectedFlight] = useSelectedFlight();
  const { flight } = props;
  const selected = selectedFlight?.id === flight.id;
  const startDate = dayjs(flight.start);
  const endDate = flight.end ? dayjs(flight.end) : null;
  const diff = endDate?.diff(startDate, 'ms') ?? null;
  const duration = diff != null ? dayjs.duration(diff, 'ms') : null;
  return (
    <React.Fragment>
      <ListItem
        sx={{
          border: (theme) => `1px solid ${theme.palette.divider}`,
          borderRadius: 'var(--joy-radius-sm)',
        }}
      >
        <ListItemButton
          onClick={() => {
            toggleMessagesPane();
            setSelectedFlight(flight);
          }}
          selected={selected}
          color='neutral'
          sx={{
            flexDirection: 'column',
            alignItems: 'initial',
            gap: 1,
            borderRadius: 'var(--joy-radius-sm)',
          }}
        >
          <Stack direction='column' spacing={1.5}>
            <Stack direction='row' spacing={1}>
              <Typography level='title-lg' flex={1}>
                {flight.aircraft || 'No Callsign'}
              </Typography>
            </Stack>
            <Stack direction='row' textTransform='uppercase' spacing={0.5}>
              <Stack direction='column'>
                <Typography level='body-sm' fontStyle={flight.departure ? 'italic' : undefined}>
                  {flight.departure ?? 'Unknown'}
                </Typography>
                <Typography level='body-xs' textTransform='uppercase'>
                  {formatDisplayDate(startDate)}
                </Typography>
                <Typography level='body-xs' textTransform='uppercase'>
                  {formatDisplayTime(startDate)}
                </Typography>
              </Stack>
              <Typography level='body-sm'>→</Typography>
              <Stack direction='column'>
                <Typography level='body-sm' fontStyle={flight.departure ? 'italic' : undefined}>
                  {flight.arrival ?? 'Unknown'}
                </Typography>
                {endDate && (
                  <>
                    <Typography level='body-xs' textTransform='uppercase'>
                      {formatDisplayDate(endDate)}
                    </Typography>
                    <Typography level='body-xs' textTransform='uppercase'>
                      {formatDisplayTime(endDate)}
                    </Typography>
                  </>
                )}
              </Stack>
              {duration && (
                <>
                  <Typography level='body-xs'>·</Typography>
                  <Typography level='body-xs'>{duration && formatDuration(duration)}</Typography>
                </>
              )}
            </Stack>
          </Stack>
        </ListItemButton>
      </ListItem>
    </React.Fragment>
  );
}

const formatDisplayDate = (date: string | Date | Dayjs) => {
  return dayjs(date).format('DD MMM YYYY');
};

const formatDisplayTime = (date: string | Date | Dayjs) => {
  return dayjs(date).format('HH:mm');
};

const formatDuration = (duration: Duration) => {
  return duration.format('HH:mm');
};
