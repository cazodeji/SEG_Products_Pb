import { DynamoDB } from 'aws-sdk';

import dynamoClient from '@sg/libs/dynamodb';
import { NotFoundError } from '@sg/libs/error';
import type { Product } from '@sg/types/product';

import DBClient from './base';

export default class ProductRepository extends DBClient<Product> {
  constructor() {
    super(dynamoClient, 'seg-pba-products');
  }

  public async getBroker(productId: string, brokerId: string) {
    const product = await this.get({ id: productId });
    const brokers = product.brokers;

    const item = brokers.find((i) => Object.keys(i)[0] == brokerId);

    if (item) {
      const broker = item[Object.keys(item)[0]];
      return broker;
    } else {
      throw new NotFoundError('item not found');
    }
  }

  public async updateMany(criteria: Array<Omit<DynamoDB.DocumentClient.Delete, 'TableName'>>) {
    const params = criteria.map((c) => ({
      Update: { ...c, TableName: this.table },
    }));

    return this.client.transactWrite({ TransactItems: params }).promise();
  }
}
