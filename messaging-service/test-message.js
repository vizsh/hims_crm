/**
 * Test Script for WhatsApp Messaging API
 * Run with: npm test
 */

const http = require('http');

const API_URL = 'http://localhost:5000';

// Test data
const testConfigs = {
  healthCheck: {
    method: 'GET',
    path: '/health',
    name: 'Health Check'
  },
  serviceStatus: {
    method: 'GET',
    path: '/status',
    name: 'Service Status'
  },
  sendSingleMessage: {
    method: 'POST',
    path: '/send-message',
    name: 'Send Single Message',
    body: {
      phoneNumber: '+917400291925',
      message: 'Hi, this is a booking reminder. Your appointment is confirmed.',
      patientName: 'Test Patient',
      appointmentDate: '2024-03-30'
    }
  },
  sendAppointmentReminder: {
    method: 'POST',
    path: '/send-appointment-reminder',
    name: 'Send Appointment Reminder',
    body: {
      phoneNumber: '+917400291925',
      patientName: 'Test Patient',
      appointmentDate: '2024-03-30',
      appointmentTime: '2:00 PM',
      doctorName: 'Dr. Smith'
    }
  }
};

/**
 * Make HTTP request
 */
function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({
            status: res.statusCode,
            statusText: res.statusMessage,
            body: parsed
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            statusText: res.statusMessage,
            body: data
          });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

/**
 * Run tests
 */
async function runTests() {
  console.log('\n' + '='.repeat(70));
  console.log('🧪 WhatsApp Messaging API - Test Suite');
  console.log('='.repeat(70) + '\n');

  const tests = [
    { key: 'healthCheck', shouldRun: true },
    { key: 'serviceStatus', shouldRun: true },
    { key: 'sendSingleMessage', shouldRun: true },
    { key: 'sendAppointmentReminder', shouldRun: true }
  ];

  for (const test of tests) {
    if (!test.shouldRun) continue;

    const config = testConfigs[test.key];
    console.log(`\n📌 Test: ${config.name}`);
    console.log(`   ${config.method} ${config.path}`);

    try {
      const response = await makeRequest(config.method, config.path, config.body);

      console.log(`   Status: ${response.status} ${response.statusText}`);

      if (response.body.success !== undefined) {
        console.log(`   Result: ${response.body.success ? '✅ SUCCESS' : '❌ FAILED'}`);

        if (response.body.success && response.body.data) {
          console.log(`   Data:`, JSON.stringify(response.body.data, null, 4));
        } else if (response.body.error) {
          console.log(`   Error: ${response.body.error}`);
        }
      } else {
        console.log(`   Response:`, JSON.stringify(response.body, null, 4));
      }

    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('✅ Test suite completed');
  console.log('='.repeat(70) + '\n');
}

// Run tests
console.log('⏳ Connecting to server at', API_URL);
console.log('Make sure the server is running: npm start\n');

setTimeout(runTests, 1000);
