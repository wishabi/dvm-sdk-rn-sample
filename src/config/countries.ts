export type CountryCode = 'CA' | 'FR' | 'IT' | 'ES' | 'US';

export const COUNTRY_OPTIONS: { value: CountryCode; label: string }[] = [
  { value: 'CA', label: 'Canada' },
  { value: 'FR', label: 'France' },
  { value: 'IT', label: 'Italy' },
  { value: 'ES', label: 'Spain' },
  { value: 'US', label: 'United States' },
];
