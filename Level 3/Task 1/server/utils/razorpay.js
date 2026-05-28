const crypto = require('crypto');
const https = require('https');

const requireRazorpayConfig = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    const error = new Error('Razorpay credentials are not configured');
    error.statusCode = 500;
    throw error;
  }
};

const createRazorpayOrder = ({ amount, currency = 'INR', receipt }) => {
  requireRazorpayConfig();

  const payload = JSON.stringify({
    amount: Math.round(amount * 100),
    currency,
    receipt,
    payment_capture: 1
  });

  const auth = Buffer
    .from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`)
    .toString('base64');

  const options = {
    hostname: 'api.razorpay.com',
    path: '/v1/orders',
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  };

  return new Promise((resolve, reject) => {
    const request = https.request(options, (response) => {
      let body = '';

      response.on('data', (chunk) => {
        body += chunk;
      });

      response.on('end', () => {
        const parsedBody = body ? JSON.parse(body) : {};

        if (response.statusCode >= 400) {
          const error = new Error(parsedBody.error?.description || 'Razorpay order creation failed');
          error.statusCode = response.statusCode;
          reject(error);
          return;
        }

        resolve(parsedBody);
      });
    });

    request.on('error', reject);
    request.write(payload);
    request.end();
  });
};

const verifyRazorpaySignature = ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
  requireRazorpayConfig();

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  return expectedSignature === razorpaySignature;
};

module.exports = {
  createRazorpayOrder,
  verifyRazorpaySignature
};
