package com.example.carmelapos.data.repository

import com.example.carmelapos.data.db.CarmelaDatabase
import com.example.carmelapos.data.model.CartLineItem
import com.example.carmelapos.data.model.Customer
import com.example.carmelapos.data.model.Order
import com.example.carmelapos.data.model.OrderItem
import com.example.carmelapos.data.model.Product
import com.example.carmelapos.data.model.ProductUnit
import com.example.carmelapos.data.model.ProductWithUnits
import com.example.carmelapos.data.model.StockTransaction
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.withContext
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class CarmelaRepository(private val db: CarmelaDatabase) {

    private val productDao = db.productDao()
    private val unitDao = db.productUnitDao()
    private val customerDao = db.customerDao()
    private val orderDao = db.orderDao()
    private val transactionDao = db.stockTransactionDao()

    val allProductsWithUnits: Flow<List<ProductWithUnits>> = combine(
        productDao.getAllProducts(),
        unitDao.getAllUnits()
    ) { products, units ->
        products.map { product ->
            ProductWithUnits(
                product = product,
                units = units.filter { it.productId == product.id }
            )
        }
    }

    val lowStockProducts: Flow<List<Product>> = productDao.getLowStockProducts()
    val allCustomers: Flow<List<Customer>> = customerDao.getAllCustomers()
    val allOrders: Flow<List<Order>> = orderDao.getAllOrders()
    val recentTransactions: Flow<List<StockTransaction>> = transactionDao.getRecentTransactions(100)

    suspend fun getProductWithUnitsById(id: Long): ProductWithUnits? = withContext(Dispatchers.IO) {
        val prod = productDao.getProductById(id) ?: return@withContext null
        val units = unitDao.getUnitsForProductSync(id)
        ProductWithUnits(prod, units)
    }

    suspend fun findByBarcode(barcode: String): Pair<Product, ProductUnit?>? = withContext(Dispatchers.IO) {
        val clean = barcode.trim()
        if (clean.isEmpty()) return@withContext null

        // Check if matching unit barcode directly
        val unit = unitDao.getUnitByBarcode(clean)
        if (unit != null) {
            val prod = productDao.getProductById(unit.productId)
            if (prod != null) {
                return@withContext Pair(prod, unit)
            }
        }

        // Check product barcode or SKU
        val prod = productDao.getProductByBarcode(clean)
        if (prod != null) {
            val units = unitDao.getUnitsForProductSync(prod.id)
            val defaultUnit = units.firstOrNull { it.isDefaultSellingUnit } ?: units.firstOrNull()
            return@withContext Pair(prod, defaultUnit)
        }

        null
    }

    suspend fun saveProductWithUnits(
        product: Product,
        units: List<ProductUnit>
    ): Long = withContext(Dispatchers.IO) {
        val prodId = if (product.id == 0L) {
            productDao.insertProduct(product)
        } else {
            productDao.updateProduct(product)
            unitDao.deleteUnitsForProduct(product.id)
            product.id
        }

        val updatedUnits = units.map { it.copy(productId = prodId) }
        unitDao.insertUnits(updatedUnits)

        prodId
    }

    suspend fun deleteProduct(productId: Long) = withContext(Dispatchers.IO) {
        unitDao.deleteUnitsForProduct(productId)
        productDao.deleteProduct(productId)
    }

    suspend fun adjustStock(
        productId: Long,
        type: String, // "RECEIVING", "AUDIT_ADJUSTMENT", "SPOILAGE_WRITE_OFF"
        deltaBaseUnits: Double,
        referenceInfo: String,
        notes: String
    ): Boolean = withContext(Dispatchers.IO) {
        val prod = productDao.getProductById(productId) ?: return@withContext false
        val prevStock = prod.currentStockBaseUnits
        val newStock = (prevStock + deltaBaseUnits).coerceAtLeast(0.0)

        productDao.updateStock(productId, newStock)
        transactionDao.insertTransaction(
            StockTransaction(
                productId = productId,
                productName = prod.name,
                type = type,
                quantityBaseUnits = deltaBaseUnits,
                previousStock = prevStock,
                newStock = newStock,
                referenceInfo = referenceInfo,
                notes = notes
            )
        )
        true
    }

    suspend fun saveCustomer(customer: Customer): Long = withContext(Dispatchers.IO) {
        if (customer.id == 0L) {
            customerDao.insertCustomer(customer)
        } else {
            customerDao.updateCustomer(customer)
            customer.id
        }
    }

    suspend fun adjustCustomerBalance(customerId: Long, amount: Double) = withContext(Dispatchers.IO) {
        customerDao.adjustCustomerBalance(customerId, amount)
    }

    suspend fun checkoutOrder(
        customer: Customer?,
        cartItems: List<CartLineItem>,
        discountPercent: Double,
        taxPercent: Double,
        paymentMethod: String,
        notes: String
    ): Result<Order> = withContext(Dispatchers.IO) {
        if (cartItems.isEmpty()) {
            return@withContext Result.failure(IllegalArgumentException("Cart is empty"))
        }

        val rawSubtotal = cartItems.sumOf { it.lineTotal }
        val discountAmount = rawSubtotal * (discountPercent / 100.0)
        val taxable = rawSubtotal - discountAmount
        val taxAmount = taxable * (taxPercent / 100.0)
        val finalTotal = taxable + taxAmount

        val orderNumber = "INV-" + SimpleDateFormat("yyMMdd-HHmmss", Locale.US).format(Date())
        val isCredit = paymentMethod == "NET_30_CREDIT"
        val paymentStatus = if (isCredit) "CREDIT_PENDING" else "PAID"

        val order = Order(
            orderNumber = orderNumber,
            customerId = customer?.id,
            customerName = customer?.businessName ?: "Walk-in Wholesale Buyer",
            timestamp = System.currentTimeMillis(),
            subtotal = rawSubtotal,
            discountPercent = discountPercent,
            discountAmount = discountAmount,
            taxPercent = taxPercent,
            taxAmount = taxAmount,
            totalAmount = finalTotal,
            paymentMethod = paymentMethod,
            paymentStatus = paymentStatus,
            notes = notes
        )

        val orderId = orderDao.insertOrder(order)
        val savedOrder = order.copy(id = orderId)

        val orderItems = cartItems.map { item ->
            OrderItem(
                orderId = orderId,
                productId = item.product.id,
                productName = item.product.name,
                unitName = item.selectedUnit.unitName,
                unitQuantity = item.quantity,
                conversionFactor = item.selectedUnit.conversionFactor,
                totalBaseUnits = item.totalBaseUnits,
                unitPrice = item.unitPrice,
                lineTotal = item.lineTotal,
                costPrice = item.selectedUnit.costPrice
            )
        }
        orderDao.insertOrderItems(orderItems)

        // Deduct inventory stock & record transactions
        for (item in cartItems) {
            val prod = productDao.getProductById(item.product.id)
            if (prod != null) {
                val prevStock = prod.currentStockBaseUnits
                val newStock = (prevStock - item.totalBaseUnits).coerceAtLeast(0.0)
                productDao.updateStock(prod.id, newStock)

                transactionDao.insertTransaction(
                    StockTransaction(
                        productId = prod.id,
                        productName = prod.name,
                        type = "SALE",
                        quantityBaseUnits = -item.totalBaseUnits,
                        previousStock = prevStock,
                        newStock = newStock,
                        referenceInfo = orderNumber,
                        notes = "Sold ${item.quantity} x ${item.selectedUnit.unitName}"
                    )
                )
            }
        }

        // If Net 30 Credit, increase customer's balance
        if (isCredit && customer != null) {
            customerDao.adjustCustomerBalance(customer.id, finalTotal)
        }

        Result.success(savedOrder)
    }

    suspend fun getOrderItems(orderId: Long): List<OrderItem> = withContext(Dispatchers.IO) {
        orderDao.getItemsForOrder(orderId)
    }

    suspend fun seedSampleDataIfEmpty() = withContext(Dispatchers.IO) {
        val existing = productDao.getAllProducts().first()
        if (existing.isNotEmpty()) return@withContext

        // Seed Customers
        val cust1 = Customer(
            businessName = "Carmela Trattoria & Pizzeria",
            contactName = "Marco Bellini",
            phone = "+1 (555) 234-5678",
            email = "marco@carmelatrattoria.com",
            address = "450 Grand Ave, Little Italy",
            taxId = "US-987654321",
            tierLevel = 2,
            creditLimit = 15000.0,
            currentBalance = 3450.0,
            paymentTermsDays = 30
        )
        val cust2 = Customer(
            businessName = "Metro Artisan Bakery & Deli",
            contactName = "Elena Rostova",
            phone = "+1 (555) 876-5432",
            email = "orders@metrobakery.com",
            address = "120 Market St, Financial District",
            taxId = "US-123456789",
            tierLevel = 3,
            creditLimit = 25000.0,
            currentBalance = 1200.0,
            paymentTermsDays = 15
        )
        val cust3 = Customer(
            businessName = "Golden Harvest Bistro",
            contactName = "Chef Julian Vance",
            phone = "+1 (555) 345-6789",
            email = "jvance@goldenharvest.com",
            address = "780 Vineyard Blvd, Westside",
            taxId = "US-456789012",
            tierLevel = 1,
            creditLimit = 8000.0,
            currentBalance = 0.0,
            paymentTermsDays = 30
        )
        customerDao.insertCustomer(cust1)
        customerDao.insertCustomer(cust2)
        customerDao.insertCustomer(cust3)

        // Seed Products with Multi-Units
        val sampleProducts = listOf(
            Triple(
                Product(
                    name = "Extra Virgin Olive Oil (Cold Pressed)",
                    sku = "EVOO-ITA-500",
                    category = "Oils & Vinegars",
                    baseUnit = "Bottle (500ml)",
                    currentStockBaseUnits = 240.0,
                    minStockAlert = 48.0,
                    costPriceBase = 6.50,
                    wholesalePriceTier1 = 9.80,
                    wholesalePriceTier2 = 9.20,
                    wholesalePriceTier3 = 8.75,
                    barcode = "800123456701",
                    batchNumber = "LOT-2026-A12",
                    expiryDate = "2027-08-30",
                    supplier = "Tuscany Mills Co."
                ),
                listOf(
                    ProductUnit(0, 0, "Bottle (500ml)", 1.0, 9.80, 6.50, "800123456701", false),
                    ProductUnit(0, 0, "Case of 12", 12.0, 110.00, 78.00, "800123456718", true),
                    ProductUnit(0, 0, "Master Carton (48)", 48.0, 420.00, 312.00, "800123456749", false)
                ),
                "Extra Virgin Olive Oil"
            ),
            Triple(
                Product(
                    name = "San Marzano D.O.P. Whole Peeled Tomatoes",
                    sku = "TOM-SM-2500",
                    category = "Canned Goods",
                    baseUnit = "Can (#10 - 2.5kg)",
                    currentStockBaseUnits = 180.0,
                    minStockAlert = 36.0,
                    costPriceBase = 7.20,
                    wholesalePriceTier1 = 11.50,
                    wholesalePriceTier2 = 10.75,
                    wholesalePriceTier3 = 10.20,
                    barcode = "800234567802",
                    batchNumber = "SM-26-09",
                    expiryDate = "2028-05-15",
                    supplier = "Campania Agraria"
                ),
                listOf(
                    ProductUnit(0, 0, "Can (2.5kg)", 1.0, 11.50, 7.20, "800234567802", false),
                    ProductUnit(0, 0, "Case of 6", 6.0, 64.00, 43.20, "800234567819", true),
                    ProductUnit(0, 0, "Pallet (120 Cans)", 120.0, 1220.00, 864.00, "800234567857", false)
                ),
                "San Marzano Tomatoes"
            ),
            Triple(
                Product(
                    name = "Caputo '00' Pizzeria Flour",
                    sku = "FLR-CAP-25KG",
                    category = "Grains & Flour",
                    baseUnit = "Bag (25kg)",
                    currentStockBaseUnits = 85.0,
                    minStockAlert = 20.0,
                    costPriceBase = 22.00,
                    wholesalePriceTier1 = 34.50,
                    wholesalePriceTier2 = 32.00,
                    wholesalePriceTier3 = 29.50,
                    barcode = "800345678903",
                    batchNumber = "FL-044-2026",
                    expiryDate = "2027-02-10",
                    supplier = "Molino Caputo"
                ),
                listOf(
                    ProductUnit(0, 0, "Bag (25kg)", 1.0, 34.50, 22.00, "800345678903", true),
                    ProductUnit(0, 0, "Half-Pallet (20 Bags)", 20.0, 650.00, 440.00, "800345678910", false),
                    ProductUnit(0, 0, "Full Pallet (40 Bags)", 40.0, 1240.00, 880.00, "800345678927", false)
                ),
                "Caputo Flour"
            ),
            Triple(
                Product(
                    name = "Parmigiano Reggiano 24-Mo Wheel (Quarter)",
                    sku = "CHS-PARM-10KG",
                    category = "Dairy & Cheese",
                    baseUnit = "Quarter Wheel (10kg)",
                    currentStockBaseUnits = 24.0,
                    minStockAlert = 6.0,
                    costPriceBase = 185.00,
                    wholesalePriceTier1 = 265.00,
                    wholesalePriceTier2 = 250.00,
                    wholesalePriceTier3 = 238.00,
                    barcode = "800456789004",
                    batchNumber = "PR-DOP-882",
                    expiryDate = "2027-01-20",
                    supplier = "Parma Consorzio"
                ),
                listOf(
                    ProductUnit(0, 0, "Quarter Wheel (10kg)", 1.0, 265.00, 185.00, "800456789004", true),
                    ProductUnit(0, 0, "Half Wheel (20kg)", 2.0, 510.00, 370.00, "800456789011", false),
                    ProductUnit(0, 0, "Full Wheel (40kg)", 4.0, 990.00, 740.00, "800456789028", false)
                ),
                "Parmigiano Wheel"
            ),
            Triple(
                Product(
                    name = "Barista Oat Milk (Organic)",
                    sku = "MLK-OAT-1L",
                    category = "Beverages",
                    baseUnit = "Tetra-Pak (1L)",
                    currentStockBaseUnits = 360.0,
                    minStockAlert = 60.0,
                    costPriceBase = 1.60,
                    wholesalePriceTier1 = 2.80,
                    wholesalePriceTier2 = 2.50,
                    wholesalePriceTier3 = 2.30,
                    barcode = "800567890105",
                    batchNumber = "OAT-993",
                    expiryDate = "2026-12-30",
                    supplier = "Alpine Organics"
                ),
                listOf(
                    ProductUnit(0, 0, "Single (1L)", 1.0, 2.80, 1.60, "800567890105", false),
                    ProductUnit(0, 0, "Case of 6", 6.0, 15.60, 9.60, "800567890112", true),
                    ProductUnit(0, 0, "Carton (24)", 24.0, 58.00, 38.40, "800567890129", false)
                ),
                "Barista Oat Milk"
            ),
            Triple(
                Product(
                    name = "Balsamic Vinegar of Modena I.G.P.",
                    sku = "VIN-BAL-5L",
                    category = "Oils & Vinegars",
                    baseUnit = "Jug (5L)",
                    currentStockBaseUnits = 42.0,
                    minStockAlert = 10.0,
                    costPriceBase = 28.00,
                    wholesalePriceTier1 = 44.00,
                    wholesalePriceTier2 = 41.50,
                    wholesalePriceTier3 = 39.00,
                    barcode = "800678901206",
                    batchNumber = "MOD-5L-33",
                    expiryDate = "2029-10-10",
                    supplier = "Acetaia Reale"
                ),
                listOf(
                    ProductUnit(0, 0, "Jug (5L)", 1.0, 44.00, 28.00, "800678901206", true),
                    ProductUnit(0, 0, "Case of 4 Jugs", 4.0, 168.00, 112.00, "800678901213", false)
                ),
                "Balsamic Vinegar 5L"
            ),
            Triple(
                Product(
                    name = "Artisan Bronze-Die Rigatoni Pasta",
                    sku = "PST-RIG-5KG",
                    category = "Grains & Flour",
                    baseUnit = "Bag (5kg)",
                    currentStockBaseUnits = 110.0,
                    minStockAlert = 25.0,
                    costPriceBase = 8.50,
                    wholesalePriceTier1 = 14.20,
                    wholesalePriceTier2 = 13.00,
                    wholesalePriceTier3 = 12.20,
                    barcode = "800789012307",
                    batchNumber = "PAST-771",
                    expiryDate = "2028-03-31",
                    supplier = "Pastificio Gentile"
                ),
                listOf(
                    ProductUnit(0, 0, "Bag (5kg)", 1.0, 14.20, 8.50, "800789012307", false),
                    ProductUnit(0, 0, "Box of 4 Bags (20kg)", 4.0, 52.00, 34.00, "800789012314", true)
                ),
                "Rigatoni Pasta"
            ),
            Triple(
                Product(
                    name = "Sicilian Sea Salt (Fine Bulk)",
                    sku = "SLT-SIC-10KG",
                    category = "Condiments & Spices",
                    baseUnit = "Sack (10kg)",
                    currentStockBaseUnits = 65.0,
                    minStockAlert = 15.0,
                    costPriceBase = 7.00,
                    wholesalePriceTier1 = 12.00,
                    wholesalePriceTier2 = 11.00,
                    wholesalePriceTier3 = 9.80,
                    barcode = "800890123408",
                    batchNumber = "SLT-2026",
                    expiryDate = "2030-01-01",
                    supplier = "Saline Trapani"
                ),
                listOf(
                    ProductUnit(0, 0, "Sack (10kg)", 1.0, 12.00, 7.00, "800890123408", true),
                    ProductUnit(0, 0, "Bundle (5 Sacks / 50kg)", 5.0, 54.00, 35.00, "800890123415", false)
                ),
                "Sicilian Sea Salt"
            )
        )

        for (triple in sampleProducts) {
            val prod = triple.first
            val units = triple.second
            saveProductWithUnits(prod, units)
        }

        // Seed 2 initial sample orders for realistic analytics
        val allProds = productDao.getAllProducts().first()
        val allUnits = unitDao.getAllUnits().first()

        val sample1Prod = allProds.firstOrNull { it.sku == "EVOO-ITA-500" }
        val sample1Unit = allUnits.firstOrNull { it.productId == sample1Prod?.id && it.conversionFactor == 12.0 }

        val sample2Prod = allProds.firstOrNull { it.sku == "TOM-SM-2500" }
        val sample2Unit = allUnits.firstOrNull { it.productId == sample2Prod?.id && it.conversionFactor == 6.0 }

        if (sample1Prod != null && sample1Unit != null && sample2Prod != null && sample2Unit != null) {
            val cartList = listOf(
                CartLineItem(sample1Prod, sample1Unit, quantity = 3.0),
                CartLineItem(sample2Prod, sample2Unit, quantity = 5.0)
            )
            checkoutOrder(
                customer = cust1,
                cartItems = cartList,
                discountPercent = 5.0,
                taxPercent = 0.0,
                paymentMethod = "NET_30_CREDIT",
                notes = "Weekly restaurant wholesale supply order"
            )
        }
    }
}
