package com.example.carmelapos.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.carmelapos.data.model.CartLineItem
import com.example.carmelapos.data.model.Customer
import com.example.carmelapos.data.model.Order
import com.example.carmelapos.data.model.OrderItem
import com.example.carmelapos.data.model.Product
import com.example.carmelapos.data.model.ProductUnit
import com.example.carmelapos.data.model.ProductWithUnits
import com.example.carmelapos.data.model.StockTransaction
import com.example.carmelapos.data.repository.CarmelaRepository
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.util.Calendar

class PosViewModel(private val repository: CarmelaRepository) : ViewModel() {

    private val _searchQuery = MutableStateFlow("")
    val searchQuery = _searchQuery.asStateFlow()

    private val _selectedCategory = MutableStateFlow("ALL")
    val selectedCategory = _selectedCategory.asStateFlow()

    private val _selectedCustomer = MutableStateFlow<Customer?>(null)
    val selectedCustomer = _selectedCustomer.asStateFlow()

    private val _cart = MutableStateFlow<List<CartLineItem>>(emptyList())
    val cart = _cart.asStateFlow()

    private val _discountPercent = MutableStateFlow(0.0)
    val discountPercent = _discountPercent.asStateFlow()

    private val _taxPercent = MutableStateFlow(0.0) // Wholesale food is often tax exempt (0%)
    val taxPercent = _taxPercent.asStateFlow()

    private val _orderNotes = MutableStateFlow("")
    val orderNotes = _orderNotes.asStateFlow()

    private val _completedOrder = MutableStateFlow<Pair<Order, List<OrderItem>>?>(null)
    val completedOrder = _completedOrder.asStateFlow()

    private val _uiEvents = MutableSharedFlow<String>()
    val uiEvents: SharedFlow<String> = _uiEvents.asSharedFlow()

    val allCustomers: StateFlow<List<Customer>> = repository.allCustomers
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val filteredProducts: StateFlow<List<ProductWithUnits>> = combine(
        repository.allProductsWithUnits,
        _searchQuery,
        _selectedCategory
    ) { products, query, category ->
        products.filter { pwu ->
            val matchesCategory = category == "ALL" || pwu.product.category.equals(category, ignoreCase = true)
            val matchesQuery = query.isBlank() ||
                    pwu.product.name.contains(query, ignoreCase = true) ||
                    pwu.product.sku.contains(query, ignoreCase = true) ||
                    pwu.product.barcode.contains(query, ignoreCase = true) ||
                    pwu.units.any { it.barcode.contains(query, ignoreCase = true) }
            matchesCategory && matchesQuery
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val categories: StateFlow<List<String>> = repository.allProductsWithUnits
        .combine(MutableStateFlow(Unit)) { products, _ ->
            listOf("ALL") + products.map { it.product.category }.distinct().sorted()
        }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), listOf("ALL"))

    fun setSearchQuery(query: String) {
        _searchQuery.value = query
    }

    fun setSelectedCategory(cat: String) {
        _selectedCategory.value = cat
    }

    fun selectCustomer(customer: Customer?) {
        _selectedCustomer.value = customer
        // Update cart prices if customer has a special tier
        if (customer != null) {
            recalculateCartForCustomerTier(customer.tierLevel)
        }
    }

    private fun recalculateCartForCustomerTier(tier: Int) {
        val current = _cart.value
        val updated = current.map { item ->
            val tierDiscountFactor = when (tier) {
                3 -> 0.90 // 10% wholesale bulk discount
                2 -> 0.95 // 5% wholesale preferred discount
                else -> 1.0
            }
            val adjustedUnit = item.selectedUnit.copy(
                wholesalePrice = item.selectedUnit.wholesalePrice * tierDiscountFactor
            )
            item.copy(selectedUnit = adjustedUnit)
        }
        _cart.value = updated
    }

    fun addToCart(productWithUnits: ProductWithUnits, unit: ProductUnit? = null, qty: Double = 1.0) {
        val selectedUnit = unit ?: productWithUnits.units.firstOrNull { it.isDefaultSellingUnit }
        ?: productWithUnits.units.firstOrNull()
        ?: ProductUnit(
            productId = productWithUnits.product.id,
            unitName = productWithUnits.product.baseUnit,
            conversionFactor = 1.0,
            wholesalePrice = productWithUnits.product.wholesalePriceTier1,
            costPrice = productWithUnits.product.costPriceBase,
            barcode = productWithUnits.product.barcode,
            isDefaultSellingUnit = true
        )

        val current = _cart.value.toMutableList()
        val index = current.indexOfFirst {
            it.product.id == productWithUnits.product.id && it.selectedUnit.id == selectedUnit.id
        }

        if (index >= 0) {
            val existing = current[index]
            current[index] = existing.copy(quantity = existing.quantity + qty)
        } else {
            // Apply customer tier discount if customer selected
            val tier = _selectedCustomer.value?.tierLevel ?: 1
            val tierPrice = when (tier) {
                3 -> selectedUnit.wholesalePrice * 0.90
                2 -> selectedUnit.wholesalePrice * 0.95
                else -> selectedUnit.wholesalePrice
            }
            current.add(
                CartLineItem(
                    product = productWithUnits.product,
                    selectedUnit = selectedUnit.copy(wholesalePrice = tierPrice),
                    quantity = qty
                )
            )
        }
        _cart.value = current
    }

