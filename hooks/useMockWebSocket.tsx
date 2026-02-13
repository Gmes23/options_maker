'use client'

import { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react';

import { Price } from '@/lib/types';
import { START_PRICE, TICKER } from '@/lib/constants';

/* 
  Quick Mock websocket to get trade book prices
  simulating trades that been done
*/

export function useMockWebSocket() {
    const [prices, setPrices] = useState<Map<string, Price>>(new Map());
    const tickIdRef = useRef<number>(0);
  
    // helper
    const changeInPrice = useCallback(((prevPrice: number, currPrice: number, sign: number) => {
      const priceChange = ((currPrice - prevPrice) / prevPrice) * 100;
      const percentageChange = `${sign === 1 ? '+' : ''}` + priceChange.toFixed(2);
      return percentageChange + "%";
    }), [])
  
  
  
    useEffect(() => {
      const intervalId = setInterval(() => {
        const ticker = TICKER;
        const priceChange = Math.random() * 1000;
        const gainOrLoss = Math.random() < .5 ? -1 : 1;
        const orderType: "Buy" | "Sell" = gainOrLoss === 1 ? "Buy" : "Sell";
  
  
        setPrices(prevMap => {
          const pricesArray = Array.from(prevMap.values());
          const startPrice = pricesArray.length > 0 ? pricesArray[pricesArray.length - 1].price : START_PRICE;
          console.log(pricesArray);
  
          const rawPrice = startPrice + (gainOrLoss * priceChange);
          const price = parseFloat(rawPrice.toFixed(2));
  
          const percentageChange = pricesArray.length > 0 ? changeInPrice(startPrice, rawPrice, gainOrLoss) : "0%";
  
          const size = Math.trunc(Math.random() * 100000);
          const now = Date.now();
          const time = new Date(now).toLocaleString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })
  
          const payload: Price = {
            id: `tick-${tickIdRef.current++}`,
            ticker,
            price,
            size,
            orderType,
            time,
            percentageChange
          }
  
          const nextMap = new Map(prevMap);
          nextMap.set(payload.id, payload);
  
          if (nextMap.size > 30) {
            const firstKey = nextMap.keys().next().value!;
            nextMap.delete(firstKey);
          }
  
          return nextMap;
        });
      }, 1000)
      return () => {
        clearInterval(intervalId);
      }
    }, [])
  
    const pricesArray = useMemo(() => {
      return Array.from(prices.values()).reverse();
    }, [prices]);
  
    return { prices: pricesArray };
  }