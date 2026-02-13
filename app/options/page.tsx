'use client';

import { useState, useEffect } from 'react';
import type { OptionChain, Subscription } from '@/lib/types';



interface SubscribeMessage {
    type: "subscribe";
    channel: Subscription;
}

export default function OptionsDemo() {

    const [data, setData] = useState<OptionChain[]>([]);


    useEffect(() => {

        const websocket = new WebSocket("ws://localhost:8080");

        const handleOpen = (event: Event) => {
            console.log(event);

            const subscribeMessage: SubscribeMessage = { 
                type: "subscribe",
                channel: "options"
            }

            websocket.send(JSON.stringify(subscribeMessage));
        }

        // should type change into message data we receive
        const handleMessage = (event: MessageEvent) => {
            const data = JSON.parse(event.data);
            const optionsChain: OptionChain[] = data.optionChain;
            console.log("data?", data);

            setData([...optionsChain]);
        }

        websocket.addEventListener("open", handleOpen);

        websocket.addEventListener("message", handleMessage);


        return () => {
            websocket.removeEventListener("open", handleOpen);
            websocket.removeEventListener("message", handleMessage);
            websocket.close();
        }

    },[])


    return (
        <div className="min-h-screen bg-gradient-to-r from-amber-300 to-indigo-400 flex justify-center items-center">

            <div className="flex flex-col gap-1 
            w-[20rem] p-3 justify-center items-center
             bg-slate-800/80 text-white">
                {data.map((option) => {
                    return (
                        <div 
                        key={option.strike}>
                            {option.strike}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}