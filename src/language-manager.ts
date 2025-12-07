// deno-lint-ignore-file no-explicit-any
import languageData from "./data/language-data.json" with { type: "json" };

class LanguageManager {
  data: any;
  lang: number;
  constructor() {
    this.data = languageData;
    this.lang = 0;
  }
  setLanguage(lang: string | number) {
    if (typeof lang === "number") this.lang = lang as number;
    else if (lang === "eng") this.lang = 0;
    else if (lang === "ar") this.lang = 1;
    else if (lang === "ch") this.lang = 2;
  }
  get(key: string): string {
    console.log(this.data);
    return this.data[key][this.lang];
  }
}

export { LanguageManager };
