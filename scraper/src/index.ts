import axios from "axios";
import { Cheerio, CheerioAPI, AnyNode, load } from "cheerio";
import "dotenv/config";

type Wrapper = Cheerio<AnyNode>;

const scrape = async (url: string): Promise<void> => {
  const { data } = await axios.get(url);
  const $ = load(data);

  const WRAPPER = $(process.env.WRAPPER);

  let name = $(process.env.SERVANT_NAME).text().trim();
  let jpName = findJpName($, WRAPPER);
  let akas = findAkas($, WRAPPER);
};

const findJpName = ($: CheerioAPI, wr: Wrapper): string => {
  return wr
    .find("b")
    .filter((_, el) => $(el).text().trim() === process.env.JP_NAME)
    .next("span")
    .text()
    .trim();
};

const findAkas = ($: CheerioAPI, wr: Wrapper): string[] => {
  let akaStr = wr.find(process.env.AKAS).parent().text();
  return akaStr
    .slice(4)
    .replace(/\([^()]*\)/g, "")
    .trim()
    .split(",")
    .map(aka => aka.trim());
};
