/*
    =================
    Market Maker POV
    =================

    They are giving us the 
    prices but not the IV, IV is derive from bid and ask prices, however exchanges sometimes wont give you the IV 
    so youll have to derive it, this function represents the exchange holding unto the IV thus we are hard coding it here and our other function SHOULD get the same result

*/

const BASE_IV = 0.80;

/*
    Measure how fast IV changes per unit of moneyness*
    Where multipler moves this amount by 1 uni of moneyness
    increasing Base IV by that amount 

    Example Walkthrough:

    Spot = $500
    Strike = $550

    Moneyness = $550 / $500 = 1.10

    Distance from ATM = moneyness - 1 
                  = 1.10 - 1
                  = 0.10  ← This is "10% OTM"

    IV increase = 0.10 × 0.05 = 0.005

    Final IV = 0.80 + 0.005 = 0.805 = 80.5%
*/

// Puts (PUT_SKEW_SLOPE) is higher x3 in this scenerio because in the real world they are often higher/more in demand to hedge against holds by market makers
const CALL_SKEW_SLOPE = 0.05;
const PUT_SKEW_SLOPE = 0.15;



export function generateMarketPrices(spot: number, strike: number, timeToExpiration: number) {

    const moneyness = strike / spot;

    // Secret IV exchange is withholding
    const secretCallImpVol = BASE_IV + Math.max(0, (moneyness - 1) * CALL_SKEW_SLOPE);

    const secretPutImpVol = BASE_IV + Math.max(0, (1 - moneyness) * PUT_SKEW_SLOPE);

    // theoretical fair price of call and put
    const callMid = blackScholes(spot, strike, timeToExpiration, CALL_SKEW_SLOPE, secretCallImpVol, true);

    const putMid = blackScholes(spot, strike, timeToExpiration, PUT_SKEW_SLOPE, secretPutImpVol, false);


    /*
    Generates fake call/put bid/ask prices to simulate market data.
    
    Mid price = theoretical fair value from Black-Scholes
    
    Bid/Ask spread simulates market microstructure:
    - ASK (mid * 1.015): 
        The price the market maker SELLS to you at
        1.5% ABOVE fair value (seller wants maximum profit he can
        that bidders/buyers would be willing to buy at 1.5% increase is a resonable price to sell at)

    - BID (mid * 0.985): 
        The price the market maker BUYS from you at
        1.5% BELOW fair value (buyer wants minimum)
    
    Example with fair value = $100:
        - Ask = $101.50  ← you pay this when BUYING
        - Mid = $100.00  ← theoretical fair price
        - Bid = $98.50   ← you receive this when SELLING
        - Spread = $3.00 ← market maker's profit per round trip
    
    In reality spreads widen for OTM options (less liquid)
    and tighten for ATM options (most liquid)
    */

    return {
        callBid: callMid * 0.985,
        callAsk: callMid * 1.015,
        putBid: putMid * 0.985,
        putAsk: putMid * 1.015
    };

}

// Helper: Standard normal distribution
function normalCDF(x: number): number {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x) / Math.sqrt(2);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return 0.5 * (1.0 + sign * y);
}

// Black Scholes formula
function blackScholes(
    spot: number,
    strike: number,
    timeToExpiry: number,
    riskFreeRate: number,
    iv: number,
    isCall: boolean
): number {

    // edge case option has already expired
    if (timeToExpiry <= 0) {
        if (isCall) return Math.max(0, spot - strike);
        return Math.max(0, strike - spot);
    }

    // 0.5 * iv * iv = ½σ² —> this is the "convexity adjustment"
    // https://www.vangemert.dev/blog/why-the-term-half-sigma-squared-keeps-popping-up-in-financial-mathematics
    const d1 = (Math.log(spot / strike) + (riskFreeRate + 0.5 * iv * iv) * timeToExpiry) / (iv * Math.sqrt(timeToExpiry));

    const d2 = d1 - iv * Math.sqrt(timeToExpiry);

    if (isCall) {
        return spot * normalCDF(d1) - strike * Math.exp(-riskFreeRate * timeToExpiry) * normalCDF(d2);
    } else {
        return strike * Math.exp(-riskFreeRate * timeToExpiry) * normalCDF(-d2) - spot * normalCDF(-d1);
    }
}