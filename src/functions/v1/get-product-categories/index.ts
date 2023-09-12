import { handlerPath } from '@sg/libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: 'get',
        path: 'v1/categories',
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
  ],
};
