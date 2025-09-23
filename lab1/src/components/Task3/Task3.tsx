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
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { generateConditionalSamples } from '../../utils/generators';
import { calculateConditionalFrequencies, calculateTheoreticalProbabilities } from '../../utils/statistics';

const Task3: React.FC = () => {
  const [pA, setPA] = useState<number>(0.6);
  const [pBGivenA, setPBGivenA] = useState<number>(0.7);
  const [results, setResults] = useState<number[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleGenerate = () => {
    setIsCalculating(true);

    setTimeout(() => {
      const generatedResults = generateConditionalSamples(pA, pBGivenA, 1000000);
      setResults(generatedResults);
      setIsCalculating(false);
    }, 100);
  };

  const actualFrequencies = useMemo(() => {
    if (results.length === 0) return [0, 0, 0, 0];
    return calculateConditionalFrequencies(results);
  }, [results]);

  const theoreticalProbabilities = useMemo(() => {
    return calculateTheoreticalProbabilities(pA, pBGivenA);
  }, [pA, pBGivenA]);

  const eventNames = ['AB', 'AB̅', 'A̅B', 'A̅B̅'];
  const eventDescriptions = [
    'Событие A и B произошли',
    'Событие A произошло, B не произошло',
    'Событие A не произошло, B произошло',
    'Событие A и B не произошли'
  ];

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Задание 3: Условные вероятности
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Входные параметры:
          </Typography>

          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="P(A) - вероятность события A"
                type="number"
                value={pA}
                onChange={(e) => setPA(Math.max(0, Math.min(1, parseFloat(e.target.value))))}
                inputProps={{ min: 0, max: 1, step: 0.01 }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="P(B|A) - условная вероятность B при A"
                type="number"
                value={pBGivenA}
                onChange={(e) => setPBGivenA(Math.max(0, Math.min(1, parseFloat(e.target.value))))}
                inputProps={{ min: 0, max: 1, step: 0.01 }}
              />
            </Grid>
          </Grid>

          <Button
            variant="contained"
            onClick={handleGenerate}
            disabled={isCalculating}
            sx={{ mt: 2 }}
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
            <Grid size={{ xs: 12 }}>
              <Alert severity="info">
                <Typography variant="h6">Общая информация:</Typography>
                <Typography>Количество испытаний: {results.length.toLocaleString()}</Typography>
                <Typography>P(A̅) = {(1 - pA).toFixed(4)}</Typography>
                <Typography>P(B|A̅) = {(1 - pBGivenA).toFixed(4)}</Typography>
              </Alert>
            </Grid>

            <Grid size={{ xs: 12}}>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Событие</TableCell>
                      <TableCell>Описание</TableCell>
                      <TableCell>Теоретическая вероятность</TableCell>
                      <TableCell>Фактическая частота</TableCell>
                      <TableCell>Ошибка</TableCell>
                      <TableCell>Количество</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {eventNames.map((eventName, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Chip label={eventName} color="primary" variant="outlined" />
                        </TableCell>
                        <TableCell>{eventDescriptions[index]}</TableCell>
                        <TableCell>{(theoreticalProbabilities[index] * 100).toFixed(4)}%</TableCell>
                        <TableCell>{(actualFrequencies[index] * 100).toFixed(4)}%</TableCell>
                        <TableCell>
                          {(Math.abs(actualFrequencies[index] - theoreticalProbabilities[index]) * 100).toFixed(4)}%
                        </TableCell>
                        <TableCell>
                          {Math.round(actualFrequencies[index] * results.length).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Распределение первых 50 результатов:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {results.slice(0, 50).map((result, index) => (
                    <Chip
                      key={index}
                      label={eventNames[result]}
                      size="small"
                      variant="outlined"
                      color={
                        result === 0 ? 'success' :
                        result === 1 ? 'warning' :
                        result === 2 ? 'info' : 'default'
                      }
                    />
                  ))}
                </Box>
              </Box>
            </Grid>

            <Grid size={{ xs: 12}}>
              <Box sx={{ p: 2, border: 1, borderColor: 'primary.main', borderRadius: 1 }}>
                <Typography variant="h6" gutterBottom color="primary">
                  Формулы расчета:
                </Typography>
                <Typography variant="body2" fontFamily="monospace">
                  P(A̅) = 1 - P(A) = 1 - {pA.toFixed(2)} = {(1 - pA).toFixed(4)}
                </Typography>
                <Typography variant="body2" fontFamily="monospace">
                  P(B|A̅) = 1 - P(B|A) = 1 - {pBGivenA.toFixed(2)} = {(1 - pBGivenA).toFixed(4)}
                </Typography>
                <Typography variant="body2" fontFamily="monospace">
                  P(AB) = P(A) × P(B|A) = {pA.toFixed(2)} × {pBGivenA.toFixed(2)} = {(pA * pBGivenA).toFixed(4)}
                </Typography>
                <Typography variant="body2" fontFamily="monospace">
                  P(AB̅) = P(A) × (1 - P(B|A)) = {pA.toFixed(2)} × { (1 - pBGivenA).toFixed(2)} = {(pA * (1 - pBGivenA)).toFixed(4)}
                </Typography>
                <Typography variant="body2" fontFamily="monospace">
                  P(A̅B) = P(A̅) × P(B|A̅) = {(1 - pA).toFixed(2)} × {(1 - pBGivenA).toFixed(2)} = {((1 - pA) * (1 - pBGivenA)).toFixed(4)}
                </Typography>
                <Typography variant="body2" fontFamily="monospace">
                  P(A̅B̅) = P(A̅) × (1 - P(B|A̅)) = {(1 - pA).toFixed(2)} × {pBGivenA.toFixed(2)} = {((1 - pA) * pBGivenA).toFixed(4)}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        )}
      </CardContent>
    </Card>
  );
};

export default Task3;
