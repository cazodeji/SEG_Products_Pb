import Joi from 'joi';
import j2s from 'joi-to-swagger';

const schema = Joi.object({
  state: Joi.string().valid('pending', 'notActive', 'active').required(),
});

const { swagger } = j2s(schema);

export default swagger;
