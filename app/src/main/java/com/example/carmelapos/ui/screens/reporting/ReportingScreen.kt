package com.example.carmelapos.ui.screens.reporting

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountBalance
import androidx.compose.material.icons.filled.AttachMoney
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.Inventory2
import androidx.compose.material.icons.filled.TrendingUp
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.carmelapos.ui.theme.Amber500
import com.example.carmelapos.ui.theme.Amber600
import com.example.carmelapos.ui.theme.Blue600
import com.example.carmelapos.ui.theme.Emerald500
import com.example.carmelapos.ui.theme.Emerald600
import com.example.carmelapos.ui.theme.Navy700
import com.example.carmelapos.ui.theme.Navy800
import com.example.carmelapos.ui.theme.Navy900
import com.example.carmelapos.ui.theme.Rose500
import com.example.carmelapos.ui.theme.Slate100
import com.example.carmelapos.ui.theme.Slate200
import com.example.carmelapos.ui.theme.Slate50
import com.example.carmelapos.ui.viewmodel.ReportingViewModel
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ReportingScreen(
    viewModel: ReportingViewModel
) {
    val allOrders by viewModel.allOrders.collectAsState()
    val allProductsWithUnits by viewModel.allProductsWithUnits.collectAsState()
    val totalReceivables by viewModel.totalReceivables.collectAsState()
    val (inventoryCostVal, inventoryWholesaleVal) = viewModel.inventoryValuation.collectAsState().value
    val recentTransactions by viewModel.recentTransactions.collectAsState()

    val totalRevenue = allOrders.sumOf { it.totalAmount }
    val potentialProfit = (inventoryWholesaleVal - inventoryCostVal).coerceAtLeast(0.0)
    val marginPercent = if (inventoryWholesaleVal > 0) (potentialProfit / inventoryWholesaleVal) * 100 else 0.0

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            "Wholesale Analytics",
                            style = MaterialTheme.typography.titleLarge.copy(
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                        )
                        Text(
                            "Financial Intelligence & Stock Valuation",
                            style = MaterialTheme.typography.bodySmall.copy(
                                color = Amber500,
                                fontSize = 11.sp
                            )
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Navy900)
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(Slate50)
                .testTag("reporting_screen"),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // Financial KPI Cards Grid
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    MetricCard(
                        title = "Gross Revenue",
                        value = String.format(Locale.US, "$%.2f", totalRevenue),
                        subtitle = "${allOrders.size} wholesale orders",
                        icon = Icons.Default.TrendingUp,
                        accentColor = Emerald600,
                        modifier = Modifier.weight(1f)
                    )
                    MetricCard(
                        title = "Receivables (Credit)",
                        value = String.format(Locale.US, "$%.2f", totalReceivables),
                        subtitle = "Net 15/30 terms owed",
                        icon = Icons.Default.AccountBalance,
                        accentColor = Amber600,
                        modifier = Modifier.weight(1f)
                    )
                }
            }

            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    MetricCard(
                        title = "Stock at Cost",
                        value = String.format(Locale.US, "$%.0f", inventoryCostVal),
                        subtitle = "Purchased inventory cost",
                        icon = Icons.Default.Inventory2,
                        accentColor = Navy700,
                        modifier = Modifier.weight(1f)
                    )
                    MetricCard(
                        title = "Wholesale Valuation",
                        value = String.format(Locale.US, "$%.0f", inventoryWholesaleVal),
                        subtitle = String.format(Locale.US, "+%.1f%% markup margin", marginPercent),
                        icon = Icons.Default.AttachMoney,
                        accentColor = Blue600,
                        modifier = Modifier.weight(1f)
                    )
                }
            }

            // Category Inventory Distribution
            item {
                Card(
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = "Inventory by Category",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                        )
                        Spacer(modifier = Modifier.height(10.dp))

                        val catGroups = allProductsWithUnits
                            .groupBy { it.product.category }
                            .mapValues { (_, list) ->
                                list.sumOf { it.product.currentStockBaseUnits * it.product.wholesalePriceTier1 }
                            }

                        val maxVal = catGroups.values.maxOrNull()?.coerceAtLeast(1.0) ?: 1.0

                        catGroups.forEach { (cat, catVal) ->
                            val progress = (catVal / maxVal).toFloat().coerceIn(0f, 1f)
                            Column(modifier = Modifier.padding(vertical = 4.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text(cat, style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Medium))
                                    Text(
                                        String.format(Locale.US, "$%.0f", catVal),
                                        style = MaterialTheme.typography.bodySmall.copy(
                                            fontWeight = FontWeight.Bold,
                                            fontFamily = FontFamily.Monospace
                                        )
                                    )
                                }
                                Spacer(modifier = Modifier.height(3.dp))
                                LinearProgressIndicator(
                                    progress = { progress },
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(6.dp),
                                    color = Amber500,
                                    trackColor = Slate100
                                )
                            }
                        }
                    }
                }
            }

            // Recent Orders Summary
            item {
                Card(
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = "Recent Wholesale Invoices",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                        )
                        Spacer(modifier = Modifier.height(8.dp))

                        if (allOrders.isEmpty()) {
                            Text("No orders recorded yet", color = Color.Gray, fontSize = 12.sp)
                        } else {
                            allOrders.take(5).forEach { order ->
                                val date = SimpleDateFormat("MM/dd HH:mm", Locale.US).format(Date(order.timestamp))
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(vertical = 6.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column {
                                        Text(
                                            text = order.orderNumber,
                                            style = MaterialTheme.typography.bodySmall.copy(
                                                fontWeight = FontWeight.Bold,
                                                fontFamily = FontFamily.Monospace
                                            )
                                        )
                                        Text(
                                            text = "${order.customerName} • $date",
                                            style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp, color = Color.Gray)
                                        )
                                    }
                                    Column(horizontalAlignment = Alignment.End) {
                                        Text(
                                            text = String.format(Locale.US, "$%.2f", order.totalAmount),
                                            style = MaterialTheme.typography.bodyMedium.copy(
                                                fontWeight = FontWeight.Bold,
                                                fontFamily = FontFamily.Monospace
                                            )
                                        )
                                        Text(
                                            text = order.paymentMethod.replace('_', ' '),
                                            style = MaterialTheme.typography.bodySmall.copy(fontSize = 10.sp, color = Emerald600)
                                        )
                                    }
                                }
                                HorizontalDivider(color = Slate200)
                            }
                        }
                    }
                }
            }

            // Stock Audit & Transaction Log
            item {
                Card(
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(Icons.Default.History, contentDescription = null, tint = Navy700, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "Stock Audit & Transaction Log",
                                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                            )
                        }
                        Spacer(modifier = Modifier.height(8.dp))

                        if (recentTransactions.isEmpty()) {
                            Text("No stock transactions logged yet", color = Color.Gray, fontSize = 12.sp)
                        } else {
                            recentTransactions.take(8).forEach { tx ->
                                val date = SimpleDateFormat("MM/dd HH:mm", Locale.US).format(Date(tx.timestamp))
                                val isPositive = tx.quantityBaseUnits > 0
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(vertical = 4.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(
                                            text = tx.productName,
                                            style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.SemiBold)
                                        )
                                        Text(
                                            text = "${tx.type} • $date ${if (tx.referenceInfo.isNotBlank()) "• ${tx.referenceInfo}" else ""}",
                                            style = MaterialTheme.typography.bodySmall.copy(fontSize = 10.sp, color = Color.Gray)
                                        )
                                    }
                                    Text(
                                        text = "${if (isPositive) "+" else ""}${String.format(Locale.US, "%.0f", tx.quantityBaseUnits)} units",
                                        style = MaterialTheme.typography.bodySmall.copy(
                                            fontWeight = FontWeight.Bold,
                                            color = if (isPositive) Emerald600 else Rose500,
                                            fontFamily = FontFamily.Monospace
                                        )
                                    )
                                }
                                HorizontalDivider(color = Slate200)
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun MetricCard(
    title: String,
    value: String,
    subtitle: String,
    icon: ImageVector,
    accentColor: Color,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.bodySmall.copy(
                        color = Color.Gray,
                        fontWeight = FontWeight.Medium
                    )
                )
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = accentColor,
                    modifier = Modifier.size(18.dp)
                )
            }
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = value,
                style = MaterialTheme.typography.titleLarge.copy(
                    fontWeight = FontWeight.Bold,
                    fontFamily = FontFamily.Monospace,
                    color = Navy900
                )
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = subtitle,
                style = MaterialTheme.typography.bodySmall.copy(
                    fontSize = 11.sp,
                    color = accentColor,
                    fontWeight = FontWeight.Medium
                )
            )
        }
    }
}
