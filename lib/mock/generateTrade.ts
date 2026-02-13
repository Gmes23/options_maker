// lib/mock/generateTrade.ts
import { Price } from "@/lib/types";
import { TICKER } from "@/lib/constants";

export function getNextPrice(prevPrice: number): { price: number; gainOrLoss: number } {
  const priceChange = Math.random() * 1000;
  const gainOrLoss = Math.random() < 0.5 ? -1 : 1;
  const rawPrice = prevPrice + gainOrLoss * priceChange;
  const price = parseFloat(rawPrice.toFixed(2));
  return { price, gainOrLoss };
}

export function getPercentageChange(prevPrice: number, currPrice: number, sign: number): string {
  const priceChange = ((currPrice - prevPrice) / prevPrice) * 100;
  return `${sign === 1 ? "+" : ""}${priceChange.toFixed(2)}%`;
}

export function getOrderType(gainOrLoss: number): "Buy" | "Sell" {
  return gainOrLoss === 1 ? "Buy" : "Sell";
}

export function getTime(): string {
  return new Date(Date.now()).toLocaleString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function generateTrade(prevPrice: number, id: string): Price {
  const { price, gainOrLoss } = getNextPrice(prevPrice);
  return {
    id,
    ticker: TICKER,
    price,
    size: Math.trunc(Math.random() * 100000),
    orderType: getOrderType(gainOrLoss),
    time: getTime(),
    percentageChange: getPercentageChange(prevPrice, price, gainOrLoss),
  };
}