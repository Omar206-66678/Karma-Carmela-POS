# Carmela POS — Wholesale Food Inventory & Point of Sale

A modern, offline-first Android application designed specifically for wholesale food distributors, restaurant suppliers, and inventory managers. Built with Kotlin, Jetpack Compose, Material 3, and Room Database.

## Core Features

- **Wholesale Food Point of Sale (POS) Register**:
  - Fast product lookup by SKU, name, or barcode.
  - Interactive Barcode Scanner with camera simulation, continuous scanning, and quick wholesale barcode presets.
  - Category filtering (Oils & Vinegars, Canned Goods, Grains & Flour, Dairy & Cheese, Beverages, Condiments).
  - Multi-tier customer pricing (Tier 1 Standard Wholesale, Tier 2 Volume Retailer 5% off, Tier 3 Distributor Bulk 10% off).
  - Active wholesale cart with real-time stock availability, custom discount percentages (0-15%), and wholesale tax-exempt status.
  - Multiple payment methods: Cash, Bank Card, Net 30 Credit on Account, Bank Transfer.
  - Itemized Wholesale Invoice & Receipt dialog with print/share action.

- **Multi-Unit Pricing & Conversion Engine**:
  - Support for multi-level packaging hierarchies per food item (e.g. Single Bottle, Case of 12, Master Carton of 48, Pallets, Sacks).
  - Automatic base-unit stock calculation (`quantity * conversionFactor`).
  - Unit-specific barcodes and pricing tiers.

- **Wholesale Inventory Management**:
  - Real-time stock tracking with low-stock threshold alerts.
  - Stock Adjustment workflows:
    - Receive Wholesale Shipment (PO / Batch reference)
    - Physical Count Audit Correction
    - Spoilage & Damage Write-Off
  - Add & edit wholesale products with multi-unit packaging configuration.

- **Customer & Wholesale Accounts Ledger**:
  - Customer profiles with business name, contact, resale/tax ID, credit limit, and payment terms (Net 15, Net 30, Net 60).
  - Credit utilization tracking and outstanding receivables monitoring.
  - Record customer payments against balance.

- **Financial Analytics & Reporting**:
  - Key KPIs: Gross Revenue, Total Receivables (Credit Balances), Inventory Asset Valuation at Cost, Wholesale Valuation, Potential Margin.
  - Category inventory distribution charts.
  - Recent wholesale invoices history.
  - Comprehensive Stock Audit & Transaction Log with timestamped tracking.

## Technology Stack

- **Framework**: Android, Jetpack Compose, Material Design 3
- **Language**: Kotlin 2.1
- **Architecture**: MVVM with Repository Pattern, Kotlin Coroutines, StateFlow
- **Local Persistence**: Android Room Database with reactive Flow queries (Offline-First)
