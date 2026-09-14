package com.localseller.pos.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ReceiptLong
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.localseller.pos.data.Order
import com.localseller.pos.ui.components.ReceiptDialog
import com.localseller.pos.ui.theme.Amber100
import com.localseller.pos.ui.theme.Amber900
import com.localseller.pos.ui.theme.Stone100
import com.localseller.pos.ui.theme.Stone700
import com.localseller.pos.ui.theme.Stone900
import com.localseller.pos.viewmodel.ShopViewModel
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun SalesLedgerScreen(
    viewModel: ShopViewModel
) {
    val orders by viewModel.orders.collectAsState()
    val settings by viewModel.settings.collectAsState()
    var selectedOrderForReceipt by remember { mutableStateOf<Order?>(null) }

    val totalRevenue = orders.sumOf { it.grandTotal }
    val totalOrdersCount = orders.size
    val averageTicket = if (totalOrdersCount > 0) totalRevenue / totalOrdersCount else 0.0

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Stone100)
    ) {
        // Summary KPI Card
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = Amber900)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(text = "Total Gross Revenue", fontSize = 12.sp, color = Amber100)
                Text(
                    text = "${settings.currencySymbol}%.2f".format(totalRevenue),
                    fontSize = 28.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = Color.White
                )

                Spacer(modifier = Modifier.height(12.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column {
                        Text(text = "Completed Orders", fontSize = 11.sp, color = Amber100)
                        Text(text = "$totalOrdersCount sales", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Color.White)
                    }
                    Column {
                        Text(text = "Average Ticket", fontSize = 11.sp, color = Amber100)
                        Text(
                            text = "${settings.currencySymbol}%.2f".format(averageTicket),
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    }
                }
            }
        }

        Text(
            text = "Completed Sales History",
            fontWeight = FontWeight.Bold,
            fontSize = 15.sp,
            color = Stone900,
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 6.dp)
        )

        if (orders.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                contentAlignment = Alignment.Center
            ) {
                Text(text = "No sales recorded yet. Process a sale in POS Register.", color = Stone700, fontSize = 13.sp)
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .padding(horizontal = 12.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(orders) { order ->
                    OrderHistoryCard(
                        order = order,
                        currencySymbol = settings.currencySymbol,
                        onClick = { selectedOrderForReceipt = order }
                    )
                }
            }
        }
    }

    selectedOrderForReceipt?.let { order ->
        ReceiptDialog(
            order = order,
            settings = settings,
            onDismiss = { selectedOrderForReceipt = null }
        )
    }
}

@Composable
fun OrderHistoryCard(
    order: Order,
    currencySymbol: String,
    onClick: () -> Unit
) {
    val dateFormat = SimpleDateFormat("dd MMM yyyy, hh:mm a", Locale.getDefault())
    val dateString = dateFormat.format(Date(order.timestamp))

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() },
        shape = RoundedCornerShape(10.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .background(Amber100, shape = RoundedCornerShape(8.dp))
                        .padding(8.dp)
                ) {
                    Icon(Icons.Default.ReceiptLong, contentDescription = null, tint = Amber900, modifier = Modifier.size(20.dp))
                }

                Spacer(modifier = Modifier.width(12.dp))

                Column {
                    Text(text = order.orderNumber, fontWeight = FontWeight.Bold, fontSize = 14.sp, color = Stone900)
                    Text(text = "${order.customerName} • ${order.paymentMethod.label}", fontSize = 12.sp, color = Stone700)
                    Text(text = dateString, fontSize = 10.sp, color = Color.Gray)
                }
            }

            Column(horizontalAlignment = Alignment.End) {
                Text(
                    text = "$currencySymbol%.2f".format(order.grandTotal),
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp,
                    color = Amber900
                )
                Text(
                    text = "${order.items.size} items",
                    fontSize = 11.sp,
                    color = Color(0xFF059669),
                    fontWeight = FontWeight.Medium
                )
            }
        }
    }
}
