const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  region: process.env.AWS_S3_REGION,
  maxRetries: 15,
  apiVersion: '2006-03-01',
});

module.exports = {
  uploadJSONData(jsonData) {
    return s3.putObject({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: process.env.AWS_S3_DATA_KEY,
      ACL: 'private',
      Body: JSON.stringify(jsonData),
    }).promise();
  },
};
