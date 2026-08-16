import { Request, Response } from "express";
import Product from "../models/products.js";
import Order from "../models/order.js";
import cloudinary from "../config/cloudinary.js";
import { getActiveSale, getEffectiveProductPrice } from "../utils/saleLogic.js";
// सभी एक्टिव प्रोडक्ट्स को पेजिनेशन के साथ गेट करने का लॉजिक
export const getProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const { search, category, subcategory, size, minPrice, maxPrice, sortBy, isBogo } = req.query;

        // केवल वही प्रोडक्ट्स जो एक्टिव हैं
        const query: any = { isActive: true };

        // 0. Flags Filters
        if (isBogo === "true" || String(isBogo) === "true") {
            query.isBogo = true;
        }
        if (req.query.isFeatured === "true" || String(req.query.isFeatured) === "true") {
            query.isFeatured = true;
        }
        if (req.query.isLatest === "true" || String(req.query.isLatest) === "true") {
            query.isLatest = true;
        }

        // 1. Category Filter
        if (category && typeof category === "string" && category.toLowerCase() !== "all" && category.trim() !== "") {
            query.category = { $regex: new RegExp(`^${category.trim()}$`, "i") };
        }

        // 1b. Subcategory Filter
        if (subcategory && typeof subcategory === "string" && subcategory.toLowerCase() !== "all" && subcategory.trim() !== "") {
            query.subcategory = { $regex: new RegExp(`^${subcategory.trim()}$`, "i") };
        }

        // 1c. Size Filter
        if (size && typeof size === "string" && size.toLowerCase() !== "all" && size.trim() !== "") {
            const sizeArray = size.split(",").map(s => s.trim()).filter(Boolean);
            if (sizeArray.length > 0) {
                query.sizes = { $in: sizeArray };
            }
        }

        // 2. Search Filter (name & description)
        if (search && typeof search === "string" && search.trim() !== "") {
            const searchRegex = new RegExp(search.trim(), "i");
            query.$or = [
                { name: searchRegex },
                { description: searchRegex }
            ];
        }

        // 3. Price Range Filter
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice && !isNaN(Number(minPrice))) {
                query.price.$gte = Number(minPrice);
            }
            if (maxPrice && !isNaN(Number(maxPrice))) {
                query.price.$lte = Number(maxPrice);
            }
        }

        // 4. Sorting Options
        let sortOptions: any = { createdAt: -1 };
        if (sortBy === "price_asc") {
            sortOptions = { price: 1 };
        } else if (sortBy === "price_desc") {
            sortOptions = { price: -1 };
        } else if (sortBy === "newest") {
            sortOptions = { createdAt: -1 };
        }

        // टोटल प्रोडक्ट्स की गिनती
        const total = await Product.countDocuments(query);

        // पेजिनेशन के साथ प्रोडक्ट्स को डेटाबेस से खोजना
        const products = await Product.find(query)
            .sort(sortOptions)
            .skip((page - 1) * limit)
            .limit(limit);

        const activeSale = await getActiveSale();

        const productsWithSale = products.map(p => getEffectiveProductPrice(p.toObject(), activeSale));

        // सफल रिस्पॉन्स भेजना
        res.status(200).json({
            success: true,
            data: productsWithSale,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error: any) {
        // एरर हैंडलिंग
        res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
};

// Single Product by ID
export const getSingleProduct = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;
        console.log('getSingleProduct called with id:', id);

        const product = await Product.findOne({
            _id: id,
            isActive: true,
        });

        if (!product) {
            res.status(404).json({
                success: false,
                message: "Product not found",
            });
            return;
        }

        const activeSale = await getActiveSale();
        const productWithSale = getEffectiveProductPrice(product.toObject(), activeSale);

        res.status(200).json({
            success: true,
            data: productWithSale,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
        });
    }
};


