const messages = {
  en: {
    cite: "Cite",
    hideCite: "Hide Cite",
    copy: "Copy",
    copied: "Copied",
    copyFailed: "Copy Failed",
    morePreprints: "Show more preprints",
    fewerPreprints: "Show fewer preprints",
    allPublications: "All Publications",
    paper: "Paper",
  },
  zh: {
    pageTitle: "林东东 | 学术主页",
    description: "林东东的学术主页：个人简介、最新动态、预印本与论文成果。",
    name: "林东东",
    navigation: "主导航",
    toggleNavigation: "展开或收起导航",
    bio: "个人简介",
    news: "最新动态",
    preprints: "预印本",
    publications: "论文成果",
    portrait: "林东东的照片",
    position: "讲师",
    university: "华侨大学",
    researchInterests: "研究方向",
    interests: "人工智能安全、模型水印、深度伪造检测、对抗鲁棒性、语音水印、多媒体取证。",
    scholar: "谷歌学术",
    projects: "项目",
    tidybibDescription: "参考文献整理工具",
    facultyPage: "教师主页",
    bioIntro: "林东东现为",
    bioCollaborator: "讲师，与",
    huiTian: "田晖",
    bioEducation: "合作开展研究。本科及硕士毕业于湘潭大学，师从",
    chengqingLi: "李澄清",
    bioDoctorate: "；博士毕业于深圳大学，师从",
    binLi: "李斌",
    bioVisit: "。2020—2022 年，在意大利锡耶纳大学访学，与 ",
    and: " 和 ",
    bioEnd: " 合作开展研究。",
    bioResearch: "主要研究方向包括人工智能安全、深度模型水印、深度伪造检测、对抗鲁棒性和多媒体取证。近期工作涉及扩散模型水印、语音合成系统水印，以及生成模型的所有权验证。",
    bioFocus: "目前关注可信人工智能生成内容（AIGC）、鲁棒的模型所有权保护，以及多模态生成系统的安全问题。",
    bioService: "现为中国计算机学会（CCF）专业会员、中国图象图形学学会（CSIG）会员及 IEEE 会员，并担任 IEEE T-IFS/DSC/ASLP、SP、CVPR、ACM MM 和 ICASSP 等期刊与会议的审稿人。",
    newsTDSC: "1 篇论文被 IEEE TDSC 录用。",
    newsSPL: "1 篇论文被 IEEE SPL 录用。",
    newsESWA: "1 篇论文被 ESWA 录用。",
    newsICASSP: "1 篇论文被 ICASSP 录用。",
    newsACMMM: "1 篇论文被 ACM MM 录用。",
    filterPublications: "按年份筛选论文",
    cite: "引用",
    hideCite: "收起引用",
    copy: "复制",
    copied: "已复制",
    copyFailed: "复制失败",
    morePreprints: "展开更多预印本",
    fewerPreprints: "收起更多预印本",
    allPublications: "全部论文",
    paper: "论文",
  },
};

// Keep the original English copy in the HTML as the fallback.
document.querySelectorAll("[data-i18n]").forEach((element) => {
  messages.en[element.dataset.i18n] = element.textContent;
});

const translatedAttributes = ["aria-label", "alt", "content"];
translatedAttributes.forEach((attribute) => {
  document.querySelectorAll(`[data-i18n-${attribute}]`).forEach((element) => {
    messages.en[element.getAttribute(`data-i18n-${attribute}`)] = element.getAttribute(attribute);
  });
});

let currentLanguage = "zh";
try {
  const savedLanguage = localStorage.getItem("homepage-language");
  if (savedLanguage === "en" || savedLanguage === "zh") currentLanguage = savedLanguage;
} catch {
  // Language switching still works when browser storage is unavailable.
}

const translate = (key) => messages[currentLanguage][key] ?? messages.en[key];

const publicationFilterLabel = (year) => year === "all" ? translate("allPublications") : year;

const publicationFilterDescription = (year, count) => {
  const label = publicationFilterLabel(year);
  return currentLanguage === "zh"
    ? `${label}，共 ${count} 篇论文`
    : `${label}, ${count} ${count === 1 ? "publication" : "publications"}`;
};

