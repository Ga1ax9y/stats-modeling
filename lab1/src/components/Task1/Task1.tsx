import React, { useState, useMemo } from 'react';
import {
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Alert
} from '@mui/material';
import { generateSingleEvent, generateMultipleSamples } from '../../utils/generators';
import { calculateFrequencies } from '../../utils/statistics';

const Task1: React.FC = () => {
  const [probability, setProbability] = useState<number>(0.5);
  const [results, setResults] = useState<boolean[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleGenerate = () => {
    setIsCalculating(true);

    setTimeout(() => {
      const generatedResults = generateMultipleSamples(
        () => generateSingleEvent(probability),
        1000000
      ) as boolean[];

      setResults(generatedResults);
      setIsCalculating(false);
    }, 100);
  };

  const actualProbability = useMemo(() => {
    if (results.length === 0) return 0;
    return calculateFrequencies(results);
  }, [results]);

  const error = Math.abs(actualProbability - probability);

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Задание 1: Одиночное случайное событие
        </Typography>

        <Box sx={{ mb: 3 }}>
          <TextField
            label="Вероятность события"
            type="number"
            value={probability}
            onChange={(e) => setProbability(Math.max(0, Math.min(1, parseFloat(e.target.value))))}
            inputProps={{ min: 0, max: 1, step: 0.01 }}
            sx={{ mr: 2, width: 200 }}
          />
          <Button
            variant="contained"
            onClick={handleGenerate}
            disabled={isCalculating}
          >
            Запустить генерацию
          </Button>
        </Box>

        {isCalculating && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress />
            <Typography variant="body2" sx={{ mt: 1 }}>
              Генерация 1,000,000 событий...
            </Typography>
          </Box>
        )}

        {results.length > 0 && !isCalculating && (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Alert severity="info">
                <Typography variant="h6">Результаты:</Typography>
                <Typography>Теоретическая вероятность: {(probability * 100).toFixed(4)}%</Typography>
                <Typography>Фактическая частота: {(actualProbability * 100).toFixed(4)}%</Typography>
                <Typography>Ошибка: {(error * 100).toFixed(4)}%</Typography>
                <Typography>Количество испытаний: {results.length.toLocaleString()}</Typography>
              </Alert>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Первые 10 результатов:
                </Typography>
                <Typography variant="body2" fontFamily="monospace">
                  {results.slice(0, 10).map((result, index) => (
                    <span key={index}>{result ? 'T ' : 'F '}</span>
                  ))}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        )}
      </CardContent>
    </Card>
  );
};

export default Task1;
