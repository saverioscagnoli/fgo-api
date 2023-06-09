import { join } from "path";

const API_PATH = join(__dirname, "../api");

export const Paths = {
  servant: {
    data: join(API_PATH, "/servant/data/"),
    img: join(API_PATH, "/servant/img/")
  }
};
