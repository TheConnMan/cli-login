import 'reflect-metadata';

import ApiKeyService from './lib/ApiKeyService';
import SesService from './lib/SesService';
import UserService from './lib/UserService';
import ApiKey from './model/ApiKey';

const apiKeyService = new ApiKeyService();
const sesService = new SesService();
const userService = new UserService();

exports.root = async (event: AWSLambda.APIGatewayEvent, context: AWSLambda.Context, callback: AWSLambda.Callback) => {
  try {
    if (!event.headers.key) {
      throw new Error('No API key present');
    }
    const key = await apiKeyService.get(event.headers.key);
    if (!key) {
      throw new Error('API key not present in the database');
    }
    const user = await userService.getUser(key.email);
    if (!user) {
      throw new Error(`User with email ${key.email} doesn't exist`);
    }
    callback(null, {
      body: user,
      statusCode: 200
    });
  } catch (e) {
    callback(null, {
      body: e.message,
      headers: {
        'Content-Type': 'text/plain'
      },
      statusCode: 400
    });
  }
};

exports.auth = async (event: AWSLambda.APIGatewayEvent, context: AWSLambda.Context, callback: AWSLambda.Callback) => {
  const payload = JSON.parse(event.body);
  if (!payload.key || !payload.email || !payload.hostname) {
    throw new Error('Missing required body parameters');
  }
  const apiKey = new ApiKey(payload.key, payload.email, payload.hostname);
  // await apiKeyService.save(apiKey);
  await sesService.sendApiKeyConfirmation(apiKey);
  callback(null, {
    statusCode: 200
  });
};
