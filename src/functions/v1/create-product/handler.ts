/* eslint-disable prefer-const */
import { v4 as uuidv4 } from 'uuid';

import type { ValidatedEventAPIGatewayProxyEvent } from '@sg/libs/api-gateway';
import { formatJSONResponse } from '@sg/libs/api-gateway';
import eventHandler from '@sg/libs/eventHandler';
import { middyfy } from '@sg/libs/lambda';
import logger from '@sg/libs/logger';
import ssmService from '@sg/libs/ssm';
import ProductRepository from '@sg/repositories/product';

import schema from './schema';

const handler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  try {
    logger.info('Incoming event: ' + JSON.stringify(event));
    const body = eventHandler(event.body);
    const products = new ProductRepository();

    let {
      id,
      avgAnnualGwp,
      category,
      type,
      claimsHandler,
      claimsHandlerEmail,
      commission,
      description,
      insurerName,
      policyHolderDescription,
      premiumType,
      productName,
      published,
      reviewHandlerEmail,
      slug,
    } = body;

    if (!id) {
      id = `pro-${uuidv4()}`;
    }

    const item: any = {
      id,
      productName,
      commission,
      premiumType,
      insurerName,
      claimsHandler,
      claimsHandlerEmail,
      reviewHandlerEmail,
      avgAnnualGwp,
      description,
      category,
      slug,
      type,
      published,
      policyHolderDescription,
      images: {},
      brokers: [],
    };

    const url = String(await ssmService.getParameter('/seg-product-builder/whitelabel-url'));

    item.images.full = `${url}images/${item.id}/full.png`;

    logger.info('New Product Data: ' + JSON.stringify(item));

    await products.create(item);

    return formatJSONResponse({
      statusCode: 200,
      message: 'Product Created Successfully',
      data: item,
    });
  } catch (ex) {
    logger.error('Failed to create product: ' + ex.message);
    return formatJSONResponse({
      statusCode: ex.statusCode || 500,
      message: 'Failed to create product. check logs',
    });
  }
};

export const main = middyfy(handler);
