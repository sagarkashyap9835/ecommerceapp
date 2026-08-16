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

export const getEffectiveProductPrice = (product: any, activeSale: any) => {
    let originalPrice = product.price;

    let saleInfo = {
        isOnSale: false,
        saleName: null,
        saleSubtitle: null,
        originalPrice: originalPrice,
        salePrice: null as number | null,
        discountAmount: 0,
        saleEndsAt: null,
    };

    if (!activeSale) {
        return {
            ...product,
            price: originalPrice,
            sale: saleInfo
        };
    }

    // Check if the current actual time applies (safety net). The DB query should already filter this, but just in case.
    const now = new Date();
    if (now >= new Date(activeSale.startAt) && now <= new Date(activeSale.endAt)) {
        // Find matching price rule
        const applicableRule = activeSale.priceRules.find((rule: any) => {
            return originalPrice >= rule.minPrice && originalPrice <= rule.maxPrice;
        });

        if (applicableRule) {
            saleInfo.isOnSale = true;
            saleInfo.saleName = activeSale.name;
            saleInfo.saleSubtitle = activeSale.subtitle;
            saleInfo.salePrice = originalPrice - applicableRule.discountAmount;

            // Ensure sale price never goes below 0
            if (saleInfo.salePrice < 0) {
                saleInfo.salePrice = 0;
            }

            saleInfo.discountAmount = applicableRule.discountAmount;
            saleInfo.saleEndsAt = activeSale.endAt;
        }
    }

    return {
        ...product,
        // DONT Modify the base product price property to preserve the original schema
        sale: saleInfo
    };
};
