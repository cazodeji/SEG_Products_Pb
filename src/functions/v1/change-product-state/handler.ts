import { formatJSONResponse } from '@sg/libs/api-gateway';
import type { ValidatedEventAPIGatewayProxyEvent } from '@sg/libs/api-gateway';
import eventHandler from '@sg/libs/eventHandler';
import { middyfy } from '@sg/libs/lambda';
import logger from '@sg/libs/logger';
import ProductRepository from '@sg/repositories/product';

import schema from './schema';

const handler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  try {
    const data = eventHandler(event);
    logger.info('Incoming event:', data);

    const { state, productId, brokerId } = eventHandler(data.body);
    logger.info('Request body:', data.body);
    const product = new ProductRepository();

    const productItem = await product.get({ id: productId });
    logger.info('Product:', product);

    const brokers = productItem.brokers;
    logger.info('Product brokers:', brokers);

    const brokerExists = brokers.find((broker) => Object.keys(broker)[0] === brokerId);
    logger.info('Broker by brokerId:', brokerExists);

    if (!brokerExists) {
      logger.info('Adding broker to product and setting state to ' + state);
      brokers.push({
        [brokerId]: {
          id: brokerId,
          state: state,
        },
      });
    } else {
      if (state === brokers.find((broker) => Object.keys(broker)[0] === brokerId).state) {
        return formatJSONResponse({
          statusCode: 200,
          message: `Product is already in [${state}] state`,
        });
      }
      logger.info(`Updating product state for broker ${brokerId} to state "${state}"`);
      brokers.find((broker) => Object.keys(broker)[0] === brokerId).state = state;
    }

    logger.info('Updated brokers:', brokers);

    await product.update({
      Key: { id: productId },
      UpdateExpression: 'set brokers = :data',
      ExpressionAttributeValues: { ':data': brokers },
    });

    return formatJSONResponse({
      statusCode: 200,
      message: `Successfully changed Product [${productId}] state to [${state}] for broker [${brokerId}]`,
    });
  } catch (ex) {
    return formatJSONResponse({
      statusCode: ex.statusCode || 500,
      message: ex.message,
    });
  }
};

export const main = middyfy(handler);
