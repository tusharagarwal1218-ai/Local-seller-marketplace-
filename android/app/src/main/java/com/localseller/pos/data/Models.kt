package com.localseller.pos.data

import java.util.UUID

enum class PaymentMethod(val label: String) {
    CASH("Cash"),
    UPI("UPI QR"),
    CARD("Card / POS"),
    STORE_CREDIT("Store Credit")
}

data class Product(
    val id: String = UUID.randomUUID().toString(),
    val name: String,
    val price: Double,
    val costPrice: Double,
    val stock: Int,
    val minStockAlert: Int = 5,
    val unit: String = "piece",
    val category: String = "Daily Essentials",
    val barcode: String = "",
    val image: String = "",
    val isFeatured: Boolean = false,
    val taxRate: Double = 5.0
)

data class CartItem(
    val product: Product,
    val quantity: Int = 1,
    val discountPercent: Double = 0.0
) {
    val lineSubtotal: Double
        get() = product.price * quantity

    val discountAmount: Double
        get() = lineSubtotal * (discountPercent / 100.0)

    val lineTotalAfterDiscount: Double
        get() = lineSubtotal - discountAmount

    val lineTax: Double
        get() = lineTotalAfterDiscount * (product.taxRate / 100.0)

    val lineGrandTotal: Double
        get() = lineTotalAfterDiscount + lineTax
}

data class Order(
    val id: String = UUID.randomUUID().toString(),
    val orderNumber: String = "ORD-${System.currentTimeMillis() % 100000}",
    val items: List<CartItem>,
    val subtotal: Double,
    val taxTotal: Double,
    val discountTotal: Double,
    val grandTotal: Double,
    val paymentMethod: PaymentMethod,
    val paymentStatus: String = "paid",
    val customerName: String = "Walk-in Guest",
    val customerPhone: String = "",
    val timestamp: Long = System.currentTimeMillis(),
    val notes: String = "",
    val cashierId: String = "CASHIER-01"
)

data class ShopSettings(
    val shopName: String = "Neighborhood Corner Store",
    val tagLine: String = "Fresh Groceries, Daily Needs & Local Marketplace",
    val address: String = "Shop No. 4, Sunrise Market Complex, Main Road",
    val phone: String = "+91 98765 43210",
    val email: String = "store@localmarket.in",
    val upiId: String = "localseller@upi",
    val currencySymbol: String = "₹",
    val taxRateDefault: Double = 5.0,
    val receiptFooterNote: String = "Thank you for supporting your neighborhood local business!",
    val lowStockThresholdDefault: Int = 5,
    val enableCustomerDisplay: Boolean = true,
    val enableSoundEffects: Boolean = true
)

data class CustomerProfile(
    val name: String = "Walk-in Customer",
    val phone: String = "+91 98765 00000",
    val address: String = "Apartment 4B, Sunrise Enclave",
    val loyaltyPoints: Int = 120
)

data class SubscriptionPlan(
    val id: String,
    val name: String,
    val price: Double,
    val period: String,
    val features: List<String>,
    val isPopular: Boolean = false,
    val badgeText: String = ""
)

data class AppSubscription(
    val status: String = "trial", // trial, active, expired
    val planId: String = "free_trial",
    val trialEndsAt: Long = System.currentTimeMillis() + (60L * 24 * 60 * 60 * 1000), // 60 days
    val subscribedAt: Long = System.currentTimeMillis(),
    val expiresAt: Long = System.currentTimeMillis() + (60L * 24 * 60 * 60 * 1000),
    val maxMonthlySales: Int = 10000,
    val allowsMultiUser: Boolean = true,
    val allowsAdvancedAnalytics: Boolean = true
)
