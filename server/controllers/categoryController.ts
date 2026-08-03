import { Request, Response } from "express";
import Category from "../models/category.js";

// Get all active categories (Public)
export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });
    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch categories",
    });
  }
};

// Get single category by ID or name (Public)
export const getCategoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const category = await Category.findOne({
      $or: [{ _id: id }, { name: id }],
      isActive: true,
    });

    if (!category) {
      res.status(404).json({
        success: false,
        message: "Category not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch category",
    });
  }
};

// Create a new Category with subcategories & sizes (Admin Only)
export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, subcategories, sizes, icon, sortOrder } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({ success: false, message: "Category name is required" });
      return;
    }

    const existing = await Category.findOne({ name: name.trim() });
    if (existing) {
      res.status(400).json({ success: false, message: "Category with this name already exists" });
      return;
    }

    const parsedSubcategories = Array.isArray(subcategories)
      ? subcategories
      : typeof subcategories === "string"
      ? subcategories.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const parsedSizes = Array.isArray(sizes)
      ? sizes
      : typeof sizes === "string"
      ? sizes.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const newCategory = await Category.create({
      name: name.trim(),
      subcategories: parsedSubcategories,
      sizes: parsedSizes,
      icon: icon || "grid-outline",
      sortOrder: Number(sortOrder) || 0,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: newCategory,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create category",
    });
  }
};

// Update an existing Category (Admin Only)
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, subcategories, sizes, icon, sortOrder, isActive } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      res.status(404).json({ success: false, message: "Category not found" });
      return;
    }

    if (name) category.name = name.trim();
    if (icon) category.icon = icon;
    if (sortOrder !== undefined) category.sortOrder = Number(sortOrder);
    if (isActive !== undefined) category.isActive = Boolean(isActive);

    if (subcategories !== undefined) {
      category.subcategories = Array.isArray(subcategories)
        ? subcategories
        : typeof subcategories === "string"
        ? subcategories.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
    }

    if (sizes !== undefined) {
      category.sizes = Array.isArray(sizes)
        ? sizes
        : typeof sizes === "string"
        ? sizes.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
    }

    await category.save();

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update category",
    });
  }
};

// Delete Category (Admin Only)
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      res.status(404).json({ success: false, message: "Category not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete category",
    });
  }
};
