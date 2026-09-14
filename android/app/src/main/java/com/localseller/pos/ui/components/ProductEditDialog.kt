package com.localseller.pos.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.localseller.pos.data.Product
import com.localseller.pos.ui.theme.Amber900
import java.util.UUID

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProductEditDialog(
    initialProduct: Product? = null,
    categories: List<String>,
    currencySymbol: String = "₹",
    onDismiss: () -> Unit,
    onSave: (Product) -> Unit
) {
    var name by remember { mutableStateOf(initialProduct?.name ?: "") }
    var priceText by remember { mutableStateOf(initialProduct?.price?.toString() ?: "") }
    var costPriceText by remember { mutableStateOf(initialProduct?.costPrice?.toString() ?: "") }
    var stockText by remember { mutableStateOf(initialProduct?.stock?.toString() ?: "10") }
    var minStockText by remember { mutableStateOf(initialProduct?.minStockAlert?.toString() ?: "5") }
    var barcode by remember { mutableStateOf(initialProduct?.barcode ?: "") }
    var unit by remember { mutableStateOf(initialProduct?.unit ?: "piece") }
    var selectedCategory by remember { mutableStateOf(initialProduct?.category ?: categories.firstOrNull() ?: "Daily Essentials") }
    var categoryMenuExpanded by remember { mutableStateOf(false) }

    Dialog(onDismissRequest = onDismiss) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 16.dp),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp)
                    .verticalScroll(rememberScrollState())
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = if (initialProduct != null) "Edit Product" else "Add New Product",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = Amber900
                    )
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Close")
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Product Name *") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(8.dp))

                // Category selector dropdown
                ExposedDropdownMenuBox(
                    expanded = categoryMenuExpanded,
                    onExpandedChange = { categoryMenuExpanded = !categoryMenuExpanded }
                ) {
                    OutlinedTextField(
                        value = selectedCategory,
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("Category") },
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = categoryMenuExpanded) },
                        modifier = Modifier
                            .menuAnchor()
                            .fillMaxWidth()
                    )
                    ExposedDropdownMenu(
                        expanded = categoryMenuExpanded,
                        onDismissRequest = { categoryMenuExpanded = false }
                    ) {
                        categories.forEach { cat ->
                            DropdownMenuItem(
                                text = { Text(cat) },
                                onClick = {
                                    selectedCategory = cat
                                    categoryMenuExpanded = false
                                }
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedTextField(
                        value = priceText,
                        onValueChange = { priceText = it },
                        label = { Text("Selling Price ($currencySymbol) *") },
                        modifier = Modifier.weight(1f),
                        singleLine = true
                    )
                    OutlinedTextField(
                        value = costPriceText,
                        onValueChange = { costPriceText = it },
                        label = { Text("Cost Price ($currencySymbol)") },
                        modifier = Modifier.weight(1f),
                        singleLine = true
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedTextField(
                        value = stockText,
                        onValueChange = { stockText = it },
                        label = { Text("Stock Qty *") },
                        modifier = Modifier.weight(1f),
                        singleLine = true
                    )
                    OutlinedTextField(
                        value = minStockText,
                        onValueChange = { minStockText = it },
                        label = { Text("Low Alert") },
                        modifier = Modifier.weight(1f),
                        singleLine = true
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedTextField(
                        value = unit,
                        onValueChange = { unit = it },
                        label = { Text("Unit (piece/kg/bag)") },
                        modifier = Modifier.weight(1f),
                        singleLine = true
                    )
                    OutlinedTextField(
                        value = barcode,
                        onValueChange = { barcode = it },
                        label = { Text("Barcode (EAN/UPC)") },
                        modifier = Modifier.weight(1.5f),
                        singleLine = true
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                Button(
                    onClick = {
                        val price = priceText.toDoubleOrNull() ?: 0.0
                        val costPrice = costPriceText.toDoubleOrNull() ?: (price * 0.8)
                        val stock = stockText.toIntOrNull() ?: 0
                        val minStock = minStockText.toIntOrNull() ?: 5

                        val productToSave = initialProduct?.copy(
                            name = name.ifBlank { "Untitled Product" },
                            price = price,
                            costPrice = costPrice,
                            stock = stock,
                            minStockAlert = minStock,
                            category = selectedCategory,
                            unit = unit,
                            barcode = barcode
                        ) ?: Product(
                            id = UUID.randomUUID().toString(),
                            name = name.ifBlank { "Untitled Product" },
                            price = price,
                            costPrice = costPrice,
                            stock = stock,
                            minStockAlert = minStock,
                            category = selectedCategory,
                            unit = unit,
                            barcode = barcode
                        )

                        onSave(productToSave)
                    },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Amber900)
                ) {
                    Text("Save Product", fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
