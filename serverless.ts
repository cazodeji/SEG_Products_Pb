import addBrokerToProduct from '@sg/functions/v1/add-broker-to-product';
import changeProductState from '@sg/functions/v1/change-product-state';
import createProduct from '@sg/functions/v1/create-product';
import createProductCategory from '@sg/functions/v1/create-product-category';
import getProduct from '@sg/functions/v1/get-product';
import getProductBroker from '@sg/functions/v1/get-product-broker';
import getProductCategories from '@sg/functions/v1/get-product-categories';
import getProducts from '@sg/functions/v1/get-products';

import type { AWS } from '@serverless/typescript';

const serverlessConfiguration: AWS = {
  useDotenv: true,
  service: 'seg-pb-products',
  frameworkVersion: '3',
  plugins: [
    'serverless-esbuild',
    'serverless-dynamodb-local',
    'serverless-import-apigateway',
    'serverless-iam-roles-per-function',
    'serverless-offline',
  ],
  provider: {
    name: 'aws',
    runtime: 'nodejs16.x',
    region: 'eu-west-1',
    stage: 'pb-api',
    timeout: 30,
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
    },
    iam: {
      role: {
        statements: [
          {
            Effect: 'Allow',
            Action: 'ssm:*',
            Resource: '*',
          },
          {
            Effect: 'Allow',
            Action: 's3:*',
            Resource: '*',
          },
          {
            Effect: 'Allow',
            Action: 'lambda:InvokeFunction',
            Resource: '*',
          },
        ],
      },
    },
  },
  resources: {
    Resources: {},
  },

  // import the function via paths
  functions: {
    createProduct,
    createProductCategory,
    addBrokerToProduct,
    changeProductState,
    getProduct,
    getProductBroker,
    getProductCategories,
    getProducts
  },

  package: { individually: true, exclude: ['node_modules/**', 'venv/**'] },
  custom: {
    importApiGateway: {
      name: 'seg-pb-quote-api',
      path: '/',
      resources: ['/v1'],
    },
    restApiId: '${Fn:importValue: ${self:custom.importApiGateway.name}:restApiId}',
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node16',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
    dynamodb: {
      start: {
        port: 8060,
        inMemory: true,
        migrate: true,
      },
      stages: 'dev',
    },
    accountId: {
      Value: { Ref: 'AWS::AccountId' },
    },
  },
};

module.exports = serverlessConfiguration;
