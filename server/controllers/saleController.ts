import { Request, Response } from "express";
import Sale from "../models/sale.js";

export const createSale = async (req: Request, res: Response) => {
    try {
        const { name, subtitle, startAt, endAt, priceRules } = req.body;

        // Prevent overlapping sales
        const overlappingSale = await Sale.findOne({
            $or: [
                { startAt: { $lt: endAt, $gte: startAt } },
                { endAt: { $gt: startAt, $lte: endAt } },
                { startAt: { $lte: startAt }, endAt: { $gte: endAt } }
            ]
        });

        if (overlappingSale) {
            return res.status(400).json({ success: false, message: "A sale already exists during this time period." });
        }

        const newSale = await Sale.create({
            name,
            subtitle,
            startAt,
            endAt,
            priceRules,
            createdBy: req.user._id
        });

        res.status(201).json({ success: true, data: newSale });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateSale = async (req: Request, res: Response) => {
    try {
        const sale = await Sale.findById(req.params.id);
        if (!sale) return res.status(404).json({ success: false, message: "Sale not found" });

        const updatedSale = await Sale.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, data: updatedSale });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteSale = async (req: Request, res: Response) => {
    try {
        await Sale.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Sale deleted" });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Calculate dynamic status before returning
const computeStatus = (sale: any) => {
    const now = new Date();
    const start = new Date(sale.startAt);
    const end = new Date(sale.endAt);
    if (now < start) return "SCHEDULED";
    if (now > end) return "EXPIRED";
    return "ACTIVE";
};

export const getAllSales = async (req: Request, res: Response) => {
    try {
        const sales = await Sale.find().sort({ createdAt: -1 });
        const data = sales.map(s => {
            const obj = s.toObject();
            obj.status = computeStatus(obj);
            return obj;
        });
        res.json({ success: true, data });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getActiveSaleEndpoint = async (req: Request, res: Response) => {
    try {
        const now = new Date();
        const sale = await Sale.findOne({
            startAt: { $lte: now },
            endAt: { $gte: now }
        });

        res.json({ success: true, data: sale });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
