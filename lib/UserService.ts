import { DynamoDB } from 'aws-sdk';
import { plainToClass } from 'class-transformer';
import User from '../model/User';

export default class UserService {

  private client = new DynamoDB.DocumentClient();

  public async getUser(email: string): Promise<User> {
    const response = await this.client.get({
      Key: {
        email
      },
      TableName: process.env.USER_TABLE_NAME
    }).promise();
    return plainToClass(User, response.Item);
  }

  public async save(user: User) {
    return this.client.put({
      Item: user,
      TableName: process.env.USER_TABLE_NAME
    }).promise();
  }
}
