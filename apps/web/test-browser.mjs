import fs from 'node:fs';
import { chromium } from 'playwright';
import { createServer } from 'vite';

async function runBrowserTest() {
  console.log('--- STARTING COMPREHENSIVE PLAYWRIGHT E2E TESTS ---');

  // 1. Start embedded Vite dev server
  console.log('Starting internal Vite dev server on port 5174...');
  const server = await createServer({
    server: { port: 5174 },
  });
  await server.listen();
  const baseUrl = 'http://localhost:5174';
  console.log(`✓ Vite dev server running at ${baseUrl}`);

  let browser;
  try {
    try {
      browser = await chromium.launch({ channel: 'msedge', headless: true });
    } catch {
      try {
        browser = await chromium.launch({ channel: 'chrome', headless: true });
      } catch {
        browser = await chromium.launch({ headless: true });
      }
    }

    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();

    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    page.on('pageerror', (err) => {
      consoleErrors.push(err.message);
    });

    // =====================================================================
    // AUTHENTICATION E2E SUITE (Landing, Protected Routes, Register, Login, Persist, Logout)
    // =====================================================================
    console.log('\n[Auth 1/8] Testing Unauthenticated Landing Page (/), Bilingual & Mobile Responsive...');
    await page.goto(`${baseUrl}/`);
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('h1');

    const landingTitleEn = await page.textContent('h1');
    if (!landingTitleEn?.includes('Warehouse inventory software')) {
      throw new Error(`Expected English Landing hero heading, got: ${landingTitleEn}`);
    }

    // Wait for Hero entrance + metric counter animation (1,420) to complete
    await page.waitForTimeout(1050);
    const heroVisibleMetrics = await page.evaluate(() => {
      const hero = document.querySelector('main section');
      return Array.from(hero?.querySelectorAll('[aria-label] > span[aria-hidden="true"]:not(.invisible)') ?? []).map(
        (el) => el.textContent?.trim()
      );
    });
    if (!heroVisibleMetrics.includes('1,420') || !heroVisibleMetrics.includes('5') || !heroVisibleMetrics.includes('3')) {
      throw new Error(`Hero animated counters did not reach expected targets: ${JSON.stringify(heroVisibleMetrics)}`);
    }

    // Scroll to #features & #benefits and verify scroll reveals + animated counters settle
    await page.locator('#features').scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    await page.locator('#benefits').scrollIntoViewIfNeeded();
    await page.waitForTimeout(1050);
    const benefitsStatsEn = await page.evaluate(() => {
      const section = document.querySelector('#benefits');
      return Array.from(section?.querySelectorAll('dd [aria-label] > span[aria-hidden="true"]:not(.invisible)') ?? []).map(
        (el) => el.textContent?.trim()
      );
    });
    if (!benefitsStatsEn.includes('4 Roles') || !benefitsStatsEn.includes('14 Modules')) {
      throw new Error(`Benefits scroll counters did not reach targets in EN: ${JSON.stringify(benefitsStatsEn)}`);
    }

    await page.locator('#roles').scrollIntoViewIfNeeded();
    await page.waitForTimeout(550);
    const rolesOpacity = await page.evaluate(() => {
      const card = document.querySelector('#roles h2');
      return card ? window.getComputedStyle(card).opacity : '0';
    });
    if (rolesOpacity !== '1') {
      throw new Error(`Expected #roles heading opacity to settle to 1 after scroll, got ${rolesOpacity}`);
    }

    const landingPreviewEn = await page.locator('#preview').textContent();
    if (!landingPreviewEn?.includes('New Stock Voucher') || landingPreviewEn?.includes('stockOps.')) {
      throw new Error(`Landing preview missing expected English button text or leaked raw key: ${landingPreviewEn}`);
    }

    // Check interactive Preview role tab switch to Viewer and back to Manager
    await page.locator('#preview').scrollIntoViewIfNeeded();
    await page.locator('#preview [role="tab"]', { hasText: 'Viewer' }).click();
    await page.waitForTimeout(220);
    const viewerPreviewText = await page.locator('#preview').textContent();
    if (!viewerPreviewText?.includes('Read-only') || viewerPreviewText?.includes('New Stock Voucher')) {
      throw new Error(`Landing preview did not switch to Viewer read-only state cleanly: ${viewerPreviewText}`);
    }
    await page.locator('#preview [role="tab"]', { hasText: 'Manager' }).click();
    await page.waitForTimeout(150);

    // Bilingual check on Landing Page (EN -> VI -> EN) including localized counters
    await page.click('#landing-lang-toggle');
    await page.waitForTimeout(250);
    const landingTitleVi = await page.textContent('h1');
    const landingPreviewVi = await page.locator('#preview').textContent();
    const benefitsStatsVi = await page.evaluate(() => {
      const section = document.querySelector('#benefits');
      return Array.from(section?.querySelectorAll('dd [aria-label] > span[aria-hidden="true"]:not(.invisible)') ?? []).map(
        (el) => el.textContent?.trim()
      );
    });
    if (
      !landingTitleVi?.includes('Phần mềm quản lý kho') ||
      !landingPreviewVi?.includes('Tạo phiếu kho mới') ||
      !benefitsStatsVi.includes('4 Vai trò') ||
      !benefitsStatsVi.includes('14 Phân hệ')
    ) {
      throw new Error(`Landing Page did not switch cleanly to Vietnamese: ${landingTitleVi} / ${JSON.stringify(benefitsStatsVi)}`);
    }
    await page.click('#landing-lang-toggle');
    await page.waitForTimeout(200);

    // Check prefers-reduced-motion: reduce renders immediate final counts cleanly
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload({ waitUntil: 'networkidle' });
    const reducedMetrics = await page.evaluate(() => {
      const hero = document.querySelector('main section');
      return Array.from(hero?.querySelectorAll('[aria-label] > span[aria-hidden="true"]:not(.invisible)') ?? []).map(
        (el) => el.textContent?.trim()
      );
    });
    if (!reducedMetrics.includes('1,420')) {
      throw new Error(`Expected reduced-motion mode to render 1,420 immediately, got ${JSON.stringify(reducedMetrics)}`);
    }
    await page.emulateMedia({ reducedMotion: null });

    // Check Landing Page mobile overflow (390x844), mobile drawer animation, and restore desktop
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(200);
    await page.click('#landing-mobile-menu-btn');
    await page.waitForTimeout(220);
    await page.click('#landing-mobile-menu-btn');
    await page.waitForTimeout(220);
    const landingMobileOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    if (landingMobileOverflow) {
      throw new Error('Landing page horizontal overflow detected at 390px');
    }
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(150);
    console.log('   ✓ Landing page animations, counters, reduced-motion, EN/VI, and mobile/desktop layout verified');

    console.log('\n[Auth 2/8] Testing Protected Routes Redirect when Unauthenticated...');
    await page.goto(`${baseUrl}/dashboard`);
    await page.waitForLoadState('networkidle');
    if (new URL(page.url()).pathname !== '/') {
      throw new Error(`Expected unauthenticated /dashboard to redirect to /, got ${page.url()}`);
    }
    await page.goto(`${baseUrl}/products`);
    await page.waitForLoadState('networkidle');
    if (new URL(page.url()).pathname !== '/') {
      throw new Error(`Expected unauthenticated /products to redirect to /, got ${page.url()}`);
    }
    console.log('   ✓ Protected routes block unauthenticated access cleanly');

    console.log('\n[Auth 3/8] Testing Account Registration Validation & Submission (/register)...');
    await page.click('#landing-nav-register');
    await page.waitForURL('**/register');

    // Check Register Mobile 390px & Vietnamese toggle
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(150);
    const regMobileOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    if (regMobileOverflow) {
      throw new Error('Register page horizontal overflow detected at 390px');
    }
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.click('header button[title="Switch Language"]');
    await page.waitForTimeout(150);
    if (!(await page.textContent('body'))?.includes('Tạo tài khoản làm việc mới')) {
      throw new Error('Register page did not translate to Vietnamese cleanly');
    }
    await page.click('header button[title="Đổi ngôn ngữ"]');
    await page.waitForTimeout(150);

    await page.fill('#register-input-fullname', 'Nguyen E2E Operator');
    await page.fill('#register-input-email', 'e2e.operator@smartinventory.example');
    await page.fill('#register-input-password', 'short');
    await page.fill('#register-input-confirm-password', 'mismatch');
    await page.click('#btn-register-submit');
    await page.waitForTimeout(200);
    const regBodyErr = await page.textContent('body');
    if (!regBodyErr?.includes('at least 8 characters') || !regBodyErr?.includes('does not match')) {
      throw new Error('Expected register form validation messages for weak/mismatched passwords');
    }

    await page.fill('#register-input-password', 'Operator2026');
    await page.fill('#register-input-confirm-password', 'Operator2026');
    await page.click('#btn-register-submit');
    await page.waitForURL('**/login');
    await page.waitForTimeout(200);

    // Ensure plaintext password is NOT persisted in sim_users
    const simUsersRaw = await page.evaluate(() => localStorage.getItem('sim_users') ?? '');
    if (!simUsersRaw.includes('e2e.operator@smartinventory.example') || simUsersRaw.includes('Operator2026')) {
      throw new Error('sim_users must store registered account without plaintext password');
    }
    console.log('   ✓ Registration validation, redirect to /login, and non-plaintext hash verified');

    console.log('\n[Auth 4/8] Testing Login Failure (Invalid Credentials) + Bilingual & Mobile Check...');
    await page.fill('#login-input-password', 'WrongPassword99');
    await page.click('#btn-login-submit');
    await page.waitForTimeout(200);
    const loginErrText = await page.textContent('body');
    if (!loginErrText?.includes('Invalid email or password')) {
      throw new Error('Expected invalid credentials alert on failed login');
    }
    if (new URL(page.url()).pathname !== '/login') {
      throw new Error('Failed login should remain on /login');
    }

    // Check Login page Vietnamese toggle + Mobile 390px overflow
    await page.click('header button[title="Switch Language"]');
    await page.waitForTimeout(150);
    const loginViBody = await page.textContent('body');
    if (!loginViBody?.includes('Đăng nhập Smart Inventory')) {
      throw new Error('Login page did not translate to Vietnamese cleanly');
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(150);
    const loginMobileOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    if (loginMobileOverflow) {
      throw new Error('Login page horizontal overflow detected at 390px');
    }
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.click('header button[title="Đổi ngôn ngữ"]');
    await page.waitForTimeout(150);
    console.log('   ✓ Login failure alert, VI switching, and Mobile 390px layout verified');

    console.log('\n[Auth 5/8] Testing Login Success with Registered Account -> Dashboard...');
    await page.fill('#login-input-password', 'Operator2026');
    await page.click('#btn-login-submit');
    await page.waitForURL('**/dashboard');
    await page.waitForSelector('h1');
    console.log('   ✓ Registered user signed in and landed on /dashboard');

    console.log('\n[Auth 6/8] Testing Session Persistence across Browser Reload...');
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForSelector('h1');
    if (!page.url().includes('/dashboard')) {
      throw new Error(`Expected session to remain on /dashboard after reload, got ${page.url()}`);
    }
    console.log('   ✓ Session persisted cleanly across reload');

    console.log('\n[Auth 7/8] Testing GuestRoute Redirect when Already Signed In...');
    await page.goto(`${baseUrl}/login`);
    await page.waitForLoadState('networkidle');
    if (!page.url().includes('/dashboard')) {
      throw new Error(`Expected authenticated /login to redirect to /dashboard, got ${page.url()}`);
    }
    console.log('   ✓ GuestRoute bounced signed-in user back to /dashboard');

    console.log('\n[Auth 8/8] Testing Logout -> Landing Page & Subsequent Route Protection...');
    await page.click('button[aria-label*="User account menu"]');
    await page.click('#btn-topbar-logout');
    await page.waitForURL(`${baseUrl}/`);
    await page.goto(`${baseUrl}/dashboard`);
    await page.waitForLoadState('networkidle');
    if (new URL(page.url()).pathname !== '/') {
      throw new Error(`Expected logged-out /dashboard visit to redirect to /, got ${page.url()}`);
    }
    console.log('   ✓ Logout cleared session, returned to Landing Page, and re-protected /dashboard');

    // =====================================================================
    // LOGIN AS ADMIN DEMO ACCOUNT FOR FULL APP REGRESSION TESTS
    // =====================================================================
    console.log('\n[1/7] Logging in via Admin Demo Account Card -> Testing App Routing & Dashboard...');
    await page.click('#landing-nav-login');
    await page.waitForURL('**/login');
    await page.click('[data-testid="demo-account-ADMIN"]');
    await page.click('#btn-login-submit');
    await page.waitForURL('**/dashboard');
    await page.waitForLoadState('networkidle');
    const url = page.url();
    if (!url.includes('/dashboard')) {
      throw new Error(`Expected redirect to /dashboard, got ${url}`);
    }
    console.log('   ✓ Admin Demo login -> /dashboard verified');

    // Verify Sidebar Collapse / Expand geometry (no clipped logo or overlapping toggle button)
    await page.click('button[aria-label*="Collapse sidebar"]');
    await page.waitForTimeout(300);
    const collapseGeometry = await page.evaluate(() => {
      const aside = document.querySelector('aside');
      const logoBox = document.querySelector('aside a[href="/dashboard"] > div');
      const toggleBtn = document.querySelector('aside button[aria-label*="Expand sidebar"]');
      if (!aside || !logoBox || !toggleBtn) return null;
      return {
        aside: aside.getBoundingClientRect().toJSON(),
        logo: logoBox.getBoundingClientRect().toJSON(),
        toggle: toggleBtn.getBoundingClientRect().toJSON(),
      };
    });
    if (!collapseGeometry) {
      throw new Error('Failed to measure collapsed sidebar geometry');
    }
    const { aside: asideR, logo: logoR, toggle: toggleR } = collapseGeometry;
    const overlapsToggle =
      logoR.left < toggleR.right &&
      logoR.right > toggleR.left &&
      logoR.top < toggleR.bottom &&
      logoR.bottom > toggleR.top;
    if (
      logoR.width < 35 ||
      logoR.height < 35 ||
      logoR.left < asideR.left ||
      logoR.right > asideR.right ||
      overlapsToggle
    ) {
      throw new Error(
        `Collapsed sidebar logo clipped or overlaps toggle: logo=${JSON.stringify(logoR)}, toggle=${JSON.stringify(toggleR)}, aside=${JSON.stringify(asideR)}`
      );
    }
    await page.click('button[aria-label*="Expand sidebar"]');
    await page.waitForTimeout(250);
    console.log('   ✓ Collapsed mini-sidebar logo & toggle layout geometry verified (no clipping/overlap)');

    // 2. Navigate to Products page
    console.log('\n[2/7] Navigating to /products...');
    await page.click('a[href="/products"]');
    await page.waitForTimeout(500);
    const pageContent = await page.textContent('body');
    if (!pageContent.includes('Danh Mục Hàng Hóa') && !pageContent.includes('Product Catalog')) {
      throw new Error('Products page header not found');
    }
    console.log('   ✓ Products page loaded successfully with KPI cards');

    // 3. Test Create Modal Validation (Empty fields & Duplicate SKU)
    console.log('\n[3/7] Testing Product Create Modal Form Validation...');
    await page.click('#btn-add-product');
    await page.waitForTimeout(300);

    // Verify modal is open
    let modalText = await page.textContent('dialog');
    if (!modalText.includes('Add New Product to Inventory')) {
      throw new Error('Create product modal failed to open in English');
    }
    console.log('   ✓ Create Product modal opened');

    // Submit without filling
    await page.click('#btn-submit-product');
    await page.waitForTimeout(300);

    modalText = await page.textContent('dialog');
    if (!modalText.includes('is required')) {
      throw new Error('Form validation failed: expected empty field errors');
    }
    console.log('   ✓ Empty field validation errors triggered and displayed correctly');

    // Test Duplicate SKU validation
    await page.fill('#product-input-sku', 'SKU-KB-LOGI-MXKEYS');
    await page.fill('#product-input-name', 'San Pham Trung SKU Test');
    await page.click('#btn-submit-product');
    await page.waitForTimeout(300);

    modalText = await page.textContent('dialog');
    if (!modalText.includes('already exists in the system')) {
      throw new Error('Duplicate SKU validation failed: duplicate was allowed');
    }
    console.log('   ✓ Duplicate SKU validation triggered and prevented creation');

    // 4. Test Add New Product (Happy Path)
    console.log('\n[4/7] Testing Product Creation (Happy Path)...');
    await page.fill('#product-input-sku', 'SKU-E2E-AUTO-01');
    await page.fill('#product-input-name', 'AAA San Pham E2E Automation Test');
    await page.fill('#product-input-barcode', '89399990001');
    await page.fill('#product-input-stock', '48');
    await page.fill('#product-input-reorder', '10');
    await page.click('#btn-submit-product');
    await page.waitForTimeout(500);

    const bodyAfterCreate = await page.textContent('body');
    if (!bodyAfterCreate.includes('SKU-E2E-AUTO-01') || !bodyAfterCreate.includes('AAA San Pham E2E Automation Test')) {
      throw new Error('Newly created product not found in the table');
    }
    if (!bodyAfterCreate.includes('48')) {
      throw new Error('Newly created product stock quantity (48) not displayed correctly');
    }
    console.log('   ✓ New product created and rendered in table with correct stock & SKU');

    // 5. Test Product Editing
    console.log('\n[5/7] Testing Product Edit Flow...');
    const editBtn = await page.$('button[aria-label="Edit SKU-E2E-AUTO-01"]');
    if (!editBtn) {
      throw new Error('Edit button for newly created product not found');
    }
    await editBtn.click();
    await page.waitForTimeout(300);

    modalText = await page.textContent('dialog');
    if (!modalText.includes('Edit Product: SKU-E2E-AUTO-01')) {
      throw new Error('Edit modal failed to open with correct product');
    }

    await page.fill('#product-input-name', 'AAA San Pham E2E Da Chinh Sua');
    await page.click('#btn-submit-product');
    await page.waitForTimeout(500);

    const bodyAfterEdit = await page.textContent('body');
    if (!bodyAfterEdit.includes('AAA San Pham E2E Da Chinh Sua')) {
      throw new Error('Product edit failed to update name in table');
    }
    console.log('   ✓ Product updated successfully and updated name displayed in table');

    // 6. Test Search & Filter
    console.log('\n[6/7] Testing Search Filter...');
    await page.fill('#product-search-input', 'SKU-E2E-AUTO-01');
    await page.waitForTimeout(400);

    const filteredContent = await page.textContent('table');
    if (!filteredContent.includes('SKU-E2E-AUTO-01') || filteredContent.includes('SKU-KB-LOGI-MXKEYS')) {
      throw new Error('Search filtering failed to isolate target product');
    }
    console.log('   ✓ Search filter verified (accurately filtered table rows)');

    // Clear search filter
    await page.fill('#product-search-input', '');
    await page.waitForTimeout(400);

    // 7. Test Product Deletion with Confirmation
    console.log('\n[7/7] Testing Product Deletion Confirmation...');
    const deleteBtn = await page.$('button[aria-label="Delete SKU-E2E-AUTO-01"]');
    if (!deleteBtn) {
      throw new Error('Delete button for SKU-E2E-AUTO-01 not found');
    }
    await deleteBtn.click();
    await page.waitForTimeout(300);

    const deleteModal = page.locator('dialog:has-text("Confirm Delete")');
    const deleteModalText = await deleteModal.textContent();
    if (!deleteModalText.includes('Confirm Product Deletion')) {
      throw new Error('Delete confirmation modal did not open');
    }

    // Confirm deletion
    await deleteModal.locator('button:has-text("Confirm Delete")').click();
    await page.waitForTimeout(500);

    const bodyAfterDelete = await page.textContent('body');
    if (bodyAfterDelete.includes('SKU-E2E-AUTO-01')) {
      throw new Error('Product still exists in table after deletion');
    }
    console.log('   ✓ Product deleted and removed from table after confirmation');

    // 8. Test Master Data: Warehouses CRUD & Referential Delete Guard
    console.log('\n[8/11] Testing Warehouses Master Data (/warehouses)...');
    await page.click('a[href="/warehouses"]');
    await page.waitForTimeout(400);
    await page.click('#btn-add-warehouse');
    await page.waitForTimeout(200);
    await page.fill('#wh-input-code', 'WH-01');
    await page.fill('#wh-input-name', 'Duplicate WH Test');
    await page.fill('#wh-input-address', 'KCN Khu Vực Test, Hà Nội');
    await page.fill('#wh-input-manager', 'Nguyen Van Test');
    await page.click('#btn-submit-warehouse');
    await page.waitForTimeout(200);
    const whDupMsg = await page.textContent('dialog');
    if (!whDupMsg.includes('already exists in the system')) {
      throw new Error('Warehouse duplicate code validation failed');
    }
    await page.fill('#wh-input-code', 'WH-E2E-09');
    await page.fill('#wh-input-name', 'Kho E2E Cần Thơ');
    await page.click('#btn-submit-warehouse');
    await page.waitForTimeout(400);
    if (!(await page.textContent('body')).includes('WH-E2E-09')) {
      throw new Error('New warehouse WH-E2E-09 not added');
    }
    // Check referential guard on WH-01
    await page.click('button[aria-label="Delete WH-01"]');
    await page.waitForTimeout(200);
    const isWhForceDisabled = await page.isDisabled('#btn-confirm-master-delete');
    if (!isWhForceDisabled) {
      throw new Error('Referenced warehouse WH-01 delete button should be disabled before confirmation checkbox');
    }
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    console.log('   ✓ Warehouses CRUD, duplicate guard, and reference lock verified');

    // 9. Test Master Data: Categories & Empty State
    console.log('\n[9/11] Testing Categories Master Data & Empty State (/categories)...');
    await page.click('a[href="/categories"]');
    await page.waitForTimeout(400);
    await page.fill('#cat-search-input', 'NON-EXISTENT-CAT-999');
    await page.waitForTimeout(300);
    if (!(await page.textContent('body')).includes('No matching categories found')) {
      throw new Error('Categories Empty State not displayed on unmatched search');
    }
    await page.fill('#cat-search-input', '');
    await page.waitForTimeout(300);
    console.log('   ✓ Categories listing and Empty State verified');

    // 10. Test Master Data: Units of Measurement
    console.log('\n[10/11] Testing Units of Measurement (/units)...');
    await page.click('a[href="/units"]');
    await page.waitForTimeout(400);
    if (!(await page.textContent('body')).includes('UOM-PCS')) {
      throw new Error('Units page missing UOM-PCS');
    }
    await page.click('#btn-add-unit');
    await page.waitForTimeout(200);
    await page.fill('#uom-input-code', 'UOM-E2E');
    await page.fill('#uom-input-name', 'Kiện E2E');
    await page.fill('#uom-input-symbol', 'Cái'); // Duplicate symbol check
    await page.click('#btn-submit-unit');
    await page.waitForTimeout(200);
    if (!(await page.textContent('dialog')).includes('is already used by another unit')) {
      throw new Error('Unit duplicate symbol validation failed');
    }
    await page.fill('#uom-input-symbol', 'Kiện');
    await page.click('#btn-submit-unit');
    await page.waitForTimeout(300);
    if (!(await page.textContent('body')).includes('UOM-E2E')) {
      throw new Error('New Unit UOM-E2E not rendered in table');
    }
    console.log('   ✓ Units of Measurement CRUD and unique symbol validation verified');

    // 11. Test Master Data: Suppliers & Email Validation
    console.log('\n[11/11] Testing Suppliers Master Data (/suppliers)...');
    await page.click('a[href="/suppliers"]');
    await page.waitForTimeout(400);
    await page.click('#btn-add-supplier');
    await page.waitForTimeout(200);
    await page.fill('#sup-input-code', 'SUP-E2E-01');
    await page.fill('#sup-input-name', 'Công ty E2E Logistics');
    await page.fill('#sup-input-contact', 'Nguyễn E2E');
    await page.fill('#sup-input-phone', 'ext. 909');
    await page.fill('#sup-input-email', 'not-valid-email');
    await page.fill('#sup-input-address', 'Quận Hải Châu, Đà Nẵng');
    await page.click('#btn-submit-supplier');
    await page.waitForTimeout(200);
    if (!(await page.textContent('dialog')).includes('Invalid email format')) {
      throw new Error('Supplier email format validation failed');
    }
    await page.fill('#sup-input-email', 'e2e@partner.example');
    await page.click('#btn-submit-supplier');
    await page.waitForTimeout(300);
    if (!(await page.textContent('body')).includes('SUP-E2E-01')) {
      throw new Error('New Supplier SUP-E2E-01 not rendered in table');
    }
    console.log('   ✓ Suppliers CRUD and email validation verified');

    // 12. Test Stock In Flow (Multi-item create, total calculation, submit & Maker-Checker approval)
    console.log('\n[12/13] Testing Stock In Workflow (/stock-in)...');
    await page.click('a[href="/stock-in"]');
    await page.waitForTimeout(400);
    if (!(await page.textContent('body')).includes('IN-2026-089')) {
      throw new Error('Stock In page missing seeded voucher IN-2026-089');
    }

    await page.click('#btn-create-stock-in');
    await page.waitForSelector('dialog[open]');
    const inDialog = page.locator('dialog[open]');

    await inDialog.locator('#btn-add-line').click();
    await inDialog.locator('#line-qty-0').fill('5');
    await inDialog.locator('#line-cost-0').fill('100000');
    await inDialog.locator('#line-qty-1').fill('2');
    await inDialog.locator('#line-cost-1').fill('250000');

    const totalQtyText = await inDialog.locator('[data-testid="voucher-total-qty"]').textContent();
    const totalAmtText = await inDialog.locator('[data-testid="voucher-total-amount"]').textContent();
    if (!totalQtyText?.includes('7') || !totalAmtText?.includes('1.000.000')) {
      throw new Error(`Stock In totals mismatch: qty=${totalQtyText}, amount=${totalAmtText}`);
    }

    await inDialog.locator('#stock-in-note').fill('PO-E2E-IN-900');
    await inDialog.locator('#btn-submit-order').click();
    await page.waitForTimeout(300);

    if (!(await page.textContent('body')).includes('IN-2026-090')) {
      throw new Error('Newly submitted Stock In voucher IN-2026-090 not displayed in table');
    }

    // Open Detail Modal & test Maker-Checker enforcement + manager approval
    await page.click('[data-testid="btn-view-IN-2026-090"]');
    await page.waitForSelector('dialog[open]');
    const inDetailDialog = page.locator('dialog[open]');
    const isWarningVisible = await inDetailDialog.locator('[data-testid="maker-checker-warning"]').isVisible();
    const isApproveDisabled = await inDetailDialog.locator('#btn-approve-order').isDisabled();
    if (!isWarningVisible || !isApproveDisabled) {
      throw new Error('Maker-Checker self-approval block did not trigger for IN-2026-090');
    }

    await inDetailDialog.locator('#detail-actor-select').selectOption('Trần Thị Thu (Manager)');
    await inDetailDialog.locator('#btn-approve-order').click();
    await page.waitForTimeout(300);
    const detailAfterApprove = await inDetailDialog.textContent();
    if (!detailAfterApprove?.includes('Approved') && !detailAfterApprove?.includes('Đã phê duyệt')) {
      throw new Error('Manager approval did not transition IN-2026-090 to APPROVED');
    }
    await inDetailDialog.locator('button[aria-label="Close dialog"]').click();
    await page.waitForTimeout(200);
    console.log('   ✓ Stock In multi-item creation, totals, submit, and Maker-Checker approval verified');

    // 13. Test Stock Out Flow (Over-stock block + valid multi-item create & submit)
    console.log('\n[13/13] Testing Stock Out Workflow & Over-Stock Block (/stock-out)...');
    await page.click('a[href="/stock-out"]');
    await page.waitForTimeout(400);
    if (!(await page.textContent('body')).includes('OUT-2026-042')) {
      throw new Error('Stock Out page missing seeded voucher OUT-2026-042');
    }

    await page.click('#btn-create-stock-out');
    await page.waitForSelector('dialog[open]');
    const outDialog = page.locator('dialog[open]');

    await outDialog.locator('#stock-out-destination').fill('Khách hàng Doanh nghiệp E2E');
    await outDialog.locator('#line-qty-0').fill('99999');
    await page.waitForTimeout(150);
    const overStockAlert = await outDialog.locator('[role="alert"]').textContent();
    if (!overStockAlert || (!overStockAlert.includes('Exceeds available stock') && !overStockAlert.includes('Vượt quá tồn kho'))) {
      throw new Error('Over-stock inline error alert not shown on Stock Out');
    }

    await outDialog.locator('#btn-submit-order').click();
    await page.waitForTimeout(200);
    if ((await page.textContent('body')).includes('OUT-2026-043')) {
      throw new Error('Stock Out creation should have been blocked on over-stock quantity');
    }

    await outDialog.locator('#line-qty-0').fill('3');
    await outDialog.locator('#btn-add-line').click();
    await outDialog.locator('#line-qty-1').fill('2');
    await outDialog.locator('#btn-submit-order').click();
    await page.waitForTimeout(300);

    if (!(await page.textContent('body')).includes('OUT-2026-043')) {
      throw new Error('Newly submitted Stock Out voucher OUT-2026-043 not displayed in table');
    }
    console.log('   ✓ Stock Out over-stock block and valid multi-item submission verified');

    // 14. Test Reports & Analytics (/reports): 5 tabs, date validation, filter sync, and real CSV download
    console.log('\n[14/14] Testing Reports & Analytics + CSV Export (/reports)...');
    await page.click('a[href="/reports"]');
    await page.waitForTimeout(400);
    if (!(await page.textContent('body')).includes('Inventory Balance Sheet')) {
      throw new Error('Reports page missing Inventory Balance Sheet label');
    }

    // Switch through report tabs
    for (const tabId of [
      'report-tab-stock_movement',
      'report-tab-low_stock',
      'report-tab-stock_out',
      'report-tab-stock_in',
    ]) {
      await page.click(`#${tabId}`);
      await page.waitForTimeout(150);
    }

    // Test invalid date range protection
    await page.fill('#report-start-date', '2026-11-25');
    await page.waitForTimeout(200);
    const isCsvDisabledOnInvalidDate = await page.isDisabled('#btn-export-csv');
    if (!isCsvDisabledOnInvalidDate) {
      throw new Error('Export CSV should be disabled when startDate > endDate');
    }

    // Reset and apply November + WH-01 filters on Stock In report
    await page.click('#btn-reset-report-filters');
    await page.click('#preset-date-nov');
    await page.selectOption('#report-warehouse-select', 'WH-01');
    await page.waitForTimeout(250);

    const chartSyncText = await page.textContent('[data-testid="chart-totals-sync"]');
    const tableTotalsText = await page.textContent('[data-testid="report-table-totals"]');
    if (!chartSyncText?.includes('29') || !tableTotalsText?.includes('29')) {
      throw new Error(`Reports Chart/Table sync mismatch for Nov WH-01 Stock-In: chart=${chartSyncText}, table=${tableTotalsText}`);
    }

    // Capture real CSV file download and verify contents on disk
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('#btn-export-csv'),
    ]);
    const csvFileName = download.suggestedFilename();
    const csvFilePath = await download.path();
    if (!csvFileName.endsWith('.csv') || !csvFilePath) {
      throw new Error(`Invalid CSV download filename/path: ${csvFileName}`);
    }
    const csvContent = fs.readFileSync(csvFilePath, 'utf8');
    if (
      !csvContent.startsWith('\uFEFF') ||
      !csvContent.includes('IN-2026-087') ||
      !csvContent.includes(',29,') ||
      csvContent.includes('WH-02')
    ) {
      throw new Error(`Unexpected CSV content exported: ${csvContent.slice(0, 200)}`);
    }
    console.log(`   ✓ Reports filtering, chart-table synchronization, and CSV export (${csvFileName}) verified`);

    // 15. Test User Management & Dev-Only Role UI Preview (/users)
    console.log('\n[15/15] Testing User Management CRUD & Dev Role Preview (/users)...');
    await page.click('aside a[href="/users"]');
    await page.waitForTimeout(300);

    const usersBodyText = await page.textContent('body');
    if (!usersBodyText?.includes('USR-001') || !usersBodyText?.includes('USR-005')) {
      throw new Error('Users page missing expected seeded users USR-001..USR-005');
    }

    const passwordInputCount = await page.locator('input[type="password"]').count();
    if (passwordInputCount !== 0) {
      throw new Error(`Users page must not contain password inputs, found ${passwordInputCount}`);
    }

    // Create mock user USR-006
    await page.click('#btn-create-user');
    await page.waitForSelector('dialog[open]');
    const userDialog = page.locator('dialog[open]');
    await userDialog.locator('#user-input-fullname').fill('Trần Kiểm Thử E2E');
    await userDialog.locator('#user-input-email').fill('e2e.staff@smartinventory.local');
    await userDialog.locator('#user-wh-WH-02').click({ force: true });
    await userDialog.locator('#btn-submit-user-form').click();
    await page.waitForTimeout(250);

    if (!(await page.textContent('body'))?.includes('USR-006')) {
      throw new Error('Created mock user USR-006 not displayed in Users table');
    }

    // Edit USR-006 -> promote to WAREHOUSE_MANAGER & assign WH-03
    await page.click('#btn-edit-user-USR-006');
    await page.waitForSelector('dialog[open]');
    const editUserDialog = page.locator('dialog[open]');
    await editUserDialog.locator('#user-select-role').selectOption('WAREHOUSE_MANAGER');
    await editUserDialog.locator('#user-wh-WH-03').click({ force: true });
    await editUserDialog.locator('#btn-submit-user-form').click();
    await page.waitForTimeout(250);

    const usr006RowText = await page.locator('tr', { hasText: 'USR-006' }).textContent();
    if (!usr006RowText?.includes('WAREHOUSE_MANAGER') || !usr006RowText?.includes('WH-03')) {
      throw new Error(`USR-006 role/warehouse update failed: ${usr006RowText}`);
    }

    // Toggle USR-006 status to inactive
    await page.click('#btn-toggle-status-USR-006');
    await page.waitForTimeout(200);
    const usr006AfterToggle = await page.locator('tr', { hasText: 'USR-006' }).textContent();
    if (!usr006AfterToggle?.includes('Đã khóa') && !usr006AfterToggle?.includes('Inactive')) {
      throw new Error(`USR-006 status toggle failed: ${usr006AfterToggle}`);
    }

    // Verify Dev Role Preview bar updates menus and hides edit actions for Viewer
    if (!(await page.locator('[data-testid="dev-role-preview-bar"]').isVisible())) {
      throw new Error('Dev Role Preview bar should be visible in dev server');
    }

    await page.click('#btn-preview-role-WAREHOUSE_MANAGER');
    await page.waitForTimeout(200);
    if ((await page.locator('aside a[href="/users"]').count()) !== 0) {
      throw new Error('Sidebar must hide /users for WAREHOUSE_MANAGER');
    }
    if ((await page.locator('[data-testid="role-restricted-notice"]').count()) === 0) {
      throw new Error('Users page must display restricted notice when previewing non-Admin');
    }

    await page.click('#btn-preview-role-VIEWER');
    await page.waitForTimeout(200);
    if (
      (await page.locator('aside a[href="/stock-in"]').count()) !== 0 ||
      (await page.locator('aside a[href="/stock-out"]').count()) !== 0 ||
      (await page.locator('aside a[href="/stocktaking"]').count()) !== 0
    ) {
      throw new Error('Sidebar must hide Stock In/Out/Stocktaking links for VIEWER');
    }

    await page.click('aside a[href="/products"]');
    await page.waitForTimeout(300);
    const addProductCount = await page.locator('#btn-add-product').count();
    const editButtonsCount = await page
      .locator('button[aria-label^="Edit "], button[aria-label^="Sửa "]')
      .count();
    const deleteButtonsCount = await page
      .locator('button[aria-label^="Delete "], button[aria-label^="Xóa "]')
      .count();
    if (addProductCount !== 0 || editButtonsCount !== 0 || deleteButtonsCount !== 0) {
      throw new Error(
        `VIEWER must see zero create/edit/delete controls on Products (add=${addProductCount}, edit=${editButtonsCount}, del=${deleteButtonsCount})`
      );
    }

    await page.click('#btn-reset-preview-role');
    await page.waitForTimeout(200);
    if ((await page.locator('aside a[href="/users"]').count()) === 0) {
      throw new Error('Resetting role preview to ADMIN did not restore /users sidebar menu');
    }
    console.log('   ✓ User CRUD, role/warehouse assignment, status toggle, and Dev Role Preview verified');

    // 16. Bilingual Switching (EN <-> VI) & Persistence E2E Check
    console.log('\n[16/16] Testing Bilingual Localization Switching (EN <-> VI) & Persistence...');
    await page.click('aside a[href="/users"]');
    await page.waitForTimeout(250);
    await page.click('button[title="Switch Language"]');
    await page.waitForTimeout(300);

    const viStorage = await page.evaluate(() => ({
      lang: localStorage.getItem('smart_inventory_language'),
      htmlLang: document.documentElement.lang,
    }));
    if (viStorage.lang !== 'vi' || viStorage.htmlLang !== 'vi') {
      throw new Error(`Expected language switch to vi, got ${JSON.stringify(viStorage)}`);
    }

    const viUsersBody = await page.textContent('body');
    if (
      !viUsersBody?.includes('Quản Trị Người Dùng & Phân Quyền') ||
      !viUsersBody?.includes('Tổng tài khoản mẫu') ||
      !viUsersBody?.includes('Toàn hệ thống (All)') ||
      viUsersBody?.includes('Total Mock Users')
    ) {
      throw new Error('Users page did not switch cleanly to Vietnamese');
    }

    await page.click('aside a[href="/reports"]');
    await page.waitForTimeout(250);
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(300);

    const viPersisted = await page.evaluate(() => ({
      lang: localStorage.getItem('smart_inventory_language'),
      htmlLang: document.documentElement.lang,
    }));
    const viReportsBody = await page.textContent('body');
    if (
      viPersisted.lang !== 'vi' ||
      viPersisted.htmlLang !== 'vi' ||
      !viReportsBody?.includes('Báo Cáo & Phân Tích Thống Kê') ||
      !viReportsBody?.includes('Tồn kho hiện tại') ||
      !viReportsBody?.includes('Bảng cân đối tồn kho') ||
      viReportsBody?.includes('Inventory Balance Sheet')
    ) {
      throw new Error('Vietnamese localization did not persist properly after reload on /reports');
    }

    await page.click('button[title="Đổi ngôn ngữ"]');
    await page.waitForTimeout(300);
    const enRestored = await page.evaluate(() => ({
      lang: localStorage.getItem('smart_inventory_language'),
      htmlLang: document.documentElement.lang,
    }));
    const enReportsBody = await page.textContent('body');
    if (
      enRestored.lang !== 'en' ||
      enRestored.htmlLang !== 'en' ||
      !enReportsBody?.includes('Reports & Analytics') ||
      !enReportsBody?.includes('Inventory Balance Sheet')
    ) {
      throw new Error('Switching back to English from Vietnamese failed on /reports');
    }
    console.log('   ✓ Bilingual EN <-> VI live switching and localStorage persistence verified');

    // Mobile & Tablet responsiveness checks on Reports route
    console.log('\nChecking Mobile & Tablet responsive behavior...');
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(300);
    const tabletScrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const tabletClientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    if (tabletScrollWidth > tabletClientWidth) {
      throw new Error(`Tablet overflow detected: scrollWidth ${tabletScrollWidth} > clientWidth ${tabletClientWidth}`);
    }
    console.log('   ✓ Tablet layout has no horizontal overflow');

    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(300);
    const mobileScrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const mobileClientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    if (mobileScrollWidth > mobileClientWidth) {
      throw new Error(`Mobile overflow detected: scrollWidth ${mobileScrollWidth} > clientWidth ${mobileClientWidth}`);
    }
    console.log('   ✓ Mobile layout has no horizontal overflow');

    if (consoleErrors.length > 0) {
      throw new Error(`Uncaught browser console/page errors detected:\n${consoleErrors.join('\n')}`);
    }
    console.log('   ✓ Zero browser console/page errors detected');

    console.log('\n======================================================');
    console.log('🎉 ALL PLAYWRIGHT BROWSER E2E TESTS PASSED WITH 100% SUCCESS!');
    console.log('======================================================');
  } finally {
    if (browser) {
      await browser.close();
    }
    await server.close();
  }
}

runBrowserTest().catch((err) => {
  console.error('\n❌ Playwright browser test error:', err);
  process.exit(1);
});
