import config from '../config';
import fs from 'fs';
import fsPromises from 'fs/promises';
import AWS from 'aws-sdk';

let s3: AWS.S3;
if (config.storage.type === 'local' && !fs.existsSync(config.storage.path)) {
    fs.mkdirSync(config.storage.path);
} else if (config.storage.type === 'spaces') {
    const spacesEndpoint = new AWS.Endpoint(config.storage.spacesEndPoint);
    s3 = new AWS.S3({
        endpoint: spacesEndpoint,
        accessKeyId: config.storage.spacesKey,
        secretAccessKey: config.storage.spacesSecret,
    });
}

export default {
    write: async (name: string, content: string) => {
        if (config.storage.type === 'local') {
            fsPromises.writeFile(config.storage.path + name, content);
        } else if (config.storage.type === 'spaces') {
            s3.putObject({
                Bucket: config.storage.spacesName,
                Key: config.storage.path + name,
                Body: content,
                ACL: 'public-read',
            }).promise();
        }
    },
    read: async (name: string) => {
        if (config.storage.type === 'local') {
            return fsPromises.readFile(config.storage.path + name, 'utf-8');
        } else if (config.storage.type === 'spaces') {
            return new Promise(async (resolve) => {
                const data = await s3
                    .getObject({
                        Bucket: config.storage.spacesName,
                        Key: config.storage.path + name,
                    })
                    .promise();
                resolve(data.Body.toString());
            });
        }
    },
    exist: async (name: string) => {
        return new Promise(async (resolve) => {
            let result = true;
            if (config.storage.type === 'local') {
                try {
                    await fsPromises.access(config.storage.path + name);
                } catch (headErr) {
                    result = false;
                }
            } else if (config.storage.type === 'spaces') {
                try {
                    await s3
                        .headObject({
                            Bucket: config.storage.spacesName,
                            Key: config.storage.path + name,
                        })
                        .promise();
                } catch (headErr) {
                    if (headErr.code === 'NotFound') {
                        result = false;
                    }
                }
            }
            resolve(result);
        });
    },
    delete: async (list: string[]) => {
        return s3
            .deleteObjects(
                {
                    Bucket: config.storage.spacesName,
                    Delete: {
                        Objects: list.map((item) => ({
                            Key: item,
                        })),
                        Quiet: false,
                    },
                },
                () => {},
            )
            .promise();
    },
    list: async (prefix: string) => {
        return <Promise<string[]>>new Promise(async (resolve) => {
            const data = await s3
                .listObjectsV2(
                    {
                        Bucket: config.storage.spacesName,
                        Prefix: config.storage.path + prefix,
                    },
                    () => {},
                )
                .promise();
            resolve(data.Contents.map((content) => content.Key));
        });
    },
};
