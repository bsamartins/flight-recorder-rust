import planeSvgUrl from './flight_24px.svg?raw';

export const getPlaneImageData = (color: string = '#0080FF'): string => {
  // Load SVG from file and update fill color
  const svg = planeSvgUrl.replace(/fill="[^"]*"/g, (match) => {
    // Skip the transparent fill
    if (match.includes('none')) return match;
    return `fill="${color}"`;
  });

  return 'data:image/svg+xml;base64,' + btoa(svg);
};
