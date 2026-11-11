package com.example.carmelapos.ui.screens.pos

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.expandVertically
import androidx.compose.animation.shrinkVertically
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
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.ExpandLess
import androidx.compose.material.icons.filled.ExpandMore
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.QrCodeScanner
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Badge
import androidx.compose.material3.BadgedBox
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedCard
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.carmelapos.data.model.CartLineItem
import com.example.carmelapos.data.model.Customer
import com.example.carmelapos.data.model.ProductUnit
import com.example.carmelapos.data.model.ProductWithUnits
import com.example.carmelapos.ui.components.BarcodeScannerDialog
import com.example.carmelapos.ui.components.InvoiceReceiptDialog
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
import com.example.carmelapos.ui.theme.Slate300
import com.example.carmelapos.ui.theme.Slate50
import com.example.carmelapos.ui.viewmodel.PosViewModel
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PosRegisterScreen(
    viewModel: PosViewModel
) {
    val searchQuery by viewModel.searchQuery.collectAsState()
    val selectedCategory by viewModel.selectedCategory.collectAsState()
    val selectedCustomer by viewModel.selectedCustomer.collectAsState()
    val cart by viewModel.cart.collectAsState()
    val discountPercent by viewModel.discountPercent.collectAsState()
    val taxPercent by viewModel.taxPercent.collectAsState()
    val filteredProducts by viewModel.filteredProducts.collectAsState()
    val categories by viewModel.categories.collectAsState()
    val allCustomers by viewModel.allCustomers.collectAsState()
    val completedOrder by viewModel.completedOrder.collectAsState()

    var showScannerDialog by remember { mutableStateOf(false) }
    var showCartSheet by remember { mutableStateOf(false) }
    var showCustomerPicker by remember { mutableStateOf(false) }
    var selectedProductForUnitDialog by remember { mutableStateOf<ProductWithUnits?>(null) }

    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()

    LaunchedEffect(Unit) {
        viewModel.uiEvents.collectLatest { msg ->
            snackbarHostState.showSnackbar(msg)
        }
    }

    val totalItemsCount = cart.sumOf { it.quantity }
    val rawSubtotal = cart.sumOf { it.lineTotal }
    val discountAmount = rawSubtotal * (discountPercent / 100.0)
    val taxableAmount = rawSubtotal - discountAmount
    val taxAmount = taxableAmount * (taxPercent / 100.0)
    val finalTotal = taxableAmount + taxAmount

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            "Karma Carmela POS",
                            style = MaterialTheme.typography.titleLarge.copy(
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                        )
                        Text(
                            "Wholesale Register",
                            style = MaterialTheme.typography.bodySmall.copy(
                                color = Amber500,
                                fontSize = 11.sp
                            )
                        )
                    }
                },
                actions = {
                    // Customer Selector Chip
                    Box {
                        Surface(
                            shape = RoundedCornerShape(20.dp),
                            color = if (selectedCustomer != null) Amber500 else Navy700,
                            modifier = Modifier
                                .clip(RoundedCornerShape(20.dp))
                                .clickable { showCustomerPicker = true }
                                .padding(horizontal = 10.dp, vertical = 6.dp)
                                .testTag("customer_selector_chip")
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Person,
                                    contentDescription = "Customer",
                                    tint = if (selectedCustomer != null) Navy900 else Color.White,
                                    modifier = Modifier.size(16.dp)
                                )
                                Text(
                                    text = selectedCustomer?.businessName?.take(16) ?: "Walk-in Buyer",
                                    style = MaterialTheme.typography.bodySmall.copy(
                                        fontWeight = FontWeight.SemiBold,
                                        color = if (selectedCustomer != null) Navy900 else Color.White
                                    )
                                )
                                if (selectedCustomer != null) {
                                    Text(
                                        text = "T${selectedCustomer?.tierLevel}",
                                        style = MaterialTheme.typography.bodySmall.copy(
                                            fontSize = 9.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = Navy900
                                        )
                                    )
                                }
                            }
                        }

                        DropdownMenu(
                            expanded = showCustomerPicker,
                            onDismissRequest = { showCustomerPicker = false }
                        ) {
                            DropdownMenuItem(
                                text = { Text("Walk-in Wholesale Buyer (Standard Tier 1)") },
                                onClick = {
                                    viewModel.selectCustomer(null)
                                    showCustomerPicker = false
                                }
                            )
                            HorizontalDivider()
                            allCustomers.forEach { cust ->
                                DropdownMenuItem(
                                    text = {
                                        Column {
                                            Text(cust.businessName, fontWeight = FontWeight.Bold)
                                            Text(
                                                "Tier ${cust.tierLevel} | Terms: Net ${cust.paymentTermsDays} | Bal: $${String.format(Locale.US, "%.2f", cust.currentBalance)}",
                                                fontSize = 11.sp,
                                                color = Color.Gray
                                            )
                                        }
                                    },
                                    onClick = {
                                        viewModel.selectCustomer(cust)
                                        showCustomerPicker = false
                                    }
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.width(6.dp))

                    // Barcode Scanner button
                    IconButton(
                        onClick = { showScannerDialog = true },
                        modifier = Modifier.testTag("scan_barcode_header_btn")
                    ) {
                        Icon(
                            imageVector = Icons.Default.QrCodeScanner,
                            contentDescription = "Scan Barcode",
                            tint = Color.White
                        )
                    }

                    // Cart Icon with Badge
                    IconButton(
                        onClick = { showCartSheet = true },
                        modifier = Modifier.testTag("cart_header_btn")
                    ) {
                        BadgedBox(
                            badge = {
                                if (totalItemsCount > 0) {
                                    Badge(containerColor = Amber500) {
                                        Text(
                                            String.format(Locale.US, "%.0f", totalItemsCount),
                                            color = Navy900,
                                            fontWeight = FontWeight.Bold
                                        )
                                    }
                                }
                            }
                        ) {
                            Icon(
                                imageVector = Icons.Default.ShoppingCart,
                                contentDescription = "Cart",
                                tint = Color.White
                            )
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Navy900)
            )
        },
        bottomBar = {
            // Quick Checkout Summary Bar if cart has items
            if (cart.isNotEmpty()) {
                Surface(
                    color = Navy900,
                    shadowElevation = 8.dp,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp, vertical = 10.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = "${String.format(Locale.US, "%.0f", totalItemsCount)} items in cart",
                                style = MaterialTheme.typography.bodySmall.copy(color = Color.White.copy(alpha = 0.8f))
                            )
                            Text(
                                text = String.format(Locale.US, "$%.2f", finalTotal),
                                style = MaterialTheme.typography.titleLarge.copy(
                                    color = Amber500,
                                    fontWeight = FontWeight.Bold,
                                    fontFamily = FontFamily.Monospace
                                )
                            )
                        }

                        Button(
                            onClick = { showCartSheet = true },
                            colors = ButtonDefaults.buttonColors(containerColor = Emerald500),
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier.testTag("view_cart_btn")
                        ) {
                            Icon(imageVector = Icons.Default.ShoppingCart, contentDescription = null, tint = Navy900)
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Checkout", color = Navy900, fontWeight = FontWeight.Bold)
                        }
                    }
                }
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
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 12.dp, vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    OutlinedTextField(
                        value = searchQuery,
                        onValueChange = { viewModel.setSearchQuery(it) },
                        modifier = Modifier
                            .weight(1f)
                            .testTag("pos_search_input"),
                        placeholder = { Text("Search product name, SKU, or barcode...") },
                        leadingIcon = {
                            Icon(Icons.Default.Search, contentDescription = null, tint = Navy700)
                        },
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
            }

            // Categories Row
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
                        label = {
                            Text(
                                text = cat,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                            )
                        },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = Navy900,
                            selectedLabelColor = Color.White
                        )
                    )
                }
            }

            // Products Grid
            if (filteredProducts.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(32.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(
                            "No wholesale products found",
                            style = MaterialTheme.typography.titleMedium.copy(color = Color.Gray)
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            "Try searching for olive oil, flour, tomatoes, or scan barcode",
                            style = MaterialTheme.typography.bodySmall.copy(color = Color.Gray)
                        )
                    }
                }
            } else {
                LazyVerticalGrid(
                    columns = GridCells.Adaptive(minSize = 170.dp),
                    contentPadding = PaddingValues(12.dp),
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                    modifier = Modifier
                        .fillMaxSize()
                        .testTag("products_grid")
                ) {
                    items(filteredProducts) { pwu ->
                        ProductPosCard(
                            productWithUnits = pwu,
                            onUnitSelected = { unit ->
                                viewModel.addToCart(pwu, unit, 1.0)
                            },
                            onCardClick = {
                                if (pwu.units.size > 1) {
                                    selectedProductForUnitDialog = pwu
                                } else {
                                    viewModel.addToCart(pwu, pwu.units.firstOrNull(), 1.0)
                                }
                            }
                        )
                    }
                }
            }
        }
    }

    // Modal Sheet for Cart & Checkout
    if (showCartSheet) {
        val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
        ModalBottomSheet(
            onDismissRequest = { showCartSheet = false },
            sheetState = sheetState,
            containerColor = Color.White
        ) {
            CartCheckoutSheet(
                cart = cart,
                customer = selectedCustomer,
                discountPercent = discountPercent,
                taxPercent = taxPercent,
                onUpdateQty = { idx, qty -> viewModel.updateCartItemQuantity(idx, qty) },
                onChangeUnit = { idx, unit -> viewModel.changeCartItemUnit(idx, unit) },
                onRemove = { idx -> viewModel.removeCartItem(idx) },
                onClear = {
                    viewModel.clearCart()
                    showCartSheet = false
                },
                onSetDiscount = { viewModel.setDiscountPercent(it) },
                onSetTax = { viewModel.setTaxPercent(it) },
                onCheckout = { method ->
                    viewModel.processCheckout(method)
                    showCartSheet = false
                },
                onClose = { showCartSheet = false }
            )
        }
    }

    // Unit Selector Dialog (when card clicked)
    selectedProductForUnitDialog?.let { pwu ->
        UnitSelectorDialog(
            productWithUnits = pwu,
            onDismiss = { selectedProductForUnitDialog = null },
            onSelectUnit = { unit, qty ->
                viewModel.addToCart(pwu, unit, qty)
                selectedProductForUnitDialog = null
            }
        )
    }

    // Barcode Scanner Dialog
    if (showScannerDialog) {
        BarcodeScannerDialog(
            onDismiss = { showScannerDialog = false },
            onBarcodeScanned = { code ->
                viewModel.handleScannedBarcode(code)
            }
        )
    }

    // Completed Order Receipt Dialog
    completedOrder?.let { (order, items) ->
        InvoiceReceiptDialog(
            order = order,
            items = items,
            onDismiss = { viewModel.dismissReceipt() }
        )
    }
}

