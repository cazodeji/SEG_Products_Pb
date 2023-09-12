import dynamoClient from '@sg/libs/dynamodb';
import type { brokerConfig } from '@sg/types/brokerConfig';

import DBClient from './base';

export default class brokerConfigRepository extends DBClient<brokerConfig> {
  constructor() {
    super(dynamoClient, 'seg-broker-configs');
  }
}
