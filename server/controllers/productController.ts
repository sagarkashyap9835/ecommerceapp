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

        // सुनिश्चित करें कि यह हमेशा एक Array हो
        if (!Array.isArray(sizes)) {
            sizes = [sizes];
        }

        // 2. इमेजेस को हैंडल करना (Multer से आने वाली फाइल्स)
        const files = req.files as Express.Multer.File[] | undefined;

        // वैलिडेशन: अगर कोई फाइल अपलोड नहीं हुई या एरे खाली है
        if (!files || files.length === 0) {
             res.status(400).json({
                success: false,
                message: "At least one image is required"
            });
            return;
        }

        // 3. सभी इमेजेस को Cloudinary पर अपलोड करना
        const uploadPromises = files.map(async (file) => {
            // आपका Cloudinary अपलोड लॉजिक यहाँ आएगा
            // const result = await cloudinary.uploader.upload(file.path);
            // return result.secure_url;
            return "cloudinary_uploaded_url_placeholder"; 
        });
        
        const imageUrls = await Promise.all(uploadPromises);

        // 4. प्रोडक्ट डेटा तैयार करना
        const productData = {
            ...req.body,
            sizes: sizes,
            images: imageUrls
        };

        // 5. डेटाबेस में सेव करना
        // const newProduct = await Product.create(productData);

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            // data: newProduct
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
        const { id } = req.params; // रूट से प्रोडक्ट ID निकालना (/api/products/:id)

        // 1. चेक करें कि क्या प्रोडक्ट डेटाबेस में मौजूद है
        // const existingProduct = await Product.findById(id);
        // if (!existingProduct) {
        //     res.status(404).json({ success: false, message: "Product not found" });
        //     return;
        // }

        // 2. Sizes को हैंडल और पार्स करना (अगर रिक्वेस्ट में sizes भेजा गया है)
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

        // 3. इमेजेस को हैंडल करना (Multer से आने वाली नई फाइल्स)
        const files = req.files as Express.Multer.File[] | undefined;
        let updatedImages: string[] = [];

        // अगर यूजर ने नई इमेजेस अपलोड की हैं
        if (files && files.length > 0) {
            const uploadPromises = files.map(async (file) => {
                // आपका Cloudinary अपलोड लॉजिक यहाँ आएगा
                return "new_cloudinary_uploaded_url"; 
            });
            updatedImages = await Promise.all(uploadPromises);
        } else {
            // अगर कोई नई इमेज नहीं आई, तो फ्रंटएंड से भेजी गई पुरानी इमेजेस को रखें
            // (यह तब काम आता है जब यूजर कुछ इमेजेस डिलीट या रिटेन करता है)
            if (typeof req.body.images === "string") {
                updatedImages = [req.body.images];
            } else if (Array.isArray(req.body.images)) {
                updatedImages = req.body.images;
            } else {
                // अगर डेटाबेस में मौजूद पुरानी इमेज रखनी हैं:
                // updatedImages = existingProduct.images; 
            }
        }

        // 4. वैलिडेशन: अपडेट होने के बाद भी कम से कम एक इमेज होनी जरूरी है
        if (!updatedImages || updatedImages.length === 0) {
            res.status(400).json({
                success: false,
                message: "At least one image is required for the product"
            });
            return;
        }

        // 5. अपडेटेड डेटा तैयार करना
        const updatedData: any = {
            ...req.body,
            images: updatedImages
        };

        // अगर sizes भेजे गए थे, तभी उन्हें ऑब्जेक्ट में जोड़ें
        if (sizes !== undefined) {
            updatedData.sizes = sizes;
        }

        // 6. डेटाबेस में अपडेट करना
        // const updatedProduct = await Product.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            // data: updatedProduct
            data: updatedData // टेस्टिंग के लिए भेजा गया डेटा
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
            const deletePromises = product.images.map((imageUrl)=>{
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