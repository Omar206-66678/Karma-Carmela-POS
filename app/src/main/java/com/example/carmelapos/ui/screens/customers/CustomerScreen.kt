package com.example.carmelapos.ui.screens.customers

import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Business
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Payment
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.carmelapos.data.model.Customer
import com.example.carmelapos.ui.theme.Amber50
import com.example.carmelapos.ui.theme.Amber500
import com.example.carmelapos.ui.theme.Amber600
import com.example.carmelapos.ui.theme.Emerald50
import com.example.carmelapos.ui.theme.Emerald600
import com.example.carmelapos.ui.theme.Navy700
import com.example.carmelapos.ui.theme.Navy800
import com.example.carmelapos.ui.theme.Navy900
import com.example.carmelapos.ui.theme.Rose50
import com.example.carmelapos.ui.theme.Rose500
import com.example.carmelapos.ui.theme.Slate100
import com.example.carmelapos.ui.theme.Slate200
import com.example.carmelapos.ui.theme.Slate50
import com.example.carmelapos.ui.viewmodel.CustomerViewModel
import kotlinx.coroutines.flow.collectLatest
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CustomerScreen(
    viewModel: CustomerViewModel
) {
    val searchQuery by viewModel.searchQuery.collectAsState()
    val filteredCustomers by viewModel.filteredCustomers.collectAsState()

    var showAddDialog by remember { mutableStateOf(false) }
    var customerForEdit by remember { mutableStateOf<Customer?>(null) }
    var customerForPayment by remember { mutableStateOf<Customer?>(null) }

    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(Unit) {
        viewModel.uiEvents.collectLatest { msg ->
            snackbarHostState.showSnackbar(msg)
        }
    }

    val totalReceivables = filteredCustomers.sumOf { it.currentBalance }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            "Wholesale Accounts",
                            style = MaterialTheme.typography.titleLarge.copy(
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                        )
                        Text(
                            "Receivables: $${String.format(Locale.US, "%.2f", totalReceivables)}",
                            style = MaterialTheme.typography.bodySmall.copy(
                                color = Amber500,
                                fontSize = 11.sp
                            )
                        )
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
                modifier = Modifier.testTag("add_customer_fab")
            ) {
                Icon(Icons.Default.Add, contentDescription = "Add Customer")
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
                        .testTag("customer_search_input"),
                    placeholder = { Text("Search by business name, contact, or tax ID...") },
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

            // Customer Accounts List
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .testTag("customer_list"),
                contentPadding = PaddingValues(12.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(filteredCustomers) { cust ->
                    CustomerAccountCard(
                        customer = cust,
                        onPayment = { customerForPayment = cust },
                        onEdit = { customerForEdit = cust }
                    )
                }
            }
        }
    }

    // Add / Edit Dialog
    if (showAddDialog || customerForEdit != null) {
        CustomerFormDialog(
            existing = customerForEdit,
            onDismiss = {
                showAddDialog = false
                customerForEdit = null
            },
            onSave = { saved ->
                viewModel.saveCustomer(saved)
                showAddDialog = false
                customerForEdit = null
            }
        )
    }

    // Record Payment Dialog
    customerForPayment?.let { cust ->
        RecordPaymentDialog(
            customer = cust,
            onDismiss = { customerForPayment = null },
            onConfirm = { amount ->
                viewModel.recordPayment(cust.id, amount)
                customerForPayment = null
            }
        )
    }
}

