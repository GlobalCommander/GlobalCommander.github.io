const https = require('https');

exports.handler = async (event) => {
  const CLOUD_NAME = 'di4mtligs';
  const API_KEY = '173888192549935';
  const API_SECRET = 'ocY9xfkco9Zz6bQCrffd9fcX7eI';

  const auth = Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64');
  const path = `/v1_1/${CLOUD_NAME}/resources/search`;
  const body = JSON.stringify({
    expression: 'folder=katiebor',
    max_results: 500,
    with_field: ['context', 'tags']
  });

  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'api.cloudinary.com',
      path,
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
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
    req.write(body);
    req.end();
  });
};
