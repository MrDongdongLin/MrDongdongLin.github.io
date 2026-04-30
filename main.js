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
  });
});

document.querySelectorAll(".copy-cite").forEach((button) => {
  button.addEventListener("click", async () => {
    const target = document.getElementById(button.dataset.target);
    if (!target) return;
    try {
      const text = target.textContent.replace(/^Copy/, "").trim();
      await navigator.clipboard.writeText(text);
      const original = button.textContent;
      button.textContent = "Copied";
      setTimeout(() => {
        button.textContent = original;
      }, 1200);
    } catch {
      const original = button.textContent;
      button.textContent = "Copy Failed";
      setTimeout(() => {
        button.textContent = original;
      }, 1200);
    }
  });
});

document.querySelectorAll(".more-toggle").forEach((button) => {
  button.addEventListener("click", () => {
    const target = document.getElementById(button.dataset.target);
    if (!target) return;
    const isOpen = target.classList.toggle("open");
    button.textContent = isOpen ? "--less--" : "--more--";
  });
});
