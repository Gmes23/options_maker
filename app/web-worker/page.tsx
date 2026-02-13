'use client';

import { useMockWebSocket } from '@/hooks/useMockWebSocket';
import { START_PRICE, TICKER } from '@/lib/constants';



export default function WebWorkerDemo() {
    const { prices } = useMockWebSocket();

    const price = prices.length > 0 ? prices[0].price : START_PRICE;


    return (
        <div className="min-h-screen bg-gradient-to-r from-amber-300 to-indigo-400 flex justify-center items-center">
            Hello World
        </div>
    )
}