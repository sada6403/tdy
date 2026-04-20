const axios = require('axios');
const fs = require('fs');

const url = 'http://localhost:5000/api/admin/view-document?key=pending/applications/nicFront-1775716300920-472911825.jpg';

async function test() {
    try {
        console.log('Fetching:', url);
        const res = await axios.get(url, { responseType: 'arraybuffer' });
        console.log('Status:', res.status);
        console.log('Content-Type:', res.headers['content-type']);
        console.log('Length:', res.data.length);
        fs.writeFileSync('test_image.jpg', res.data);
        console.log('Saved to test_image.jpg');
    } catch (err) {
        console.error('Error:', err.message);
        if (err.response) {
            console.error('Response Data:', err.response.data.toString());
        }
    }
}

test();
