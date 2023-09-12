import { formatJSONResponse } from '@sg/libs/api-gateway';
import { ServerError } from '@sg/libs/error';
import { middyfy } from '@sg/libs/lambda';
import logger from '@sg/libs/logger';
import s3 from '@sg/libs/s3';
import ssmService from '@sg/libs/ssm';
import brokerConfigRepository from '@sg/repositories/brokerConfigs';
import ProductRepository from '@sg/repositories/product';
import { Broker } from '@sg/types/product';

const handler = async (event) => {
  try {
    const { productId, brokerId } = event.pathParameters;

    const product = new ProductRepository();
    const brokerConfigs = new brokerConfigRepository();

    const data = await product.get({ id: productId });

    // Broker data
    data.brokers = data.brokers.filter((b) => b[brokerId]);
    removePropertiesFromBrokers(data.brokers, ['insurers', 'nominalCodes']);

    data.state = data.brokers.length ? data.brokers[0][brokerId]?.state ?? 'notActive' : 'notActive';

    // Stripe Public key
    let defaultStripePK;
    try {
      defaultStripePK = await ssmService.getSecureParameter('/seg-product-builder/stripe-default-pk');
    } catch (error: any) {
      logger.error('Failed to retrieve default stripe PK: ' + error.message);
    }

    try {
      const brokerConfig = await brokerConfigs.get({ brokerId: brokerId });
      data.brokers[0][brokerId].stripePK = brokerConfig.stripePK ?? defaultStripePK;
    } catch (error: any) {
      logger.error('Failed to get broker config from seg-broker-configs' + error.message);
      const brokerConfigExits = data.brokers.find((b) => b[brokerId]);
      if (brokerConfigExits) {
        data.brokers[0][brokerId].stripePK = defaultStripePK;
      } else {
        data.brokers[0] = {
          [brokerId]: {
            stripePK: defaultStripePK,
          } as any,
        };
      }
    }

    // Documents
    const bucketName = await ssmService.getParameter('/seg-product-builder/pdf/seg-file-upload-bucket');

    let documents;
    try {
      documents = await s3._listBucketObjects(bucketName, `static-docs/approved/${productId}`);
      documents = await prepareDocs(bucketName, documents);
      data.documents = documents;
    } catch (error: any) {
      logger.error('Failed to list documents: ' + error.message);
    }

    return formatJSONResponse({
      statusCode: 200,
      message: 'Product retrieved successfully',
      data,
    });
  } catch (ex) {
    return formatJSONResponse({
      statusCode: ex.statusCode || 500,
      message: ex.message,
    });
  }
};

export const main = middyfy(handler);

export function removePropertiesFromBrokers(brokers: Broker[], properties: string[]) {
  if (brokers.length === 0) return brokers;
  for (const broker of brokers) {
    const brokerId = Object.keys(broker)[0];
    const brokerData = broker[brokerId];

    for (const property of properties) {
      delete brokerData[property];
    }
  }

  return brokers;
}

export async function prepareDocs(bucketName: string, docs: any) {
  const files: {
    url: string;
    fileName: string;
    key: string;
    humanName: string;
  }[] = [];

  for (const doc of docs.Contents) {
    const url = await s3._getSignedUrl(bucketName, doc.Key);
    const fileName = doc.Key.split('/')[doc.Key.split('/').length - 1];
    const humanName = doc.Key.split('/')
      [doc.Key.split('/').length - 1].replace(/-/g, ' ')
      .split(' ')
      .map((string) => string.charAt(0).toUpperCase() + string.slice(1))
      .join(' ')
      .replace(/.pdf/g, '');

    if (fileName === '.DS_Store') continue;

    files.push({
      key: doc.Key,
      url,
      fileName,
      humanName,
    });
  }

  return files;
}
