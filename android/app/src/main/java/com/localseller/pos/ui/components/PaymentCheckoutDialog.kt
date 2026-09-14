package com.localseller.pos.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
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
import com.localseller.pos.data.CartItem
import com.localseller.pos.data.PaymentMethod
import com.localseller.pos.data.ShopSettings
import com.localseller.pos.ui.theme.Amber100
import com.localseller.pos.ui.theme.Amber900
import com.localseller.pos.ui.theme.Stone200
import com.localseller.pos.ui.theme.Stone700
import com.localseller.pos.ui.theme.Stone900

@Composable
fun PaymentCheckoutDialog(
    cartItems: List<CartItem>,
    settings: ShopSettings,
    onDismiss: () -> Unit,
    onConfirmSale: (method: PaymentMethod, customerName: String, customerPhone: String, discountPercent: Double) -> Unit
) {
    var selectedMethod by remember { mutableStateOf(PaymentMethod.CASH) }
    var customerName by remember { mutableStateOf("Walk-in Guest") }
    var customerPhone by remember { mutableStateOf("") }
    var discountText by remember { mutableStateOf("0") }
    var cashTenderedText by remember { mutableStateOf("") }

    val subtotal = cartItems.sumOf { it.lineSubtotal }
    val discountPercent = discountText.toDoubleOrNull() ?: 0.0
    val discountTotal = cartItems.sumOf { it.discountAmount } + (subtotal * (discountPercent / 100.0))
    val taxTotal = cartItems.sumOf { it.lineTax }
    val grandTotal = (subtotal - discountTotal + taxTotal).coerceAtLeast(0.0)

    val cashTendered = cashTenderedText.toDoubleOrNull() ?: grandTotal
    val changeDue = (cashTendered - grandTotal).coerceAtLeast(0.0)

    Dialog(onDismissRequest = onDismiss) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 12.dp),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp)
            ) {
                // Title
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Complete Payment",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = Amber900
                    )
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Close")
                    }
                }

                // Amount banner
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Amber100, shape = RoundedCornerShape(8.dp))
                        .padding(12.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(text = "TOTAL PAYABLE", fontSize = 11.sp, color = Amber900, fontWeight = FontWeight.SemiBold)
                        Text(
                            text = "${settings.currencySymbol}%.2f".format(grandTotal),
                            fontSize = 26.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = Amber900
                        )
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Payment Method Selector
                Text(text = "Select Tender Method", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Stone700)
                Spacer(modifier = Modifier.height(6.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    PaymentMethod.values().forEach { method ->
                        val isSelected = selectedMethod == method
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .border(
                                    width = if (isSelected) 2.dp else 1.dp,
                                    color = if (isSelected) Amber900 else Stone200,
                                    shape = RoundedCornerShape(8.dp)
                                )
                                .background(
                                    if (isSelected) Amber100 else Color.White,
                                    shape = RoundedCornerShape(8.dp)
                                )
                                .clickable { selectedMethod = method }
                                .padding(vertical = 8.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = method.label,
                                fontSize = 10.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                color = if (isSelected) Amber900 else Stone900
                            )
                        }
                    }
                }

                if (selectedMethod == PaymentMethod.CASH) {
                    Spacer(modifier = Modifier.height(10.dp))
                    OutlinedTextField(
                        value = cashTenderedText,
                        onValueChange = { cashTenderedText = it },
                        label = { Text("Cash Received (${settings.currencySymbol})") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )
                    if (cashTendered > grandTotal) {
                        Text(
                            text = "Change to Return: ${settings.currencySymbol}%.2f".format(changeDue),
                            fontSize = 12.sp,
                            color = Color(0xFF059669),
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(top = 4.dp)
                        )
                    }
                } else if (selectedMethod == PaymentMethod.UPI) {
                    Spacer(modifier = Modifier.height(10.dp))
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Color(0xFFF0FDF4), shape = RoundedCornerShape(8.dp))
                            .padding(8.dp)
                    ) {
                        Text(
                            text = "UPI ID: ${settings.upiId}\nShow customer your store standee QR code.",
                            fontSize = 11.sp,
                            color = Color(0xFF166534)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Customer Name & Phone
                OutlinedTextField(
                    value = customerName,
                    onValueChange = { customerName = it },
                    label = { Text("Customer Name") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(6.dp))

                OutlinedTextField(
                    value = customerPhone,
                    onValueChange = { customerPhone = it },
                    label = { Text("Customer Phone (Optional for SMS receipt)") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(16.dp))

                // Checkout Button
                Button(
                    onClick = {
                        onConfirmSale(selectedMethod, customerName, customerPhone, discountPercent)
                    },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Amber900)
                ) {
                    Text(
                        text = "Complete Sale & Issue Receipt",
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp
                    )
                }
            }
        }
    }
}
