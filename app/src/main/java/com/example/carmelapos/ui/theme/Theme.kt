package com.example.carmelapos.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val LightColorScheme = lightColorScheme(
    primary = Navy900,
    onPrimary = Color.White,
    primaryContainer = Slate100,
    onPrimaryContainer = Navy900,
    secondary = Amber600,
    onSecondary = Color.White,
    secondaryContainer = Amber50,
    onSecondaryContainer = Amber700,
    tertiary = Emerald600,
    onTertiary = Color.White,
    tertiaryContainer = Emerald50,
    onTertiaryContainer = Emerald600,
    background = Slate50,
    onBackground = Navy900,
    surface = Color.White,
    onSurface = Navy900,
    surfaceVariant = Slate100,
    onSurfaceVariant = Navy700,
    outline = Slate300
)

private val DarkColorScheme = darkColorScheme(
    primary = Slate200,
    onPrimary = Navy900,
    primaryContainer = Navy800,
    onPrimaryContainer = Color.White,
    secondary = Amber500,
    onSecondary = Navy900,
    secondaryContainer = Navy700,
    onSecondaryContainer = Amber500,
    tertiary = Emerald500,
    onTertiary = Navy900,
    tertiaryContainer = Navy800,
    onTertiaryContainer = Emerald500,
    background = Navy900,
    onBackground = Slate50,
    surface = Navy800,
    onSurface = Slate50,
    surfaceVariant = Navy700,
    onSurfaceVariant = Slate200,
    outline = Navy600
)

@Composable
fun CarmelaPosTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as? Activity)?.window
            if (window != null) {
                window.statusBarColor = colorScheme.background.toArgb()
                WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = !darkTheme
            }
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
