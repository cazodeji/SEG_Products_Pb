import { DynamoDB } from 'aws-sdk';

import { NotFoundError } from '@sg/libs/error';

type ScanParams = {
  FilterExpression?: any;
  ExpressionAttributeValues?: any;
  ExpressionAttributeNames?: any;
};

export default class DBClient<T> {
  public readonly table: string;
  public readonly client;

  constructor(dbClient: any, table: string) {
    this.table = table;
    this.client = dbClient;
  }

  public async create(payload: Partial<T>): Promise<any> {
    const params = {
      TableName: this.table,
      Item: payload,
    };

    const res = await this.client.put(params).promise();
    return res;
  }

  /**
   * We use JS *generator to get items from the scan. DynamoDB returns 1MB of result payload,
   *   then you must paginate using `ExclusiveStartKey`.
   *
   *  @see https://mrcoles.com/auto-paginate-dynamodb-scan-async-generator/
   */
  public async *autoPaginateScan(criteria?: Omit<DynamoDB.DocumentClient.ScanInput, 'TableName'>) {
    while (true) {
      const { LastEvaluatedKey, Items } = await this.client.scan({ ...criteria, TableName: this.table }).promise();
      yield* Items;

      if (LastEvaluatedKey == null) {
        break;
      }

      criteria = { ...criteria, ExclusiveStartKey: LastEvaluatedKey };
    }
  }

  public async scanAllItems(query: ScanParams): Promise<any> {
    const params: any = {
      TableName: this.table,
      FilterExpression: query.FilterExpression,
      ExpressionAttributeValues: query.ExpressionAttributeValues,
      ExpressionAttributeNames: query.ExpressionAttributeNames,
    };

    const scanResults = [];
    let items;
    do {
      items = await this.client.scan(params).promise();
      items.Items.forEach((item) => scanResults.push(item));
      params.ExclusiveStartKey = items.LastEvaluatedKey;
    } while (typeof items.LastEvaluatedKey !== 'undefined');

    return scanResults;
  }

  public async get(query: Partial<T>): Promise<T> {
    const params = {
      TableName: this.table,
      Key: query,
    };

    const res = await this.client.get(params).promise();

    if (res.Item) {
      return res.Item;
    } else {
      throw new NotFoundError('item not found');
    }
  }

  public async scan(query: Omit<DynamoDB.DocumentClient.ScanInput, 'TableName'>): Promise<any> {
    const params = {
      TableName: this.table,
      ...query,
    };

    const res = await this.client.scan(params).promise();

    return res;
  }

  public async update(query: Omit<DynamoDB.DocumentClient.UpdateItemInput, 'TableName'>) {
    return this.client.update({ ...query, TableName: this.table }).promise();
  }

  public async delete(query: Partial<T>): Promise<any> {
    const params = {
      TableName: this.table,
      Key: query,
    };

    const res = await this.client.delete(params).promise();
    return res;
  }
}
