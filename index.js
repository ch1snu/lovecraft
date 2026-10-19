"use strict";

const filterButtons = document.querySelectorAll(".filter-button");
const templateCards = document.querySelectorAll(".template-card");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    filterButtons.forEach((item) => {
      item.classList.remove("active");
    });

    button.classList.add("active");

    templateCards.forEach((card) => {
      const category = card.dataset.category;

      card.hidden = filter !== "all" && category !== filter;
    });
  });
});
