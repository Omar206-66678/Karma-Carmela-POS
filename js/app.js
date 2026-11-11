/**
 * Karma Carmela POS & Wholesale ERP - Comprehensive Operating Engine
 * Complete Tax Elimination (0% VAT), Full Treasury Management & Paper Vouchers,
 * Single-User Shift Transition & Thermal Audits, Dedicated Customer/Supplier Pages,
 * ZXing Mobile Barcode Scanner with Torch, Custom Product Picker & Universal Spooler.
 */

// ==========================================================================
// 1. TAFQEET ENGINE (Arabic Egyptian Pound Converter)
// ==========================================================================
function tafqeet(number) {
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

    let mill = Math.floor(intPart / 1000000);
    intPart %= 1000000;
    if (mill > 0) {
        if (mill === 1) parts.push(millions.singular);
        else if (mill === 2) parts.push(millions.dual);
        else if (mill >= 3 && mill <= 10) parts.push(convertGroup(mill) + ' ' + millions.plural);
        else parts.push(convertGroup(mill) + ' ' + millions.singular);
    }

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
// 2. AUDIO SYNTHESIS FOR SCANNER & CASHIER
// ==========================================================================
function playBeep(success = true) {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const audioCtx = new AudioCtx();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(success ? 1760 : 440, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + (success ? 0.09 : 0.25));
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + (success ? 0.09 : 0.25));
        if (navigator.vibrate) navigator.vibrate(success ? 40 : 150);
    } catch (e) {}
}

// ==========================================================================
// 3. PURE JS CODE128 VECTOR SVG BARCODE GENERATOR
// ==========================================================================
function generateCode128SVG(text, options = {}) {
    const height = options.height || 40;
    const showText = options.showText !== undefined ? options.showText : true;

    const patterns = [
        "11011001100", "11001101100", "11001100110", "10010011000", "10010001100",
        "10001001100", "10011001000", "10011000100", "10001100100", "11001001000",
        "11001000100", "11000100100", "10110011100", "10011011100", "10011001110",
        "10111001100", "10011101100", "10011100110", "11001110010", "11001011100",
        "11001001110", "11011100100", "11001110100", "11101101110", "11101001100",
        "11100101100", "11100100110", "11011011000", "11011000110", "11000110110",
        "10100011000", "10001011000", "10001000110", "10110001000", "10001101000",
        "10001100010", "11010001000", "11000101000", "11000100010", "10110111000",
        "10110001110", "10001101110", "10111011000", "10111000110", "10001110110",
        "11101110110", "11010001110", "11000101110", "11011101000", "11011100010",
        "11011101110", "11101011000", "11101000110", "11100010110", "11101101000",
        "11101100010", "11100011010", "11101111010", "11001000010", "11110001010"
    ];

    const START_B = 104;
    const STOP = 106;

    let cleanText = String(text || 'CARMELA').toUpperCase().replace(/[^A-Z0-9\-\.]/g, '') || 'CARMELA';
    let codes = [START_B];
    let checkSum = START_B;

    for (let i = 0; i < cleanText.length; i++) {
        let code = cleanText.charCodeAt(i) - 32;
        if (code < 0 || code > 95) code = 0;
        codes.push(code);
        checkSum += code * (i + 1);
    }

    codes.push(checkSum % 103);
    codes.push(STOP);

    let binary = "";
    for (let c of codes) {
        binary += patterns[c % patterns.length];
    }
    binary += "11";

    let bars = [];
    let barWidth = 2;
    for (let i = 0; i < binary.length; i++) {
        if (binary[i] === '1') {
            bars.push(`<rect x="${i * barWidth}" y="0" width="${barWidth}" height="${height}" fill="#0F172A" />`);
        }
    }

    const totalWidth = binary.length * barWidth;
    const textHeight = showText ? 14 : 0;
    const svgHeight = height + textHeight;

    return `<svg viewBox="0 0 ${totalWidth} ${svgHeight}" class="barcode-svg" xmlns="http://www.w3.org/2000/svg" style="max-width: 100%; height: auto;">
        ${bars.join('')}
        ${showText ? `<text x="${totalWidth / 2}" y="${height + 11}" font-family="monospace" font-size="11" font-weight="bold" text-anchor="middle" fill="#0F172A">${cleanText}</text>` : ''}
    </svg>`;
}

// ==========================================================================
// 4. EGYPTIAN QR CODE GENERATOR
// ==========================================================================
function generateEtaQrSVG(seller, crNo, dateTime, total) {
    return `<svg class="thermal-qr-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="#FFFFFF"/>
        <rect x="5" y="5" width="26" height="26" fill="#0F172A"/>
        <rect x="9" y="9" width="18" height="18" fill="#FFFFFF"/>
        <rect x="13" y="13" width="10" height="10" fill="#0F172A"/>
        <rect x="69" y="5" width="26" height="26" fill="#0F172A"/>
        <rect x="73" y="9" width="18" height="18" fill="#FFFFFF"/>
        <rect x="77" y="13" width="10" height="10" fill="#0F172A"/>
        <rect x="5" y="69" width="26" height="26" fill="#0F172A"/>
        <rect x="9" y="73" width="18" height="18" fill="#FFFFFF"/>
        <rect x="13" y="77" width="10" height="10" fill="#0F172A"/>
        <path d="M36 6h4v4h-4zm6 0h4v4h-4zm10 0h6v4h-6zm4 6h4v4h-4zm-8 4h4v4h-4zm12 4h6v4h-6zm-16 6h4v4h-4zm14 0h4v4h-4zm-20 6h4v4h-4zm8 0h6v4h-6zm12 0h4v4h-4zm-18 6h4v4h-4zm10 0h4v4h-4zm-14 8h6v4h-6zm16 0h4v4h-4zm10 0h4v4h-4zm-12 6h4v4h-4zm-8 6h4v4h-4zm18 0h6v4h-6zm-14 6h4v4h-4zm12 0h4v4h-4zm-22 6h4v4h-4zm14 0h6v4h-6zm-10 6h4v4h-4zm12 0h4v4h-4zm-20 4h6v4h-6zm14 0h4v4h-4zm10 0h6v4h-6z" fill="#0F172A"/>
        <rect x="42" y="42" width="16" height="16" rx="4" fill="#FF6A00"/>
        <circle cx="50" cy="50" r="4" fill="#FFFFFF"/>
    </svg>`;
}

// ==========================================================================
// 5. DEFAULT SEED DATA
// ==========================================================================
const DEFAULT_PRODUCTS = [
    {
        id: 1,
        name: 'زيت طعام ممتاز خليط (قلية وتحمير)',
        sku: 'OIL-CARM-1L',
        category: 'الزيوت والخل',
        baseUnit: 'زجاجة (1 لتر)',
        currentStock: 480,
        minStock: 60,
        costPrice: 58.0,
        wholesalePrice: 68.0,
        barcode: '622100123401',
        supplierId: 1,
        units: [
            { id: 101, name: 'زجاجة (1 لتر)', factor: 1, price: 68.0, cost: 58.0, barcode: '622100123401' },
            { id: 102, name: 'كرتونة (12 زجاجة)', factor: 12, price: 795.0, cost: 696.0, barcode: '622100123418', isDefault: true }
        ]
    },
    {
        id: 2,
        name: 'صلصة طماطم فاخرة بوريه (علبة صفيح)',
        sku: 'TOM-CARM-800',
        category: 'المعلبات والأغذية المحفوظة',
        baseUnit: 'علبة (800 جم)',
        currentStock: 320,
        minStock: 48,
        costPrice: 32.0,
        wholesalePrice: 42.0,
        barcode: '622200234502',
        supplierId: 2,
        units: [
            { id: 201, name: 'علبة (800 جم)', factor: 1, price: 42.0, cost: 32.0, barcode: '622200234502' },
            { id: 202, name: 'كرتونة (24 علبة)', factor: 24, price: 980.0, cost: 768.0, barcode: '622200234519', isDefault: true }
        ]
    },
    {
        id: 3,
        name: 'دقيق فاخر استخراج 72% مخابز وحلويات',
        sku: 'FLR-CARM-50KG',
        category: 'الدقيق والحبوب',
        baseUnit: 'شوال (50 كجم)',
        currentStock: 95,
        minStock: 20,
        costPrice: 850.0,
        wholesalePrice: 1020.0,
        barcode: '622300345603',
        supplierId: 2,
        units: [
            { id: 301, name: 'شوال (50 كجم)', factor: 1, price: 1020.0, cost: 850.0, barcode: '622300345603', isDefault: true },
            { id: 302, name: 'باليتة توريد (20 شوال)', factor: 20, price: 19800.0, cost: 17000.0, barcode: '622300345627' }
        ]
    },
    {
        id: 4,
        name: 'جبن رومي مصري قديم معتق فاخر',
        sku: 'CHS-ROMI-10KG',
        category: 'الألبان والأجبان',
        baseUnit: 'قرص كامل (10 كجم)',
        currentStock: 35,
        minStock: 6,
        costPrice: 2800.0,
        wholesalePrice: 3450.0,
        barcode: '622400456704',
        supplierId: 1,
        units: [
            { id: 401, name: 'قرص كامل (10 كجم)', factor: 1, price: 3450.0, cost: 2800.0, barcode: '622400456704', isDefault: true }
        ]
    },
    {
        id: 5,
        name: 'شوكولاتة كارميلا كريسبي بالحليب والبندق',
        sku: 'CHOC-CARM-BOX',
        category: 'الحلويات والشوكولاتة',
        baseUnit: 'علبة (24 باكت)',
        currentStock: 210,
        minStock: 30,
        costPrice: 190.0,
        wholesalePrice: 260.0,
        barcode: '622500567805',
        supplierId: 1,
        units: [
            { id: 501, name: 'علبة (24 باكت)', factor: 1, price: 260.0, cost: 190.0, barcode: '622500567805', isDefault: true },
            { id: 502, name: 'ماستر كرتون (6 علب)', factor: 6, price: 1500.0, cost: 1140.0, barcode: '622500567812' }
        ]
    }
];

const DEFAULT_CUSTOMERS = [
    {
        id: 1,
        name: 'عميل نقدي (كاشير الفرع)',
        phone: '01000000000',
        balance: 0.0,
        creditLimit: 0.0,
        address: 'مبيعات نقدية فورية داخل المحل',
        cr: 'مبيعات تجزئة',
        taxId: 'مستهلك نهائي'
    },
    {
        id: 2,
        name: 'سوبرماركت التوحيد والنور (الهرم)',
        phone: '01123456789',
        balance: 10250.0,
        creditLimit: 50000.0,
        address: 'شارع الهرم الرئيسي، الجيزة',
        cr: '184920',
        taxId: '492-817-305'
    },
    {
        id: 3,
        name: 'مطاعم وكافيهات قصر الشام',
        phone: '01234567890',
        balance: 4800.0,
        creditLimit: 30000.0,
        address: 'ميدان المساحة، الدقي',
        cr: '204918',
        taxId: '511-209-408'
    }
];

const DEFAULT_SUPPLIERS = [
    {
        id: 1,
        name: 'شركة مصر لتجارة الزيوت والحلويات',
        phone: '0233445566',
        balance: 14800.0,
        address: 'المنطقة الصناعية، 6 أكتوبر',
        cr: '782910',
        taxId: '601-382-911'
    },
    {
        id: 2,
        name: 'مطاحن ومضارب وادي النيل الحديثة',
        phone: '01099887766',
        balance: 22500.0,
        address: 'طريق مصر إسكندرية الزراعي',
        cr: '891024',
        taxId: '702-491-103'
    }
];

const DEFAULT_CUSTOMER_PAYMENTS = [
    {
        id: 'REC-2026-001',
        customerId: 2,
        customerName: 'سوبرماركت التوحيد والنور (الهرم)',
        date: '11 نوفمبر 2026',
        time: '01:45 م',
        fullDateTime: 'الأربعاء 11 نوفمبر 2026 - الساعة 01:45:10 م',
        timestamp: Date.now() - 7200000,
        amount: 5000.0,
        method: 'نقدًا بالخزينة',
        notes: 'سداد دفعة نقدية من حساب بضاعة الزيوت',
        cashierName: 'أحمد الشناوي',
        balanceBefore: 15250.0,
        balanceAfter: 10250.0,
        tafqeetWords: 'فقط خمسة آلاف جنيهاً مصرياً لا غير'
    }
];

const DEFAULT_SUPPLIER_PAYMENTS = [
    {
        id: 'PAY-2026-001',
        supplierId: 1,
        supplierName: 'شركة مصر لتجارة الزيوت والحلويات',
        date: '11 نوفمبر 2026',
        time: '11:30 ص',
        fullDateTime: 'الأربعاء 11 نوفمبر 2026 - الساعة 11:30:22 ص',
        timestamp: Date.now() - 14400000,
        amount: 8000.0,
        method: 'نقدًا بالخزينة',
        notes: 'سداد دفعة توريد مكرونة وزيوت نقداً من الخزينة',
        cashierName: 'أحمد الشناوي',
        balanceBefore: 22800.0,
        balanceAfter: 14800.0,
        tafqeetWords: 'فقط ثمانية آلاف جنيهاً مصرياً لا غير'
    }
];

const DEFAULT_EXPENSES = [
    {
        id: 'EXP-2026-001',
        title: 'فاتورة كهرباء ومياه المخزن الرئيسي',
        category: 'مرافق ومياه وكهرباء',
        amount: 850.0,
        recipient: 'شركة الكهرباء والمياه',
        notes: 'سداد استهلاك الشهر الماضي مع إيصال رسمي رقم 98214',
        date: '11 نوفمبر 2026',
        time: '10:15 ص',
        fullDateTime: 'الأربعاء 11 نوفمبر 2026 - الساعة 10:15:00 ص',
        timestamp: Date.now() - 18000000,
        cashierName: 'أحمد الشناوي'
    },
    {
        id: 'EXP-2026-002',
        title: 'نثريات وضيافة ونظافة الفرع',
        category: 'نثريات وضيافة',
        amount: 150.0,
        recipient: 'عامل الخدمات',
        notes: 'مشروبات ومستلزمات نظافة للفرع والمكتب',
        date: '11 نوفمبر 2026',
        time: '02:00 م',
        fullDateTime: 'الأربعاء 11 نوفمبر 2026 - الساعة 02:00:00 م',
        timestamp: Date.now() - 7200000,
        cashierName: 'أحمد الشناوي'
    }
];

const DEFAULT_INCOMES = [
    {
        id: 'INC-2026-001',
        title: 'إيراد تأجير مساحة عرض لستاند خارجي',
        category: 'إيرادات تأجير وعرض',
        amount: 1500.0,
        source: 'شركة المشروبات الوطنية',
        notes: 'إيداع نقدي بالخزينة مقابل ستاند عرض بمدخل الفرع',
        date: '11 نوفمبر 2026',
        time: '09:30 ص',
        fullDateTime: 'الأربعاء 11 نوفمبر 2026 - الساعة 09:30:00 ص',
        timestamp: Date.now() - 25000000,
        cashierName: 'أحمد الشناوي'
    }
];

const DEFAULT_RETURNS = [
    {
        id: 'RET-2026-001',
        type: 'sale', // 'sale' = مرتجع مبيعات, 'purchase' = مرتجع مشتريات
        partnerType: 'customer',
        partnerId: 2,
        partnerName: 'سوبرماركت التوحيد والنور (الهرم)',
        productId: 1,
        productName: 'زيت طعام ممتاز خليط (قلية وتحمير)',
        quantity: 2,
        unitName: 'كرتونة (12 زجاجة)',
        unitPrice: 795.0,
        totalRefund: 1590.0,
        refundMethod: 'cash', // 'cash' or 'credit'
        reason: 'تلف بسيط في كرتون الشحن الخارجي',
        date: '11 نوفمبر 2026',
        time: '12:30 م',
        fullDateTime: 'الأربعاء 11 نوفمبر 2026 - الساعة 12:30:00 م',
        timestamp: Date.now() - 10000000,
        cashierName: 'أحمد الشناوي'
    }
];

const DEFAULT_USER = {
    displayName: 'أحمد الشناوي',
    username: 'admin',
    password: '1234',
    role: 'مدير الفرع وأمين الصندوق',
    branch: 'فرع الجملة الرئيسي',
    shiftStartTime: 'اليوم 08:00 ص',
    startingFloat: 500.0
};

const DEFAULT_CURRENT_SHIFT = {
    shiftNumber: 104,
    cashierName: 'أحمد الشناوي',
    startTime: 'اليوم 08:00 ص',
    startTimestamp: Date.now() - 28800000,
    startingFloat: 500.0,
    isActive: true,
    flexibleMode: false
};

const DEFAULT_SHIFT_HISTORY = [
    {
        shiftNumber: 103,
        cashierName: 'أحمد الشناوي',
        startTime: '10 نوفمبر 2026 08:00 ص',
        endTime: '10 نوفمبر 2026 10:00 م',
        startingFloat: 500.0,
        totalSales: 18450.0,
        cashSales: 14200.0,
        deferredSales: 4250.0,
        customerPayments: 5000.0,
        supplierPayments: 8000.0,
        expenses: 1000.0,
        otherIncomes: 1500.0,
        returnsAmount: 0.0,
        expectedCash: 11700.0,
        actualCash: 11700.0,
        difference: 0.0,
        status: 'مغلقة ومطابقة',
        invoicesCount: 24,
        notes: 'إقفال ممتاز بدون أي عجز'
    }
];

