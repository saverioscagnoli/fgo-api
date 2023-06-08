declare global {
  namespace NodeJS {
    interface ProcessEnv {
      WRAPPER: string;
      SERVANT_NAME: string;
      JP_NAME: string;
      STARS: string;
      AKAS: string;
      ID: string;
      COST: string;
      ATK: string;
      HP: string;
      GRAIL_ATK: string;
      GRAIL_HP: string;
      GRAIL_ATK_120: string;
      GRAIL_HP_120: string;
      VOICE_ACTOR: string;
      ILLUSTRATOR: string;
      ATTRIBUTES: string;
      GROWTH_CURVE: string;
      STAR_ABSORPTION: string;
      STAR_GENERATION: string;
    }
  }
}
export {};
