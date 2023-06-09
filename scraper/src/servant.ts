import axios from "axios";
import { Cheerio, CheerioAPI, AnyNode, load } from "cheerio";
import "dotenv/config";
import { Paths, Utils } from "../../lib";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";

type Wrapper = Cheerio<AnyNode>;
type Tuple<T> = [T, T];

const scrape = async (url: string, className: string): Promise<string> => {
  const { data } = await axios.get(url);
  const $ = load(data);

  const WRAPPER = $(process.env.WRAPPER);

  const scraped = {
    name: $(process.env.SERVANT_NAME).text().trim(),
    jpName: findJpName($, WRAPPER),
    class: className,
    rarity: findStars($),
    aka: findAkas(WRAPPER),
    id: findID($, WRAPPER),
    cost: findCost(WRAPPER),
    stats: {
      atk: {
        min: findBaseStats($, WRAPPER)[0],
        max: findBaseStats($, WRAPPER)[1],
        lvl100: findGrailStats($, WRAPPER, process.env.GRAIL_ATK),
        lvl120: findGrailStats($, WRAPPER, process.env.GRAIL_ATK_120)
      },
      hp: {
        min: findBaseStats($, WRAPPER, process.env.HP)[0],
        max: findBaseStats($, WRAPPER, process.env.HP)[1],
        lvl100: findGrailStats($, WRAPPER, process.env.GRAIL_HP),
        lvl120: findGrailStats($, WRAPPER, process.env.GRAIL_HP_120)
      }
    },
    va: findVoiceActor(WRAPPER),
    illustrator: findIllustrator(WRAPPER),
    attribute: findAttributes(WRAPPER),
    growthCurve: findGrowthCurve(WRAPPER),
    stars: {
      absorption: findStarAbsorption($, WRAPPER),
      generation: findStarGen($, WRAPPER)
    },
    npCharge: {
      atk: findNpGens($, WRAPPER),
      def: findNpGens($, WRAPPER, process.env.NP_CHARGE_DEF)
    },
    deathRate: findDeathRate($, WRAPPER),
    alignments: findAlignments(WRAPPER),
    gender: findGender($, WRAPPER),
    traits: findTraits(WRAPPER)
  };

  findImages($, WRAPPER, scraped.id);
  writeFileSync(
    join(Paths.servant.data, `${scraped.id}.json`),
    JSON.stringify(scraped, null, 2)
  );
  return scraped.name;
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

const findBaseStats = (
  $: CheerioAPI,
  wr: Wrapper,
  stat?: string
): Tuple<number> => {
  stat = stat ?? process.env.ATK;
  return wr
    .find("b")
    .filter((_, el) => $(el).text().trim() === stat)
    .parent()
    .parent()
    .text()
    .trim()
    .split("/")
    .map(stat => +stat.replace(/^\D+/g, "").replace(",", "")) as Tuple<number>;
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

const findNpGens = ($: CheerioAPI, wr: Wrapper, stat?: string): string => {
  stat = stat ?? process.env.NP_CHARGE_ATK;
  return wr
    .find("b")
    .filter((_, el) => $(el).text().trim() === stat)
    .parent()
    .parent()
    .text()
    .split(":")[1]
    .trim();
};

const findDeathRate = ($: CheerioAPI, wr: Wrapper): string => {
  return wr
    .find("b")
    .filter((_, el) => $(el).text().trim() === process.env.DEATH_RATE)
    .parent()
    .parent()
    .text()
    .split(":")[1]
    .trim();
};

const findAlignments = (wr: Wrapper): Tuple<string> => {
  return wr
    .find(process.env.ALIGNMENTS)
    .parent()
    .parent()
    .text()
    .split(":")[1]
    .trim()
    .split("・")
    .map(a => a.trim()) as Tuple<string>;
};

const findGender = ($: CheerioAPI, wr: Wrapper): string => {
  return wr
    .find("b")
    .filter((_, el) => $(el).text().trim() === process.env.GENDER)
    .parent()
    .parent()
    .text()
    .split(":")[1]
    .trim();
};

const findTraits = (wr: Wrapper): string[] => {
  return wr
    .find(process.env.TRAITS)
    .parent()
    .parent()
    .text()
    .split(":")[1]
    .trim()
    .split(",")
    .map(t => t.trim());
};

const findImages = ($: CheerioAPI, wr: Wrapper, id: number): void => {
  const titles: string[] = [];
  wr.find(process.env.IMAGES)
    .find("img")
    .each((_, el) => {
      let src = $(el).attr("src");
      let title = $(el).attr("alt").toLowerCase().replaceAll(" ", "-");
      if (src) {
        let dir = join(Paths.servant.img, id.toString());
        if (!existsSync(dir)) {
          mkdirSync(dir);
        }
        let file = join(dir, `${title}.png`);
        if (titles.includes(title)) {
          file = join(dir, `${title}-sprite.png`);
        }
        Utils.downloadImage(src, file);
        titles.push(title);
      }
    });
};

const nav = async (url: string): Promise<void> => {
  const { data } = await axios.get(url);
  const $ = load(data);
  const wr = $(process.env.TB);
  const uniq: string[] = [];
  const links = $(wr[2])
    .find("a")
    .filter((_, el) => {
      let href = $(el).attr("href");
      if (uniq.includes(href)) return false;
      uniq.push(href);
      return !href.includes(":") && !href.includes("Event");
    })
    .toArray();

  for (let i = 0; i < links.length; i++) {
    let name = await scrape(
      `${process.env.BASE_URL}${$(links[i]).attr("href")}`,
      "saber"
    );

    console.log(`scraped: ${name} - ${i + 1}/${links.length}`);
  }
  console.log("done");
};
