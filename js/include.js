// Load all elements with data-include attribute
document.addEventListener("DOMContentLoaded", () => {
  const includes = document.querySelectorAll("[data-include]");

  includes.forEach(async (el) => {
    const file = el.getAttribute("data-include");
    try {
      const resp = await fetch(file);
      if (!resp.ok) throw new Error(`Failed to load ${file}`);
      const text = await resp.text();
      el.innerHTML = text;
    } catch (err) {
      el.innerHTML = `<p style="color:red;">Error: ${err.message}</p>`;
    }
  });
});
