import type { GameWithTotal } from "../types";

export const generateSingleEvent = (probability: number): boolean => {
  return Math.random() < probability;
};


export const generateMultipleSamples = (
  generator: () => boolean | boolean[],
  count: number = 1000000
): (boolean | boolean[])[] => {
  const results = [];
  for (let i = 0; i < count; i++) {
    results.push(generator());
  }
  return results;
};

export const generateMultipleEvents = (probabilities: number[]): boolean[] => {
  return probabilities.map(prob => Math.random() < prob);
};

export const generateMultipleEventCombinations = (probabilities: number[]): number => {
  const events = generateMultipleEvents(probabilities);

  let combinationIndex = 0;
  for (let i = 0; i < events.length; i++) {
    if (events[i]) {
      combinationIndex += Math.pow(2, i);
    }
  }

  return combinationIndex;
};

export const generateMultipleCombinationSamples = (
  probabilities: number[],
  count: number = 1000000
): number[] => {
  const results = [];
  for (let i = 0; i < count; i++) {
    results.push(generateMultipleEventCombinations(probabilities));
  }
  return results;
};

export const generateConditionalEvents = (pA: number, pBGivenA: number): number => {
  const random = Math.random();

  const pNotA = 1 - pA;
  const pBGivenNotA = 1 - pBGivenA;

  const pAB = pA * pBGivenA;
  const pANotB = pA * (1 - pBGivenA);
  const pNotAB = pNotA * pBGivenNotA;

  if (random < pAB) return 0;  // AB
  if (random < pAB + pANotB) return 1; // AнеB
  if (random < pAB + pANotB + pNotAB) return 2; // неAB
  return 3;  // неAнеB
};

export const generateConditionalSamples = (
  pA: number,
  pBGivenA: number,
  count: number = 1000000
): number[] => {
  const results = [];
  for (let i = 0; i < count; i++) {
    results.push(generateConditionalEvents(pA, pBGivenA));
  }
  return results;
};

export const generateCompleteGroupEvents = (probabilities: number[]): number => {
  if (probabilities.length === 0) return -1;

  const sum = probabilities.reduce((acc, prob) => acc + prob, 0);
  if (Math.abs(sum - 1) > 0.0001) {
    throw new Error('Вероятности не образуют полную группу (сумма ≠ 1)');
  }

  const random = Math.random();
  let cumulativeProbability = 0;

  for (let i = 0; i < probabilities.length; i++) {
    cumulativeProbability += probabilities[i];
    if (random < cumulativeProbability) {
      return i;
    }
  }

  return probabilities.length - 1;
};

export const generateCompleteGroupSamples = (
  probabilities: number[],
  count: number = 1000000
): number[] => {
  const results = [];
  for (let i = 0; i < count; i++) {
    results.push(generateCompleteGroupEvents(probabilities));
  }
  return results;
};


export const spinWheel = (games: GameWithTotal[]): number => {
  if (games.length === 0) return -1;

  const totalAmount = games.reduce((sum, game) => sum + game.totalAmount, 0);
  if (totalAmount === 0) return -1;

  const random = Math.random();
  let cumulativeProbability = 0;

  for (let i = 0; i < games.length; i++) {
    cumulativeProbability += games[i].totalAmount / totalAmount;
    if (random < cumulativeProbability) {
      return i;
    }
  }

  return games.length - 1;
};
