import { uuid } from 'uuidv4';

import { formatJSONResponse } from '@sg/libs/api-gateway';
import type { ValidatedEventAPIGatewayProxyEvent } from '@sg/libs/api-gateway';
import { DuplicateEntryError } from '@sg/libs/error';
import { middyfy } from '@sg/libs/lambda';
import logger from '@sg/libs/logger';
import ProductCategoryRepository from '@sg/repositories/productCategory';

import schema from './schema';

const handler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  try {
    const productCategory = new ProductCategoryRepository();

    const { name } = event.body;
    const categoryName = name.toLowerCase();

    const payload = {
      name: categoryName,
      categoryId: `pcat-${uuid()}`,
    };

    logger.info('category', payload);

    const catCheck = await productCategory.scan({
      FilterExpression: '#cat = :cat',
      ExpressionAttributeNames: { '#cat': 'name' },
      ExpressionAttributeValues: { ':cat': categoryName },
    });

    if (catCheck.Count > 0) {
      throw new DuplicateEntryError('item already exists');
    }

    await productCategory.create(payload);

    return formatJSONResponse({
      statusCode: 200,
      message: 'category created successfully.',
    });
  } catch (ex) {
    return formatJSONResponse({
      statusCode: ex.statusCode || 500,
      message: ex.message,
    });
  }
};

export const main = middyfy(handler);
