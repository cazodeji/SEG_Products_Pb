import { handlerPath } from '@sg/libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: 'get',
        path: 'v1/products/{brokerId}',
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
      Action: 'dynamodb:GetItem',
      Resource: 'arn:aws:dynamodb:${self:provider.region}:*:table/seg-broker-configs',
    },
    {
      Effect: 'Allow',
      Action: 'dynamodb:Scan',
      Resource: 'arn:aws:dynamodb:${self:provider.region}:*:table/seg-pba-products',
    },
  ],
};
