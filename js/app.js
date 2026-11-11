/**
 * Karma Carmela POS & ERP - Next-Gen Application Engine
 * Arabic RTL, Foodics/Daftra Inspired, Customer & Supplier Statements, Multi-Unit & Tafqeet
 */

// ==========================================================================
// TAFQEET ENGINE (Arabic Numbers to Words Converter)
// ==========================================================================
function tafqeet(number, currency = 'EGP') {
    if (isNaN(number) || number < 0) return '';
    if (number === 0) return 'فقط صفر جنيهاً مصرياً لا غير';

    const ones = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
    const teens = ['عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
    const tens = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
    const hundreds = ['', 'مائة', 'مئتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];

    const thousands = { singular: 'ألف', dual: 'ألفان', plural: 'آلاف' };
    const millions = { singular: 'مليون', dual: 'مليونان', plural: 'ملايين' };

    function convertGroup(n) {
        let h = Math.floor(n / 100);
        let rem = n % 100;
        let parts = [];
        if (h > 0) parts.push(hundreds[h]);
        if (rem > 0) {
            if (rem < 10) parts.push(ones[rem]);
            else if (rem < 20) parts.push(teens[rem - 10]);
            else {
                let u = rem % 10;
                let t = Math.floor(rem / 10);
                if (u > 0) parts.push(ones[u] + ' و' + tens[t]);
                else parts.push(tens[t]);
            }
        }
        return parts.join(' و');
    }

    let intPart = Math.floor(number);
    let decPart = Math.round((number - intPart) * 100);
    let parts = [];

    // Millions
    let mill = Math.floor(intPart / 1000000);
    intPart %= 1000000;
    if (mill > 0) {
        if (mill === 1) parts.push(millions.singular);
        else if (mill === 2) parts.push(millions.dual);
        else if (mill >= 3 && mill <= 10) parts.push(convertGroup(mill) + ' ' + millions.plural);
        else parts.push(convertGroup(mill) + ' ' + millions.singular);
    }

    // Thousands
    let thous = Math.floor(intPart / 1000);
    intPart %= 1000;
    if (thous > 0) {
        if (thous === 1) parts.push(thousands.singular);
        else if (thous === 2) parts.push(thousands.dual);
        else if (thous >= 3 && thous <= 10) parts.push(convertGroup(thous) + ' ' + thousands.plural);
        else parts.push(convertGroup(thous) + ' ' + thousands.singular);
    }

    if (intPart > 0) parts.push(convertGroup(intPart));

    let mainWord = parts.length > 0 ? parts.join(' و') : 'صفر';
    let result = 'فقط ' + mainWord + ' جنيهاً مصرياً';
    if (decPart > 0) result += ' و' + convertGroup(decPart) + ' قرشاً';
    result += ' لا غير';
    return result;
}

// ==========================================================================
// SOUND SYNTHESIS FOR BARCODE SCANNER
// ==========================================================================
function playBeep() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1760, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
    } catch (e) {}
}

// ==========================================================================
// DEFAULT SEED DATA
// ==========================================================================
const DEFAULT_PRODUCTS = [
    {
        id: 1,
        name: 'زيت زيتون بكر ممتاز إيطالي (عصرة أولى)',
        sku: 'EVOO-ITA-500',
        category: 'الزيوت والخل',
        baseUnit: 'عبوة (500 مل)',
        currentStock: 360,
        minStock: 48,
        costPrice: 95.0,
        wholesalePrice: 135.0,
        barcode: '800123456701',
        supplierId: 1,
        units: [
            { id: 101, name: 'عبوة فردية', factor: 1, price: 135.0, cost: 95.0, barcode: '800123456701' },
            { id: 102, name: 'كرتونة (12 عبوة)', factor: 12, price: 1550.0, cost: 1140.0, barcode: '800123456718', isDefault: true },
            { id: 103, name: 'ماستر كرتون (48 عبوة)', factor: 48, price: 6000.0, cost: 4560.0, barcode: '800123456749' }
        ]
    },
    {
        id: 2,
        name: 'طماطم سان مارزانو إيطالية مقشرة D.O.P',
        sku: 'TOM-SM-2500',
        category: 'المعلبات والأغذية المحفوظة',
        baseUnit: 'علبة (2.5 كجم)',
        currentStock: 240,
        minStock: 36,
        costPrice: 110.0,
        wholesalePrice: 160.0,
        barcode: '800234567802',
        supplierId: 4,
        units: [
            { id: 201, name: 'علبة (2.5 كجم)', factor: 1, price: 160.0, cost: 110.0, barcode: '800234567802' },
            { id: 202, name: 'كرتونة (6 علب)', factor: 6, price: 920.0, cost: 660.0, barcode: '800234567819', isDefault: true },
            { id: 203, name: 'باليتة توريد (120 علبة)', factor: 120, price: 17800.0, cost: 13200.0, barcode: '800234567857' }
        ]
    },
    {
        id: 3,
        name: 'دقيق كابوتو بيتزا إيطالي فاخر (Caputo 00)',
        sku: 'FLR-CAP-25KG',
        category: 'الدقيق والحبوب',
        baseUnit: 'شوال (25 كجم)',
        currentStock: 80,
        minStock: 15,
        costPrice: 650.0,
        wholesalePrice: 880.0,
        barcode: '800345678903',
        supplierId: 2,
        units: [
            { id: 301, name: 'شوال (25 كجم)', factor: 1, price: 880.0, cost: 650.0, barcode: '800345678903', isDefault: true },
            { id: 302, name: 'نصف باليتة (20 شوال)', factor: 20, price: 17000.0, cost: 13000.0, barcode: '800345678910' },
            { id: 303, name: 'باليتة كاملة (40 شوال)', factor: 40, price: 33500.0, cost: 26000.0, barcode: '800345678927' }
        ]
    },
    {
        id: 4,
        name: 'جبن بارميجيانو ريجيانو معتق (ربع قالب)',
        sku: 'CHS-PARM-10KG',
        category: 'الألبان والأجبان',
        baseUnit: 'ربع قالب (10 كجم)',
        currentStock: 25,
        minStock: 5,
        costPrice: 4200.0,
        wholesalePrice: 5600.0,
        barcode: '800456789004',
        supplierId: 3,
        units: [
            { id: 401, name: 'ربع قالب (10 كجم)', factor: 1, price: 5600.0, cost: 4200.0, barcode: '800456789004', isDefault: true },
            { id: 402, name: 'نصف قالب (20 كجم)', factor: 2, price: 10900.0, cost: 8400.0, barcode: '800456789011' }
        ]
    },
    {
        id: 5,
        name: 'حليب شوفان عضوي باريستا (Barista Oat)',
        sku: 'MLK-OAT-1L',
        category: 'المشروبات والعصائر',
        baseUnit: 'تترا باك (1 لتر)',
        currentStock: 480,
        minStock: 60,
        costPrice: 45.0,
        wholesalePrice: 65.0,
        barcode: '800567890105',
        supplierId: 3,
        units: [
            { id: 501, name: 'عبوة (1 لتر)', factor: 1, price: 65.0, cost: 45.0, barcode: '800567890105' },
            { id: 502, name: 'كرتونة (6 عبوات)', factor: 6, price: 370.0, cost: 270.0, barcode: '800567890112', isDefault: true },
            { id: 503, name: 'ماستر (24 عبوة)', factor: 24, price: 1420.0, cost: 1080.0, barcode: '800567890129' }
        ]
    },
    {
        id: 6,
        name: 'خل بلسميك إيطالي فاخر I.G.P (جالون مطاعم)',
        sku: 'VIN-BAL-5L',
        category: 'الزيوت والخل',
        baseUnit: 'جالون (5 لتر)',
        currentStock: 40,
        minStock: 8,
        costPrice: 480.0,
        wholesalePrice: 690.0,
        barcode: '800678901206',
        supplierId: 1,
        units: [
            { id: 601, name: 'جالون (5 لتر)', factor: 1, price: 690.0, cost: 480.0, barcode: '800678901206', isDefault: true },
            { id: 602, name: 'كرتونة (4 جيلان)', factor: 4, price: 2650.0, cost: 1920.0, barcode: '800678901213' }
        ]
    },
    {
        id: 7,
        name: 'مكرونة ريجاتوني إيطالي أرتيزان (برونز داي)',
        sku: 'PST-RIG-5KG',
        category: 'المكرونة والبقوليات',
        baseUnit: 'كيس فندقي (5 كجم)',
        currentStock: 120,
        minStock: 20,
        costPrice: 140.0,
        wholesalePrice: 210.0,
        barcode: '800789012307',
        supplierId: 2,
        units: [
            { id: 701, name: 'كيس (5 كجم)', factor: 1, price: 210.0, cost: 140.0, barcode: '800789012307' },
            { id: 702, name: 'كرتونة (4 أكياس / 20 كجم)', factor: 4, price: 800.0, cost: 560.0, barcode: '800789012314', isDefault: true }
        ]
    },
    {
        id: 8,
        name: 'ملح بحري ناعم صقلي مخصص للخبز والمطاعم',
        sku: 'SLT-SIC-10KG',
        category: 'التوابل والبهارات',
        baseUnit: 'شوال (10 كجم)',
        currentStock: 90,
        minStock: 15,
        costPrice: 85.0,
        wholesalePrice: 130.0,
        barcode: '800890123408',
        supplierId: 4,
        units: [
            { id: 801, name: 'شوال (10 كجم)', factor: 1, price: 130.0, cost: 85.0, barcode: '800890123408', isDefault: true },
            { id: 802, name: 'ربطة جملة (5 شكاير / 50 كجم)', factor: 5, price: 600.0, cost: 425.0, barcode: '800890123415' }
        ]
    }
];

