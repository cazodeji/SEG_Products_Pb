import { formatJSONResponse } from '@sg/libs/api-gateway';
import eventHandler from '@sg/libs/eventHandler';
import { middyfy } from '@sg/libs/lambda';
import logger from '@sg/libs/logger';
import ProductRepository from '@sg/repositories/product';

const handler = async (event) => {
  try {
    logger.info('Incoming event: ', event);
    const { brokerId, productId } = event.pathParameters;
    const body = eventHandler(event.body);

    const product = new ProductRepository();
    const item = await product.get({ id: productId });

    let broker = item.brokers.find((b: any) => b[brokerId]);
    logger.info('Current brokers: ', item.brokers);
    const updatedBrokers = item.brokers;

    if (!broker) {
      broker = {
        [brokerId]: {
          state: body?.state ?? 'pending',
          id: brokerId,
          sendWelcomeEmail: true,
          sendRenewalEmail: true,
        },
      };
      updatedBrokers.push(broker);
    } else {
      broker[brokerId].state = body?.state;
    }

    logger.info('New broker config: ', broker);
    item.brokers = updatedBrokers;

    logger.info('Updated brokers: ', updatedBrokers);

    logger.info(`Updating product in ddb: ${productId}`);

    await product.update({
      Key: { id: productId },
      UpdateExpression: `SET brokers = :val`,
      ExpressionAttributeValues: { ':val': updatedBrokers },
    });

    return formatJSONResponse({
      statusCode: 200,
      message: 'Product added to broker successfully',
      data: item,
    });
  } catch (ex) {
    return formatJSONResponse({
      statusCode: ex.statusCode || 500,
      message: ex.message,
    });
  }
};

export const main = middyfy(handler);
