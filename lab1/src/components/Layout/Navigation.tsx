import React from 'react';
import { Tabs, Tab, Box } from '@mui/material';

interface NavigationProps {
  currentTab: number;
  onTabChange: (event: React.SyntheticEvent, newValue: number) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentTab, onTabChange }) => {
  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
      <Tabs value={currentTab} onChange={onTabChange}>
        <Tab label="Задание 1" />
        <Tab label="Задание 2" />
        <Tab label="Задание 3" />
        <Tab label="Задание 4" />
        <Tab label="Задание 5" />
      </Tabs>
    </Box>
  );
};

export default Navigation;
