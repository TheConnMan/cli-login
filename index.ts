import 'reflect-metadata';

import ApiKeyService from './lib/ApiKeyService';
import SesService from './lib/SesService';
import UserService from './lib/UserService';

import ApiKey from './model/ApiKey';
import User from './model/User';

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
  try {
    const payload = JSON.parse(event.body);
    if (!payload.key || !payload.email || !payload.hostname) {
      throw new Error('Missing required body parameters');
    }
    const apiKey = new ApiKey(payload.key, payload.email, payload.hostname);
    await apiKeyService.saveToken(apiKey);
    await sesService.sendApiKeyConfirmation(apiKey);
    const result = await recursiveWait(0, 10, 2500, () => {
      return apiKeyService.get(apiKey.key);
    });
    if (result) {
      callback(null, {
        body: JSON.stringify(result),
        headers: {
          'Content-Type': 'text/plain'
        },
        statusCode: 200
      });
    }
    throw new Error('Request timed out, please try again');
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

exports.confirm = async (event: AWSLambda.APIGatewayEvent, context: AWSLambda.Context, callback: AWSLambda.Callback) => {
  try {
    const key = await apiKeyService.getByToken(event.pathParameters.token);
    await apiKeyService.deleteToken(key);
    delete key.token;
    await apiKeyService.save(key);
    const user = await userService.getUser(key.email);
    if (!user) {
      userService.save(new User(key.email));
    }
    callback(null, {
      body: JSON.stringify(key),
      statusCode: 200
    });
  } catch (e) {
    callback(null, {
      body: e.message,
      statusCode: 500
    });
  }
};

async function recursiveWait(attempt: number, maxAttempts: number, sleepMs: number, callback: () => Promise<any>) {
  if (attempt === maxAttempts) {
    return false;
  }
  await sleep(sleepMs);
  const result = await callback();
  if (result) {
    return result;
  }
  return recursiveWait(attempt + 1, maxAttempts, sleepMs, callback);
}

async function sleep(ms: number) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms);
  });
}
