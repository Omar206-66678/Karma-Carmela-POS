package com.example.carmelapos.ui.screens.inventory

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Archive
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.ExpandLess
import androidx.compose.material.icons.filled.ExpandMore
import androidx.compose.material.icons.filled.FilterList
import androidx.compose.material.icons.filled.Inventory
import androidx.compose.material.icons.filled.LocalShipping
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedCard
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.RadioButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.carmelapos.data.model.Product
import com.example.carmelapos.data.model.ProductUnit
import com.example.carmelapos.data.model.ProductWithUnits
import com.example.carmelapos.ui.theme.Amber50
import com.example.carmelapos.ui.theme.Amber500
import com.example.carmelapos.ui.theme.Amber600
import com.example.carmelapos.ui.theme.Emerald50
import com.example.carmelapos.ui.theme.Emerald500
import com.example.carmelapos.ui.theme.Emerald600
import com.example.carmelapos.ui.theme.Navy700
import com.example.carmelapos.ui.theme.Navy800
import com.example.carmelapos.ui.theme.Navy900
import com.example.carmelapos.ui.theme.Rose50
import com.example.carmelapos.ui.theme.Rose500
import com.example.carmelapos.ui.theme.Slate100
import com.example.carmelapos.ui.theme.Slate200
import com.example.carmelapos.ui.theme.Slate50
import com.example.carmelapos.ui.viewmodel.InventoryViewModel
import kotlinx.coroutines.flow.collectLatest
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun InventoryScreen(
    viewModel: InventoryViewModel
) {
    val searchQuery by viewModel.searchQuery.collectAsState()
    val selectedCategory by viewModel.selectedCategory.collectAsState()
    val lowStockOnly by viewModel.lowStockOnly.collectAsState()
    val productsWithUnits by viewModel.productsWithUnits.collectAsState()
    val lowStockCount by viewModel.lowStockCount.collectAsState()
    val categories by viewModel.categories.collectAsState()

    var productForAdjustment by remember { mutableStateOf<ProductWithUnits?>(null) }
    var productForEdit by remember { mutableStateOf<ProductWithUnits?>(null) }
    var showAddDialog by remember { mutableStateOf(false) }

    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(Unit) {
        viewModel.uiEvents.collectLatest { msg ->
            snackbarHostState.showSnackbar(msg)
        }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            "Wholesale Inventory",
                            style = MaterialTheme.typography.titleLarge.copy(
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                        )
                        Text(
                            "${productsWithUnits.size} SKUs tracked",
                            style = MaterialTheme.typography.bodySmall.copy(
                                color = Amber500,
                                fontSize = 11.sp
                            )
                        )
                    }
                },
                actions = {
                    if (lowStockCount > 0) {
                        Surface(
                            shape = RoundedCornerShape(20.dp),
                            color = if (lowStockOnly) Rose500 else Color(0xFF7F1D1D),
                            modifier = Modifier
                                .clip(RoundedCornerShape(20.dp))
                                .clickable { viewModel.toggleLowStockOnly() }
                                .padding(horizontal = 10.dp, vertical = 6.dp)
                                .testTag("low_stock_filter_btn")
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Warning,
                                    contentDescription = "Alert",
                                    tint = Color.White,
                                    modifier = Modifier.size(14.dp)
                                )
                                Text(
                                    text = "$lowStockCount Low Stock",
                                    style = MaterialTheme.typography.bodySmall.copy(
                                        color = Color.White,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 11.sp
                                    )
                                )
                            }
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Navy900)
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { showAddDialog = true },
                containerColor = Amber500,
                contentColor = Navy900,
                modifier = Modifier.testTag("add_product_fab")
            ) {
                Icon(Icons.Default.Add, contentDescription = "Add Product")
            }
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(Slate50)
        ) {
            // Search Bar
            Surface(
                color = Color.White,
                shadowElevation = 1.dp,
                modifier = Modifier.fillMaxWidth()
            ) {
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { viewModel.setSearchQuery(it) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 12.dp, vertical = 8.dp)
                        .testTag("inventory_search_input"),
                    placeholder = { Text("Filter inventory by name, SKU, or barcode...") },
                    leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = Navy700) },
                    trailingIcon = {
                        if (searchQuery.isNotEmpty()) {
                            IconButton(onClick = { viewModel.setSearchQuery("") }) {
                                Icon(Icons.Default.Clear, contentDescription = "Clear")
                            }
                        }
                    },
                    singleLine = true,
                    shape = RoundedCornerShape(12.dp)
                )
            }

            // Category Chips
            LazyRow(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 8.dp),
                contentPadding = PaddingValues(horizontal = 12.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(categories) { cat ->
                    val isSelected = cat.equals(selectedCategory, ignoreCase = true)
                    FilterChip(
                        selected = isSelected,
                        onClick = { viewModel.setSelectedCategory(cat) },
                        label = { Text(cat) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = Navy900,
                            selectedLabelColor = Color.White
                        )
                    )
                }
            }

            // Products List
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .testTag("inventory_product_list"),
                contentPadding = PaddingValues(12.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(productsWithUnits) { pwu ->
                    InventoryProductCard(
                        productWithUnits = pwu,
                        onAdjustStock = { productForAdjustment = pwu },
                        onEdit = { productForEdit = pwu },
                        onDelete = { viewModel.deleteProduct(pwu.product.id) }
                    )
                }
            }
        }
    }

    // Stock Adjustment Dialog
    productForAdjustment?.let { pwu ->
        StockAdjustmentDialog(
            productWithUnits = pwu,
            onDismiss = { productForAdjustment = null },
            onConfirm = { type, delta, ref, notes ->
                viewModel.adjustStock(pwu.product.id, type, delta, ref, notes)
                productForAdjustment = null
            }
        )
    }

    // Add / Edit Product Dialog
    if (showAddDialog || productForEdit != null) {
        ProductFormDialog(
            existing = productForEdit,
            onDismiss = {
                showAddDialog = false
                productForEdit = null
            },
            onSave = { prod, units ->
                viewModel.saveProduct(prod, units)
                showAddDialog = false
                productForEdit = null
            }
        )
    }
}

