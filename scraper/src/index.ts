import axios from "axios";
import { Cheerio, CheerioAPI, AnyNode, load } from "cheerio";
import "dotenv/config";

type Wrapper = Cheerio<AnyNode>;
type Tuple = [number, number];

const scrape = async (url: string): Promise<void> => {
  const { data } = await axios.get(url);
  const $ = load(data);

  const WRAPPER = $(process.env.WRAPPER);

  let name = $(process.env.SERVANT_NAME).text().trim();
  let jpName = findJpName($, WRAPPER);
  let stars = findStars($);
  let akas = findAkas(WRAPPER);
  let id = findID($, WRAPPER);
  let cost = findCost(WRAPPER);
  let atk = findBaseStats($, WRAPPER);
  let hp = findBaseStats($, WRAPPER, process.env.HP);
  let lvl100Atk = findGrailStats($, WRAPPER, process.env.GRAIL_ATK);
  let lvl100Hp = findGrailStats($, WRAPPER, process.env.GRAIL_HP);
  let lvl120Atk = findGrailStats($, WRAPPER, process.env.GRAIL_ATK_120);
  let lvl120Hp = findGrailStats($, WRAPPER, process.env.GRAIL_HP_120);
  let va = findVoiceActor(WRAPPER);
  let illustrator = findIllustrator(WRAPPER);
  let attribute = findAttributes(WRAPPER);
  let growthCurve = findGrowthCurve(WRAPPER);
  let starAbsorption = findStarAbsorption($, WRAPPER);
  let starGen = findStarGen($, WRAPPER);
};

const findJpName = ($: CheerioAPI, wr: Wrapper): string => {
  return wr
    .find("b")
    .filter((_, el) => $(el).text().trim() === process.env.JP_NAME)
    .next("span")
    .text()
    .trim();
};

const findStars = ($: CheerioAPI): string[] => {
  return $(process.env.STARS)
    .text()
    .split("")
    .filter(s => s === "★")
    .map(() => "*");
};

const findAkas = (wr: Wrapper): string[] | null => {
  let akaStr = wr.find(process.env.AKAS).parent().text();
  return akaStr
    ? akaStr
        .slice(4)
        .replace(/\([^()]*\)/g, "")
        .trim()
        .split(",")
        .map(aka => aka.trim())
    : null;
};

const findID = ($: CheerioAPI, wr: Wrapper): number => {
  return +wr
    .find("b")
    .filter((_, el) => $(el).text().trim() === process.env.ID)
    .parent()
    .text()
    .trim()
    .replace(/^\D+/g, "");
};

const findCost = (wr: Wrapper): number => {
  return +wr
    .find(process.env.COST)
    .parent()
    .parent()
    .text()
    .trim()
    .replace(/^\D+/g, "");
};

const findBaseStats = ($: CheerioAPI, wr: Wrapper, stat?: string): Tuple => {
  stat = stat ?? process.env.ATK;
  return wr
    .find("b")
    .filter((_, el) => $(el).text().trim() === stat)
    .parent()
    .parent()
    .text()
    .trim()
    .split("/")
    .map(stat => +stat.replace(/^\D+/g, "").replace(",", "")) as Tuple;
};

const findGrailStats = ($: CheerioAPI, wr: Wrapper, stat?: string) => {
  return +wr
    .find("b")
    .filter((_, el) => $(el).text().trim() === stat)
    .parent()
    .parent()
    .text()
    .split(" ")
    .slice(-1)[0]
    .replace(",", "");
};

const findVoiceActor = (wr: Wrapper): string => {
  return wr
    .find(process.env.VOICE_ACTOR)
    .parent()
    .parent()
    .text()
    .split(":")[1]
    .trim();
};

const findIllustrator = (wr: Wrapper): string => {
  return wr
    .find(process.env.ILLUSTRATOR)
    .parent()
    .parent()
    .text()
    .split(":")[1]
    .trim();
};

const findAttributes = (wr: Wrapper): string => {
  return wr
    .find(process.env.ATTRIBUTES)
    .parent()
    .parent()
    .text()
    .split(":")[1]
    .trim();
};

const findGrowthCurve = (wr: Wrapper): string => {
  return wr
    .find(process.env.GROWTH_CURVE)
    .parent()
    .parent()
    .text()
    .split(":")[1]
    .trim();
};

const findStarAbsorption = ($: CheerioAPI, wr: Wrapper): number => {
  return +wr
    .find("b")
    .filter((_, el) => $(el).text().trim() === process.env.STAR_ABSORPTION)
    .parent()
    .parent()
    .text()
    .split(":")[1]
    .trim();
};

const findStarGen = ($: CheerioAPI, wr: Wrapper): string => {
  return wr
    .find("b")
    .filter((_, el) => $(el).text().trim() === process.env.STAR_GENERATION)
    .parent()
    .parent()
    .text()
    .split(":")[1]
    .trim();
};
