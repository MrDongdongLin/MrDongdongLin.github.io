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
    button.textContent = isOpen ? "Hide Cite" : "Cite";
    button.setAttribute("aria-expanded", String(isOpen));
  });
});

document.querySelectorAll(".copy-cite").forEach((button) => {
  button.addEventListener("click", async () => {
    const target = document.getElementById(button.dataset.target);
    if (!target) return;
    try {
      const citation = target.cloneNode(true);
      citation.querySelectorAll("button").forEach((control) => control.remove());
      const text = citation.textContent.trim();
      await navigator.clipboard.writeText(text);
      button.textContent = "Copied";
      setTimeout(() => {
        button.textContent = "Copy";
      }, 1200);
    } catch {
      button.textContent = "Copy Failed";
      setTimeout(() => {
        button.textContent = "Copy";
      }, 1200);
    }
  });
});

document.querySelectorAll(".more-toggle").forEach((button) => {
  button.addEventListener("click", () => {
    const target = document.getElementById(button.dataset.target);
    if (!target) return;
    const isOpen = target.classList.toggle("open");
    button.textContent = isOpen ? "Show fewer preprints" : "Show more preprints";
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
    const label = year === "all" ? "All Publications" : year;
    const count = publicationItems.filter((paper) => year === "all" || paper.dataset.year === year).length;
    button.type = "button";
    button.className = "publication-filter";
    button.dataset.year = year;
    button.textContent = label;
    button.setAttribute("aria-label", `${label}, ${count} ${count === 1 ? "publication" : "publications"}`);
    button.setAttribute("aria-controls", "publication-results");
    button.addEventListener("click", () => selectPublicationYear(year));
    publicationFilters.append(button);
  });

  selectPublicationYear("all");
  publicationFilters.hidden = false;
}
