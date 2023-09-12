import { handlerPath } from '@sg/libs/handler-resolver';

import schema from './schema';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: 'post',
        path: 'v1/product/add-broker/{brokerId}/{productId}',
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
      Action: 'dynamodb:GetItem',
      Resource: 'arn:aws:dynamodb:${self:provider.region}:*:table/seg-pba-products',
    },
    {
      Effect: 'Allow',
      Action: 'dynamodb:UpdateItem',
      Resource: 'arn:aws:dynamodb:${self:provider.region}:*:table/seg-pba-products',
    },
  ],
};
