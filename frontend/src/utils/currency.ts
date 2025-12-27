/**
 * Formats a number as Nepalese Rupee (NPR) currency.
 * @param amount The amount to format.
 * @returns Formatted string (e.g., "Rs. 1,500")
 */
export const formatCurrency = (amount: number): string => {
    return `Rs. ${amount.toLocaleString('en-IN')}`;
};