    fun updateCartItemQuantity(index: Int, newQty: Double) {
        val current = _cart.value.toMutableList()
        if (index in current.indices) {
            if (newQty <= 0) {
                current.removeAt(index)
            } else {
                current[index] = current[index].copy(quantity = newQty)
            }
            _cart.value = current
        }
    }

    fun changeCartItemUnit(index: Int, newUnit: ProductUnit) {
        val current = _cart.value.toMutableList()
        if (index in current.indices) {
            val tier = _selectedCustomer.value?.tierLevel ?: 1
            val tierPrice = when (tier) {
                3 -> newUnit.wholesalePrice * 0.90
                2 -> newUnit.wholesalePrice * 0.95
                else -> newUnit.wholesalePrice
            }
            current[index] = current[index].copy(
                selectedUnit = newUnit.copy(wholesalePrice = tierPrice)
            )
            _cart.value = current
        }
    }

    fun removeCartItem(index: Int) {
        val current = _cart.value.toMutableList()
        if (index in current.indices) {
            current.removeAt(index)
            _cart.value = current
        }
    }

    fun clearCart() {
        _cart.value = emptyList()
        _discountPercent.value = 0.0
        _orderNotes.value = ""
    }

    fun setDiscountPercent(percent: Double) {
        _discountPercent.value = percent.coerceIn(0.0, 100.0)
    }

    fun setTaxPercent(percent: Double) {
        _taxPercent.value = percent.coerceIn(0.0, 100.0)
    }

    fun setOrderNotes(notes: String) {
        _orderNotes.value = notes
    }

    fun handleScannedBarcode(barcode: String) {
        viewModelScope.launch {
            val result = repository.findByBarcode(barcode)
            if (result != null) {
                val pwu = repository.getProductWithUnitsById(result.first.id)
                if (pwu != null) {
                    addToCart(pwu, result.second)
                    _uiEvents.emit("Scanned: ${result.first.name} (${result.second?.unitName ?: "Base"})")
                }
            } else {
                _uiEvents.emit("Barcode not found: $barcode")
            }
        }
    }

    fun processCheckout(paymentMethod: String) {
        viewModelScope.launch {
            val cartItems = _cart.value
            if (cartItems.isEmpty()) {
                _uiEvents.emit("Cart is empty")
                return@launch
            }

            val cust = _selectedCustomer.value
            if (paymentMethod == "NET_30_CREDIT") {
                if (cust == null) {
                    _uiEvents.emit("Credit sale requires selecting a customer account")
                    return@launch
                }
                val total = cartItems.sumOf { it.lineTotal }
                if (cust.currentBalance + total > cust.creditLimit) {
                    _uiEvents.emit("Warning: Exceeds credit limit of $${cust.creditLimit}")
                }
            }

            val res = repository.checkoutOrder(
                customer = cust,
                cartItems = cartItems,
                discountPercent = _discountPercent.value,
                taxPercent = _taxPercent.value,
                paymentMethod = paymentMethod,
                notes = _orderNotes.value
            )

            res.onSuccess { order ->
                val items = repository.getOrderItems(order.id)
                _completedOrder.value = Pair(order, items)
                clearCart()
                _uiEvents.emit("Order ${order.orderNumber} completed!")
            }.onFailure { err ->
                _uiEvents.emit("Checkout error: ${err.message}")
            }
        }
    }

    fun dismissReceipt() {
        _completedOrder.value = null
    }
}

class InventoryViewModel(private val repository: CarmelaRepository) : ViewModel() {

    private val _searchQuery = MutableStateFlow("")
    val searchQuery = _searchQuery.asStateFlow()

    private val _selectedCategory = MutableStateFlow("ALL")
    val selectedCategory = _selectedCategory.asStateFlow()

    private val _lowStockOnly = MutableStateFlow(false)
    val lowStockOnly = _lowStockOnly.asStateFlow()

    private val _uiEvents = MutableSharedFlow<String>()
    val uiEvents: SharedFlow<String> = _uiEvents.asSharedFlow()

