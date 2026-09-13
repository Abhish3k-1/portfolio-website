// Update this config when you publish new repos or know the exact Linux habit start date.
const portfolioConfig = {
  githubUser: "Abhish3k-1",
  linuxPracticeStartDate: ""
};

const root = document.documentElement;
root.classList.add("js-enabled");

const getStoredTheme = () => {
  try {
    return window.localStorage.getItem("portfolio-theme");
  } catch (error) {
    return null;
  }
};

const setStoredTheme = (theme) => {
  try {
    window.localStorage.setItem("portfolio-theme", theme);
  } catch (error) {
    return null;
  }
};

const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
const initialTheme = getStoredTheme() || (prefersLight ? "light" : "dark");
const themeToggle = document.querySelector("#theme-toggle");

const updateThemeControl = (theme) => {
  if (!themeToggle) return;
  const nextTheme = theme === "dark" ? "light" : "dark";
  themeToggle.setAttribute("aria-label", `Switch to ${nextTheme} theme`);
  themeToggle.setAttribute("title", `Switch to ${nextTheme} theme`);
};

const applyTheme = (theme) => {
  root.dataset.theme = theme;
  updateThemeControl(theme);
};

applyTheme(initialTheme);

themeToggle?.addEventListener("click", () => {
  const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(nextTheme);
  setStoredTheme(nextTheme);
});

const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector("#nav-links");

const closeMobileNav = () => {
  navLinks?.classList.remove("is-open");
  navToggle?.setAttribute("aria-expanded", "false");
  navToggle?.setAttribute("aria-label", "Open navigation");
};

navToggle?.addEventListener("click", () => {
  const isOpen = navLinks?.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(Boolean(isOpen)));
  navToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
});

navLinks?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMobileNav);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMobileNav();
});

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealElements = document.querySelectorAll("[data-reveal]");

if ("IntersectionObserver" in window && !reducedMotion) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.16, rootMargin: "0px 0px -40px 0px" });

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}

if (!reducedMotion) {
  document.querySelectorAll(".glare-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty("--glare-x", `${x.toFixed(2)}%`);
      card.style.setProperty("--glare-y", `${y.toFixed(2)}%`);
    });
  });
}

const formatDate = (dateString) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "recently";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
};

const loadRepoData = async () => {
  const projectCards = document.querySelectorAll("[data-repo]");
  if (!projectCards.length || !window.fetch) return;

  await Promise.all(Array.from(projectCards).map(async (card) => {
    const repoName = card.dataset.repo;
    const status = card.querySelector(".repo-status");
    const stars = card.querySelector(".repo-stars");
    const updated = card.querySelector(".repo-updated");

    try {
      const response = await fetch(`https://api.github.com/repos/${portfolioConfig.githubUser}/${repoName}`, {
        headers: { Accept: "application/vnd.github+json" }
      });

      if (!response.ok) throw new Error(`GitHub responded with ${response.status}`);
      const repo = await response.json();

      if (status) status.textContent = repo.language ? repo.language : "Public repo";
      if (stars) stars.textContent = `${repo.stargazers_count} stars`;
      if (updated) updated.textContent = `Updated ${formatDate(repo.pushed_at || repo.updated_at)}`;
    } catch (error) {
      if (status) status.textContent = "Repo data unavailable";
    }
  }));
};

loadRepoData();

const linuxDayCount = document.querySelector("#linux-day-count");
const linuxDayCopy = document.querySelector("#linux-day-copy");

const updateLinuxCounter = () => {
  const startDate = portfolioConfig.linuxPracticeStartDate;
  if (!linuxDayCount || !linuxDayCopy || !startDate) return;

  const start = new Date(`${startDate}T00:00:00`);
  if (Number.isNaN(start.getTime())) return;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const diff = today.getTime() - startDay.getTime();
  const day = Math.max(1, Math.floor(diff / 86400000) + 1);

  linuxDayCount.textContent = `Day ${day}`;
  linuxDayCopy.textContent = `of daily Linux practice since ${formatDate(startDate)}`;
};

updateLinuxCounter();

const sectionLinks = Array.from(document.querySelectorAll(".nav-links a[href^='#']"));
const sections = sectionLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if ("IntersectionObserver" in window && sections.length) {
  const activeObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      sectionLinks.forEach((link) => {
        const isActive = link.getAttribute("href") === `#${entry.target.id}`;
        if (isActive) {
          link.setAttribute("aria-current", "true");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    });
  }, { rootMargin: "-36% 0px -58% 0px", threshold: 0.01 });

  sections.forEach((section) => activeObserver.observe(section));
}

const year = document.querySelector("#year");
if (year) year.textContent = new Date().getFullYear();
