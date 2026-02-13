export type Subscription = "trades" | "options";

export interface OptionsMessage {
    type: "options";
    optionsChain: OptionChain[];
}

export interface Price {
    id: string;
    ticker: string;
    price: number;
    size: number;
    orderType: "Buy" | "Sell";
    time: string;
    percentageChange: string;
}

export interface OptionOrderBook {
    callBid: number;
    callAsk: number;
    putBid: number;
    putAsk: number;
}

export interface OptionChain extends OptionOrderBook {
    strike: number;
}