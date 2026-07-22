import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import ProductModel from "./src/schema/Product.model";
import { ProductCollection, ProductStatus } from "./src/libs/enums/product.enum";

// ⚠️ TUZATILDI: avval bu yerda o'zim chizgan abstrakt ikonkalar bo'lgan edi.
// Endi har bir toifa uchun HAQIQIY, tekshirilgan fotosurat — Unsplash'ning
// barqaror CDN havolasi orqali to'g'ridan-to'g'ri ulangan (hotlink).
// Har birining "Free to use under the Unsplash License" ekanligi alohida
// tasdiqlangan — tijorat loyihalarida ham erkin, litsenziyasiz ishlatish
// mumkin.
const CATEGORY_IMAGE: Record<string, string> = {
    [ProductCollection.LAPTOPS]: "https://images.unsplash.com/photo-1675120070126-76e33dd09e01?w=1200&q=80&fm=jpg&fit=crop&auto=format",
    [ProductCollection.PC]: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=1200&q=80&fm=jpg&fit=crop&auto=format",
    [ProductCollection.ACCESSORIES]: "https://images.unsplash.com/photo-1505751104546-4b63c93054b1?w=1200&q=80&fm=jpg&fit=crop&auto=format",
    [ProductCollection.MACBOOKS]: "https://images.unsplash.com/photo-1544281679-a59fb2359715?w=1200&q=80&fm=jpg&fit=crop&auto=format",
    [ProductCollection.SMARTWATCHES]: "https://images.unsplash.com/photo-1722153105551-cfea928e80de?w=1200&q=80&fm=jpg&fit=crop&auto=format",
    [ProductCollection.OTHERS]: "https://images.unsplash.com/photo-1542483381-41a479b1fb88?w=1200&q=80&fm=jpg&fit=crop&auto=format",
    [ProductCollection.TELEPHONE]: "https://images.unsplash.com/photo-1519326882834-04c334752f58?w=1200&q=80&fm=jpg&fit=crop&auto=format",
};

const IMG = (cat: ProductCollection) => [CATEGORY_IMAGE[cat]];

interface SeedProduct {
    productCollection: ProductCollection;
    productName: string;
    productPrice: number;
    productLeftCount: number;
    productBrand: string;
    productMemory?: number;
    productRam?: number;
    productDesc: string;
    productImages: string[];
    productViews: number;
    productLikes: number;
    productRating: number;
    productReviewCount: number;
}