@Composable
fun InventoryProductCard(
    productWithUnits: ProductWithUnits,
    onAdjustStock: () -> Unit,
    onEdit: () -> Unit,
    onDelete: () -> Unit
) {
    val prod = productWithUnits.product
    val isLowStock = prod.currentStockBaseUnits <= prod.minStockAlert
    var expandedUnits by remember { mutableStateOf(false) }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .testTag("inventory_card_${prod.id}"),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp)
        ) {
            // Header Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = prod.name,
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                    )
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "SKU: ${prod.sku}",
                            style = MaterialTheme.typography.bodySmall.copy(
                                fontFamily = FontFamily.Monospace,
                                color = Color.Gray
                            )
                        )
                        Text("•", color = Color.Gray)
                        Text(
                            text = prod.category,
                            style = MaterialTheme.typography.bodySmall.copy(color = Navy700)
                        )
                    }
                }

                // Current Stock Pill
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = if (isLowStock) Rose50 else Emerald50,
                    border = androidx.compose.foundation.BorderStroke(
                        1.dp,
                        if (isLowStock) Rose500.copy(alpha = 0.5f) else Emerald500.copy(alpha = 0.5f)
                    )
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                    ) {
                        Text(
                            text = "${String.format(Locale.US, "%.0f", prod.currentStockBaseUnits)} ${prod.baseUnit}",
                            style = MaterialTheme.typography.bodySmall.copy(
                                fontWeight = FontWeight.Bold,
                                color = if (isLowStock) Rose500 else Emerald600
                            )
                        )
                        Text(
                            text = if (isLowStock) "LOW STOCK (<${prod.minStockAlert.toInt()})" else "In Stock",
                            style = MaterialTheme.typography.bodySmall.copy(
                                fontSize = 9.sp,
                                color = if (isLowStock) Rose500 else Emerald600
                            )
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Cost & Valuation
            val costVal = prod.currentStockBaseUnits * prod.costPriceBase
            val wholesaleVal = prod.currentStockBaseUnits * prod.wholesalePriceTier1
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Slate100, RoundedCornerShape(8.dp))
                    .padding(horizontal = 10.dp, vertical = 6.dp),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "Cost: $${String.format(Locale.US, "%.2f", prod.costPriceBase)} / ${prod.baseUnit}",
                    style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp, color = Navy700)
                )
                Text(
                    text = "Wholesale T1: $${String.format(Locale.US, "%.2f", prod.wholesalePriceTier1)}",
                    style = MaterialTheme.typography.bodySmall.copy(
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Navy900
                    )
                )
                Text(
                    text = "Valuation: $${String.format(Locale.US, "%.0f", wholesaleVal)}",
                    style = MaterialTheme.typography.bodySmall.copy(
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = Emerald600
                    )
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Units breakdown toggle
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { expandedUnits = !expandedUnits },
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Packaging Units (${productWithUnits.units.size})",
                    style = MaterialTheme.typography.labelMedium.copy(color = Color.Gray)
                )
                Icon(
                    imageVector = if (expandedUnits) Icons.Default.ExpandLess else Icons.Default.ExpandMore,
                    contentDescription = null,
                    tint = Color.Gray
                )
            }

            AnimatedVisibility(visible = expandedUnits) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 4.dp),
                    verticalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    productWithUnits.units.forEach { unit ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(Color(0xFFF8FAFC), RoundedCornerShape(6.dp))
                                .padding(horizontal = 8.dp, vertical = 4.dp),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                text = "• ${unit.unitName} (${unit.conversionFactor}x)",
                                style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Medium)
                            )
                            Text(
                                text = String.format(Locale.US, "$%.2f", unit.wholesalePrice),
                                style = MaterialTheme.typography.bodySmall.copy(
                                    fontWeight = FontWeight.Bold,
                                    fontFamily = FontFamily.Monospace
                                )
                            )
                        }
                    }
                }
            }

            HorizontalDivider(modifier = Modifier.padding(vertical = 10.dp), color = Slate200)

            // Bottom Actions
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                OutlinedButton(
                    onClick = onAdjustStock,
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.testTag("adjust_stock_${prod.id}")
                ) {
                    Icon(Icons.Default.LocalShipping, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Stock Adjust", fontSize = 12.sp)
                }

                Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                    IconButton(onClick = onEdit, modifier = Modifier.testTag("edit_product_${prod.id}")) {
                        Icon(Icons.Default.Edit, contentDescription = "Edit", tint = Navy700)
                    }
                    IconButton(onClick = onDelete, modifier = Modifier.testTag("delete_product_${prod.id}")) {
                        Icon(Icons.Default.Delete, contentDescription = "Delete", tint = Rose500)
                    }
                }
            }
        }
    }
}

