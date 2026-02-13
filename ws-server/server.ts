// Mock websocket

import { WebSocketServer, WebSocket } from 'ws';
import { generateMarketPrices } from '../lib/mock/generateOptions';
import { generateTrade } from '../lib/mock/generateTrade';
import { generateStrikes } from '../lib/mock/utils/generateStrikes';

import type { Subscription, OptionChain, OptionsMessage } from '../lib/types';
import { START_PRICE } from '../lib/constants';


const PORT = 8080;
const WS_RATE = 1000;

const wss = new WebSocketServer({ port: PORT });

let latestPrice = START_PRICE;
let tickId = 0;

wss.on('connection', (ws: WebSocket) => {
    let subscription: Subscription = "trades";
    console.log('Client connected');

    ws.on("message", (raw) => {
        const { type, channel } = JSON.parse(raw.toString());
        if(type === "subscribe") {
            subscription = channel;
        }
    });
    
    const intervalId = setInterval(() => {
        if(ws.readyState === WebSocket.OPEN) {
            const trade = generateTrade(latestPrice, `tick-${tickId++}`);

            if(subscription === "trades") {
                ws.send(JSON.stringify(trade));
            } else if(subscription === "options") {

                // Expiration timer can be changed around e.g 30 days out
                const timeToExpiration = 30 / 365;

                const strikes = generateStrikes(latestPrice);


                const optionsChain: OptionChain[] = strikes.map((strike) => {
                    return {
                        strike,
                        ...generateMarketPrices(latestPrice, strike, timeToExpiration)
                    }
                });

                const optionsMessage: OptionsMessage = {type: "options", optionsChain: optionsChain }

                ws.send(JSON.stringify(optionsMessage));
            }
        }
    }, WS_RATE);
    
    
    ws.on("close", () => console.log("Client disconnected"));
    ws.on("close", () => clearInterval(intervalId));
})



console.log("Mock Websocket runnning on port:", PORT);

