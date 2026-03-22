import React from 'react';
import Sheet from '@mui/joy/Sheet';
import { SxProps } from '@mui/material';

export interface BlurredContainerProps {
  sx?: SxProps;
}
export const BlurredContainer = (props: BlurredContainerProps & React.PropsWithChildren) => {
  const { sx } = props;
  return (
    <Sheet
      sx={{
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(10px)',
        borderRadius: 'var(--joy-radius-sm)',
        ...sx,
      }}
    >
      {props.children}
    </Sheet>
  );
};
