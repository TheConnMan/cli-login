export default class Utilities {
  public static async recursiveWait(attempt: number, maxAttempts: number, sleepMs: number, callback: () => Promise<any>) {
    if (attempt === maxAttempts) {
      return false;
    }
    await Utilities.sleep(sleepMs);
    const result = await callback();
    if (result) {
      return result;
    }
    return Utilities.recursiveWait(attempt + 1, maxAttempts, sleepMs, callback);
  }

  public static async sleep(ms: number) {
    return new Promise((resolve, reject) => {
      setTimeout(resolve, ms);
    });
  }
}
