import { Request, Response } from "express";
import { getFirstOrderSettings, checkFirstOrderEligibility } from "../utils/firstOrderLogic.js";
import FirstOrderDiscount from "../models/firstOrderDiscount.js";

// GET /api/first-order/settings
export const getSettings = async (req: Request, res: Response) => {
    try {
        const settings = await getFirstOrderSettings();
        res.json({ success: true, data: settings });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// PUT /api/first-order/settings
export const updateSettings = async (req: Request, res: Response) => {
    try {
        const { isEnabled, title, subtitle, priceRules } = req.body;

        let settings = await FirstOrderDiscount.findOne();
        if (!settings) {
            settings = await FirstOrderDiscount.create({});
        }

        if (isEnabled !== undefined) settings.isEnabled = isEnabled;
        if (title !== undefined) settings.title = title;
        if (subtitle !== undefined) settings.subtitle = subtitle;
        if (priceRules !== undefined) settings.priceRules = priceRules;

        await settings.save();

        res.json({ success: true, data: settings, message: "Settings updated successfully" });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/first-order/eligibility
export const getEligibility = async (req: Request, res: Response) => {
    try {
        // user should be authenticated
        const user = (req as any).user;
        if (!user) {
            return res.json({ success: true, eligible: false });
        }

        const isEligible = await checkFirstOrderEligibility(user._id);
        const settings = await getFirstOrderSettings();

        res.json({
            success: true,
            eligible: isEligible,
            isEnabled: settings?.isEnabled || false,
            settings: settings
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
