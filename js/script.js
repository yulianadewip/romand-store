// toggle class active
const navbarNav = document.querySelector(".navbar-nav");
// ketika hamburger-menu di klik
document.querySelector("#hamburger-menu").onclick = () => {
  navbarNav.classList.toggle("active");
};

// klik di luar sidebar untuk menghilangkan navbar
const hamburger = document.querySelector("#hamburger-menu");

document.addEventListener("click", function (e) {
  if (!hamburger.contains(e.target) && !navbarNav.contains(e.target)) {
    navbarNav.classList.remove("active");
  }
});

// mood card
const moodCards = document.querySelectorAll(".mood-card");

const moodSection = document.querySelector(".mood-section");
const productSection = document.querySelector(".mood-product");
const productImageContainer = document.querySelector(".mood-product-image");
const productInfo = document.querySelector(".mood-product-info");

const productImage = document.querySelector("#product-image");
const productNumber = document.querySelector("#product-number");
const productName = document.querySelector("#product-name");
const productDescription = document.querySelector("#product-description");

const productLabel = document.querySelector(".product-label");
const productButton = document.querySelector(".product-button");
const anotherMood = document.querySelector(".another-mood");

// mood data
const moodData = {
  soft: {
    number: "01",
    name: "NUDE SUN",
    description: "Nude Sun is nude for slow and effortless days.",
    image: "img/nude-sun.webp",
    color: "#ffb1b1",
    text: "#111111",
  },

  warm: {
    number: "02",
    name: "CORAL BREEZE",
    description: "Coral Breeze is glow for brighter moments.",
    image: "img/coral-breeze.webp",
    color: "#ffbdd9",
    text: "#111111",
  },

  cool: {
    number: "03",
    name: "BERRY CRUSH",
    description: "Berry Crush made for owning the moment.",
    image: "img/berry-crush.webp",
    color: "#7e0000",
    text: "#ffffff",
  },

  fresh: {
    number: "04",
    name: "SWEET CHERRY",
    description: "Sweet Cherry is fresh glow made to brighten your day.",
    image: "img/sweet-cherry.webp",
    color: "#fe4949",
    text: "#ffffff",
  },
};

// Menyembunyikan mood card
function hideMoodProduct() {
  // Hilangkan active dari semua card
  moodCards.forEach((card) => {
    card.classList.remove("active");
    card.style.backgroundColor = "var(--paper)";
    card.style.color = "var(--ink)";
  });

  // Sembunyikan mood board
  productSection.style.display = "none";
}

// Active mood
function setMood(card) {
  const mood = card.dataset.mood;
  const data = moodData[mood];

  if (!data) return;

  // Active semua card
  moodCards.forEach((item) => {
    item.classList.remove("active");
    item.style.backgroundColor = "var(--paper)";
    item.style.color = "var(--ink)";
  });
  // Active card
  card.classList.add("active");

  card.style.backgroundColor = data.color;
  card.style.color = data.text;

  // Tampilkan mood board
  productSection.style.display = "grid";
  moodSection.style.backgroundColor = data.color;
  productSection.style.backgroundColor = data.color;
  productImageContainer.style.backgroundColor = data.color;
  productInfo.style.backgroundColor = data.color;

  // Text color
  productInfo.style.color = data.text;

  productLabel.style.color = data.text;
  productNumber.style.color = data.text;
  productName.style.color = data.text;
  productDescription.style.color = data.text;
  anotherMood.style.color = data.text;
  productButton.style.color = data.color;
  productButton.style.backgroundColor = data.text;
  productNumber.textContent = data.number;
  productName.textContent = data.name;
  productDescription.textContent = data.description;
  productImage.style.opacity = "0";

  setTimeout(() => {
    productImage.src = data.image;

    productImage.onload = () => {
      productImage.style.opacity = "1";
    };
  }, 200);
}

moodCards.forEach((card) => {
  card.addEventListener("click", (e) => {
    e.stopPropagation();
    setMood(card);
  });
});

// Klik di luar mood card
document.addEventListener("click", (e) => {
  const moodArea = e.target.closest(".mood-section");
  const productArea = e.target.closest(".mood-product");
  if (!moodArea && !productArea) {
    hideMoodProduct();
  }
});

hideMoodProduct();
