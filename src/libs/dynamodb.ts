import { DynamoDB } from 'aws-sdk';

const client = new DynamoDB.DocumentClient();
// const client = new DynamoDB.DocumentClient({ endpoint: 'http://localhost:8060' });

export default client;
