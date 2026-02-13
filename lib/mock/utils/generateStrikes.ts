import { STRIKE_PRICE_RANGE } from "@/lib/constants";

export function generateStrikes(spot: number) {
    const strikes = [];

    for (let i = -10; i <= 10; i++) {
        strikes.push(Math.round((spot + i * STRIKE_PRICE_RANGE) / 100) * 100);
    }
    return strikes;
}