@Composable
fun CustomerAccountCard(
    customer: Customer,
    onPayment: () -> Unit,
    onEdit: () -> Unit
) {
    val utilization = if (customer.creditLimit > 0) {
        (customer.currentBalance / customer.creditLimit).toFloat().coerceIn(0f, 1f)
    } else 0f
    val isNearLimit = customer.currentBalance > customer.creditLimit * 0.85

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .testTag("customer_card_${customer.id}"),
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
                        text = customer.businessName,
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                    )
                    Text(
                        text = "Contact: ${customer.contactName}",
                        style = MaterialTheme.typography.bodySmall.copy(color = Color.Gray)
                    )
                }

                // Tier Badge
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = when (customer.tierLevel) {
                        3 -> Navy900
                        2 -> Amber500
                        else -> Slate100
                    }
                ) {
                    Text(
                        text = "Tier ${customer.tierLevel}",
                        style = MaterialTheme.typography.bodySmall.copy(
                            fontWeight = FontWeight.Bold,
                            color = when (customer.tierLevel) {
                                3 -> Amber500
                                2 -> Navy900
                                else -> Navy700
                            },
                            fontSize = 11.sp
                        ),
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(6.dp))

            // Contact Info
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                if (customer.phone.isNotBlank()) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Phone, contentDescription = null, modifier = Modifier.size(12.dp), tint = Color.Gray)
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(customer.phone, style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp, color = Color.Gray))
                    }
                }
                if (customer.email.isNotBlank()) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Email, contentDescription = null, modifier = Modifier.size(12.dp), tint = Color.Gray)
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(customer.email.take(20), style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp, color = Color.Gray))
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Credit Balance & Terms
            Surface(
                shape = RoundedCornerShape(8.dp),
                color = Slate100,
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(10.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = "Credit Balance: $${String.format(Locale.US, "%.2f", customer.currentBalance)}",
                            style = MaterialTheme.typography.bodySmall.copy(
                                fontWeight = FontWeight.Bold,
                                color = if (isNearLimit) Rose500 else Navy900
                            )
                        )
                        Text(
                            text = "Limit: $${String.format(Locale.US, "%.0f", customer.creditLimit)}",
                            style = MaterialTheme.typography.bodySmall.copy(color = Color.Gray)
                        )
                    }

                    Spacer(modifier = Modifier.height(4.dp))

                    LinearProgressIndicator(
                        progress = { utilization },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(6.dp),
                        color = if (isNearLimit) Rose500 else Emerald600,
                        trackColor = Slate200
                    )

                    Spacer(modifier = Modifier.height(4.dp))

                    Text(
                        text = "Terms: Net ${customer.paymentTermsDays} days • Tax ID: ${customer.taxId}",
                        style = MaterialTheme.typography.bodySmall.copy(fontSize = 10.sp, color = Color.Gray)
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Actions
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                OutlinedButton(
                    onClick = onPayment,
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.testTag("record_payment_${customer.id}")
                ) {
                    Icon(Icons.Default.Payment, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Record Payment", fontSize = 12.sp)
                }

                IconButton(onClick = onEdit, modifier = Modifier.testTag("edit_customer_${customer.id}")) {
                    Icon(Icons.Default.Edit, contentDescription = "Edit", tint = Navy700)
                }
            }
        }
    }
}

@Composable
fun RecordPaymentDialog(
    customer: Customer,
    onDismiss: () -> Unit,
    onConfirm: (Double) -> Unit
) {
    var amountText by remember { mutableStateOf(String.format(Locale.US, "%.2f", customer.currentBalance)) }

    Dialog(onDismissRequest = onDismiss) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(8.dp)
                .testTag("record_payment_dialog"),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp)
            ) {
                Text(
                    text = "Record Customer Payment",
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                )
                Text(
                    text = customer.businessName,
                    style = MaterialTheme.typography.bodySmall.copy(color = Color.Gray)
                )
                Text(
                    text = "Outstanding Balance: $${String.format(Locale.US, "%.2f", customer.currentBalance)}",
                    style = MaterialTheme.typography.bodyMedium.copy(
                        fontWeight = FontWeight.Bold,
                        color = Navy900
                    )
                )

                Spacer(modifier = Modifier.height(14.dp))

                OutlinedTextField(
                    value = amountText,
                    onValueChange = { amountText = it },
                    label = { Text("Payment Amount ($)") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    singleLine = true,
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("payment_amount_input")
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
                            val amt = amountText.toDoubleOrNull() ?: 0.0
                            if (amt > 0) onConfirm(amt)
                        },
                        modifier = Modifier
                            .weight(1f)
                            .testTag("confirm_payment_btn"),
                        colors = ButtonDefaults.buttonColors(containerColor = Emerald600)
                    ) {
                        Text("Apply Payment", color = Color.White)
                    }
                }
            }
        }
    }
}

