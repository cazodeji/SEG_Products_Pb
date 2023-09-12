import { formatJSONResponse } from '@sg/libs/api-gateway';
import { middyfy } from '@sg/libs/lambda';
import paginate from '@sg/libs/paginate';
import ssmService from '@sg/libs/ssm';
import ProductCategoryRepository from '@sg/repositories/productCategory';

const handler = async (event) => {
  try {
    const { queryStringParameters } = event;

    const limit = event.queryStringParameters?.limit !== undefined ? parseInt(queryStringParameters?.limit) : -1;
    const currentPage = event.queryStringParameters?.page !== undefined ? parseInt(queryStringParameters?.page) : 1;

    const url = String(await ssmService.getParameter('/seg-product-builder/whitelabel-url'));

    const productCategory = new ProductCategoryRepository();

    const data = (await productCategory.scan({})).Items;

    const pagedResult = paginate({ data, limit, currentPage, url });

    return formatJSONResponse({
      statusCode: 200,
      message: 'Categories retrieved successfully',
      data: limit === -1 ? data : pagedResult.page,
      meta: pagedResult.meta,
    });
  } catch (ex) {
    return formatJSONResponse({
      statusCode: ex.statusCode || 500,
      message: ex.message,
    });
  }
};

export const main = middyfy(handler);
