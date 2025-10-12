// עזרי מטבע למניעת קוד חוזר
export const CURRENCY = {
    symbol: '₪',
    code: 'ILS',
    name: 'שקלים'
};

// פורמט מחיר בעברית
export const formatPrice = (price) => {
    if (price === null || price === undefined) return `${CURRENCY.symbol}0`;
    const number = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(number)) return `${CURRENCY.symbol}0`;
    return `${CURRENCY.symbol}${number.toFixed(2)}`;
};

// פורמט מחיר ללא סימן מטבע
export const formatPriceNumber = (price) => {
    if (price === null || price === undefined) return '0';
    const number = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(number)) return '0';
    return number.toFixed(2);
};