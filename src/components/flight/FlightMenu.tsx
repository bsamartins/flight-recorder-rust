import { useState } from 'react';
import Button from '@mui/joy/Button';
import Menu from '@mui/joy/Menu';
import MenuItem from '@mui/joy/MenuItem';
import Modal from '@mui/joy/Modal';
import ModalClose from '@mui/joy/ModalClose';
import ModalDialog from '@mui/joy/ModalDialog';
import DialogTitle from '@mui/joy/DialogTitle';
import DialogContent from '@mui/joy/DialogContent';
import DialogActions from '@mui/joy/DialogActions';
import { Flight } from '../../bindings/Flight.ts';
import { deleteFlight } from '../../commands';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useFlightStoreSelector } from '../../hooks/useFlightStoreSelector.ts';

interface FlightMenuProps {
  flight: Flight;
  anchor?: HTMLElement | null;
  onClose?: () => void;
}

export const FlightMenu = (props: FlightMenuProps) => {
  const { flight, anchor, onClose } = props;
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const queryClient = useQueryClient();
  const clearSelectedFlight = useFlightStoreSelector((s) => s.clearSelectedFlight);

  const deleteFlightMutation = useMutation({
    mutationFn: (flightId: string) => deleteFlight(flightId),
    onSuccess: () => {
      setShowDeleteConfirm(false);
      clearSelectedFlight();
      queryClient.invalidateQueries({ queryKey: ['list-flights'] });
    },
    onError: (error) => {
      console.error('Failed to delete flight:', error);
    },
  });

  const handleMenuClose = () => {
    onClose?.();
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
    handleMenuClose();
  };

  const handleConfirmDelete = () => {
    deleteFlightMutation.mutate(flight.id);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <Menu
        id='flight-menu'
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={handleMenuClose}
        placement='bottom-end'
      >
        <MenuItem onClick={handleDeleteClick}>Delete</MenuItem>
      </Menu>

      <Modal
        aria-labelledby='delete-flight-dialog'
        open={showDeleteConfirm}
        onClose={handleCancelDelete}
        slotProps={{
          backdrop: {
            sx: {
              opacity: 0,
            },
          },
        }}
      >
        <ModalDialog
          aria-labelledby='delete-flight-dialog'
          variant='outlined'
          role='alertdialog'
          sx={{ width: 300 }}
        >
          <ModalClose variant='plain' sx={{ m: 1 }} />
          <DialogTitle id='delete-flight-dialog'>Delete Flight?</DialogTitle>
          <DialogContent>
            Are you sure you want to delete this flight? This action cannot be undone.
          </DialogContent>
          <DialogActions>
            <Button
              variant='plain'
              color='neutral'
              onClick={handleCancelDelete}
              disabled={deleteFlightMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant='solid'
              color='danger'
              onClick={handleConfirmDelete}
              loading={deleteFlightMutation.isPending}
            >
              Delete
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>
    </>
  );
};
