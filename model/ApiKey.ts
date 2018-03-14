export default class ApiKey {

  public timestamp: number;

  constructor(public key: string, public email: string, public hostname: string, public confirmation: string) {
    this.timestamp = new Date().getDate();
  }
}
