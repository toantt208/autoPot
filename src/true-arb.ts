
const CONFIG = {
  maxBuyInHighPrice: 0.85,
  minBuyInLowPrice: 0.10,
  buyAmountBothSide: 20 // in usd
}

const fetchPrices = (upTokenId: string, downTokenId: string) => {
  // using post method to fetch prices.
}

type BuyInstructionsParams = {
  spentUpTokenAmount: number
  spentDownTokenAmount: number
  boughtUpShares: number
  boughtDownShares: number
  upTokenPrice: number
  downTokenPrice: number
}

type BuyInstruction = {
  buyAmountUsd: number,
  buyShares: number
}


const buyInstructions = (params: BuyInstructionsParams) => {
  const buyUp = {}
  const buyDown = {}
  const {
    spentUpTokenAmount,
    spentDownTokenAmount,
    boughtUpShares,
    boughtDownShares,
    upTokenPrice,
    downTokenPrice
  } = params;

  const higherPrice = Math.max(upTokenPrice, downTokenPrice);
  const lowerPrice = Math.min(upTokenPrice, downTokenPrice);
  const totalSpent = spentUpTokenAmount + spentDownTokenAmount; // in usd
  const profitIfHigherWin = upTokenPrice > downTokenPrice ? boughtUpShares - totalSpent : boughtDownShares - totalSpent;
  const profitIfLowerWin = upTokenPrice < downTokenPrice ? boughtUpShares - totalSpent : boughtDownShares - totalSpent;

  if (lowerPrice < CONFIG.minBuyInLowPrice) {
    // TODO: write a function check with current input can reach arbitrage.
    // example.
    // totalUpshare = 244,63
    // totalDownshare = 195,36
    // spentUp = 156
    // spentDown = 67
    // totalSpent = 223
    // upPrice = 0.95
    // downPrice = 0.06
    // possible profit if up win = 244.63 - 223 = 21.63
    // Down share need to equal 244.63 to reach arbitrage.
    // Down share need to buy = 244.63 - 195.36 = 49.27
    // Down amount need to buy = 49.27 * 0.06 = $2.95
    // newTotalSpent = 223 + 2.95 = 225.95
    // it's a profit.
    const canReachArbitrage = false;
    // if can reach arbitrage, buy the needed amount.
    // and return.
  }

  if ( higherPrice < CONFIG.maxBuyInHighPrice ) {
    // do not buy if price is too high
    // add direction to buy
    // for example. upTokenPrice = 0.5, downTokenPrice = 0.51
    // buy ratio = 0.51 / 0.5 = 1.02
    // we have 20$ to buy both side.
    // buyUp = 10 / 1.02 = 9.8$
    // buyDown = 10 * 1.02 = 10.2$
    // but round up. 10.2 to 11 and 9.8 to 9
    // when triggered buy success, save it to redis.
    // {event_slug}:{buySide}:{upPriceKey}:{downPriceKey}: {buyAmount, buyShares}
    // but up/down price key divide by 3 and take integer part., for example 0.51 = 51 /  3 = 17
    // so the key will be 17
    // 0.50 = 50 / 3 = 16
    // so the key will be 16

    return { buyUp, buyDown };
  }
}

const main = async () => {
  while (true) {
    const now = Date.now();
    // calculate event slug
    const eventSlug = ''
    // fetch tokenIds from redis, if it does not have fetch from gamma api then cache tokenIds in redis
    // Please note token's order, I dont want to mess it up.
    // '${eventSlug}' => [tokenId1, tokenId2]

    const upTokenId = ''
    const downTokenId = ''
    const boughtUpShares = 0;// fetch from redis
    const boughtDownShares = 0; // fetch from redis
    const spentUpTokenAmount = 0; // fetch from redis
    const spentDownTokenAmount = 0; // fetch from redis

    // fetch token prices.
    const { upTokenPrice, downTokenPrice } = await fetchPrices(upTokenId, downTokenId);
    const buyInstructionsResult = buyInstructions({
      spentUpTokenAmount: 0,
      spentDownTokenAmount: 0,
      boughtUpShares: 0,
      boughtDownShares: 0,
      upTokenPrice,
      downTokenPrice
    });


    const promiseArray = [];
    if (buyInstructionsResult.buyUp.buyAmountUsd > 0) {
      // execute buy up
      // push to promise array
    }

    if (buyInstructionsResult.buyDown.buyAmountUsd > 0) {
      // execute buy down
      // push to promise array
    }

    const result = await Promise.all(promiseArray);

    const [
      buyUpResult,
      buyDownResult
    ] = result;

    // read response. buyUpTakingAmount, buyUpMakingAmount
    // buyDownTakingAmount, buyDownMakingAmount
    // save buy to redis follow the key I made above
    // {event_slug}:{buySide}:{upPriceKey}:{downPriceKey}: {buyAmount, buyShares}
    // log the buy result for debugging purpose.
    // save totalBuyUpSpentAmount, totalBuyDownSpentAmount
    // save totalBuyUpShares, totalBuyDownShares to redis
    // next time it fetch from redis
    // sleep 0.5 second before next loop
  }
}