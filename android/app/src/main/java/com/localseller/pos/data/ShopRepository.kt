package com.localseller.pos.data

import android.content.Context
import android.content.SharedPreferences
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class ShopRepository(context: Context) {
    private val prefs: SharedPreferences =
        context.getSharedPreferences("local_seller_prefs", Context.MODE_PRIVATE)
    private val gson = Gson()

    private val _products = MutableStateFlow<List<Product>>(loadProducts())
    val products: StateFlow<List<Product>> = _products.asStateFlow()

    private val _orders = MutableStateFlow<List<Order>>(loadOrders())
    val orders: StateFlow<List<Order>> = _orders.asStateFlow()

    private val _categories = MutableStateFlow<List<String>>(loadCategories())
    val categories: StateFlow<List<String>> = _categories.asStateFlow()

    private val _settings = MutableStateFlow(loadSettings())
    val settings: StateFlow<ShopSettings> = _settings.asStateFlow()

    private val _customerProfile = MutableStateFlow(loadCustomerProfile())
    val customerProfile: StateFlow<CustomerProfile> = _customerProfile.asStateFlow()

    private val _subscription = MutableStateFlow(loadSubscription())
    val subscription: StateFlow<AppSubscription> = _subscription.asStateFlow()

    // Products CRUD
    fun addProduct(product: Product) {
        val updated = listOf(product) + _products.value
        _products.value = updated
        saveProducts(updated)
    }

    fun updateProduct(product: Product) {
        val updated = _products.value.map { if (it.id == product.id) product else it }
        _products.value = updated
        saveProducts(updated)
    }

    fun deleteProduct(productId: String) {
        val updated = _products.value.filter { it.id !== productId }
        _products.value = updated
        saveProducts(updated)
    }

    fun adjustStock(productId: String, delta: Int) {
        val updated = _products.value.map {
            if (it.id == productId) {
                val newStock = (it.stock + delta).coerceAtLeast(0)
                it.copy(stock = newStock)
            } else it
        }
        _products.value = updated
        saveProducts(updated)
    }

    // Categories
    fun addCategory(name: String): Boolean {
        val trimmed = name.trim()
        if (trimmed.isBlank() || _categories.value.any { it.equals(trimmed, ignoreCase = true) }) {
            return false
        }
        val updated = _categories.value + trimmed
        _categories.value = updated
        saveCategories(updated)
        return true
    }

    fun deleteCategory(name: String, fallback: String = "Daily Essentials") {
        val updatedCats = _categories.value.filter { it != name }
        _categories.value = updatedCats
        saveCategories(updatedCats)

        val updatedProducts = _products.value.map {
            if (it.category == name) it.copy(category = fallback) else it
        }
        _products.value = updatedProducts
        saveProducts(updatedProducts)
    }

    // Orders
    fun addOrder(order: Order) {
        val updatedOrders = listOf(order) + _orders.value
        _orders.value = updatedOrders
        saveOrders(updatedOrders)

        // Decrement stock for purchased items
        val updatedProducts = _products.value.map { product ->
            val inCart = order.items.find { it.product.id == product.id }
            if (inCart != null) {
                val newStock = (product.stock - inCart.quantity).coerceAtLeast(0)
                product.copy(stock = newStock)
            } else {
                product
            }
        }
        _products.value = updatedProducts
        saveProducts(updatedProducts)
    }

    // Settings
    fun updateSettings(newSettings: ShopSettings) {
        _settings.value = newSettings
        prefs.edit().putString("shop_settings", gson.toJson(newSettings)).apply()
    }

    fun updateSubscription(newSub: AppSubscription) {
        _subscription.value = newSub
        prefs.edit().putString("app_subscription", gson.toJson(newSub)).apply()
    }

    fun resetCatalog() {
        _products.value = SampleData.initialProducts
        saveProducts(SampleData.initialProducts)
        _categories.value = SampleData.initialCategories
        saveCategories(SampleData.initialCategories)
        _orders.value = emptyList()
        saveOrders(emptyList())
        val defaultSettings = ShopSettings()
        _settings.value = defaultSettings
        updateSettings(defaultSettings)
    }

    // Storage helpers
    private fun loadProducts(): List<Product> {
        val json = prefs.getString("products", null) ?: return SampleData.initialProducts
        return try {
            val type = object : TypeToken<List<Product>>() {}.type
            gson.fromJson(json, type) ?: SampleData.initialProducts
        } catch (e: Exception) {
            SampleData.initialProducts
        }
    }

    private fun saveProducts(list: List<Product>) {
        prefs.edit().putString("products", gson.toJson(list)).apply()
    }

    private fun loadOrders(): List<Order> {
        val json = prefs.getString("orders", null) ?: return emptyList()
        return try {
            val type = object : TypeToken<List<Order>>() {}.type
            gson.fromJson(json, type) ?: emptyList()
        } catch (e: Exception) {
            emptyList()
        }
    }

    private fun saveOrders(list: List<Order>) {
        prefs.edit().putString("orders", gson.toJson(list)).apply()
    }

    private fun loadCategories(): List<String> {
        val json = prefs.getString("categories", null) ?: return SampleData.initialCategories
        return try {
            val type = object : TypeToken<List<String>>() {}.type
            gson.fromJson(json, type) ?: SampleData.initialCategories
        } catch (e: Exception) {
            SampleData.initialCategories
        }
    }

    private fun saveCategories(list: List<String>) {
        prefs.edit().putString("categories", gson.toJson(list)).apply()
    }

    private fun loadSettings(): ShopSettings {
        val json = prefs.getString("shop_settings", null) ?: return ShopSettings()
        return try {
            gson.fromJson(json, ShopSettings::class.java) ?: ShopSettings()
        } catch (e: Exception) {
            ShopSettings()
        }
    }

    private fun loadCustomerProfile(): CustomerProfile {
        val json = prefs.getString("customer_profile", null) ?: return CustomerProfile()
        return try {
            gson.fromJson(json, CustomerProfile::class.java) ?: CustomerProfile()
        } catch (e: Exception) {
            CustomerProfile()
        }
    }

    private fun loadSubscription(): AppSubscription {
        val json = prefs.getString("app_subscription", null) ?: return AppSubscription()
        return try {
            gson.fromJson(json, AppSubscription::class.java) ?: AppSubscription()
        } catch (e: Exception) {
            AppSubscription()
        }
    }
}
