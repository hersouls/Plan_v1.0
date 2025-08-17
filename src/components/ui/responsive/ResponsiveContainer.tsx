import React from 'react';
import { ResponsiveContainer as RechartsResponsiveContainer } from 'recharts';

export interface ResponsiveContainerProps {
  width?: string | number;
  height?: string | number;
  children: React.ReactElement;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  width = '100%',
  height = 300,
  children,
}) => {
  return (
    <RechartsResponsiveContainer width={width} height={height}>
      {children}
    </RechartsResponsiveContainer>
  );
};