export const createProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        // 1. Sizes को हैंडल और पार्स करना
        let sizes = req.body.sizes || [];

        if (typeof sizes === "string") {
            try {
                sizes = JSON.parse(sizes);
            } catch (e) {
                sizes = sizes.split(",")
                    .map((s: string) => s.trim())
                    .filter((s: string) => s !== "");
            }
        }

        if (!Array.isArray(sizes)) {
            sizes = [sizes];
        }

        // 2. इमेजेस को हैंडल करना (Multer से आने वाली फाइल्स)
        const files = req.files as Express.Multer.File[] | undefined;

        let imageUrls: string[] = [];

        const DEFAULT_PLACEHOLDER = "https://placehold.co/300x300/png?text=Product";

        if (files && files.length > 0) {
            const uploadPromises = files.map(async (file) => {
                if (file.buffer && process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name') {
                    try {
                        const b64 = Buffer.from(file.buffer).toString("base64");
                        const dataURI = "data:" + (file.mimetype || "image/jpeg") + ";base64," + b64;
                        const result = await cloudinary.uploader.upload(dataURI, { folder: "products" });
                        return result.secure_url;
                    } catch (cloudErr) {
                        console.error("Cloudinary upload failed, falling back to base64 data URI:", cloudErr);
                    }
                }
                if (file.buffer) {
                    const b64 = Buffer.from(file.buffer).toString("base64");
                    return "data:" + (file.mimetype || "image/jpeg") + ";base64," + b64;
                }
                return DEFAULT_PLACEHOLDER;
            });
            imageUrls = await Promise.all(uploadPromises);
        }

        if (imageUrls.length === 0) {
            imageUrls = [DEFAULT_PLACEHOLDER];
        }

        // 3. प्रोडक्ट डेटा तैयार करना
        const productData = {
            name: req.body.name,
            description: req.body.description,
            price: Number(req.body.price),
            stock: Number(req.body.stock || 0),
            category: req.body.category || "Other",
            subcategory: req.body.subcategory || "",
            isFeatured: req.body.isFeatured === "true" || req.body.isFeatured === true,
            isBogo: req.body.isBogo === "true" || req.body.isBogo === true,
            isLatest: req.body.isLatest === "true" || req.body.isLatest === true,
            sizes: sizes,
            colors: req.body.colors ? JSON.parse(req.body.colors) : [],
            images: imageUrls
        };

        // 4. डेटाबेस में सेव करना
        const newProduct = await Product.create(productData);

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: newProduct
        });

    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// update products

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        console.log('getSingleProduct called with id:', id);

        const existingProduct = await Product.findById(id);
        if (!existingProduct) {
            res.status(404).json({ success: false, message: "Product not found" });
            return;
        }

        let sizes = req.body.sizes;
        if (sizes !== undefined) {
            if (typeof sizes === "string") {
                try {
                    sizes = JSON.parse(sizes);
                } catch (e) {
                    sizes = sizes.split(",")
                        .map((s: string) => s.trim())
                        .filter((s: string) => s !== "");
                }
            }
            if (!Array.isArray(sizes)) {
                sizes = [sizes];
            }
        }

        const files = req.files as Express.Multer.File[] | undefined;
        let updatedImages: string[] = [];
        const DEFAULT_PLACEHOLDER = "https://placehold.co/300x300/png?text=Product";

        if (files && files.length > 0) {
            const uploadPromises = files.map(async (file) => {
                if (file.buffer && process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name') {
                    try {
                        const b64 = Buffer.from(file.buffer).toString("base64");
                        const dataURI = "data:" + (file.mimetype || "image/jpeg") + ";base64," + b64;
                        const result = await cloudinary.uploader.upload(dataURI, { folder: "products" });
                        return result.secure_url;
                    } catch (cloudErr) {
                        console.error("Cloudinary upload failed, falling back to base64 data URI:", cloudErr);
                    }
                }
                if (file.buffer) {
                    const b64 = Buffer.from(file.buffer).toString("base64");
                    return "data:" + (file.mimetype || "image/jpeg") + ";base64," + b64;
                }
                return DEFAULT_PLACEHOLDER;
            });
            updatedImages = await Promise.all(uploadPromises);
        } else {
            let existingImgArr: string[] = [];
            if (req.body.existingImages) {
                existingImgArr = Array.isArray(req.body.existingImages)
                    ? req.body.existingImages
                    : [req.body.existingImages];
            } else if (req.body.images) {
                existingImgArr = Array.isArray(req.body.images)
                    ? req.body.images
                    : [req.body.images];
            } else {
                existingImgArr = existingProduct.images;
            }
            updatedImages = existingImgArr;
        }

        if (!updatedImages || updatedImages.length === 0) {
            updatedImages = existingProduct.images.length > 0 ? existingProduct.images : [DEFAULT_PLACEHOLDER];
        }

        const updatedData: any = {};
        if (req.body.name) updatedData.name = req.body.name;
        if (req.body.description !== undefined) updatedData.description = req.body.description;
        if (req.body.price !== undefined) updatedData.price = Number(req.body.price);
        if (req.body.stock !== undefined) updatedData.stock = Number(req.body.stock);
        if (req.body.category) updatedData.category = req.body.category;
        if (req.body.subcategory !== undefined) updatedData.subcategory = req.body.subcategory;
        if (req.body.isFeatured !== undefined) updatedData.isFeatured = req.body.isFeatured === "true" || req.body.isFeatured === true;
        if (req.body.isBogo !== undefined) updatedData.isBogo = req.body.isBogo === "true" || req.body.isBogo === true;
        if (req.body.isLatest !== undefined) updatedData.isLatest = req.body.isLatest === "true" || req.body.isLatest === true;
        if (sizes !== undefined) updatedData.sizes = sizes;
        updatedData.images = updatedImages;

        const updatedProduct = await Product.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: updatedProduct
        });

    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// delete product

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        if (product.images && product.images.length > 0) {
            const deletePromises = product.images.map(async (imageUrl: string) => {
                try {
                    const publicIdMatch = imageUrl.match(/\/v\d+\/(.+)\.[a-z]+$/);
                    const publicId = publicIdMatch ? publicIdMatch[1] : null;
                    if (publicId && process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name') {
                        await cloudinary.uploader.destroy(publicId);
                    }
                } catch (imgErr) {
                    console.error("Cloudinary image delete error (ignoring to finish product deletion):", imgErr);
                }
            });
            await Promise.all(deletePromises);
        }

        await Product.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Product deleted successfully" });

    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create or update a verified product review
