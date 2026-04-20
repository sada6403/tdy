const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const path = require('path');
// Use absolute path for dotenv to be safe
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

async function testS3() {
    console.log('Testing S3 with Key ID:', process.env.AWS_ACCESS_KEY_ID);
    console.log('Bucket:', process.env.AWS_S3_BUCKET_NAME);
    const key = 'pending/applications/nicFront-1776612690132-462570035.jpg';
    const command = new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key
    });

    try {
        const response = await s3.send(command);
        console.log('Success! ContentType:', response.ContentType);
    } catch (error) {
        console.error('FAILED!');
        console.error('Error Code:', error.name);
        console.error('Error Message:', error.message);
        if (error.$metadata) {
            console.error('HTTP Status:', error.$metadata.httpStatusCode);
        }
    }
}

testS3();
