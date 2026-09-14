package com.localseller.pos.ui.theme

import android.app.Activity
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val LightColorScheme = lightColorScheme(
    primary = Amber900,
    onPrimary = Stone50,
    primaryContainer = Amber100,
    onPrimaryContainer = Amber900,
    secondary = Amber700,
    onSecondary = Stone50,
    background = Stone100,
    onBackground = Stone900,
    surface = Stone50,
    onSurface = Stone900,
    surfaceVariant = Stone200,
    onSurfaceVariant = Stone700
)

@Composable
fun LocalSellerTheme(
    content: @Composable () -> Unit
) {
    val colorScheme = LightColorScheme
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = Amber900.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = false
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
