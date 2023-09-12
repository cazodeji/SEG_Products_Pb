import { SSM } from 'aws-sdk';

import { NotFoundError, ServerError } from '@sg/libs/error';

import logger from './logger';

const ssm = new SSM();

const ssmService = {
  async getParameter(name) {
    const params = {
      Name: name,
      WithDecryption: true,
    };
    try {
      logger.info(`ssm get params`, params);
      const ssmResult = await ssm.getParameter(params).promise();
      return ssmResult.Parameter?.Value;
    } catch (e) {
      logger.error('ssm get params error', e);
      throw new NotFoundError(e.message ?? e.code);
    }
  },
  async getSecureParameter(name) {
    const params = {
      Name: name,
      WithDecryption: true,
    };
    try {
      logger.info('ssm get params', params);
      const ssmResult = await ssm.getParameter(params).promise();
      return ssmResult.Parameter?.Value;
    } catch (e) {
      logger.error('ssm get params error', e);
      throw new NotFoundError(e.message ?? e.code);
    }
  },

  async updateSSMParameter(params: AWS.SSM.PutParameterRequest) {
    try {
      logger.info('ssm update params', params);
      return await ssm.putParameter(params).promise();
    } catch (e: any) {
      logger.error('ssm update params error', e);
      return new ServerError(e.message || e.code);
    }
  },
};

export default ssmService;