@Composable
fun ProductPosCard(
    productWithUnits: ProductWithUnits,
    onUnitSelected: (ProductUnit) -> Unit,
    onCardClick: () -> Unit
) {
    val prod = productWithUnits.product
    val isLowStock = prod.currentStockBaseUnits <= prod.minStockAlert

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(14.dp))
            .clickable { onCardClick() }
            .testTag("pos_product_${prod.id}"),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp)
        ) {
            // Category badge & Low Stock indicator
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Surface(
                    shape = RoundedCornerShape(6.dp),
                    color = Slate100
                ) {
                    Text(
                        text = prod.category,
                        style = MaterialTheme.typography.bodySmall.copy(
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Medium,
                            color = Navy700
                        ),
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                    )
                }

                if (isLowStock) {
                    Surface(
                        shape = RoundedCornerShape(6.dp),
                        color = Rose50
                    ) {
                        Text(
                            text = "Low Stock",
                            style = MaterialTheme.typography.bodySmall.copy(
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Bold,
                                color = Rose500
                            ),
                            modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(6.dp))

            // Product Name
            Text(
                text = prod.name,
                style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                maxLines = 2,
                overflow = TextOverflow.Ellipsis
            )

            // SKU & Stock
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 2.dp),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = prod.sku,
                    style = MaterialTheme.typography.bodySmall.copy(
                        fontSize = 10.sp,
                        color = Color.Gray,
                        fontFamily = FontFamily.Monospace
                    )
                )
                Text(
                    text = "${String.format(Locale.US, "%.0f", prod.currentStockBaseUnits)} ${prod.baseUnit}",
                    style = MaterialTheme.typography.bodySmall.copy(
                        fontSize = 10.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = if (isLowStock) Rose500 else Emerald600
                    )
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Units Chips (tap to add directly)
            Text(
                text = "Packaging Units:",
                style = MaterialTheme.typography.bodySmall.copy(fontSize = 9.sp, color = Color.Gray)
            )

            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                productWithUnits.units.take(2).forEach { unit ->
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = if (unit.isDefaultSellingUnit) Amber50 else Slate100,
                        border = androidx.compose.foundation.BorderStroke(
                            1.dp,
                            if (unit.isDefaultSellingUnit) Amber500.copy(alpha = 0.5f) else Slate200
                        ),
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { onUnitSelected(unit) }
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 6.dp, vertical = 4.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = unit.unitName,
                                style = MaterialTheme.typography.bodySmall.copy(
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Medium
                                ),
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis,
                                modifier = Modifier.weight(1f)
                            )
                            Text(
                                text = String.format(Locale.US, "$%.2f", unit.wholesalePrice),
                                style = MaterialTheme.typography.bodySmall.copy(
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Navy900
                                )
                            )
                        }
                    }
                }
                if (productWithUnits.units.size > 2) {
                    Text(
                        text = "+${productWithUnits.units.size - 2} more units (tap card)",
                        style = MaterialTheme.typography.bodySmall.copy(fontSize = 10.sp, color = Amber600)
                    )
                }
            }
        }
    }
}