@Composable
fun StockAdjustmentDialog(
    productWithUnits: ProductWithUnits,
    onDismiss: () -> Unit,
    onConfirm: (type: String, delta: Double, ref: String, notes: String) -> Unit
) {
    var adjustmentType by remember { mutableStateOf("RECEIVING") }
    var quantityInput by remember { mutableStateOf("") }
    var referenceInput by remember { mutableStateOf("") }
    var notesInput by remember { mutableStateOf("") }

    val prod = productWithUnits.product

    Dialog(onDismissRequest = onDismiss) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(8.dp)
                .testTag("stock_adjustment_dialog"),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp)
                    .verticalScroll(rememberScrollState())
            ) {
                Text(
                    text = "Inventory Stock Adjustment",
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                )
                Text(
                    text = "${prod.name} (Current: ${prod.currentStockBaseUnits.toInt()} ${prod.baseUnit})",
                    style = MaterialTheme.typography.bodySmall.copy(color = Color.Gray)
                )

                Spacer(modifier = Modifier.height(14.dp))

                Text("Adjustment Reason:", style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.SemiBold))

                Column {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { adjustmentType = "RECEIVING" }
                    ) {
                        RadioButton(selected = adjustmentType == "RECEIVING", onClick = { adjustmentType = "RECEIVING" })
                        Text("Receive Wholesale Shipment (+)", style = MaterialTheme.typography.bodyMedium)
                    }
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { adjustmentType = "AUDIT_ADJUSTMENT" }
                    ) {
                        RadioButton(selected = adjustmentType == "AUDIT_ADJUSTMENT", onClick = { adjustmentType = "AUDIT_ADJUSTMENT" })
                        Text("Physical Count Audit Correction (Set exact)", style = MaterialTheme.typography.bodyMedium)
                    }
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { adjustmentType = "SPOILAGE_WRITE_OFF" }
                    ) {
                        RadioButton(selected = adjustmentType == "SPOILAGE_WRITE_OFF", onClick = { adjustmentType = "SPOILAGE_WRITE_OFF" })
                        Text("Spoilage / Damage Write-Off (-)", style = MaterialTheme.typography.bodyMedium)
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                OutlinedTextField(
                    value = quantityInput,
                    onValueChange = { quantityInput = it },
                    label = {
                        Text(
                            if (adjustmentType == "AUDIT_ADJUSTMENT") "New Counted Stock in ${prod.baseUnit}"
                            else "Quantity in ${prod.baseUnit}"
                        )
                    },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    singleLine = true,
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("adjustment_qty_input")
                )

                Spacer(modifier = Modifier.height(10.dp))

                OutlinedTextField(
                    value = referenceInput,
                    onValueChange = { referenceInput = it },
                    label = { Text("PO / Shipment # / Batch Ref") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(10.dp))

                OutlinedTextField(
                    value = notesInput,
                    onValueChange = { notesInput = it },
                    label = { Text("Notes") },
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(18.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedButton(onClick = onDismiss, modifier = Modifier.weight(1f)) {
                        Text("Cancel")
                    }
                    Button(
                        onClick = {
                            val qty = quantityInput.toDoubleOrNull() ?: 0.0
                            val delta = when (adjustmentType) {
                                "RECEIVING" -> qty
                                "SPOILAGE_WRITE_OFF" -> -qty
                                "AUDIT_ADJUSTMENT" -> qty - prod.currentStockBaseUnits
                                else -> qty
                            }
                            onConfirm(adjustmentType, delta, referenceInput, notesInput)
                        },
                        modifier = Modifier
                            .weight(1f)
                            .testTag("confirm_stock_adjustment_btn"),
                        colors = ButtonDefaults.buttonColors(containerColor = Navy900)
                    ) {
                        Text("Save", color = Color.White)
                    }
                }
            }
        }
    }
}

