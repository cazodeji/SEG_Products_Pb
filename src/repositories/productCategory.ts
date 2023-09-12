import dynamoClient from '@sg/libs/dynamodb';
import type { ProductCategory } from '@sg/types/productCategory';

import DBClient from './base';

export default class ProductCategoryRepository extends DBClient<ProductCategory> {
  constructor() {
    super(dynamoClient, 'seg-pb-product-categories');
  }
}
