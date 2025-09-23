import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
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
  Zoom,
  CircularProgress
} from '@mui/material';
import { Add, Delete, Casino, EmojiEvents } from '@mui/icons-material';
import { spinWheel } from '../../utils/generators';
import { processDonation, calculateGameProbabilities, getTotalDonations, formatCurrency } from '../../utils/wheelUtils';
import type { Donation, WheelResult, GameWithTotal } from '../../types';

const calculateCumulativeAngle = (games: GameWithTotal[], index: number, totalAmount: number): number => {
  let cumulativeAngle = 0;
  for (let i = 0; i < index; i++) {
    cumulativeAngle += (games[i].totalAmount / totalAmount) * 360;
  }
  return cumulativeAngle;
};

const generateWheelGradient = (games: GameWithTotal[], totalAmount: number): string => {
  if (games.length === 0 || totalAmount === 0) return 'linear-gradient(#eee, #ccc)';

  const colors = [
    '#FF5252', '#448AFF', '#69F0AE', '#FFEB3B',
    '#FF9800', '#9C27B0', '#3F51B5', '#009688',
    '#4CAF50', '#FFC107', '#F44336', '#2196F3',
    '#E91E63', '#00BCD4', '#8BC34A', '#CDDC39'
  ];

  let cumulativeAngle = 0;
  const gradients: string[] = [];

  games.forEach((game, index) => {
    const sectorAngle = (game.totalAmount / totalAmount) * 360;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + sectorAngle;

    gradients.push(
      `${colors[index % colors.length]} ${startAngle}deg ${endAngle}deg`
    );

    cumulativeAngle = endAngle;
  });

  return `conic-gradient(from 0deg, ${gradients.join(', ')})`;
};

