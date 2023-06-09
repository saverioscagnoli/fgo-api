import axios from "axios";
import { load } from "cheerio";

const scrapeSkillNames = async () => {
  const skills = [];
  const urls = process.env.SKILL_URLS.split(",");
  for (let url of urls) {
    const { data } = await axios.get(url);
    const $ = load(data);

    skills.push(
      ...$(process.env.SKILL_TABLE)
        .text()
        .trim()
        .split("\n")
        .map(s => s.replace(/(\r\n|\n|\r|\t)/gm, ""))
        .filter(s => s.length > 1)
        .slice(5)
    );
  }
  return skills;
};

scrapeSkillNames();
