import { handlerPath } from '@sg/libs/handler-resolver';

import schema from './schema';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: 'post',
        path: 'v1/categories',
        cors: true,
        request: {
          schemas: {
            'application/json': schema,
          },
        },
      },
    },
  ],
  iamRoleStatementsInherit: true,
  iamRoleStatements: [
    {
      Effect: 'Allow',
      Action: 'dynamodb:Scan',
      Resource: 'arn:aws:dynamodb:${self:provider.region}:*:table/seg-pb-product-categories',
    },
    {
      Effect: 'Allow',
      Action: 'dynamodb:PutItem',
      Resource: 'arn:aws:dynamodb:${self:provider.region}:*:table/seg-pb-product-categories',
    },
  ],
};
