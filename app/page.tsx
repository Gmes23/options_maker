'use client';

import { useState, useCallback, useEffect, useRef, useMemo, memo } from 'react';


interface Price {
  id: string;
  ticker: string;
  price: number;
  size: number;
  orderType: "Buy" | "Sell";
  time: string;
  percentageChange: string;
}

// Websocket Constants
const START_PRICE = 40000;
const TICKER = "BTC";

function useMockWebSocket() {
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


const OrderRow = memo(function OrderRow({ order, options }: { order: Price; options: boolean }) {

  const orderColor = order.orderType === "Buy" ? "bg-[#0c4332]" : "bg-[#381019]";

  const getDisplayDetails = (size: number, options: boolean) => {
    if (!options) return { height: "", icon: "" };

    if (size >= 50000) return { height: "h-[75px]", icon: "🐋" };
    if (size >= 30000) return { height: "h-[60px]", icon: "🦈" };
    if (size >= 10000) return { height: "h-[45px]", icon: "🐠" };
    return { height: "h-[22px]", icon: "🦐" };
  }

  const { height, icon } = getDisplayDetails(order.size, options);

  return (
    <div
      className={`p-1 flex text-white 
                    my-1
                    ${height}
                    ${orderColor}`}
    >
      <div className="w-10 flex flex-1 gap-3">
        <div>{icon}</div>
        <div>{order.ticker}</div>
      </div>
     
      <div className="w-11 flex-1 text-right">
        {order.price.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}
      </div>
      <div className="w-11 flex-1 text-right">
        {order.percentageChange}
      </div>
      <div className="w-10 flex-1 text-right">
        {order.size.toLocaleString()}
      </div>
      <div className="w-10 flex-1 text-right">
        {order.time}
      </div>
    </div>
  )
})

const OrderRows = memo(function OrderRows({ orders }: { orders: Price[] }) {

  return (
    <div>
      {orders.map((order) => (<OrderRow key={order.id} order={order} options={false} />))}
    </div>
  )
})

export default function Home() {
  const { prices } = useMockWebSocket();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 flex items-center justify-center">
      <div className="flex flex-col
      h-[600px] w-[380px]
      bg-stone-900 rounded-xl
      overflow-hidden
      ">

        {/* header */}
        <div className={`p-5 min-w-full text-white flex justify-between border-b border-white/9`}>
          <div className="text-md">Trades</div>
          <div className="flex items-center gap-2">
            <div className="w-[5px] h-[5px] bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm">Live</span>
          </div>
        </div>

        {/*   Main Orders    */}

        {/* order labels */}
        <div className="pr-3 pl-3 pt-2 pb-4 overflow-hidden text-sm">
          <div className="flex text-white items-center justify-between pb-2 border-b border-white/9">
            <div className="flex-1">Ticker</div>
            <div className="flex-1 text-right">Price</div>
            <div className="flex-1 text-right">Change</div>
            <div className="flex-1 text-right pr-1">Size</div>
            <div className="flex-1 text-right pr-1">Time</div>
          </div>

          <div className="overflow-y-auto 
          
          h-[500px]
          [scrollbar-width:none]
          ">
            {prices.length === 0 ? <div className="text-white text-center p-10"> Loading...</div>
              : <OrderRows orders={prices} />
            }
          </div>
        </div>
      </div>
    </div>
  );
}
