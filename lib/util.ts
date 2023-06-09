import axios from "axios";
import { writeFileSync } from "fs";

export abstract class Utils {
  public static async downloadImage(url: string, path: string): Promise<void> {
    try {
      let res = await axios.get(url, {
        responseType: "arraybuffer"
      });
      let buf = Buffer.from(res.data, "binary");
      writeFileSync(path, buf);
    } catch (error) {
      console.error("An error occurred while downloading the image:", error);
    }
  }
}
