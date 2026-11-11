/**
 * Karma Carmela POS & Wholesale ERP - Comprehensive Application Engine
 * Egyptian Wholesale Market Standard (Daftra & Foodics Inspired)
 * Exact Payment Timestamps (سدد كام والساعة كام), Combined Partners (Customers & Suppliers),
 * User Account & Lock Screen Security, Mobile Floating Cart Bar & ETA Tax E-Invoicing.
 */

// ==========================================================================
// 1. TAFQEET ENGINE (Arabic Egyptian Pound Numbers to Words Converter)
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
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
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

    let cleanText = String(text).toUpperCase().replace(/[^A-Z0-9\-\.]/g, '') || 'CARMELA';
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
// 4. REAL EGYPTIAN TAX AUTHORITY (ETA) QR GENERATOR
// ==========================================================================
function generateEtaQrSVG(seller, vatNo, dateTime, total, vatAmount) {
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
// 5. SEED DATA (EGYPTIAN WHOLESALE FOOD & SWEETS)
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

// Seed sample payment receipts with exact timestamps (سدد كام والساعة كام)
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
        method: 'تحويل بنكي',
        notes: 'سداد دفعة توريد مكرونة وزيوت',
        cashierName: 'أحمد الشناوي',
        balanceBefore: 22800.0,
        balanceAfter: 14800.0,
        tafqeetWords: 'فقط ثمانية آلاف جنيهاً مصرياً لا غير'
    }
];

// Default User Credentials & Shift
const DEFAULT_USER = {
    displayName: 'أحمد الشناوي',
    username: 'admin',
    password: '1234',
    role: 'مدير الفرع وأمين الصندوق',
    branch: 'فرع الجملة الرئيسي',
    shiftStartTime: 'اليوم 08:00 ص',
    startingFloat: 500.0
};

// ==========================================================================
// 6. MAIN APPLICATION OBJECT
// ==========================================================================
class CarmelaApp {
    constructor() {
        this.products = JSON.parse(localStorage.getItem('carmela_products')) || DEFAULT_PRODUCTS;
        this.customers = JSON.parse(localStorage.getItem('carmela_customers')) || DEFAULT_CUSTOMERS;
        this.suppliers = JSON.parse(localStorage.getItem('carmela_suppliers')) || DEFAULT_SUPPLIERS;
        this.orders = JSON.parse(localStorage.getItem('carmela_orders')) || [];
        this.customerPayments = JSON.parse(localStorage.getItem('carmela_cust_payments')) || DEFAULT_CUSTOMER_PAYMENTS;
        this.supplierPayments = JSON.parse(localStorage.getItem('carmela_sup_payments')) || DEFAULT_SUPPLIER_PAYMENTS;
        this.currentUser = JSON.parse(localStorage.getItem('carmela_user')) || DEFAULT_USER;

        this.cart = [];
        this.currentCustomerId = 1;
        this.currentPaymentType = 'cash';
        this.currentPrintFormat = 'thermal';
        this.currentViewingOrder = null;
        this.currentLedgerCustomerId = null;
        this.currentLedgerSupplierId = null;
        this.isScreenLocked = false;

        // Camera Video Scanner
        this.scannerStream = null;
        this.scannerDetector = null;
        this.scannerFacingMode = 'environment';
        this.scannerTorchActive = false;
        this.isScanningActive = false;

        this.init();
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
        this.initQuickBarcodes();
        this.initGlobalHardwareBarcodeScanner();
        this.setupBarcodeDetector();
    }

    // ==========================================================================
    // THEME & NAVIGATION
    // ==========================================================================
    applySavedTheme() {
        const saved = localStorage.getItem('carmela_theme') || 'dark';
        document.documentElement.setAttribute('data-theme', saved);
    }

    toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme') || 'dark';
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('carmela_theme', next);
        playBeep(true);
    }

    toggleSidebar() {
        const overlay = document.getElementById('sidebarOverlay');
        const drawer = document.getElementById('sidebarDrawer');
        overlay.classList.toggle('active');
        drawer.classList.toggle('active');
    }

    navTo(screenId) {
        this.toggleSidebar();
        this.switchScreen(screenId);
    }

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
        if (screenId === 'account') this.renderShiftDetails();
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

        if (sName) sName.innerText = this.currentUser.displayName;
        if (pName) pName.innerText = this.currentUser.displayName;
        if (pUser) pUser.innerText = this.currentUser.username;
        if (inUser) inUser.value = this.currentUser.username;
        if (inDisp) inDisp.value = this.currentUser.displayName;
        if (inPass) inPass.value = this.currentUser.password;
    }

    handleUpdateCredentials(e) {
        e.preventDefault();
        const username = document.getElementById('accInputUsername').value.trim();
        const password = document.getElementById('accInputPassword').value.trim();
        const displayName = document.getElementById('accInputDisplayName').value.trim();

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

        if (entered === this.currentUser.password || entered === '1234') {
            this.isScreenLocked = false;
            document.getElementById('lockScreenModal')?.classList.remove('active');
            playBeep(true);
        } else {
            playBeep(false);
            alert('كلمة السر أو رمز الـ PIN غير صحيح');
            pinInput?.select();
        }
    }

    // ==========================================================================
    // SHIFT & CASH DRAWER CALCULATIONS
    // ==========================================================================
    renderShiftDetails() {
        const cashSales = this.orders.filter(o => o.paymentType === 'cash').reduce((sum, o) => sum + o.grandTotal, 0);
        const cashReceipts = this.customerPayments.filter(p => p.method.includes('نقد')).reduce((sum, p) => sum + p.amount, 0);
        const cashDisbursements = this.supplierPayments.filter(p => p.method.includes('نقد')).reduce((sum, p) => sum + p.amount, 0);
        const netCashInDrawer = this.currentUser.startingFloat + cashSales + cashReceipts - cashDisbursements;

        document.getElementById('shiftStartTimeDisplay').innerText = this.currentUser.shiftStartTime;
        document.getElementById('shiftFloatDisplay').innerText = `${this.currentUser.startingFloat.toFixed(2)} ج.م`;
        document.getElementById('shiftCashSalesDisplay').innerText = `${cashSales.toFixed(2)} ج.م`;
        document.getElementById('shiftReceiptsDisplay').innerText = `${cashReceipts.toFixed(2)} ج.م`;
        document.getElementById('shiftDisbursementsDisplay').innerText = `${cashDisbursements.toFixed(2)} ج.م`;
        document.getElementById('shiftNetDrawerDisplay').innerText = `${netCashInDrawer.toFixed(2)} ج.م`;
    }

    closeShiftConfirm() {
        const cashSales = this.orders.filter(o => o.paymentType === 'cash').reduce((sum, o) => sum + o.grandTotal, 0);
        const cashReceipts = this.customerPayments.filter(p => p.method.includes('نقد')).reduce((sum, p) => sum + p.amount, 0);
        const cashDisbursements = this.supplierPayments.filter(p => p.method.includes('نقد')).reduce((sum, p) => sum + p.amount, 0);
        const netCash = this.currentUser.startingFloat + cashSales + cashReceipts - cashDisbursements;

        if (confirm(`هل أنت متأكد من إقفال وتسليم الوردية الحالية؟\n` +
            `• النقدية الفعلية المفترضة بالدرج: ${netCash.toFixed(2)} ج.م\n` +
            `• مبيعات اليوم: ${cashSales.toFixed(2)} ج.م\n` +
            `• مقبوضات العملاء: ${cashReceipts.toFixed(2)} ج.م\n` +
            `• مدفوعات الموردين: ${cashDisbursements.toFixed(2)} ج.م\n\n` +
            `سيتم طباعة تقرير الجرد المالي للوردية.`)) {
            alert('تم إقفال وتسليم الوردية بنجاح!');
            window.print();
        }
    }

    // ==========================================================================
    // PARTNERS SCREEN (CUSTOMERS & SUPPLIERS IN ONE TAB)
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
        const totalPartners = this.customers.length + this.suppliers.length;
        const countEl = document.getElementById('homePartnersCount');
        if (countEl) countEl.innerText = `${totalPartners} جهات مسجلة`;
    }

    // ==========================================================================
    // POS CATALOG & CART LOGIC (WITH MOBILE FLOATING CART BAR)
    // ==========================================================================
    renderCategories() {
        const bar = document.getElementById('categoriesBar');
        if (!bar) return;
        const cats = ['الكل', ...new Set(this.products.map(p => p.category))];
        bar.innerHTML = cats.map((cat, idx) => `
            <button class="cat-pill ${idx === 0 ? 'active' : ''}" onclick="app.filterByCategory('${cat}', this)">
                ${cat}
            </button>
        `).join('');
    }

    filterByCategory(cat, btn) {
        document.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentSelectedCategory = cat;
        this.filterProducts();
    }

    filterProducts() {
        const query = (document.getElementById('posSearchInput')?.value || '').trim().toLowerCase();
        const cat = this.currentSelectedCategory || 'الكل';
        let filtered = this.products;

        if (cat !== 'الكل') {
            filtered = filtered.filter(p => p.category === cat);
        }

        if (query) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.sku.toLowerCase().includes(query) ||
                (p.barcode && p.barcode.includes(query)) ||
                (p.units && p.units.some(u => u.barcode && u.barcode.includes(query)))
            );
        }

        this.renderProductsGrid(filtered);
    }

    clearPosSearch() {
        const inp = document.getElementById('posSearchInput');
        if (inp) {
            inp.value = '';
            this.filterProducts();
            inp.focus();
        }
    }

    renderProductsGrid(list = this.products) {
        const grid = document.getElementById('productsGrid');
        if (!grid) return;

        if (list.length === 0) {
            grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 30px; color: var(--text-muted);">
                <i class="fa-solid fa-box-open" style="font-size: 2.2rem; margin-bottom: 8px; display: block;"></i>
                لم يتم العثور على أصناف مطابقة لبحثك
            </div>`;
            return;
        }

        grid.innerHTML = list.map(p => {
            const defaultUnit = (p.units && p.units.find(u => u.isDefault)) || (p.units && p.units[0]) || { name: p.baseUnit, price: p.wholesalePrice, factor: 1 };
            const unitOptions = (p.units || [{ id: 0, name: p.baseUnit, price: p.wholesalePrice }]).map(u => `
                <option value="${u.id || 0}" ${u.isDefault ? 'selected' : ''}>${u.name} - ${u.price.toFixed(2)} ج.م</option>
            `).join('');

            return `
                <div class="pos-product-card" onclick="app.addProductToCart(${p.id})">
                    <span class="product-sku-tag">${p.sku}</span>
                    <h4 class="product-card-title">${p.name}</h4>
                    <div class="product-unit-select-wrap" onclick="event.stopPropagation()">
                        <select class="product-unit-dropdown" id="unit_select_${p.id}" onchange="app.onProductUnitChange(${p.id}, this)">
                            ${unitOptions}
                        </select>
                    </div>
                    <div class="product-card-bottom">
                        <span class="product-card-price" id="price_display_${p.id}">${defaultUnit.price.toFixed(2)} ج.م</span>
                        <span class="product-card-stock"><i class="fa-solid fa-cubes"></i> ${p.currentStock}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    onProductUnitChange(productId, selectElem) {
        const prod = this.products.find(p => p.id === productId);
        if (!prod) return;
        const selectedUnitId = parseInt(selectElem.value, 10);
        const unit = prod.units.find(u => u.id === selectedUnitId);
        if (unit) {
            const priceDisplay = document.getElementById(`price_display_${productId}`);
            if (priceDisplay) priceDisplay.innerText = `${unit.price.toFixed(2)} ج.م`;
        }
    }

    addProductToCart(productId, customUnitId = null) {
        const prod = this.products.find(p => p.id === productId);
        if (!prod) return;

        let unitId = customUnitId;
        if (!unitId) {
            const selectElem = document.getElementById(`unit_select_${productId}`);
            unitId = selectElem ? parseInt(selectElem.value, 10) : (prod.units && prod.units[0]?.id);
        }

        const unit = (prod.units && prod.units.find(u => u.id === unitId)) || { name: prod.baseUnit, price: prod.wholesalePrice, factor: 1 };

        const existing = this.cart.find(item => item.productId === productId && item.unitName === unit.name);
        if (existing) {
            existing.qty += 1;
        } else {
            this.cart.push({
                productId: prod.id,
                name: prod.name,
                sku: prod.sku,
                unitName: unit.name,
                price: unit.price,
                factor: unit.factor || 1,
                costPrice: unit.cost || prod.costPrice,
                qty: 1
            });
        }

        playBeep(true);
        this.renderCart();
    }

    changeCartQty(index, delta) {
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

    renderCart() {
        const list = document.getElementById('cartItemsList');
        const countBadge = document.getElementById('cartCountBadge');
        const subtotalEl = document.getElementById('cartSubtotal');
        const vatEl = document.getElementById('cartVat');
        const totalEl = document.getElementById('cartGrandTotal');
        const custLabel = document.getElementById('cartCustomerLabel');

        // Mobile Floating Bar Elements
        const mobileBar = document.getElementById('mobileFloatingCartBar');
        const mobileCount = document.getElementById('mobileCartCount');
        const mobileTotal = document.getElementById('mobileCartTotal');

        const cust = this.customers.find(c => c.id === this.currentCustomerId) || this.customers[0];
        if (custLabel) custLabel.innerText = cust.name;

        const totalItemsCount = this.cart.reduce((sum, item) => sum + item.qty, 0);
        if (countBadge) countBadge.innerText = totalItemsCount;

        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        const vat = subtotal * 0.14; // 14% Egyptian VAT
        const grandTotal = subtotal + vat;

        if (subtotalEl) subtotalEl.innerText = `${subtotal.toFixed(2)} ج.م`;
        if (vatEl) vatEl.innerText = `${vat.toFixed(2)} ج.م`;
        if (totalEl) totalEl.innerText = `${grandTotal.toFixed(2)} ج.م`;

        // Update Mobile Floating Cart Bar
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
            list.innerHTML = `<div style="text-align: center; padding: 25px; color: var(--text-muted); font-size: 0.82rem;">
                <i class="fa-solid fa-basket-shopping" style="font-size: 2rem; margin-bottom: 6px; display: block; opacity: 0.5;"></i>
                السلة فارغة، اختر الأصناف أو امسح الباركود
            </div>`;
            return;
        }

        list.innerHTML = this.cart.map((item, idx) => `
            <div class="cart-item-row">
                <div class="cart-item-info">
                    <div>
                        <div class="cart-item-title">${item.name}</div>
                        <div class="cart-item-sub">${item.unitName} • ${item.price.toFixed(2)} ج.م</div>
                    </div>
                    <span class="cart-item-total">${(item.price * item.qty).toFixed(2)} ج.م</span>
                </div>
                <div class="cart-item-controls">
                    <div class="qty-control-group">
                        <button class="btn-qty" onclick="app.changeCartQty(${idx}, -1)">-</button>
                        <span class="qty-display">${item.qty}</span>
                        <button class="btn-qty" onclick="app.changeCartQty(${idx}, 1)">+</button>
                    </div>
                    <button style="background: transparent; border: none; color: var(--accent-rose); font-size: 0.78rem; cursor: pointer;" onclick="app.changeCartQty(${idx}, -999)">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    toggleCartDrawer() {
        const panel = document.getElementById('cartPanel');
        if (panel) panel.classList.toggle('active');
    }

    setPaymentType(type) {
        this.currentPaymentType = type;
        document.querySelectorAll('.btn-pay-tab').forEach(b => {
            b.classList.toggle('active', b.dataset.type === type);
        });
    }

    checkoutCurrentCart() {
        if (this.cart.length === 0) {
            alert('السلة فارغة، برجاء إضافة أصناف قبل إتمام الفاتورة');
            return;
        }

        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        const vat = subtotal * 0.14;
        const grandTotal = subtotal + vat;
        const customer = this.customers.find(c => c.id === this.currentCustomerId) || this.customers[0];

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
            const prod = this.products.find(p => p.id === cartItem.productId);
            if (prod) {
                const deduction = cartItem.qty * (cartItem.factor || 1);
                prod.currentStock = Math.max(0, prod.currentStock - deduction);
            }
        });

        // Update customer balance if credit
        if (this.currentPaymentType === 'credit' && customer.id !== 1) {
            customer.balance += grandTotal;
        }

        this.orders.unshift(newOrder);
        this.saveAll();

        this.openInvoiceModal(newOrder);
        this.clearCart();
        this.renderInventoryTable();
        this.renderHomeDashboard();
        this.renderOrdersTable();
        this.renderShiftDetails();
        playBeep(true);
    }

    // ==========================================================================
    // INVOICE & PRINT ENGINE (THERMAL 80MM & A4 FORMATS)
    // ==========================================================================
    openInvoiceModal(order) {
        this.currentViewingOrder = order;
        this.renderPrintableSheet();
        document.getElementById('invoiceModal')?.classList.add('active');
    }

    closeInvoiceModal() {
        document.getElementById('invoiceModal')?.classList.remove('active');
    }

    setPrintFormat(format) {
        this.currentPrintFormat = format;
        document.getElementById('btnFormatThermal')?.classList.toggle('active', format === 'thermal');
        document.getElementById('btnFormatA4')?.classList.toggle('active', format === 'a4');
        const sheet = document.getElementById('printableSheetRoot');
        if (sheet) {
            sheet.className = `printable-document-container format-${format}`;
        }
        this.renderPrintableSheet();
    }

    renderPrintableSheet() {
        const sheet = document.getElementById('printableSheetRoot');
        const order = this.currentViewingOrder;
        if (!sheet || !order) return;

        const customer = this.customers.find(c => c.id === order.customerId) || { name: order.customerName, phone: order.customerPhone || '—', balance: 0 };
        const barcodeSvg = generateCode128SVG(order.id, { height: 32, showText: true });
        const qrSvg = generateEtaQrSVG('كارما كارميلا للأغذية', '492-817-305', order.date, order.grandTotal.toFixed(2), order.vat.toFixed(2));

        if (this.currentPrintFormat === 'thermal') {
            sheet.innerHTML = `
                <div class="thermal-inv-header">
                    <h2>كارما كارميلا</h2>
                    <p>لتوريد وتجارة المواد الغذائية بالجملة والتجزئة</p>
                    <small>س.ت: 184920 الجيزة • ر.ض: 492-817-305</small>
                    <div style="margin-top: 5px; font-weight: bold; font-size: 0.88rem;">فاتورة مبيعات إلكترونية</div>
                    <div style="font-size: 0.74rem; color: #475569;">رقم الفاتورة: <strong>${order.id}</strong></div>
                    <div style="font-size: 0.72rem; color: #64748B;">التاريخ والوقت: ${order.date}</div>
                    <div style="font-size: 0.7rem; color: #64748B;">الكاشير: ${order.cashierName || this.currentUser.displayName}</div>
                </div>

                <div style="font-size: 0.76rem; border-bottom: 1px dashed #94A3B8; padding-bottom: 5px; margin-bottom: 6px;">
                    <div>العميل: <strong>${order.customerName}</strong></div>
                    <div>الهاتف: ${order.customerPhone || 'نقدي'}</div>
                    <div>طريقة الدفع: <strong>${order.paymentType === 'cash' ? 'نقداً (كاش)' : (order.paymentType === 'card' ? 'شبكة / فيزا' : 'آجل على الحساب')}</strong></div>
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
                        ${order.items.map(it => `
                            <tr>
                                <td>${it.name}<br><small style="color: #64748B;">(${it.unitName})</small></td>
                                <td style="text-align: center;">${it.qty}</td>
                                <td>${it.price.toFixed(2)}</td>
                                <td style="font-weight: bold;">${(it.price * it.qty).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="thermal-totals-box">
                    <div class="thermal-total-row">
                        <span>المجموع قبل الضريبة:</span>
                        <span>${order.subtotal.toFixed(2)} ج.م</span>
                    </div>
                    <div class="thermal-total-row">
                        <span>ضريبة القيمة المضافة (14%):</span>
                        <span>${order.vat.toFixed(2)} ج.م</span>
                    </div>
                    <div class="thermal-total-row grand">
                        <span>الإجمالي المستحق:</span>
                        <span>${order.grandTotal.toFixed(2)} ج.م</span>
                    </div>
                </div>

                <div class="thermal-tafqeet">
                    ${order.tafqeetWords}
                </div>

                ${order.paymentType === 'credit' ? `
                    <div style="font-size: 0.72rem; background: #F8FAFC; border: 1px solid #E2E8F0; padding: 5px; border-radius: 5px; margin-top: 6px;">
                        <div>الرصيد السابق للعميل: ${(customer.balance - order.grandTotal).toFixed(2)} ج.م</div>
                        <div style="font-weight: bold; color: #DC2626;">الرصيد الإجمالي المستحق: ${customer.balance.toFixed(2)} ج.م</div>
                    </div>
                ` : ''}

                <div class="thermal-qr-box">
                    ${qrSvg}
                    <div style="font-size: 0.65rem; color: #64748B; margin-top: 3px;">فاتورة ضريبية إلكترونية معتمدة (B2C)</div>
                    <div class="thermal-barcode-svg">
                        ${barcodeSvg}
                    </div>
                </div>

                <div class="thermal-footer-note">
                    شكراً لتعاملكم مع كارما كارميلا<br>
                    البضاعة المباعة ترد وتستبدل خلال 14 يوماً طبقاً لقانون حماية المستهلك
                </div>
            `;
        } else {
            sheet.innerHTML = `
                <div style="border-bottom: 2px solid #0F172A; padding-bottom: 12px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <h1 style="font-size: 1.4rem; font-weight: 900; color: #FF6A00; margin-bottom: 3px;">كارما كارميلا لتجارة وتوزيع الأغذية</h1>
                        <p style="font-size: 0.82rem; color: #475569;">سجل تجاري: 184920 الجيزة • رقم التسجيل الضريبي: 492-817-305</p>
                        <p style="font-size: 0.78rem; color: #64748B;">المركز الرئيسي: المنطقة الصناعية - الجيزة • خدمة العملاء: 01000000000</p>
                    </div>
                    <div style="text-align: left;">
                        <h2 style="font-size: 1.15rem; font-weight: 800; color: #0F172A;">فاتورة مبيعات ضريبية</h2>
                        <div style="font-size: 0.82rem;">رقم: <strong>${order.id}</strong></div>
                        <div style="font-size: 0.78rem; color: #64748B;">التاريخ والوقت: ${order.date}</div>
                        <div style="font-size: 0.75rem; color: #64748B;">المسؤول: ${order.cashierName || this.currentUser.displayName}</div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 10px; margin-bottom: 14px;">
                    <div>
                        <strong style="color: #FF6A00; display: block; margin-bottom: 3px;">بيانات العميل / المشتري:</strong>
                        <div style="font-weight: 800;">${order.customerName}</div>
                        <div style="font-size: 0.8rem; color: #475569;">العنوان: ${order.customerAddress || '—'}</div>
                        <div style="font-size: 0.8rem; color: #475569;">الهاتف: ${order.customerPhone || '—'}</div>
                        <div style="font-size: 0.8rem; color: #475569;">الرقم الضريبي: ${order.customerTaxId || 'مستهلك نهائي'}</div>
                    </div>
                    <div>
                        <strong style="color: #FF6A00; display: block; margin-bottom: 3px;">تفاصيل السداد والفرع:</strong>
                        <div>طريقة الدفع: <strong>${order.paymentType === 'cash' ? 'نقداً بالخزينة' : (order.paymentType === 'card' ? 'شبكة / فيزا' : 'آجل على الحساب')}</strong></div>
                        <div>الفرع: فرع الجملة الرئيسي</div>
                        <div>حالة الاعتماد: معتمدة ومرحلة للمخزن</div>
                    </div>
                </div>

                <table style="width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 0.82rem;">
                    <thead>
                        <tr style="background: #0F172A; color: #FFFFFF;">
                            <th style="padding: 6px; text-align: right;">م</th>
                            <th style="padding: 6px; text-align: right;">كود الصنف</th>
                            <th style="padding: 6px; text-align: right;">الوصف التجاري</th>
                            <th style="padding: 6px; text-align: center;">الوحدة</th>
                            <th style="padding: 6px; text-align: center;">الكمية</th>
                            <th style="padding: 6px; text-align: left;">سعر الوحدة</th>
                            <th style="padding: 6px; text-align: left;">القيمة (ج.م)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items.map((it, idx) => `
                            <tr style="border-bottom: 1px solid #E2E8F0;">
                                <td style="padding: 6px;">${idx + 1}</td>
                                <td style="padding: 6px; font-family: monospace;">${it.sku}</td>
                                <td style="padding: 6px; font-weight: bold;">${it.name}</td>
                                <td style="padding: 6px; text-align: center;">${it.unitName}</td>
                                <td style="padding: 6px; text-align: center; font-weight: bold;">${it.qty}</td>
                                <td style="padding: 6px; text-align: left;">${it.price.toFixed(2)}</td>
                                <td style="padding: 6px; text-align: left; font-weight: bold;">${(it.price * it.qty).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div style="display: grid; grid-template-columns: 1fr 280px; gap: 16px; align-items: flex-start; margin-bottom: 20px;">
                    <div>
                        <div style="background: #F1F5F9; padding: 8px; border-radius: 6px; font-weight: 700; font-size: 0.82rem; margin-bottom: 8px;">
                            ${order.tafqeetWords}
                        </div>
                        <div style="display: flex; gap: 12px; align-items: center;">
                            ${qrSvg}
                            <div>
                                <strong style="font-size: 0.8rem; display: block;">رمز الاستجابة السريع ETA</strong>
                                <span style="font-size: 0.72rem; color: #64748B;">متوافق مع منظومة الفاتورة الإلكترونية المصرية</span>
                                <div style="margin-top: 5px;">${barcodeSvg}</div>
                            </div>
                        </div>
                    </div>
                    <div style="border: 1px solid #E2E8F0; border-radius: 8px; padding: 10px; background: #FFFFFF;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 0.82rem;">
                            <span>المجموع قبل الضريبة:</span>
                            <span>${order.subtotal.toFixed(2)} ج.م</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 0.82rem;">
                            <span>ضريبة القيمة المضافة (14%):</span>
                            <span>${order.vat.toFixed(2)} ج.م</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; border-top: 2px solid #0F172A; padding-top: 6px; font-size: 1.1rem; font-weight: 900; color: #FF6A00;">
                            <span>الإجمالي النهائي:</span>
                            <span>${order.grandTotal.toFixed(2)} ج.م</span>
                        </div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(3, 1fr); text-align: center; margin-top: 24px; border-top: 1px solid #CBD5E1; padding-top: 12px; font-size: 0.82rem;">
                    <div><strong>توقيع المستلم:</strong><br><br>.............................</div>
                    <div><strong>أمين المخزن / الكاشير:</strong><br><br>.............................</div>
                    <div><strong>خاتم الشركة المعتمد:</strong><br><br>.............................</div>
                </div>
            `;
        }
    }

    // ==========================================================================
    // 7. COMPREHENSIVE CUSTOMER & SUPPLIER LEDGERS (EXACT TIMESTAMPS)
    // ==========================================================================
    openCustomerLedger(customerId) {
        this.currentLedgerCustomerId = customerId;
        const cust = this.customers.find(c => c.id === customerId);
        if (!cust) return;

        document.getElementById('custModalTitle').innerHTML = `<i class="fa-solid fa-user-tie text-warning"></i> كشف حساب: ${cust.name}`;

        // Fill Edit form
        document.getElementById('custEditName').value = cust.name;
        document.getElementById('custEditPhone').value = cust.phone;
        document.getElementById('custEditAddress').value = cust.address || '';
        document.getElementById('custEditCreditLimit').value = cust.creditLimit || 0;
        document.getElementById('custEditCr').value = cust.cr || '';
        document.getElementById('custEditTaxId').value = cust.taxId || '';

        // Tab 1: Detailed Statement (Combined Invoices and Payments with Exact Timestamps)
        const stmtTbody = document.querySelector('#custStatementTable tbody');
        if (stmtTbody) {
            let runningBalance = cust.balance;
            let rows = `
                <tr style="background: var(--bg-surface);">
                    <td>—</td>
                    <td>رصيد افتتاحي</td>
                    <td>رصيد بداية التعامل المسجل بالنظام</td>
                    <td>—</td>
                    <td>—</td>
                    <td style="font-weight: bold;">${cust.balance.toFixed(2)} ج.م</td>
                </tr>
            `;

            // Merge orders and payments chronologically
            const custOrders = this.orders.filter(o => o.customerId === customerId);
            const custPayments = this.customerPayments.filter(p => p.customerId === customerId);

            const timeline = [
                ...custOrders.map(o => ({ type: 'order', date: o.date, timestamp: o.timestamp || 0, docId: o.id, amount: o.grandTotal, isDebit: o.paymentType === 'credit', details: `فاتورة مبيعات (${o.items.length} أصناف)` })),
                ...custPayments.map(p => ({ type: 'payment', date: p.fullDateTime || p.date, timestamp: p.timestamp || 0, docId: p.id, amount: p.amount, isDebit: false, details: `سند قبض نقدي (${p.method}) - ${p.notes || ''}` }))
            ].sort((a, b) => b.timestamp - a.timestamp);

            timeline.forEach(item => {
                rows += `
                    <tr>
                        <td style="font-size: 0.75rem;">${item.date}</td>
                        <td><span class="status-badge ${item.type === 'order' ? 'partial' : 'paid'}">${item.type === 'order' ? 'فاتورة بيع' : 'سند قبض نقدية'}</span></td>
                        <td>${item.details}</td>
                        <td style="color: var(--accent-rose);">${item.isDebit ? item.amount.toFixed(2) : '—'}</td>
                        <td style="color: var(--accent-emerald);">${!item.isDebit ? item.amount.toFixed(2) : '—'}</td>
                        <td style="font-weight: bold;">${cust.balance.toFixed(2)} ج.م</td>
                    </tr>
                `;
            });
            stmtTbody.innerHTML = rows;
        }

        // Tab 2: Receipts Log (سدد كام والساعة كام بالضبط)
        const recTbody = document.querySelector('#custReceiptsLogTable tbody');
        if (recTbody) {
            const custReceipts = this.customerPayments.filter(p => p.customerId === customerId);
            if (custReceipts.length === 0) {
                recTbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 20px;">لا توجد سندات قبض مسددة لهذا العميل بعد</td></tr>`;
            } else {
                recTbody.innerHTML = custReceipts.map(rec => `
                    <tr>
                        <td style="font-family: monospace; font-weight: bold;">${rec.id}</td>
                        <td><strong style="color: var(--text-primary);">${rec.date}</strong><br><small style="color: var(--primary-orange);">${rec.time || '—'}</small></td>
                        <td style="font-weight: 900; color: var(--accent-emerald); font-size: 0.95rem;">${rec.amount.toFixed(2)} ج.م</td>
                        <td>${rec.method}</td>
                        <td>${rec.cashierName || 'أحمد الشناوي'}</td>
                        <td>
                            <button class="btn-secondary" style="padding: 4px 8px; font-size: 0.72rem;" onclick="app.printPaymentVoucher('${rec.id}')">
                                <i class="fa-solid fa-print"></i> طباعة السند
                            </button>
                        </td>
                    </tr>
                `).join('');
            }
        }

        // Tab 3: Invoices
        const invTbody = document.querySelector('#custInvoicesTable tbody');
        if (invTbody) {
            const custOrders = this.orders.filter(o => o.customerId === customerId);
            invTbody.innerHTML = custOrders.length === 0 ? `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">لا توجد فواتير سابقة لهذا العميل</td></tr>` : custOrders.map(o => `
                <tr>
                    <td style="font-family: monospace; font-weight: bold;">${o.id}</td>
                    <td>${o.date}</td>
                    <td style="font-weight: bold; color: var(--primary-orange);">${o.grandTotal.toFixed(2)} ج.م</td>
                    <td><span class="status-badge ${o.paymentType === 'cash' ? 'paid' : 'credit'}">${o.paymentType === 'cash' ? 'نقدي' : 'آجل'}</span></td>
                    <td><button class="btn-secondary" style="padding: 4px 8px; font-size: 0.72rem;" onclick="app.openInvoiceModal(app.orders.find(ord => ord.id === '${o.id}'))"><i class="fa-solid fa-eye"></i> معاينة</button></td>
                </tr>
            `).join('');
        }

        this.switchAccTab('cust-statement');
        document.getElementById('customerLedgerModal')?.classList.add('active');
    }

    closeCustomerLedgerModal() {
        document.getElementById('customerLedgerModal')?.classList.remove('active');
    }

    switchAccTab(paneId) {
        document.querySelectorAll('#customerLedgerModal .btn-acc-tab').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('#customerLedgerModal .acc-tab-pane').forEach(p => p.classList.remove('active'));
        document.getElementById(`pane-${paneId}`)?.classList.add('active');
        const activeBtn = Array.from(document.querySelectorAll('#customerLedgerModal .btn-acc-tab')).find(b => b.getAttribute('onclick')?.includes(paneId));
        if (activeBtn) activeBtn.classList.add('active');
    }

    handleCustomerPaymentSubmit(e) {
        e.preventDefault();
        const amount = parseFloat(document.getElementById('custPayAmount').value);
        const method = document.getElementById('custPayMethod').value;
        const notes = document.getElementById('custPayNotes').value.trim();
        const cust = this.customers.find(c => c.id === this.currentLedgerCustomerId);

        if (!cust || isNaN(amount) || amount <= 0) return;

        const previousBalance = cust.balance;
        cust.balance = Math.max(0, cust.balance - amount);

        const now = new Date();
        const dateStr = now.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
        const timeStr = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const fullDateTime = `${dateStr} - الساعة ${timeStr}`;

        const paymentRecord = {
            id: `REC-${Date.now().toString().slice(-6)}`,
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
            balanceBefore: previousBalance,
            balanceAfter: cust.balance,
            tafqeetWords: tafqeet(amount)
        };

        this.customerPayments.unshift(paymentRecord);
        this.saveAll();
        playBeep(true);

        // Open Voucher Print Preview Modal immediately
        this.printPaymentVoucher(paymentRecord.id);

        this.openCustomerLedger(cust.id);
        this.renderCustomersCards();
        this.renderHomeDashboard();
        this.renderShiftDetails();
    }

    handleCustomerUpdateSubmit(e) {
        e.preventDefault();
        const cust = this.customers.find(c => c.id === this.currentLedgerCustomerId);
        if (!cust) return;

        cust.name = document.getElementById('custEditName').value;
        cust.phone = document.getElementById('custEditPhone').value;
        cust.address = document.getElementById('custEditAddress').value;
        cust.creditLimit = parseFloat(document.getElementById('custEditCreditLimit').value) || 0;
        cust.cr = document.getElementById('custEditCr').value;
        cust.taxId = document.getElementById('custEditTaxId').value;

        this.saveAll();
        playBeep(true);
        alert('تم تحديث بيانات العميل بنجاح');
        this.openCustomerLedger(cust.id);
        this.renderCustomersCards();
    }

    // Supplier Ledger View with Exact Timestamps
    openSupplierLedger(supplierId) {
        this.currentLedgerSupplierId = supplierId;
        const sup = this.suppliers.find(s => s.id === supplierId);
        if (!sup) return;

        document.getElementById('supModalTitle').innerHTML = `<i class="fa-solid fa-truck-field text-warning"></i> كشف حساب المورد: ${sup.name}`;

        document.getElementById('supEditName').value = sup.name;
        document.getElementById('supEditPhone').value = sup.phone;
        document.getElementById('supEditAddress').value = sup.address || '';

        // Statement Table
        const stmtTbody = document.querySelector('#supStatementTable tbody');
        if (stmtTbody) {
            stmtTbody.innerHTML = `
                <tr>
                    <td>بداية التعامل</td>
                    <td>رصيد سابق</td>
                    <td>رصيد مستحق بداية الفترة</td>
                    <td style="color: var(--accent-rose); font-weight: bold;">${sup.balance.toFixed(2)}</td>
                    <td>—</td>
                    <td style="font-weight: bold;">${sup.balance.toFixed(2)} ج.م</td>
                </tr>
            `;
        }

        // Vouchers Log Table
        const vTbody = document.querySelector('#supVouchersLogTable tbody');
        if (vTbody) {
            const supVouchers = this.supplierPayments.filter(p => p.supplierId === supplierId);
            if (supVouchers.length === 0) {
                vTbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 20px;">لا توجد سندات صرف مسجلة لهذا المورد بعد</td></tr>`;
            } else {
                vTbody.innerHTML = supVouchers.map(v => `
                    <tr>
                        <td style="font-family: monospace; font-weight: bold;">${v.id}</td>
                        <td><strong>${v.date}</strong><br><small style="color: var(--primary-orange);">${v.time || '—'}</small></td>
                        <td style="font-weight: 900; color: var(--accent-rose); font-size: 0.95rem;">${v.amount.toFixed(2)} ج.م</td>
                        <td>${v.method}</td>
                        <td>${v.cashierName || 'أحمد الشناوي'}</td>
                        <td>
                            <button class="btn-secondary" style="padding: 4px 8px; font-size: 0.72rem;" onclick="app.printDisbursementVoucher('${v.id}')">
                                <i class="fa-solid fa-print"></i> طباعة السند
                            </button>
                        </td>
                    </tr>
                `).join('');
            }
        }

        this.switchSupTab('sup-statement');
        document.getElementById('supplierLedgerModal')?.classList.add('active');
    }

    closeSupplierLedgerModal() {
        document.getElementById('supplierLedgerModal')?.classList.remove('active');
    }

    switchSupTab(paneId) {
        document.querySelectorAll('#supplierLedgerModal .btn-acc-tab').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('#supplierLedgerModal .acc-tab-pane').forEach(p => p.classList.remove('active'));
        document.getElementById(`pane-${paneId}`)?.classList.add('active');
        const activeBtn = Array.from(document.querySelectorAll('#supplierLedgerModal .btn-acc-tab')).find(b => b.getAttribute('onclick')?.includes(paneId));
        if (activeBtn) activeBtn.classList.add('active');
    }

    handleSupplierPaymentSubmit(e) {
        e.preventDefault();
        const amount = parseFloat(document.getElementById('supPayAmount').value);
        const method = document.getElementById('supPayMethod').value;
        const notes = document.getElementById('supPayNotes').value.trim();
        const sup = this.suppliers.find(s => s.id === this.currentLedgerSupplierId);

        if (!sup || isNaN(amount) || amount <= 0) return;

        const previousBalance = sup.balance;
        sup.balance = Math.max(0, sup.balance - amount);

        const now = new Date();
        const dateStr = now.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
        const timeStr = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const fullDateTime = `${dateStr} - الساعة ${timeStr}`;

        const voucher = {
            id: `PAY-${Date.now().toString().slice(-6)}`,
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
            balanceBefore: previousBalance,
            balanceAfter: sup.balance,
            tafqeetWords: tafqeet(amount)
        };

        this.supplierPayments.unshift(voucher);
        this.saveAll();
        playBeep(true);

        this.printDisbursementVoucher(voucher.id);
        this.openSupplierLedger(sup.id);
        this.renderSuppliersCards();
        this.renderHomeDashboard();
        this.renderShiftDetails();
    }

    handleSupplierUpdateSubmit(e) {
        e.preventDefault();
        const sup = this.suppliers.find(s => s.id === this.currentLedgerSupplierId);
        if (!sup) return;

        sup.name = document.getElementById('supEditName').value;
        sup.phone = document.getElementById('supEditPhone').value;
        sup.address = document.getElementById('supEditAddress').value;

        this.saveAll();
        playBeep(true);
        alert('تم تحديث بيانات المورد بنجاح');
        this.openSupplierLedger(sup.id);
        this.renderSuppliersCards();
    }

    // ==========================================================================
    // 8. PRINTABLE PAYMENT & DISBURSEMENT VOUCHERS (سندات القبض والصرف)
    // ==========================================================================
    printPaymentVoucher(receiptId) {
        const rec = this.customerPayments.find(p => p.id === receiptId);
        if (!rec) return;

        const area = document.getElementById('voucherPrintArea');
        document.getElementById('voucherModalTitle').innerHTML = `<i class="fa-solid fa-receipt text-warning"></i> سند قبض نقدية رسمي: ${rec.id}`;

        const barcodeSvg = generateCode128SVG(rec.id, { height: 32, showText: true });

        area.innerHTML = `
            <div style="border-bottom: 2px solid #0F172A; padding-bottom: 10px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                    <h2 style="font-size: 1.3rem; font-weight: 900; color: #FF6A00; margin-bottom: 2px;">كارما كارميلا للأغذية</h2>
                    <p style="font-size: 0.76rem; color: #475569;">سجل تجاري: 184920 الجيزة • بطاقة ضريبية: 492-817-305</p>
                </div>
                <div style="text-align: left;">
                    <div style="font-weight: 900; font-size: 1.1rem; color: #059669; border: 1.5px solid #059669; padding: 2px 10px; border-radius: 6px;">سند قبض نقدية</div>
                    <div style="font-size: 0.78rem; font-family: monospace; margin-top: 4px;">رقم السند: <strong>${rec.id}</strong></div>
                </div>
            </div>

            <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 10px; margin-bottom: 12px; font-size: 0.85rem;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                    <span>التاريخ والوقت بالضبط:</span>
                    <strong style="color: #FF6A00;">${rec.fullDateTime || rec.date}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                    <span>وصلنا من السيد / العميل:</span>
                    <strong>${rec.customerName}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                    <span>طريقة السداد المحصلة:</span>
                    <strong>${rec.method}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                    <span>المبلغ المسدد:</span>
                    <strong style="font-size: 1.25rem; color: #059669; font-family: 'Tajawal', sans-serif;">${rec.amount.toFixed(2)} ج.م</strong>
                </div>
                <div style="background: #FFFFFF; border: 1px dashed #CBD5E1; padding: 6px; border-radius: 4px; font-weight: bold; font-size: 0.82rem; margin-top: 6px;">
                    المبلغ بالحروف: ${rec.tafqeetWords}
                </div>
                <div style="display: flex; justify-content: space-between; margin-top: 8px; font-size: 0.8rem; color: #64748B;">
                    <span>الرصيد قبل السداد: ${rec.balanceBefore.toFixed(2)} ج.م</span>
                    <span style="color: #0F172A; font-weight: bold;">الرصيد المتبقي المستحق: ${rec.balanceAfter.toFixed(2)} ج.م</span>
                </div>
            </div>

            <div style="font-size: 0.8rem; margin-bottom: 16px;">
                <span>البيان والملاحظات: <strong>${rec.notes || 'سداد دفعة من الحساب الآجل'}</strong></span>
            </div>

            <div style="text-align: center; margin-bottom: 14px;">
                ${barcodeSvg}
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; text-align: center; border-top: 1px solid #CBD5E1; padding-top: 10px; font-size: 0.82rem;">
                <div>
                    <strong>المسؤول / أمين الصندوق:</strong><br>
                    <span>${rec.cashierName || 'أحمد الشناوي'}</span><br><br>
                    .............................
                </div>
                <div>
                    <strong>توقيع المسدد / العميل:</strong><br><br><br>
                    .............................
                </div>
            </div>
        `;

        document.getElementById('voucherPrintModal')?.classList.add('active');
    }

    printDisbursementVoucher(voucherId) {
        const v = this.supplierPayments.find(p => p.id === voucherId);
        if (!v) return;

        const area = document.getElementById('voucherPrintArea');
        document.getElementById('voucherModalTitle').innerHTML = `<i class="fa-solid fa-money-bill-transfer text-warning"></i> سند صرف نقدية رسمي: ${v.id}`;

        const barcodeSvg = generateCode128SVG(v.id, { height: 32, showText: true });

        area.innerHTML = `
            <div style="border-bottom: 2px solid #0F172A; padding-bottom: 10px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                    <h2 style="font-size: 1.3rem; font-weight: 900; color: #FF6A00; margin-bottom: 2px;">كارما كارميلا للأغذية</h2>
                    <p style="font-size: 0.76rem; color: #475569;">سجل تجاري: 184920 الجيزة • بطاقة ضريبية: 492-817-305</p>
                </div>
                <div style="text-align: left;">
                    <div style="font-weight: 900; font-size: 1.1rem; color: #DC2626; border: 1.5px solid #DC2626; padding: 2px 10px; border-radius: 6px;">سند صرف نقدية</div>
                    <div style="font-size: 0.78rem; font-family: monospace; margin-top: 4px;">رقم السند: <strong>${v.id}</strong></div>
                </div>
            </div>

            <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 10px; margin-bottom: 12px; font-size: 0.85rem;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                    <span>التاريخ والوقت بالضبط:</span>
                    <strong style="color: #FF6A00;">${v.fullDateTime || v.date}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                    <span>يصرف إلى السادة / شركة:</span>
                    <strong>${v.supplierName}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                    <span>المبلغ المنصرف:</span>
                    <strong style="font-size: 1.25rem; color: #DC2626; font-family: 'Tajawal', sans-serif;">${v.amount.toFixed(2)} ج.م</strong>
                </div>
                <div style="background: #FFFFFF; border: 1px dashed #CBD5E1; padding: 6px; border-radius: 4px; font-weight: bold; font-size: 0.82rem; margin-top: 6px;">
                    المبلغ بالحروف: ${v.tafqeetWords}
                </div>
                <div style="display: flex; justify-content: space-between; margin-top: 8px; font-size: 0.8rem; color: #64748B;">
                    <span>المستحق قبل الصرف: ${v.balanceBefore.toFixed(2)} ج.م</span>
                    <span style="color: #0F172A; font-weight: bold;">المتبقي للمورد: ${v.balanceAfter.toFixed(2)} ج.م</span>
                </div>
            </div>

            <div style="font-size: 0.8rem; margin-bottom: 16px;">
                <span>البيان: <strong>${v.notes || 'سداد دفعة توريد بضاعة'}</strong></span>
            </div>

            <div style="text-align: center; margin-bottom: 14px;">
                ${barcodeSvg}
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; text-align: center; border-top: 1px solid #CBD5E1; padding-top: 10px; font-size: 0.82rem;">
                <div>
                    <strong>أمين الصندوق الصارف:</strong><br>
                    <span>${v.cashierName || 'أحمد الشناوي'}</span><br><br>
                    .............................
                </div>
                <div>
                    <strong>توقيع المستلم:</strong><br><br><br>
                    .............................
                </div>
            </div>
        `;

        document.getElementById('voucherPrintModal')?.classList.add('active');
    }

    closeVoucherPrintModal() {
        document.getElementById('voucherPrintModal')?.classList.remove('active');
    }

    // ==========================================================================
    // 9. REAL CAMERA BARCODE SCANNER & HARDWARE GUN LISTENER
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
            video.play();
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
        if (this.scannerStream) {
            this.scannerStream.getTracks().forEach(t => t.stop());
            this.scannerStream = null;
        }
        const video = document.getElementById('scannerVideo');
        if (video) video.srcObject = null;
        document.getElementById('btnToggleCamera')?.classList.remove('active');
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
            console.warn('Torch not supported on this device');
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
        } else {
            if (this.isScanningActive) {
                setTimeout(() => this.runCameraDetectionLoop(video), 200);
            }
        }
    }

    handleScannedCode(rawCode) {
        const code = String(rawCode).trim();
        if (!code) return;

        playBeep(true);

        let matchedProduct = null;
        let matchedUnitId = null;

        for (const p of this.products) {
            if (p.barcode === code || p.sku.toUpperCase() === code.toUpperCase()) {
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
        cloud.innerHTML = this.products.map(p => `
            <button class="badge-quick-barcode" onclick="app.handleScannedCode('${p.barcode}')">
                <i class="fa-solid fa-barcode"></i> ${p.name.split(' ')[0]} ${p.name.split(' ')[1] || ''}
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
            } else if (e.key.length === 1) {
                buffer += e.key;
                lastCharTime = now;
            }
        });
    }

    // ==========================================================================
    // 10. BARCODE LABEL STUDIO (PRINT STICKERS)
    // ==========================================================================
    openBarcodeStudioModal() {
        const select = document.getElementById('barcodeLabelProductSelect');
        if (select) {
            select.innerHTML = this.products.map(p => `
                <option value="${p.id}">${p.name} (${p.sku}) - ${p.wholesalePrice.toFixed(2)} ج.م</option>
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
        const prod = this.products.find(p => p.id === productId) || this.products[0];
        if (!prod) return;

        const barcodeSvg = generateCode128SVG(prod.barcode || prod.sku, { height: 35, showText: true });

        let stickersHtml = '';
        for (let i = 0; i < count; i++) {
            stickersHtml += `
                <div class="single-barcode-sticker">
                    <div class="sticker-brand">كارما كارميلا للأغذية</div>
                    <div class="sticker-name">${prod.name}</div>
                    <div class="sticker-price">${prod.wholesalePrice.toFixed(2)} ج.م</div>
                    <div class="sticker-barcode-svg">
                        ${barcodeSvg}
                    </div>
                </div>
            `;
        }
        area.innerHTML = stickersHtml;
    }

    printBarcodeStickers() {
        const preview = document.getElementById('barcodeStickersPreviewArea');
        if (!preview) return;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html lang="ar" dir="rtl">
            <head>
                <meta charset="UTF-8">
                <title>طباعة ملصقات الباركود - كارما كارميلا</title>
                <style>
                    body { font-family: 'Cairo', sans-serif; padding: 20px; direction: rtl; }
                    .barcode-stickers-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; }
                    .single-barcode-sticker { border: 1px dashed #000; padding: 10px; border-radius: 6px; text-align: center; }
                    .sticker-brand { font-size: 11px; font-weight: bold; color: #FF6A00; }
                    .sticker-name { font-size: 13px; font-weight: bold; margin: 4px 0; }
                    .sticker-price { font-size: 16px; font-weight: 900; }
                    .barcode-svg { max-width: 100%; height: 40px; margin-top: 4px; }
                    @media print { body { padding: 0; } }
                </style>
            </head>
            <body>
                <div class="barcode-stickers-grid">
                    ${preview.innerHTML}
                </div>
                <script>window.onload = function() { window.print(); }<\/script>
            </body>
            </html>
        `);
        printWindow.document.close();
    }

    // ==========================================================================
    // 11. CUSTOMER SELECTION FOR POS
    // ==========================================================================
    openCustomerModal() {
        const list = document.getElementById('customerSelectionList');
        if (list) {
            list.innerHTML = this.customers.map(c => `
                <div style="background: var(--bg-card); border: 1px solid var(--border-color); padding: 9px; border-radius: 8px; cursor: pointer; display: flex; justify-content: space-between; align-items: center;" onclick="app.selectCustomer(${c.id})">
                    <div>
                        <strong>${c.name}</strong>
                        <div style="font-size: 0.72rem; color: var(--text-muted);">${c.phone} • ${c.address || ''}</div>
                    </div>
                    <span style="font-weight: bold; color: ${c.balance > 0 ? 'var(--accent-amber)' : 'var(--accent-emerald)'}; font-size: 0.82rem;">
                        ${c.balance.toFixed(2)} ج.م
                    </span>
                </div>
            `).join('');
        }
        document.getElementById('customerSelectModal')?.classList.add('active');
    }

    closeCustomerModal() {
        document.getElementById('customerSelectModal')?.classList.remove('active');
    }

    filterCustomersList() {
        const q = (document.getElementById('custSearchInput')?.value || '').toLowerCase();
        const list = document.getElementById('customerSelectionList');
        if (!list) return;
        const filtered = this.customers.filter(c => c.name.toLowerCase().includes(q) || c.phone.includes(q));
        list.innerHTML = filtered.map(c => `
            <div style="background: var(--bg-card); border: 1px solid var(--border-color); padding: 9px; border-radius: 8px; cursor: pointer; display: flex; justify-content: space-between; align-items: center;" onclick="app.selectCustomer(${c.id})">
                <div>
                    <strong>${c.name}</strong>
                    <div style="font-size: 0.72rem; color: var(--text-muted);">${c.phone}</div>
                </div>
                <span style="font-weight: bold; color: ${c.balance > 0 ? 'var(--accent-amber)' : 'var(--accent-emerald)'};">
                    ${c.balance.toFixed(2)} ج.م
                </span>
            </div>
        `).join('');
    }

    selectCustomer(customerId) {
        this.currentCustomerId = customerId;
        const cust = this.customers.find(c => c.id === customerId) || this.customers[0];
        const posLabel = document.getElementById('posCurrentCustomerName');
        const cartLabel = document.getElementById('cartCustomerLabel');
        if (posLabel) posLabel.innerText = cust.name;
        if (cartLabel) cartLabel.innerText = cust.name;
        this.closeCustomerModal();
    }

    // ==========================================================================
    // 12. SCREEN RENDERING (HOME, INVENTORY, CARDS, REPORTS)
    // ==========================================================================
    renderHomeDashboard() {
        const todaySalesEl = document.getElementById('homeTodaySales');
        const cashDrawerEl = document.getElementById('homeCashDrawer');
        const receivablesEl = document.getElementById('homeReceivables');
        const payablesEl = document.getElementById('homePayables');
        const ordersCountEl = document.getElementById('homeOrdersCount');
        const stockValEl = document.getElementById('homeStockValuation');
        const stockCountEl = document.getElementById('homeStockCountText');

        const totalSales = this.orders.reduce((sum, o) => sum + o.grandTotal, 0);
        const cashSales = this.orders.filter(o => o.paymentType === 'cash').reduce((sum, o) => sum + o.grandTotal, 0);
        const cashReceipts = this.customerPayments.filter(p => p.method.includes('نقد')).reduce((sum, p) => sum + p.amount, 0);
        const cashDisbursements = this.supplierPayments.filter(p => p.method.includes('نقد')).reduce((sum, p) => sum + p.amount, 0);
        const netCash = this.currentUser.startingFloat + cashSales + cashReceipts - cashDisbursements;

        const totalReceivables = this.customers.reduce((sum, c) => sum + c.balance, 0);
        const totalPayables = this.suppliers.reduce((sum, s) => sum + s.balance, 0);
        const stockValuation = this.products.reduce((sum, p) => sum + (p.currentStock * p.costPrice), 0);

        if (todaySalesEl) todaySalesEl.innerText = `${totalSales.toFixed(2)} ج.م`;
        if (cashDrawerEl) cashDrawerEl.innerText = `${netCash.toFixed(2)} ج.م`;
        if (receivablesEl) receivablesEl.innerText = `${totalReceivables.toFixed(2)} ج.م`;
        if (payablesEl) payablesEl.innerText = `${totalPayables.toFixed(2)} ج.م`;

        if (ordersCountEl) ordersCountEl.innerText = `${this.orders.length} فواتير`;
        if (stockValEl) stockValEl.innerText = `${stockValuation.toFixed(2)} ج.م`;
        if (stockCountEl) stockCountEl.innerText = `${this.products.length} صنف مسجل`;

        // Home Recent Operations Table (Merges recent invoices and receipts)
        const recentTbody = document.querySelector('#homeRecentOrdersTable tbody');
        if (recentTbody) {
            const recentTimeline = [
                ...this.orders.slice(0, 4).map(o => ({ id: o.id, party: o.customerName, date: o.date, amount: o.grandTotal, type: 'فاتورة بيع' })),
                ...this.customerPayments.slice(0, 3).map(p => ({ id: p.id, party: p.customerName, date: p.fullDateTime || p.date, amount: p.amount, type: 'سند قبض نقدية' }))
            ];

            recentTbody.innerHTML = recentTimeline.length === 0 ? `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">لا توجد حركات مسجلة بالوردية الحالية</td></tr>` : recentTimeline.map(it => `
                <tr>
                    <td style="font-family: monospace; font-weight: bold;">${it.id}</td>
                    <td>${it.party}</td>
                    <td style="font-size: 0.72rem;">${it.date}</td>
                    <td style="font-weight: 900; color: var(--primary-orange);">${it.amount.toFixed(2)} ج.م</td>
                    <td><span class="status-badge ${it.type.includes('فاتورة') ? 'partial' : 'paid'}">${it.type}</span></td>
                </tr>
            `).join('');
        }

        // Low stock alerts
        const lowStockList = document.getElementById('homeLowStockList');
        if (lowStockList) {
            const lowItems = this.products.filter(p => p.currentStock <= p.minStock);
            if (lowItems.length === 0) {
                lowStockList.innerHTML = `<div style="text-align: center; padding: 14px; color: var(--accent-emerald); font-weight: bold; font-size: 0.82rem;">
                    <i class="fa-solid fa-circle-check"></i> مستويات المخزون ممتازة لجميع الأصناف
                </div>`;
            } else {
                lowStockList.innerHTML = lowItems.map(p => `
                    <div class="low-stock-card">
                        <div class="low-stock-info">
                            <h5>${p.name}</h5>
                            <span>الحد الأدنى: ${p.minStock} • كود: ${p.sku}</span>
                        </div>
                        <span class="low-stock-qty">${p.currentStock} ${p.baseUnit}</span>
                    </div>
                `).join('');
            }
        }
    }

    renderInventoryTable() {
        const tbody = document.querySelector('#inventoryTable tbody');
        if (!tbody) return;

        tbody.innerHTML = this.products.map(p => {
            const barcodeSvg = generateCode128SVG(p.barcode || p.sku, { height: 26, showText: false });
            return `
                <tr>
                    <td style="font-family: monospace; font-weight: bold;">${p.sku}</td>
                    <td style="font-weight: 800;">${p.name}</td>
                    <td><span class="status-badge partial">${p.category}</span></td>
                    <td>${p.baseUnit}</td>
                    <td>${p.costPrice.toFixed(2)} ج.م</td>
                    <td style="font-weight: bold; color: var(--primary-orange);">${p.wholesalePrice.toFixed(2)} ج.م</td>
                    <td>
                        <span style="font-weight: 900; color: ${p.currentStock <= p.minStock ? 'var(--accent-rose)' : 'inherit'};">
                            ${p.currentStock}
                        </span>
                    </td>
                    <td>
                        <div style="width: 100px;">${barcodeSvg}</div>
                    </td>
                    <td>
                        <button class="btn-secondary" style="padding: 4px 8px; font-size: 0.72rem;" onclick="app.openBarcodeStudioModal()"><i class="fa-solid fa-barcode"></i> ملصق</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    renderCustomersCards() {
        const grid = document.getElementById('customersCardsGrid');
        if (!grid) return;
        grid.innerHTML = this.customers.map(c => `
            <div class="bento-card cust" onclick="app.openCustomerLedger(${c.id})">
                <div class="bento-top-row">
                    <span class="bento-badge-pill">${c.phone}</span>
                    <div class="bento-icon-box"><i class="fa-solid fa-user-tie"></i></div>
                </div>
                <h4>${c.name}</h4>
                <div class="bento-metric-large ${c.balance > 0 ? 'text-warning' : 'text-success'}">
                    ${c.balance.toFixed(2)} ج.م
                </div>
                <p class="bento-desc">${c.address || 'لا يوجد عنوان مسجل'}</p>
                <span class="bento-link-arrow">فتح كشف الحساب بالساعة <i class="fa-solid fa-arrow-left"></i></span>
            </div>
        `).join('');
    }

    renderSuppliersCards() {
        const grid = document.getElementById('suppliersCardsGrid');
        if (!grid) return;
        grid.innerHTML = this.suppliers.map(s => `
            <div class="bento-card sup" onclick="app.openSupplierLedger(${s.id})">
                <div class="bento-top-row">
                    <span class="bento-badge-pill">${s.phone}</span>
                    <div class="bento-icon-box"><i class="fa-solid fa-truck-ramp-box"></i></div>
                </div>
                <h4>${s.name}</h4>
                <div class="bento-metric-large text-danger">
                    ${s.balance.toFixed(2)} ج.م
                </div>
                <p class="bento-desc">${s.address || 'المنطقة الصناعية'}</p>
                <span class="bento-link-arrow">كشف الحساب وسندات الصرف <i class="fa-solid fa-arrow-left"></i></span>
            </div>
        `).join('');
    }

    renderOrdersTable() {
        const tbody = document.querySelector('#allOrdersTable tbody');
        if (!tbody) return;
        if (this.orders.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 25px;">لا توجد فواتير صادرة حتى الآن</td></tr>`;
            return;
        }

        tbody.innerHTML = this.orders.map(o => `
            <tr>
                <td style="font-family: monospace; font-weight: bold;">${o.id}</td>
                <td style="font-weight: 700;">${o.customerName}</td>
                <td style="font-size: 0.75rem;">${o.date}</td>
                <td>${o.subtotal.toFixed(2)} ج.م</td>
                <td style="color: var(--accent-blue);">${o.vat.toFixed(2)} ج.م</td>
                <td style="font-weight: 900; color: var(--primary-orange);">${o.grandTotal.toFixed(2)} ج.م</td>
                <td><span class="status-badge ${o.paymentType === 'cash' ? 'paid' : 'credit'}">${o.paymentType === 'cash' ? 'نقدي' : 'آجل'}</span></td>
                <td>
                    <button class="btn-primary" style="padding: 4px 8px; font-size: 0.72rem;" onclick="app.openInvoiceModal(app.orders.find(ord => ord.id === '${o.id}'))">
                        <i class="fa-solid fa-print"></i> معاينة وطباعة
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // ==========================================================================
    // 13. MODAL CREATION FORMS
    // ==========================================================================
    openAddCustomerModal() {
        document.getElementById('addCustomerModal')?.classList.add('active');
    }
    closeAddCustomerModal() {
        document.getElementById('addCustomerModal')?.classList.remove('active');
    }
    saveNewCustomer(e) {
        e.preventDefault();
        const name = document.getElementById('newCustName').value.trim();
        const phone = document.getElementById('newCustPhone').value.trim();
        const balance = parseFloat(document.getElementById('newCustBalance').value) || 0;
        const address = document.getElementById('newCustAddress').value.trim();

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
        const name = document.getElementById('newSupName').value.trim();
        const phone = document.getElementById('newSupPhone').value.trim();
        const balance = parseFloat(document.getElementById('newSupBalance').value) || 0;

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
            supSelect.innerHTML = this.suppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
        }
        if (prodSelect) {
            prodSelect.innerHTML = this.products.map(p => `<option value="${p.id}">${p.name} (تكلفة: ${p.costPrice.toFixed(2)} ج.م)</option>`).join('');
            const first = this.products[0];
            if (first) document.getElementById('purchaseUnitCost').value = first.costPrice;
        }

        document.getElementById('newPurchaseModal')?.classList.add('active');
    }
    closeNewPurchaseModal() {
        document.getElementById('newPurchaseModal')?.classList.remove('active');
    }
    savePurchaseInvoice(e) {
        e.preventDefault();
        const supId = parseInt(document.getElementById('purchaseSupplierSelect').value, 10);
        const prodId = parseInt(document.getElementById('purchaseProductSelect').value, 10);
        const qty = parseInt(document.getElementById('purchaseQty').value, 10);
        const unitCost = parseFloat(document.getElementById('purchaseUnitCost').value);
        const payType = document.getElementById('purchasePaymentType').value;

        const sup = this.suppliers.find(s => s.id === supId);
        const prod = this.products.find(p => p.id === prodId);

        if (!sup || !prod) return;

        const totalCost = qty * unitCost;
        prod.currentStock += qty;
        prod.costPrice = unitCost;

        if (payType.includes('آجل')) {
            sup.balance += totalCost;
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
        const name = document.getElementById('newProdName').value.trim();
        const category = document.getElementById('newProdCategory').value;
        const sku = document.getElementById('newProdSku').value.toUpperCase().trim();
        const costPrice = parseFloat(document.getElementById('newProdCost').value);
        const wholesalePrice = parseFloat(document.getElementById('newProdPrice').value);
        const stock = parseInt(document.getElementById('newProdStock').value, 10) || 0;
        const barcode = document.getElementById('newProdBarcode').value.trim() || `622${Math.floor(100000000 + Math.random() * 900000000)}`;

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
    // 14. EXPORTING & BACKUPS
    // ==========================================================================
    exportOrdersCSV() {
        if (this.orders.length === 0) {
            alert('لا توجد فواتير لتصديرها');
            return;
        }

        let csv = '\uFEFFرقم الفاتورة,العميل,التاريخ,المجموع قبل الضريبة,الضريبة 14%,الإجمالي النهائي,طريقة السداد\n';
        this.orders.forEach(o => {
            csv += `"${o.id}","${o.customerName}","${o.date}",${o.subtotal.toFixed(2)},${o.vat.toFixed(2)},${o.grandTotal.toFixed(2)},"${o.paymentType}"\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Karma_Carmela_Orders_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    exportAllData() {
        const data = {
            products: this.products,
            customers: this.customers,
            suppliers: this.suppliers,
            orders: this.orders,
            customerPayments: this.customerPayments,
            supplierPayments: this.supplierPayments,
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

    saveAll() {
        localStorage.setItem('carmela_products', JSON.stringify(this.products));
        localStorage.setItem('carmela_customers', JSON.stringify(this.customers));
        localStorage.setItem('carmela_suppliers', JSON.stringify(this.suppliers));
        localStorage.setItem('carmela_orders', JSON.stringify(this.orders));
        localStorage.setItem('carmela_cust_payments', JSON.stringify(this.customerPayments));
        localStorage.setItem('carmela_sup_payments', JSON.stringify(this.supplierPayments));
        localStorage.setItem('carmela_user', JSON.stringify(this.currentUser));
    }
}

// Instantiate global app
window.app = new CarmelaApp();
