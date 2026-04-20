const axios = require('axios');

const url = 'http://localhost:5000/api/admin/view-document?key=pending/applications/nicFront-1775716300920-472911825.jpg';

async function test() {
    try {
        const res = await axios.get(url);
        console.log('Headers:', res.headers);
    } catch (err) {
        console.log('Error');
    }
}

test();