const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const products: SeedProduct[] = [
    // ───────────── LAPTOPS ─────────────
    {
        productCollection: ProductCollection.LAPTOPS,
        productName: "XPS 15 9530",
        productPrice: 1899,
        productLeftCount: 14,
        productBrand: "DELL",
        productRam: 16,
        productMemory: 512,
        productDesc: "15.6\" OLED display, Intel Core i7-13700H, RTX 4050 graphics. Built for creators and professionals who need power on the go.",
        productImages: IMG(ProductCollection.LAPTOPS),
        productViews: 342, productLikes: 58, productRating: 4.6, productReviewCount: 27,
    },
    {
        productCollection: ProductCollection.LAPTOPS,
        productName: "Spectre x360 14",
        productPrice: 1649,
        productLeftCount: 9,
        productBrand: "HP",
        productRam: 16,
        productMemory: 1024,
        productDesc: "Convertible 2-in-1 laptop with a stunning 3K2K OLED touchscreen and all-day battery life.",
        productImages: IMG(ProductCollection.LAPTOPS),
        productViews: 218, productLikes: 41, productRating: 4.4, productReviewCount: 19,
    },
    {
        productCollection: ProductCollection.LAPTOPS,
        productName: "ThinkPad X1 Carbon Gen 11",
        productPrice: 2199,
        productLeftCount: 6,
        productBrand: "LENOVO",
        productRam: 32,
        productMemory: 1024,
        productDesc: "Ultra-light business laptop with a MIL-SPEC tested carbon-fiber chassis and legendary keyboard.",
        productImages: IMG(ProductCollection.LAPTOPS),
        productViews: 401, productLikes: 76, productRating: 4.8, productReviewCount: 34,
    },
    {
        productCollection: ProductCollection.LAPTOPS,
        productName: "ROG Zephyrus G14",
        productPrice: 1799,
        productLeftCount: 11,
        productBrand: "ASUS",
        productRam: 16,
        productMemory: 512,
        productDesc: "Compact gaming powerhouse with AMD Ryzen 9 and RTX 4060, featuring an AniMe Matrix LED lid.",
        productImages: IMG(ProductCollection.LAPTOPS),
        productViews: 512, productLikes: 93, productRating: 4.7, productReviewCount: 45,
    },
    {
        productCollection: ProductCollection.LAPTOPS,
        productName: "Swift 3 OLED",
        productPrice: 899,
        productLeftCount: 22,
        productBrand: "ACER",
        productRam: 8,
        productMemory: 256,
        productDesc: "Affordable everyday laptop with a vibrant OLED display, perfect for students and casual use.",
        productImages: IMG(ProductCollection.LAPTOPS),
        productViews: 176, productLikes: 22, productRating: 4.1, productReviewCount: 12,
    },

    // ───────────── PC ─────────────
    {
        productCollection: ProductCollection.PC,
        productName: "Custom Gaming Tower RTX 4070",
        productPrice: 2299,
        productLeftCount: 7,
        productBrand: "CUSTOM BUILD",
        productRam: 32,
        productMemory: 1024,
        productDesc: "Pre-built gaming desktop with RTX 4070, Ryzen 7 7800X3D, and RGB-lit tempered glass case.",
        productImages: IMG(ProductCollection.PC),
        productViews: 289, productLikes: 61, productRating: 4.7, productReviewCount: 28,
    },
    {
        productCollection: ProductCollection.PC,
        productName: "Trace 5 MR",
        productPrice: 1799,
        productLeftCount: 13,
        productBrand: "IBUYPOWER",
        productRam: 16,
        productMemory: 512,
        productDesc: "Compact micro-ATX gaming PC with RTX 4060 Ti, tuned for 1440p esports performance.",
        productImages: IMG(ProductCollection.PC),
        productViews: 154, productLikes: 19, productRating: 4.2, productReviewCount: 8,
    },
    {
        productCollection: ProductCollection.PC,
        productName: "Gamer Xtreme VR",
        productPrice: 1599,
        productLeftCount: 16,
        productBrand: "CYBERPOWERPC",
        productRam: 16,
        productMemory: 1024,
        productDesc: "VR-ready desktop with liquid cooling and tool-less side panel for easy upgrades.",
        productImages: IMG(ProductCollection.PC),
        productViews: 203, productLikes: 33, productRating: 4.3, productReviewCount: 15,
    },
    {
        productCollection: ProductCollection.PC,
        productName: "Vengeance i7300",
        productPrice: 3199,
        productLeftCount: 4,
        productBrand: "CORSAIR",
        productRam: 32,
        productMemory: 2048,
        productDesc: "Flagship desktop with RTX 4080 SUPER and factory-tuned iCUE lighting ecosystem.",
        productImages: IMG(ProductCollection.PC),
        productViews: 178, productLikes: 47, productRating: 4.9, productReviewCount: 21,
    },
    {
        productCollection: ProductCollection.PC,
        productName: "Player Two",
        productPrice: 1399,
        productLeftCount: 18,
        productBrand: "NZXT",
        productRam: 16,
        productMemory: 512,
        productDesc: "Minimalist all-white gaming PC designed for streamers, with clean internal cable routing.",
        productImages: IMG(ProductCollection.PC),
        productViews: 132, productLikes: 24, productRating: 4.4, productReviewCount: 11,
    },

    // ───────────── ACCESSORIES ─────────────
    {
        productCollection: ProductCollection.ACCESSORIES,
        productName: "MX Master 3S",
        productPrice: 99,
        productLeftCount: 54,
        productBrand: "LOGITECH",
        productDesc: "Ergonomic wireless mouse with an 8K DPI sensor and ultra-quiet clicks.",
        productImages: IMG(ProductCollection.ACCESSORIES),
        productViews: 620, productLikes: 140, productRating: 4.8, productReviewCount: 88,
    },
    {
        productCollection: ProductCollection.ACCESSORIES,
        productName: "635 GaN Charger 65W",
        productPrice: 39,
        productLeftCount: 76,
        productBrand: "ANKER",
        productDesc: "Compact triple-port fast charger, small enough to fit any travel bag.",
        productImages: IMG(ProductCollection.ACCESSORIES),
        productViews: 305, productLikes: 62, productRating: 4.6, productReviewCount: 41,
    },
    {
        productCollection: ProductCollection.ACCESSORIES,
        productName: "BlackWidow V4",
        productPrice: 169,
        productLeftCount: 29,
        productBrand: "RAZER",
        productDesc: "Mechanical gaming keyboard with hot-swappable switches and per-key RGB lighting.",
        productImages: IMG(ProductCollection.ACCESSORIES),
        productViews: 410, productLikes: 88, productRating: 4.7, productReviewCount: 53,
    },
    {
        productCollection: ProductCollection.ACCESSORIES,
        productName: "Arctis Nova Pro",
        productPrice: 349,
        productLeftCount: 12,
        productBrand: "STEELSERIES",
        productDesc: "Premium wireless gaming headset with active noise cancellation and a hot-swap battery system.",
        productImages: IMG(ProductCollection.ACCESSORIES),
        productViews: 267, productLikes: 55, productRating: 4.5, productReviewCount: 30,
    },
    {
        productCollection: ProductCollection.ACCESSORIES,
        productName: "Connect Pro 7-in-1 Hub",
        productPrice: 59,
        productLeftCount: 41,
        productBrand: "BELKIN",
        productDesc: "USB-C hub with HDMI, SD card reader, and 100W pass-through charging.",
        productImages: IMG(ProductCollection.ACCESSORIES),
        productViews: 148, productLikes: 21, productRating: 4.3, productReviewCount: 9,
    },

    // ───────────── MACBOOKS ─────────────
    {
        productCollection: ProductCollection.MACBOOKS,
        productName: "MacBook Air M2",
        productPrice: 1099,
        productLeftCount: 20,
        productBrand: "APPLE",
        productMemory: 256,
        productDesc: "Redesigned MacBook Air with the M2 chip, fanless design, and up to 18 hours of battery life.",
        productImages: IMG(ProductCollection.MACBOOKS),
        productViews: 588, productLikes: 130, productRating: 4.8, productReviewCount: 74,
    },
    {
        productCollection: ProductCollection.MACBOOKS,
        productName: "MacBook Air M3",
        productPrice: 1299,
        productLeftCount: 17,
        productBrand: "APPLE",
        productMemory: 512,
        productDesc: "The latest Air, now with the M3 chip for even faster performance in the same thin design.",
        productImages: IMG(ProductCollection.MACBOOKS),
        productViews: 493, productLikes: 108, productRating: 4.8, productReviewCount: 61,
    },
    {
        productCollection: ProductCollection.MACBOOKS,
        productName: "MacBook Pro 14\" M3",
        productPrice: 1999,
        productLeftCount: 10,
        productBrand: "APPLE",
        productMemory: 512,
        productDesc: "Liquid Retina XDR display and M3 chip bring pro-level performance to a portable size.",
        productImages: IMG(ProductCollection.MACBOOKS),
        productViews: 372, productLikes: 84, productRating: 4.9, productReviewCount: 40,
    },
    {
        productCollection: ProductCollection.MACBOOKS,
        productName: "MacBook Pro 16\" M3 Max",
        productPrice: 3499,
        productLeftCount: 5,
        productBrand: "APPLE",
        productMemory: 1024,
        productDesc: "The most powerful MacBook ever, built for the most demanding professional workflows.",
        productImages: IMG(ProductCollection.MACBOOKS),
        productViews: 301, productLikes: 97, productRating: 4.9, productReviewCount: 52,
    },
    {
        productCollection: ProductCollection.MACBOOKS,
        productName: "MacBook Pro 13\" M2",
        productPrice: 1299,
        productLeftCount: 15,
        productBrand: "APPLE",
        productMemory: 256,
        productDesc: "Compact pro laptop with the M2 chip and the longest battery life of any Mac.",
        productImages: IMG(ProductCollection.MACBOOKS),
        productViews: 245, productLikes: 49, productRating: 4.5, productReviewCount: 23,
    },

    // ───────────── SMARTWATCHES ─────────────
    {
        productCollection: ProductCollection.SMARTWATCHES,
        productName: "Watch Series 9",
        productPrice: 399,
        productLeftCount: 33,
        productBrand: "APPLE",
        productDesc: "Brighter display, S9 chip, and the new double-tap gesture for hands-free control.",
        productImages: IMG(ProductCollection.SMARTWATCHES),
        productViews: 456, productLikes: 101, productRating: 4.7, productReviewCount: 67,
    },
    {
        productCollection: ProductCollection.SMARTWATCHES,
        productName: "Galaxy Watch 6",
        productPrice: 329,
        productLeftCount: 28,
        productBrand: "SAMSUNG",
        productDesc: "Sleep coaching, body composition analysis, and a bigger, brighter always-on display.",
        productImages: IMG(ProductCollection.SMARTWATCHES),
        productViews: 298, productLikes: 54, productRating: 4.5, productReviewCount: 31,
    },
    {
        productCollection: ProductCollection.SMARTWATCHES,
        productName: "Venu 3",
        productPrice: 449,
        productLeftCount: 19,
        productBrand: "GARMIN",
        productDesc: "Up to 14 days of battery life with built-in speaker/mic for calls and voice assistants.",
        productImages: IMG(ProductCollection.SMARTWATCHES),
        productViews: 187, productLikes: 29, productRating: 4.6, productReviewCount: 18,
    },
    {
        productCollection: ProductCollection.SMARTWATCHES,
        productName: "Sense 2",
        productPrice: 249,
        productLeftCount: 24,
        productBrand: "FITBIT",
        productDesc: "Continuous stress management with an EDA sensor and 6-month premium membership included.",
        productImages: IMG(ProductCollection.SMARTWATCHES),
        productViews: 142, productLikes: 20, productRating: 4.2, productReviewCount: 10,
    },
    {
        productCollection: ProductCollection.SMARTWATCHES,
        productName: "GTR 4",
        productPrice: 199,
        productLeftCount: 37,
        productBrand: "AMAZFIT",
        productDesc: "Dual-band GPS and 150+ sports modes at a fraction of the price of the competition.",
        productImages: IMG(ProductCollection.SMARTWATCHES),
        productViews: 96, productLikes: 12, productRating: 4.0, productReviewCount: 6,
    },

    // ───────────── OTHERS ─────────────
    {
        productCollection: ProductCollection.OTHERS,
        productName: "Mini 4 Pro",
        productPrice: 759,
        productLeftCount: 8,
        productBrand: "DJI",
        productDesc: "Sub-249g drone with omnidirectional obstacle sensing and 4K/60fps HDR video.",
        productImages: IMG(ProductCollection.OTHERS),
        productViews: 233, productLikes: 51, productRating: 4.8, productReviewCount: 26,
    },
    {
        productCollection: ProductCollection.OTHERS,
        productName: "Charge 5",
        productPrice: 179,
        productLeftCount: 46,
        productBrand: "JBL",
        productDesc: "Portable waterproof Bluetooth speaker with powerful bass and a built-in power bank.",
        productImages: IMG(ProductCollection.OTHERS),
        productViews: 389, productLikes: 79, productRating: 4.6, productReviewCount: 48,
    },
    {
        productCollection: ProductCollection.OTHERS,
        productName: "Nebula Capsule 3",
        productPrice: 329,
        productLeftCount: 14,
        productBrand: "ANKER",
        productDesc: "Pocket-sized 1080p smart projector powered by Google TV, with 100 ANSI lumens brightness.",
        productImages: IMG(ProductCollection.OTHERS),
        productViews: 118, productLikes: 17, productRating: 4.3, productReviewCount: 7,
    },
    {
        productCollection: ProductCollection.OTHERS,
        productName: "Quest 3",
        productPrice: 499,
        productLeftCount: 12,
        productBrand: "META",
        productDesc: "Mixed reality headset with high-resolution passthrough and next-gen Snapdragon chip.",
        productImages: IMG(ProductCollection.OTHERS),
        productViews: 512, productLikes: 122, productRating: 4.7, productReviewCount: 65,
    },
    {
        productCollection: ProductCollection.OTHERS,
        productName: "Paperwhite (11th Gen)",
        productPrice: 149,
        productLeftCount: 39,
        productBrand: "AMAZON",
        productDesc: "Waterproof e-reader with a glare-free 6.8\" display and weeks of battery life.",
        productImages: IMG(ProductCollection.OTHERS),
        productViews: 267, productLikes: 43, productRating: 4.7, productReviewCount: 35,
    },

    // ───────────── TELEPHONE ─────────────
    {
        productCollection: ProductCollection.TELEPHONE,
        productName: "iPhone 15 Pro",
        productPrice: 999,
        productLeftCount: 25,
        productBrand: "APPLE",
        productRam: 8,
        productMemory: 256,
        productDesc: "Titanium design, A17 Pro chip, and the new Action button for ultimate customization.",
        productImages: IMG(ProductCollection.TELEPHONE),
        productViews: 743, productLikes: 189, productRating: 4.8, productReviewCount: 112,
    },
    {
        productCollection: ProductCollection.TELEPHONE,
        productName: "Galaxy S24 Ultra",
        productPrice: 1299,
        productLeftCount: 18,
        productBrand: "SAMSUNG",
        productRam: 12,
        productMemory: 512,
        productDesc: "Built-in S Pen, 200MP camera, and Galaxy AI features baked right into the OS.",
        productImages: IMG(ProductCollection.TELEPHONE),
        productViews: 621, productLikes: 152, productRating: 4.7, productReviewCount: 94,
    },
    {
        productCollection: ProductCollection.TELEPHONE,
        productName: "Pixel 8 Pro",
        productPrice: 999,
        productLeftCount: 16,
        productBrand: "GOOGLE",
        productRam: 12,
        productMemory: 256,
        productDesc: "Google Tensor G3 chip with the best-in-class computational photography and 7 years of updates.",
        productImages: IMG(ProductCollection.TELEPHONE),
        productViews: 334, productLikes: 71, productRating: 4.6, productReviewCount: 44,
    },
    {
        productCollection: ProductCollection.TELEPHONE,
        productName: "14 Pro",
        productPrice: 899,
        productLeftCount: 21,
        productBrand: "XIAOMI",
        productRam: 16,
        productMemory: 512,
        productDesc: "Leica-tuned cameras and a 120Hz LTPO display in a compact, premium body.",
        productImages: IMG(ProductCollection.TELEPHONE),
        productViews: 201, productLikes: 38, productRating: 4.4, productReviewCount: 22,
    },
    {
        productCollection: ProductCollection.TELEPHONE,
        productName: "12",
        productPrice: 799,
        productLeftCount: 23,
        productBrand: "ONEPLUS",
        productRam: 16,
        productMemory: 256,
        productDesc: "Snapdragon 8 Gen 3 flagship with 100W fast charging and a Hasselblad-tuned camera system.",
        productImages: IMG(ProductCollection.TELEPHONE),
        productViews: 176, productLikes: 30, productRating: 4.3, productReviewCount: 17,
    },
];

