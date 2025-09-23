export interface Donation {
  game: string;
  amount: number;
  timestamp: Date;
}

export interface GameWithTotal {
  game: string;
  totalAmount: number;
  probability: number;
}

export interface WheelResult {
  game: string;
  amount: number;
  spinTime: number;
}