const Task5: React.FC = () => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [newGame, setNewGame] = useState<string>('');
  const [newAmount, setNewAmount] = useState<number>(100);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [spinResult, setSpinResult] = useState<WheelResult | null>(null);
  const [showResult, setShowResult] = useState<boolean>(false);
  const wheelRef = useRef<HTMLDivElement>(null);

  const gameProbabilities = useMemo(() => {
    return calculateGameProbabilities(donations);
  }, [donations]);

  const totalDonations = useMemo(() => {
    return getTotalDonations(donations);
  }, [donations]);

  useEffect(() => {
    resetWheel();
  }, [donations]);

  const handleAddDonation = () => {
    if (newGame.trim() && newAmount > 0) {
      const updatedDonations = processDonation(donations, newGame.trim(), newAmount);
      setDonations(updatedDonations);
      setNewGame('');
      setNewAmount(100);
    }
  };

  const handleRemoveDonation = (index: number) => {
    const updatedDonations = [...donations];
    updatedDonations.splice(index, 1);
    setDonations(updatedDonations);
    setSpinResult(null);
    setShowResult(false);
  };

  const handleSpinWheel = () => {
    if (gameProbabilities.length === 0) return;

    setIsSpinning(true);
    setShowResult(false);

    resetWheel();

    setTimeout(() => {
      if (wheelRef.current) {
        const resultIndex = spinWheel(gameProbabilities);
        const resultGame = gameProbabilities[resultIndex];

        const startAngle = calculateCumulativeAngle(gameProbabilities, resultIndex, totalDonations);

        const sectorAngle = (resultGame.totalAmount / totalDonations) * 360;

        const randomOffsetWithinSector = Math.random() * 0.6 + 0.2; // От 20% до 80% сектора
        const targetAngle = startAngle + (sectorAngle * randomOffsetWithinSector);

        const adjustedAngle = 360 - targetAngle;

        const fullRotations = 5; // Фиксированное количество оборотов для предсказуемости
        const totalRotation = (fullRotations * 360) + adjustedAngle;

        wheelRef.current.style.transition = 'transform 4s cubic-bezier(0.17, 0.67, 0.83, 1)';
        wheelRef.current.style.transform = `rotate(${totalRotation}deg)`;

        setTimeout(() => {
          const result: WheelResult = {
            game: resultGame.game,
            amount: resultGame.totalAmount,
            spinTime: 4000
          };
          setSpinResult(result);
          setShowResult(true);
          setIsSpinning(false);
        }, 4000);
      }
    }, 10);
  };

  const resetWheel = () => {
    if (wheelRef.current) {
      wheelRef.current.style.transition = 'none';
      wheelRef.current.style.transform = 'rotate(0deg)';

      wheelRef.current.getBoundingClientRect();
    }
  };

  const handleClearAll = () => {
    setDonations([]);
    setSpinResult(null);
    setShowResult(false);
    resetWheel();
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Задание 5: Колесо фортуны для стримера
        </Typography>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Добавить пожертвование:
              </Typography>

              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Название игры"
                    value={newGame}
                    onChange={(e) => setNewGame(e.target.value)}
                    placeholder="Например: The Witcher 3"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    label="Сумма (руб)"
                    type="number"
                    value={newAmount}
                    onChange={(e) => setNewAmount(Math.max(1, parseInt(e.target.value) || 0))}
                    inputProps={{ min: 1 }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleAddDonation}
                    disabled={!newGame.trim() || newAmount <= 0}
                    startIcon={<Add />}
                  >
                    Добавить
                  </Button>
                </Grid>
              </Grid>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Alert severity="info">
                <Typography variant="h6">Общая статистика:</Typography>
                <Typography>Всего пожертвований: {donations.length}</Typography>
                <Typography>Общая сумма: {formatCurrency(totalDonations)}</Typography>
                <Typography>Количество игр: {gameProbabilities.length}</Typography>
              </Alert>
            </Box>

            {gameProbabilities.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Вероятности выпадения игр:
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Игра</TableCell>
                        <TableCell>Сумма пожертвований</TableCell>
                        <TableCell>Доля от общей суммы</TableCell>
                        <TableCell>Вероятность выпадения</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {gameProbabilities.map((game, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Chip label={game.game} variant="outlined" />
                          </TableCell>
                          <TableCell>{formatCurrency(game.totalAmount)}</TableCell>
                          <TableCell>
                            {((game.totalAmount / totalDonations) * 100).toFixed(2)}%
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Box
                                sx={{
                                  width: 100,
                                  height: 8,
                                  backgroundColor: '#e0e0e0',
                                  mr: 1
                                }}
                              >
                                <Box
                                  sx={{
                                    width: `${(game.totalAmount / totalDonations) * 100}%`,
                                    height: '100%',
                                    backgroundColor: 'primary.main',
                                  }}
                                />
                              </Box>
                              {((game.totalAmount / totalDonations) * 100).toFixed(1)}%
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {donations.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  История пожертвований:
                </Typography>
                <TableContainer component={Paper} sx={{ maxHeight: 200 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Игра</TableCell>
                        <TableCell>Сумма</TableCell>
                        <TableCell>Время</TableCell>
                        <TableCell width={50}></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {donations.map((donation, index) => (
                        <TableRow key={index}>
                          <TableCell>{donation.game}</TableCell>
                          <TableCell>{formatCurrency(donation.amount)}</TableCell>
                          <TableCell>
                            {donation.timestamp.toLocaleTimeString()}
                          </TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveDonation(index)}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box
                sx={{
                  position: 'relative',
                  width: 300,
                  height: 50,
                  mb: 1
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 0,
                    height: 0,
                    borderLeft: '15px solid transparent',
                    borderRight: '15px solid transparent',
                    borderTop: '25px solid #ff5252',
                    zIndex: 2
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: 10,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 4,
                    height: 40,
                    backgroundColor: '#ff5252',
                    zIndex: 1
                  }}
                />
              </Box>

              <Box
                sx={{
                  position: 'relative',
                  width: 300,
                  height: 300,
                  mb: 3
                }}
              >
                <Box
                  ref={wheelRef}
                  sx={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    border: '4px solid #1976d2',
                    position: 'relative',
                    overflow: 'hidden',
                    transform: 'rotate(0deg)',
                    background: gameProbabilities.length > 0 ?
                      generateWheelGradient(gameProbabilities, totalDonations)
                      : 'linear-gradient(#eee, #ccc)'
                  }}
                >

                  {gameProbabilities.map((game, index) => {
                    const startAngle = calculateCumulativeAngle(gameProbabilities, index, totalDonations);
                    const sectorAngle = (game.totalAmount / totalDonations) * 360;
                    const middleAngle = startAngle + (sectorAngle / 2);

                    const radian = ((middleAngle - 90) * Math.PI) / 180;
                    const distance = 120;
                    const x = Math.cos(radian) * distance + 150;
                    const y = Math.sin(radian) * distance + 150;

                    let textRotation = middleAngle;
                    if (middleAngle > 90 && middleAngle < 270) {
                      textRotation += 180;
                    }

                    return (
                      <Typography
                        key={`text-${index}`}
                        sx={{
                          position: 'absolute',
                          left: x,
                          top: y,
                          transform: `translate(-50%, -50%) rotate(${textRotation}deg)`,
                          fontSize: '10px',
                          fontWeight: 'bold',
                          color: 'white',
                          textShadow: '0px 0px 2px black, 0px 0px 1px black',
                          whiteSpace: 'nowrap',
                          maxWidth: '100px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          zIndex: 2
                        }}
                      >
                        {game.game.length > 12 ? game.game.slice(0, 12) + '...' : game.game}
                      </Typography>
                    );
                  })}

                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '15%',
                      height: '15%',
                      borderRadius: '50%',
                      backgroundColor: 'white',
                      border: '3px solid #1976d2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 3
                    }}
                  >
                    {isSpinning ? (
                      <CircularProgress size={20} />
                    ) : (
                      <Casino sx={{ fontSize: 20, color: '#1976d2' }} />
                    )}
                  </Box>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleSpinWheel}
                  disabled={isSpinning || gameProbabilities.length === 0}
                  startIcon={<Casino />}
                >
                  Крутить колесо!
                </Button>

                <Button
                  variant="outlined"
                  onClick={handleClearAll}
                  color="error"
                >
                  Очистить все
                </Button>
              </Box>

              {showResult && spinResult && (
                <Zoom in={showResult}>
                  <Alert
                    severity="success"
                    icon={<EmojiEvents />}
                    sx={{ width: '100%', mb: 2 }}
                  >
                    <Typography variant="h6">Победитель!</Typography>
                    <Typography>Игра: {spinResult.game}</Typography>
                    <Typography>Сумма пожертвований: {formatCurrency(spinResult.amount)}</Typography>
                    <Typography>Вероятность: {((spinResult.amount / totalDonations) * 100).toFixed(1)}%</Typography>
                  </Alert>
                </Zoom>
              )}
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default Task5;