    val productsWithUnits: StateFlow<List<ProductWithUnits>> = combine(
        repository.allProductsWithUnits,
        _searchQuery,
        _selectedCategory,
        _lowStockOnly
    ) { products, query, cat, lowOnly ->
        products.filter { pwu ->
            val matchesCategory = cat == "ALL" || pwu.product.category.equals(cat, ignoreCase = true)
            val matchesQuery = query.isBlank() ||
                    pwu.product.name.contains(query, ignoreCase = true) ||
                    pwu.product.sku.contains(query, ignoreCase = true) ||
                    pwu.product.barcode.contains(query, ignoreCase = true)
            val matchesLow = !lowOnly || pwu.product.currentStockBaseUnits <= pwu.product.minStockAlert
            matchesCategory && matchesQuery && matchesLow
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val lowStockCount: StateFlow<Int> = repository.lowStockProducts
        .combine(MutableStateFlow(Unit)) { list, _ -> list.size }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)

    val categories: StateFlow<List<String>> = repository.allProductsWithUnits
        .combine(MutableStateFlow(Unit)) { products, _ ->
            listOf("ALL") + products.map { it.product.category }.distinct().sorted()
        }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), listOf("ALL"))

    val recentTransactions: StateFlow<List<StockTransaction>> = repository.recentTransactions
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    fun setSearchQuery(q: String) { _searchQuery.value = q }
    fun setSelectedCategory(c: String) { _selectedCategory.value = c }
    fun toggleLowStockOnly() { _lowStockOnly.value = !_lowStockOnly.value }

    fun adjustStock(
        productId: Long,
        type: String,
        deltaUnits: Double,
        reference: String,
        notes: String
    ) {
        viewModelScope.launch {
            val success = repository.adjustStock(productId, type, deltaUnits, reference, notes)
            if (success) {
                _uiEvents.emit("Stock adjusted successfully")
            } else {
                _uiEvents.emit("Failed to adjust stock")
            }
        }
    }

    fun saveProduct(product: Product, units: List<ProductUnit>) {
        viewModelScope.launch {
            repository.saveProductWithUnits(product, units)
            _uiEvents.emit("Product '${product.name}' saved")
        }
    }

    fun deleteProduct(productId: Long) {
        viewModelScope.launch {
            repository.deleteProduct(productId)
            _uiEvents.emit("Product deleted")
        }
    }
}

class CustomerViewModel(private val repository: CarmelaRepository) : ViewModel() {

    private val _searchQuery = MutableStateFlow("")
    val searchQuery = _searchQuery.asStateFlow()

    private val _uiEvents = MutableSharedFlow<String>()
    val uiEvents: SharedFlow<String> = _uiEvents.asSharedFlow()

    val filteredCustomers: StateFlow<List<Customer>> = combine(
        repository.allCustomers,
        _searchQuery
    ) { customers, query ->
        if (query.isBlank()) customers
        else customers.filter {
            it.businessName.contains(query, ignoreCase = true) ||
                    it.contactName.contains(query, ignoreCase = true) ||
                    it.taxId.contains(query, ignoreCase = true)
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    fun setSearchQuery(q: String) { _searchQuery.value = q }

    fun saveCustomer(customer: Customer) {
        viewModelScope.launch {
            repository.saveCustomer(customer)
            _uiEvents.emit("Customer '${customer.businessName}' saved")
        }
    }

    fun recordPayment(customerId: Long, amount: Double) {
        viewModelScope.launch {
            // Negative adjustment decreases currentBalance
            repository.adjustCustomerBalance(customerId, -amount)
            _uiEvents.emit("Payment of $$amount recorded")
        }
    }
}

class ReportingViewModel(private val repository: CarmelaRepository) : ViewModel() {

    val allOrders: StateFlow<List<Order>> = repository.allOrders
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val allProductsWithUnits: StateFlow<List<ProductWithUnits>> = repository.allProductsWithUnits
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val allCustomers: StateFlow<List<Customer>> = repository.allCustomers
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val recentTransactions: StateFlow<List<StockTransaction>> = repository.recentTransactions
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val totalReceivables: StateFlow<Double> = repository.allCustomers
        .combine(MutableStateFlow(Unit)) { customers, _ ->
            customers.sumOf { it.currentBalance }
        }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0.0)

    val inventoryValuation: StateFlow<Pair<Double, Double>> = repository.allProductsWithUnits
        .combine(MutableStateFlow(Unit)) { products, _ ->
            var costTotal = 0.0
            var wholesaleTotal = 0.0
            for (p in products) {
                costTotal += p.product.currentStockBaseUnits * p.product.costPriceBase
                wholesaleTotal += p.product.currentStockBaseUnits * p.product.wholesalePriceTier1
            }
            Pair(costTotal, wholesaleTotal)
        }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), Pair(0.0, 0.0))
}

class ViewModelFactory(private val repository: CarmelaRepository) : ViewModelProvider.Factory {
    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        return when {
            modelClass.isAssignableFrom(PosViewModel::class.java) -> PosViewModel(repository) as T
            modelClass.isAssignableFrom(InventoryViewModel::class.java) -> InventoryViewModel(repository) as T
            modelClass.isAssignableFrom(CustomerViewModel::class.java) -> CustomerViewModel(repository) as T
            modelClass.isAssignableFrom(ReportingViewModel::class.java) -> ReportingViewModel(repository) as T
            else -> throw IllegalArgumentException("Unknown ViewModel class ${modelClass.name}")
        }
    }
}
