import { Product } from "@/assets/constants/types";

export const applyFirstOrderDiscount = (p: Product, firstOrderOffer: any): Product => {
    if (!firstOrderOffer || !firstOrderOffer.eligible || !firstOrderOffer.isEnabled) {
        if (p.sale?.isOnSale) {
            return {
                ...p,
                sale: {
                    ...p.sale,
                    discountType: "FESTIVAL_SALE"
                }
            };
        }
        return p;
    }

    let maxDiscount = p.sale?.isOnSale ? p.sale.discountAmount : 0;
    let applyFirstOrder = false;
    let foDiscount = 0;

    const activeRule = firstOrderOffer.settings?.priceRules?.find((r: any) => p.price >= r.minPrice && p.price <= r.maxPrice);

    if (activeRule && activeRule.discountAmount > maxDiscount) {
        applyFirstOrder = true;
        foDiscount = activeRule.discountAmount;
    }

    if (applyFirstOrder) {
        const sp = p.price - foDiscount;
        return {
            ...p,
            sale: {
                isOnSale: true,
                saleName: firstOrderOffer.settings?.title || "Welcome Offer",
                saleSubtitle: firstOrderOffer.settings?.subtitle || "",
                originalPrice: p.price,
                discountAmount: foDiscount,
                salePrice: sp < 0 ? 0 : sp,
                saleEndsAt: new Date(Date.now() + 86400000).toISOString(),
                discountType: "FIRST_ORDER"
            }
        };
    }

    if (p.sale?.isOnSale) {
        return {
            ...p,
            sale: {
                ...p.sale,
                discountType: "FESTIVAL_SALE"
            }
        };
    }

    return p;
};
