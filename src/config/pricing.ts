/**
 * Needero Global Pricing Configuration
 * Centralized logic for commissions, fees, and currency handling.
 * This ensures consistency across the marketplace "PostRate" system.
 */

export const PRICING_CONFIG = {
    // The "Nuclear" Disruptor Commission (5%)
    PLATFORM_COMMISSION_PERCENT: 5,

    // Flat fee paid by the customer to cover infrastructure/gateway costs
    CUSTOMER_CONVENIENCE_FEE: 0.49,

    // Minimum order amount to apply percentage commission
    MIN_ORDER_AMOUNT: 1.00,

    // Estimated payment gateway cost (for internal calculation)
    GATEWAY_BASE_PERCENT: 2.9,
    GATEWAY_FLAT_FEE: 0.30,
};

/**
 * Calculates the breakdown of an order
 * @param amount - The total amount the customer pays (before convenience fee)
 */
export const calculateOrderBreakdown = (amount: number) => {
    const commission = (amount * PRICING_CONFIG.PLATFORM_COMMISSION_PERCENT) / 100;
    const totalWithFee = amount + PRICING_CONFIG.CUSTOMER_CONVENIENCE_FEE;
    
    // What the business actually receives
    const businessPayout = amount - commission;

    return {
        originalAmount: amount,
        customerTotal: totalWithFee,
        platformCommission: commission,
        customerFee: PRICING_CONFIG.CUSTOMER_CONVENIENCE_FEE,
        businessPayout: businessPayout,
        totalPlatformRevenue: commission + PRICING_CONFIG.CUSTOMER_CONVENIENCE_FEE
    };
};