const renderLanguage = () => {
  document.documentElement.lang = currentLanguage === "zh" ? "zh-CN" : "en";
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = translate(element.dataset.i18n);
  });
  translatedAttributes.forEach((attribute) => {
    document.querySelectorAll(`[data-i18n-${attribute}]`).forEach((element) => {
      element.setAttribute(attribute, translate(element.getAttribute(`data-i18n-${attribute}`)));
    });
  });
  document.querySelectorAll("[data-language]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.language === currentLanguage));
  });
  document.querySelectorAll(".cite-toggle").forEach((button) => {
    button.textContent = translate(button.getAttribute("aria-expanded") === "true" ? "hideCite" : "cite");
  });
  document.querySelectorAll(".copy-cite").forEach((button) => {
    button.lang = document.documentElement.lang;
    button.textContent = translate(button.dataset.copyState || "copy");
  });
  document.querySelectorAll(".more-toggle").forEach((button) => {
    button.textContent = translate(button.getAttribute("aria-expanded") === "true" ? "fewerPreprints" : "morePreprints");
  });
  document.querySelectorAll(".publication-filter").forEach((button) => {
    button.textContent = publicationFilterLabel(button.dataset.year);
    button.setAttribute("aria-label", publicationFilterDescription(button.dataset.year, Number(button.dataset.count)));
  });
};

document.querySelectorAll("[data-language]").forEach((button) => {
  button.addEventListener("click", () => {
    currentLanguage = button.dataset.language;
    renderLanguage();
    try {
      localStorage.setItem("homepage-language", currentLanguage);
    } catch {
      // The current page remains usable without persisting the preference.
    }
  });
});

// Paper details and BibTeX stay in their original language in both versions.
document.querySelectorAll(".paper-title, .paper-authors, .paper-meta, .paper-tags, .paper-figure, .cite-block").forEach((element) => {
  element.lang = "en";
});

const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".topbar-nav");

menuToggle?.addEventListener("click", () => {
  const isOpen = siteNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

siteNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    siteNav.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
  });
});

document.querySelectorAll(".cite-toggle").forEach((button) => {
  button.addEventListener("click", () => {
    const target = document.getElementById(button.dataset.target);
    if (!target) return;
    const isOpen = target.classList.toggle("open");
    button.textContent = translate(isOpen ? "hideCite" : "cite");
    button.setAttribute("aria-expanded", String(isOpen));
  });
});

const copyResetTimers = new WeakMap();
document.querySelectorAll(".copy-cite").forEach((button) => {
  button.addEventListener("click", async () => {
    const target = document.getElementById(button.dataset.target);
    if (!target) return;
    clearTimeout(copyResetTimers.get(button));
    try {
      const citation = target.cloneNode(true);
      citation.querySelectorAll("button").forEach((control) => control.remove());
      const text = citation.textContent.trim();
      await navigator.clipboard.writeText(text);
      button.dataset.copyState = "copied";
    } catch {
      button.dataset.copyState = "copyFailed";
    }
    button.textContent = translate(button.dataset.copyState);
    copyResetTimers.set(button, setTimeout(() => {
      button.dataset.copyState = "copy";
      button.textContent = translate("copy");
    }, 1200));
  });
});

document.querySelectorAll(".more-toggle").forEach((button) => {
  button.addEventListener("click", () => {
    const target = document.getElementById(button.dataset.target);
    if (!target) return;
    const isOpen = target.classList.toggle("open");
    button.textContent = translate(isOpen ? "fewerPreprints" : "morePreprints");
    button.setAttribute("aria-expanded", String(isOpen));
  });
});

const publicationFilters = document.querySelector("#publications .publication-filters");
const publicationItems = [...document.querySelectorAll("#publication-results > .paper-item")];

if (publicationFilters && publicationItems.length) {
  const years = [...new Set(publicationItems.map((paper) => paper.dataset.year))]
    .sort((a, b) => Number(b) - Number(a));

  const selectPublicationYear = (year) => {
    const visiblePapers = publicationItems.filter((paper) => year === "all" || paper.dataset.year === year);
    publicationItems.forEach((paper) => {
      paper.hidden = year !== "all" && paper.dataset.year !== year;
      paper.classList.toggle("is-first-visible", paper === visiblePapers[0]);
      paper.classList.toggle("is-last-visible", paper === visiblePapers[visiblePapers.length - 1]);
    });
    publicationFilters.querySelectorAll("button").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.year === year));
    });
  };

  ["all", ...years].forEach((year) => {
    const button = document.createElement("button");
    const count = publicationItems.filter((paper) => year === "all" || paper.dataset.year === year).length;
    button.type = "button";
    button.className = "publication-filter";
    button.dataset.year = year;
    button.dataset.count = String(count);
    button.textContent = publicationFilterLabel(year);
    button.setAttribute("aria-label", publicationFilterDescription(year, count));
    button.setAttribute("aria-controls", "publication-results");
    button.addEventListener("click", () => selectPublicationYear(year));
    publicationFilters.append(button);
  });

  selectPublicationYear("all");
  publicationFilters.hidden = false;
}

renderLanguage();
