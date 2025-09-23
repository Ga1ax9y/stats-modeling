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
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { Add, Remove } from '@mui/icons-material';
import { generateMultipleCombinationSamples } from '../../utils/generators';
import {
  calculateCombinationFrequencies,
  calculateTheoreticalCombinationProbabilities,
  getCombinationLabel,
  getCombinationShortLabel
} from '../../utils/statistics';

const Task2: React.FC = () => {
  const [probabilities, setProbabilities] = useState<number[]>([0.3, 0.5, 0.7]);
  const [results, setResults] = useState<number[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleAddEvent = () => {
    setProbabilities([...probabilities, 0.5]);
  };

  const handleRemoveEvent = (index: number) => {
    if (probabilities.length > 1) {
      const newProbs = [...probabilities];
      newProbs.splice(index, 1);
      setProbabilities(newProbs);
    }
  };

  const handleProbabilityChange = (index: number, value: number) => {
    const newProbs = [...probabilities];
    newProbs[index] = Math.max(0, Math.min(1, value));
    setProbabilities(newProbs);
  };

  const handleGenerate = () => {
    setIsCalculating(true);

    setTimeout(() => {
      const generatedResults = generateMultipleCombinationSamples(probabilities, 100000);
      setResults(generatedResults);
      setIsCalculating(false);
    }, 100);
  };

  const combinationFrequencies = useMemo(() => {
    if (results.length === 0) return [];
    return calculateCombinationFrequencies(results, probabilities.length);
  }, [results, probabilities.length]);

  const theoreticalProbabilities = useMemo(() => {
    return calculateTheoreticalCombinationProbabilities(probabilities);
  }, [probabilities]);

  const totalCombinations = Math.pow(2, probabilities.length);

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Задание 2: Комбинации независимых событий
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Вероятности событий:
          </Typography>

          <Grid container spacing={2} alignItems="center">
            {probabilities.map((prob, index) => (
              <Grid key={index} size={{xs: 12, sm: 6, md: 4}}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TextField
                    label={`Событие A${index + 1}`}
                    type="number"
                    value={prob}
                    onChange={(e) => handleProbabilityChange(index, parseFloat(e.target.value))}
                    inputProps={{ min: 0, max: 1, step: 0.01 }}
                    sx={{ flexGrow: 1 }}
                  />
                  <IconButton
                    onClick={() => handleRemoveEvent(index)}
                    disabled={probabilities.length <= 1}
                    size="small"
                  >
                    <Remove />
                  </IconButton>
                </Box>
              </Grid>
            ))}

            <Grid  size={{xs: 12}}>
              <Button
                startIcon={<Add />}
                onClick={handleAddEvent}
                variant="outlined"
              >
                Добавить событие
              </Button>
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
              Генерация комбинаций...
            </Typography>
          </Box>
        )}

        {results.length > 0 && !isCalculating && (
          <Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="h6">Результаты:</Typography>
              <Typography>Количество испытаний: {results.length.toLocaleString()}</Typography>
              <Typography>Количество событий: {probabilities.length}</Typography>
              <Typography>Количество комбинаций: {totalCombinations}</Typography>
            </Alert>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Комбинация</TableCell>
                    <TableCell>Битовое представление</TableCell>
                    <TableCell>Теоретическая вероятность</TableCell>
                    <TableCell>Фактическая частота</TableCell>
                    <TableCell>Ошибка</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {theoreticalProbabilities.map((theoreticalProb, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Typography variant="body2">
                          {getCombinationLabel(index, probabilities.length)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getCombinationShortLabel(index, probabilities.length)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {(theoreticalProb * 100).toFixed(4)}%
                      </TableCell>
                      <TableCell>
                        {combinationFrequencies[index]
                          ? (combinationFrequencies[index] * 100).toFixed(4) + '%'
                          : '0.0000%'
                        }
                      </TableCell>
                      <TableCell>
                        {combinationFrequencies[index]
                          ? (Math.abs(combinationFrequencies[index] - theoreticalProb) * 100).toFixed(4) + '%'
                          : '—'
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Примеры сгенерированных комбинаций:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {results.slice(0, 10).map((combination, index) => (
                  <Chip
                    key={index}
                    label={`${getCombinationShortLabel(combination, probabilities.length)}`}
                    variant="outlined"
                    size="small"
                  />
                ))}
                {results.length > 10 && <Typography variant="body2">...</Typography>}
              </Box>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default Task2;
