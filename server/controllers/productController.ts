import { Request, Response } from "express";
import Product from "../models/products.js";
import cloudinary from "../config/cloudinary.js";
// सभी एक्टिव प्रोडक्ट्स को पेजिनेशन के साथ गेट करने का लॉजिक
export const getProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        // क्वेरी से page और limit निकालना (डिफ़ॉल्ट वैल्यू के साथ)
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        
        // केवल वही प्रोडक्ट्स जो एक्टिव हैं
        const query: any = { isActive: true };

        // टोटल प्रोडक्ट्स की गिनती
        const total = await Product.countDocuments(query);

        // पेजिनेशन के साथ प्रोडक्ट्स को डेटाबेस से खोजना
        const products = await Product.find(query)
            .skip((page - 1) * limit)
            .limit(limit);

        // सफल रिस्पॉन्स भेजना
        res.status(200).json({
            success: true,
            data: products,
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

    res.status(200).json({
      success: true,
      data: product,
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

        if (files && files.length > 0) {
            const uploadPromises = files.map(async (file) => {
                if (file.buffer && process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name') {
                    const b64 = Buffer.from(file.buffer).toString("base64");
                    const dataURI = "data:" + file.mimetype + ";base64," + b64;
                    const result = await cloudinary.uploader.upload(dataURI, { folder: "products" });
                    return result.secure_url;
                }
                return "https://via.placeholder.com/300"; 
            });
            imageUrls = await Promise.all(uploadPromises);
        }

        if (imageUrls.length === 0) {
            imageUrls = ["https://via.placeholder.com/300"];
        }

        // 3. प्रोडक्ट डेटा तैयार करना
        const productData = {
            name: req.body.name,
            description: req.body.description,
            price: Number(req.body.price),
            stock: Number(req.body.stock || 0),
            category: req.body.category || "Other",
            isFeatured: req.body.isFeatured === "true" || req.body.isFeatured === true,
            sizes: sizes,
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

        if (files && files.length > 0) {
            const uploadPromises = files.map(async (file) => {
                if (file.buffer && process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name') {
                    const b64 = Buffer.from(file.buffer).toString("base64");
                    const dataURI = "data:" + file.mimetype + ";base64," + b64;
                    const result = await cloudinary.uploader.upload(dataURI, { folder: "products" });
                    return result.secure_url;
                }
                return "https://via.placeholder.com/300"; 
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
            updatedImages = existingProduct.images.length > 0 ? existingProduct.images : ["https://via.placeholder.com/300"];
        }

        const updatedData: any = {};
        if (req.body.name) updatedData.name = req.body.name;
        if (req.body.description !== undefined) updatedData.description = req.body.description;
        if (req.body.price !== undefined) updatedData.price = Number(req.body.price);
        if (req.body.stock !== undefined) updatedData.stock = Number(req.body.stock);
        if (req.body.category) updatedData.category = req.body.category;
        if (req.body.isFeatured !== undefined) updatedData.isFeatured = req.body.isFeatured === "true" || req.body.isFeatured === true;
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

        if(!product){
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        if(product.images && product.images.length > 0){
            const deletePromises = product.images.map((imageUrl: string)=>{
                const publicIdMatch = imageUrl.match(/\/v\d+\/(.+)\.[a-z]+$/);
                const publicId = publicIdMatch ? publicIdMatch[1] : null;
                if(publicId){
                    return cloudinary.uploader.destroy(publicId);
                }
                return Promise.resolve();
            })
            await Promise.all(deletePromises)
        }

        await Product.findByIdAndDelete(req.params.id)
        res.json({ success: true, message: "Product deleted successfully" })

    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message })
    }
}