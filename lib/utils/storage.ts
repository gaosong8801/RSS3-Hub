import config from '../config';
import AWS from 'aws-sdk';

// https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html
let s3: AWS.S3;
const spacesEndpoint = new AWS.Endpoint(config.storage.spacesEndPoint);
s3 = new AWS.S3({
    endpoint: spacesEndpoint,
    accessKeyId: config.storage.spacesKey,
    secretAccessKey: config.storage.spacesSecret,
});

export default {
    write: async (content: RSS3Content) => {
        s3.putObject({
            Bucket: config.storage.spacesName,
            Key: config.storage.path + content.id,
            Body: JSON.stringify(content),
            ACL: 'public-read',
        }).promise();
    },
    read: async (id: string) => {
        return new Promise<RSS3Content>(async (resolve, reject) => {
            let data;
            try {
                data = await s3
                    .getObject({
                        Bucket: config.storage.spacesName,
                        Key: config.storage.path + id,
                    })
                    .promise();
            } catch (error) {
                reject(error);
            }
            resolve(JSON.parse(data.Body.toString()));
        });
    },
    exist: async (id: string) => {
        return new Promise<boolean>(async (resolve) => {
            let result = true;
            try {
                await s3
                    .headObject({
                        Bucket: config.storage.spacesName,
                        Key: config.storage.path + id,
                    })
                    .promise();
            } catch (headErr) {
                if (headErr.code === 'NotFound') {
                    result = false;
                }
            }
            resolve(result);
        });
    },
};
