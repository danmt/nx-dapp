import { Orderbook } from '@project-serum/serum';

export const calculateBestBidOffer = (
  bidsBook: Orderbook,
  asksBook: Orderbook
) => {
  const bestBid = bidsBook.getL2(1);
  const bestAsk = asksBook.getL2(1);

  if (bestBid.length > 0 && bestAsk.length > 0) {
    return (bestBid[0][0] + bestAsk[0][0]) / 2.0;
  }

  return 0;
};
