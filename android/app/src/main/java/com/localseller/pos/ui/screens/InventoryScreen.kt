package com.localseller.pos.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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
import com.localseller.pos.data.Product
import com.localseller.pos.ui.components.ProductEditDialog
import com.localseller.pos.ui.theme.Amber100
import com.localseller.pos.ui.theme.Amber900
import com.localseller.pos.ui.theme.Stone100
import com.localseller.pos.ui.theme.Stone700
import com.localseller.pos.ui.theme.Stone900
import com.localseller.pos.viewmodel.ShopViewModel

@Composable
fun InventoryScreen(
    viewModel: ShopViewModel
) {
    val products by viewModel.products.collectAsState()
    val categories by viewModel.categories.collectAsState()
    val settings by viewModel.settings.collectAsState()

    var editingProduct by remember { mutableStateOf<Product?>(null) }
    var isAddDialogOpen by remember { mutableStateOf(false) }
    var searchQuery by remember { mutableStateOf("") }

    val filtered = remember(products, searchQuery) {
        if (searchQuery.isBlank()) products else products.filter {
            it.name.contains(searchQuery, ignoreCase = true) ||
            it.category.contains(searchQuery, ignoreCase = true) ||
            it.barcode.contains(searchQuery, ignoreCase = true)
        }
    }

    val lowStockCount = products.count { it.stock <= it.minStockAlert }

    Scaffold(
        floatingActionButton = {
            FloatingActionButton(
                onClick = { isAddDialogOpen = true },
                containerColor = Amber900,
                contentColor = Color.White
            ) {
                Icon(Icons.Default.Add, contentDescription = "Add Product")
            }
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(Stone100)
        ) {
            // Stats Banner
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(12.dp),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceAround
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(text = "Total SKUs", fontSize = 11.sp, color = Stone700)
                        Text(text = "${products.size}", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Stone900)
                    }
                    Divider(modifier = Modifier.height(30.dp).width(1.dp))
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(text = "Low Stock Alert", fontSize = 11.sp, color = Stone700)
                        Text(
                            text = "$lowStockCount",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (lowStockCount > 0) Color(0xFFDC2626) else Color(0xFF059669)
                        )
                    }
                    Divider(modifier = Modifier.height(30.dp).width(1.dp))
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(text = "Inventory Value", fontSize = 11.sp, color = Stone700)
                        val totalVal = products.sumOf { it.price * it.stock }
                        Text(text = "${settings.currencySymbol}%.0f".format(totalVal), fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Amber900)
                    }
                }
            }

            // Search Bar
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                placeholder = { Text("Filter inventory by name or barcode...") },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 12.dp),
                shape = RoundedCornerShape(8.dp),
                singleLine = true
            )

            Spacer(modifier = Modifier.height(8.dp))

            // Products list
            LazyColumn(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .padding(horizontal = 12.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(filtered) { product ->
                    InventoryProductRow(
                        product = product,
                        currencySymbol = settings.currencySymbol,
                        onEdit = { editingProduct = product },
                        onDelete = { viewModel.deleteProduct(product.id) },
                        onAdjustStock = { delta -> viewModel.adjustStock(product.id, delta) }
                    )
                }
            }
        }
    }

    // Add Product Dialog
    if (isAddDialogOpen) {
        ProductEditDialog(
            initialProduct = null,
            categories = categories,
            currencySymbol = settings.currencySymbol,
            onDismiss = { isAddDialogOpen = false },
            onSave = { newProd ->
                viewModel.addProduct(newProd)
                isAddDialogOpen = false
            }
        )
    }

    // Edit Product Dialog
    editingProduct?.let { prod ->
        ProductEditDialog(
            initialProduct = prod,
            categories = categories,
            currencySymbol = settings.currencySymbol,
            onDismiss = { editingProduct = null },
            onSave = { updated ->
                viewModel.updateProduct(updated)
                editingProduct = null
            }
        )
    }
}

@Composable
fun InventoryProductRow(
    product: Product,
    currencySymbol: String,
    onEdit: () -> Unit,
    onDelete: () -> Unit,
    onAdjustStock: (Int) -> Unit
) {
    val isLowStock = product.stock <= product.minStockAlert

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(10.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = product.name,
                        fontWeight = FontWeight.SemiBold,
                        fontSize = 14.sp,
                        color = Stone900,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                    Text(
                        text = "${product.category} • Barcode: ${product.barcode.ifBlank { "N/A" }}",
                        fontSize = 11.sp,
                        color = Stone700
                    )
                }

                Row(verticalAlignment = Alignment.CenterVertically) {
                    IconButton(onClick = onEdit) {
                        Icon(Icons.Default.Edit, contentDescription = "Edit", tint = Amber900, modifier = Modifier.size(18.dp))
                    }
                    IconButton(onClick = onDelete) {
                        Icon(Icons.Default.DeleteOutline, contentDescription = "Delete", tint = Color.Gray, modifier = Modifier.size(18.dp))
                    }
                }
            }

            Spacer(modifier = Modifier.height(6.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Price: $currencySymbol${product.price} (Cost: $currencySymbol${product.costPrice})",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Medium,
                    color = Amber900
                )

                // Stock adjust stepper
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    IconButton(
                        onClick = { onAdjustStock(-1) },
                        modifier = Modifier.size(28.dp)
                    ) {
                        Icon(Icons.Default.Remove, contentDescription = "Decrease", tint = Stone700)
                    }
                    Text(
                        text = "${product.stock} ${product.unit}",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (isLowStock) Color(0xFFDC2626) else Color(0xFF059669)
                    )
                    IconButton(
                        onClick = { onAdjustStock(1) },
                        modifier = Modifier.size(28.dp)
                    ) {
                        Icon(Icons.Default.Add, contentDescription = "Increase", tint = Stone700)
                    }
                }
            }
        }
    }
}