async function seed() {
    const uri = process.env.MONGO_URL as string;
    if (!uri) {
        console.error("❌ .env faylida MONGO_URL topilmadi!");
        process.exit(1);
    }

    await mongoose.connect(uri, {});
    console.log("✅ MongoDB ulandi");

    let created = 0;
    let skipped = 0;

    for (const p of products) {
        try {
            const exists = await ProductModel.findOne({
                productName: p.productName,
                productMemory: p.productMemory ?? null,
                productRam: p.productRam ?? null,
            });

            if (exists) {
                console.log(`⏭  O'tkazib yuborildi (allaqachon bor): ${p.productBrand} ${p.productName}`);
                skipped++;
                continue;
            }

            await ProductModel.create({
                ...p,
                productStatus: ProductStatus.PROCESS,
            });
            console.log(`✅ Yaratildi: [${p.productCollection}] ${p.productBrand} ${p.productName}`);
            created++;
        } catch (err) {
            console.error(`❌ Xato (${p.productName}):`, err);
        }
    }

    console.log(`\n🎉 Tugadi! Yaratildi: ${created}, o'tkazib yuborildi: ${skipped}, jami: ${products.length}`);
    await mongoose.disconnect();
    process.exit(0);
}

seed().catch((err) => {
    console.error("❌ Seed umumiy xatosi:", err);
    process.exit(1);
});