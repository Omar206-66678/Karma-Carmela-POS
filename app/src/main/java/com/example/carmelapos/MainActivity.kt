package com.example.carmelapos

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Analytics
import androidx.compose.material.icons.filled.Inventory
import androidx.compose.material.icons.filled.People
import androidx.compose.material.icons.filled.PointOfSale
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import com.example.carmelapos.ui.screens.customers.CustomerScreen
import com.example.carmelapos.ui.screens.inventory.InventoryScreen
import com.example.carmelapos.ui.screens.pos.PosRegisterScreen
import com.example.carmelapos.ui.screens.reporting.ReportingScreen
import com.example.carmelapos.ui.theme.Amber500
import com.example.carmelapos.ui.theme.CarmelaPosTheme
import com.example.carmelapos.ui.theme.Navy900
import com.example.carmelapos.ui.viewmodel.CustomerViewModel
import com.example.carmelapos.ui.viewmodel.InventoryViewModel
import com.example.carmelapos.ui.viewmodel.PosViewModel
import com.example.carmelapos.ui.viewmodel.ReportingViewModel
import com.example.carmelapos.ui.viewmodel.ViewModelFactory

enum class AppScreen(val title: String, val icon: ImageVector, val tag: String) {
    POS("Register", Icons.Default.PointOfSale, "nav_pos"),
    INVENTORY("Inventory", Icons.Default.Inventory, "nav_inventory"),
    CUSTOMERS("Accounts", Icons.Default.People, "nav_customers"),
    REPORTING("Reports", Icons.Default.Analytics, "nav_reporting")
}

class MainActivity : ComponentActivity() {

    private val app by lazy { application as CarmelaPosApp }
    private val factory by lazy { ViewModelFactory(app.repository) }

    private val posViewModel: PosViewModel by viewModels { factory }
    private val inventoryViewModel: InventoryViewModel by viewModels { factory }
    private val customerViewModel: CustomerViewModel by viewModels { factory }
    private val reportingViewModel: ReportingViewModel by viewModels { factory }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            CarmelaPosTheme {
                MainScreen(
                    posViewModel = posViewModel,
                    inventoryViewModel = inventoryViewModel,
                    customerViewModel = customerViewModel,
                    reportingViewModel = reportingViewModel
                )
            }
        }
    }
}

@Composable
fun MainScreen(
    posViewModel: PosViewModel,
    inventoryViewModel: InventoryViewModel,
    customerViewModel: CustomerViewModel,
    reportingViewModel: ReportingViewModel
) {
    var currentScreen by rememberSaveable { mutableStateOf(AppScreen.POS) }

    // If on a secondary tab, Back button navigates back to POS Register
    if (currentScreen != AppScreen.POS) {
        BackHandler {
            currentScreen = AppScreen.POS
        }
    }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        bottomBar = {
            NavigationBar(
                containerColor = Navy900,
                modifier = Modifier.testTag("main_bottom_nav")
            ) {
                AppScreen.values().forEach { screen ->
                    val selected = currentScreen == screen
                    NavigationBarItem(
                        selected = selected,
                        onClick = { currentScreen = screen },
                        icon = {
                            Icon(
                                imageVector = screen.icon,
                                contentDescription = screen.title
                            )
                        },
                        label = { Text(screen.title) },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = Navy900,
                            selectedTextColor = Amber500,
                            indicatorColor = Amber500,
                            unselectedIconColor = Color.White.copy(alpha = 0.7f),
                            unselectedTextColor = Color.White.copy(alpha = 0.7f)
                        ),
                        modifier = Modifier.testTag(screen.tag)
                    )
                }
            }
        }
    ) { innerPadding ->
        androidx.compose.foundation.layout.Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(bottom = innerPadding.calculateBottomPadding())
        ) {
            when (currentScreen) {
                AppScreen.POS -> PosRegisterScreen(viewModel = posViewModel)
                AppScreen.INVENTORY -> InventoryScreen(viewModel = inventoryViewModel)
                AppScreen.CUSTOMERS -> CustomerScreen(viewModel = customerViewModel)
                AppScreen.REPORTING -> ReportingScreen(viewModel = reportingViewModel)
            }
        }
    }
}
