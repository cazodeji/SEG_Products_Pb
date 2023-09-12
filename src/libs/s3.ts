import { S3 } from 'aws-sdk';

import logger from './logger';

const s3 = new S3();
export default {
  async _listBucketObjects(bucketName: string, prefix: string) {
    const params = {
      Bucket: bucketName,
      Prefix: prefix,
    };
    try {
      const objects = await s3.listObjectsV2(params).promise();
      return objects;
    } catch (error: any) {
      logger.error('Failed to fetch objects from S3: ', error);
    }
  },
  async _getObject(bucketName: string, key: string) {
    const params = {
      Bucket: bucketName,
      Key: key,
    };
    try {
      const object = await s3.getObject(params).promise();
      return object;
    } catch (error: any) {
      logger.error('Failed to fetch object from S3: ', error);
      throw error;
    }
  },
  async _getSignedUrl(bucketName: string, key: string, expires = 3600) {
    try {
      return await s3.getSignedUrlPromise('getObject', {
        Bucket: bucketName,
        Key: key,
        Expires: expires,
      });
    } catch (error: any) {
      logger.error('Failed to get signed URL from S3: ', error);
    }
  },
};
