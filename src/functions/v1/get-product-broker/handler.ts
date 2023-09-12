import { formatJSONResponse } from '@sg/libs/api-gateway';
import { middyfy } from '@sg/libs/lambda';
import ProductRepository from '@sg/repositories/product';

const handler = async (event) => {
  try {
    const { queryStringParameters } = event;

    const productId = queryStringParameters?.productId;
    const brokerId = queryStringParameters?.brokerId;

    const product = new ProductRepository();

    const data = await product.getBroker(productId, brokerId);

    return formatJSONResponse({
      statusCode: 200,
      message: 'Broker retrieved successfully',
      data: { [data.id]: data },
    });
  } catch (ex) {
    return formatJSONResponse({
      statusCode: ex.statusCode || 500,
      message: ex.message,
    });
  }
};

export const main = middyfy(handler);
