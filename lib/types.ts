export interface Price {
    id: string;
    ticker: string;
    price: number;
    size: number;
    orderType: "Buy" | "Sell";
    time: string;
    percentageChange: string;
  }