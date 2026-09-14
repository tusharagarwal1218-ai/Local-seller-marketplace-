package com.localseller.pos.ui.components

import android.content.Intent
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Print
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.localseller.pos.data.Order
import com.localseller.pos.data.ShopSettings
import com.localseller.pos.ui.theme.Amber900
import com.localseller.pos.ui.theme.Stone100
import com.localseller.pos.ui.theme.Stone700
import com.localseller.pos.ui.theme.Stone900
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Composable
fun ReceiptDialog(
    order: Order,
    settings: ShopSettings,
    onDismiss: () -> Unit
) {
    val context = LocalContext.current
    val dateFormat = SimpleDateFormat("dd MMM yyyy, hh:mm a", Locale.getDefault())
    val dateString = dateFormat.format(Date(order.timestamp))

    Dialog(onDismissRequest = onDismiss) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 16.dp),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp)
                    .verticalScroll(rememberScrollState()),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Header Actions
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Thermal Receipt",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = Amber900
                    )
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Close")
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Simulated Receipt Paper
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Stone100, shape = RoundedCornerShape(8.dp))
                        .border(1.dp, Color(0xFFE2E8F0), shape = RoundedCornerShape(8.dp))
                        .padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = settings.shopName.uppercase(),
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp,
                        textAlign = TextAlign.Center,
                        color = Stone900
                    )
                    Text(
                        text = settings.tagLine,
                        fontSize = 11.sp,
                        textAlign = TextAlign.Center,
                        color = Stone700
                    )
                    Text(
                        text = settings.address,
                        fontSize = 11.sp,
                        textAlign = TextAlign.Center,
                        color = Stone700
                    )
                    Text(
                        text = "Phone: ${settings.phone}",
                        fontSize = 11.sp,
                        color = Stone700
                    )

                    Spacer(modifier = Modifier.height(10.dp))
                    Text(
                        text = "-----------------------------------------",
                        fontFamily = FontFamily.Monospace,
                        fontSize = 10.sp,
                        color = Stone700
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(text = "Order: ${order.orderNumber}", fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
                        Text(text = dateString, fontSize = 10.sp, color = Stone700)
                    }
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(text = "Customer: ${order.customerName}", fontSize = 11.sp)
                        Text(text = "Pay: ${order.paymentMethod.label}", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }

                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "-----------------------------------------",
                        fontFamily = FontFamily.Monospace,
                        fontSize = 10.sp,
                        color = Stone700
                    )

                    // Line Items
                    order.items.forEach { item ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 2.dp),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = item.product.name,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Medium,
                                    maxLines = 1
                                )
                                Text(
                                    text = "${item.quantity} x ${settings.currencySymbol}${item.product.price}",
                                    fontSize = 10.sp,
                                    color = Stone700
                                )
                            }
                            Text(
                                text = "${settings.currencySymbol}%.2f".format(item.lineTotalAfterDiscount),
                                fontSize = 12.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                    }

                    Text(
                        text = "-----------------------------------------",
                        fontFamily = FontFamily.Monospace,
                        fontSize = 10.sp,
                        color = Stone700
                    )

                    // Totals
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(text = "Subtotal:", fontSize = 12.sp)
                        Text(text = "${settings.currencySymbol}%.2f".format(order.subtotal), fontSize = 12.sp)
                    }
                    if (order.discountTotal > 0) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(text = "Discount:", fontSize = 12.sp, color = Color(0xFF059669))
                            Text(text = "-${settings.currencySymbol}%.2f".format(order.discountTotal), fontSize = 12.sp, color = Color(0xFF059669))
                        }
                    }
                    if (order.taxTotal > 0) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(text = "Taxes (GST):", fontSize = 12.sp)
                            Text(text = "+${settings.currencySymbol}%.2f".format(order.taxTotal), fontSize = 12.sp)
                        }
                    }

                    Spacer(modifier = Modifier.height(4.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(text = "GRAND TOTAL:", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Amber900)
                        Text(
                            text = "${settings.currencySymbol}%.2f".format(order.grandTotal),
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = Amber900
                        )
                    }

                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = settings.receiptFooterNote,
                        fontSize = 10.sp,
                        textAlign = TextAlign.Center,
                        color = Stone700
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Actions: Share & Done
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedButton(
                        onClick = {
                            val shareBody = buildString {
                                appendLine("🧾 Receipt: ${settings.shopName}")
                                appendLine("Order: ${order.orderNumber}")
                                appendLine("Total: ${settings.currencySymbol}%.2f".format(order.grandTotal))
                                appendLine("Items: ${order.items.size}")
                                appendLine(settings.receiptFooterNote)
                            }
                            val intent = Intent(Intent.ACTION_SEND).apply {
                                type = "text/plain"
                                putExtra(Intent.EXTRA_SUBJECT, "Receipt ${order.orderNumber}")
                                putExtra(Intent.EXTRA_TEXT, shareBody)
                            }
                            context.startActivity(Intent.createChooser(intent, "Share Receipt"))
                        },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Icon(Icons.Default.Share, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Share")
                    }

                    Button(
                        onClick = onDismiss,
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(8.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Amber900)
                    ) {
                        Text("Done")
                    }
                }
            }
        }
    }
}
