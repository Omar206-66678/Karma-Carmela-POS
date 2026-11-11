package com.example.carmelapos.data.db

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.example.carmelapos.data.model.Customer
import com.example.carmelapos.data.model.Order
import com.example.carmelapos.data.model.OrderItem
import com.example.carmelapos.data.model.Product
import com.example.carmelapos.data.model.ProductUnit
import com.example.carmelapos.data.model.StockTransaction
import kotlinx.coroutines.flow.Flow

@Dao
interface ProductDao {
    @Query("SELECT * FROM products ORDER BY name ASC")
    fun getAllProducts(): Flow<List<Product>>

    @Query("SELECT * FROM products WHERE id = :id")
    suspend fun getProductById(id: Long): Product?

    @Query("SELECT * FROM products WHERE barcode = :barcode OR sku = :barcode LIMIT 1")
    suspend fun getProductByBarcode(barcode: String): Product?

    @Query("SELECT * FROM products WHERE currentStockBaseUnits <= minStockAlert ORDER BY currentStockBaseUnits ASC")
    fun getLowStockProducts(): Flow<List<Product>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertProduct(product: Product): Long

    @Update
    suspend fun updateProduct(product: Product)

    @Query("UPDATE products SET currentStockBaseUnits = :newStock WHERE id = :productId")
    suspend fun updateStock(productId: Long, newStock: Double)

    @Query("DELETE FROM products WHERE id = :id")
    suspend fun deleteProduct(id: Long)
}

@Dao
interface ProductUnitDao {
    @Query("SELECT * FROM product_units WHERE productId = :productId")
    fun getUnitsForProduct(productId: Long): Flow<List<ProductUnit>>

    @Query("SELECT * FROM product_units WHERE productId = :productId")
    suspend fun getUnitsForProductSync(productId: Long): List<ProductUnit>

    @Query("SELECT * FROM product_units WHERE barcode = :barcode LIMIT 1")
    suspend fun getUnitByBarcode(barcode: String): ProductUnit?

    @Query("SELECT * FROM product_units")
    fun getAllUnits(): Flow<List<ProductUnit>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertUnit(unit: ProductUnit): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertUnits(units: List<ProductUnit>)

    @Query("DELETE FROM product_units WHERE productId = :productId")
    suspend fun deleteUnitsForProduct(productId: Long)
}

@Dao
interface CustomerDao {
    @Query("SELECT * FROM customers ORDER BY businessName ASC")
    fun getAllCustomers(): Flow<List<Customer>>

    @Query("SELECT * FROM customers WHERE id = :id")
    suspend fun getCustomerById(id: Long): Customer?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCustomer(customer: Customer): Long

    @Update
    suspend fun updateCustomer(customer: Customer)

    @Query("UPDATE customers SET currentBalance = currentBalance + :amount WHERE id = :customerId")
    suspend fun adjustCustomerBalance(customerId: Long, amount: Double)

    @Query("DELETE FROM customers WHERE id = :id")
    suspend fun deleteCustomer(id: Long)
}

@Dao
interface OrderDao {
    @Query("SELECT * FROM orders ORDER BY timestamp DESC")
    fun getAllOrders(): Flow<List<Order>>

    @Query("SELECT * FROM orders WHERE id = :orderId")
    suspend fun getOrderById(orderId: Long): Order?

    @Query("SELECT * FROM order_items WHERE orderId = :orderId")
    suspend fun getItemsForOrder(orderId: Long): List<OrderItem>

    @Query("SELECT * FROM order_items WHERE orderId = :orderId")
    fun getItemsForOrderFlow(orderId: Long): Flow<List<OrderItem>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrder(order: Order): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrderItems(items: List<OrderItem>)

    @Query("SELECT * FROM orders WHERE timestamp >= :sinceTimestamp ORDER BY timestamp DESC")
    fun getOrdersSince(sinceTimestamp: Long): Flow<List<Order>>
}

@Dao
interface StockTransactionDao {
    @Query("SELECT * FROM stock_transactions ORDER BY timestamp DESC LIMIT :limit")
    fun getRecentTransactions(limit: Int = 100): Flow<List<StockTransaction>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTransaction(transaction: StockTransaction): Long
}