const DEFAULT_CUSTOMERS = [
    {
        id: 1,
        businessName: 'مطعم وبيتزا كارميلا جراند',
        contactName: 'الشيف ماركو فهمي',
        phone: '01001234567',
        taxId: 'EG-984-210',
        tier: 2,
        creditLimit: 35000,
        currentBalance: 7850,
        paymentTerms: 30,
        statement: [
            { date: '2026-11-01', desc: 'رصيد مرحل افتتاحي', debit: 5000, credit: 0, balance: 5000 },
            { date: '2026-11-05', desc: 'فاتورة مبيعات توريد أسبوعي INV-2611-1020', debit: 5850, credit: 0, balance: 10850 },
            { date: '2026-11-08', desc: 'سداد نقدي دفعة حساب (سند قبض #401)', debit: 0, credit: 3000, balance: 7850 }
        ]
    },
    {
        id: 2,
        businessName: 'سوبرماركت مترو & كافيه ديلي',
        contactName: 'أ/ أيمن الشريف',
        phone: '01123456789',
        taxId: 'EG-114-882',
        tier: 3,
        creditLimit: 50000,
        currentBalance: 2400,
        paymentTerms: 15,
        statement: [
            { date: '2026-11-03', desc: 'فاتورة مبيعات جملة INV-2611-1045', debit: 7400, credit: 0, balance: 7400 },
            { date: '2026-11-07', desc: 'تحويل بنكي دفعة حساب (سند قبض #402)', debit: 0, credit: 5000, balance: 2400 }
        ]
    },
    {
        id: 3,
        businessName: 'فندق وكافيه شيراتون بيسترو',
        contactName: 'م/ سامح عبد العزيز',
        phone: '01234567890',
        taxId: 'EG-551-739',
        tier: 1,
        creditLimit: 20000,
        currentBalance: 0,
        paymentTerms: 30,
        statement: [
            { date: '2026-11-04', desc: 'فاتورة مبيعات INV-2611-1011', debit: 3200, credit: 0, balance: 3200 },
            { date: '2026-11-04', desc: 'سداد فوري عند الاستلام نقداً', debit: 0, credit: 3200, balance: 0 }
        ]
    }
];

const DEFAULT_SUPPLIERS = [
    {
        id: 1,
        name: 'مزارع الوادي لزيوت الزيتون الفاخرة',
        contact: 'م/ حازم النجار',
        phone: '01011223344',
        paymentTerms: 30,
        bankAccount: 'EG3300020001000987654321',
        currentBalance: 14500,
        statement: [
            { date: '2026-11-01', desc: 'فاتورة توريد كراتين زيت زيتون SUP-26-01', debit: 0, credit: 24500, balance: 24500 },
            { date: '2026-11-06', desc: 'سند صرف دفعة مورد بشيك مصرفي #901', debit: 10000, credit: 0, balance: 14500 }
        ]
    },
    {
        id: 2,
        name: 'مطاحن ومصانع كابوتو للدقيق الإيطالي',
        contact: 'أ/ كمال الألفي',
        phone: '01222334455',
        paymentTerms: 30,
        bankAccount: 'EG5500030002000123456789',
        currentBalance: 22000,
        statement: [
            { date: '2026-11-02', desc: 'فاتورة توريد باليتات دقيق كابوتو SUP-26-04', debit: 0, credit: 32000, balance: 32000 },
            { date: '2026-11-07', desc: 'سداد دفعة للمورد بتحويل بنكي #902', debit: 10000, credit: 0, balance: 22000 }
        ]
    },
    {
        id: 3,
        name: 'دلتا مصر لتوزيع الألبان والأجبان المستوردة',
        contact: 'الشيف رامي يوسف',
        phone: '01133445566',
        paymentTerms: 15,
        bankAccount: 'EG8800040003000456789012',
        currentBalance: 9800,
        statement: [
            { date: '2026-11-05', desc: 'فاتورة توريد قوالب بارميجيانو وحليب شوفان SUP-26-08', debit: 0, credit: 15800, balance: 15800 },
            { date: '2026-11-09', desc: 'سداد نقدي من الخزينة #903', debit: 6000, credit: 0, balance: 9800 }
        ]
    },
    {
        id: 4,
        name: 'الأهرام للتصنيع وتوزيع المعلبات الغذائية',
        contact: 'أ/ مدحت بركات',
        phone: '01044556677',
        paymentTerms: 30,
        bankAccount: 'EG1100050004000789012345',
        currentBalance: 5200,
        statement: [
            { date: '2026-11-03', desc: 'فاتورة توريد طماطم معلبة وملح بحري SUP-26-09', debit: 0, credit: 10200, balance: 10200 },
            { date: '2026-11-08', desc: 'سداد دفعة نقدية #904', debit: 5000, credit: 0, balance: 5200 }
        ]
    }
];

const DEFAULT_PURCHASES = [
    {
        id: 1,
        invoiceNumber: 'SUP-26-01',
        supplierId: 1,
        supplierName: 'مزارع الوادي لزيوت الزيتون الفاخرة',
        date: '2026-11-01 10:30',
        totalAmount: 24500,
        paymentStatus: 'آجل على الحساب',
        items: [
            { productName: 'زيت زيتون بكر ممتاز إيطالي', quantity: 20, unitPrice: 1140, total: 22800 },
            { productName: 'خل بلسميك إيطالي 5 لتر', quantity: 3, unitPrice: 566.6, total: 1700 }
        ]
    },
    {
        id: 2,
        invoiceNumber: 'SUP-26-04',
        supplierId: 2,
        supplierName: 'مطاحن ومصانع كابوتو للدقيق الإيطالي',
        date: '2026-11-02 11:45',
        totalAmount: 32000,
        paymentStatus: 'آجل على الحساب',
        items: [
            { productName: 'دقيق كابوتو بيتزا إيطالي فاخر 25 كجم', quantity: 40, unitPrice: 650, total: 26000 },
            { productName: 'مكرونة ريجاتوني إيطالي 5 كجم', quantity: 10, unitPrice: 600, total: 6000 }
        ]
    }
];

// ==========================================================================
// KARMA CARMELA POS & ERP MAIN CONTROLLER
// ==========================================================================
class KarmaCarmelaApp {
    constructor() {
        // Load persistent data or defaults
        this.products = JSON.parse(localStorage.getItem('carmela_products')) || DEFAULT_PRODUCTS;
        this.customers = JSON.parse(localStorage.getItem('carmela_customers')) || DEFAULT_CUSTOMERS;
        this.suppliers = JSON.parse(localStorage.getItem('carmela_suppliers')) || DEFAULT_SUPPLIERS;
        this.orders = JSON.parse(localStorage.getItem('carmela_orders')) || [];
        this.purchases = JSON.parse(localStorage.getItem('carmela_purchases')) || DEFAULT_PURCHASES;
        this.auditLog = JSON.parse(localStorage.getItem('carmela_audit_log')) || [];
        this.theme = localStorage.getItem('carmela_theme') || 'dark';

        // Session state
        this.currentScreen = 'home';
        this.selectedCategory = 'ALL';
        this.searchQuery = '';
        this.cart = [];
        this.selectedCustomer = null;
        this.discountPercent = 0;
        this.taxPercent = 0;
        this.paymentMethod = 'CASH';

        // Active Detail Modals state
        this.activeDetailCustomer = null;
        this.activeDetailSupplier = null;

        this.init();
    }

    init() {
        this.applyTheme(this.theme);
        this.saveAll();
        this.updateWelcomeGreeting();
        this.renderHome();
        this.renderCategories();
        this.renderProducts();
        this.renderInventory();
        this.renderCustomers();
        this.renderSuppliers();
        this.renderReports();
        this.initQuickBarcodes();
    }

    saveAll() {
        localStorage.setItem('carmela_products', JSON.stringify(this.products));
        localStorage.setItem('carmela_customers', JSON.stringify(this.customers));
        localStorage.setItem('carmela_suppliers', JSON.stringify(this.suppliers));
        localStorage.setItem('carmela_orders', JSON.stringify(this.orders));
        localStorage.setItem('carmela_purchases', JSON.stringify(this.purchases));
        localStorage.setItem('carmela_audit_log', JSON.stringify(this.auditLog));
    }

