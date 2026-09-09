require('dotenv').config();
const axios = require('axios');

const BASE_URL = process.env.TEST_URL || `http://localhost:${process.env.PORT || 8228}`;

const WAITLIST_ENDPOINT = `${BASE_URL}/api/v1/waitlist`;


async function runTests() {
  console.log(`\n==============================================`);
  console.log(`🚀 Testing Waitlist API at: ${WAITLIST_ENDPOINT}`);
  console.log(`==============================================\n`);

  const uniqueEmail = `adaeze.${Date.now()}@example.com`;

  // Test 1: Valid Registration
  console.log(`🔹 Test 1: Registering a new user on the waitlist...`);
  try {
    const payload = {
      firstName: "Adaeze",
      lastName: "Agnes",
      email: uniqueEmail,
      amountRange: "5000-100000-annually"
    };

    const res = await axios.post(WAITLIST_ENDPOINT, payload);

    console.log(`✅ Status: ${res.status} (Created)`);
    console.log(`📦 Response:`, JSON.stringify(res.data, null, 2));

    if (
      res.data.success === true &&
      res.data.data.firstName === "Adaeze" &&
      res.data.data.email === uniqueEmail.toLowerCase() &&
      res.data.data.signupBonus === 5000 &&
      res.data.data.referralReward === 2000 &&
      typeof res.data.data.referralCode === "string" &&
      typeof res.data.data.referralLink === "string"
    ) {
      console.log(`✅ Test 1 PASSED: All fields match requirements!\n`);
    } else {
      console.error(`❌ Test 1 FAILED: Unexpected response shape\n`);
    }
  } catch (error) {
    console.error(`❌ Test 1 FAILED:`, error.response?.data || error.message);
  }

  // Test 2: Duplicate Email Prevention
  console.log(`🔹 Test 2: Attempting duplicate registration with same email...`);
  try {
    const payload = {
      firstName: "Adaeze",
      lastName: "Agnes",
      email: uniqueEmail,
      amountRange: "5000-100000-annually"
    };

    await axios.post(WAITLIST_ENDPOINT, payload);
    console.error(`❌ Test 2 FAILED: Duplicate email should have been rejected!\n`);
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log(`✅ Status: ${error.response.status} (Bad Request)`);
      console.log(`📦 Response:`, JSON.stringify(error.response.data, null, 2));
      console.log(`✅ Test 2 PASSED: Duplicate email successfully rejected!\n`);
    } else {
      console.error(`❌ Test 2 FAILED with unexpected error:`, error.message);
    }
  }

  // Test 3: Validation Error (Invalid amount range)
  console.log(`🔹 Test 3: Testing validation with invalid amountRange...`);
  try {
    const payload = {
      firstName: "Adaeze",
      lastName: "Agnes",
      email: `invalid.${Date.now()}@example.com`,
      amountRange: "invalid-range-value"
    };

    await axios.post(WAITLIST_ENDPOINT, payload);
    console.error(`❌ Test 3 FAILED: Invalid amountRange should have been rejected!\n`);
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log(`✅ Status: ${error.response.status} (Bad Request)`);
      console.log(`📦 Response:`, JSON.stringify(error.response.data, null, 2));
      console.log(`✅ Test 3 PASSED: Validation error handled correctly!\n`);
    } else {
      console.error(`❌ Test 3 FAILED with unexpected error:`, error.message);
    }
  }

  // Test 4: Validation Error (Missing required fields)
  console.log(`🔹 Test 4: Testing missing required fields...`);
  try {
    const payload = {
      email: `missing.${Date.now()}@example.com`
    };

    await axios.post(WAITLIST_ENDPOINT, payload);
    console.error(`❌ Test 4 FAILED: Missing fields should have been rejected!\n`);
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log(`✅ Status: ${error.response.status} (Bad Request)`);
      console.log(`📦 Response:`, JSON.stringify(error.response.data, null, 2));
      console.log(`✅ Test 4 PASSED: Missing field error handled correctly!\n`);
    } else {
      console.error(`❌ Test 4 FAILED with unexpected error:`, error.message);
    }
  }

  // Test 5: Verify Waitlist Email
  console.log(`🔹 Test 5: Verifying waitlist email with token...`);
  try {
    const signupRes = await axios.post(WAITLIST_ENDPOINT, {
      firstName: "Chidi",
      lastName: "Okafor",
      email: `chidi.${Date.now()}@example.com`,
      amountRange: "5000-100000-annually",
    });

    const token = signupRes.data.data.verificationToken;
    console.log(`Generated Token: ${token}`);

    const verifyRes = await axios.post(`${BASE_URL}/api/v1/waitlist/verify`, {
      token,
    });

    console.log(`✅ Status: ${verifyRes.status}`);
    console.log(`📦 Verification Response:`, JSON.stringify(verifyRes.data, null, 2));

    if (
      verifyRes.data.success === true &&
      verifyRes.data.data.isVerified === true &&
      typeof verifyRes.data.data.waitlistPosition === "number"
    ) {
      console.log(
        `✅ Test 5 PASSED: Email successfully verified! Waitlist Position: #${verifyRes.data.data.waitlistPosition}\n`
      );
    } else {
      console.error(`❌ Test 5 FAILED: Expected verified status and waitlistPosition\n`);
    }
  } catch (error) {
    console.error(`❌ Test 5 FAILED:`, error.response?.data || error.message);
  }

  // Test 6: Resend Verification Email
  console.log(`🔹 Test 6: Resending verification email...`);
  try {
    const unverifiedEmail = `unverified.${Date.now()}@example.com`;
    await axios.post(WAITLIST_ENDPOINT, {
      firstName: "Emeka",
      lastName: "Nnamdi",
      email: unverifiedEmail,
      amountRange: "5000-100000-annually",
    });

    const resendRes = await axios.post(
      `${BASE_URL}/api/v1/waitlist/resend-verification`,
      { email: unverifiedEmail }
    );

    console.log(`✅ Status: ${resendRes.status}`);
    console.log(`📦 Resend Response:`, JSON.stringify(resendRes.data, null, 2));

    if (resendRes.data.success === true && resendRes.data.data.verificationToken) {
      console.log(`✅ Test 6 PASSED: Verification email resent successfully!\n`);
    } else {
      console.error(`❌ Test 6 FAILED\n`);
    }
  } catch (error) {
    console.error(`❌ Test 6 FAILED:`, error.response?.data || error.message);
  }

  console.log(`==============================================`);
  console.log(`🎉 All test scenarios finished!`);
  console.log(`==============================================\n`);
}

runTests();

