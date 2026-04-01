const https = require('https');
const crypto = require('crypto');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  const CLOUD_NAME = 'di4mtligs';
  const API_KEY = '173888192549935';
  const API_SECRET = 'ocY9xfkco9Zz6bQCrffd9fcX7eI';

  const { publicId, title, loc, cat, active } = JSON.parse(event.body);
  const timestamp = Math.floor(Date.now() / 1000);
  const context = `title=${title}|loc=${loc}|cat=${cat}|active=${active}`;

  // Generate signature
  const sigStr = `context=${context}&public_id=${publicId}&timestamp=${timestamp}${API_SECRET}`;
  const signature = crypto.createHash('sha1').update(sigStr).digest('hex');

  const postData = new URLSearchParams({
    public_id: publicId,
    context,
    api_key: API_KEY,
    timestamp,
    signature
  }).toString();

  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'api.cloudinary.com',
      path: `/v1_1/${CLOUD_NAME}/context`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: data
        });
      });
    });
    req.on('error', (e) => {
      resolve({
        statusCode: 500,
        body: JSON.stringify({ error: e.message })
      });
    });
    req.write(postData);
    req.end();
  });
};
