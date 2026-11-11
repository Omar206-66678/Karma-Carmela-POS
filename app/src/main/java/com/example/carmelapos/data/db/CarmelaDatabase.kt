package com.example.carmelapos.data.db

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.example.carmelapos.data.model.Customer
import com.example.carmelapos.data.model.Order
import com.example.carmelapos.data.model.OrderItem
import com.example.carmelapos.data.model.Product
import com.example.carmelapos.data.model.ProductUnit
import com.example.carmelapos.data.model.StockTransaction

@Database(
    entities = [
        Product::class,
        ProductUnit::class,
        Customer::class,
        Order::class,
        OrderItem::class,
        StockTransaction::class
    ],
    version = 1,
    exportSchema = false
)
abstract class CarmelaDatabase : RoomDatabase() {
    abstract fun productDao(): ProductDao
    abstract fun productUnitDao(): ProductUnitDao
    abstract fun customerDao(): CustomerDao
    abstract fun orderDao(): OrderDao
    abstract fun stockTransactionDao(): StockTransactionDao

    companion object {
        @Volatile
        private var INSTANCE: CarmelaDatabase? = null

        fun getDatabase(context: Context): CarmelaDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    CarmelaDatabase::class.java,
                    "carmela_pos_database"
                )
                    .fallbackToDestructiveMigration()
                    .build()
                INSTANCE = instance
                instance
            }
        }
    }
}
