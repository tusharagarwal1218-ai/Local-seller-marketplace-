package com.localseller.pos.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.RestartAlt
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.localseller.pos.ui.theme.Amber100
import com.localseller.pos.ui.theme.Amber900
import com.localseller.pos.ui.theme.Stone100
import com.localseller.pos.ui.theme.Stone700
import com.localseller.pos.ui.theme.Stone900
import com.localseller.pos.viewmodel.ShopViewModel

@Composable
fun SettingsScreen(
    viewModel: ShopViewModel
) {
    val settings by viewModel.settings.collectAsState()
    val categories by viewModel.categories.collectAsState()
    val subscription by viewModel.subscription.collectAsState()

    var shopName by remember(settings) { mutableStateOf(settings.shopName) }
    var tagLine by remember(settings) { mutableStateOf(settings.tagLine) }
    var address by remember(settings) { mutableStateOf(settings.address) }
    var phone by remember(settings) { mutableStateOf(settings.phone) }
    var upiId by remember(settings) { mutableStateOf(settings.upiId) }
    var currencySymbol by remember(settings) { mutableStateOf(settings.currencySymbol) }
    var receiptNote by remember(settings) { mutableStateOf(settings.receiptFooterNote) }

    var newCategoryName by remember { mutableStateOf("") }
    var showSavedSnackbar by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Stone100)
            .padding(horizontal = 12.dp)
            .verticalScroll(rememberScrollState())
    ) {
        Spacer(modifier = Modifier.height(8.dp))

        // Store Profile Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(text = "Store Profile & Branding", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = Amber900)
                Spacer(modifier = Modifier.height(12.dp))

                OutlinedTextField(
                    value = shopName,
                    onValueChange = { shopName = it },
                    label = { Text("Shop / Business Name") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )
                Spacer(modifier = Modifier.height(8.dp))

                OutlinedTextField(
                    value = tagLine,
                    onValueChange = { tagLine = it },
                    label = { Text("Tagline / Subheading") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )
                Spacer(modifier = Modifier.height(8.dp))

                OutlinedTextField(
                    value = address,
                    onValueChange = { address = it },
                    label = { Text("Store Address") },
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(modifier = Modifier.height(8.dp))

                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = phone,
                        onValueChange = { phone = it },
                        label = { Text("Phone Number") },
                        modifier = Modifier.weight(1.5f),
                        singleLine = true
                    )
                    OutlinedTextField(
                        value = currencySymbol,
                        onValueChange = { currencySymbol = it },
                        label = { Text("Currency") },
                        modifier = Modifier.weight(1f),
                        singleLine = true
                    )
                }
                Spacer(modifier = Modifier.height(8.dp))

                OutlinedTextField(
                    value = upiId,
                    onValueChange = { upiId = it },
                    label = { Text("UPI ID (for Customer QR Payments)") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )
                Spacer(modifier = Modifier.height(8.dp))

                OutlinedTextField(
                    value = receiptNote,
                    onValueChange = { receiptNote = it },
                    label = { Text("Receipt Footer Note") },
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(12.dp))

                Button(
                    onClick = {
                        val updated = settings.copy(
                            shopName = shopName,
                            tagLine = tagLine,
                            address = address,
                            phone = phone,
                            currencySymbol = currencySymbol,
                            upiId = upiId,
                            receiptFooterNote = receiptNote
                        )
                        viewModel.updateSettings(updated)
                        showSavedSnackbar = true
                    },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Amber900)
                ) {
                    Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Save Store Settings")
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Custom Categories Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(text = "Manage Product Categories", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = Amber900)
                Spacer(modifier = Modifier.height(8.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedTextField(
                        value = newCategoryName,
                        onValueChange = { newCategoryName = it },
                        placeholder = { Text("Add new category...") },
                        modifier = Modifier.weight(1f),
                        singleLine = true
                    )
                    Button(
                        onClick = {
                            if (newCategoryName.isNotBlank()) {
                                viewModel.addCategory(newCategoryName)
                                newCategoryName = ""
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = Amber900),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Icon(Icons.Default.Add, contentDescription = "Add")
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                categories.forEach { cat ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(text = "• $cat", fontSize = 13.sp, color = Stone900)
                        if (cat != "Daily Essentials") {
                            IconButton(onClick = { viewModel.deleteCategory(cat) }) {
                                Icon(Icons.Default.Delete, contentDescription = "Delete", tint = Color.Gray, modifier = Modifier.size(16.dp))
                            }
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Plan & Subscription
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(text = "Merchant License & App Status", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = Amber900)
                Spacer(modifier = Modifier.height(6.dp))
                Text(text = "License Status: Active (Free 60-Day Trial)", fontSize = 13.sp, color = Color(0xFF059669), fontWeight = FontWeight.SemiBold)
                Text(text = "Max Monthly Billing: Up to 10,000 receipts", fontSize = 12.sp, color = Stone700)
                Text(text = "Offline POS, Barcode, Thermal Receipts: Included", fontSize = 12.sp, color = Stone700)
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Reset Data
        OutlinedButton(
            onClick = { viewModel.resetCatalog() },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(8.dp),
            colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFFDC2626))
        ) {
            Icon(Icons.Default.RestartAlt, contentDescription = null)
            Spacer(modifier = Modifier.width(6.dp))
            Text("Reset Store to Initial Catalog Data")
        }

        Spacer(modifier = Modifier.height(24.dp))
    }
}
