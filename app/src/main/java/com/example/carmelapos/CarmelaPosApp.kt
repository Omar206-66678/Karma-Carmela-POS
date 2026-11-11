package com.example.carmelapos

import android.app.Application
import com.example.carmelapos.data.db.CarmelaDatabase
import com.example.carmelapos.data.repository.CarmelaRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

class CarmelaPosApp : Application() {
    val database: CarmelaDatabase by lazy { CarmelaDatabase.getDatabase(this) }
    val repository: CarmelaRepository by lazy { CarmelaRepository(database) }

    private val applicationScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    override fun onCreate() {
        super.onCreate()
        applicationScope.launch {
            repository.seedSampleDataIfEmpty()
        }
    }
}