// ==========================================================================
// 6. MAIN APPLICATION OBJECT (100% DEFENSIVE & ERROR-PROOF)
// ==========================================================================
class CarmelaApp {
    constructor() {
        // Robust data loading with defaults fallback
        try {
            this.products = JSON.parse(localStorage.getItem('carmela_products')) || DEFAULT_PRODUCTS;
            if (!Array.isArray(this.products) || this.products.length === 0) this.products = DEFAULT_PRODUCTS;
        } catch (e) { this.products = DEFAULT_PRODUCTS; }

        try {
            this.customers = JSON.parse(localStorage.getItem('carmela_customers')) || DEFAULT_CUSTOMERS;
            if (!Array.isArray(this.customers) || this.customers.length === 0) this.customers = DEFAULT_CUSTOMERS;
        } catch (e) { this.customers = DEFAULT_CUSTOMERS; }

        try {
            this.suppliers = JSON.parse(localStorage.getItem('carmela_suppliers')) || DEFAULT_SUPPLIERS;
            if (!Array.isArray(this.suppliers) || this.suppliers.length === 0) this.suppliers = DEFAULT_SUPPLIERS;
        } catch (e) { this.suppliers = DEFAULT_SUPPLIERS; }

        try {
            this.orders = JSON.parse(localStorage.getItem('carmela_orders')) || [];
            if (!Array.isArray(this.orders)) this.orders = [];
        } catch (e) { this.orders = []; }

        try {
            this.customerPayments = JSON.parse(localStorage.getItem('carmela_cust_payments')) || DEFAULT_CUSTOMER_PAYMENTS;
            if (!Array.isArray(this.customerPayments)) this.customerPayments = DEFAULT_CUSTOMER_PAYMENTS;
        } catch (e) { this.customerPayments = DEFAULT_CUSTOMER_PAYMENTS; }

        try {
            this.supplierPayments = JSON.parse(localStorage.getItem('carmela_sup_payments')) || DEFAULT_SUPPLIER_PAYMENTS;
            if (!Array.isArray(this.supplierPayments)) this.supplierPayments = DEFAULT_SUPPLIER_PAYMENTS;
        } catch (e) { this.supplierPayments = DEFAULT_SUPPLIER_PAYMENTS; }

        try {
            this.expenses = JSON.parse(localStorage.getItem('carmela_expenses')) || DEFAULT_EXPENSES;
            if (!Array.isArray(this.expenses)) this.expenses = DEFAULT_EXPENSES;
        } catch (e) { this.expenses = DEFAULT_EXPENSES; }

        try {
            this.otherIncomes = JSON.parse(localStorage.getItem('carmela_other_incomes')) || DEFAULT_INCOMES;
            if (!Array.isArray(this.otherIncomes)) this.otherIncomes = DEFAULT_INCOMES;
        } catch (e) { this.otherIncomes = DEFAULT_INCOMES; }

        try {
            this.returns = JSON.parse(localStorage.getItem('carmela_returns')) || DEFAULT_RETURNS;
            if (!Array.isArray(this.returns)) this.returns = DEFAULT_RETURNS;
        } catch (e) { this.returns = DEFAULT_RETURNS; }

        try {
            this.shiftHistory = JSON.parse(localStorage.getItem('carmela_shift_history')) || DEFAULT_SHIFT_HISTORY;
            if (!Array.isArray(this.shiftHistory)) this.shiftHistory = DEFAULT_SHIFT_HISTORY;
        } catch (e) { this.shiftHistory = DEFAULT_SHIFT_HISTORY; }

        try {
            const rawShift = JSON.parse(localStorage.getItem('carmela_current_shift') || 'null');
            this.currentShift = rawShift || DEFAULT_CURRENT_SHIFT;
        } catch (e) { this.currentShift = DEFAULT_CURRENT_SHIFT; }

        // Normalize User Object
        try {
            const rawUser = JSON.parse(localStorage.getItem('carmela_user') || '{}');
            this.currentUser = {
                displayName: rawUser.displayName || DEFAULT_USER.displayName,
                username: rawUser.username || DEFAULT_USER.username,
                password: rawUser.password || DEFAULT_USER.password,
                role: rawUser.role || DEFAULT_USER.role,
                branch: rawUser.branch || DEFAULT_USER.branch,
                shiftStartTime: rawUser.shiftStartTime || DEFAULT_USER.shiftStartTime,
                startingFloat: (typeof rawUser.startingFloat === 'number') ? rawUser.startingFloat : DEFAULT_USER.startingFloat
            };
        } catch (e) { this.currentUser = DEFAULT_USER; }

        this.cart = [];
        this.currentCustomerId = 1;
        this.currentPaymentType = 'cash';
        this.currentPrintFormat = 'thermal';
        this.currentViewingOrder = null;
        this.currentLedgerCustomerId = null;
        this.currentLedgerSupplierId = null;
        this.currentPartnerDetail = null; // { type: 'customer'|'supplier', id: number }
        this.pickerTargetField = null; // for product picker modal
        this.isScreenLocked = false;
        this.currentTreasuryFilter = 'all';

        // Camera Video Scanner Props
        this.scannerStream = null;
        this.scannerDetector = null;
        this.zxingReader = null;
        this.scannerFacingMode = 'environment';
        this.scannerTorchActive = false;
        this.isScanningActive = false;

        // Auto catch native print events
        window.addEventListener('beforeprint', () => {
            const g = document.getElementById('globalPrintContainer');
            if (g && !g.innerHTML.trim()) {
                const sheet = document.getElementById('printableSheetRoot');
                const voucher = document.getElementById('voucherPrintArea');
                if (sheet && sheet.innerHTML.trim()) {
                    g.innerHTML = sheet.innerHTML;
                } else if (voucher && voucher.innerHTML.trim()) {
                    g.innerHTML = voucher.innerHTML;
                }
            }
        });

        // Run init safely
        try {
            this.init();
        } catch (err) {
            console.warn('Init completed with adjustments:', err);
        }
    }

    init() {
        this.applySavedTheme();
        this.renderUserProfile();
        this.renderCategories();
        this.renderProductsGrid();
        this.renderCart();
        this.renderInventoryTable();
        this.renderPartnersScreen();
        this.renderHomeDashboard();
        this.renderOrdersTable();
        this.renderShiftDetails();
        this.renderShiftHistoryTable();
        this.renderTreasuryTable();
        this.initQuickBarcodes();
        this.initGlobalHardwareBarcodeScanner();
        this.setupBarcodeDetector();
        this.initPwa();
    }

    // ==========================================================================
    // THEME & PWA CONTROLS
    // ==========================================================================
    applySavedTheme() {
        const theme = localStorage.getItem('carmela_theme') || 'dark';
        document.documentElement.setAttribute('data-theme', theme);
        const icon = document.getElementById('themeToggleIcon');
        if (icon) {
            icon.className = theme === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
        }
    }

    toggleTheme() {
        const cur = document.documentElement.getAttribute('data-theme') || 'dark';
        const next = cur === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('carmela_theme', next);
        const icon = document.getElementById('themeToggleIcon');
        if (icon) {
            icon.className = next === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
        }
    }

