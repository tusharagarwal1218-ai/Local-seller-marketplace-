package com.localseller.pos.ui.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Assessment
import androidx.compose.material.icons.filled.Inventory2
import androidx.compose.material.icons.filled.PointOfSale
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Storefront
import androidx.compose.ui.graphics.vector.ImageVector

sealed class Screen(val route: String, val title: String, val icon: ImageVector) {
    object Pos : Screen("pos", "POS", Icons.Default.PointOfSale)
    object Showcase : Screen("showcase", "Storefront", Icons.Default.Storefront)
    object Inventory : Screen("inventory", "Inventory", Icons.Default.Inventory2)
    object Sales : Screen("sales", "Ledger", Icons.Default.Assessment)
    object Settings : Screen("settings", "Settings", Icons.Default.Settings)

    companion object {
        val items = listOf(Pos, Showcase, Inventory, Sales, Settings)
    }
}
