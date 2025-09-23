import React, { useState } from 'react';
import { Container, Typography, Box } from '@mui/material';
import Task1 from './components/Task1/Task1';
import Task2 from './components/Task2/Task2';
import Navigation from './components/Layout/Navigation';
import Task3 from './components/Task3/Task3';
import Task4 from './components/Task4/Task4';
import Task5 from './components/Task5/Task5';

const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Случайные события и их имитация
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Генерация случайных событий и анализ частот
        </Typography>
      </Box>

      <Navigation currentTab={currentTab} onTabChange={handleTabChange} />

      {currentTab === 0 && <Task1 />}
      {currentTab === 1 && <Task2 />}
      {currentTab === 2 && <Task3 />}
      {currentTab === 3 && <Task4 />}
      {currentTab === 4 && <Task5 />}

    </Container>
  );
};

export default App;
