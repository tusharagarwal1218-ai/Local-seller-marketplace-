package com.localseller.pos

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.localseller.pos.ui.components.ReceiptDialog
import com.localseller.pos.ui.navigation.Screen
import com.localseller.pos.ui.screens.*
import com.localseller.pos.ui.theme.Amber100
import com.localseller.pos.ui.theme.Amber900
import com.localseller.pos.ui.theme.Stone50
import com.localseller.pos.viewmodel.ShopViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LocalSellerApp(
    viewModel: ShopViewModel = viewModel()
) {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentDestination = navBackStackEntry?.destination

    val settings by viewModel.settings.collectAsState()
    val activeReceipt by viewModel.activeReceiptOrder.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = settings.shopName,
                        fontWeight = FontWeight.Bold,
                        fontSize = 18.sp,
                        color = Color.White
                    )
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Amber900,
                    titleContentColor = Color.White
                )
            )
        },
        bottomBar = {
            NavigationBar(
                containerColor = Color.White
            ) {
                Screen.items.forEach { screen ->
                    val isSelected = currentDestination?.route == screen.route
                    NavigationBarItem(
                        icon = { Icon(screen.icon, contentDescription = screen.title) },
                        label = { Text(screen.title, fontSize = 11.sp) },
                        selected = isSelected,
                        onClick = {
                            navController.navigate(screen.route) {
                                popUpTo(navController.graph.findStartDestination().id) {
                                    saveState = true
                                }
                                launchSingleTop = true
                                restoreState = true
                            }
                        },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = Amber900,
                            selectedTextColor = Amber900,
                            indicatorColor = Amber100
                        )
                    )
                }
            }
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            NavHost(
                navController = navController,
                startDestination = Screen.Pos.route
            ) {
                composable(Screen.Pos.route) {
                    PosScreen(viewModel = viewModel)
                }
                composable(Screen.Showcase.route) {
                    ShowcaseScreen(viewModel = viewModel)
                }
                composable(Screen.Inventory.route) {
                    InventoryScreen(viewModel = viewModel)
                }
                composable(Screen.Sales.route) {
                    SalesLedgerScreen(viewModel = viewModel)
                }
                composable(Screen.Settings.route) {
                    SettingsScreen(viewModel = viewModel)
                }
            }
        }

        // Global Thermal Receipt Dialog
        activeReceipt?.let { order ->
            ReceiptDialog(
                order = order,
                settings = settings,
                onDismiss = { viewModel.dismissReceipt() }
            )
        }
    }
}
