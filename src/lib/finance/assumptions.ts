/**
 * Dashboard and budget periods use UTC calendar months. Transaction amounts
 * are stored as positive numbers; transaction type determines their effect.
 * The monthly net is income minus expenses. Savings rate is net divided by
 * income when income is positive, otherwise zero. Budget spend sums expenses
 * in the same category and month. There is no opening balance.
 */
export const DEFAULT_CURRENCY = "INR";
export const DEFAULT_LOCALE = "en-IN";
