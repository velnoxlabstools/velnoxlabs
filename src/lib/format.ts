export interface LocaleCurrencyConfig {
  code: string;
  symbol: string;
}

export const LOCALE_CURRENCY_MAP: Record<string, LocaleCurrencyConfig> = {
  en: { code: 'USD', symbol: '$' },
  zh: { code: 'CNY', symbol: '¥' },
  ja: { code: 'JPY', symbol: '¥' },
  ko: { code: 'KRW', symbol: '₩' },
  de: { code: 'EUR', symbol: '€' },
  fr: { code: 'EUR', symbol: '€' },
  es: { code: 'EUR', symbol: '€' },
  it: { code: 'EUR', symbol: '€' },
  ru: { code: 'RUB', symbol: '₽' },
  pt: { code: 'BRL', symbol: 'R$' },
};

/**
 * Gets the ISO 4217 currency code for a given locale.
 */
export function getCurrencyCode(locale: string = 'en'): string {
  const baseLocale = locale.split('-')[0].toLowerCase();
  return LOCALE_CURRENCY_MAP[baseLocale]?.code || 'USD';
}

/**
 * Gets the standard currency symbol for a given locale.
 */
export function getCurrencySymbol(locale: string = 'en'): string {
  const baseLocale = locale.split('-')[0].toLowerCase();
  return LOCALE_CURRENCY_MAP[baseLocale]?.symbol || '$';
}

/**
 * Formats a numeric amount according to the locale's native currency convention.
 */
export function formatCurrency(
  amount: number,
  locale: string = 'en',
  options?: Intl.NumberFormatOptions
): string {
  const num = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  const baseLocale = locale.split('-')[0].toLowerCase();
  const currency = getCurrencyCode(baseLocale);

  try {
    return new Intl.NumberFormat(baseLocale, {
      style: 'currency',
      currency,
      ...options,
    }).format(num);
  } catch {
    const symbol = getCurrencySymbol(baseLocale);
    return `${symbol}${num.toFixed(2)}`;
  }
}
