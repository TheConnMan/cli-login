import * as UUID from 'uuid';

export default class ApiKey {

  public timestamp = new Date().getDate();
  public token = UUID.v4();

  constructor(public key: string, public email: string, public hostname: string) { }
}