    // ==========================================================================
    // THEME SWITCHER (Dark & Light Mode Toggle)
    // ==========================================================================
    toggleTheme() {
        this.theme = this.theme === 'dark' ? 'light' : 'dark';
        this.applyTheme(this.theme);
        localStorage.setItem('carmela_theme', this.theme);
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) {
            metaTheme.setAttribute('content', theme === 'dark' ? '#0A0F1D' : '#F3F5F9');
        }
    }

    // ==========================================================================
    // SIDEBAR DRAWER (علامة الشروط الثلاثة ☰)
    // ==========================================================================
    toggleSidebar() {
        const drawer = document.getElementById('sidebarDrawer');
        const overlay = document.getElementById('sidebarOverlay');
        if (drawer && overlay) {
            drawer.classList.toggle('active');
            overlay.classList.toggle('active');
        }
    }

    navTo(screenId) {
        this.toggleSidebar();
        this.switchScreen(screenId);
    }

    resetShift() {
        if (confirm('هل أنت متأكد من رغبتك في إقفال الوردية الحالية وطباعة تقرير الصندوق؟')) {
            alert('تم إقفال الوردية الحالية بنجاح وتصفير مؤشرات اليوم للوردية القادمة.');
            this.switchScreen('reports');
        }
    }

    exportAllData() {
        const backup = {
            products: this.products,
            customers: this.customers,
            suppliers: this.suppliers,
            orders: this.orders,
            purchases: this.purchases,
            auditLog: this.auditLog,
            exportedAt: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Karma_Carmela_Backup_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // ==========================================================================
    // SCREEN NAVIGATION & BOTTOM BAR
    // ==========================================================================
    switchScreen(screenId) {
        this.currentScreen = screenId;
        document.querySelectorAll('.screen-view').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.b-nav-item').forEach(b => b.classList.remove('active'));

        const target = document.getElementById(`screen-${screenId}`);
        const navBtn = document.querySelector(`.b-nav-item[data-screen="${screenId}"]`);

        if (target) target.classList.add('active');
        if (navBtn) navBtn.classList.add('active');

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });

        if (screenId === 'home') this.renderHome();
        if (screenId === 'pos') this.renderProducts();
        if (screenId === 'inventory') this.renderInventory();
        if (screenId === 'customers') this.renderCustomers();
        if (screenId === 'suppliers') this.renderSuppliers();
        if (screenId === 'reports') this.renderReports();
    }

    // ==========================================================================
    // HOME DASHBOARD & WELCOME CARD
    // ==========================================================================
    updateWelcomeGreeting() {
        const greetingEl = document.getElementById('welcomeGreeting');
        if (!greetingEl) return;
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) {
            greetingEl.innerText = 'صباح الخير والبركة، مرحباً بك ☀️';
        } else if (hour >= 12 && hour < 18) {
            greetingEl.innerText = 'مساء الخير، مرحباً بك في ورديتك ☕';
        } else {
            greetingEl.innerText = 'مساء الخير والازدهار، مرحباً بك 🌙';
        }
    }

    renderHome() {
        this.updateWelcomeGreeting();

        // Calculate live shift stats
        let todaySales = 0;
        let todayCash = 0;

        this.orders.forEach(o => {
            todaySales += o.grandTotal;
            if (o.paymentMethod === 'CASH') todayCash += o.grandTotal;
        });

        const totalReceivables = this.customers.reduce((sum, c) => sum + c.currentBalance, 0);
        const totalPayables = this.suppliers.reduce((sum, s) => sum + s.currentBalance, 0);

        let totalStockVal = 0;
        let lowStockList = [];

        this.products.forEach(p => {
            totalStockVal += p.currentStock * p.wholesalePrice;
            if (p.currentStock <= p.minStock) {
                lowStockList.push(p);
            }
        });

        // Welcome Strip
        document.getElementById('homeTodaySales').innerText = todaySales.toLocaleString() + ' ج.م';
        document.getElementById('homeCashDrawer').innerText = todayCash.toLocaleString() + ' ج.م';
        document.getElementById('homeReceivables').innerText = totalReceivables.toLocaleString() + ' ج.م';
        document.getElementById('homePayables').innerText = totalPayables.toLocaleString() + ' ج.م';

        // Bento Cards Metrics
        document.getElementById('homeStockValuation').innerText = totalStockVal.toLocaleString() + ' ج.م';
        document.getElementById('homeStockCountText').innerText = `${this.products.length} أصناف مسجلة في المستودع`;
        document.getElementById('homeCustomersDebt').innerText = totalReceivables.toLocaleString() + ' ج.م';
        document.getElementById('homeCustomersCount').innerText = `${this.customers.length} عملاء ومطاعم مسجلين`;
        document.getElementById('homeSuppliersDebt').innerText = totalPayables.toLocaleString() + ' ج.م';
        document.getElementById('homeSuppliersCount').innerText = `${this.suppliers.length} موردين معتمدين`;

        // Recent Orders Table in Home
        const ordersTbody = document.querySelector('#homeRecentOrdersTable tbody');
        if (ordersTbody) {
            ordersTbody.innerHTML = this.orders.slice(0, 5).map(o => `
                <tr>
                    <td><strong>${o.orderNumber}</strong></td>
                    <td>${o.customerName}</td>
                    <td>${o.date.slice(0, 10)}</td>
                    <td><strong>${o.grandTotal.toFixed(2)} ج.م</strong></td>
                    <td><span class="inv-status-badge">${o.paymentMethod === 'CREDIT_NET30' ? 'آجل' : 'نقداً'}</span></td>
                </tr>
            `).join('') || '<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">لا توجد فواتير اليوم بعد</td></tr>';
        }

        // Low Stock List in Home
        const lowList = document.getElementById('homeLowStockList');
        if (lowList) {
            if (lowStockList.length === 0) {
                lowList.innerHTML = `
                    <div style="text-align:center; padding:20px; color:var(--accent-emerald);">
                        <i class="fa-solid fa-circle-check fa-2x" style="margin-bottom:6px;"></i>
                        <p style="font-size:0.85rem;">جميع أرصدة المستودع آمنة وفوق حد الطلب</p>
                    </div>
                `;
            } else {
                lowList.innerHTML = lowStockList.slice(0, 4).map(p => `
                    <div class="low-stock-item">
                        <div>
                            <strong>${p.name}</strong>
                            <div style="font-size:0.75rem; color:var(--text-muted);">${p.category} • متبقي: ${p.currentStock} ${p.baseUnit}</div>
                        </div>
                        <span class="low-stock-pill">طلب توريد (<${p.minStock})</span>
                    </div>
                `).join('');
            }
        }
    }

    // ==========================================================================
    // POS: PRODUCTS, CATEGORIES, CART & CHECKOUT
    // ==========================================================================
    renderCategories() {
        const bar = document.getElementById('categoriesBar');
        if (!bar) return;

        const categories = ['ALL', ...new Set(this.products.map(p => p.category))];
        const labels = { 'ALL': 'جميع الأصناف' };

        bar.innerHTML = categories.map(cat => {
            const isSel = this.selectedCategory === cat;
            return `<button class="cat-chip ${isSel ? 'active' : ''}" onclick="app.setCategory('${cat}')">${labels[cat] || cat}</button>`;
        }).join('');

        const invSelect = document.getElementById('inventoryCategoryFilter');
        if (invSelect) {
            invSelect.innerHTML = `<option value="ALL">جميع الأقسام</option>` +
                categories.filter(c => c !== 'ALL').map(c => `<option value="${c}">${c}</option>`).join('');
        }
    }

    setCategory(cat) {
        this.selectedCategory = cat;
        this.renderCategories();
        this.renderProducts();
    }

    filterProducts() {
        const input = document.getElementById('posSearchInput');
        this.searchQuery = input ? input.value.trim().toLowerCase() : '';
        const clearBtn = document.getElementById('clearSearchBtn');
        if (clearBtn) clearBtn.style.display = this.searchQuery ? 'block' : 'none';
        this.renderProducts();
    }

    clearPosSearch() {
        const input = document.getElementById('posSearchInput');
        if (input) input.value = '';
        this.filterProducts();
    }

    renderProducts() {
        const grid = document.getElementById('productsGrid');
        if (!grid) return;

        const filtered = this.products.filter(p => {
            const matchesCat = this.selectedCategory === 'ALL' || p.category === this.selectedCategory;
            const matchesSearch = !this.searchQuery ||
                p.name.toLowerCase().includes(this.searchQuery) ||
                p.sku.toLowerCase().includes(this.searchQuery) ||
                p.barcode.includes(this.searchQuery) ||
                p.units.some(u => u.barcode.includes(this.searchQuery));
            return matchesCat && matchesSearch;
        });

        if (filtered.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">
                    <i class="fa-solid fa-box-open fa-3x" style="margin-bottom: 12px; color: var(--border-color);"></i>
                    <p>لا توجد أصناف مطابقة لبحثك</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = filtered.map(prod => {
            const isLowStock = prod.currentStock <= prod.minStock;
            const unitsHtml = prod.units.map(unit => {
                const effectivePrice = this.calculateTierPrice(unit.price);
                return `
                    <button class="unit-button" onclick="app.addToCart(${prod.id}, ${unit.id})">
                        <div class="unit-info-left">
                            <span class="unit-name">${unit.name}</span>
                            <span class="unit-factor">${unit.factor > 1 ? `يحتوي ${unit.factor} عبوة` : 'وحدة أساسية'}</span>
                        </div>
                        <span class="unit-price">${effectivePrice.toFixed(2)} ج.م</span>
                    </button>
                `;
            }).join('');

            return `
                <div class="product-card">
                    <div>
                        <div class="prod-top-meta">
                            <span class="prod-category-tag">${prod.category}</span>
                            <span class="prod-stock-badge ${isLowStock ? 'low' : ''}">
                                ${isLowStock ? 'نقص: ' : 'متاح: '}
                                ${prod.currentStock} ${prod.baseUnit}
                            </span>
                        </div>
                        <h4 class="prod-title">${prod.name}</h4>
                        <div class="prod-sku">كود: ${prod.sku}</div>
                    </div>
                    <div class="prod-units-wrap">
                        ${unitsHtml}
                    </div>
                </div>
            `;
        }).join('');
    }

    calculateTierPrice(basePrice) {
        if (!this.selectedCustomer) return basePrice;
        if (this.selectedCustomer.tier === 3) return basePrice * 0.90;
        if (this.selectedCustomer.tier === 2) return basePrice * 0.95;
        return basePrice;
    }

    addToCart(productId, unitId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;
        const unit = product.units.find(u => u.id === unitId) || product.units[0];

        const existingIndex = this.cart.findIndex(item => item.product.id === productId && item.unit.id === unit.id);
        if (existingIndex >= 0) {
            this.cart[existingIndex].quantity += 1;
        } else {
            this.cart.push({ product, unit, quantity: 1 });
        }

        playBeep();
        this.renderCart();
    }

    updateCartQty(index, delta) {
        if (!this.cart[index]) return;
        this.cart[index].quantity += delta;
        if (this.cart[index].quantity <= 0) {
            this.cart.splice(index, 1);
        }
        this.renderCart();
    }

    removeCartItem(index) {
        if (this.cart[index]) {
            this.cart.splice(index, 1);
            this.renderCart();
        }
    }

    setDiscount(pct) {
        this.discountPercent = pct;
        document.querySelectorAll('#discountChips .chip').forEach(c => c.classList.remove('active'));
        const activeChip = Array.from(document.querySelectorAll('#discountChips .chip')).find(c => c.innerText.includes(`${pct}%`));
        if (activeChip) activeChip.classList.add('active');
        this.renderCart();
    }

    setTax(pct) {
        this.taxPercent = pct;
        document.querySelectorAll('.tax-chips .chip').forEach(c => c.classList.remove('active'));
        if (pct === 0) document.getElementById('taxExemptBtn')?.classList.add('active');
        if (pct === 5) document.getElementById('tax5Btn')?.classList.add('active');
        if (pct === 14) document.getElementById('tax14Btn')?.classList.add('active');
        this.renderCart();
    }

    setPaymentMethod(method) {
        this.paymentMethod = method;
        document.querySelectorAll('.pay-btn').forEach(b => b.classList.remove('active'));
        const activeBtn = document.querySelector(`.pay-btn[data-method="${method}"]`);
        if (activeBtn) activeBtn.classList.add('active');
    }

    toggleCartDrawer() {
        const drawer = document.getElementById('cartDrawer');
        const overlay = document.getElementById('cartOverlay');
        if (drawer && overlay) {
            drawer.classList.toggle('active');
            overlay.classList.toggle('active');
        }
    }

    renderCart() {
        const badge = document.getElementById('cartCountBadge');
        const list = document.getElementById('cartItemsList');
        const subtotalEl = document.getElementById('cartSubtotal');
        const totalEl = document.getElementById('cartFinalTotal');
        const tafqeetEl = document.getElementById('cartTafqeet');
        const custNameEl = document.getElementById('cartCustomerName');
        const custTierEl = document.getElementById('cartCustomerTier');
        const headerCust = document.getElementById('headerCustomerName');

        const totalItemsCount = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        if (badge) badge.innerText = totalItemsCount;

        if (this.selectedCustomer) {
            if (custNameEl) custNameEl.innerText = this.selectedCustomer.businessName;
            if (headerCust) headerCust.innerText = this.selectedCustomer.businessName;
            if (custTierEl) custTierEl.innerText = `شريحة ${this.selectedCustomer.tier} (${this.selectedCustomer.tier === 3 ? 'خصم 10%' : this.selectedCustomer.tier === 2 ? 'خصم 5%' : 'عادي'})`;
        } else {
            if (custNameEl) custNameEl.innerText = 'عميل نقدي';
            if (headerCust) headerCust.innerText = 'عميل نقدي';
            if (custTierEl) custTierEl.innerText = 'شريحة 1 (عادي)';
        }

        if (this.cart.length === 0) {
            if (list) {
                list.innerHTML = `
                    <div class="cart-empty-msg">
                        <i class="fa-solid fa-basket-shopping"></i>
                        <p>سلة المبيعات فارغة</p>
                        <small>اضغط على أي صنف لإضافته إلى الفاتورة</small>
                    </div>
                `;
            }
            if (subtotalEl) subtotalEl.innerText = '0.00 ج.م';
            if (totalEl) totalEl.innerText = '0.00 ج.م';
            if (tafqeetEl) tafqeetEl.innerText = 'فقط صفر جنيهاً مصرياً لا غير';
            return;
        }

        let rawSubtotal = 0;
        if (list) {
            list.innerHTML = this.cart.map((item, idx) => {
                const effectiveUnitPrice = this.calculateTierPrice(item.unit.price);
                const lineTotal = effectiveUnitPrice * item.quantity;
                rawSubtotal += lineTotal;

                return `
                    <div class="cart-item-card">
                        <div class="cart-item-top">
                            <span class="cart-item-title">${item.product.name}</span>
                            <button class="btn-remove-item" onclick="app.removeCartItem(${idx})"><i class="fa-solid fa-trash-can"></i></button>
                        </div>
                        <div class="cart-item-unit-row">
                            ${item.unit.name} • ${effectiveUnitPrice.toFixed(2)} ج.م
                        </div>
                        <div class="cart-item-bottom">
                            <div class="qty-control">
                                <button class="qty-btn" onclick="app.updateCartQty(${idx}, -1)"><i class="fa-solid fa-minus"></i></button>
                                <span class="qty-value">${item.quantity}</span>
                                <button class="qty-btn" onclick="app.updateCartQty(${idx}, 1)"><i class="fa-solid fa-plus"></i></button>
                            </div>
                            <span class="cart-item-total">${lineTotal.toFixed(2)} ج.م</span>
                        </div>
                    </div>
                `;
            }).join('');
        }

        const discountAmount = rawSubtotal * (this.discountPercent / 100);
        const taxable = rawSubtotal - discountAmount;
        const taxAmount = taxable * (this.taxPercent / 100);
        const grandTotal = taxable + taxAmount;

        if (subtotalEl) subtotalEl.innerText = rawSubtotal.toFixed(2) + ' ج.م';
        if (totalEl) totalEl.innerText = grandTotal.toFixed(2) + ' ج.م';
        if (tafqeetEl) tafqeetEl.innerText = tafqeet(grandTotal);
    }

    completeCheckout() {
        if (this.cart.length === 0) {
            alert('السلة فارغة! يرجى إضافة أصناف أولاً.');
            return;
        }

        let rawSubtotal = 0;
        const orderItems = this.cart.map(item => {
            const unitPrice = this.calculateTierPrice(item.unit.price);
            const lineTotal = unitPrice * item.quantity;
            rawSubtotal += lineTotal;
            const baseUnitsDeducted = item.quantity * item.unit.factor;

            return {
                productId: item.product.id,
                productName: item.product.name,
                unitName: item.unit.name,
                factor: item.unit.factor,
                quantity: item.quantity,
                baseUnits: baseUnitsDeducted,
                unitPrice,
                lineTotal,
                costPrice: item.unit.cost
            };
        });

        const discountAmount = rawSubtotal * (this.discountPercent / 100);
        const taxable = rawSubtotal - discountAmount;
        const taxAmount = taxable * (this.taxPercent / 100);
        const grandTotal = taxable + taxAmount;

        if (this.paymentMethod === 'CREDIT_NET30') {
            if (!this.selectedCustomer) {
                alert('البيع الآجل يتطلب تحديد حساب عميل مسجل!');
                this.openCustomerModal();
                return;
            }
            if (this.selectedCustomer.currentBalance + grandTotal > this.selectedCustomer.creditLimit) {
                const proceed = confirm(`تحذير: الفاتورة ستتجاوز الحد الائتماني للعميل (${this.selectedCustomer.creditLimit} ج.م). متابعة؟`);
                if (!proceed) return;
            }
            this.selectedCustomer.currentBalance += grandTotal;
        }

        const now = new Date();
        const invNum = 'INV-' + now.getFullYear().toString().substr(-2) +
            ('0' + (now.getMonth() + 1)).slice(-2) +
            ('0' + now.getDate()).slice(-2) + '-' +
            Math.floor(1000 + Math.random() * 9000);

        const order = {
            id: Date.now(),
            orderNumber: invNum,
            date: now.toLocaleString('ar-EG'),
            customerId: this.selectedCustomer ? this.selectedCustomer.id : null,
            customerName: this.selectedCustomer ? this.selectedCustomer.businessName : 'عميل نقدي',
            customerTaxId: this.selectedCustomer ? this.selectedCustomer.taxId : '-',
            paymentMethod: this.paymentMethod,
            paymentStatus: this.paymentMethod === 'CREDIT_NET30' ? 'آجل غير مسدد' : 'مسددة بالكامل',
            subtotal: rawSubtotal,
            discountPercent: this.discountPercent,
            discountAmount,
            taxPercent: this.taxPercent,
            taxAmount,
            grandTotal,
            items: orderItems,
            tafqeetWords: tafqeet(grandTotal)
        };

        // Add to customer's personal statement ledger if customer assigned
        if (this.selectedCustomer) {
            if (!this.selectedCustomer.statement) this.selectedCustomer.statement = [];
            this.selectedCustomer.statement.push({
                date: now.toISOString().slice(0, 10),
                desc: `فاتورة مبيعات ${invNum} (${order.paymentStatus})`,
                debit: grandTotal,
                credit: 0,
                balance: this.selectedCustomer.currentBalance
            });
        }

        // Deduct inventory stock
        orderItems.forEach(oi => {
            const prod = this.products.find(p => p.id === oi.productId);
            if (prod) {
                const prev = prod.currentStock;
                prod.currentStock = Math.max(0, prod.currentStock - oi.baseUnits);
                this.auditLog.unshift({
                    id: Date.now() + Math.random(),
                    productName: prod.name,
                    type: 'مبيعات فاتورة',
                    qty: -oi.baseUnits,
                    previousStock: prev,
                    newStock: prod.currentStock,
                    date: now.toLocaleString('ar-EG'),
                    ref: invNum
                });
            }
        });

        this.orders.unshift(order);
        this.saveAll();

        this.showInvoiceModal(order);
        this.cart = [];
        this.discountPercent = 0;
        this.renderCart();
        this.toggleCartDrawer();
        this.renderProducts();
        this.renderHome();
        this.renderReports();
        this.renderInventory();
    }

    showInvoiceModal(order) {
        document.getElementById('invNumberDisplay').innerText = order.orderNumber;
        document.getElementById('invDateDisplay').innerText = order.date;
        document.getElementById('invPaymentStatusBadge').innerText = order.paymentStatus;
        document.getElementById('invCustomerName').innerText = order.customerName;
        document.getElementById('invCustomerTaxId').innerText = order.customerTaxId;

        const methodMap = {
            'CASH': 'نقداً فوري',
            'CARD': 'بطاقة شبكة / فيزا',
            'CREDIT_NET30': 'آجل (30 يوم)',
            'TRANSFER': 'تحويل بنكي'
        };
        document.getElementById('invPaymentMethod').innerText = methodMap[order.paymentMethod] || order.paymentMethod;

        const itemsBody = document.getElementById('invItemsTableBody');
        if (itemsBody) {
            itemsBody.innerHTML = order.items.map((it, idx) => `
                <tr>
                    <td>${idx + 1}</td>
                    <td><strong>${it.productName}</strong></td>
                    <td>${it.unitName}</td>
                    <td>${it.quantity}</td>
                    <td>${it.unitPrice.toFixed(2)} ج.م</td>
                    <td><strong>${it.lineTotal.toFixed(2)} ج.م</strong></td>
                </tr>
            `).join('');
        }

        document.getElementById('invSubtotal').innerText = order.subtotal.toFixed(2) + ' ج.م';
        const discRow = document.getElementById('invDiscountRow');
        if (discRow) {
            discRow.style.display = order.discountAmount > 0 ? 'flex' : 'none';
            document.getElementById('invDiscount').innerText = '-' + order.discountAmount.toFixed(2) + ' ج.م';
        }
        document.getElementById('invTax').innerText = order.taxAmount.toFixed(2) + ' ج.م';
        document.getElementById('invGrandTotal').innerText = order.grandTotal.toFixed(2) + ' ج.م';
        document.getElementById('invTafqeetWords').innerText = order.tafqeetWords;

        document.getElementById('invoiceModal').classList.add('active');
    }

    closeInvoiceModal() {
        document.getElementById('invoiceModal').classList.remove('active');
    }

    // ==========================================================================
    // BARCODE SCANNER
    // ==========================================================================
    openScannerModal() {
        document.getElementById('scannerModal').classList.add('active');
        const input = document.getElementById('manualScannerInput');
        if (input) {
            input.value = '';
            setTimeout(() => input.focus(), 200);
        }
    }

    closeScannerModal() {
        document.getElementById('scannerModal').classList.remove('active');
    }

    initQuickBarcodes() {
        const wrap = document.getElementById('quickBarcodesWrap');
        if (!wrap) return;

        const quicks = [
            { name: 'كرتونة زيت إيطالي', code: '800123456718' },
            { name: 'كرتونة طماطم', code: '800234567819' },
            { name: 'شوال دقيق كابوتو', code: '800345678903' },
            { name: 'حليب شوفان كرتونة', code: '800567890112' },
            { name: 'خل بلسميك 5L', code: '800678901206' },
            { name: 'مكرونة ريجاتوني 20kg', code: '800789012314' }
        ];

        wrap.innerHTML = quicks.map(q => `
            <button class="quick-code-pill" onclick="app.scanBarcode('${q.code}')">
                <i class="fa-solid fa-barcode"></i> ${q.name}
            </button>
        `).join('');
    }

    scanBarcode(code) {
        let foundProd = null;
        let foundUnit = null;

        for (const prod of this.products) {
            const unitMatch = prod.units.find(u => u.barcode === code);
            if (unitMatch) {
                foundProd = prod;
                foundUnit = unitMatch;
                break;
            }
            if (prod.barcode === code || prod.sku === code) {
                foundProd = prod;
                foundUnit = prod.units.find(u => u.isDefault) || prod.units[0];
                break;
            }
        }

        if (foundProd && foundUnit) {
            this.addToCart(foundProd.id, foundUnit.id);
            this.closeScannerModal();
            this.toggleCartDrawer();
        } else {
            alert('عفواً، لم يتم العثور على صنف بالباركود: ' + code);
        }
    }

    processManualBarcode() {
        const input = document.getElementById('manualScannerInput');
        if (input && input.value.trim()) {
            this.scanBarcode(input.value.trim());
        }
    }

    // ==========================================================================
    // CUSTOMER ACCOUNTS & DRILL-DOWN STATEMENT OF ACCOUNT
    // ==========================================================================
    renderCustomers() {
        const grid = document.getElementById('customersGrid');
        const receivablesEl = document.getElementById('totalReceivablesDisplay');

        const totalReceivables = this.customers.reduce((sum, c) => sum + c.currentBalance, 0);
        if (receivablesEl) receivablesEl.innerText = totalReceivables.toLocaleString() + ' ج.م';

        if (!grid) return;

        grid.innerHTML = this.customers.map(c => `
            <div class="account-card">
                <div>
                    <div class="acc-card-top">
                        <h4 class="acc-name">${c.businessName}</h4>
                        <span class="account-badge">شريحة ${c.tier}</span>
                    </div>
                    <div class="acc-meta">
                        <i class="fa-solid fa-user-tie"></i> ${c.contactName} • <i class="fa-solid fa-phone"></i> ${c.phone}
                    </div>
                </div>

                <div>
                    <div class="acc-balance-row">
                        <span>الرصيد الآجل المطلوب:</span>
                        <strong style="color: ${c.currentBalance > 0 ? 'var(--accent-amber)' : 'var(--text-primary)'}">
                            ${c.currentBalance.toLocaleString()} ج.م
                        </strong>
                    </div>

                    <div class="acc-actions-row">
                        <button class="btn-open-account" onclick="app.openCustomerDetail(${c.id})">
                            <i class="fa-solid fa-folder-open"></i> فتح الحساب والبيان
                        </button>
                        <button class="btn-action-primary" style="font-size:0.75rem; padding:6px 10px;" onclick="app.openPaymentModal(${c.id})">
                            <i class="fa-solid fa-hand-holding-dollar"></i> تحصيل
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    openCustomerDetail(id) {
        const c = this.customers.find(item => item.id === id);
        if (!c) return;

        this.activeDetailCustomer = c;

        document.getElementById('cdModalTitle').innerText = `ملف العميل: ${c.businessName}`;
        document.getElementById('cdModalTier').innerText = `شريحة ${c.tier} (${c.tier === 3 ? 'خصم 10%' : c.tier === 2 ? 'خصم 5%' : 'أسعار قياسية'})`;
        document.getElementById('cdBalanceDisplay').innerText = `${c.currentBalance.toLocaleString()} ج.م`;
        document.getElementById('cdLimitDisplay').innerText = `${c.creditLimit.toLocaleString()} ج.م`;

        // Switch to Tab 1 (Statement)
        this.switchCustomerTab('statement');

        // Populate Tab 3 (Edit)
        document.getElementById('cdEditId').value = c.id;
        document.getElementById('cdEditBusinessName').value = c.businessName;
        document.getElementById('cdEditContact').value = c.contactName;
        document.getElementById('cdEditPhone').value = c.phone;
        document.getElementById('cdEditTier').value = c.tier;
        document.getElementById('cdEditLimit').value = c.creditLimit;
        document.getElementById('cdEditTaxId').value = c.taxId || '';

        // Render Invoices Tab
        const customerOrders = this.orders.filter(o => o.customerId === c.id);
        const invTbody = document.querySelector('#cdInvoicesTable tbody');
        if (invTbody) {
            invTbody.innerHTML = customerOrders.map(o => `
                <tr>
                    <td><strong>${o.orderNumber}</strong></td>
                    <td>${o.date}</td>
                    <td>${o.paymentMethod === 'CREDIT_NET30' ? 'آجل' : 'نقداً'}</td>
                    <td><strong>${o.grandTotal.toFixed(2)} ج.م</strong></td>
                    <td><button class="btn-table-action" onclick="app.previewOrder(${o.id})"><i class="fa-solid fa-eye"></i></button></td>
                </tr>
            `).join('') || '<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">لا توجد فواتير سابقة لهذا العميل</td></tr>';
        }

        // Render Statement Tab
        const stmtTbody = document.querySelector('#cdStatementTable tbody');
        if (stmtTbody) {
            const statement = c.statement || [
                { date: '2026-11-01', desc: 'رصيد مرحل', debit: c.currentBalance, credit: 0, balance: c.currentBalance }
            ];
            stmtTbody.innerHTML = statement.map(s => `
                <tr>
                    <td>${s.date}</td>
                    <td><strong>${s.desc}</strong></td>
                    <td style="color:var(--accent-rose);">${s.debit > 0 ? s.debit.toFixed(2) + ' ج.م' : '-'}</td>
                    <td style="color:var(--accent-emerald);">${s.credit > 0 ? s.credit.toFixed(2) + ' ج.م' : '-'}</td>
                    <td><strong>${s.balance.toFixed(2)} ج.م</strong></td>
                </tr>
            `).join('');
        }

        document.getElementById('customerDetailModal').classList.add('active');
    }

    closeCustomerDetailModal() {
        document.getElementById('customerDetailModal').classList.remove('active');
    }

    switchCustomerTab(tabName) {
        document.querySelectorAll('#customerDetailModal .acc-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('#customerDetailModal .acc-tab-content').forEach(c => c.classList.remove('active'));

        const targetBtn = document.querySelector(`#customerDetailModal .acc-tab[data-tab="${tabName}"]`);
        if (targetBtn) targetBtn.classList.add('active');

        if (tabName === 'statement') document.getElementById('cdTabStatement')?.classList.add('active');
        if (tabName === 'invoices') document.getElementById('cdTabInvoices')?.classList.add('active');
        if (tabName === 'edit') document.getElementById('cdTabEdit')?.classList.add('active');
    }

    saveCustomerEdit() {
        const id = parseInt(document.getElementById('cdEditId').value);
        const c = this.customers.find(item => item.id === id);
        if (!c) return;

        c.businessName = document.getElementById('cdEditBusinessName').value.trim();
        c.contactName = document.getElementById('cdEditContact').value.trim();
        c.phone = document.getElementById('cdEditPhone').value.trim();
        c.tier = parseInt(document.getElementById('cdEditTier').value) || 1;
        c.creditLimit = parseFloat(document.getElementById('cdEditLimit').value) || 10000;
        c.taxId = document.getElementById('cdEditTaxId').value.trim();

        this.saveAll();
        this.renderCustomers();
        this.renderHome();
        this.closeCustomerDetailModal();
        alert('تم تعديل وحفظ بيانات العميل بنجاح.');
    }

    openPaymentFromDetail() {
        if (this.activeDetailCustomer) {
            this.openPaymentModal(this.activeDetailCustomer.id);
        }
    }

    // ==========================================================================
    // SUPPLIERS & PURCHASING INVOICES ENGINE
    // ==========================================================================
    renderSuppliers() {
        const grid = document.getElementById('suppliersGrid');
        const payablesEl = document.getElementById('totalPayablesDisplay');

        const totalPayables = this.suppliers.reduce((sum, s) => sum + s.currentBalance, 0);
        if (payablesEl) payablesEl.innerText = totalPayables.toLocaleString() + ' ج.م';

        if (!grid) return;

        grid.innerHTML = this.suppliers.map(s => `
            <div class="account-card">
                <div>
                    <div class="acc-card-top">
                        <h4 class="acc-name">${s.name}</h4>
                        <span class="account-badge purple">مورد أغذية</span>
                    </div>
                    <div class="acc-meta">
                        <i class="fa-solid fa-user-gear"></i> ${s.contact} • <i class="fa-solid fa-phone"></i> ${s.phone}
                    </div>
                </div>

                <div>
                    <div class="acc-balance-row">
                        <span>المستحق للمورد (الدائنون):</span>
                        <strong style="color: ${s.currentBalance > 0 ? 'var(--accent-rose)' : 'var(--text-primary)'}">
                            ${s.currentBalance.toLocaleString()} ج.م
                        </strong>
                    </div>

                    <div class="acc-actions-row">
                        <button class="btn-open-account" onclick="app.openSupplierDetail(${s.id})">
                            <i class="fa-solid fa-folder-open"></i> كشف الحساب وفواتير التوريد
                        </button>
                        <button class="btn-action-primary" style="font-size:0.75rem; padding:6px 10px;" onclick="app.openSupplierPayModal(${s.id})">
                            <i class="fa-solid fa-money-bill-transfer"></i> سداد دفعة
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // Also update purchase invoice supplier select dropdown
        const purSupSelect = document.getElementById('purSupplierSelect');
        if (purSupSelect) {
            purSupSelect.innerHTML = this.suppliers.map(s => `
                <option value="${s.id}">${s.name} (المستحق: ${s.currentBalance} ج.م)</option>
            `).join('');
        }
    }

    openSupplierDetail(id) {
        const s = this.suppliers.find(item => item.id === id);
        if (!s) return;

        this.activeDetailSupplier = s;

        document.getElementById('sdModalTitle').innerText = `ملف المورد: ${s.name}`;
        document.getElementById('sdModalCompany').innerText = `شروط السداد: ${s.paymentTerms} يوم`;
        document.getElementById('sdBalanceDisplay').innerText = `${s.currentBalance.toLocaleString()} ج.م`;
        document.getElementById('sdTermsDisplay').innerText = `${s.paymentTerms} يوم`;

        this.switchSupplierTab('statement');

        // Populate Edit Tab
        document.getElementById('sdEditId').value = s.id;
        document.getElementById('sdEditName').value = s.name;
        document.getElementById('sdEditContact').value = s.contact;
        document.getElementById('sdEditPhone').value = s.phone;
        document.getElementById('sdEditTerms').value = s.paymentTerms;
        document.getElementById('sdEditBank').value = s.bankAccount || '';

        // Purchases Table
        const supPurchases = this.purchases.filter(p => p.supplierId === s.id);
        const purTbody = document.querySelector('#sdPurchasesTable tbody');
        if (purTbody) {
            purTbody.innerHTML = supPurchases.map(p => `
                <tr>
                    <td><strong>${p.invoiceNumber}</strong></td>
                    <td>${p.date}</td>
                    <td>${p.items ? p.items.length : 1} أصناف</td>
                    <td><strong>${p.totalAmount.toLocaleString()} ج.م</strong></td>
                    <td><span class="inv-status-badge">${p.paymentStatus}</span></td>
                </tr>
            `).join('') || '<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">لا توجد فواتير توريد مسجلة لهذا المورد</td></tr>';
        }

        // Statement Table
        const stmtTbody = document.querySelector('#sdStatementTable tbody');
        if (stmtTbody) {
            const statement = s.statement || [
                { date: '2026-11-01', desc: 'رصيد مرحل توريدات سابقة', debit: 0, credit: s.currentBalance, balance: s.currentBalance }
            ];
            stmtTbody.innerHTML = statement.map(st => `
                <tr>
                    <td>${st.date}</td>
                    <td><strong>${st.desc}</strong></td>
                    <td style="color:var(--accent-rose);">${st.credit > 0 ? st.credit.toFixed(2) + ' ج.م' : '-'}</td>
                    <td style="color:var(--accent-emerald);">${st.debit > 0 ? st.debit.toFixed(2) + ' ج.م' : '-'}</td>
                    <td><strong>${st.balance.toFixed(2)} ج.م</strong></td>
                </tr>
            `).join('');
        }

        document.getElementById('supplierDetailModal').classList.add('active');
    }

    closeSupplierDetailModal() {
        document.getElementById('supplierDetailModal').classList.remove('active');
    }

    switchSupplierTab(tabName) {
        document.querySelectorAll('#supplierDetailModal .acc-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('#supplierDetailModal .acc-tab-content').forEach(c => c.classList.remove('active'));

        const targetBtn = document.querySelector(`#supplierDetailModal .acc-tab[data-tab="${tabName}"]`);
        if (targetBtn) targetBtn.classList.add('active');

        if (tabName === 'statement') document.getElementById('sdTabStatement')?.classList.add('active');
        if (tabName === 'purchases') document.getElementById('sdTabPurchases')?.classList.add('active');
        if (tabName === 'edit') document.getElementById('sdTabEdit')?.classList.add('active');
    }

    saveSupplierEdit() {
        const id = parseInt(document.getElementById('sdEditId').value);
        const s = this.suppliers.find(item => item.id === id);
        if (!s) return;

        s.name = document.getElementById('sdEditName').value.trim();
        s.contact = document.getElementById('sdEditContact').value.trim();
        s.phone = document.getElementById('sdEditPhone').value.trim();
        s.paymentTerms = parseInt(document.getElementById('sdEditTerms').value) || 30;
        s.bankAccount = document.getElementById('sdEditBank').value.trim();

        this.saveAll();
        this.renderSuppliers();
        this.renderHome();
        this.closeSupplierDetailModal();
        alert('تم تعديل وحفظ بيانات المورد بنجاح.');
    }

    // Modal: Add Supplier
    openAddSupplierModal() {
        document.getElementById('addSupName').value = '';
        document.getElementById('addSupContact').value = '';
        document.getElementById('addSupPhone').value = '';
        document.getElementById('addSupTerms').value = '30';
        document.getElementById('addSupBank').value = '';
        document.getElementById('addSupplierModal').classList.add('active');
    }

    closeAddSupplierModal() {
        document.getElementById('addSupplierModal').classList.remove('active');
    }

    saveNewSupplier() {
        const name = document.getElementById('addSupName').value.trim();
        const contact = document.getElementById('addSupContact').value.trim();
        const phone = document.getElementById('addSupPhone').value.trim();
        const paymentTerms = parseInt(document.getElementById('addSupTerms').value) || 30;
        const bankAccount = document.getElementById('addSupBank').value.trim();

        if (!name || !phone) return;

        this.suppliers.push({
            id: Date.now(),
            name,
            contact,
            phone,
            paymentTerms,
            bankAccount,
            currentBalance: 0,
            statement: []
        });

        this.saveAll();
        this.closeAddSupplierModal();
        this.renderSuppliers();
        this.renderHome();
    }

    // Modal: Pay Supplier
    openSupplierPayModal(id) {
        const s = this.suppliers.find(item => item.id === id) || this.activeDetailSupplier;
        if (!s) return;

        document.getElementById('spModalSupId').value = s.id;
        document.getElementById('spModalSummary').innerHTML = `
            <strong>${s.name}</strong>
            <p>المبلغ المستحق للمورد: <strong style="color:var(--accent-rose);">${s.currentBalance.toLocaleString()} ج.م</strong></p>
        `;
        document.getElementById('spModalAmount').value = s.currentBalance;
        document.getElementById('supplierPayModal').classList.add('active');
    }

    closeSupplierPayModal() {
        document.getElementById('supplierPayModal').classList.remove('active');
    }

    saveSupplierPayment() {
        const id = parseInt(document.getElementById('spModalSupId').value);
        const s = this.suppliers.find(item => item.id === id);
        const amt = parseFloat(document.getElementById('spModalAmount').value) || 0;
        const method = document.getElementById('spModalMethod').value;

        if (s && amt > 0) {
            s.currentBalance = Math.max(0, s.currentBalance - amt);
            if (!s.statement) s.statement = [];
            s.statement.push({
                date: new Date().toISOString().slice(0, 10),
                desc: `سداد دفعة للمورد (${method === 'CASH' ? 'نقداً' : method === 'TRANSFER' ? 'تحويل بنكي' : 'شيك'}) سند صرف`,
                debit: amt,
                credit: 0,
                balance: s.currentBalance
            });

            this.saveAll();
            this.closeSupplierPayModal();
            this.renderSuppliers();
            this.renderHome();
            if (this.activeDetailSupplier && this.activeDetailSupplier.id === s.id) {
                this.openSupplierDetail(s.id);
            }
            alert(`تم تسجيل سند صرف بقيمة ${amt.toLocaleString()} ج.م للمورد ${s.name} بنجاح.`);
        }
    }

    // Modal: New Purchase Bill
    openNewPurchaseModal() {
        const prodSelect = document.getElementById('purProductSelect');
        if (prodSelect) {
            prodSelect.innerHTML = this.products.map(p => `
                <option value="${p.id}" data-cost="${p.costPrice}">${p.name} (تكلفة: ${p.costPrice} ج.م)</option>
            `).join('');
            prodSelect.onchange = () => {
                const opt = prodSelect.options[prodSelect.selectedIndex];
                document.getElementById('purUnitPrice').value = opt.getAttribute('data-cost');
            };
            if (this.products.length > 0) {
                document.getElementById('purUnitPrice').value = this.products[0].costPrice;
            }
        }
        document.getElementById('purInvoiceNumber').value = 'SUP-' + new Date().toISOString().slice(2, 10).replace(/-/g, '') + '-' + Math.floor(100 + Math.random() * 900);
        document.getElementById('purQty').value = '20';
        document.getElementById('purchaseModal').classList.add('active');
    }

    closePurchaseModal() {
        document.getElementById('purchaseModal').classList.remove('active');
    }

    savePurchaseInvoice() {
        const supId = parseInt(document.getElementById('purSupplierSelect').value);
        const prodId = parseInt(document.getElementById('purProductSelect').value);
        const invNum = document.getElementById('purInvoiceNumber').value.trim();
        const qty = parseFloat(document.getElementById('purQty').value) || 0;
        const price = parseFloat(document.getElementById('purUnitPrice').value) || 0;
        const method = document.getElementById('purPaymentMethod').value;

        const sup = this.suppliers.find(s => s.id === supId);
        const prod = this.products.find(p => p.id === prodId);

        if (!sup || !prod || qty <= 0) return;

        const total = qty * price;
        const now = new Date();

        // 1. Increase product stock
        const prev = prod.currentStock;
        prod.currentStock += qty;
        prod.costPrice = price; // update cost price to latest supply

        // 2. Update supplier balance if on credit
        if (method === 'CREDIT_NET30') {
            sup.currentBalance += total;
        }

        if (!sup.statement) sup.statement = [];
        sup.statement.push({
            date: now.toISOString().slice(0, 10),
            desc: `فاتورة توريد ${invNum} (${qty} x ${prod.name})`,
            debit: 0,
            credit: total,
            balance: sup.currentBalance
        });

        // 3. Save purchase invoice
        this.purchases.unshift({
            id: Date.now(),
            invoiceNumber: invNum,
            supplierId: sup.id,
            supplierName: sup.name,
            date: now.toLocaleString('ar-EG'),
            totalAmount: total,
            paymentStatus: method === 'CREDIT_NET30' ? 'آجل على الحساب' : 'مسددة فورياً',
            items: [{ productName: prod.name, quantity: qty, unitPrice: price, total }]
        });

        // 4. Log in Audit
        this.auditLog.unshift({
            id: Date.now(),
            productName: prod.name,
            type: 'توريد بضاعة',
            qty: qty,
            previousStock: prev,
            newStock: prod.currentStock,
            date: now.toLocaleString('ar-EG'),
            ref: invNum
        });

        this.saveAll();
        this.closePurchaseModal();
        this.renderInventory();
        this.renderSuppliers();
        this.renderHome();
        alert(`تم استلام وتوريد ${qty} ${prod.baseUnit} من الصنف (${prod.name}) وتحديث حساب المورد.`);
    }

    // ==========================================================================
    // INVENTORY CRUD & MODALS
    // ==========================================================================
    renderInventory() {
        const searchInput = document.getElementById('inventorySearchInput');
        const catSelect = document.getElementById('inventoryCategoryFilter');
        const q = searchInput ? searchInput.value.trim().toLowerCase() : '';
        const cat = catSelect ? catSelect.value : 'ALL';

        const filtered = this.products.filter(p => {
            const matchesCat = cat === 'ALL' || p.category === cat;
            const matchesQ = !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.barcode.includes(q);
            return matchesCat && matchesQ;
        });

        let totalCost = 0;
        let totalWholesale = 0;
        let lowCount = 0;

        this.products.forEach(p => {
            totalCost += p.currentStock * p.costPrice;
            totalWholesale += p.currentStock * p.wholesalePrice;
            if (p.currentStock <= p.minStock) lowCount++;
        });

        document.getElementById('invTotalItems').innerText = this.products.length;
        document.getElementById('invLowStockItems').innerText = lowCount;
        document.getElementById('invCostValuation').innerText = totalCost.toLocaleString() + ' ج.م';
        document.getElementById('invWholesaleValuation').innerText = totalWholesale.toLocaleString() + ' ج.م';

        const tbody = document.getElementById('inventoryTableBody');
        if (!tbody) return;

        tbody.innerHTML = filtered.map(p => {
            const isLow = p.currentStock <= p.minStock;
            const unitsDesc = p.units.map(u => `${u.name} (${u.price} ج.م)`).join(' • ');

            return `
                <tr>
                    <td>
                        <strong>${p.name}</strong>
                        <div style="font-size:0.75rem; color:var(--text-muted); font-family:monospace;">SKU: ${p.sku} | Barcode: ${p.barcode}</div>
                    </td>
                    <td><span class="prod-category-tag">${p.category}</span></td>
                    <td>
                        <strong style="color: ${isLow ? 'var(--accent-rose)' : 'var(--accent-emerald)'}">
                            ${p.currentStock} ${p.baseUnit}
                        </strong>
                    </td>
                    <td>${p.costPrice.toFixed(2)} ج.م</td>
                    <td><strong>${p.wholesalePrice.toFixed(2)} ج.م</strong></td>
                    <td style="font-size:0.78rem; color:var(--text-secondary);">${unitsDesc}</td>
                    <td>
                        <span class="prod-stock-badge ${isLow ? 'low' : ''}">
                            ${isLow ? 'نقص مخزون' : 'جيد'}
                        </span>
                    </td>
                    <td>
                        <div style="display:flex; gap:6px;">
                            <button class="btn-table-action" onclick="app.openEditProductModal(${p.id})" title="تعديل"><i class="fa-solid fa-pen-to-square"></i></button>
                            <button class="btn-table-action" onclick="app.deleteProduct(${p.id})" title="حذف"><i class="fa-solid fa-trash" style="color:var(--accent-rose);"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    filterLowStock() {
        const searchInput = document.getElementById('inventorySearchInput');
        if (searchInput) searchInput.value = '';
        this.products = this.products.filter(p => p.currentStock <= p.minStock);
        this.renderInventory();
    }

    openAddProductModal() {
        document.getElementById('productModalTitle').innerHTML = '<i class="fa-solid fa-box"></i> إضافة صنف جديد للمخزن';
        document.getElementById('prodId').value = '';
        document.getElementById('prodName').value = '';
        document.getElementById('prodSku').value = '';
        document.getElementById('prodBaseUnit').value = 'عبوة';
        document.getElementById('prodStock').value = '100';
        document.getElementById('prodMinStock').value = '20';
        document.getElementById('prodCost').value = '50';
        document.getElementById('prodPrice').value = '75';
        document.getElementById('prodBarcode').value = '';

        const container = document.getElementById('unitsRowsContainer');
        container.innerHTML = `
            <div class="unit-config-row">
                <input type="text" class="custom-input" placeholder="اسم العبوة" value="كرتونة (12 عبوة)" style="flex:2">
                <input type="number" class="custom-input" placeholder="المعامل" value="12" style="flex:1">
                <input type="number" class="custom-input" placeholder="سعر البيع" value="850" style="flex:1">
            </div>
        `;
        document.getElementById('productModal').classList.add('active');
    }

    openEditProductModal(id) {
        const p = this.products.find(item => item.id === id);
        if (!p) return;

        document.getElementById('productModalTitle').innerHTML = '<i class="fa-solid fa-pen-to-square"></i> تعديل الصنف';
        document.getElementById('prodId').value = p.id;
        document.getElementById('prodName').value = p.name;
        document.getElementById('prodSku').value = p.sku;
        document.getElementById('prodCategory').value = p.category;
        document.getElementById('prodBaseUnit').value = p.baseUnit;
        document.getElementById('prodStock').value = p.currentStock;
        document.getElementById('prodMinStock').value = p.minStock;
        document.getElementById('prodCost').value = p.costPrice;
        document.getElementById('prodPrice').value = p.wholesalePrice;
        document.getElementById('prodBarcode').value = p.barcode;

        const container = document.getElementById('unitsRowsContainer');
        container.innerHTML = p.units.map(u => `
            <div class="unit-config-row">
                <input type="text" class="custom-input" value="${u.name}" style="flex:2">
                <input type="number" class="custom-input" value="${u.factor}" style="flex:1">
                <input type="number" class="custom-input" value="${u.price}" style="flex:1">
            </div>
        `).join('');

        document.getElementById('productModal').classList.add('active');
    }

    addUnitRow() {
        const container = document.getElementById('unitsRowsContainer');
        const div = document.createElement('div');
        div.className = 'unit-config-row';
        div.innerHTML = `
            <input type="text" class="custom-input" placeholder="اسم العبوة (مثال: باليتة)" style="flex:2">
            <input type="number" class="custom-input" placeholder="المعامل" value="24" style="flex:1">
            <input type="number" class="custom-input" placeholder="سعر البيع" value="1500" style="flex:1">
        `;
        container.appendChild(div);
    }

    saveProduct() {
        const id = document.getElementById('prodId').value;
        const name = document.getElementById('prodName').value.trim();
        const sku = document.getElementById('prodSku').value.trim() || 'SKU-' + Date.now().toString().slice(-5);
        const category = document.getElementById('prodCategory').value;
        const baseUnit = document.getElementById('prodBaseUnit').value.trim() || 'عبوة';
        const stock = parseFloat(document.getElementById('prodStock').value) || 0;
        const minStock = parseFloat(document.getElementById('prodMinStock').value) || 10;
        const costPrice = parseFloat(document.getElementById('prodCost').value) || 0;
        const wholesalePrice = parseFloat(document.getElementById('prodPrice').value) || 0;
        const barcode = document.getElementById('prodBarcode').value.trim() || Math.floor(100000000000 + Math.random() * 900000000000).toString();

        const unitRows = document.querySelectorAll('#unitsRowsContainer .unit-config-row');
        const units = [
            { id: Date.now() + 1, name: `عبوة فردية (${baseUnit})`, factor: 1, price: wholesalePrice, cost: costPrice, barcode }
        ];

        unitRows.forEach((row, i) => {
            const inputs = row.querySelectorAll('input');
            const uName = inputs[0]?.value.trim();
            const uFactor = parseFloat(inputs[1]?.value) || 1;
            const uPrice = parseFloat(inputs[2]?.value) || (wholesalePrice * uFactor);
            if (uName) {
                units.push({
                    id: Date.now() + i + 2,
                    name: uName,
                    factor: uFactor,
                    price: uPrice,
                    cost: costPrice * uFactor,
                    barcode: barcode + (i + 1),
                    isDefault: i === 0
                });
            }
        });

        if (id) {
            const existing = this.products.find(p => p.id == id);
            if (existing) {
                Object.assign(existing, { name, sku, category, baseUnit, currentStock: stock, minStock, costPrice, wholesalePrice, barcode, units });
            }
        } else {
            this.products.unshift({
                id: Date.now(),
                name, sku, category, baseUnit,
                currentStock: stock,
                minStock,
                costPrice,
                wholesalePrice,
                barcode,
                units
            });
        }

        this.saveAll();
        this.closeProductModal();
        this.renderCategories();
        this.renderProducts();
        this.renderInventory();
        this.renderHome();
    }

    deleteProduct(id) {
        if (confirm('هل أنت متأكد من حذف هذا الصنف من المستودع؟')) {
            this.products = this.products.filter(p => p.id !== id);
            this.saveAll();
            this.renderProducts();
            this.renderInventory();
            this.renderHome();
        }
    }

    closeProductModal() {
        document.getElementById('productModal').classList.remove('active');
    }

    // Customer Selection Modal
    openCustomerModal() {
        const list = document.getElementById('customerPickerList');
        if (!list) return;

        list.innerHTML = `
            <div class="customer-picker-item" onclick="app.selectCustomer(null)" style="padding:12px; border:1px solid var(--border-color); border-radius:12px; margin-bottom:8px; cursor:pointer; background:var(--bg-card);">
                <strong><i class="fa-solid fa-user"></i> عميل نقدي (Walk-in Buyer)</strong>
                <p style="font-size:0.75rem; color:var(--text-muted);">أسعار الجملة القياسية (شريحة 1)</p>
            </div>
            ${this.customers.map(c => `
                <div class="customer-picker-item" onclick="app.selectCustomer(${c.id})" style="padding:12px; border:1px solid var(--border-color); border-radius:12px; margin-bottom:8px; cursor:pointer; background:var(--bg-card);">
                    <div style="display:flex; justify-content:space-between;">
                        <strong><i class="fa-solid fa-store"></i> ${c.businessName}</strong>
                        <span class="tier-pill">شريحة ${c.tier}</span>
                    </div>
                    <div style="font-size:0.78rem; color:var(--text-muted); margin-top:4px;">
                        المسؤول: ${c.contactName} • الآجل: ${c.currentBalance} ج.م / ${c.creditLimit} ج.م
                    </div>
                </div>
            `).join('')}
        `;
        document.getElementById('customerModal').classList.add('active');
    }

    closeCustomerModal() {
        document.getElementById('customerModal').classList.remove('active');
    }

    selectCustomer(id) {
        this.selectedCustomer = this.customers.find(c => c.id === id) || null;
        this.closeCustomerModal();
        this.renderCart();
        this.renderProducts();
    }

    openAddCustomerModal() {
        document.getElementById('custBusinessName').value = '';
        document.getElementById('custContactName').value = '';
        document.getElementById('custPhone').value = '';
        document.getElementById('custCreditLimit').value = '25000';
        document.getElementById('addCustomerModal').classList.add('active');
    }

    closeAddCustomerModal() {
        document.getElementById('addCustomerModal').classList.remove('active');
    }

    saveNewCustomer() {
        const businessName = document.getElementById('custBusinessName').value.trim();
        const contactName = document.getElementById('custContactName').value.trim();
        const phone = document.getElementById('custPhone').value.trim();
        const tier = parseInt(document.getElementById('custTier').value) || 1;
        const creditLimit = parseFloat(document.getElementById('custCreditLimit').value) || 10000;

        if (!businessName || !phone) return;

        this.customers.push({
            id: Date.now(),
            businessName,
            contactName,
            phone,
            taxId: 'EG-' + Math.floor(100 + Math.random() * 900) + '-' + Math.floor(100 + Math.random() * 900),
            tier,
            creditLimit,
            currentBalance: 0,
            paymentTerms: 30,
            statement: []
        });

        this.saveAll();
        this.closeAddCustomerModal();
        this.renderCustomers();
        this.renderHome();
    }

    openPaymentModal(id) {
        const c = this.customers.find(item => item.id === id);
        if (!c) return;

        document.getElementById('payCustId').value = c.id;
        document.getElementById('payCustSummary').innerHTML = `
            <strong>${c.businessName}</strong>
            <p>الرصيد الآجل المطلوب: <strong style="color:var(--primary-orange);">${c.currentBalance.toLocaleString()} ج.م</strong></p>
        `;
        document.getElementById('payAmount').value = c.currentBalance;
        document.getElementById('paymentModal').classList.add('active');
    }

    closePaymentModal() {
        document.getElementById('paymentModal').classList.remove('active');
    }

    saveCustomerPayment() {
        const id = parseInt(document.getElementById('payCustId').value);
        const amt = parseFloat(document.getElementById('payAmount').value) || 0;
        const c = this.customers.find(item => item.id === id);

        if (c && amt > 0) {
            c.currentBalance = Math.max(0, c.currentBalance - amt);
            if (!c.statement) c.statement = [];
            c.statement.push({
                date: new Date().toISOString().slice(0, 10),
                desc: 'سداد نقدي دفعة حساب (سند قبض)',
                debit: 0,
                credit: amt,
                balance: c.currentBalance
            });

            this.saveAll();
            this.closePaymentModal();
            this.renderCustomers();
            this.renderHome();
            if (this.activeDetailCustomer && this.activeDetailCustomer.id === c.id) {
                this.openCustomerDetail(c.id);
            }
            alert(`تم تحصيل ${amt.toLocaleString()} ج.م وإصدار سند القبض بنجاح.`);
        }
    }

    // ==========================================================================
    // REPORTS & ANALYTICS
    // ==========================================================================
    renderReports() {
        let totalSales = 0;
        let cashSales = 0;
        let creditSales = 0;
        let totalCostOfSold = 0;

        this.orders.forEach(o => {
            totalSales += o.grandTotal;
            if (o.paymentMethod === 'CREDIT_NET30') creditSales += o.grandTotal;
            else cashSales += o.grandTotal;
            if (o.items) {
                o.items.forEach(it => {
                    totalCostOfSold += (it.costPrice || 0) * it.quantity;
                });
            }
        });

        const estimatedProfit = Math.max(0, totalSales - totalCostOfSold);
        const marginRate = totalSales > 0 ? ((estimatedProfit / totalSales) * 100).toFixed(1) : '0';

        document.getElementById('reportTotalSales').innerText = totalSales.toLocaleString() + ' ج.م';
        document.getElementById('reportOrdersCount').innerText = `${this.orders.length} فواتير مسجلة`;
        document.getElementById('reportCashSales').innerText = cashSales.toLocaleString() + ' ج.م';
        document.getElementById('reportCreditSales').innerText = creditSales.toLocaleString() + ' ج.م';
        document.getElementById('reportEstimatedProfit').innerText = estimatedProfit.toLocaleString() + ' ج.م';
        document.getElementById('reportProfitMarginRate').innerText = `${marginRate}% نسبة الربحية`;

        const ordersTbody = document.getElementById('ordersTableBody');
        if (ordersTbody) {
            ordersTbody.innerHTML = this.orders.map(o => `
                <tr>
                    <td><strong>${o.orderNumber}</strong></td>
                    <td>${o.customerName}</td>
                    <td>${o.date}</td>
                    <td>${o.paymentMethod === 'CREDIT_NET30' ? 'آجل' : 'نقداً'}</td>
                    <td><strong>${o.grandTotal.toFixed(2)} ج.م</strong></td>
                    <td><span class="inv-status-badge">${o.paymentStatus}</span></td>
                    <td><button class="btn-table-action" onclick="app.previewOrder(${o.id})"><i class="fa-solid fa-eye"></i></button></td>
                </tr>
            `).join('');
        }

        const auditTbody = document.getElementById('auditTableBody');
        if (auditTbody) {
            auditTbody.innerHTML = this.auditLog.slice(0, 15).map(a => `
                <tr>
                    <td><strong>${a.productName}</strong></td>
                    <td>${a.type}</td>
                    <td style="color:${a.qty > 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)'}; direction:ltr; text-align:right;">
                        ${a.qty > 0 ? '+' : ''}${a.qty}
                    </td>
                    <td>${a.previousStock}</td>
                    <td><strong>${a.newStock}</strong></td>
                    <td>${a.date} (${a.ref})</td>
                </tr>
            `).join('');
        }
    }

    previewOrder(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
            this.showInvoiceModal(order);
        }
    }

    // CSV Exports (UTF-8 with BOM for Excel compatibility)
    exportInventoryCSV() {
        const bom = '\uFEFF';
        let csv = bom + 'الكود (SKU),اسم الصنف,القسم,الوحدة الأساسية,الرصيد المتاح,سعر التكلفة,سعر الجملة,الباركود الدولي,إجمالي قيمة الشراء,إجمالي قيمة الجملة\r\n';
        this.products.forEach(p => {
            const costVal = p.currentStock * p.costPrice;
            const wholesaleVal = p.currentStock * p.wholesalePrice;
            csv += `"${p.sku}","${p.name}","${p.category}","${p.baseUnit}",${p.currentStock},${p.costPrice},${p.wholesalePrice},"${p.barcode}",${costVal},${wholesaleVal}\r\n`;
        });
        this.downloadCSV(csv, 'Karma_Carmela_Inventory_Export.csv');
    }

    exportSalesCSV() {
        const bom = '\uFEFF';
        let csv = bom + 'رقم الفاتورة,التاريخ,اسم العميل,طريقة السداد,حالة الفاتورة,المجموع الفرعي,الخصم,الضريبة,الصافي الإجمالي,المبلغ كتابة (تفقيط)\r\n';
        this.orders.forEach(o => {
            csv += `"${o.orderNumber}","${o.date}","${o.customerName}","${o.paymentMethod}","${o.paymentStatus}",${o.subtotal},${o.discountAmount},${o.taxAmount},${o.grandTotal},"${o.tafqeetWords}"\r\n`;
        });
        this.downloadCSV(csv, 'Karma_Carmela_Sales_Report.csv');
    }

    downloadCSV(content, filename) {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}

// Global App Boot
const app = new KarmaCarmelaApp();
window.app = app;
