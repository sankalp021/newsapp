// This is a standalone utility for testing the NewsDataHub API connection
// It's not part of the main application but kept for troubleshooting purposes
// Run with: node src/utils/test-api.js

const https = require('https');
require('dotenv').config({ path: '.env.local' });

const apiKey = process.env.NEWSDATA_API_KEY;

if (!apiKey) {
  console.error('API key not found in environment variables');
  process.exit(1);
}

console.log('Using API key:', apiKey.substring(0, 5) + '...');

// Simple parameters for testing - no need for per_page
const path = `/v1/news`;

const options = {
  hostname: 'api.newsdatahub.com',
  path: path,
  method: 'GET',
  headers: {
    'X-Api-Key': apiKey,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'User-Agent': 'ByteNewz/1.0'
  }
};

console.log('Request URL:', `https://${options.hostname}${options.path}`);

const req = https.request(options, res => {
  console.log(`Status code: ${res.statusCode}`);
  console.log('Headers:', res.headers);
  
  let data = '';
  
  res.on('data', chunk => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const parsedData = JSON.parse(data);
      console.log('Response structure:', Object.keys(parsedData));
      
      if (parsedData.data && Array.isArray(parsedData.data)) {
        console.log(`Received ${parsedData.data.length} articles`);
        console.log('First article title:', parsedData.data[0]?.title);
        
        // Also log the actual structure of the first article to better understand the API
        console.log('First article structure:', Object.keys(parsedData.data[0]));
      } else {
        console.log('Unexpected response format:', parsedData);
      }
    } catch (e) {
      console.error('Failed to parse response:', e);
      console.log('Raw response:', data.substring(0, 500) + '...');
    }
  });
});

req.on('error', error => {
  console.error('Error:', error);
});

req.end();
