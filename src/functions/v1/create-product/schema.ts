import Joi from 'joi';
import j2s from 'joi-to-swagger';

const schema = Joi.object({
  id: Joi.string().regex(/^pro-/),
  avgAnnualGwp: Joi.string().regex(/^£.*\*$/),
  category: Joi.string().required(),
  type: Joi.string().required(),
  claimsHandler: Joi.string(),
  claimsHandlerEmail: Joi.string().email(),
  commission: Joi.string(),
  description: Joi.string(),
  insurerName: Joi.string(),
  policyHolderDescription: Joi.string(),
  premiumType: Joi.string(),
  productName: Joi.string().required(),
  published: Joi.boolean().required(),
  reviewHandlerEmail: Joi.string().email(),
  slug: Joi.string(),
});

const { swagger } = j2s(schema);

export default swagger;
