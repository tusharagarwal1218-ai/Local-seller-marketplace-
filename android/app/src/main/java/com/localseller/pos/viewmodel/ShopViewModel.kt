package com.localseller.pos.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.localseller.pos.data.CartItem
import com.localseller.pos.data.Order
import com.localseller.pos.data.PaymentMethod
import com.localseller.pos.data.Product
import com.localseller.pos.data.ShopRepository
import com.localseller.pos.data.ShopSettings
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import java.util.UUID

class ShopViewModel(application: Application) : AndroidViewModel(application) {
    private val repository = ShopRepository(application.applicationContext)

    val products = repository.products
    val orders = repository.orders
    val categories = repository.categories
    val settings = repository.settings
    val subscription = repository.subscription

    // Current Cart in POS
    private val _cart = MutableStateFlow<List<CartItem>>(emptyList())
    val cart: StateFlow<List<CartItem>> = _cart.asStateFlow()

    // Active receipt to display
    private val _activeReceiptOrder = MutableStateFlow<Order?>(null)
    val activeReceiptOrder: StateFlow<Order?> = _activeReceiptOrder.asStateFlow()

    // Filter states
    val selectedCategory = MutableStateFlow("All")
    val searchQuery = MutableStateFlow("")

    // Cart operations
    fun addToCart(product: Product) {
        val existing = _cart.value.find { it.product.id == product.id }
        if (existing != null) {
            _cart.value = _cart.value.map {
                if (it.product.id == product.id) it.copy(quantity = it.quantity + 1) else it
            }
        } else {
            _cart.value = _cart.value + CartItem(product = product, quantity = 1)
        }
    }

    fun decrementFromCart(product: Product) {
        val existing = _cart.value.find { it.product.id == product.id } ?: return
        if (existing.quantity > 1) {
            _cart.value = _cart.value.map {
                if (it.product.id == product.id) it.copy(quantity = it.quantity - 1) else it
            }
        } else {
            _cart.value = _cart.value.filter { it.product.id != product.id }
        }
    }

    fun removeFromCart(productId: String) {
        _cart.value = _cart.value.filter { it.product.id != productId }
    }

    fun clearCart() {
        _cart.value = emptyList()
    }

    // Checkout
    fun completeSale(
        paymentMethod: PaymentMethod,
        customerName: String,
        customerPhone: String,
        discountOverallPercent: Double = 0.0
    ): Order? {
        val items = _cart.value
        if (items.isEmpty()) return null

        val subtotal = items.sumOf { it.lineSubtotal }
        val discountTotal = items.sumOf { it.discountAmount } + (subtotal * (discountOverallPercent / 100.0))
        val taxTotal = items.sumOf { it.lineTax }
        val grandTotal = (subtotal - discountTotal + taxTotal).coerceAtLeast(0.0)

        val newOrder = Order(
            id = UUID.randomUUID().toString(),
            orderNumber = "ORD-${(System.currentTimeMillis() % 900000) + 100000}",
            items = items,
            subtotal = subtotal,
            taxTotal = taxTotal,
            discountTotal = discountTotal,
            grandTotal = grandTotal,
            paymentMethod = paymentMethod,
            customerName = customerName.ifBlank { "Walk-in Guest" },
            customerPhone = customerPhone,
            timestamp = System.currentTimeMillis()
        )

        repository.addOrder(newOrder)
        _cart.value = emptyList()
        _activeReceiptOrder.value = newOrder
        return newOrder
    }

    fun dismissReceipt() {
        _activeReceiptOrder.value = null
    }

    fun showReceipt(order: Order) {
        _activeReceiptOrder.value = order
    }

    // Inventory operations
    fun addProduct(product: Product) = repository.addProduct(product)
    fun updateProduct(product: Product) = repository.updateProduct(product)
    fun deleteProduct(productId: String) = repository.deleteProduct(productId)
    fun adjustStock(productId: String, delta: Int) = repository.adjustStock(productId, delta)

    // Category operations
    fun addCategory(name: String): Boolean = repository.addCategory(name)
    fun deleteCategory(name: String) = repository.deleteCategory(name)

    // Settings
    fun updateSettings(newSettings: ShopSettings) = repository.updateSettings(newSettings)
    fun resetCatalog() {
        repository.resetCatalog()
        _cart.value = emptyList()
        _activeReceiptOrder.value = null
    }
}
