import { handlerPath } from '@sg/libs/handler-resolver';

import schema from './schema';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: 'post',
        path: 'v1/product/create',
        cors: true,
        request: {
          schemas: {
            'application/json': schema,
          },
        },
        authorizer: {
          type: 'COGNITO_USER_POOLS',
          scopes: ['aws.cognito.signin.user.admin'],
          authorizerId: {'Fn::ImportValue': 'mono-repo-congnitoUserPoolAuthorizerForAuth'},
        },
      },
    },
  ],
  iamRoleStatementsInherit: true,
  iamRoleStatements: [
    {
      Effect: 'Allow',
      Action: 'dynamodb:PutItem',
      Resource: 'arn:aws:dynamodb:${self:provider.region}:*:table/seg-pba-products',
    },
  ],
};
