package com.localseller.pos.data

object SampleData {
    val initialCategories = listOf(
        "Daily Essentials",
        "Fresh Produce",
        "Bakery & Dairy",
        "Snacks & Beverages",
        "Household & Personal Care",
        "Packaged Foods"
    )

    val initialProducts = listOf(
        Product(
            id = "prod-1",
            name = "Aashirvaad Superior MP Sharbati Atta (5 kg)",
            price = 285.0,
            costPrice = 245.0,
            stock = 24,
            minStockAlert = 6,
            unit = "bag",
            category = "Daily Essentials",
            barcode = "8901030382012",
            image = "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80",
            isFeatured = true,
            taxRate = 0.0
        ),
        Product(
            id = "prod-2",
            name = "Tata Salt Iodized Crystal Salt (1 kg)",
            price = 28.0,
            costPrice = 22.0,
            stock = 45,
            minStockAlert = 10,
            unit = "packet",
            category = "Daily Essentials",
            barcode = "8901058852375",
            image = "https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?auto=format&fit=crop&w=400&q=80",
            isFeatured = false,
            taxRate = 0.0
        ),
        Product(
            id = "prod-3",
            name = "Fortune Sunlite Refined Sunflower Oil (1 L)",
            price = 145.0,
            costPrice = 126.0,
            stock = 18,
            minStockAlert = 5,
            unit = "pouch",
            category = "Daily Essentials",
            barcode = "8906007281014",
            image = "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80",
            isFeatured = true,
            taxRate = 5.0
        ),
        Product(
            id = "prod-4",
            name = "Fresh Red Onions (Nashik Grade-A) (1 kg)",
            price = 38.0,
            costPrice = 28.0,
            stock = 60,
            minStockAlert = 15,
            unit = "kg",
            category = "Fresh Produce",
            barcode = "200000000004",
            image = "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=400&q=80",
            isFeatured = true,
            taxRate = 0.0
        ),
        Product(
            id = "prod-5",
            name = "Farm Fresh Vine Tomatoes (1 kg)",
            price = 42.0,
            costPrice = 30.0,
            stock = 35,
            minStockAlert = 10,
            unit = "kg",
            category = "Fresh Produce",
            barcode = "200000000005",
            image = "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80",
            isFeatured = false,
            taxRate = 0.0
        ),
        Product(
            id = "prod-6",
            name = "Amul Taaza Homogenised Toned Milk (500 ml)",
            price = 28.0,
            costPrice = 24.5,
            stock = 32,
            minStockAlert = 8,
            unit = "pouch",
            category = "Bakery & Dairy",
            barcode = "8901262010052",
            image = "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80",
            isFeatured = true,
            taxRate = 0.0
        ),
        Product(
            id = "prod-7",
            name = "Britannia 100% Whole Wheat Brown Bread (400 g)",
            price = 45.0,
            costPrice = 36.0,
            stock = 14,
            minStockAlert = 4,
            unit = "loaf",
            category = "Bakery & Dairy",
            barcode = "8901063012085",
            image = "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80",
            isFeatured = false,
            taxRate = 5.0
        ),
        Product(
            id = "prod-8",
            name = "Maggi 2-Minute Masala Noodles (4-Pack, 280 g)",
            price = 56.0,
            costPrice = 46.0,
            stock = 40,
            minStockAlert = 10,
            unit = "pack",
            category = "Packaged Foods",
            barcode = "8901058863210",
            image = "https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=400&q=80",
            isFeatured = true,
            taxRate = 12.0
        ),
        Product(
            id = "prod-9",
            name = "Lay's India's Magic Masala Potato Chips (50 g)",
            price = 20.0,
            costPrice = 16.0,
            stock = 50,
            minStockAlert = 12,
            unit = "packet",
            category = "Snacks & Beverages",
            barcode = "8901491101824",
            image = "https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=400&q=80",
            isFeatured = false,
            taxRate = 12.0
        ),
        Product(
            id = "prod-10",
            name = "Dettol Original Germ Protection Bathing Soap (125 g)",
            price = 55.0,
            costPrice = 44.0,
            stock = 25,
            minStockAlert = 6,
            unit = "bar",
            category = "Household & Personal Care",
            barcode = "8901396112028",
            image = "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&w=400&q=80",
            isFeatured = false,
            taxRate = 18.0
        )
    )

    val subscriptionPlans = listOf(
        SubscriptionPlan(
            id = "monthly_starter",
            name = "Starter Merchant",
            price = 499.0,
            period = "month",
            features = listOf(
                "Up to 2,000 monthly sales receipts",
                "Real-time offline POS billing",
                "Barcode camera scanner integration",
                "Thermal receipt printing & WhatsApp share",
                "Standard inventory & stock alerts"
            ),
            isPopular = false,
            badgeText = "Best for Single Register"
        ),
        SubscriptionPlan(
            id = "quarterly_growth",
            name = "Growth Pro",
            price = 1299.0,
            period = "quarter",
            features = listOf(
                "Unlimited monthly sales & receipts",
                "Multi-counter sync & cash drawer logs",
                "Customer display showcase mode",
                "Custom categories & supplier directory",
                "Priority 24/7 phone & WhatsApp support"
            ),
            isPopular = true,
            badgeText = "Most Popular • 15% Off"
        ),
        SubscriptionPlan(
            id = "annual_enterprise",
            name = "Marketplace Enterprise",
            price = 4499.0,
            period = "year",
            features = listOf(
                "Everything in Growth Pro unlimited",
                "Google Play Store published private APK",
                "Custom shop branded receipts & UPI standee",
                "Dedicated store database backups",
                "Yearly GST & tax accounting summaries"
            ),
            isPopular = false,
            badgeText = "Maximum Savings"
        )
    )
}
