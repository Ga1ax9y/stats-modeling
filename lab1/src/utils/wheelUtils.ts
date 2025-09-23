import type { Donation, GameWithTotal } from "../types";

export const processDonation = (
  donations: Donation[],
  game: string,
  amount: number
): Donation[] => {
  const newDonation: Donation = {
    game,
    amount,
    timestamp: new Date()
  };

  return [...donations, newDonation];
};

export const calculateGameProbabilities = (donations: Donation[]): GameWithTotal[] => {
  const gameTotals: { [key: string]: number } = {};

  donations.forEach(donation => {
    if (!gameTotals[donation.game]) {
      gameTotals[donation.game] = 0;
    }
    gameTotals[donation.game] += donation.amount;
  });


  return Object.entries(gameTotals)
    .map(([game, totalAmount]) => ({
      game,
      totalAmount,
      probability: totalAmount / totalAmount
    }))
    .sort((a, b) => b.totalAmount - a.totalAmount);
};

export const getTotalDonations = (donations: Donation[]): number => {
  return donations.reduce((sum, donation) => sum + donation.amount, 0);
};

export const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  });
};

export const generateWheelGradient = (games: GameWithTotal[], totalAmount: number): string => {
  if (games.length === 0 || totalAmount === 0) return 'linear-gradient(#eee, #ccc)';

  let cumulativeAngle = 0;
  const gradients: string[] = [];

  const colors = [
    '#FF5252', '#FF4081', '#E040FB', '#7C4DFF',
    '#536DFE', '#448AFF', '#40C4FF', '#18FFFF',
    '#64FFDA', '#69F0AE', '#B2FF59', '#EEFF41',
    '#FFFF00', '#FFD740', '#FFAB40', '#FF6E40'
  ];

  games.forEach((game, index) => {
    const sectorAngle = (game.totalAmount / totalAmount) * 360;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + sectorAngle;

    const colorIndex = index % colors.length;

    gradients.push(
      `${colors[colorIndex]} ${startAngle}deg ${endAngle}deg`
    );

    cumulativeAngle = endAngle;
  });

  return `conic-gradient(from 0deg, ${gradients.join(', ')})`;
};

export const calculateCumulativeAngle = (games: GameWithTotal[], index: number, totalAmount: number): number => {
  let cumulativeAngle = 0;
  for (let i = 0; i < index; i++) {
    cumulativeAngle += (games[i].totalAmount / totalAmount) * 360;
  }
  return cumulativeAngle;
};

export const calculateSectorAngle = (games: GameWithTotal[], resultIndex: number, totalAmount: number): number => {
  let cumulativeAngle = 0;
  for (let i = 0; i < resultIndex; i++) {
    cumulativeAngle += (games[i].totalAmount / totalAmount) * 360;
  }

  const sectorAngle = (games[resultIndex].totalAmount / totalAmount) * 360;
  return cumulativeAngle + (sectorAngle / 2);
};