@Composable
fun UnitSelectorDialog(
    productWithUnits: ProductWithUnits,
    onDismiss: () -> Unit,
    onSelectUnit: (ProductUnit, Double) -> Unit
) {
    var selectedUnit by remember {
        mutableStateOf(
            productWithUnits.units.firstOrNull { it.isDefaultSellingUnit }
                ?: productWithUnits.units.firstOrNull()
        )
    }
    var quantity by remember { mutableStateOf(1.0) }

    androidx.compose.ui.window.Dialog(onDismissRequest = onDismiss) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(8.dp)
                .testTag("unit_selector_dialog"),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(18.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Select Wholesale Unit",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                    )
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Close")
                    }
                }

                Text(
                    text = productWithUnits.product.name,
                    style = MaterialTheme.typography.bodyMedium.copy(color = Color.Gray)
                )

                Spacer(modifier = Modifier.height(14.dp))

                Text(
                    text = "Choose Packaging Unit:",
                    style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.SemiBold)
                )

                Spacer(modifier = Modifier.height(6.dp))

                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    productWithUnits.units.forEach { unit ->
                        val isSel = selectedUnit?.id == unit.id
                        OutlinedCard(
                            onClick = { selectedUnit = unit },
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.outlinedCardColors(
                                containerColor = if (isSel) Amber50 else Color.White
                            ),
                            border = androidx.compose.foundation.BorderStroke(
                                if (isSel) 2.dp else 1.dp,
                                if (isSel) Amber500 else Slate200
                            )
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(12.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column {
                                    Text(
                                        text = unit.unitName,
                                        style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold)
                                    )
                                    Text(
                                        text = "Factor: ${unit.conversionFactor} x ${productWithUnits.product.baseUnit}",
                                        style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp, color = Color.Gray)
                                    )
                                }
                                Text(
                                    text = String.format(Locale.US, "$%.2f", unit.wholesalePrice),
                                    style = MaterialTheme.typography.titleMedium.copy(
                                        fontWeight = FontWeight.Bold,
                                        color = Navy900,
                                        fontFamily = FontFamily.Monospace
                                    )
                                )
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Quantity selector
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Quantity:", style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold))
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        IconButton(
                            onClick = { if (quantity > 1) quantity -= 1 },
                            modifier = Modifier
                                .size(36.dp)
                                .background(Slate100, CircleShape)
                        ) {
                            Icon(Icons.Default.Remove, contentDescription = "Decrease")
                        }
                        Text(
                            text = String.format(Locale.US, "%.0f", quantity),
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                        )
                        IconButton(
                            onClick = { quantity += 1 },
                            modifier = Modifier
                                .size(36.dp)
                                .background(Slate100, CircleShape)
                        ) {
                            Icon(Icons.Default.Add, contentDescription = "Increase")
                        }
                    }
                }

                Spacer(modifier = Modifier.height(18.dp))

                Button(
                    onClick = {
                        selectedUnit?.let { onSelectUnit(it, quantity) }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("confirm_unit_selection_btn"),
                    colors = ButtonDefaults.buttonColors(containerColor = Navy900),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    val price = (selectedUnit?.wholesalePrice ?: 0.0) * quantity
                    Text(
                        "Add to Cart • ${String.format(Locale.US, "$%.2f", price)}",
                        color = Color.White,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}

@Composable
fun CartCheckoutSheet(
    cart: List<CartLineItem>,
    customer: Customer?,
    discountPercent: Double,
    taxPercent: Double,
    onUpdateQty: (Int, Double) -> Unit,
    onChangeUnit: (Int, ProductUnit) -> Unit,
    onRemove: (Int) -> Unit,
    onClear: () -> Unit,
    onSetDiscount: (Double) -> Unit,
    onSetTax: (Double) -> Unit,
    onCheckout: (String) -> Unit,
    onClose: () -> Unit
) {
    var selectedPaymentMethod by remember { mutableStateOf("CASH") }

    val rawSubtotal = cart.sumOf { it.lineTotal }
    val discountAmount = rawSubtotal * (discountPercent / 100.0)
    val taxableAmount = rawSubtotal - discountAmount
    val taxAmount = taxableAmount * (taxPercent / 100.0)
    val finalTotal = taxableAmount + taxAmount

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp)
            .testTag("cart_checkout_sheet")
    ) {
        // Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "Wholesale Cart (${cart.size} lines)",
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                )
                if (customer != null) {
                    Text(
                        text = "Account: ${customer.businessName} (Tier ${customer.tierLevel})",
                        style = MaterialTheme.typography.bodySmall.copy(color = Emerald600, fontWeight = FontWeight.Medium)
                    )
                }
            }
            TextButton(onClick = onClear) {
                Text("Clear All", color = Rose500)
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        // Cart items list
        LazyColumn(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f, fill = false)
                .height(200.dp)
        ) {
            itemsIndexed(cart) { index, item ->
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = item.product.name,
                                style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold),
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                            Text(
                                text = "${item.selectedUnit.unitName} @ $${String.format(Locale.US, "%.2f", item.unitPrice)}",
                                style = MaterialTheme.typography.bodySmall.copy(color = Color.Gray, fontSize = 11.sp)
                            )
                        }

                        // Qty controls
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            IconButton(
                                onClick = { onUpdateQty(index, item.quantity - 1) },
                                modifier = Modifier.size(28.dp)
                            ) {
                                Icon(Icons.Default.Remove, contentDescription = "Decrease", modifier = Modifier.size(16.dp))
                            }
                            Text(
                                text = String.format(Locale.US, "%.0f", item.quantity),
                                style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold)
                            )
                            IconButton(
                                onClick = { onUpdateQty(index, item.quantity + 1) },
                                modifier = Modifier.size(28.dp)
                            ) {
                                Icon(Icons.Default.Add, contentDescription = "Increase", modifier = Modifier.size(16.dp))
                            }
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = String.format(Locale.US, "$%.2f", item.lineTotal),
                                style = MaterialTheme.typography.bodyMedium.copy(
                                    fontWeight = FontWeight.Bold,
                                    fontFamily = FontFamily.Monospace
                                )
                            )
                            IconButton(
                                onClick = { onRemove(index) },
                                modifier = Modifier.size(28.dp)
                            ) {
                                Icon(Icons.Default.Delete, contentDescription = "Remove", tint = Rose500, modifier = Modifier.size(16.dp))
                            }
                        }
                    }
                    HorizontalDivider(color = Slate200, modifier = Modifier.padding(top = 4.dp))
                }
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Discounts and Wholesale Tax Exempt options
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text("Wholesale Discount:", style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.SemiBold))
            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                listOf(0.0, 5.0, 10.0, 15.0).forEach { disc ->
                    FilterChip(
                        selected = discountPercent == disc,
                        onClick = { onSetDiscount(disc) },
                        label = { Text("${disc.toInt()}%", fontSize = 11.sp) },
                        modifier = Modifier.height(28.dp)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(6.dp))

        // Tax toggle (Food wholesale tax exempt)
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text("Tax Status:", style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.SemiBold))
            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                FilterChip(
                    selected = taxPercent == 0.0,
                    onClick = { onSetTax(0.0) },
                    label = { Text("Exempt (0%)", fontSize = 11.sp) },
                    modifier = Modifier.height(28.dp)
                )
                FilterChip(
                    selected = taxPercent == 5.0,
                    onClick = { onSetTax(5.0) },
                    label = { Text("Standard 5%", fontSize = 11.sp) },
                    modifier = Modifier.height(28.dp)
                )
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Payment Method Selector
        Text(
            text = "Payment Method:",
            style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.SemiBold)
        )
        Spacer(modifier = Modifier.height(4.dp))
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            listOf(
                Pair("CASH", "Cash"),
                Pair("CARD", "Card"),
                Pair("NET_30_CREDIT", "Net 30"),
                Pair("BANK_TRANSFER", "Transfer")
            ).forEach { (key, label) ->
                FilterChip(
                    selected = selectedPaymentMethod == key,
                    onClick = { selectedPaymentMethod = key },
                    label = { Text(label, fontSize = 11.sp) },
                    modifier = Modifier.weight(1f)
                )
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Totals Box
        Surface(
            color = Slate100,
            shape = RoundedCornerShape(10.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(10.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("Subtotal", style = MaterialTheme.typography.bodySmall)
                    Text(String.format(Locale.US, "$%.2f", rawSubtotal), fontFamily = FontFamily.Monospace)
                }
                if (discountAmount > 0) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Wholesale Discount", style = MaterialTheme.typography.bodySmall, color = Emerald600)
                        Text(String.format(Locale.US, "-$%.2f", discountAmount), color = Emerald600, fontFamily = FontFamily.Monospace)
                    }
                }
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(if (taxPercent == 0.0) "Tax (Wholesale Exempt)" else "Tax ($taxPercent%)", style = MaterialTheme.typography.bodySmall)
                    Text(String.format(Locale.US, "$%.2f", taxAmount), fontFamily = FontFamily.Monospace)
                }
                HorizontalDivider(modifier = Modifier.padding(vertical = 4.dp), color = Slate300)
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Total Due", style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold))
                    Text(
                        String.format(Locale.US, "$%.2f", finalTotal),
                        style = MaterialTheme.typography.titleLarge.copy(
                            fontWeight = FontWeight.Bold,
                            color = Navy900,
                            fontFamily = FontFamily.Monospace
                        )
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        Button(
            onClick = { onCheckout(selectedPaymentMethod) },
            modifier = Modifier
                .fillMaxWidth()
                .testTag("complete_checkout_btn"),
            colors = ButtonDefaults.buttonColors(containerColor = Emerald600),
            shape = RoundedCornerShape(12.dp)
        ) {
            Text(
                "Complete Sale (${selectedPaymentMethod.replace('_', ' ')}) • $${String.format(Locale.US, "%.2f", finalTotal)}",
                color = Color.White,
                fontWeight = FontWeight.Bold
            )
        }
    }
}
