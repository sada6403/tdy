const mongoose = require('mongoose');
async function checkLocal() {
    try {
        await mongoose.connect('mongodb://localhost:27017/test', { serverSelectionTimeoutMS: 2000 });
        console.log('LOCAL_MONGODB_AVAILABLE');
        process.exit(0);
    } catch (err) {
        console.log('LOCAL_MONGODB_NOT_AVAILABLE');
        process.exit(0);
    }
}
checkLocal();
