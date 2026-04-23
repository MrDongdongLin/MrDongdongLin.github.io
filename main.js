const publications = [
  {
    year: "2025",
    title: "Exploiting Robust Model Watermarking Against the Model Fine-Tuning Attack via Flat Minima Aware Optimizers",
    authors: "Dongdong Lin, Yue Li, Bin Li, Jiwu Huang",
    venue: "IEEE International Conference on Acoustics, Speech and Signal Processing (ICASSP)",
    note: "2025 | CCF-B | Oral",
    tags: ["Watermarking", "Robustness", "Fine-tuning"],
    featured: true,
    link: "https://ieeexplore.ieee.org/document/10890107/"
  },
  {
    year: "2025",
    title: "SOLIDO: A Robust Watermarking Method for Speech Synthesis via Low-Rank Adaptation",
    authors: "Yue Li, Weizhi Liu, Dongdong Lin",
    venue: "CoRR abs/2504.15035",
    note: "2025 | arXiv preprint",
    tags: ["Speech Synthesis", "LoRA", "Audio Watermarking"],
    featured: true,
    link: "https://dblp.org/rec/journals/corr/abs-2504-15035"
  },
  {
    year: "2025",
    title: "A CycleGAN Watermarking Method for Ownership Verification",
    authors: "Dongdong Lin, Benedetta Tondi, Bin Li, Mauro Barni",
    venue: "IEEE Transactions on Dependable and Secure Computing",
    note: "Vol. 22(2): 1040-1054 | CCF-A",
    tags: ["CycleGAN", "Ownership Verification", "Model Watermarking"],
    featured: true,
    link: "https://dblp.org/rec/journals/tdsc/LinTLB25"
  },
  {
    year: "2024",
    title: "An Efficient Watermarking Method for Latent Diffusion Models via Low-Rank Adaptation",
    authors: "Dongdong Lin, Yue Li, Benedetta Tondi, Bin Li, Mauro Barni",
    venue: "CoRR abs/2410.20202",
    note: "2024 | arXiv preprint",
    tags: ["Diffusion Models", "LoRA", "AIGC Security"],
    featured: true,
    link: "https://arxiv.org/abs/2410.20202"
  },
  {
    year: "2024",
    title: "GROOT: Generating Robust Watermark for Diffusion-Model-Based Audio Synthesis",
    authors: "Weizhi Liu, Yue Li, Dongdong Lin, Hui Tian, Haizhou Li",
    venue: "Proceedings of the 32nd ACM International Conference on Multimedia",
    note: "2024 | CCF-A",
    tags: ["Audio Synthesis", "Diffusion", "Watermarking"],
    featured: true,
    link: "https://faculty.hqu.edu.cn/ddlin/en/lwcg/240308/content/58033.htm"
  },
  {
    year: "2023",
    title: "Watching the BiG Artifacts: Exposing DeepFake Videos via Bi-Granularity Artifacts",
    authors: "Han Chen, Yuezun Li, Dongdong Lin, Bin Li, Junqiang Wu",
    venue: "Pattern Recognition",
    note: "Vol. 135: 109179 | CCF-B",
    tags: ["Deepfake Detection", "Forensics", "Multimedia Security"],
    featured: false,
    link: "https://faculty.hqu.edu.cn/ddlin/en/lwcg/240308/content/58035.htm"
  },
  {
    year: "2022",
    title: "Exploiting Temporal Information to Prevent the Transferability of Adversarial Examples Against Deep Fake Detectors",
    authors: "Dongdong Lin, Benedetta Tondi, Bin Li, Mauro Barni",
    venue: "IEEE International Joint Conference on Biometrics (IJCB)",
    note: "2022 | CCF-C | Oral",
    tags: ["Adversarial Attack", "Deepfake", "Temporal Modeling"],
    featured: false,
    link: "https://faculty.hqu.edu.cn/ddlin/en/lwcg/240308/content/58036.htm"
  }
];

const news = [
  {
    date: "2025",
    text: "Published ICASSP 2025 work on improving model watermark robustness under fine-tuning attacks with flat-minima-aware optimization."
  },
  {
    date: "2025",
    text: "New work expands watermarking research into speech synthesis with the SOLIDO framework based on low-rank adaptation."
  },
  {
    date: "2024",
    text: "Released recent work on diffusion-model watermarking and co-authored ACM MM paper GROOT for audio synthesis."
  },
  {
    date: "2024",
    text: "TDSC paper on CycleGAN ownership verification is now part of the current profile and highlighted on the updated homepage."
  },
  {
    date: "2025 Intake",
    text: "Faculty profile indicates recruitment for professional master's students in Network and Information Security."
  }
];

const publicationList = document.querySelector("#publication-list");
const newsList = document.querySelector("#news-list");
const chips = document.querySelectorAll(".chip");
const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");

function renderPublications(filter = "all") {
  const filtered = publications.filter((paper) => {
    if (filter === "all") return true;
    if (filter === "selected") return paper.featured;
    return paper.year === filter;
  });

  publicationList.innerHTML = filtered.map((paper) => `
    <article class="publication-item reveal">
      <h3 class="publication-title">${paper.title}</h3>
      <p class="publication-authors">${paper.authors}</p>
      <p class="publication-meta">${paper.venue} | ${paper.note}</p>
      <div class="publication-footer">
        <div class="tag-group">
          ${paper.tags.map((tag) => `<span class="pub-tag">${tag}</span>`).join("")}
        </div>
        <a class="pub-link" href="${paper.link}">View</a>
      </div>
    </article>
  `).join("");
}

function renderNews() {
  newsList.innerHTML = news.map((item, index) => `
    <article class="timeline-item reveal delay-${Math.min(index, 3)}">
      <span class="news-date">${item.date}</span>
      <p>${item.text}</p>
    </article>
  `).join("");
}

chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    chips.forEach((item) => item.classList.remove("active"));
    chip.classList.add("active");
    renderPublications(chip.dataset.filter);
  });
});

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

renderPublications();
renderNews();
