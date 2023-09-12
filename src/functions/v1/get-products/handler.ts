import { AWSError } from 'aws-sdk';
import { ListObjectsV2Output } from 'aws-sdk/clients/s3';
import { PromiseResult } from 'aws-sdk/lib/request';

import { formatJSONResponse } from '@sg/libs/api-gateway';
import { middyfy } from '@sg/libs/lambda';
import logger from '@sg/libs/logger';
import s3 from '@sg/libs/s3';
import ssmService from '@sg/libs/ssm';
import brokerConfigRepository from '@sg/repositories/brokerConfigs';
import ProductRepository from '@sg/repositories/product';
import { Product } from '@sg/types/product';

import { prepareDocs, removePropertiesFromBrokers } from '../get-product/handler';

const handler = async (event) => {
  const failedCalls = [];
  try {
    const { brokerId } = event?.pathParameters;
    const limit = event?.queryStringParameters?.limit ?? 100;
    const lastKey = event?.queryStringParameters?.lastKey;
    const page = event?.queryStringParameters?.page ?? 1;

    const product = new ProductRepository();
    const brokerConfigs = new brokerConfigRepository();
    const baseUrl = String(await ssmService.getParameter('/seg-product-builder/whitelabel-url'));

    const results = await product.scan({
      Limit: limit,
      ExclusiveStartKey:
        page > 1
          ? {
              id: lastKey,
            }
          : undefined,
    });

    logger.info(`Scanned ${results.Items.length} items`);

    let response = [];
    for (const data of results.Items as Product[]) {
      try {
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

        if (data.brokers.length === 0) {
          data.links = { addbroker: `${baseUrl}pb-api/v1/product/add-broker/${brokerId}/${data.id}` };
        }

        // Documents
        const bucketName = await ssmService.getParameter('/seg-product-builder/pdf/seg-file-upload-bucket');

        let documents: any[] | PromiseResult<ListObjectsV2Output, AWSError>;
        try {
          documents = await s3._listBucketObjects(bucketName, `static-docs/approved/${data.id}`);
          documents = await prepareDocs(bucketName, documents);
          data.documents = documents;
        } catch (error: any) {
          logger.error('Failed to list documents: ' + error.message);
        }
        response.push({ data });
      } catch (error) {
        failedCalls.push({
          id: data.id,
          reason: error,
        });
        continue;
      }
    }

    if (failedCalls.length) {
      logger.error(`Failed Calls: `, failedCalls);
    }

    response = filterData(response, event.queryStringParameters);

    const count = response.length;
    const nextPage = generatePageURL(baseUrl, brokerId, results.LastEvaluatedKey?.id, limit, Number(page) + 1);
    const previousPage = page === 1 ? undefined : generatePageURL(baseUrl, brokerId, lastKey, limit, Number(page) - 1);
    const perPage = limit || count;

    const meta = {
      count,
      nextPage,
      previousPage,
      perPage,
    };

    if (failedCalls.length === results.Items.length) {
      return formatJSONResponse({
        statusCode: 500,
        message: 'Failed to retrieve products',
        data: { failedCalls },
      });
    }
    return formatJSONResponse({
      statusCode: 200,
      message: failedCalls.length ? 'Some products were not retrieved. check logs' : 'Products retrieved successfully',
      data: response,
      meta,
    });
  } catch (ex) {
    return formatJSONResponse({
      statusCode: ex.statusCode || 500,
      message: ex.message,
    });
  }
};

export const main = middyfy(handler);

function filterData(data: any[], options: any) {
  let filteredObjects = [...data];

  if (options?.state) {
    console.log(`Filtering on state:  ${options.state}`);
    filteredObjects = filteredObjects.filter((obj) => obj.data.state === options.state);
  }
  if (options?.type) {
    console.log(`Filtering on type:  ${options.type}`);
    filteredObjects = filteredObjects.filter((obj) => obj.data.type === options.type);
  }
  return filteredObjects;
}

function generatePageURL(baseURL: string, brokerId: string, lastKey: any, limit: any, page: number) {
  const params = new URLSearchParams();

  if (lastKey) {
    params.set('lastKey', lastKey);
  }

  if (limit) {
    params.set('limit', limit);
  }

  if (page) {
    params.set('page', page <= 0 ? '1' : String(page));
  }

  const pageURL = new URL(`${baseURL}pb-api/v1/products/${brokerId}`);
  pageURL.search = params.toString();

  return pageURL.href;
}