@Composable
fun ProductFormDialog(
    existing: ProductWithUnits?,
    onDismiss: () -> Unit,
    onSave: (Product, List<ProductUnit>) -> Unit
) {
    val prod = existing?.product

    var name by remember { mutableStateOf(prod?.name ?: "") }
    var sku by remember { mutableStateOf(prod?.sku ?: "") }
    var category by remember { mutableStateOf(prod?.category ?: "Oils & Vinegars") }
    var baseUnit by remember { mutableStateOf(prod?.baseUnit ?: "Piece") }
    var stock by remember { mutableStateOf(prod?.currentStockBaseUnits?.toString() ?: "100") }
    var minStock by remember { mutableStateOf(prod?.minStockAlert?.toString() ?: "20") }
    var costPrice by remember { mutableStateOf(prod?.costPriceBase?.toString() ?: "10.00") }
    var tier1Price by remember { mutableStateOf(prod?.wholesalePriceTier1?.toString() ?: "15.00") }
    var tier2Price by remember { mutableStateOf(prod?.wholesalePriceTier2?.toString() ?: "14.25") }
    var tier3Price by remember { mutableStateOf(prod?.wholesalePriceTier3?.toString() ?: "13.50") }
    var barcode by remember { mutableStateOf(prod?.barcode ?: "") }
    var batch by remember { mutableStateOf(prod?.batchNumber ?: "") }
    var expiry by remember { mutableStateOf(prod?.expiryDate ?: "") }

    val unitsList = remember {
        mutableStateListOf<ProductUnit>().apply {
            if (existing != null && existing.units.isNotEmpty()) {
                addAll(existing.units)
            } else {
                add(
                    ProductUnit(
                        productId = prod?.id ?: 0L,
                        unitName = "Single Unit",
                        conversionFactor = 1.0,
                        wholesalePrice = 15.0,
                        costPrice = 10.0,
                        barcode = "",
                        isDefaultSellingUnit = false
                    )
                )
                add(
                    ProductUnit(
                        productId = prod?.id ?: 0L,
                        unitName = "Case of 12",
                        conversionFactor = 12.0,
                        wholesalePrice = 160.0,
                        costPrice = 120.0,
                        barcode = "",
                        isDefaultSellingUnit = true
                    )
                )
            }
        }
    }

    Dialog(onDismissRequest = onDismiss) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(4.dp)
                .testTag("product_form_dialog"),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(18.dp)
                    .verticalScroll(rememberScrollState())
            ) {
                Text(
                    text = if (existing == null) "Add Wholesale Product" else "Edit Product",
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                )

                Spacer(modifier = Modifier.height(12.dp))

                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Product Name *") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth().testTag("product_name_input")
                )

                Spacer(modifier = Modifier.height(8.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedTextField(
                        value = sku,
                        onValueChange = { sku = it },
                        label = { Text("SKU *") },
                        singleLine = true,
                        modifier = Modifier.weight(1f).testTag("product_sku_input")
                    )
                    OutlinedTextField(
                        value = category,
                        onValueChange = { category = it },
                        label = { Text("Category") },
                        singleLine = true,
                        modifier = Modifier.weight(1f)
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedTextField(
                        value = baseUnit,
                        onValueChange = { baseUnit = it },
                        label = { Text("Base Unit (e.g. Can, Bottle, Kg)") },
                        singleLine = true,
                        modifier = Modifier.weight(1f)
                    )
                    OutlinedTextField(
                        value = stock,
                        onValueChange = { stock = it },
                        label = { Text("Stock") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        singleLine = true,
                        modifier = Modifier.weight(1f)
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedTextField(
                        value = costPrice,
                        onValueChange = { costPrice = it },
                        label = { Text("Cost Price ($)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        singleLine = true,
                        modifier = Modifier.weight(1f)
                    )
                    OutlinedTextField(
                        value = tier1Price,
                        onValueChange = { tier1Price = it },
                        label = { Text("Wholesale T1 ($)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        singleLine = true,
                        modifier = Modifier.weight(1f)
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))

                OutlinedTextField(
                    value = barcode,
                    onValueChange = { barcode = it },
                    label = { Text("Item Barcode") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(14.dp))

                // Multi-Unit Packaging configuration
                Text(
                    text = "Wholesale Packaging Units (${unitsList.size}):",
                    style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold)
                )

                unitsList.forEachIndexed { idx, unit ->
                    Surface(
                        color = Slate100,
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp)
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(8.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(unit.unitName, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                                Text("Factor: ${unit.conversionFactor}x • Price: $${unit.wholesalePrice}", fontSize = 11.sp, color = Color.Gray)
                            }
                            if (unitsList.size > 1) {
                                IconButton(onClick = { unitsList.removeAt(idx) }, modifier = Modifier.size(24.dp)) {
                                    Icon(Icons.Default.Delete, contentDescription = "Delete", tint = Rose500)
                                }
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedButton(onClick = onDismiss, modifier = Modifier.weight(1f)) {
                        Text("Cancel")
                    }
                    Button(
                        onClick = {
                            val savedProd = Product(
                                id = prod?.id ?: 0L,
                                name = name.ifBlank { "Untitled Product" },
                                sku = sku.ifBlank { "SKU-" + System.currentTimeMillis().toString().takeLast(6) },
                                category = category.ifBlank { "General" },
                                baseUnit = baseUnit.ifBlank { "Piece" },
                                currentStockBaseUnits = stock.toDoubleOrNull() ?: 0.0,
                                minStockAlert = minStock.toDoubleOrNull() ?: 10.0,
                                costPriceBase = costPrice.toDoubleOrNull() ?: 0.0,
                                wholesalePriceTier1 = tier1Price.toDoubleOrNull() ?: 0.0,
                                wholesalePriceTier2 = tier2Price.toDoubleOrNull() ?: 0.0,
                                wholesalePriceTier3 = tier3Price.toDoubleOrNull() ?: 0.0,
                                barcode = barcode,
                                batchNumber = batch,
                                expiryDate = expiry
                            )
                            onSave(savedProd, unitsList.toList())
                        },
                        modifier = Modifier
                            .weight(1f)
                            .testTag("save_product_btn"),
                        colors = ButtonDefaults.buttonColors(containerColor = Navy900)
                    ) {
                        Text("Save Product", color = Color.White)
                    }
                }
            }
        }
    }
}
