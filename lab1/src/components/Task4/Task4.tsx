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
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Add, Remove, Warning } from '@mui/icons-material';
import { generateCompleteGroupSamples } from '../../utils/generators';
import { calculateCompleteGroupFrequencies, validateCompleteGroup } from '../../utils/statistics';

const Task4: React.FC = () => {
  const [probabilities, setProbabilities] = useState<number[]>([0.2, 0.3, 0.5]);
  const [results, setResults] = useState<number[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [validationDialog, setValidationDialog] = useState(false);

  const validationResult = useMemo(() => {
    return validateCompleteGroup(probabilities);
  }, [probabilities]);

  const handleAddEvent = () => {
    const newProbability = 1 / (probabilities.length + 1);

    const total = probabilities.reduce((sum, prob) => sum + prob, 0);
    const normalizedProbabilities = probabilities.map(prob => prob * (1 - newProbability) / total);

    setProbabilities([...normalizedProbabilities, newProbability]);
  };

  const handleRemoveEvent = (index: number) => {
    if (probabilities.length > 1) {
      const newProbs = [...probabilities];
      newProbs.splice(index, 1);

      const total = newProbs.reduce((sum, prob) => sum + prob, 0);
      const normalizedProbs = newProbs.map(prob => prob / total);

      setProbabilities(normalizedProbs);
    }
  };

  const handleProbabilityChange = (index: number, value: number) => {
    const newProbs = [...probabilities];
    newProbs[index] = Math.max(0, Math.min(1, value));
    setProbabilities(newProbs);
  };

  const normalizeProbabilities = () => {
    const total = probabilities.reduce((sum, prob) => sum + prob, 0);
    if (total > 0) {
      const normalizedProbs = probabilities.map(prob => prob / total);
      setProbabilities(normalizedProbs);
    }
  };

  const handleGenerate = () => {
    if (!validationResult.isValid) {
      setValidationDialog(true);
      return;
    }

    setIsCalculating(true);

    setTimeout(() => {
      try {
        const generatedResults = generateCompleteGroupSamples(probabilities, 1000000);
        setResults(generatedResults);
      } catch (error) {
        console.error('Ошибка генерации:', error);
      } finally {
        setIsCalculating(false);
      }
    }, 100);
  };

  const actualFrequencies = useMemo(() => {
    if (results.length === 0) return probabilities.map(() => 0);
    return calculateCompleteGroupFrequencies(results, probabilities.length);
  }, [results, probabilities]);

  const totalActualFrequency = actualFrequencies.reduce((sum, freq) => sum + freq, 0);

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Задание 4: Полная группа событий
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Вероятности событий (сумма должна быть равна 1):
          </Typography>

          <Grid container spacing={2} alignItems="center">
            {probabilities.map((prob, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 4}} key={index}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TextField
                    label={`Событие ${index} (P${index})`}
                    type="number"
                    value={prob.toFixed(4)}
                    onChange={(e) => handleProbabilityChange(index, parseFloat(e.target.value))}
                    inputProps={{ min: 0, max: 1, step: 0.01 }}
                    sx={{ flexGrow: 1 }}
                    error={!validationResult.isValid}
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

            <Grid size={{ xs: 12}}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  startIcon={<Add />}
                  onClick={handleAddEvent}
                  variant="outlined"
                >
                  Добавить событие
                </Button>

                <Button
                  onClick={normalizeProbabilities}
                  variant="outlined"
                  color="secondary"
                >
                  Нормализовать сумму к 1
                </Button>

                {!validationResult.isValid && (
                  <Chip
                    icon={<Warning />}
                    label={`Сумма: ${validationResult.sum.toFixed(4)}`}
                    color="error"
                    variant="outlined"
                  />
                )}

                {validationResult.isValid && (
                  <Chip
                    label={`Сумма: ${validationResult.sum.toFixed(4)} ✓`}
                    color="success"
                    variant="outlined"
                  />
                )}
              </Box>
            </Grid>
          </Grid>

          <Button
            variant="contained"
            onClick={handleGenerate}
            disabled={isCalculating}
            sx={{ mt: 2 }}
            color={validationResult.isValid ? 'primary' : 'warning'}
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
            <Grid size={{ xs: 12}}>
              <Alert severity="info">
                <Typography variant="h6">Результаты:</Typography>
                <Typography>Количество испытаний: {results.length.toLocaleString()}</Typography>
                <Typography>Количество событий: {probabilities.length}</Typography>
                <Typography>Сумма фактических частот: {(totalActualFrequency * 100).toFixed(4)}%</Typography>
              </Alert>
            </Grid>

            <Grid size={{ xs: 12}}>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Событие</TableCell>
                      <TableCell>Индикатор</TableCell>
                      <TableCell>Теоретическая вероятность</TableCell>
                      <TableCell>Фактическая частота</TableCell>
                      <TableCell>Ошибка</TableCell>
                      <TableCell>Количество</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {probabilities.map((probability, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Chip
                            label={`Событие ${index}`}
                            color="primary"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>{index}</TableCell>
                        <TableCell>{(probability * 100).toFixed(4)}%</TableCell>
                        <TableCell>{(actualFrequencies[index] * 100).toFixed(4)}%</TableCell>
                        <TableCell>
                          {(Math.abs(actualFrequencies[index] - probability) * 100).toFixed(4)}%
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

            <Grid size={{ xs: 12}}>
              <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Распределение первых 50 результатов:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {results.slice(0, 50).map((result, index) => (
                    <Chip
                      key={index}
                      label={result}
                      size="small"
                      variant="outlined"
                      color={
                        result % 4 === 0 ? 'success' :
                        result % 4 === 1 ? 'warning' :
                        result % 4 === 2 ? 'info' : 'secondary'
                      }
                    />
                  ))}
                </Box>
              </Box>
            </Grid>

            <Grid size={{ xs: 12}}>
              <Box sx={{ p: 2, border: 1, borderColor: 'primary.main', borderRadius: 1 }}>
                <Typography variant="h6" gutterBottom color="primary">
                  Статистическая информация:
                </Typography>
                <Typography variant="body2">
                  Средняя ошибка: {(
                    probabilities.reduce((sum, prob, index) =>
                      sum + Math.abs(actualFrequencies[index] - prob), 0
                    ) / probabilities.length * 100
                  ).toFixed(4)}%
                </Typography>
                <Typography variant="body2">
                  Максимальная ошибка: {(
                    Math.max(...probabilities.map((prob, index) =>
                      Math.abs(actualFrequencies[index] - prob)
                    )) * 100
                  ).toFixed(4)}%
                </Typography>
              </Box>
            </Grid>
          </Grid>
        )}

        <Dialog open={validationDialog} onClose={() => setValidationDialog(false)}>
          <DialogTitle>Ошибка валидации</DialogTitle>
          <DialogContent>
            <Typography>
              Вероятности не образуют полную группу. Сумма вероятностей должна быть равна 1.
            </Typography>
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              Текущая сумма: {validationResult.sum.toFixed(4)}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setValidationDialog(false)}>Отмена</Button>
            <Button onClick={() => { normalizeProbabilities(); setValidationDialog(false); }} color="primary">
              Нормализовать
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default Task4;