@Composable
fun CustomerFormDialog(
    existing: Customer?,
    onDismiss: () -> Unit,
    onSave: (Customer) -> Unit
) {
    var businessName by remember { mutableStateOf(existing?.businessName ?: "") }
    var contactName by remember { mutableStateOf(existing?.contactName ?: "") }
    var phone by remember { mutableStateOf(existing?.phone ?: "") }
    var email by remember { mutableStateOf(existing?.email ?: "") }
    var address by remember { mutableStateOf(existing?.address ?: "") }
    var taxId by remember { mutableStateOf(existing?.taxId ?: "") }
    var tierLevel by remember { mutableStateOf(existing?.tierLevel ?: 1) }
    var creditLimit by remember { mutableStateOf(existing?.creditLimit?.toString() ?: "10000") }
    var paymentTerms by remember { mutableStateOf(existing?.paymentTermsDays?.toString() ?: "30") }

    Dialog(onDismissRequest = onDismiss) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(4.dp)
                .testTag("customer_form_dialog"),
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
                    text = if (existing == null) "New Wholesale Account" else "Edit Account",
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                )

                Spacer(modifier = Modifier.height(12.dp))

                OutlinedTextField(
                    value = businessName,
                    onValueChange = { businessName = it },
                    label = { Text("Business / Restaurant Name *") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth().testTag("customer_business_name_input")
                )

                Spacer(modifier = Modifier.height(8.dp))

                OutlinedTextField(
                    value = contactName,
                    onValueChange = { contactName = it },
                    label = { Text("Contact Person") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(8.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedTextField(
                        value = phone,
                        onValueChange = { phone = it },
                        label = { Text("Phone") },
                        singleLine = true,
                        modifier = Modifier.weight(1f)
                    )
                    OutlinedTextField(
                        value = email,
                        onValueChange = { email = it },
                        label = { Text("Email") },
                        singleLine = true,
                        modifier = Modifier.weight(1f)
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))

                OutlinedTextField(
                    value = address,
                    onValueChange = { address = it },
                    label = { Text("Delivery Address") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(8.dp))

                OutlinedTextField(
                    value = taxId,
                    onValueChange = { taxId = it },
                    label = { Text("Resale / Tax ID") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(10.dp))

                Text("Wholesale Pricing Tier:", style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.SemiBold))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    listOf(
                        Pair(1, "Tier 1 (Std)"),
                        Pair(2, "Tier 2 (5%)"),
                        Pair(3, "Tier 3 (10%)")
                    ).forEach { (tier, label) ->
                        FilterChip(
                            selected = tierLevel == tier,
                            onClick = { tierLevel = tier },
                            label = { Text(label, fontSize = 11.sp) },
                            modifier = Modifier.weight(1f)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedTextField(
                        value = creditLimit,
                        onValueChange = { creditLimit = it },
                        label = { Text("Credit Limit ($)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        singleLine = true,
                        modifier = Modifier.weight(1f)
                    )
                    OutlinedTextField(
                        value = paymentTerms,
                        onValueChange = { paymentTerms = it },
                        label = { Text("Net Days") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        singleLine = true,
                        modifier = Modifier.weight(1f)
                    )
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
                            val cust = Customer(
                                id = existing?.id ?: 0L,
                                businessName = businessName.ifBlank { "Untitled Account" },
                                contactName = contactName,
                                phone = phone,
                                email = email,
                                address = address,
                                taxId = taxId,
                                tierLevel = tierLevel,
                                creditLimit = creditLimit.toDoubleOrNull() ?: 5000.0,
                                currentBalance = existing?.currentBalance ?: 0.0,
                                paymentTermsDays = paymentTerms.toIntOrNull() ?: 30
                            )
                            onSave(cust)
                        },
                        modifier = Modifier
                            .weight(1f)
                            .testTag("save_customer_btn"),
                        colors = ButtonDefaults.buttonColors(containerColor = Navy900)
                    ) {
                        Text("Save Account", color = Color.White)
                    }
                }
            }
        }
    }
}
