$(document).ready(function () {
  const $hamburger = $("#hamburger");
  const $mobileNav = $("#mobileNav");
  const $overlay = $("#overlay");

  $hamburger.on("click", function () {
    $mobileNav.toggleClass("open");
    $overlay.toggleClass("show");
    $hamburger.toggleClass("active");
  });

  $overlay.on("click", function () {
    $mobileNav.removeClass("open");
    $overlay.removeClass("show");
    $hamburger.removeClass("active");
  });
});
// ====Section(7)=============================================================================================================
const items = document.querySelectorAll(".accordion-item");

items.forEach((item) => {
  const header = item.querySelector(".accordion-header");
  const icon = item.querySelector(".accordion-icon");

  header.addEventListener("click", () => {
    const openItem = document.querySelector(".accordion-item.active");

    // Close previously open item
    if (openItem && openItem !== item) {
      openItem.classList.remove("active");
      openItem.querySelector(".accordion-content").style.maxHeight = null;
      openItem.querySelector(".accordion-content").classList.remove("open");
      openItem.querySelector(".accordion-icon").textContent = "⌄";
    }

    // Toggle clicked item
    item.classList.toggle("active");
    const content = item.querySelector(".accordion-content");

    if (item.classList.contains("active")) {
      content.style.maxHeight = content.scrollHeight + "px";
      content.classList.add("open");
      icon.textContent = "×"; // Change to X
    } else {
      content.style.maxHeight = null;
      content.classList.remove("open");
      icon.textContent = "⌄"; // Back to arrow
    }
  });
});
