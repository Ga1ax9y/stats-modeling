export const calculateFrequencies = (results: boolean[]): number => {
  const trueCount = results.filter(result => result === true).length;
  return trueCount / results.length;
};

export const calculateMultipleFrequencies = (results: boolean[][]): number[] => {
  if (results.length === 0) return [];

  const eventCount = results[0].length;
  const frequencies: number[] = new Array(eventCount).fill(0);

  results.forEach(eventResults => {
    eventResults.forEach((result, index) => {
      if (result) frequencies[index]++;
    });
  });

  return frequencies.map(count => count / results.length);
};

export const calculateCombinationFrequencies = (results: number[], eventCount: number): number[] => {
  const totalCombinations = Math.pow(2, eventCount);
  const frequencies = new Array(totalCombinations).fill(0);

  results.forEach(combinationIndex => {
    if (combinationIndex >= 0 && combinationIndex < totalCombinations) {
      frequencies[combinationIndex]++;
    }
  });

  return frequencies.map(count => count / results.length);
};

export const calculateTheoreticalCombinationProbabilities = (probabilities: number[]): number[] => {
  const eventCount = probabilities.length;
  const totalCombinations = Math.pow(2, eventCount);
  const theoreticalProbs = new Array(totalCombinations).fill(0);

  for (let i = 0; i < totalCombinations; i++) {
    let combinationProb = 1;

    for (let j = 0; j < eventCount; j++) {
      const eventOccurred = !!(i & (1 << j));

      if (eventOccurred) {
        combinationProb *= probabilities[j];
      } else {
        combinationProb *= (1 - probabilities[j]);
      }
    }

    theoreticalProbs[i] = combinationProb;
  }

  return theoreticalProbs;
};

export const getCombinationLabel = (combinationIndex: number, eventCount: number): string => {
  const events = [];
  for (let i = 0; i < eventCount; i++) {
    const occurred = !!(combinationIndex & (1 << i));
    events.push(occurred ? `A${i + 1}` : `неA${i + 1}`);
  }
  return events.join(', ');
};

export const getCombinationShortLabel = (combinationIndex: number, eventCount: number): string => {
  const bits = [];
  for (let i = eventCount - 1; i >= 0; i--) {
    bits.push(combinationIndex & (1 << i) ? '1' : '0');
  }
  return bits.join('');
};

export const calculateConditionalFrequencies = (results: number[]): number[] => {
  const frequencies = [0, 0, 0, 0]; // AB, AнеB, неAB, неAнеB

  results.forEach(result => {
    if (result >= 0 && result <= 3) {
      frequencies[result]++;
    }
  });

  return frequencies.map(count => count / results.length);
};

export const calculateTheoreticalProbabilities = (pA: number, pBGivenA: number): number[] => {
  const pNotA = 1 - pA;
  const pBGivenNotA = 1 - pBGivenA;

  return [
    pA * pBGivenA,
    pA * (1 - pBGivenA),
    pNotA * pBGivenNotA,
    pNotA * (1 - pBGivenNotA)
  ];
};

export const calculateCompleteGroupFrequencies = (results: number[], eventCount: number): number[] => {
  const frequencies = new Array(eventCount).fill(0);

  results.forEach(result => {
    if (result >= 0 && result < eventCount) {
      frequencies[result]++;
    }
  });

  return frequencies.map(count => count / results.length);
};

export const validateCompleteGroup = (probabilities: number[]): { isValid: boolean; sum: number; error: string } => {
  const sum = probabilities.reduce((acc, prob) => acc + prob, 0);
  const isValid = Math.abs(sum - 1) < 0.0001;

  return {
    isValid,
    sum,
    error: isValid ? '' : `Сумма вероятностей (${sum.toFixed(4)}) не равна 1`
  };
};
