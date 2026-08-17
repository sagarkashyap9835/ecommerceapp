import Sale from "../models/sale.js";

// Helper to get the currently active sale
export const getActiveSale = async () => {
    const now = new Date();
    // Only one active sale is supported right now, find the one that spans 'now'
    const activeSale = await Sale.findOne({
        startAt: { $lte: now },
        endAt: { $gte: now },
    });
    return activeSale;
};

export const getEffectiveProductPrice = (product: any, activeSale: any, firstOrderOffer?: { isEligible: boolean, settings: any }) => {
    let originalPrice = product.price;

    let saleInfo = {
        isOnSale: false,
        saleName: null,
        saleSubtitle: null,
        originalPrice: originalPrice,
        salePrice: null as number | null,
        discountAmount: 0,
        saleEndsAt: null,
        discountType: null as string | null
    };

    let bestDiscountParams = null;
    let maxDiscountAmount = 0;

    // Check Festival Sale
    if (activeSale) {
        const now = new Date();
        if (now >= new Date(activeSale.startAt) && now <= new Date(activeSale.endAt)) {
            const applicableRule = activeSale.priceRules.find((rule: any) => {
                return originalPrice >= rule.minPrice && originalPrice <= rule.maxPrice;
            });
            if (applicableRule) {
                bestDiscountParams = {
                    type: "FESTIVAL_SALE",
                    name: activeSale.name,
                    subtitle: activeSale.subtitle,
                    discountAmount: applicableRule.discountAmount,
                    endsAt: activeSale.endAt
                };
                maxDiscountAmount = applicableRule.discountAmount;
            }
        }
    }

    // Check First Order Offer
    if (firstOrderOffer && firstOrderOffer.isEligible && firstOrderOffer.settings && firstOrderOffer.settings.isEnabled) {
        const applicableFirstRule = firstOrderOffer.settings.priceRules.find((rule: any) => {
            return originalPrice >= rule.minPrice && originalPrice <= rule.maxPrice;
        });

        if (applicableFirstRule && applicableFirstRule.discountAmount > maxDiscountAmount) {
            bestDiscountParams = {
                type: "FIRST_ORDER",
                name: firstOrderOffer.settings.title,
                subtitle: firstOrderOffer.settings.subtitle,
                discountAmount: applicableFirstRule.discountAmount,
                endsAt: null
            };
            maxDiscountAmount = applicableFirstRule.discountAmount;
        }
    }

    if (bestDiscountParams) {
        saleInfo.isOnSale = true;
        saleInfo.discountType = bestDiscountParams.type;
        saleInfo.saleName = bestDiscountParams.name;
        saleInfo.saleSubtitle = bestDiscountParams.subtitle;
        saleInfo.salePrice = originalPrice - bestDiscountParams.discountAmount;

        if (saleInfo.salePrice < 0) saleInfo.salePrice = 0;

        saleInfo.discountAmount = bestDiscountParams.discountAmount;
        saleInfo.saleEndsAt = bestDiscountParams.endsAt;
    }

    return {
        ...product,
        price: originalPrice,
        sale: saleInfo
    };
};
