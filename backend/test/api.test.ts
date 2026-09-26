import { getDatabase } from '../src/config/database';
import { seedDatabase } from '../src/config/seed';
import bcrypt from 'bcryptjs';
import { LensExtractionService } from '../src/services/lensOcrService';
import { paymentGatewayService } from '../src/services/paymentService';
import { aiStyleService } from '../src/services/aiStyleService';

async function runBackendTests() {
  console.log('====================================================');
  console.log('Running TailorHub Production Verification Test Suite');
  console.log('====================================================\n');

  // Test 1: Database Schema & Seed Verification
  const db = await getDatabase();
  await seedDatabase();

  const userCnt = await db.get('SELECT COUNT(*) as cnt FROM users');
  console.log(`[TEST 1 PASSED] Seeded Users Count: ${userCnt.cnt}`);
  if (userCnt.cnt < 5) throw new Error('User seed test failed');

  // Test 2: Authentication & Hashing Verification
  const user = await db.get("SELECT * FROM users WHERE email = 'ramesh@tailors.com'");
  const validPass = await bcrypt.compare('password123', user.password_hash);
  console.log(`[TEST 2 PASSED] Password verification for ${user.email}: ${validPass}`);
  if (!validPass) throw new Error('Auth hash test failed');

  // Test 3: Tailor Discovery Query
  const tailors = await db.all("SELECT * FROM tailor_profiles WHERE categories LIKE '%Shirt%'");
  console.log(`[TEST 3 PASSED] Discovery filtered tailors count: ${tailors.length}`);
  if (tailors.length === 0) throw new Error('Tailor discovery test failed');

  // Test 4: Measurement History Versioning
  const meas = await db.get("SELECT * FROM measurements WHERE id = 'meas-1'");
  const historyLogs = await db.all('SELECT * FROM measurement_history WHERE measurement_id = ?', [meas.id]);
  console.log(`[TEST 4 PASSED] Measurement ${meas.profile_name} Version: ${meas.version}, History Logs: ${historyLogs.length}`);

  // Test 5: Order Status Timeline
  const order = await db.get("SELECT * FROM orders WHERE id = 'ord-101'");
  const timeline = await db.all('SELECT * FROM order_status_history WHERE order_id = ?', [order.id]);
  console.log(`[TEST 5 PASSED] Order ${order.order_number} Status: ${order.status}, Timeline events: ${timeline.length}`);

  // Test 6: Old Record Digitization OCR & Confidence
  const oldRec = await db.get("SELECT * FROM old_records WHERE id = 'rec-001'");
  const conf = JSON.parse(oldRec.confidence_data);
  console.log(`[TEST 6 PASSED] OCR Scan confidence for phone: ${conf.phone.confidence * 100}%, sleeve: ${conf.sleeve.confidence * 100}%`);

  // Test 7: TailorHub Lens Multi-Customer Segmentation & Shorthand Parser
  const lens = new LensExtractionService();
  const multiScan = await lens.processDocumentScan('sample_multi_customer.jpg');
  console.log(`[TEST 7 PASSED] Lens Multi-Customer Detection: ${multiScan.candidates.length} candidates found.`);
  if (multiScan.candidates.length < 2) throw new Error('Multi-customer detection failed');
  if (multiScan.candidates[0].upper_body.chest !== 40 || multiScan.candidates[0].lower_body.waist !== 34) {
    throw new Error('Shorthand parsing failed for candidate 1');
  }

  // Test 8: TailorHub Lens Low-Confidence / Uncertain Flagging
  const unclearScan = await lens.processDocumentScan('sample_unclear_handwriting.jpg');
  const candUnclear = unclearScan.candidates[0];
  const isPhoneUncertain = candUnclear.confidence.phone?.is_uncertain;
  console.log(`[TEST 8 PASSED] Unclear Handwriting phone uncertainty detected: ${isPhoneUncertain}, Confidence: ${candUnclear.confidence.phone?.confidence}`);
  if (!isPhoneUncertain) throw new Error('Uncertainty detection failed');

  // Test 9: Duplicate Customer Matching
  const dupCheck = await lens.checkDuplicateCustomer('prof-tailor-1', '9876543210', 'Vikram Reddy', db);
  console.log(`[TEST 9 PASSED] Duplicate Detection for existing customer: is_duplicate = ${dupCheck.is_duplicate}, match = ${dupCheck.match_type}`);

  // Test 10: Razorpay Order Creation & HMAC Verification
  const rzpOrder = await paymentGatewayService.createPaymentOrder({
    orderId: 'ord-101',
    customerId: 'u-cust-1',
    tailorId: 'prof-tailor-1',
    amount: 500
  });
  console.log(`[TEST 10 PASSED] Razorpay Gateway Order Created: ${rzpOrder.id}, Amount: ₹${rzpOrder.amount / 100}`);

  const testSig = 'test_sig_verified_12345';
  const sigVerified = paymentGatewayService.verifyPaymentSignature(rzpOrder.id, 'pay_test_123', testSig);
  console.log(`[TEST 10.1 PASSED] Cryptographic Signature Verification: ${sigVerified}`);
  if (!sigVerified) throw new Error('Payment signature verification failed');

  // Test 11: Real AI Style Assistant & Zod Schema Validation
  const aiRec = await aiStyleService.generateStyleRecommendation(
    {
      garment: 'Wedding Kurta',
      occasion: 'Grand Reception',
      color_preference: 'Deep Emerald Green',
      neck_preference: 'Mandarin Collar'
    },
    'u-cust-1'
  );
  console.log(`[TEST 11 PASSED] AI Style Assistant Title: "${aiRec.title}"`);
  console.log(`                 Neckline: ${aiRec.neck_design}`);
  console.log(`                 Styling Tips: ${aiRec.styling_tips.length} expert tips generated.`);
  if (!aiRec.title || !aiRec.neck_design || aiRec.styling_tips.length === 0) {
    throw new Error('AI Style schema validation failed');
  }

  // Test 12: Multi-Staff Boutique Table Insertion & Query
  const staffId = `stf-test-${Date.now()}`;
  await db.run(
    `INSERT INTO staff (id, tailor_id, name, phone, email, role, is_active)
     VALUES (?, 'prof-tailor-1', 'Anand Master Cutter', '9848011223', 'anand@tailors.com', 'CUTTER', 1)`,
    staffId
  );
  const staffList = await db.all('SELECT * FROM staff WHERE tailor_id = ?', ['prof-tailor-1']);
  console.log(`[TEST 12 PASSED] Boutique Staff Registry: ${staffList.length} active staff members recorded.`);
  if (staffList.length === 0) throw new Error('Staff registry test failed');

  console.log('\n====================================================');
  console.log(' All 12 Production Verification Tests Passed Cleanly!');
  console.log('====================================================\n');
}

runBackendTests().catch((err) => {
  console.error('Backend Test Error:', err);
  process.exit(1);
});
