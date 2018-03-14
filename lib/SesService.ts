import { SES } from 'aws-sdk';
import ApiKey from '../model/ApiKey';

export default class SesService {

  private client = new SES();

  public async sendApiKeyConfirmation(key: ApiKey): Promise<void> {
    const confirmationUrl = `${process.env.BASE_URL}/confirm/${key.confirmationToken}`;
    await this.client.sendEmail({
      Destination: {
        ToAddresses: [
          key.email
        ]
      },
      Message: {
        Body: {
          Html: {
            Data: `Hi, your confirmation link is <a href="${confirmationUrl}">${confirmationUrl}</a>`
          }
        },
        Subject: {
          Data: 'JaUI Confirmation Email'
        }
      },
      Source: 'bcconn2112@gmail.com'
    }).promise();
  }
}
