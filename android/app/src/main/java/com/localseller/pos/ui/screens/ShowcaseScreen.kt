package com.localseller.pos.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AddShoppingCart
import androidx.compose.material.icons.filled.Storefront
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
import com.localseller.pos.ui.theme.Amber100
import com.localseller.pos.ui.theme.Amber900
import com.localseller.pos.ui.theme.Stone100
import com.localseller.pos.ui.theme.Stone700
import com.localseller.pos.ui.theme.Stone900
import com.localseller.pos.viewmodel.ShopViewModel

@Composable
fun ShowcaseScreen(
    viewModel: ShopViewModel
) {
    val products by viewModel.products.collectAsState()
    val settings by viewModel.settings.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Stone100)
    ) {
        // Storefront Banner
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = Amber900)
        ) {
            Column(
                modifier = Modifier.padding(16.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Storefront, contentDescription = null, tint = Amber100)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = settings.shopName,
                        fontWeight = FontWeight.Bold,
                        fontSize = 18.sp,
                        color = Color.White
                    )
                }
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = settings.tagLine,
                    fontSize = 12.sp,
                    color = Amber100
                )
                Text(
                    text = "📍 ${settings.address} • 📞 ${settings.phone}",
                    fontSize = 11.sp,
                    color = Color(0xFFFDE68A),
                    modifier = Modifier.padding(top = 4.dp)
                )
            }
        }

        Text(
            text = "Featured Catalog Products",
            fontWeight = FontWeight.Bold,
            fontSize = 15.sp,
            color = Stone900,
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 6.dp)
        )

        // Showcase Grid
        LazyVerticalGrid(
            columns = GridCells.Fixed(2),
            modifier = Modifier
                .weight(1f)
                .padding(horizontal = 12.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(products) { product ->
                ShowcaseProductCard(
                    product = product,
                    currencySymbol = settings.currencySymbol,
                    onAddToCart = { viewModel.addToCart(product) }
                )
            }
        }
    }
}

@Composable
fun ShowcaseProductCard(
    product: Product,
    currencySymbol: String,
    onAddToCart: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(10.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier.padding(12.dp)
        ) {
            // Category Badge
            Box(
                modifier = Modifier
                    .background(Amber100, shape = RoundedCornerShape(4.dp))
                    .padding(horizontal = 6.dp, vertical = 2.dp)
            ) {
                Text(
                    text = product.category,
                    fontSize = 9.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Amber900
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = product.name,
                fontWeight = FontWeight.SemiBold,
                fontSize = 13.sp,
                color = Stone900,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis
            )

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = "$currencySymbol${product.price} / ${product.unit}",
                fontWeight = FontWeight.Bold,
                fontSize = 14.sp,
                color = Amber900
            )

            Spacer(modifier = Modifier.height(8.dp))

            Button(
                onClick = onAddToCart,
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(6.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Amber900),
                contentPadding = PaddingValues(vertical = 6.dp)
            ) {
                Icon(
                    Icons.Default.AddShoppingCart,
                    contentDescription = null,
                    modifier = Modifier.size(14.dp)
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text("Order", fontSize = 11.sp, fontWeight = FontWeight.Bold)
            }
        }
    }
}