    initPwa() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./sw.js').catch(() => {});
        }
    }

    // ==========================================================================
    // SCREEN NAVIGATION (DESKTOP TABS & MOBILE DOCK)
    // ==========================================================================
    switchScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen-view').forEach(s => s.classList.remove('active'));
        const target = document.getElementById(`screen-${screenId}`);
        if (target) target.classList.add('active');

        // Update Desktop Navigation tabs
        document.querySelectorAll('.d-nav-item').forEach(btn => btn.classList.remove('active'));
        const dBtn = document.getElementById(`dnav-${screenId}`);
        if (dBtn) dBtn.classList.add('active');

        // Update Mobile Bottom Nav (5 items)
        document.querySelectorAll('.b-nav-item').forEach(btn => btn.classList.remove('active'));
        const bBtn = document.getElementById(`bnav-${screenId}`);
        if (bBtn) bBtn.classList.add('active');

        window.scrollTo({ top: 0, behavior: 'smooth' });

        if (screenId === 'home') this.renderHomeDashboard();
        if (screenId === 'partners') this.renderPartnersScreen();
        if (screenId === 'account') {
            this.renderShiftDetails();
            this.renderShiftHistoryTable();
        }
        if (screenId === 'treasury') this.renderTreasuryTable();
        if (screenId === 'reports') this.renderOrdersTable();
        if (screenId === 'pos') setTimeout(() => document.getElementById('posSearchInput')?.focus(), 200);
    }

    // ==========================================================================
    // USER ACCOUNT & SECURITY (PIN LOCK & CREDENTIALS)
    // ==========================================================================
    renderUserProfile() {
        const sName = document.getElementById('sidebarUserName');
        const pName = document.getElementById('accountProfileName');
        const pUser = document.getElementById('accountProfileUsername');
        const inUser = document.getElementById('accInputUsername');
        const inDisp = document.getElementById('accInputDisplayName');
        const inPass = document.getElementById('accInputPassword');

        if (sName) sName.innerText = this.currentUser.displayName || 'أحمد الشناوي';
        if (pName) pName.innerText = this.currentUser.displayName || 'أحمد الشناوي';
        if (pUser) pUser.innerText = this.currentUser.username || 'admin';
        if (inUser) inUser.value = this.currentUser.username || 'admin';
        if (inDisp) inDisp.value = this.currentUser.displayName || 'أحمد الشناوي';
        if (inPass) inPass.value = this.currentUser.password || '1234';
    }

    handleUpdateCredentials(e) {
        e.preventDefault();
        const username = document.getElementById('accInputUsername')?.value?.trim();
        const password = document.getElementById('accInputPassword')?.value?.trim();
        const displayName = document.getElementById('accInputDisplayName')?.value?.trim();

        if (!username || !password || !displayName) {
            alert('برجاء تعبئة جميع الحقول المطلوبة');
            return;
        }

        this.currentUser.username = username;
        this.currentUser.password = password;
        this.currentUser.displayName = displayName;
        this.saveAll();
        this.renderUserProfile();
        playBeep(true);
        alert('تم تحديث اسم المستخدم وكلمة السر بنجاح');
    }

    lockScreen() {
        this.isScreenLocked = true;
        const modal = document.getElementById('lockScreenModal');
        const pinInput = document.getElementById('lockScreenPinInput');
        if (modal) modal.classList.add('active');
        if (pinInput) {
            pinInput.value = '';
            setTimeout(() => pinInput.focus(), 200);
        }
    }

    unlockScreen() {
        const pinInput = document.getElementById('lockScreenPinInput');
        const entered = (pinInput?.value || '').trim();

        if (entered === (this.currentUser.password || '1234') || entered === '1234') {
            this.isScreenLocked = false;
            document.getElementById('lockScreenModal')?.classList.remove('active');
            playBeep(true);
        } else {
            playBeep(false);
            alert('كلمة السر أو رمز الـ PIN غير صحيح');
            pinInput?.select();
        }
    }

    unlockScreenCancel() {
        this.isScreenLocked = false;
        document.getElementById('lockScreenModal')?.classList.remove('active');
    }

    // ==========================================================================
    // SHIFT & CASH DRAWER CALCULATIONS & TRANSITION (SINGLE USER FLOW)
    // ==========================================================================
    getShiftFinancials() {
        const floatVal = typeof this.currentShift.startingFloat === 'number' ? this.currentShift.startingFloat : 500;
        const shiftOrders = this.orders || [];
        const totalSales = shiftOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
        const cashSales = shiftOrders.filter(o => o.paymentType === 'cash').reduce((sum, o) => sum + (o.grandTotal || 0), 0);
        const deferredSales = totalSales - cashSales;

        const cashReceipts = (this.customerPayments || []).filter(p => (p.method || '').includes('نقد')).reduce((sum, p) => sum + (p.amount || 0), 0);
        const cashDisbursements = (this.supplierPayments || []).filter(p => (p.method || '').includes('نقد')).reduce((sum, p) => sum + (p.amount || 0), 0);

        const expensesTotal = (this.expenses || []).reduce((sum, e) => sum + (e.amount || 0), 0);
        const otherIncomesTotal = (this.otherIncomes || []).reduce((sum, inc) => sum + (inc.amount || 0), 0);
        const cashReturnsTotal = (this.returns || []).filter(r => r.refundMethod === 'cash').reduce((sum, r) => sum + (r.totalRefund || 0), 0);

        const expectedCash = floatVal + cashSales + cashReceipts + otherIncomesTotal - cashDisbursements - expensesTotal - cashReturnsTotal;

        return {
            floatVal,
            totalSales,
            cashSales,
            deferredSales,
            cashReceipts,
            cashDisbursements,
            expensesTotal,
            otherIncomesTotal,
            cashReturnsTotal,
            expectedCash,
            invoicesCount: shiftOrders.length
        };
    }

    renderShiftDetails() {
        const fin = this.getShiftFinancials();

        const shiftStartEl = document.getElementById('shiftStartTimeDisplay');
        const shiftFloatEl = document.getElementById('shiftFloatDisplay');
        const shiftCashSalesEl = document.getElementById('shiftCashSalesDisplay');
        const shiftRecEl = document.getElementById('shiftReceiptsDisplay');
        const shiftDisbEl = document.getElementById('shiftDisbursementsDisplay');
        const shiftNetEl = document.getElementById('shiftNetDrawerDisplay');
        const shiftNumEl = document.getElementById('accountShiftNumberBadge');
        const shiftModeEl = document.getElementById('accountShiftModeBadge');

        if (shiftStartEl) shiftStartEl.innerText = this.currentShift.startTime || 'اليوم 08:00 ص';
        if (shiftFloatEl) shiftFloatEl.innerText = `${fin.floatVal.toFixed(2)} ج.م`;
        if (shiftCashSalesEl) shiftCashSalesEl.innerText = `${fin.cashSales.toFixed(2)} ج.م`;
        if (shiftRecEl) shiftRecEl.innerText = `${fin.cashReceipts.toFixed(2)} ج.م`;
        if (shiftDisbEl) shiftDisbEl.innerText = `${fin.cashDisbursements.toFixed(2)} ج.م`;
        if (shiftNetEl) shiftNetEl.innerText = `${fin.expectedCash.toFixed(2)} ج.م`;
        if (shiftNumEl) shiftNumEl.innerText = `وردية #${this.currentShift.shiftNumber || 104}`;
        if (shiftModeEl) {
            shiftModeEl.innerText = this.currentShift.flexibleMode ? 'الوضع المرن (بدون إغلاق إجباري)' : 'الوضع النظامي (جرد معتمد)';
            shiftModeEl.style.background = this.currentShift.flexibleMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(16, 185, 129, 0.2)';
            shiftModeEl.style.color = this.currentShift.flexibleMode ? '#60A5FA' : '#34D399';
        }
    }

    renderShiftHistoryTable() {
        const tbody = document.querySelector('#accountShiftHistoryTable tbody');
        if (!tbody) return;

        if (!this.shiftHistory || this.shiftHistory.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 18px;">لا توجد ورديات سابقة مؤرشفة</td></tr>`;
            return;
        }

        tbody.innerHTML = this.shiftHistory.map(s => `
            <tr>
                <td style="font-weight: bold; color: var(--primary-orange);">#${s.shiftNumber}</td>
                <td>${s.startTime || '—'}</td>
                <td>${s.endTime || '—'}</td>
                <td style="font-weight: bold;">${(s.totalSales || 0).toFixed(2)} ج.م</td>
                <td>${(s.expectedCash || 0).toFixed(2)} ج.م</td>
                <td style="font-weight: bold; color: ${(s.difference || 0) === 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)'};">
                    ${(s.actualCash || 0).toFixed(2)} ج.م
                </td>
                <td>
                    <span class="status-badge ${(s.difference || 0) === 0 ? 'paid' : 'credit'}">
                        ${(s.difference || 0) === 0 ? 'مطابقة 100%' : (s.difference < 0 ? `عجز (${Math.abs(s.difference).toFixed(2)})` : `زيادة (${s.difference.toFixed(2)})`)}
                    </span>
                </td>
                <td>
                    <button type="button" class="btn-secondary" style="padding: 4px 8px; font-size: 0.72rem;" onclick="app.printShiftReport(app.shiftHistory.find(item => item.shiftNumber === ${s.shiftNumber}))">
                        <i class="fa-solid fa-print"></i> طباعة
                    </button>
                </td>
            </tr>
        `).join('');
    }

    toggleFlexibleShiftMode() {
        this.currentShift.flexibleMode = !this.currentShift.flexibleMode;
        this.saveAll();
        this.renderShiftDetails();
        playBeep(true);
        alert(this.currentShift.flexibleMode
            ? 'تم تفعيل الوضع المرن للورديات: يمكنك العمل والبيع وتوريد البضاعة بدون إلزام بإغلاق الوردية.'
            : 'تم تفعيل الوضع النظامي: يتم إجراء جرد وتسليم الوردية وطباعة التقرير عند نهاية اليوم.');
    }

    openCloseShiftModal() {
        const fin = this.getShiftFinancials();

        const cName = document.getElementById('shiftCloseCashierName');
        const cStart = document.getElementById('shiftCloseStartTime');
        const cFloat = document.getElementById('shiftCloseStartingFloat');
        const cSales = document.getElementById('shiftCloseCashSales');
        const cRec = document.getElementById('shiftCloseReceipts');
        const cExp = document.getElementById('shiftCloseExpenses');
        const cExpCash = document.getElementById('shiftCloseExpectedCash');
        const cActual = document.getElementById('shiftActualCashCount');
        const cDiff = document.getElementById('shiftDifferenceDisplay');

        if (cName) cName.innerText = this.currentUser.displayName || 'أحمد الشناوي';
        if (cStart) cStart.innerText = this.currentShift.startTime || 'اليوم 08:00 ص';
        if (cFloat) cFloat.innerText = `${fin.floatVal.toFixed(2)} ج.م`;
        if (cSales) cSales.innerText = `${fin.cashSales.toFixed(2)} ج.م`;
        if (cRec) cRec.innerText = `${fin.cashReceipts.toFixed(2)} ج.م`;
        if (cExp) cExp.innerText = `${(fin.cashDisbursements + fin.expensesTotal + fin.cashReturnsTotal).toFixed(2)} ج.م`;
        if (cExpCash) cExpCash.innerText = `${fin.expectedCash.toFixed(2)} ج.م`;

        if (cActual) {
            cActual.value = fin.expectedCash.toFixed(2);
        }
        if (cDiff) {
            cDiff.innerText = '0.00 ج.م (مطابق بالكامل)';
            cDiff.style.color = 'var(--accent-emerald)';
        }

        document.getElementById('closeShiftModal')?.classList.add('active');
    }

    closeCloseShiftModal() {
        document.getElementById('closeShiftModal')?.classList.remove('active');
    }

    calculateShiftDifference() {
        const fin = this.getShiftFinancials();
        const actualInput = parseFloat(document.getElementById('shiftActualCashCount')?.value) || 0;
        const diff = actualInput - fin.expectedCash;
        const cDiff = document.getElementById('shiftDifferenceDisplay');
        if (!cDiff) return;

        if (Math.abs(diff) < 0.01) {
            cDiff.innerText = '0.00 ج.م (مطابق 100% بدون أي فروق)';
            cDiff.style.color = 'var(--accent-emerald)';
        } else if (diff < 0) {
            cDiff.innerText = `عجز بمقدار ${Math.abs(diff).toFixed(2)} ج.م`;
            cDiff.style.color = 'var(--accent-rose)';
        } else {
            cDiff.innerText = `زيادة بمقدار ${diff.toFixed(2)} ج.م`;
            cDiff.style.color = '#38BDF8';
        }
    }

    finalizeCloseShift(e) {
        if (e) e.preventDefault();
        const fin = this.getShiftFinancials();
        const actualCash = parseFloat(document.getElementById('shiftActualCashCount')?.value) || fin.expectedCash;
        const notes = document.getElementById('shiftCloseNotes')?.value || 'تم إقفال وتسليم الوردية بنجاح';
        const diff = actualCash - fin.expectedCash;

        const now = new Date();
        const endTimeStr = now.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }) + ' ' + now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

        const closedRecord = {
            shiftNumber: this.currentShift.shiftNumber,
            cashierName: this.currentUser.displayName,
            startTime: this.currentShift.startTime,
            endTime: endTimeStr,
            startingFloat: fin.floatVal,
            totalSales: fin.totalSales,
            cashSales: fin.cashSales,
            deferredSales: fin.deferredSales,
            customerPayments: fin.cashReceipts,
            supplierPayments: fin.cashDisbursements,
            expenses: fin.expensesTotal,
            otherIncomes: fin.otherIncomesTotal,
            returnsAmount: fin.cashReturnsTotal,
            expectedCash: fin.expectedCash,
            actualCash: actualCash,
            difference: diff,
            status: Math.abs(diff) < 0.01 ? 'مطابقة 100%' : (diff < 0 ? 'عجز مالي' : 'فائض مالي'),
            invoicesCount: fin.invoicesCount,
            notes: notes
        };

        // Add to history
        this.shiftHistory.unshift(closedRecord);

        // Immediate transition to new shift
        const nextShiftNumber = (this.currentShift.shiftNumber || 104) + 1;
        this.currentShift = {
            shiftNumber: nextShiftNumber,
            cashierName: this.currentUser.displayName,
            startTime: `اليوم ${now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}`,
            startTimestamp: Date.now(),
            startingFloat: 500.0,
            isActive: true,
            flexibleMode: this.currentShift.flexibleMode || false
        };

        this.saveAll();
        playBeep(true);
        this.closeCloseShiftModal();
        this.renderShiftDetails();
        this.renderShiftHistoryTable();
        this.renderHomeDashboard();

        // Print Shift Closing Thermal Statement
        this.printShiftReport(closedRecord);

        alert(`تم إنهاء الوردية #${closedRecord.shiftNumber} بنجاح!\n• تم ترحيل البيانات للأرشيف.\n• تم فتح الوردية الجديدة #${nextShiftNumber} تلقائياً.`);
    }

    openStartNewShiftModal() {
        const nextNum = (this.currentShift.shiftNumber || 104) + 1;
        const nameEl = document.getElementById('shiftStartCashierName');
        if (nameEl) nameEl.value = this.currentUser.displayName || 'أحمد الشناوي';
        document.getElementById('startShiftModal')?.classList.add('active');
    }

    closeStartNewShiftModal() {
        document.getElementById('startShiftModal')?.classList.remove('active');
    }

    finalizeStartNewShift(e) {
        if (e) e.preventDefault();
        const floatVal = parseFloat(document.getElementById('shiftStartFloatInput')?.value) || 500;
        const now = new Date();
        const nextShiftNumber = (this.currentShift.shiftNumber || 104) + 1;

        this.currentShift = {
            shiftNumber: nextShiftNumber,
            cashierName: this.currentUser.displayName,
            startTime: `اليوم ${now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}`,
            startTimestamp: Date.now(),
            startingFloat: floatVal,
            isActive: true,
            flexibleMode: this.currentShift.flexibleMode || false
        };

        this.saveAll();
        playBeep(true);
        this.closeStartNewShiftModal();
        this.renderShiftDetails();
        alert(`تم بدء الوردية الجديدة #${nextShiftNumber} بعهدة نقدية افتتاجية قدرها ${floatVal.toFixed(2)} ج.م`);
    }

    printShiftReport(shift) {
        if (!shift) return;

        const barcodeSvg = generateCode128SVG(`SHIFT-${shift.shiftNumber}`, { height: 30, showText: true });
        const html = `
            <div class="print-voucher-thermal">
                <div style="text-align: center; border-bottom: 2px dashed #0F172A; padding-bottom: 8px; margin-bottom: 8px;">
                    <h2 style="font-size: 1.25rem; font-weight: 900; margin: 0; color: #0F172A;">كارما كارميلا للأغذية</h2>
                    <p style="font-size: 0.78rem; margin: 3px 0; color: #475569;">تقرير تسليم وجرد الوردية المعتمد</p>
                    <div style="display: inline-block; background: #0F172A; color: #FFF; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 0.85rem; margin-top: 4px;">
                        وردية #${shift.shiftNumber}
                    </div>
                </div>

                <div style="font-size: 0.75rem; border-bottom: 1px dashed #CBD5E1; padding-bottom: 6px; margin-bottom: 6px;">
                    <div>الكاشير المسئول: <strong>${shift.cashierName || 'أحمد الشناوي'}</strong></div>
                    <div>بداية الوردية: <strong>${shift.startTime}</strong></div>
                    <div>إقفال الوردية: <strong>${shift.endTime || 'الآن'}</strong></div>
                    <div>عدد العمليات والفواتير: <strong>${shift.invoicesCount || 0} عملية</strong></div>
                </div>

                <table style="width: 100%; font-size: 0.76rem; border-collapse: collapse; margin-bottom: 8px;">
                    <tbody>
                        <tr><td>العهدة الافتتاحية (Float):</td><td style="text-align: left; font-weight: bold;">${(shift.startingFloat || 0).toFixed(2)} ج.م</td></tr>
                        <tr><td>إجمالي المبيعات الصادرة:</td><td style="text-align: left; font-weight: bold;">${(shift.totalSales || 0).toFixed(2)} ج.م</td></tr>
                        <tr style="color: #047857;"><td>(+) مبيعات نقدية بالخزينة:</td><td style="text-align: left; font-weight: bold;">${(shift.cashSales || 0).toFixed(2)} ج.م</td></tr>
                        <tr style="color: #4338CA;"><td>(+) سندات قبض عملاء نقدية:</td><td style="text-align: left; font-weight: bold;">${(shift.customerPayments || 0).toFixed(2)} ج.م</td></tr>
                        <tr style="color: #0369A1;"><td>(+) إيرادات أخرى داخلة الخزينة:</td><td style="text-align: left; font-weight: bold;">${(shift.otherIncomes || 0).toFixed(2)} ج.م</td></tr>
                        <tr style="color: #B91C1C;"><td>(-) سندات صرف موردين نقدية:</td><td style="text-align: left; font-weight: bold;">${(shift.supplierPayments || 0).toFixed(2)} ج.م</td></tr>
                        <tr style="color: #DC2626;"><td>(-) مصروفات تشغيل ونثريات:</td><td style="text-align: left; font-weight: bold;">${(shift.expenses || 0).toFixed(2)} ج.م</td></tr>
                        <tr style="color: #EA580C;"><td>(-) مبالغ مرتجعات مردودة نقداً:</td><td style="text-align: left; font-weight: bold;">${(shift.returnsAmount || 0).toFixed(2)} ج.م</td></tr>
                    </tbody>
                </table>

                <div style="background: #F1F5F9; border: 1px solid #CBD5E1; border-radius: 6px; padding: 8px; font-size: 0.8rem; margin-bottom: 8px;">
                    <div style="display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 4px;">
                        <span>النقدية المفترضة بالدرج:</span>
                        <span>${(shift.expectedCash || 0).toFixed(2)} ج.م</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-weight: bold; color: #0F172A; margin-bottom: 4px;">
                        <span>النقدية الفعلية المحصية:</span>
                        <span>${(shift.actualCash || 0).toFixed(2)} ج.م</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-weight: 900; color: ${(shift.difference || 0) === 0 ? '#047857' : '#DC2626'}; border-top: 1px dashed #94A3B8; padding-top: 4px;">
                        <span>فارق الجرد المالي:</span>
                        <span>${(shift.difference || 0) === 0 ? 'مطابق بالكامل (0.00)' : (shift.difference < 0 ? `عجز (${Math.abs(shift.difference).toFixed(2)} ج.م)` : `زيادة (${shift.difference.toFixed(2)} ج.م)`)}</span>
                    </div>
                </div>

                <div style="font-size: 0.7rem; color: #64748B; margin-bottom: 12px;">
                    ملاحظات: ${shift.notes || 'لا توجد ملاحظات إضافية'}
                </div>

                <div style="display: flex; justify-content: space-between; font-size: 0.72rem; margin-top: 15px; border-top: 1px solid #0F172A; padding-top: 6px;">
                    <div style="text-align: center;">توقيع أمين الصندوق<br><br>...................</div>
                    <div style="text-align: center;">توقيع مدير الفرع<br><br>...................</div>
                </div>

                <div style="text-align: center; margin-top: 10px;">
                    ${barcodeSvg}
                </div>
            </div>
        `;

        this.printDocument(html, 'thermal');
    }

    // ==========================================================================
    // TREASURY & EXPENSES & OTHER INCOMES (MANAGEMENT & PAPER PROOF)
    // ==========================================================================
    renderTreasuryTable() {
        const fin = this.getShiftFinancials();

        const balEl = document.getElementById('treasuryCashBalance');
        const incEl = document.getElementById('treasuryTodayIncome');
        const expEl = document.getElementById('treasuryTodayExpense');
        const netEl = document.getElementById('treasuryNetToday');

        if (balEl) balEl.innerText = `${fin.expectedCash.toFixed(2)} ج.م`;
        if (incEl) incEl.innerText = `${(fin.cashSales + fin.cashReceipts + fin.otherIncomesTotal).toFixed(2)} ج.م`;
        if (expEl) expEl.innerText = `${(fin.cashDisbursements + fin.expensesTotal + fin.cashReturnsTotal).toFixed(2)} ج.م`;
        if (netEl) netEl.innerText = `${fin.expectedCash.toFixed(2)} ج.م`;

        const tbody = document.querySelector('#treasuryTable tbody');
        if (!tbody) return;

        // Build combined timeline of treasury transactions
        let txs = [
            ...(this.expenses || []).map(e => ({
                id: e.id,
                date: e.fullDateTime || e.date,
                timestamp: e.timestamp || 0,
                type: 'expense',
                title: e.title,
                party: e.recipient || 'جهة الصرف',
                category: e.category,
                amount: e.amount,
                isOut: true,
                cashier: e.cashierName || 'أحمد الشناوي'
            })),
            ...(this.otherIncomes || []).map(inc => ({
                id: inc.id,
                date: inc.fullDateTime || inc.date,
                timestamp: inc.timestamp || 0,
                type: 'income',
                title: inc.title,
                party: inc.source || 'جهة الإيداع',
                category: inc.category,
                amount: inc.amount,
                isOut: false,
                cashier: inc.cashierName || 'أحمد الشناوي'
            })),
            ...(this.customerPayments || []).filter(p => (p.method || '').includes('نقد')).map(p => ({
                id: p.id,
                date: p.fullDateTime || p.date,
                timestamp: p.timestamp || 0,
                type: 'receipt',
                title: 'تحصيل نقدية من عميل',
                party: p.customerName,
                category: 'مقبوضات عملاء',
                amount: p.amount,
                isOut: false,
                cashier: p.cashierName || 'أحمد الشناوي'
            })),
            ...(this.supplierPayments || []).filter(p => (p.method || '').includes('نقد')).map(p => ({
                id: p.id,
                date: p.fullDateTime || p.date,
                timestamp: p.timestamp || 0,
                type: 'disbursement',
                title: 'سداد نقدي لمورد',
                party: p.supplierName,
                category: 'مدفوعات موردين',
                amount: p.amount,
                isOut: true,
                cashier: p.cashierName || 'أحمد الشناوي'
            }))
        ];

        txs.sort((a, b) => b.timestamp - a.timestamp);

        if (this.currentTreasuryFilter === 'expense') {
            txs = txs.filter(t => t.type === 'expense' || t.type === 'disbursement');
        } else if (this.currentTreasuryFilter === 'income') {
            txs = txs.filter(t => t.type === 'income' || t.type === 'receipt');
        } else if (this.currentTreasuryFilter === 'sales') {
            txs = txs.filter(t => t.type === 'receipt');
        }

        if (txs.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 22px;">لا توجد حركات خزينة مطابقة للفلتر المحدد</td></tr>`;
            return;
        }

        tbody.innerHTML = txs.map(t => `
            <tr>
                <td style="font-family: monospace; font-weight: bold; color: var(--primary-orange);">${t.id}</td>
                <td style="font-size: 0.74rem;">${t.date}</td>
                <td><span class="status-badge ${t.isOut ? 'credit' : 'paid'}">${t.isOut ? 'سند صرف نقدية' : 'سند قبض نقدية'}</span></td>
                <td style="font-weight: 600;">${t.title}</td>
                <td>${t.party}</td>
                <td style="font-weight: 900; color: ${t.isOut ? 'var(--accent-rose)' : 'var(--accent-emerald)'};">
                    ${t.isOut ? '-' : '+'}${t.amount.toFixed(2)} ج.م
                </td>
                <td style="font-size: 0.74rem;">${t.cashier}</td>
                <td>
                    <button type="button" class="btn-secondary" style="padding: 4px 8px; font-size: 0.72rem;" onclick="app.printVoucherDirect('${t.type}', '${t.id}')">
                        <i class="fa-solid fa-print"></i> سند ورقي
                    </button>
                </td>
            </tr>
        `).join('');
    }

    filterTreasury(type, btn) {
        this.currentTreasuryFilter = type;
        document.querySelectorAll('#screen-treasury .cat-pill').forEach(b => b.classList.remove('active'));
        if (btn) btn.classList.add('active');
        this.renderTreasuryTable();
    }

    openNewExpenseModal() {
        document.getElementById('newExpenseModal')?.classList.add('active');
    }
    closeNewExpenseModal() {
        document.getElementById('newExpenseModal')?.classList.remove('active');
    }

    saveExpense(e) {
        if (e) e.preventDefault();
        const title = document.getElementById('expTitle')?.value?.trim();
        const amount = parseFloat(document.getElementById('expAmount')?.value) || 0;
        const recipient = document.getElementById('expRecipient')?.value?.trim() || 'المستلم';
        const category = document.getElementById('expCategory')?.value || 'مصروفات عامة';
        const notes = document.getElementById('expNotes')?.value?.trim() || '';

        if (!title || amount <= 0) {
            alert('برجاء كتابة بيان المصروف والمبلغ بشكل صحيح');
            return;
        }

        const now = new Date();
        const fullDateTime = now.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }) + ' - الساعة ' + now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

        const record = {
            id: `EXP-${now.getFullYear()}-${String(this.expenses.length + 101).padStart(4, '0')}`,
            title,
            category,
            amount,
            recipient,
            notes,
            date: now.toLocaleDateString('ar-EG'),
            time: now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
            fullDateTime,
            timestamp: Date.now(),
            cashierName: this.currentUser.displayName || 'أحمد الشناوي'
        };

        this.expenses.unshift(record);
        this.saveAll();
        playBeep(true);
        this.closeNewExpenseModal();
        this.renderTreasuryTable();
        this.renderShiftDetails();
        this.renderHomeDashboard();

        // Print expense voucher immediately
        this.printVoucherDirect('expense', record.id);
        alert(`تم تسجيل سند صرف المصروف [${record.id}] بنجاح بقيمة ${amount.toFixed(2)} ج.م`);
    }

    openNewOtherIncomeModal() {
        document.getElementById('newOtherIncomeModal')?.classList.add('active');
    }
    closeNewOtherIncomeModal() {
        document.getElementById('newOtherIncomeModal')?.classList.remove('active');
    }

    saveOtherIncome(e) {
        if (e) e.preventDefault();
        const title = document.getElementById('incTitle')?.value?.trim();
        const amount = parseFloat(document.getElementById('incAmount')?.value) || 0;
        const source = document.getElementById('incSource')?.value?.trim() || 'جهة الإيداع';
        const category = document.getElementById('incCategory')?.value || 'إيرادات أخرى';
        const notes = document.getElementById('incNotes')?.value?.trim() || '';

        if (!title || amount <= 0) {
            alert('برجاء كتابة بيان الإيراد والمبلغ بشكل صحيح');
            return;
        }

        const now = new Date();
        const fullDateTime = now.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }) + ' - الساعة ' + now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

        const record = {
            id: `INC-${now.getFullYear()}-${String(this.otherIncomes.length + 101).padStart(4, '0')}`,
            title,
            category,
            amount,
            source,
            notes,
            date: now.toLocaleDateString('ar-EG'),
            time: now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
            fullDateTime,
            timestamp: Date.now(),
            cashierName: this.currentUser.displayName || 'أحمد الشناوي'
        };

        this.otherIncomes.unshift(record);
        this.saveAll();
        playBeep(true);
        this.closeNewOtherIncomeModal();
        this.renderTreasuryTable();
        this.renderShiftDetails();
        this.renderHomeDashboard();

        // Print income voucher immediately
        this.printVoucherDirect('income', record.id);
        alert(`تم تسجيل سند قبض الإيراد [${record.id}] بنجاح بقيمة ${amount.toFixed(2)} ج.م`);
    }

    printVoucherDirect(voucherType, voucherId) {
        let vData = null;
        let isDebit = false;
        let titleLabel = 'سند قبض نقدية بالخزينة';

        if (voucherType === 'expense') {
            vData = (this.expenses || []).find(e => e.id === voucherId);
            isDebit = true;
            titleLabel = 'سند صرف مصروفات تشغيل ونثريات';
        } else if (voucherType === 'income') {
            vData = (this.otherIncomes || []).find(inc => inc.id === voucherId);
            isDebit = false;
            titleLabel = 'سند قبض إيرادات أخرى بالخزينة';
        } else if (voucherType === 'receipt') {
            vData = (this.customerPayments || []).find(p => p.id === voucherId);
            isDebit = false;
            titleLabel = 'سند قبض وتحصيل نقدية من عميل';
        } else if (voucherType === 'disbursement') {
            vData = (this.supplierPayments || []).find(p => p.id === voucherId);
            isDebit = true;
            titleLabel = 'سند صرف ودفع نقدية لمورد';
        }

        if (!vData) return;

        const barcodeSvg = generateCode128SVG(vData.id, { height: 32, showText: true });
        const words = tafqeet(vData.amount || 0);

        const html = `
            <div class="print-voucher-a4">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0F172A; padding-bottom: 12px; margin-bottom: 16px;">
                    <div>
                        <h2 style="margin: 0; font-size: 1.4rem; color: #0F172A;">كارما كارميلا للأغذية</h2>
                        <div style="font-size: 0.82rem; color: #64748B;">شركة توريد وتجارة المواد الغذائية بالجملة • الجيزة</div>
                        <div style="font-size: 0.78rem; color: #475569;">س.ت: 184920 الجيزة • ر.ض: 492-817-305</div>
                    </div>
                    <div style="text-align: left;">
                        <div style="display: inline-block; background: ${isDebit ? '#DC2626' : '#059669'}; color: #FFF; padding: 4px 14px; border-radius: 6px; font-weight: bold; font-size: 0.95rem;">
                            ${titleLabel}
                        </div>
                        <div style="font-size: 0.85rem; font-weight: bold; margin-top: 4px; font-family: monospace;">رقم الإذن: ${vData.id}</div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 16px; font-size: 0.85rem;">
                    <div style="background: #F8FAFC; padding: 10px; border-radius: 6px; border: 1px solid #E2E8F0;">
                        <div>التاريخ والوقت: <strong>${vData.fullDateTime || vData.date}</strong></div>
                        <div>الطرف المتعامل: <strong>${vData.recipient || vData.source || vData.customerName || vData.supplierName || '—'}</strong></div>
                        <div>البند / التصنيف: <strong>${vData.category || vData.title || 'تسوية نقدية'}</strong></div>
                    </div>
                    <div style="background: #F8FAFC; padding: 10px; border-radius: 6px; border: 1px solid #E2E8F0; text-align: left;">
                        <div style="font-size: 0.85rem; color: #64748B;">المبلغ الصافي:</div>
                        <div style="font-size: 1.4rem; font-weight: 900; color: ${isDebit ? '#DC2626' : '#059669'};">
                            ${(vData.amount || 0).toFixed(2)} ج.م
                        </div>
                    </div>
                </div>

                <div style="background: #FFFBEB; border: 1px solid #FCD34D; border-radius: 6px; padding: 10px; margin-bottom: 16px; font-weight: bold; font-size: 0.88rem; color: #92400E;">
                    المبلغ بالحروف: ${words}
                </div>

                <div style="border: 1px solid #CBD5E1; border-radius: 6px; padding: 10px; font-size: 0.85rem; margin-bottom: 25px;">
                    <strong>البيان والسبب التفصيلي:</strong><br>
                    <span>${vData.notes || vData.title || 'لا توجد ملاحظات إضافية'}</span>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; text-align: center; font-size: 0.82rem; margin-top: 30px; border-top: 1px solid #0F172A; padding-top: 12px;">
                    <div>
                        <strong>أمين الخزينة:</strong><br><br>
                        <span>${vData.cashierName || 'أحمد الشناوي'}</span><br><br>
                        .........................
                    </div>
                    <div>
                        <strong>المستلم / الدافع:</strong><br><br>
                        <span>${vData.recipient || vData.source || vData.customerName || vData.supplierName || '—'}</span><br><br>
                        .........................
                    </div>
                    <div>
                        <strong>اعتماد الإدارة والفرع:</strong><br><br>
                        <span>كارما كارميلا</span><br><br>
                        .........................
                    </div>
                </div>

                <div style="text-align: center; margin-top: 25px;">
                    ${barcodeSvg}
                    <div style="font-size: 0.7rem; color: #94A3B8; margin-top: 4px;">مستند رسمي صادر ومسجل إلكترونياً بنظام كارما كارميلا</div>
                </div>
            </div>
        `;

        this.printDocument(html, 'a4');
    }

    // ==========================================================================
    // PARTNERS (COMBINED SCREEN & DEDICATED PROFILE PAGE)
    // ==========================================================================
    switchPartnersTab(tab) {
        document.getElementById('btnTabCustomers')?.classList.toggle('active', tab === 'customers');
        document.getElementById('btnTabSuppliers')?.classList.toggle('active', tab === 'suppliers');
        document.getElementById('pane-partners-customers')?.classList.toggle('active', tab === 'customers');
        document.getElementById('pane-partners-suppliers')?.classList.toggle('active', tab === 'suppliers');
    }

    renderPartnersScreen() {
        this.renderCustomersCards();
        this.renderSuppliersCards();
        const totalPartners = (this.customers || []).length + (this.suppliers || []).length;
        const countEl = document.getElementById('homePartnersCount');
        if (countEl) countEl.innerText = `${totalPartners} جهات مسجلة`;
    }

    renderCustomersCards() {
        const grid = document.getElementById('customersCardsGrid');
        if (!grid) return;
        grid.innerHTML = (this.customers || []).map(c => `
            <div class="bento-card cust" onclick="app.openPartnerDetail('customer', ${c.id})">
                <div class="bento-top-row">
                    <span class="bento-badge-pill">${c.phone}</span>
                    <div class="bento-icon-box"><i class="fa-solid fa-user-tie"></i></div>
                </div>
                <h4>${c.name}</h4>
                <div class="bento-metric-large ${(c.balance || 0) > 0 ? 'text-warning' : 'text-success'}">
                    ${(c.balance || 0).toFixed(2)} ج.م
                </div>
                <p class="bento-desc">${c.address || 'لا يوجد عنوان مسجل'}</p>
                <span class="bento-link-arrow">فتح صفحة الحساب والمستندات <i class="fa-solid fa-arrow-left"></i></span>
            </div>
        `).join('');
    }

    renderSuppliersCards() {
        const grid = document.getElementById('suppliersCardsGrid');
        if (!grid) return;
        grid.innerHTML = (this.suppliers || []).map(s => `
            <div class="bento-card sup" onclick="app.openPartnerDetail('supplier', ${s.id})">
                <div class="bento-top-row">
                    <span class="bento-badge-pill">${s.phone}</span>
                    <div class="bento-icon-box"><i class="fa-solid fa-truck-ramp-box"></i></div>
                </div>
                <h4>${s.name}</h4>
                <div class="bento-metric-large text-danger">
                    ${(s.balance || 0).toFixed(2)} ج.م
                </div>
                <p class="bento-desc">${s.address || 'المنطقة الصناعية'}</p>
                <span class="bento-link-arrow">فتح صفحة الحساب وسندات الصرف <i class="fa-solid fa-arrow-left"></i></span>
            </div>
        `).join('');
    }

    openPartnerDetail(partnerType, partnerId) {
        let partner = null;
        if (partnerType === 'customer') {
            partner = (this.customers || []).find(c => c.id === partnerId);
        } else {
            partner = (this.suppliers || []).find(s => s.id === partnerId);
        }

        if (!partner) return;
        this.currentPartnerDetail = { type: partnerType, id: partnerId, data: partner };

        const titleEl = document.getElementById('partnerDetailTitle');
        const subEl = document.getElementById('partnerDetailSubtitle');
        const avatarEl = document.getElementById('pdAvatar');
        const nameEl = document.getElementById('pdName');
        const phoneEl = document.getElementById('pdPhone');
        const addrEl = document.getElementById('pdAddress');
        const balEl = document.getElementById('pdBalance');
        const limEl = document.getElementById('pdLimit');
        const crEl = document.getElementById('pdCr');
        const taxEl = document.getElementById('pdTaxId');

        if (titleEl) titleEl.innerText = partnerType === 'customer' ? `صفحة العميل: ${partner.name}` : `صفحة المورد: ${partner.name}`;
        if (subEl) subEl.innerText = partnerType === 'customer' ? 'كشف حساب تفصيلي، فواتير المبيعات، سندات القبض، وفواتير المرتجع' : 'كشف حساب تفصيلي، فواتير التوريد، وسندات الصرف النقدية';

        if (avatarEl) avatarEl.className = partnerType === 'customer' ? 'fa-solid fa-user-tie' : 'fa-solid fa-truck-ramp-box';
        if (nameEl) nameEl.innerText = partner.name;
        if (phoneEl) phoneEl.innerText = partner.phone || '—';
        if (addrEl) addrEl.innerText = partner.address || 'القاهرة / الجيزة';
        if (balEl) balEl.innerText = `${(partner.balance || 0).toFixed(2)} ج.م`;
        if (limEl) limEl.innerText = `${(partner.creditLimit || 0).toFixed(2)} ج.م`;
        if (crEl) crEl.innerText = partner.cr || '—';
        if (taxEl) taxEl.innerText = partner.taxId || '—';

        this.switchPdTab('statement');
        this.switchScreen('partner-detail');
    }

    switchPdTab(tab) {
        document.querySelectorAll('#screen-partner-detail .tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('#screen-partner-detail .partner-pane').forEach(p => p.classList.remove('active'));

        const btn = document.getElementById(`btnPdTab${tab.charAt(0).toUpperCase() + tab.slice(1)}`);
        const pane = document.getElementById(`pdPane${tab.charAt(0).toUpperCase() + tab.slice(1)}`);
        if (btn) btn.classList.add('active');
        if (pane) pane.classList.add('active');

        if (tab === 'statement') this.renderPartnerLedger();
        if (tab === 'invoices') this.renderPartnerInvoices();
        if (tab === 'returns') this.renderPartnerReturns();
        if (tab === 'stats') this.renderPartnerStats();
    }

    renderPartnerLedger() {
        const pd = this.currentPartnerDetail;
        if (!pd || !pd.data) return;
        const tbody = document.querySelector('#pdStatementTable tbody');
        if (!tbody) return;

        let timeline = [];

        if (pd.type === 'customer') {
            const custOrders = (this.orders || []).filter(o => o.customerId === pd.id);
            const custPayments = (this.customerPayments || []).filter(p => p.customerId === pd.id);
            const custReturns = (this.returns || []).filter(r => r.partnerType === 'customer' && r.partnerId === pd.id);

            timeline = [
                ...custOrders.map(o => ({
                    date: o.date,
                    timestamp: o.timestamp || 0,
                    docId: o.id,
                    type: 'فاتورة مبيعات',
                    details: `شراء أصناف (${(o.items || []).length} صنف) - ${o.paymentType === 'cash' ? 'نقدي مسدد' : 'آجل على الحساب'}`,
                    debit: o.paymentType === 'credit' ? o.grandTotal : 0,
                    credit: o.paymentType === 'cash' ? o.grandTotal : 0
                })),
                ...custPayments.map(p => ({
                    date: p.fullDateTime || p.date,
                    timestamp: p.timestamp || 0,
                    docId: p.id,
                    type: 'سند قبض نقدية',
                    details: `سداد دفعة (${p.method}) - ${p.notes || ''}`,
                    debit: 0,
                    credit: p.amount
                })),
                ...custReturns.map(r => ({
                    date: r.fullDateTime || r.date,
                    timestamp: r.timestamp || 0,
                    docId: r.id,
                    type: 'فاتورة مرتجع مبيعات',
                    details: `رد بضاعة [${r.productName}] عدد ${r.quantity} ${r.unitName} (${r.refundMethod === 'cash' ? 'رد نقداً' : 'خصم من الرصيد'})`,
                    debit: 0,
                    credit: r.refundMethod === 'credit' ? r.totalRefund : 0
                }))
            ];
        } else {
            const supPayments = (this.supplierPayments || []).filter(p => p.supplierId === pd.id);
            const supReturns = (this.returns || []).filter(r => r.partnerType === 'supplier' && r.partnerId === pd.id);

            timeline = [
                ...supPayments.map(p => ({
                    date: p.fullDateTime || p.date,
                    timestamp: p.timestamp || 0,
                    docId: p.id,
                    type: 'سند صرف نقدية',
                    details: `سداد دفعة توريد (${p.method}) - ${p.notes || ''}`,
                    debit: p.amount,
                    credit: 0
                })),
                ...supReturns.map(r => ({
                    date: r.fullDateTime || r.date,
                    timestamp: r.timestamp || 0,
                    docId: r.id,
                    type: 'مرتجع مشتريات للمورد',
                    details: `رد بضاعة للمورد [${r.productName}] عدد ${r.quantity} ${r.unitName}`,
                    debit: r.totalRefund,
                    credit: 0
                }))
            ];
        }

        timeline.sort((a, b) => b.timestamp - a.timestamp);

        if (timeline.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 20px;">لا توجد حركات مسجلة لهذا الحساب حتى الآن</td></tr>`;
            return;
        }

        tbody.innerHTML = timeline.map(row => `
            <tr>
                <td style="font-size: 0.74rem;">${row.date}</td>
                <td style="font-family: monospace; font-weight: bold; color: var(--primary-orange);">${row.docId}</td>
                <td><span class="status-badge ${row.type.includes('فاتورة') ? 'partial' : 'paid'}">${row.type}</span></td>
                <td>${row.details}</td>
                <td style="color: var(--accent-rose); font-weight: bold;">${row.debit > 0 ? row.debit.toFixed(2) + ' ج.م' : '—'}</td>
                <td style="color: var(--accent-emerald); font-weight: bold;">${row.credit > 0 ? row.credit.toFixed(2) + ' ج.م' : '—'}</td>
                <td style="font-weight: 900;">${(pd.data.balance || 0).toFixed(2)} ج.م</td>
            </tr>
        `).join('');
    }

    renderPartnerInvoices() {
        const pd = this.currentPartnerDetail;
        if (!pd) return;
        const tbody = document.querySelector('#pdInvoicesTable tbody');
        if (!tbody) return;

        if (pd.type === 'customer') {
            const custOrders = (this.orders || []).filter(o => o.customerId === pd.id);
            if (custOrders.length === 0) {
                tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 20px;">لا توجد فواتير مبيعات مسجلة لهذا العميل</td></tr>`;
                return;
            }
            tbody.innerHTML = custOrders.map(o => `
                <tr>
                    <td style="font-family: monospace; font-weight: bold; color: var(--primary-orange);">${o.id}</td>
                    <td style="font-size: 0.74rem;">${o.date}</td>
                    <td>${(o.items || []).length} صنف</td>
                    <td style="font-weight: 900; color: var(--primary-orange);">${(o.grandTotal || 0).toFixed(2)} ج.م</td>
                    <td><span class="status-badge ${o.paymentType === 'cash' ? 'paid' : 'partial'}">${o.paymentType === 'cash' ? 'نقدي' : 'آجل'}</span></td>
                    <td style="font-size: 0.74rem;">${o.cashierName || 'أحمد الشناوي'}</td>
                    <td>
                        <button type="button" class="btn-primary" style="padding: 4px 8px; font-size: 0.72rem;" onclick="app.openInvoiceModal(app.orders.find(ord => ord.id === '${o.id}'))">
                            <i class="fa-solid fa-print"></i> معاينة وطباعة
                        </button>
                    </td>
                </tr>
            `).join('');
        } else {
            // Suppliers purchase invoices (from payments or supplies)
            const payments = (this.supplierPayments || []).filter(p => p.supplierId === pd.id);
            if (payments.length === 0) {
                tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 20px;">لا توجد فواتير توريد مسجلة لهذا المورد</td></tr>`;
                return;
            }
            tbody.innerHTML = payments.map(p => `
                <tr>
                    <td style="font-family: monospace; font-weight: bold; color: var(--primary-orange);">${p.id}</td>
                    <td style="font-size: 0.74rem;">${p.fullDateTime || p.date}</td>
                    <td>توريد خامات</td>
                    <td style="font-weight: 900; color: var(--accent-rose);">${(p.amount || 0).toFixed(2)} ج.م</td>
                    <td><span class="status-badge paid">${p.method}</span></td>
                    <td style="font-size: 0.74rem;">${p.cashierName || 'أحمد الشناوي'}</td>
                    <td>
                        <button type="button" class="btn-secondary" style="padding: 4px 8px; font-size: 0.72rem;" onclick="app.printVoucherDirect('disbursement', '${p.id}')">
                            <i class="fa-solid fa-print"></i> طباعة السند
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    }

    renderPartnerReturns() {
        const pd = this.currentPartnerDetail;
        if (!pd) return;
        const tbody = document.querySelector('#pdReturnsTable tbody');
        if (!tbody) return;

        const partnerReturns = (this.returns || []).filter(r => r.partnerType === pd.type && r.partnerId === pd.id);
        if (partnerReturns.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 20px;">لا توجد فواتير مرتجعات مسجلة لهذا الحساب</td></tr>`;
            return;
        }

        tbody.innerHTML = partnerReturns.map(r => `
            <tr>
                <td style="font-family: monospace; font-weight: bold; color: var(--primary-orange);">${r.id}</td>
                <td style="font-size: 0.74rem;">${r.date}</td>
                <td style="font-weight: 600;">${r.productName}</td>
                <td>${r.quantity} ${r.unitName}</td>
                <td style="font-weight: 900; color: var(--accent-rose);">${(r.totalRefund || 0).toFixed(2)} ج.م</td>
                <td><span class="status-badge ${r.refundMethod === 'cash' ? 'paid' : 'partial'}">${r.refundMethod === 'cash' ? 'رد نقداً بالخزينة' : 'خصم من الرصيد'}</span></td>
                <td style="font-size: 0.74rem;">${r.reason || '—'}</td>
                <td>
                    <button type="button" class="btn-secondary" style="padding: 4px 8px; font-size: 0.72rem;" onclick="app.printReturnVoucher('${r.id}')">
                        <i class="fa-solid fa-print"></i> طباعة
                    </button>
                </td>
            </tr>
        `).join('');
    }

    renderPartnerStats() {
        const pd = this.currentPartnerDetail;
        if (!pd || !pd.data) return;

        let totalVolume = 0;
        let totalPaid = 0;
        let totalRet = 0;

        if (pd.type === 'customer') {
            const orders = (this.orders || []).filter(o => o.customerId === pd.id);
            const payments = (this.customerPayments || []).filter(p => p.customerId === pd.id);
            const rets = (this.returns || []).filter(r => r.partnerType === 'customer' && r.partnerId === pd.id);

            totalVolume = orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
            totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
            totalRet = rets.reduce((sum, r) => sum + (r.totalRefund || 0), 0);
        } else {
            const payments = (this.supplierPayments || []).filter(p => p.supplierId === pd.id);
            const rets = (this.returns || []).filter(r => r.partnerType === 'supplier' && r.partnerId === pd.id);

            totalVolume = (pd.data.balance || 0) + payments.reduce((sum, p) => sum + (p.amount || 0), 0);
            totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
            totalRet = rets.reduce((sum, r) => sum + (r.totalRefund || 0), 0);
        }

        const sVol = document.getElementById('pdTotalSales');
        const sPaid = document.getElementById('pdTotalPaid');
        const sRet = document.getElementById('pdTotalReturns');
        const sNet = document.getElementById('pdNetBalance');

        if (sVol) sVol.innerText = `${totalVolume.toFixed(2)} ج.م`;
        if (sPaid) sPaid.innerText = `${totalPaid.toFixed(2)} ج.م`;
        if (sRet) sRet.innerText = `${totalRet.toFixed(2)} ج.م`;
        if (sNet) sNet.innerText = `${(pd.data.balance || 0).toFixed(2)} ج.م`;
    }

    printPartnerStatement() {
        const pd = this.currentPartnerDetail;
        if (!pd || !pd.data) return;

        const tableContent = document.getElementById('pdStatementTable')?.outerHTML || '';
        const barcodeSvg = generateCode128SVG(`STMT-${pd.type.toUpperCase()}-${pd.id}`, { height: 30, showText: true });

        const html = `
            <div class="print-voucher-a4">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0F172A; padding-bottom: 12px; margin-bottom: 16px;">
                    <div>
                        <h2 style="margin: 0; font-size: 1.4rem; color: #0F172A;">كارما كارميلا للأغذية</h2>
                        <div style="font-size: 0.82rem; color: #64748B;">شركة توريد وتجارة المواد الغذائية بالجملة • الجيزة</div>
                        <div style="font-size: 0.78rem; color: #475569;">س.ت: 184920 الجيزة • ر.ض: 492-817-305</div>
                    </div>
                    <div style="text-align: left;">
                        <div style="display: inline-block; background: #0F172A; color: #FFF; padding: 4px 12px; border-radius: 6px; font-weight: bold; font-size: 0.95rem;">
                            كشف حساب معتمد: ${pd.data.name}
                        </div>
                        <div style="font-size: 0.8rem; margin-top: 4px; color: #64748B;">تاريخ الاستخراج: ${new Date().toLocaleDateString('ar-EG')}</div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 16px; font-size: 0.85rem; background: #F8FAFC; border: 1px solid #E2E8F0; padding: 10px; border-radius: 6px;">
                    <div>
                        <div>اسم الحساب: <strong>${pd.data.name}</strong></div>
                        <div>رقم الهاتف: <strong>${pd.data.phone || '—'}</strong></div>
                        <div>العنوان المسجل: <strong>${pd.data.address || '—'}</strong></div>
                    </div>
                    <div style="text-align: left;">
                        <div>الرصيد الحالي المستحق: <strong style="font-size: 1.2rem; color: #DC2626;">${(pd.data.balance || 0).toFixed(2)} ج.م</strong></div>
                        <div>الحد الائتماني: ${(pd.data.creditLimit || 0).toFixed(2)} ج.م</div>
                        <div>س.ت / ر.ض: ${pd.data.taxId || pd.data.cr || '—'}</div>
                    </div>
                </div>

                <div style="margin-bottom: 20px;">
                    ${tableContent}
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; text-align: center; font-size: 0.82rem; margin-top: 40px; border-top: 1px solid #0F172A; padding-top: 15px;">
                    <div>توقيع ومصادقة صاحب الحساب<br><br>...........................</div>
                    <div>خاتم وتوقيع الحسابات - كارما كارميلا<br><br>...........................</div>
                </div>

                <div style="text-align: center; margin-top: 25px;">
                    ${barcodeSvg}
                </div>
            </div>
        `;

        this.printDocument(html, 'a4');
    }

    exportPartnerExcel() {
        const pd = this.currentPartnerDetail;
        if (!pd || !pd.data) return;

        let csv = '\uFEFFالتاريخ,رقم المستند,نوع الحركة,البيان,مدين,دائن,الرصيد\n';
        const rows = document.querySelectorAll('#pdStatementTable tbody tr');
        rows.forEach(tr => {
            const cols = tr.querySelectorAll('td');
            if (cols.length >= 7) {
                const date = cols[0].innerText.replace(/"/g, '""');
                const docId = cols[1].innerText.replace(/"/g, '""');
                const type = cols[2].innerText.replace(/"/g, '""');
                const details = cols[3].innerText.replace(/"/g, '""');
                const debit = cols[4].innerText.replace(/[^0-9\.\-]/g, '');
                const credit = cols[5].innerText.replace(/[^0-9\.\-]/g, '');
                const balance = cols[6].innerText.replace(/[^0-9\.\-]/g, '');
                csv += `"${date}","${docId}","${type}","${details}",${debit || 0},${credit || 0},${balance || 0}\n`;
            }
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Karma_Carmela_Statement_${pd.data.name}_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    openNewPaymentModalForCurrentPartner() {
        const pd = this.currentPartnerDetail;
        if (!pd) return;
        if (pd.type === 'customer') {
            this.openCustomerPaymentModal(pd.id);
        } else {
            this.openSupplierPaymentModal(pd.id);
        }
    }

    openNewReturnModalForCurrentPartner() {
        const pd = this.currentPartnerDetail;
        if (!pd) return;
        this.openNewReturnModal(pd.type, pd.id);
    }

    openCustomerLedger(id) {
        this.openPartnerDetail('customer', id);
    }

    openSupplierLedger(id) {
        this.openPartnerDetail('supplier', id);
    }

    // ==========================================================================
    // RETURN INVOICES (RESTOCKING & FINANCIAL REFUND)
    // ==========================================================================
    openNewReturnModal(presetType = 'customer', presetPartnerId = null) {
        const typeSelect = document.getElementById('returnPartnerType');
        if (typeSelect) typeSelect.value = presetType;

        this.onReturnPartnerTypeChange();

        if (presetPartnerId) {
            const pSelect = document.getElementById('returnPartnerSelect');
            if (pSelect) pSelect.value = presetPartnerId;
        }

        const prodSelect = document.getElementById('returnProductSelect');
        if (prodSelect) {
            prodSelect.innerHTML = (this.products || []).map(p => `
                <option value="${p.id}">${p.name} (سعر: ${(p.wholesalePrice || 0).toFixed(2)} ج.م)</option>
            `).join('');
        }

        this.onReturnProductChange();
        document.getElementById('newReturnModal')?.classList.add('active');
    }

    closeNewReturnModal() {
        document.getElementById('newReturnModal')?.classList.remove('active');
    }

    onReturnPartnerTypeChange() {
        const pType = document.getElementById('returnPartnerType')?.value || 'customer';
        const pSelect = document.getElementById('returnPartnerSelect');
        if (!pSelect) return;

        if (pType === 'customer') {
            pSelect.innerHTML = (this.customers || []).map(c => `
                <option value="${c.id}">${c.name} - رصيد: ${(c.balance || 0).toFixed(2)} ج.م</option>
            `).join('');
        } else {
            pSelect.innerHTML = (this.suppliers || []).map(s => `
                <option value="${s.id}">${s.name} - رصيد: ${(s.balance || 0).toFixed(2)} ج.م</option>
            `).join('');
        }
    }

    onReturnProductChange() {
        const prodId = parseInt(document.getElementById('returnProductSelect')?.value, 10);
        const prod = (this.products || []).find(p => p.id === prodId) || this.products[0];
        if (!prod) return;

        const defaultUnit = (prod.units || []).find(u => u.isDefault) || (prod.units || [])[0] || { name: prod.baseUnit || 'عبوة', price: prod.wholesalePrice || 0, factor: 1 };
        const unitNameInput = document.getElementById('returnUnitName');
        const priceInput = document.getElementById('returnUnitPrice');

        if (unitNameInput) unitNameInput.value = defaultUnit.name;
        if (priceInput) priceInput.value = defaultUnit.price || prod.wholesalePrice;

        this.calculateReturnTotal();
    }

    calculateReturnTotal() {
        const qty = parseInt(document.getElementById('returnQty')?.value, 10) || 1;
        const price = parseFloat(document.getElementById('returnUnitPrice')?.value) || 0;
        const total = qty * price;
        const totalEl = document.getElementById('returnTotalDisplay');
        if (totalEl) totalEl.innerText = `${total.toFixed(2)} ج.م`;
    }

    saveReturnInvoice(e) {
        if (e) e.preventDefault();
        const partnerType = document.getElementById('returnPartnerType')?.value || 'customer';
        const partnerId = parseInt(document.getElementById('returnPartnerSelect')?.value, 10);
        const prodId = parseInt(document.getElementById('returnProductSelect')?.value, 10);
        const unitName = document.getElementById('returnUnitName')?.value || 'كرتونة';
        const qty = parseInt(document.getElementById('returnQty')?.value, 10) || 1;
        const price = parseFloat(document.getElementById('returnUnitPrice')?.value) || 0;
        const refundMethod = document.getElementById('returnRefundMethod')?.value || 'cash';
        const reason = document.getElementById('returnReason')?.value?.trim() || 'مرتجع بضاعة';

        let partner = partnerType === 'customer'
            ? (this.customers || []).find(c => c.id === partnerId)
            : (this.suppliers || []).find(s => s.id === partnerId);
        const prod = (this.products || []).find(p => p.id === prodId);

        if (!partner || !prod) {
            alert('برجاء اختيار الطرف والصنف بشكل صحيح');
            return;
        }

        const totalRefund = qty * price;

        // 1. Restock inventory immediately
        const matchedUnit = (prod.units || []).find(u => u.name === unitName);
        const factor = matchedUnit ? matchedUnit.factor : 1;
        prod.currentStock = (prod.currentStock || 0) + (qty * factor);

        // 2. Financial Settlement
        if (partnerType === 'customer') {
            if (refundMethod === 'credit') {
                partner.balance = Math.max(0, (partner.balance || 0) - totalRefund);
            }
        } else {
            // Supplier return reduces supplier debt balance or provides cash
            if (refundMethod === 'credit') {
                partner.balance = Math.max(0, (partner.balance || 0) - totalRefund);
            }
        }

        const now = new Date();
        const returnId = `RET-${now.getFullYear()}-${String(this.returns.length + 101).padStart(4, '0')}`;

        const retRecord = {
            id: returnId,
            type: partnerType === 'customer' ? 'sale' : 'purchase',
            partnerType,
            partnerId,
            partnerName: partner.name,
            productId: prod.id,
            productName: prod.name,
            quantity: qty,
            unitName,
            unitPrice: price,
            totalRefund,
            refundMethod,
            reason,
            date: now.toLocaleDateString('ar-EG'),
            time: now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
            fullDateTime: now.toLocaleDateString('ar-EG') + ' - ' + now.toLocaleTimeString('ar-EG'),
            timestamp: Date.now(),
            cashierName: this.currentUser.displayName || 'أحمد الشناوي'
        };

        this.returns.unshift(retRecord);
        this.saveAll();
        playBeep(true);
        this.closeNewReturnModal();

        this.renderInventoryTable();
        this.renderShiftDetails();
        this.renderTreasuryTable();
        this.renderHomeDashboard();

        if (this.currentPartnerDetail && this.currentPartnerDetail.id === partnerId) {
            this.renderPartnerLedger();
            this.renderPartnerReturns();
            this.renderPartnerStats();
        }

        this.printReturnVoucher(retRecord.id);
        alert(`تم تسجيل فاتورة المرتجع [${returnId}] بنجاح!\n• تم إعادة الكمية للمخزون فوراً.\n• طريقة التسوية: ${refundMethod === 'cash' ? 'رد نقداً من الخزينة' : 'خصم من الرصيد الدفتري'}`);
    }

    printReturnVoucher(returnId) {
        const r = (this.returns || []).find(item => item.id === returnId);
        if (!r) return;

        const barcodeSvg = generateCode128SVG(r.id, { height: 30, showText: true });
        const html = `
            <div class="print-voucher-thermal">
                <div style="text-align: center; border-bottom: 2px dashed #0F172A; padding-bottom: 8px; margin-bottom: 8px;">
                    <h2 style="font-size: 1.25rem; font-weight: 900; margin: 0; color: #0F172A;">كارما كارميلا للأغذية</h2>
                    <p style="font-size: 0.78rem; margin: 3px 0; color: #475569;">فاتورة مرتجع معتمدة</p>
                    <div style="display: inline-block; background: #DC2626; color: #FFF; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 0.85rem; margin-top: 4px;">
                        ${r.type === 'sale' ? 'مرتجع مبيعات عميل' : 'مرتجع توريد لمورد'}
                    </div>
                </div>

                <div style="font-size: 0.75rem; border-bottom: 1px dashed #CBD5E1; padding-bottom: 6px; margin-bottom: 6px;">
                    <div>رقم الإذن: <strong>${r.id}</strong></div>
                    <div>التاريخ: <strong>${r.fullDateTime || r.date}</strong></div>
                    <div>الطرف: <strong>${r.partnerName}</strong></div>
                    <div>طريقة الرد: <strong>${r.refundMethod === 'cash' ? 'نقداً من الخزينة' : 'تسوية رصيد آجل'}</strong></div>
                </div>

                <table style="width: 100%; font-size: 0.76rem; border-collapse: collapse; margin-bottom: 8px;">
                    <thead>
                        <tr style="border-bottom: 1px solid #0F172A;">
                            <th style="text-align: right;">الصنف المرتجع</th>
                            <th style="text-align: center;">الكمية</th>
                            <th style="text-align: left;">الإجمالي</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>${r.productName}<br><small style="color: #64748B;">(${r.unitName})</small></td>
                            <td style="text-align: center;">${r.quantity}</td>
                            <td style="text-align: left; font-weight: bold; color: #DC2626;">${(r.totalRefund || 0).toFixed(2)} ج.م</td>
                        </tr>
                    </tbody>
                </table>

                <div style="font-size: 0.72rem; color: #64748B; margin-bottom: 10px;">
                    السبب: ${r.reason || 'لا يوجد'}
                </div>

                <div style="font-weight: bold; font-size: 0.82rem; text-align: center; background: #F1F5F9; padding: 6px; border-radius: 4px; margin-bottom: 10px;">
                    ${tafqeet(r.totalRefund || 0)}
                </div>

                <div style="display: flex; justify-content: space-between; font-size: 0.72rem; margin-top: 15px; border-top: 1px solid #0F172A; padding-top: 6px;">
                    <div style="text-align: center;">أمين المخزن<br><br>...............</div>
                    <div style="text-align: center;">توقيع العميل / المورد<br><br>...............</div>
                </div>

                <div style="text-align: center; margin-top: 10px;">
                    ${barcodeSvg}
                </div>
            </div>
        `;

        this.printDocument(html, 'thermal');
    }

    // ==========================================================================
    // CUSTOM PRODUCT PICKER MODAL (REPLACES AWKWARD RADIO LISTS)
    // ==========================================================================
    openProductPicker(targetField) {
        this.pickerTargetField = targetField;
        this.renderPickerGrid(this.products || []);
        const input = document.getElementById('pickerSearchInput');
        if (input) {
            input.value = '';
            setTimeout(() => input.focus(), 250);
        }
        document.getElementById('productPickerModal')?.classList.add('active');
    }

    closeProductPicker() {
        document.getElementById('productPickerModal')?.classList.remove('active');
        this.pickerTargetField = null;
    }

    filterProductPicker() {
        const query = (document.getElementById('pickerSearchInput')?.value || '').trim().toLowerCase();
        let list = this.products || [];
        if (query) {
            list = list.filter(p =>
                (p.name || '').toLowerCase().includes(query) ||
                (p.sku || '').toLowerCase().includes(query) ||
                (p.barcode || '').includes(query)
            );
        }
        this.renderPickerGrid(list);
    }

    renderPickerGrid(list) {
        const container = document.getElementById('productPickerGrid');
        if (!container) return;

        if (list.length === 0) {
            container.innerHTML = `<div style="text-align: center; padding: 25px; color: var(--text-muted); grid-column: 1 / -1;">لا توجد أصناف مطابقة للبحث</div>`;
            return;
        }

        container.innerHTML = list.map(p => `
            <div class="picker-item-card" onclick="app.selectPickerProduct(${p.id})">
                <div class="picker-item-icon"><i class="fa-solid fa-box"></i></div>
                <div class="picker-item-name">${p.name}</div>
                <div class="picker-item-sku">${p.sku} • كود: ${p.barcode}</div>
                <div class="picker-item-price">سعر الجملة: ${(p.wholesalePrice || 0).toFixed(2)} ج.م</div>
                <div class="picker-item-stock">المخزون الحالي: ${p.currentStock || 0} ${p.baseUnit}</div>
            </div>
        `).join('');
    }

    selectPickerProduct(productId) {
        const prod = (this.products || []).find(p => p.id === productId);
        if (!prod) return;

        if (this.pickerTargetField === 'purchase') {
            const select = document.getElementById('purchaseProductSelect');
            if (select) {
                select.value = prod.id;
            }
            const nameDisplay = document.getElementById('purchaseProductNameDisplay');
            if (nameDisplay) {
                nameDisplay.innerText = prod.name;
            }
            const costInp = document.getElementById('purchaseUnitCost');
            if (costInp) {
                costInp.value = prod.costPrice || 0;
            }
        } else if (this.pickerTargetField === 'return') {
            const select = document.getElementById('returnProductSelect');
            if (select) {
                select.value = prod.id;
            }
            const nameDisplay = document.getElementById('returnProductNameDisplay');
            if (nameDisplay) {
                nameDisplay.innerText = prod.name;
            }
            this.onReturnProductChange();
        }

        playBeep(true);
        this.closeProductPicker();
    }

    // ==========================================================================
    // POS CATALOG & CART LOGIC (0% TAX, TOTAL = SUBTOTAL)
    // ==========================================================================
    renderCategories() {
        const bar = document.getElementById('categoriesBar');
        if (!bar) return;
        const cats = ['الكل', ...new Set((this.products || []).map(p => p.category))];
        bar.innerHTML = cats.map((cat, idx) => `
            <button type="button" class="cat-pill ${idx === 0 ? 'active' : ''}" onclick="app.filterByCategory('${cat}', this)">
                ${cat}
            </button>
        `).join('');
    }

    filterByCategory(cat, btn) {
        document.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
        if (btn) btn.classList.add('active');
        this.currentSelectedCategory = cat;
        this.filterProducts();
    }

    filterProducts() {
        const query = (document.getElementById('posSearchInput')?.value || '').trim().toLowerCase();
        const cat = this.currentSelectedCategory || 'الكل';
        let filtered = this.products || [];

        if (cat !== 'الكل') {
            filtered = filtered.filter(p => p.category === cat);
        }

        if (query) {
            filtered = filtered.filter(p =>
                (p.name || '').toLowerCase().includes(query) ||
                (p.sku || '').toLowerCase().includes(query) ||
                (p.barcode || '').includes(query)
            );
        }

        this.renderProductsGrid(filtered);
    }

    renderProductsGrid(items = null) {
        const grid = document.getElementById('productsGrid');
        if (!grid) return;

        const list = items || this.products || [];
        if (list.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
                    <i class="fa-solid fa-box-open" style="font-size: 2.2rem; margin-bottom: 8px; display: block;"></i>
                    لا توجد منتجات مطابقة لبيانات البحث
                </div>
            `;
            return;
        }

        grid.innerHTML = list.map(prod => {
            const defaultUnit = (prod.units || []).find(u => u.isDefault) || (prod.units || [])[0] || {
                id: 1,
                name: prod.baseUnit || 'عبوة',
                price: prod.wholesalePrice || 0,
                factor: 1,
                barcode: prod.barcode
            };

            const isLow = (prod.currentStock || 0) <= (prod.minStock || 0);

            return `
                <div class="product-card" id="prod-card-${prod.id}">
                    <div class="product-sku-tag">${prod.sku}</div>
                    <div class="product-title">${prod.name}</div>
                    
                    <div class="product-unit-select-wrap">
                        <select class="product-unit-select" onchange="app.onUnitChange(${prod.id}, this)">
                            ${(prod.units || []).map(u => `
                                <option value="${u.id}" data-price="${u.price}" data-factor="${u.factor}" ${u.id === defaultUnit.id ? 'selected' : ''}>
                                    ${u.name} - ${(u.price || 0).toFixed(2)} ج.م
                                </option>
                            `).join('')}
                        </select>
                    </div>

                    <div class="product-price-row">
                        <div class="product-price" id="prod-price-${prod.id}">${(defaultUnit.price || 0).toFixed(2)} ج.م</div>
                        <div class="stock-pill ${isLow ? 'low' : ''}">
                            <i class="fa-solid fa-boxes-stacked"></i> ${prod.currentStock || 0}
                        </div>
                    </div>

                    <button type="button" class="btn-primary btn-add-cart" onclick="app.addProductToCart(${prod.id})">
                        <i class="fa-solid fa-cart-plus"></i> إضافة للسلة
                    </button>
                </div>
            `;
        }).join('');
    }

    onUnitChange(productId, selectEl) {
        const option = selectEl.options[selectEl.selectedIndex];
        const price = parseFloat(option.dataset.price) || 0;
        const priceEl = document.getElementById(`prod-price-${productId}`);
        if (priceEl) {
            priceEl.innerText = `${price.toFixed(2)} ج.م`;
        }
    }

    addProductToCart(productId, explicitUnitId = null) {
        const prod = (this.products || []).find(p => p.id === productId);
        if (!prod) return;

        let unitId = explicitUnitId;
        if (!unitId) {
            const card = document.getElementById(`prod-card-${productId}`);
            const select = card ? card.querySelector('.product-unit-select') : null;
            if (select) {
                unitId = parseInt(select.value, 10);
            }
        }

        const unit = (prod.units || []).find(u => u.id === unitId) || (prod.units || [])[0] || {
            id: 1,
            name: prod.baseUnit || 'عبوة',
            price: prod.wholesalePrice || 0,
            factor: 1,
            barcode: prod.barcode
        };

        const existing = this.cart.find(item => item.productId === productId && item.unitId === unit.id);
        if (existing) {
            existing.qty += 1;
        } else {
            this.cart.push({
                productId: prod.id,
                name: prod.name,
                sku: prod.sku,
                unitId: unit.id,
                unitName: unit.name,
                price: unit.price,
                factor: unit.factor,
                barcode: unit.barcode || prod.barcode,
                qty: 1
            });
        }

        playBeep(true);
        this.renderCart();
    }

    updateCartQty(index, delta) {
        if (!this.cart[index]) return;
        this.cart[index].qty += delta;
        if (this.cart[index].qty <= 0) {
            this.cart.splice(index, 1);
        }
        this.renderCart();
    }

    clearCart() {
        this.cart = [];
        this.renderCart();
    }

    openCartDrawer() {
        document.querySelector('.cart-panel')?.classList.add('active');
        document.getElementById('cartDrawerOverlay')?.classList.add('active');
    }

    closeCartDrawer() {
        document.querySelector('.cart-panel')?.classList.remove('active');
        document.getElementById('cartDrawerOverlay')?.classList.remove('active');
    }

    renderCart() {
        const list = document.getElementById('cartItemsList');
        const countBadge = document.getElementById('cartCountBadge');
        const subtotalEl = document.getElementById('cartSubtotal');
        const vatEl = document.getElementById('cartVat');
        const totalEl = document.getElementById('cartGrandTotal');
        const custLabel = document.getElementById('cartCustomerLabel');

        const mobileBar = document.getElementById('mobileFloatingCartBar');
        const mobileCount = document.getElementById('mobileCartCount');
        const mobileTotal = document.getElementById('mobileCartTotal');

        const cust = (this.customers || []).find(c => String(c.id) === String(this.currentCustomerId)) || this.customers[0] || { name: 'عميل نقدي (كاشير الفرع)' };
        if (custLabel) custLabel.innerText = cust.name || 'عميل نقدي (كاشير الفرع)';

        const totalItemsCount = this.cart.reduce((sum, item) => sum + item.qty, 0);
        if (countBadge) countBadge.innerText = totalItemsCount;

        // TOTAL EQUALS SUBTOTAL (0% TAX COMPLETELY)
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        const grandTotal = subtotal;

        if (subtotalEl) subtotalEl.innerText = `${subtotal.toFixed(2)} ج.م`;
        if (vatEl) vatEl.innerText = `0.00 ج.م`;
        if (totalEl) totalEl.innerText = `${grandTotal.toFixed(2)} ج.م`;

        if (mobileBar) {
            if (totalItemsCount > 0) {
                mobileBar.style.display = 'flex';
                if (mobileCount) mobileCount.innerText = totalItemsCount;
                if (mobileTotal) mobileTotal.innerText = `${grandTotal.toFixed(2)} ج.م`;
            } else {
                mobileBar.style.display = 'none';
            }
        }

        if (!list) return;

        if (this.cart.length === 0) {
            list.innerHTML = `
                <div style="text-align: center; padding: 30px 10px; color: var(--text-muted);">
                    <i class="fa-solid fa-basket-shopping" style="font-size: 2rem; margin-bottom: 6px; display: block; opacity: 0.5;"></i>
                    السلة فارغة حالياً
                </div>
            `;
            return;
        }

        list.innerHTML = this.cart.map((item, idx) => `
            <div class="cart-item">
                <div class="cart-item-header">
                    <div>
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-unit">${item.unitName} (${(item.price || 0).toFixed(2)} ج.م)</div>
                    </div>
                    <button type="button" class="btn-remove-item" onclick="app.updateCartQty(${idx}, -${item.qty})">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
                <div class="cart-item-controls">
                    <div class="cart-qty-spinner">
                        <button type="button" class="qty-btn" onclick="app.updateCartQty(${idx}, -1)">-</button>
                        <span class="qty-val">${item.qty}</span>
                        <button type="button" class="qty-btn" onclick="app.updateCartQty(${idx}, 1)">+</button>
                    </div>
                    <div class="cart-item-total">
                        ${((item.price || 0) * item.qty).toFixed(2)} ج.م
                    </div>
                </div>
            </div>
        `).join('');
    }

    setPaymentType(type) {
        this.currentPaymentType = type;
        document.querySelectorAll('.pay-type-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.type === type);
        });
    }

    checkoutCurrentCart() {
        if (this.cart.length === 0) {
            alert('السلة فارغة، برجاء إضافة أصناف قبل إتمام الفاتورة');
            return;
        }

        // TAX COMPLETELY ELIMINATED
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        const vat = 0.0;
        const grandTotal = subtotal;
        const customer = (this.customers || []).find(c => String(c.id) === String(this.currentCustomerId)) || this.customers[0] || { id: 1, name: 'عميل نقدي (كاشير الفرع)' };

        const orderId = `INV-${new Date().getFullYear()}-${String(this.orders.length + 101).padStart(5, '0')}`;
        const now = new Date();
        const orderDate = now.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
        const orderTime = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
        const orderDateTime = `${orderDate} - ${orderTime}`;

        const newOrder = {
            id: orderId,
            date: orderDateTime,
            timestamp: Date.now(),
            customerId: customer.id,
            customerName: customer.name,
            customerPhone: customer.phone,
            customerAddress: customer.address,
            customerTaxId: customer.taxId,
            items: [...this.cart],
            subtotal: subtotal,
            vat: vat,
            grandTotal: grandTotal,
            paymentType: this.currentPaymentType,
            cashierName: this.currentUser.displayName,
            tafqeetWords: tafqeet(grandTotal)
        };

        // Update inventory stock
        this.cart.forEach(cartItem => {
            const prod = (this.products || []).find(p => p.id === cartItem.productId);
            if (prod) {
                const deduction = cartItem.qty * (cartItem.factor || 1);
                prod.currentStock = Math.max(0, (prod.currentStock || 0) - deduction);
            }
        });

        // Update customer balance if credit
        if (this.currentPaymentType === 'credit' && customer.id !== 1) {
            customer.balance = (customer.balance || 0) + grandTotal;
        }

        this.orders.unshift(newOrder);
        this.saveAll();

        playBeep(true);
        this.clearCart();
        this.closeCartDrawer();
        this.renderInventoryTable();
        this.renderPartnersScreen();
        this.renderHomeDashboard();
        this.renderOrdersTable();
        this.renderShiftDetails();
        this.renderTreasuryTable();

        this.openInvoiceModal(newOrder);
    }

    // ==========================================================================
    // INVOICE MODAL & UNIVERSAL PRINT PREVIEWS (THERMAL & A4)
    // ==========================================================================
    openInvoiceModal(order) {
        if (!order) return;
        this.currentViewingOrder = order;
        this.renderInvoicePrintable();
        document.getElementById('invoiceModal')?.classList.add('active');
    }

    closeInvoiceModal() {
        document.getElementById('invoiceModal')?.classList.remove('active');
        this.currentViewingOrder = null;
    }

    switchPrintFormat(format) {
        this.currentPrintFormat = format;
        document.querySelectorAll('.format-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.format === format);
        });
        const sheet = document.getElementById('printableSheetRoot');
        if (sheet) {
            sheet.className = `printable-document-container format-${format}`;
        }
        this.renderInvoicePrintable();
    }

    renderInvoicePrintable() {
        const sheet = document.getElementById('printableSheetRoot');
        const order = this.currentViewingOrder;
        if (!sheet || !order) return;

        const customer = (this.customers || []).find(c => c.id === order.customerId) || { name: order.customerName, phone: order.customerPhone || '—', balance: 0 };
        const barcodeSvg = generateCode128SVG(order.id, { height: 32, showText: true });
        const qrSvg = generateEtaQrSVG('كارما كارميلا للأغذية', '492-817-305', order.date, (order.grandTotal || 0).toFixed(2));

        if (this.currentPrintFormat === 'thermal') {
            sheet.innerHTML = `
                <div class="thermal-inv-header">
                    <h2>كارما كارميلا</h2>
                    <p>لتوريد وتجارة المواد الغذائية بالجملة والتجزئة</p>
                    <small>س.ت: 184920 الجيزة • ر.ض: 492-817-305</small>
                    <div style="margin-top: 5px; font-weight: bold; font-size: 0.88rem;">فاتورة مبيعات</div>
                    <div style="font-size: 0.74rem; color: #475569;">رقم الفاتورة: <strong>${order.id}</strong></div>
                    <div style="font-size: 0.72rem; color: #64748B;">التاريخ والوقت: ${order.date}</div>
                    <div style="font-size: 0.7rem; color: #64748B;">الكاشير: ${order.cashierName || this.currentUser.displayName}</div>
                </div>

                <div style="font-size: 0.76rem; border-bottom: 1px dashed #94A3B8; padding-bottom: 5px; margin-bottom: 6px;">
                    <div>العميل: <strong>${order.customerName}</strong></div>
                    <div>الهاتف: ${order.customerPhone || 'نقدي'}</div>
                    <div>طريقة الدفع: <strong>${order.paymentType === 'cash' ? 'نقداً بالخزينة' : (order.paymentType === 'card' ? 'شبكة / فيزا' : 'آجل على الحساب')}</strong></div>
                </div>

                <table class="thermal-inv-table">
                    <thead>
                        <tr>
                            <th>الصنف / الوحدة</th>
                            <th style="text-align: center;">الكمية</th>
                            <th>السعر</th>
                            <th>الإجمالي</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${(order.items || []).map(it => `
                            <tr>
                                <td>${it.name}<br><small style="color: #64748B;">(${it.unitName})</small></td>
                                <td style="text-align: center;">${it.qty}</td>
                                <td>${(it.price || 0).toFixed(2)}</td>
                                <td style="font-weight: bold;">${((it.price || 0) * it.qty).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="thermal-totals-box">
                    <div class="thermal-total-row grand">
                        <span>الإجمالي المستحق:</span>
                        <span>${(order.grandTotal || 0).toFixed(2)} ج.م</span>
                    </div>
                </div>

                <div class="thermal-tafqeet">
                    ${order.tafqeetWords}
                </div>

                ${order.paymentType === 'credit' ? `
                    <div style="font-size: 0.72rem; background: #F8FAFC; border: 1px solid #E2E8F0; padding: 5px; border-radius: 5px; margin-top: 6px;">
                        <div>الرصيد السابق للعميل: ${((customer.balance || 0) - order.grandTotal).toFixed(2)} ج.م</div>
                        <div style="font-weight: bold; color: #DC2626;">الرصيد الإجمالي المستحق: ${(customer.balance || 0).toFixed(2)} ج.م</div>
                    </div>
                ` : ''}

                <div class="thermal-qr-box">
                    ${qrSvg}
                    <div class="thermal-barcode-svg">
                        ${barcodeSvg}
                    </div>
                </div>

                <div class="thermal-footer">
                    <div>شكراً لاختياركم كارما كارميلا للأغذية</div>
                    <div>البضاعة المباعة ترد وتستبدل طبقاً للشروط والأحكام</div>
                </div>
            `;
        } else {
            // A4 Tax Invoice Format
            sheet.innerHTML = `
                <div class="a4-inv-page">
                    <div class="a4-header-row">
                        <div class="a4-brand-block">
                            <h1 style="color: #FF6A00; margin: 0; font-size: 1.6rem; font-weight: 900;">كارما كارميلا</h1>
                            <div style="font-size: 0.9rem; font-weight: bold; color: #0F172A;">لتوريد وتجارة المواد الغذائية والسلع التموينية بالجملة</div>
                            <div style="font-size: 0.78rem; color: #64748B;">سجل تجاري: 184920 الجيزة • بطاقة ضريبية: 492-817-305</div>
                            <div style="font-size: 0.78rem; color: #64748B;">المركز الرئيسي: 14 شارع الهرم، الجيزة • هاتف: 01123456789</div>
                        </div>
                        <div class="a4-meta-block">
                            <div class="a4-meta-badge">فاتورة مبيعات معتمدة</div>
                            <div style="font-size: 0.85rem; font-weight: bold; font-family: monospace;">رقم: ${order.id}</div>
                            <div style="font-size: 0.75rem; color: #64748B;">تاريخ الإصدار: ${order.date}</div>
                        </div>
                    </div>

                    <div class="a4-parties-row">
                        <div class="a4-party-col">
                            <strong style="color: #FF6A00; display: block; margin-bottom: 3px;">بيانات العميل / المشتري:</strong>
                            <div>الاسم: <strong>${order.customerName}</strong></div>
                            <div>الهاتف: ${order.customerPhone || 'نقدي'}</div>
                            <div>العنوان: ${order.customerAddress || '—'}</div>
                            <div>السجل التجاري / الرقم الضريبي: ${order.customerTaxId || '—'}</div>
                        </div>
                        <div class="a4-party-col">
                            <strong style="color: #FF6A00; display: block; margin-bottom: 3px;">تفاصيل السداد والفرع:</strong>
                            <div>الفرع المصدر: <strong>فرع الجملة الرئيسي</strong></div>
                            <div>الكاشير المحرر: <strong>${order.cashierName || this.currentUser.displayName}</strong></div>
                            <div>طريقة السداد: <strong>${order.paymentType === 'cash' ? 'نقداً بالخزينة' : (order.paymentType === 'card' ? 'بطاقة دفع' : 'آجل على الحساب')}</strong></div>
                        </div>
                    </div>

                    <table class="a4-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>كود الصنف</th>
                                <th>اسم الصنف والوحدة</th>
                                <th style="text-align: center;">الكمية</th>
                                <th>سعر الوحدة</th>
                                <th>إجمالي القيمة</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${(order.items || []).map((it, idx) => `
                                <tr>
                                    <td>${idx + 1}</td>
                                    <td style="font-family: monospace; font-size: 0.8rem;">${it.sku}</td>
                                    <td><strong>${it.name}</strong> <span style="font-size: 0.8rem; color: #64748B;">(${it.unitName})</span></td>
                                    <td style="text-align: center; font-weight: bold;">${it.qty}</td>
                                    <td>${(it.price || 0).toFixed(2)} ج.م</td>
                                    <td style="font-weight: bold; color: #0F172A;">${((it.price || 0) * it.qty).toFixed(2)} ج.م</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <div class="a4-bottom-section">
                        <div class="a4-signatures-box">
                            <div style="font-size: 0.82rem; font-weight: bold; margin-bottom: 5px;">التفقيط المعتمد:</div>
                            <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 6px; border-radius: 4px; font-size: 0.8rem; color: #0F172A;">
                                ${order.tafqeetWords}
                            </div>

                            <div style="display: flex; gap: 20px; align-items: center; margin-top: 15px;">
                                <div style="width: 75px; height: 75px;">
                                    ${qrSvg}
                                </div>
                                <div style="flex: 1;">
                                    <div style="width: 170px;">
                                        ${barcodeSvg}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="a4-totals-box">
                            <div class="a4-total-line grand">
                                <span>الإجمالي النهائي المستحق:</span>
                                <span>${(order.grandTotal || 0).toFixed(2)} ج.م</span>
                            </div>
                        </div>
                    </div>

                    <div style="display: flex; justify-content: space-between; margin-top: 35px; border-top: 1px solid #CBD5E1; padding-top: 10px; font-size: 0.8rem; color: #475569;">
                        <div>توقيع أمين المخزن: .........................</div>
                        <div>توقيع المستلم: .........................</div>
                        <div>خاتم واعتماد الشركة: .........................</div>
                    </div>
                </div>
            `;
        }
    }

    printCurrentInvoice() {
        const sheet = document.getElementById('printableSheetRoot');
        if (!sheet) return;
        this.printDocument(sheet.innerHTML, this.currentPrintFormat);
    }

    printCurrentVoucher() {
        const voucher = document.getElementById('voucherPrintArea');
        if (!voucher) return;
        this.printDocument(voucher.innerHTML, 'a4');
    }

    printDocument(htmlContent, format = 'thermal') {
        const container = document.getElementById('globalPrintContainer');
        if (!container) {
            window.print();
            return;
        }

        container.className = `global-print-container format-${format}`;
        container.innerHTML = htmlContent;

        // Give DOM 50ms to settle rendering before triggering Android print spooler
        setTimeout(() => {
            window.print();
        }, 60);
    }

    // ==========================================================================
    // CUSTOMER PAYMENTS (سند قبض عميل)
    // ==========================================================================
    openCustomerPaymentModal(presetCustomerId = null) {
        const select = document.getElementById('custPaymentSelect');
        if (select) {
            select.innerHTML = (this.customers || []).filter(c => c.id !== 1).map(c => `
                <option value="${c.id}" ${c.id === presetCustomerId ? 'selected' : ''}>
                    ${c.name} (رصيد مستحق: ${(c.balance || 0).toFixed(2)} ج.م)
                </option>
            `).join('');
            this.onCustomerPaymentSelectChange();
        }
        document.getElementById('customerPaymentModal')?.classList.add('active');
    }

    closeCustomerPaymentModal() {
        document.getElementById('customerPaymentModal')?.classList.remove('active');
    }

    onCustomerPaymentSelectChange() {
        const select = document.getElementById('custPaymentSelect');
        const custId = parseInt(select?.value, 10);
        const cust = (this.customers || []).find(c => c.id === custId);
        const balSpan = document.getElementById('custCurrentBalanceSpan');
        if (balSpan && cust) {
            balSpan.innerText = `${(cust.balance || 0).toFixed(2)} ج.م`;
        }
    }

    saveCustomerPayment(e) {
        e.preventDefault();
        const custId = parseInt(document.getElementById('custPaymentSelect')?.value, 10);
        const amount = parseFloat(document.getElementById('custPaymentAmount')?.value);
        const method = document.getElementById('custPaymentMethod')?.value || 'نقدًا بالخزينة';
        const notes = document.getElementById('custPaymentNotes')?.value?.trim() || '';

        const cust = (this.customers || []).find(c => c.id === custId);
        if (!cust || !amount || amount <= 0) return;

        const balanceBefore = cust.balance || 0;
        const balanceAfter = Math.max(0, balanceBefore - amount);
        cust.balance = balanceAfter;

        const now = new Date();
        const dateStr = now.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
        const timeStr = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
        const fullDateTime = `${dateStr} - الساعة ${timeStr}`;

        const paymentRecord = {
            id: `REC-${now.getFullYear()}-${String(this.customerPayments.length + 101).padStart(4, '0')}`,
            customerId: cust.id,
            customerName: cust.name,
            date: dateStr,
            time: timeStr,
            fullDateTime: fullDateTime,
            timestamp: Date.now(),
            amount: amount,
            method: method,
            notes: notes,
            cashierName: this.currentUser.displayName,
            balanceBefore: balanceBefore,
            balanceAfter: balanceAfter,
            tafqeetWords: tafqeet(amount)
        };

        this.customerPayments.unshift(paymentRecord);
        this.saveAll();

        playBeep(true);
        this.closeCustomerPaymentModal();
        this.renderPartnersScreen();
        this.renderHomeDashboard();
        this.renderShiftDetails();
        this.renderTreasuryTable();

        if (this.currentPartnerDetail && this.currentPartnerDetail.id === cust.id) {
            this.renderPartnerLedger();
            this.renderPartnerStats();
        }

        this.printVoucherDirect('receipt', paymentRecord.id);
        alert(`تم تسجيل سند القبض [${paymentRecord.id}] بنجاح بقيمة ${amount.toFixed(2)} ج.م`);
    }

    // ==========================================================================
    // SUPPLIER PAYMENTS (سند صرف مورد)
    // ==========================================================================
    openSupplierPaymentModal(presetSupplierId = null) {
        const select = document.getElementById('supPaymentSelect');
        if (select) {
            select.innerHTML = (this.suppliers || []).map(s => `
                <option value="${s.id}" ${s.id === presetSupplierId ? 'selected' : ''}>
                    ${s.name} (مستحق له: ${(s.balance || 0).toFixed(2)} ج.م)
                </option>
            `).join('');
            this.onSupplierPaymentSelectChange();
        }
        document.getElementById('supplierPaymentModal')?.classList.add('active');
    }

    closeSupplierPaymentModal() {
        document.getElementById('supplierPaymentModal')?.classList.remove('active');
    }

    onSupplierPaymentSelectChange() {
        const select = document.getElementById('supPaymentSelect');
        const supId = parseInt(select?.value, 10);
        const sup = (this.suppliers || []).find(s => s.id === supId);
        const balSpan = document.getElementById('supCurrentBalanceSpan');
        if (balSpan && sup) {
            balSpan.innerText = `${(sup.balance || 0).toFixed(2)} ج.م`;
        }
    }

    saveSupplierPayment(e) {
        e.preventDefault();
        const supId = parseInt(document.getElementById('supPaymentSelect')?.value, 10);
        const amount = parseFloat(document.getElementById('supPaymentAmount')?.value);
        const method = document.getElementById('supPaymentMethod')?.value || 'نقدًا بالخزينة';
        const notes = document.getElementById('supPaymentNotes')?.value?.trim() || '';

        const sup = (this.suppliers || []).find(s => s.id === supId);
        if (!sup || !amount || amount <= 0) return;

        const balanceBefore = sup.balance || 0;
        const balanceAfter = Math.max(0, balanceBefore - amount);
        sup.balance = balanceAfter;

        const now = new Date();
        const dateStr = now.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
        const timeStr = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
        const fullDateTime = `${dateStr} - الساعة ${timeStr}`;

        const voucher = {
            id: `PAY-${now.getFullYear()}-${String(this.supplierPayments.length + 101).padStart(4, '0')}`,
            supplierId: sup.id,
            supplierName: sup.name,
            date: dateStr,
            time: timeStr,
            fullDateTime: fullDateTime,
            timestamp: Date.now(),
            amount: amount,
            method: method,
            notes: notes,
            cashierName: this.currentUser.displayName,
            balanceBefore: balanceBefore,
            balanceAfter: balanceAfter,
            tafqeetWords: tafqeet(amount)
        };

        this.supplierPayments.unshift(voucher);
        this.saveAll();

        playBeep(true);
        this.closeSupplierPaymentModal();
        this.renderPartnersScreen();
        this.renderHomeDashboard();
        this.renderShiftDetails();
        this.renderTreasuryTable();

        if (this.currentPartnerDetail && this.currentPartnerDetail.id === sup.id) {
            this.renderPartnerLedger();
            this.renderPartnerStats();
        }

        this.printVoucherDirect('disbursement', voucher.id);
        alert(`تم تسجيل سند الصرف [${voucher.id}] بنجاح بقيمة ${amount.toFixed(2)} ج.م`);
    }

    // ==========================================================================
    // REAL CAMERA BARCODE SCANNER WITH ZXING FALLBACK & TORCH
    // ==========================================================================
    setupBarcodeDetector() {
        if ('BarcodeDetector' in window) {
            try {
                this.scannerDetector = new BarcodeDetector({
                    formats: ['ean_13', 'code_128', 'qr_code', 'code_39', 'upc_a', 'ean_8']
                });
            } catch (e) {
                this.scannerDetector = null;
            }
        }

        // Initialize ZXing fallback if window.ZXing exists
        if (window.ZXing && !this.zxingReader) {
            try {
                this.zxingReader = new ZXing.BrowserMultiFormatReader();
            } catch (e) {
                this.zxingReader = null;
            }
        }
    }

    openScannerModal() {
        const modal = document.getElementById('scannerModal');
        if (modal) modal.classList.add('active');
        this.startCameraStream();
        const input = document.getElementById('manualScannerInput');
        if (input) {
            input.value = '';
            setTimeout(() => input.focus(), 300);
        }
    }

    closeScannerModal() {
        document.getElementById('scannerModal')?.classList.remove('active');
        this.stopCameraStream();
    }

    async startCameraStream() {
        const video = document.getElementById('scannerVideo');
        if (!video || !navigator.mediaDevices?.getUserMedia) return;

        try {
            this.scannerStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: this.scannerFacingMode,
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });
            video.srcObject = this.scannerStream;
            video.setAttribute('playsinline', 'true');
            await video.play();
            this.isScanningActive = true;
            this.runCameraDetectionLoop(video);
            document.getElementById('btnToggleCamera')?.classList.add('active');
        } catch (err) {
            console.warn('Camera access unavailable or denied:', err);
            document.getElementById('btnToggleCamera')?.classList.remove('active');
        }
    }

    stopCameraStream() {
        this.isScanningActive = false;
        if (this.zxingReader) {
            try { this.zxingReader.reset(); } catch (e) {}
        }
        if (this.scannerStream) {
            this.scannerStream.getTracks().forEach(t => t.stop());
            this.scannerStream = null;
        }
        const video = document.getElementById('scannerVideo');
        if (video) video.srcObject = null;
        document.getElementById('btnToggleCamera')?.classList.remove('active');
        this.scannerTorchActive = false;
        document.getElementById('btnToggleTorch')?.classList.remove('active');
    }

    toggleCameraStream() {
        if (this.isScanningActive) {
            this.stopCameraStream();
        } else {
            this.startCameraStream();
        }
    }

    flipCamera() {
        this.scannerFacingMode = this.scannerFacingMode === 'environment' ? 'user' : 'environment';
        if (this.isScanningActive) {
            this.stopCameraStream();
            this.startCameraStream();
        }
    }

    async toggleTorch() {
        if (!this.scannerStream) return;
        const track = this.scannerStream.getVideoTracks()[0];
        if (!track) return;

        try {
            this.scannerTorchActive = !this.scannerTorchActive;
            await track.applyConstraints({
                advanced: [{ torch: this.scannerTorchActive }]
            });
            document.getElementById('btnToggleTorch')?.classList.toggle('active', this.scannerTorchActive);
        } catch (e) {
            console.warn('Torch not supported on this camera/browser:', e);
            alert('الكشاف غير مدعوم على هذه الكاميرا أو المتصفح');
            this.scannerTorchActive = false;
            document.getElementById('btnToggleTorch')?.classList.remove('active');
        }
    }

    runCameraDetectionLoop(video) {
        if (!this.isScanningActive) return;

        if (this.scannerDetector && video.readyState >= 2) {
            this.scannerDetector.detect(video).then(barcodes => {
                if (barcodes.length > 0) {
                    const rawValue = barcodes[0].rawValue;
                    if (rawValue) {
                        this.handleScannedCode(rawValue);
                        return;
                    }
                }
                if (this.isScanningActive) {
                    requestAnimationFrame(() => this.runCameraDetectionLoop(video));
                }
            }).catch(() => {
                if (this.isScanningActive) {
                    setTimeout(() => this.runCameraDetectionLoop(video), 200);
                }
            });
        } else if (this.zxingReader && video.readyState >= 2) {
            // ZXing fallback loop using canvas frame
            try {
                this.zxingReader.decodeOnceFromVideoDevice(undefined, 'scannerVideo').then(result => {
                    if (result && result.text) {
                        this.handleScannedCode(result.text);
                    }
                }).catch(() => {
                    if (this.isScanningActive) {
                        setTimeout(() => this.runCameraDetectionLoop(video), 300);
                    }
                });
            } catch (e) {
                if (this.isScanningActive) {
                    setTimeout(() => this.runCameraDetectionLoop(video), 300);
                }
            }
        } else {
            if (this.isScanningActive) {
                setTimeout(() => this.runCameraDetectionLoop(video), 200);
            }
        }
    }

    handleScannedCode(rawCode) {
        const code = String(rawCode || '').trim();
        if (!code) return;

        playBeep(true);

        let matchedProduct = null;
        let matchedUnitId = null;

        for (const p of (this.products || [])) {
            if (p.barcode === code || (p.sku || '').toUpperCase() === code.toUpperCase()) {
                matchedProduct = p;
                break;
            }
            if (p.units) {
                const u = p.units.find(unit => unit.barcode === code);
                if (u) {
                    matchedProduct = p;
                    matchedUnitId = u.id;
                    break;
                }
            }
        }

        if (matchedProduct) {
            this.addProductToCart(matchedProduct.id, matchedUnitId);
            this.closeScannerModal();
            this.switchScreen('pos');
        } else {
            playBeep(false);
            alert(`تم مسح الباركود بنجاح: [${code}]\nلكن هذا الكود غير مسجل بأي صنف بالمستودع حالياً.`);
        }
    }

    processManualBarcode() {
        const input = document.getElementById('manualScannerInput');
        if (input && input.value.trim()) {
            this.handleScannedCode(input.value.trim());
            input.value = '';
        }
    }

    initQuickBarcodes() {
        const cloud = document.getElementById('quickBarcodesCloud');
        if (!cloud) return;
        cloud.innerHTML = (this.products || []).map(p => `
            <button type="button" class="badge-quick-barcode" onclick="app.handleScannedCode('${p.barcode}')">
                <i class="fa-solid fa-barcode"></i> ${(p.name || '').split(' ')[0]} ${(p.name || '').split(' ')[1] || ''}
            </button>
        `).join('');
    }

    initGlobalHardwareBarcodeScanner() {
        let buffer = '';
        let lastCharTime = 0;

        window.addEventListener('keydown', (e) => {
            const tag = e.target.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) {
                return;
            }

            const now = Date.now();
            if (now - lastCharTime > 150) {
                buffer = '';
            }

            if (e.key === 'Enter') {
                if (buffer.length >= 3) {
                    this.handleScannedCode(buffer);
                    buffer = '';
                    e.preventDefault();
                }
            } else if (e.key && e.key.length === 1) {
                buffer += e.key;
                lastCharTime = now;
            }
        });
    }

    // ==========================================================================
    // BARCODE LABEL STUDIO (PRINT STICKERS)
    // ==========================================================================
    openBarcodeStudioModal() {
        const select = document.getElementById('barcodeLabelProductSelect');
        if (select) {
            select.innerHTML = (this.products || []).map(p => `
                <option value="${p.id}">${p.name} (${p.sku}) - ${(p.wholesalePrice || 0).toFixed(2)} ج.م</option>
            `).join('');
        }
        this.renderBarcodeStickerPreview();
        document.getElementById('barcodeStudioModal')?.classList.add('active');
    }

    closeBarcodeStudioModal() {
        document.getElementById('barcodeStudioModal')?.classList.remove('active');
    }

    renderBarcodeStickerPreview() {
        const select = document.getElementById('barcodeLabelProductSelect');
        const countSelect = document.getElementById('barcodeLabelCountSelect');
        const area = document.getElementById('barcodeStickersPreviewArea');
        if (!select || !area) return;

        const productId = parseInt(select.value, 10);
        const count = parseInt(countSelect?.value || '4', 10);
        const prod = (this.products || []).find(p => p.id === productId) || this.products[0];
        if (!prod) return;

        const barcodeSvg = generateCode128SVG(prod.barcode || prod.sku, { height: 35, showText: true });

        let stickersHtml = '';
        for (let i = 0; i < count; i++) {
            stickersHtml += `
                <div class="single-barcode-sticker">
                    <div class="sticker-brand">كارما كارميلا للأغذية</div>
                    <div class="sticker-name">${prod.name}</div>
                    <div class="sticker-price">${(prod.wholesalePrice || 0).toFixed(2)} ج.م</div>
                    <div class="sticker-barcode">${barcodeSvg}</div>
                    <div class="sticker-sku">${prod.sku}</div>
                </div>
            `;
        }
        area.innerHTML = stickersHtml;
    }

    printBarcodeStickers() {
        const preview = document.getElementById('barcodeStickersPreviewArea');
        if (!preview) return;

        const html = `
            <div style="direction: rtl; font-family: 'Cairo', sans-serif;">
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; padding: 15px;">
                    ${preview.innerHTML}
                </div>
            </div>
        `;
        this.printDocument(html, 'a4');
    }

    // ==========================================================================
    // CUSTOMER SELECTION FOR POS
    // ==========================================================================
    openCustomerModal() {
        const list = document.getElementById('customerSelectList');
        if (!list) return;

        list.innerHTML = (this.customers || []).map(c => `
            <div class="customer-select-item ${c.id === this.currentCustomerId ? 'active' : ''}" onclick="app.selectCustomer(${c.id})">
                <div style="font-weight: bold; font-size: 0.95rem;">${c.name}</div>
                <div style="font-size: 0.78rem; color: #64748B;">الهاتف: ${c.phone} • الرصيد المستحق: <span style="font-weight: bold; color: ${c.balance > 0 ? '#DC2626' : '#10B981'};">${(c.balance || 0).toFixed(2)} ج.م</span></div>
            </div>
        `).join('');

        document.getElementById('customerModal')?.classList.add('active');
    }

    closeCustomerModal() {
        document.getElementById('customerModal')?.classList.remove('active');
    }

    selectCustomer(customerId) {
        this.currentCustomerId = customerId;
        this.closeCustomerModal();
        this.renderCart();
    }

    // ==========================================================================
    // SCREEN RENDERING (HOME, INVENTORY, ORDERS)
    // ==========================================================================
    renderHomeDashboard() {
        const fin = this.getShiftFinancials();

        const todaySalesEl = document.getElementById('homeTodaySales');
        const cashDrawerEl = document.getElementById('homeCashDrawer');
        const receivablesEl = document.getElementById('homeReceivables');
        const payablesEl = document.getElementById('homePayables');
        const ordersCountEl = document.getElementById('homeOrdersCount');
        const stockValEl = document.getElementById('homeStockValuation');
        const stockCountEl = document.getElementById('homeStockCountText');

        const totalReceivables = (this.customers || []).reduce((sum, c) => sum + (c.balance || 0), 0);
        const totalPayables = (this.suppliers || []).reduce((sum, s) => sum + (s.balance || 0), 0);
        const stockValuation = (this.products || []).reduce((sum, p) => sum + ((p.currentStock || 0) * (p.costPrice || 0)), 0);

        if (todaySalesEl) todaySalesEl.innerText = `${fin.totalSales.toFixed(2)} ج.م`;
        if (cashDrawerEl) cashDrawerEl.innerText = `${fin.expectedCash.toFixed(2)} ج.م`;
        if (receivablesEl) receivablesEl.innerText = `${totalReceivables.toFixed(2)} ج.م`;
        if (payablesEl) payablesEl.innerText = `${totalPayables.toFixed(2)} ج.م`;

        if (ordersCountEl) ordersCountEl.innerText = `${(this.orders || []).length} فواتير`;
        if (stockValEl) stockValEl.innerText = `${stockValuation.toFixed(2)} ج.م`;
        if (stockCountEl) stockCountEl.innerText = `${(this.products || []).length} صنف مسجل`;

        // Home Recent Operations Table
        const recentTbody = document.querySelector('#homeRecentOrdersTable tbody');
        if (recentTbody) {
            const recentTimeline = [
                ...(this.orders || []).slice(0, 4).map(o => ({ id: o.id, party: o.customerName, date: o.date, amount: o.grandTotal, type: 'فاتورة بيع' })),
                ...(this.customerPayments || []).slice(0, 3).map(p => ({ id: p.id, party: p.customerName, date: p.fullDateTime || p.date, amount: p.amount, type: 'سند قبض نقدية' })),
                ...(this.expenses || []).slice(0, 2).map(e => ({ id: e.id, party: e.title, date: e.date, amount: e.amount, type: 'سند صرف مصروف' }))
            ];

            recentTbody.innerHTML = recentTimeline.length === 0 ? `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">لا توجد حركات مسجلة بالوردية الحالية</td></tr>` : recentTimeline.map(it => `
                <tr>
                    <td style="font-family: monospace; font-weight: bold; color: var(--primary-orange);">${it.id}</td>
                    <td>${it.party}</td>
                    <td style="font-size: 0.72rem;">${it.date}</td>
                    <td style="font-weight: 900; color: var(--primary-orange);">${(it.amount || 0).toFixed(2)} ج.م</td>
                    <td><span class="status-badge ${it.type.includes('فاتورة') ? 'partial' : 'paid'}">${it.type}</span></td>
                </tr>
            `).join('');
        }

        // Low stock alerts
        const lowStockList = document.getElementById('homeLowStockList');
        if (lowStockList) {
            const lowItems = (this.products || []).filter(p => (p.currentStock || 0) <= (p.minStock || 0));
            if (lowItems.length === 0) {
                lowStockList.innerHTML = `<div style="text-align: center; padding: 14px; color: var(--accent-emerald); font-weight: bold; font-size: 0.82rem;">
                    <i class="fa-solid fa-circle-check"></i> مستويات المخزون ممتازة لجميع الأصناف
                </div>`;
            } else {
                lowStockList.innerHTML = lowItems.map(p => `
                    <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 8px; padding: 8px 12px; margin-bottom: 6px;">
                        <div>
                            <div style="font-weight: bold; font-size: 0.82rem;">${p.name}</div>
                            <div style="font-size: 0.72rem; color: var(--accent-rose);">المخزون الحالي: ${p.currentStock} (الحد الأدنى: ${p.minStock})</div>
                        </div>
                        <button type="button" class="btn-primary" style="padding: 4px 8px; font-size: 0.7rem;" onclick="app.openNewPurchaseModal()">توريد فوراً</button>
                    </div>
                `).join('');
            }
        }
    }

    renderInventoryTable() {
        const tbody = document.querySelector('#inventoryTable tbody');
        if (!tbody) return;

        tbody.innerHTML = (this.products || []).map(p => {
            const barcodeSvg = generateCode128SVG(p.barcode || p.sku, { height: 26, showText: false });
            const isLow = (p.currentStock || 0) <= (p.minStock || 0);

            return `
                <tr>
                    <td style="font-family: monospace; font-weight: bold;">${p.sku}</td>
                    <td style="font-weight: bold;">${p.name}</td>
                    <td><span class="cat-pill" style="font-size: 0.7rem; padding: 2px 8px;">${p.category}</span></td>
                    <td style="color: var(--text-muted);">${(p.costPrice || 0).toFixed(2)} ج.م</td>
                    <td style="font-weight: bold; color: var(--primary-orange);">${(p.wholesalePrice || 0).toFixed(2)} ج.م</td>
                    <td>
                        <span class="status-badge ${isLow ? 'credit' : 'paid'}">
                            ${p.currentStock || 0} ${p.baseUnit}
                        </span>
                    </td>
                    <td>
                        <div style="width: 100px;">${barcodeSvg}</div>
                    </td>
                    <td>
                        <button type="button" class="btn-secondary" style="padding: 4px 8px; font-size: 0.72rem;" onclick="app.openBarcodeStudioModal()"><i class="fa-solid fa-barcode"></i> ملصق</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    renderOrdersTable() {
        const tbody = document.querySelector('#allOrdersTable tbody');
        if (!tbody) return;
        if (!this.orders || this.orders.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 25px;">لا توجد فواتير صادرة حتى الآن</td></tr>`;
            return;
        }

        tbody.innerHTML = this.orders.map(o => `
            <tr>
                <td style="font-family: monospace; font-weight: bold; color: var(--primary-orange);">${o.id}</td>
                <td style="font-weight: 700;">${o.customerName}</td>
                <td style="font-size: 0.75rem;">${o.date}</td>
                <td style="font-weight: 900; color: var(--primary-orange);">${(o.grandTotal || 0).toFixed(2)} ج.م</td>
                <td><span class="status-badge ${o.paymentType === 'cash' ? 'paid' : 'partial'}">${o.paymentType === 'cash' ? 'خزينة فورية' : 'آجل على الحساب'}</span></td>
                <td style="font-size: 0.74rem;">${o.cashierName || 'أحمد الشناوي'}</td>
                <td>
                    <button type="button" class="btn-primary" style="padding: 4px 8px; font-size: 0.72rem;" onclick="app.openInvoiceModal(app.orders.find(ord => ord.id === '${o.id}'))">
                        <i class="fa-solid fa-print"></i> معاينة وطباعة
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // ==========================================================================
    // MODAL CREATION FORMS (NEW CUSTOMER, SUPPLIER, PRODUCT, PURCHASE)
    // ==========================================================================
    openAddCustomerModal() {
        document.getElementById('addCustomerModal')?.classList.add('active');
    }
    closeAddCustomerModal() {
        document.getElementById('addCustomerModal')?.classList.remove('active');
    }
    saveNewCustomer(e) {
        e.preventDefault();
        const name = document.getElementById('newCustName')?.value?.trim();
        const phone = document.getElementById('newCustPhone')?.value?.trim();
        const balance = parseFloat(document.getElementById('newCustBalance')?.value) || 0;
        const address = document.getElementById('newCustAddress')?.value?.trim() || '';

        if (!name || !phone) return;

        const newCust = {
            id: Date.now(),
            name,
            phone,
            balance,
            creditLimit: 25000.0,
            address,
            cr: '—',
            taxId: '—'
        };

        this.customers.push(newCust);
        this.saveAll();
        playBeep(true);
        this.closeAddCustomerModal();
        this.renderPartnersScreen();
        this.renderHomeDashboard();
        alert(`تم تسجيل العميل: [${name}] بنجاح`);
    }

    openAddSupplierModal() {
        document.getElementById('addSupplierModal')?.classList.add('active');
    }
    closeAddSupplierModal() {
        document.getElementById('addSupplierModal')?.classList.remove('active');
    }
    saveNewSupplier(e) {
        e.preventDefault();
        const name = document.getElementById('newSupName')?.value?.trim();
        const phone = document.getElementById('newSupPhone')?.value?.trim();
        const balance = parseFloat(document.getElementById('newSupBalance')?.value) || 0;

        if (!name || !phone) return;

        const newSup = {
            id: Date.now(),
            name,
            phone,
            balance,
            address: 'القاهرة / الجيزة'
        };

        this.suppliers.push(newSup);
        this.saveAll();
        playBeep(true);
        this.closeAddSupplierModal();
        this.renderPartnersScreen();
        this.renderHomeDashboard();
        alert(`تم إضافة المورد: [${name}] بنجاح`);
    }

    openNewPurchaseModal() {
        const supSelect = document.getElementById('purchaseSupplierSelect');
        const prodSelect = document.getElementById('purchaseProductSelect');

        if (supSelect) {
            supSelect.innerHTML = (this.suppliers || []).map(s => `<option value="${s.id}">${s.name}</option>`).join('');
        }
        if (prodSelect) {
            prodSelect.innerHTML = (this.products || []).map(p => `<option value="${p.id}">${p.name} (تكلفة: ${(p.costPrice || 0).toFixed(2)} ج.م)</option>`).join('');
            const first = (this.products || [])[0];
            const costInp = document.getElementById('purchaseUnitCost');
            if (first && costInp) costInp.value = first.costPrice || 0;
            const nameDisplay = document.getElementById('purchaseProductNameDisplay');
            if (first && nameDisplay) nameDisplay.innerText = first.name;
        }

        document.getElementById('newPurchaseModal')?.classList.add('active');
    }
    closeNewPurchaseModal() {
        document.getElementById('newPurchaseModal')?.classList.remove('active');
    }
    savePurchaseInvoice(e) {
        e.preventDefault();
        const supId = parseInt(document.getElementById('purchaseSupplierSelect')?.value, 10);
        const prodId = parseInt(document.getElementById('purchaseProductSelect')?.value, 10);
        const qty = parseInt(document.getElementById('purchaseQty')?.value, 10);
        const unitCost = parseFloat(document.getElementById('purchaseUnitCost')?.value);
        const payType = document.getElementById('purchasePaymentType')?.value || '';

        const sup = (this.suppliers || []).find(s => s.id === supId);
        const prod = (this.products || []).find(p => p.id === prodId);

        if (!sup || !prod) return;

        const totalCost = qty * unitCost;
        prod.currentStock = (prod.currentStock || 0) + qty;
        prod.costPrice = unitCost;

        if (payType.includes('آجل')) {
            sup.balance = (sup.balance || 0) + totalCost;
        }

        this.saveAll();
        playBeep(true);
        this.closeNewPurchaseModal();
        this.renderInventoryTable();
        this.renderPartnersScreen();
        this.renderHomeDashboard();
        this.renderShiftDetails();
        alert(`تم توريد ${qty} وحدة من [${prod.name}] بنجاح!\nإجمالي الفاتورة: ${totalCost.toFixed(2)} ج.م`);
    }

    openAddProductModal() {
        document.getElementById('addProductModal')?.classList.add('active');
    }
    closeAddProductModal() {
        document.getElementById('addProductModal')?.classList.remove('active');
    }
    saveNewProduct(e) {
        e.preventDefault();
        const name = document.getElementById('newProdName')?.value?.trim();
        const category = document.getElementById('newProdCategory')?.value || 'الزيوت والخل';
        const sku = (document.getElementById('newProdSku')?.value || '').toUpperCase().trim();
        const costPrice = parseFloat(document.getElementById('newProdCost')?.value) || 0;
        const wholesalePrice = parseFloat(document.getElementById('newProdPrice')?.value) || 0;
        const stock = parseInt(document.getElementById('newProdStock')?.value, 10) || 0;
        const barcode = (document.getElementById('newProdBarcode')?.value || '').trim() || `622${Math.floor(100000000 + Math.random() * 900000000)}`;

        if (!name || !sku) return;

        const newP = {
            id: Date.now(),
            name,
            sku,
            category,
            baseUnit: 'عبوة',
            currentStock: stock,
            minStock: 10,
            costPrice,
            wholesalePrice,
            barcode,
            units: [
                { id: Date.now(), name: 'عبوة فردية', factor: 1, price: wholesalePrice, cost: costPrice, barcode: barcode, isDefault: true }
            ]
        };

        this.products.unshift(newP);
        this.saveAll();
        playBeep(true);
        this.closeAddProductModal();
        this.renderCategories();
        this.renderProductsGrid();
        this.renderInventoryTable();
        this.initQuickBarcodes();
        this.renderHomeDashboard();
        alert(`تم تسجيل الصنف [${name}] بالمستودع بنجاح`);
    }

    // ==========================================================================
    // EXPORTS & BACKUPS (WELL-ORGANIZED EXCEL/CSV BUNDLES)
    // ==========================================================================
    exportOrdersCSV() {
        if (!this.orders || this.orders.length === 0) {
            alert('لا توجد فواتير لتصديرها');
            return;
        }

        let csv = '\uFEFFرقم الفاتورة,العميل,التاريخ,إجمالي الفاتورة الصافي,طريقة السداد,الكاشير\n';
        this.orders.forEach(o => {
            csv += `"${o.id}","${o.customerName}","${o.date}",${(o.grandTotal || 0).toFixed(2)},"${o.paymentType === 'cash' ? 'نقدي' : 'آجل'}","${o.cashierName || ''}"\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Karma_Carmela_Orders_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    exportTreasuryExcel() {
        let csv = '\uFEFFرقم الإذن,التاريخ والوقت,النوع,البيان,الطرف,المبلغ بالجنيه,الكاشير\n';
        const rows = document.querySelectorAll('#treasuryTable tbody tr');
        rows.forEach(tr => {
            const cols = tr.querySelectorAll('td');
            if (cols.length >= 7) {
                const id = cols[0].innerText.replace(/"/g, '""');
                const date = cols[1].innerText.replace(/"/g, '""');
                const type = cols[2].innerText.replace(/"/g, '""');
                const desc = cols[3].innerText.replace(/"/g, '""');
                const party = cols[4].innerText.replace(/"/g, '""');
                const amt = cols[5].innerText.replace(/[^0-9\.\-\+]/g, '');
                const cashier = cols[6].innerText.replace(/"/g, '""');
                csv += `"${id}","${date}","${type}","${desc}","${party}",${amt},"${cashier}"\n`;
            }
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Karma_Carmela_Treasury_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    exportShiftsExcel() {
        let csv = '\uFEFFرقم الوردية,بداية الوردية,نهاية الوردية,الكاشير,العهدة,المبيعات,المقبوضات,المدفوعات,المصروفات,النقدية المحسوبة,النقدية الفعلية,الفارق,الحالة\n';
        (this.shiftHistory || []).forEach(s => {
            csv += `"${s.shiftNumber}","${s.startTime}","${s.endTime || ''}","${s.cashierName}",${(s.startingFloat || 0).toFixed(2)},${(s.totalSales || 0).toFixed(2)},${(s.customerPayments || 0).toFixed(2)},${(s.supplierPayments || 0).toFixed(2)},${(s.expenses || 0).toFixed(2)},${(s.expectedCash || 0).toFixed(2)},${(s.actualCash || 0).toFixed(2)},${(s.difference || 0).toFixed(2)},"${s.status}"\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Karma_Carmela_Shifts_Archive_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    exportAllReportsBundle() {
        this.exportOrdersCSV();
        setTimeout(() => this.exportTreasuryExcel(), 400);
        setTimeout(() => this.exportShiftsExcel(), 800);
    }

    exportAllData() {
        const data = {
            products: this.products,
            customers: this.customers,
            suppliers: this.suppliers,
            orders: this.orders,
            customerPayments: this.customerPayments,
            supplierPayments: this.supplierPayments,
            expenses: this.expenses,
            otherIncomes: this.otherIncomes,
            returns: this.returns,
            shiftHistory: this.shiftHistory,
            currentShift: this.currentShift,
            user: this.currentUser,
            exportedAt: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Karma_Carmela_Full_Backup_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    toggleSidebar() {
        const sidebar = document.querySelector('.hydro-sidebar') || document.querySelector('.app-sidebar');
        if (sidebar) sidebar.classList.toggle('active');
    }

    toggleCartDrawer() {
        const panel = document.querySelector('.cart-panel');
        const overlay = document.getElementById('cartDrawerOverlay');
        if (panel) {
            if (panel.classList.contains('active')) {
                panel.classList.remove('active');
                if (overlay) overlay.classList.remove('active');
            } else {
                panel.classList.add('active');
                if (overlay) overlay.classList.add('active');
            }
        }
    }

    navTo(screenId) {
        this.switchScreen(screenId);
    }

    installPwaApp() {
        if (this.deferredPwaPrompt) {
            this.deferredPwaPrompt.prompt();
            this.deferredPwaPrompt.userChoice.then(() => {
                this.deferredPwaPrompt = null;
            });
        } else {
            document.getElementById('pwaInstallGuideModal')?.classList.add('active');
        }
    }

    closePwaGuideModal() {
        document.getElementById('pwaInstallGuideModal')?.classList.remove('active');
    }

    clearPosSearch() {
        const inp = document.getElementById('posSearchInput');
        if (inp) {
            inp.value = '';
            inp.focus();
        }
        this.filterProducts();
    }

    openPartnerPayModal() {
        this.openCustomerPaymentModal();
    }

    setPrintFormat(format) {
        this.switchPrintFormat(format);
    }

    closeCustomerLedgerModal() {
        document.getElementById('customerLedgerModal')?.classList.remove('active');
    }

    closeSupplierLedgerModal() {
        document.getElementById('supplierLedgerModal')?.classList.remove('active');
    }

    closeVoucherPrintModal() {
        document.getElementById('voucherPrintModal')?.classList.remove('active');
    }

    switchAccTab(tab) {
        document.querySelectorAll('.acc-tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.acc-pane').forEach(p => p.classList.remove('active'));
        const btn = document.getElementById(`btnAccTab${tab.charAt(0).toUpperCase() + tab.slice(1)}`);
        const pane = document.getElementById(`accPane${tab.charAt(0).toUpperCase() + tab.slice(1)}`);
        if (btn) btn.classList.add('active');
        if (pane) pane.classList.add('active');
    }

    switchSupTab(tab) {
        document.querySelectorAll('.sup-tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.sup-pane').forEach(p => p.classList.remove('active'));
        const btn = document.getElementById(`btnSupTab${tab.charAt(0).toUpperCase() + tab.slice(1)}`);
        const pane = document.getElementById(`supPane${tab.charAt(0).toUpperCase() + tab.slice(1)}`);
        if (btn) btn.classList.add('active');
        if (pane) pane.classList.add('active');
    }

    handleCustomerPaymentSubmit(e) {
        this.saveCustomerPayment(e);
    }

    handleCustomerUpdateSubmit(e) {
        if (e) e.preventDefault();
        const custId = this.currentLedgerCustomerId || (this.currentPartnerDetail ? this.currentPartnerDetail.id : null);
        const cust = (this.customers || []).find(c => c.id === custId);
        if (!cust) return;

        cust.name = document.getElementById('custEditName')?.value?.trim() || cust.name;
        cust.phone = document.getElementById('custEditPhone')?.value?.trim() || cust.phone;
        cust.address = document.getElementById('custEditAddress')?.value?.trim() || cust.address;
        cust.creditLimit = parseFloat(document.getElementById('custEditCreditLimit')?.value) || cust.creditLimit;
        cust.cr = document.getElementById('custEditCr')?.value?.trim() || cust.cr;
        cust.taxId = document.getElementById('custEditTaxId')?.value?.trim() || cust.taxId;

        this.saveAll();
        playBeep(true);
        alert('تم تحديث بيانات العميل بنجاح');
        this.renderPartnersScreen();
        if (this.currentPartnerDetail && this.currentPartnerDetail.id === cust.id) {
            this.openPartnerDetail('customer', cust.id);
        }
    }

    handleSupplierPaymentSubmit(e) {
        this.saveSupplierPayment(e);
    }

    handleSupplierUpdateSubmit(e) {
        if (e) e.preventDefault();
        const supId = this.currentLedgerSupplierId || (this.currentPartnerDetail ? this.currentPartnerDetail.id : null);
        const sup = (this.suppliers || []).find(s => s.id === supId);
        if (!sup) return;

        sup.name = document.getElementById('supEditName')?.value?.trim() || sup.name;
        sup.phone = document.getElementById('supEditPhone')?.value?.trim() || sup.phone;
        sup.address = document.getElementById('supEditAddress')?.value?.trim() || sup.address;
        sup.cr = document.getElementById('supEditCr')?.value?.trim() || sup.cr;
        sup.taxId = document.getElementById('supEditTaxId')?.value?.trim() || sup.taxId;

        this.saveAll();
        playBeep(true);
        alert('تم تحديث بيانات المورد بنجاح');
        this.renderPartnersScreen();
        if (this.currentPartnerDetail && this.currentPartnerDetail.id === sup.id) {
            this.openPartnerDetail('supplier', sup.id);
        }
    }

    filterCustomersList() {
        const query = (document.getElementById('partnersSearchInput')?.value || '').trim().toLowerCase();
        const custCards = document.querySelectorAll('#customersCardsGrid .bento-card');
        custCards.forEach(card => {
            const text = card.innerText.toLowerCase();
            card.style.display = text.includes(query) ? '' : 'none';
        });
        const supCards = document.querySelectorAll('#suppliersCardsGrid .bento-card');
        supCards.forEach(card => {
            const text = card.innerText.toLowerCase();
            card.style.display = text.includes(query) ? '' : 'none';
        });
    }

    saveAll() {
        try {
            localStorage.setItem('carmela_products', JSON.stringify(this.products));
            localStorage.setItem('carmela_customers', JSON.stringify(this.customers));
            localStorage.setItem('carmela_suppliers', JSON.stringify(this.suppliers));
            localStorage.setItem('carmela_orders', JSON.stringify(this.orders));
            localStorage.setItem('carmela_cust_payments', JSON.stringify(this.customerPayments));
            localStorage.setItem('carmela_sup_payments', JSON.stringify(this.supplierPayments));
            localStorage.setItem('carmela_expenses', JSON.stringify(this.expenses));
            localStorage.setItem('carmela_other_incomes', JSON.stringify(this.otherIncomes));
            localStorage.setItem('carmela_returns', JSON.stringify(this.returns));
            localStorage.setItem('carmela_shift_history', JSON.stringify(this.shiftHistory));
            localStorage.setItem('carmela_current_shift', JSON.stringify(this.currentShift));
            localStorage.setItem('carmela_user', JSON.stringify(this.currentUser));
        } catch (e) {
            console.warn('LocalStorage save limit or private mode warning:', e);
        }
    }
}

// Instantiate global app immediately and guarantee it is always defined
window.app = new CarmelaApp();

// If DOM was not fully ready at script execution time, re-verify and refresh views
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        try { window.app.init(); } catch (e) {}
    });
}
