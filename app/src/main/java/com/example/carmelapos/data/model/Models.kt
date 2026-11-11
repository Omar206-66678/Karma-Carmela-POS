package com.example.carmelapos.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "products")
data class Product(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val name: String,
    val sku: String,
    val category: String,
    val baseUnit: String, // e.g. "Piece", "Kg", "Bottle", "Can"
    val currentStockBaseUnits: Double,
    val minStockAlert: Double,
    val costPriceBase: Double,
    val wholesalePriceTier1: Double, // Standard wholesale
    val wholesalePriceTier2: Double, // Volume wholesale (e.g. 5% discount)
    val wholesalePriceTier3: Double, // Distributor bulk (e.g. 10% discount)
    val barcode: String,
    val batchNumber: String = "",
    val expiryDate: String = "",
    val supplier: String = "Carmela Wholesale Direct",
    val notes: String = ""
)

@Entity(tableName = "product_units")
data class ProductUnit(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val productId: Long = 0,
    val unitName: String, // e.g. "Case (24)", "Box (12)", "Carton (48)", "Single"
    val conversionFactor: Double, // Number of base units in this unit (e.g., 24.0)
    val wholesalePrice: Double, // Price for this packaging unit
    val costPrice: Double,
    val barcode: String,
    val isDefaultSellingUnit: Boolean = false
)

@Entity(tableName = "customers")
data class Customer(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val businessName: String,
    val contactName: String,
    val phone: String,
    val email: String,
    val address: String,
    val taxId: String,
    val tierLevel: Int = 1, // 1: Standard Wholesale, 2: Preferred, 3: Bulk Distributor
    val creditLimit: Double = 5000.0,
    val currentBalance: Double = 0.0, // Amount owed
    val paymentTermsDays: Int = 30 // Net 15, Net 30, Net 60, or 0 for Cash
)

@Entity(tableName = "orders")
data class Order(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val orderNumber: String,
    val customerId: Long?,
    val customerName: String,
    val timestamp: Long = System.currentTimeMillis(),
    val subtotal: Double,
    val discountPercent: Double = 0.0,
    val discountAmount: Double = 0.0,
    val taxPercent: Double = 0.0,
    val taxAmount: Double = 0.0,
    val totalAmount: Double,
    val paymentMethod: String, // "CASH", "CARD", "NET_30_CREDIT", "BANK_TRANSFER"
    val paymentStatus: String, // "PAID", "CREDIT_PENDING", "PARTIALLY_PAID"
    val notes: String = ""
)

@Entity(tableName = "order_items")
data class OrderItem(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val orderId: Long,
    val productId: Long,
    val productName: String,
    val unitName: String,
    val unitQuantity: Double,
    val conversionFactor: Double,
    val totalBaseUnits: Double,
    val unitPrice: Double,
    val lineTotal: Double,
    val costPrice: Double
)

@Entity(tableName = "stock_transactions")
data class StockTransaction(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val productId: Long,
    val productName: String,
    val type: String, // "SALE", "RECEIVING", "AUDIT_ADJUSTMENT", "SPOILAGE_WRITE_OFF"
    val quantityBaseUnits: Double,
    val previousStock: Double,
    val newStock: Double,
    val referenceInfo: String = "",
    val timestamp: Long = System.currentTimeMillis(),
    val notes: String = ""
)

data class ProductWithUnits(
    val product: Product,
    val units: List<ProductUnit>
)

data class CartLineItem(
    val product: Product,
    val selectedUnit: ProductUnit,
    val quantity: Double = 1.0,
    val customUnitPrice: Double? = null
) {
    val unitPrice: Double
        get() = customUnitPrice ?: selectedUnit.wholesalePrice

    val totalBaseUnits: Double
        get() = quantity * selectedUnit.conversionFactor

    val lineTotal: Double
        get() = quantity * unitPrice
}