export const createProductReview = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        console.log('getSingleProduct called with id:', id);
        const { rating, comment, image } = req.body;
        const user = (req as any).user;

        if (!user) {
            res.status(401).json({ success: false, message: "Authentication required to leave a review." });
            return;
        }

        if (!rating || !comment) {
            res.status(400).json({ success: false, message: "Please provide a star rating and a review comment." });
            return;
        }

        const numericRating = Number(rating);
        if (numericRating < 1 || numericRating > 5) {
            res.status(400).json({ success: false, message: "Rating must be between 1 and 5 stars." });
            return;
        }

        const product = await Product.findById(id);
        if (!product) {
            res.status(404).json({ success: false, message: "Product not found." });
            return;
        }

        // 1. VERIFIED PURCHASE CHECK: Check if the user has an order containing this product
        const verifiedOrder = await Order.findOne({
            user: user._id,
            "items.product": id,
            orderStatus: { $ne: "cancelled" }
        });

        if (!verifiedOrder) {
            res.status(403).json({
                success: false,
                message: "Verified Purchase Only: You can only leave a review if you have ordered this product."
            });
            return;
        }

        // Initialize reviews array if missing
        if (!product.reviews) {
            product.reviews = [];
        }

        // 2. Check if user has already reviewed this product
        const existingReviewIndex = product.reviews.findIndex(
            (rev: any) => rev.user && rev.user.toString() === user._id.toString()
        );

        let uploadedImageUrl = image || "";
        if (image && image.startsWith("data:image")) {
            try {
                if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name') {
                    const result = await cloudinary.uploader.upload(image, { folder: "reviews" });
                    uploadedImageUrl = result.secure_url;
                }
            } catch (error) {
                console.error("Cloudinary review image upload failed:", error);
            }
        }

        const newReviewData = {
            user: user._id,
            userName: user.name || "Customer",
            userImage: user.image || "",
            rating: numericRating,
            comment: comment.trim(),
            image: uploadedImageUrl,
            isVerifiedPurchase: true,
            createdAt: new Date()
        };

        if (existingReviewIndex >= 0) {
            product.reviews[existingReviewIndex] = newReviewData as any;
        } else {
            product.reviews.push(newReviewData as any);
        }

        // 3. Recalculate Ratings Average & Count dynamically (Real Calculation)
        const totalCount = product.reviews.length;
        const sumRating = product.reviews.reduce((acc: number, item: any) => acc + item.rating, 0);
        const averageRating = Number((sumRating / totalCount).toFixed(1));

        product.ratings = {
            average: averageRating,
            count: totalCount
        };

        await product.save();

        res.status(200).json({
            success: true,
            message: existingReviewIndex >= 0 ? "Your review has been updated!" : "Thank you for your review!",
            data: product
        });

    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to submit review"
        });
    }
};

