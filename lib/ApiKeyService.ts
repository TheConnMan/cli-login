import { DynamoDB } from 'aws-sdk';
import { plainToClass } from 'class-transformer';
import ApiKey from '../model/ApiKey';

export default class ApiKeyService {

  private client = new DynamoDB.DocumentClient();

  public async save(apiKey: ApiKey) {
    return this.client.put({
      Item: apiKey,
      TableName: process.env.API_KEY_TABLE_NAME
    }).promise();
  }

  public async saveToken(apiKey: ApiKey) {
    return this.client.put({
      Item: apiKey,
      TableName: process.env.TOKEN_TABLE_NAME
    }).promise();
  }

  public async get(key: string): Promise<ApiKey> {
    const response = await this.client.get({
      Key: {
        key
      },
      TableName: process.env.API_KEY_TABLE_NAME
    }).promise();
    return plainToClass(ApiKey, response.Item);
  }

  public async getByToken(token: string): Promise<ApiKey> {
    const response = await this.client.get({
      Key: {
        token
      },
      TableName: process.env.TOKEN_TABLE_NAME
    }).promise();
    return plainToClass(ApiKey, response.Item);
  }

  public async deleteToken(apiKey: ApiKey) {
    return this.client.delete({
      Key: {
        token: apiKey.token
      },
      TableName: process.env.TOKEN_TABLE_NAME
    }).promise();
  }
}
