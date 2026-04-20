const axios = require('axios');
const fs = require('fs');

async function testApi() {
    try {
        const token = fs.readFileSync('token.txt', 'utf8').trim();
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        console.log('Fetching pending approvals...');
        const res = await axios.get('http://localhost:5000/api/admin/approvals', config);
        
        const pending = res.data.data.approvals;
        if (pending.length === 0) {
            console.log('No pending approvals found!');
            return;
        }
        
        const targetId = pending[0].approvalId || pending[0]._id;
        console.log(`Approving application: ${targetId}`);
        
        try {
            const approveRes = await axios.post(`http://localhost:5000/api/admin/approvals/${targetId}/approve`, {}, config);
            console.log('Approve Success');
            fs.writeFileSync('output.txt', JSON.stringify(approveRes.data, null, 2));
        } catch (error) {
            console.log('Approve Failed');
            fs.writeFileSync('output.txt', JSON.stringify(error.response?.data || error.message, null, 2));
        }
        
    } catch (error) {
        console.error('Approve setup failed:', error.message);
    }
}

testApi();
