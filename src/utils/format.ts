import type {
  ContentDates,
  Offer,
  OfferPricing,
  Publication,
} from '@flipp/dvm-sdk-native';

/** "Aug 9, 2024" — or undefined when the date is missing/unparseable. */
export function formatDate(iso?: string): string | undefined {
  if (!iso) return undefined;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** "Aug 9, 2024 - Aug 15, 2024" from the validity window, when either end is set. */
export function formatValidity(dates?: ContentDates): string | undefined {
  const from = formatDate(dates?.validFrom);
  const to = formatDate(dates?.validTo);
  if (!from && !to) return undefined;
  return `${from ?? '…'} - ${to ?? '…'}`;
}

export type PublicationStatus = 'live' | 'preview' | 'expired';

/**
 * Where a publication sits relative to its availability window (falling back
 * to validity): not yet started → preview, ended → expired, otherwise live.
 */
export function publicationStatus(
  publication: Publication,
  now: number = Date.now()
): PublicationStatus {
  const start =
    publication.dates?.availableFrom ?? publication.dates?.validFrom;
  const end = publication.dates?.availableTo ?? publication.dates?.validTo;
  if (start && new Date(start).getTime() > now) return 'preview';
  if (end && new Date(end).getTime() < now) return 'expired';
  return 'live';
}

function formatAmount(value: number): string {
  return `$${value.toFixed(2)}`;
}

/** The headline price for an offer, e.g. "2/$5.59", "$3.49", "20% off". */
export function formatPrice(pricing?: OfferPricing): string | undefined {
  if (!pricing) return undefined;
  const sale = pricing.salePrice ?? pricing.price;
  if (sale !== undefined && pricing.nforQuantity && pricing.nforQuantity > 1) {
    return `${pricing.nforQuantity}/${formatAmount(sale)}`;
  }
  const range = pricing.salePriceRange ?? pricing.priceRange;
  if (range?.from !== undefined && range.to !== undefined) {
    return `${formatAmount(range.from)} - ${formatAmount(range.to)}`;
  }
  if (sale !== undefined) return formatAmount(sale);
  if (pricing.percentOff !== undefined) return `${pricing.percentOff}% off`;
  if (pricing.amountOff !== undefined)
    return `${formatAmount(pricing.amountOff)} off`;
  return undefined;
}

/** The regular price to strike through when a sale price is shown. */
export function formatOriginalPrice(
  pricing?: OfferPricing
): string | undefined {
  if (pricing?.salePrice === undefined || pricing.price === undefined)
    return undefined;
  return formatAmount(pricing.price);
}

export function offerImageUrl(offer: Offer): string | undefined {
  return (
    offer.details?.imageUrl ??
    offer.details?.backgroundImageUrl ??
    offer.products[0]?.details?.imageUrl
  );
}

export function offerSku(offer: Offer): string | undefined {
  return offer.products.find((p) => p.additionalIds?.sku)?.additionalIds?.sku;
}