// Check if user can review a product (has ordered it & has existing review)
export const checkUserCanReview = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        console.log('getSingleProduct called with id:', id);
        const user = (req as any).user;

        if (!user) {
            res.status(200).json({ success: true, canReview: false, userReview: null });
            return;
        }

        const verifiedOrder = await Order.findOne({
            user: user._id,
            "items.product": id,
            orderStatus: { $ne: "cancelled" }
        });

        const product = await Product.findById(id);
        const existingReview = product?.reviews?.find(
            (rev: any) => rev.user && rev.user.toString() === user._id.toString()
        );

        res.status(200).json({
            success: true,
            canReview: !!verifiedOrder,
            userReview: existingReview || null
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all reviews written by the currently logged-in user
export const getUserReviews = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = (req as any).user;
        if (!user) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }

        const products = await Product.find({ "reviews.user": user._id })
            .select("name images price ratings reviews");

        const userReviews: any[] = [];
        products.forEach((product: any) => {
            if (product.reviews && Array.isArray(product.reviews)) {
                product.reviews.forEach((rev: any) => {
                    if (rev.user && rev.user.toString() === user._id.toString()) {
                        userReviews.push({
                            _id: rev._id,
                            productId: product._id,
                            productName: product.name,
                            productImage: product.images && product.images.length > 0 ? product.images[0] : "https://placehold.co/80x80/png?text=Product",
                            productPrice: product.price,
                            rating: rev.rating,
                            comment: rev.comment,
                            image: rev.image || "",
                            createdAt: rev.createdAt
                        });
                    }
                });
            }
        });

        userReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        res.status(200).json({
            success: true,
            data: userReviews
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message || "Failed to fetch user reviews" });
    }
};

// Delete a user's own review for a product
export const deleteUserReview = async (req: Request, res: Response): Promise<void> => {
    try {
        const { productId } = req.params;
        const user = (req as any).user;

        const product = await Product.findById(productId);
        if (!product) {
            res.status(404).json({ success: false, message: "Product not found" });
            return;
        }

        if (product.reviews) {
            product.reviews = product.reviews.filter(
                (rev: any) => rev.user && rev.user.toString() !== user._id.toString()
            );

            const totalCount = product.reviews.length;
            const sumRating = product.reviews.reduce((acc: number, item: any) => acc + item.rating, 0);
            const averageRating = totalCount > 0 ? Number((sumRating / totalCount).toFixed(1)) : 0;

            product.ratings = {
                average: averageRating,
                count: totalCount
            };

            await product.save();
        }

        res.status(200).json({
            success: true,
            message: "Review deleted successfully"
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message || "Failed to delete review" });
    }
};