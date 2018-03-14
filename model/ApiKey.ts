import * as UUID from 'uuid';

export default class ApiKey {

  public timestamp = new Date().getDate();
  public confirmationToken = UUID.v4();

  constructor(public key: string, public email: string, public hostname: string) { }
}
