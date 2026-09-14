package com.localseller.pos.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.localseller.pos.data.CartItem
import com.localseller.pos.data.Product
import com.localseller.pos.ui.components.PaymentCheckoutDialog
import com.localseller.pos.ui.theme.*
import com.localseller.pos.viewmodel.ShopViewModel

@Composable
fun PosScreen(
    viewModel: ShopViewModel
) {
    val products by viewModel.products.collectAsState()
    val categories by viewModel.categories.collectAsState()
    val cart by viewModel.cart.collectAsState()
    val settings by viewModel.settings.collectAsState()

    var searchQuery by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf("All") }
    var isCheckoutOpen by remember { mutableStateOf(false) }

    val filteredProducts = remember(products, searchQuery, selectedCategory) {
        products.filter { product ->
            val matchesCategory = selectedCategory == "All" || product.category == selectedCategory
            val matchesSearch = searchQuery.isBlank() ||
                    product.name.contains(searchQuery, ignoreCase = true) ||
                    product.barcode.contains(searchQuery, ignoreCase = true)
            matchesCategory && matchesSearch
        }
    }

    val cartTotal = cart.sumOf { it.lineGrandTotal }
    val cartItemCount = cart.sumOf { it.quantity }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Stone100)
    ) {
        // Search & Barcode Bar
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 12.dp, vertical = 8.dp),
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White)
        ) {
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                placeholder = { Text("Search product name, category, or barcode...") },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                trailingIcon = {
                    if (searchQuery.isNotEmpty()) {
                        IconButton(onClick = { searchQuery = "" }) {
                            Icon(Icons.Default.Clear, contentDescription = "Clear")
                        }
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(4.dp),
                shape = RoundedCornerShape(8.dp),
                singleLine = true
            )
        }

        // Category Filter Chips
        LazyRow(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 12.dp),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            item {
                FilterChip(
                    selected = selectedCategory == "All",
                    onClick = { selectedCategory = "All" },
                    label = { Text("All") },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = Amber900,
                        selectedLabelColor = Color.White
                    )
                )
            }
            items(categories) { cat ->
                FilterChip(
                    selected = selectedCategory == cat,
                    onClick = { selectedCategory = cat },
                    label = { Text(cat) },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = Amber900,
                        selectedLabelColor = Color.White
                    )
                )
            }
        }

        // Product Catalog List
        LazyColumn(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .padding(horizontal = 12.dp, vertical = 6.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(filteredProducts) { product ->
                val inCart = cart.find { it.product.id == product.id }
                ProductPosRow(
                    product = product,
                    currencySymbol = settings.currencySymbol,
                    quantityInCart = inCart?.quantity ?: 0,
                    onAdd = { viewModel.addToCart(product) },
                    onMinus = { viewModel.decrementFromCart(product) }
                )
            }
        }

        // Sticky Bottom Cart Bar
        if (cart.isNotEmpty()) {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(12.dp),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Amber900),
                elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "$cartItemCount ${if (cartItemCount == 1) "item" else "items"} in cart",
                            fontSize = 12.sp,
                            color = Amber100
                        )
                        Text(
                            text = "${settings.currencySymbol}%.2f".format(cartTotal),
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    }

                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        IconButton(
                            onClick = { viewModel.clearCart() }
                        ) {
                            Icon(Icons.Default.DeleteOutline, contentDescription = "Clear", tint = Color.White)
                        }

                        Button(
                            onClick = { isCheckoutOpen = true },
                            colors = ButtonDefaults.buttonColors(containerColor = Color.White),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Text(
                                text = "Charge",
                                fontWeight = FontWeight.Bold,
                                color = Amber900
                            )
                        }
                    }
                }
            }
        }
    }

    // Checkout Dialog
    if (isCheckoutOpen) {
        PaymentCheckoutDialog(
            cartItems = cart,
            settings = settings,
            onDismiss = { isCheckoutOpen = false },
            onConfirmSale = { method, custName, custPhone, discountPercent ->
                viewModel.completeSale(method, custName, custPhone, discountPercent)
                isCheckoutOpen = false
            }
        )
    }
}

@Composable
fun ProductPosRow(
    product: Product,
    currencySymbol: String,
    quantityInCart: Int,
    onAdd: () -> Unit,
    onMinus: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(10.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = product.name,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Stone900,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )
                Spacer(modifier = Modifier.height(2.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = "$currencySymbol${product.price} / ${product.unit}",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        color = Amber900
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Stock: ${product.stock}",
                        fontSize = 11.sp,
                        color = if (product.stock <= product.minStockAlert) Color.Red else Stone700
                    )
                }
            }

            // Cart Stepper
            if (quantityInCart > 0) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    IconButton(
                        onClick = onMinus,
                        modifier = Modifier.size(32.dp)
                    ) {
                        Icon(Icons.Default.RemoveCircleOutline, contentDescription = "Decrease", tint = Amber900)
                    }
                    Text(
                        text = "$quantityInCart",
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp,
                        color = Amber900
                    )
                    IconButton(
                        onClick = onAdd,
                        modifier = Modifier.size(32.dp)
                    ) {
                        Icon(Icons.Default.AddCircle, contentDescription = "Increase", tint = Amber900)
                    }
                }
            } else {
                Button(
                    onClick = onAdd,
                    colors = ButtonDefaults.buttonColors(containerColor = Amber100),
                    shape = RoundedCornerShape(8.dp),
                    contentPadding = PaddingValues(horizontal = 14.dp, vertical = 6.dp)
                ) {
                    Text(text = "+ Add", color = Amber900, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                }
            }
        }
    }
}
