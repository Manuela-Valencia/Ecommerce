async function getProducts() {
  try {
    const data = await fetch(
      "https://ecommercebackend.fundamentos-29.repl.co/"
    );

    const res = await data.json();

    window.localStorage.setItem("products", JSON.stringify(res));

    return res;
  } catch (error) {
    console.log(error);
  }
}

function printProducts(db) {
  const productsHTML = document.querySelector(".products");

  let html = "";
  for (const product of db.products) {
    const soldOut = product.quantity
      ? `<i class='bx bx-plus' id='${product.id}'></i>`
      : `<span class="product__soldout">Sold Out</span>`;

    const stockHide = product.quantity
      ? `<span class="product__info--stock">Stock: ${product.quantity}</span>`
      : `<span class="product__info--stock-hide"></span>`;

    let categoryClass = "";
    if (product.category === "shirt") {
      categoryClass = "shirt";
    } else if (product.category === "hoddie") {
      categoryClass = "hoddie";
    } else if (product.category === "sweater") {
      categoryClass = "sweater";
    }

    html += `
    <div class="product ${categoryClass}">

      <div class="product__img">
        <img src="${product.image}" alt="imagen" />
      </div>

      <div class="product__info">
        <h3>
          $${product.price}.00
          ${soldOut}
          ${stockHide}
        </h3>
        <p class="showModalProduct">
          ${product.name}
        </p>
      </div>
    </div>
    `;
  }

  productsHTML.innerHTML = html;
}

const handleOpenCart = () => {
  const openIconCartHTML = document.querySelector(".bx-shopping-bag");
  const cartHTML = document.querySelector(".contentCart");

  openIconCartHTML.addEventListener("click", () => {
    cartHTML.classList.toggle("contentCart_show");
  });
};

function handleCloseCart() {
  const closeIconCartHTML = document.querySelector(".bx-x");
  const cartHTML = document.querySelector(".contentCart");

  closeIconCartHTML.addEventListener("click", function () {
    cartHTML.classList.remove("contentCart_show");
  });
}

function addToCartFromProducts(db) {
  const productsHTML = document.querySelector(".products");

  productsHTML.addEventListener("click", function (e) {
    if (e.target.classList.contains("bx-plus")) {
      const id = Number(e.target.id);

      const productFind = db.products.find((product) => product.id === id);

      if (db.cart[productFind.id]) {
        if (productFind.quantity === db.cart[productFind.id].amount) {
          return alert("No tenemos mas stock de este producto");
        }
        db.cart[productFind.id].amount++;
      } else {
        db.cart[productFind.id] = { ...productFind, amount: 1 };
      }

      window.localStorage.setItem("cart", JSON.stringify(db.cart));
      printProductsInCart(db);
      printTotal(db);
      handlePrintAmountProducts(db);
    }
  });
}

function printProductsInCart(db) {
  const cardProductsHTML = document.querySelector(".contentCart__products");
  let html = ``;
  for (const product in db.cart) {
    const { quantity, price, name, image, id, amount } = db.cart[product];
    html += `
      <div class="product__card">
        <div class="product__card--img">
          <img src="${image}" alt="imagen" />
        </div>
        <div class="product__card--body">
          <h4>${name}</h4>
          <p>
          Stock: ${quantity} |
          <span>$${price}.00</span>
          </p>
          <p>Subtotal:</p>
          <div class="product__card--action" id="${id}">
            <i class="bx bx-minus"></i>
            <span>${amount} unit</span>
            <i class="bx bx-plus"></i>
            <i class="bx bx-trash"></i>
          </div>
        </div>
      </div>
    `;
  }
  cardProductsHTML.innerHTML = html;
}

function handleProductsInCart(db) {
  const cartProducts = document.querySelector(".contentCart__products");

  cartProducts.addEventListener("click", function (e) {
    const id = Number(e.target.parentElement.id);
    const productFind = db.products.find((product) => product.id === id);

    if (e.target.classList.contains("bx-minus")) {
      if (db.cart[id].amount === 1) {
        const response = confirm(
          "¿Estás seguro de que deseas eliminar este producto?"
        );
        if (!response) return;
        delete db.cart[id];
      } else {
        db.cart[id].amount--;
      }
    }

    if (e.target.classList.contains("bx-plus")) {
      if (productFind.quantity === db.cart[productFind.id].amount) {
        return alert("No tenemos mas stock de este producto");
      }

      db.cart[id].amount++;
    }

    if (e.target.classList.contains("bx-trash")) {
      const response = confirm(
        "¿Estás seguro de que deseas eliminar este producto?"
      );
      if (!response) return;
      delete db.cart[id];
    }

    window.localStorage.setItem("cart", JSON.stringify(db.cart));
    printProductsInCart(db);
    printTotal(db);
    handlePrintAmountProducts(db);
  });
}

function printTotal(db) {
  const infoTotal = document.querySelector(".totalPrice");
  const infoAmount = document.querySelector(".numberItems");

  let totalProductsPrice = 0;
  let amountProducts = 0;

  for (const product in db.cart) {
    const { amount, price } = db.cart[product];
    totalProductsPrice += price * amount;
    amountProducts += amount;
  }

  infoAmount.textContent = amountProducts + " items";
  infoTotal.textContent = "$" + totalProductsPrice + ".00";
}

function handleTotal(db) {
  const btnBuy = document.querySelector(".btn__buy");

  btnBuy.addEventListener("click", function () {
    if (!Object.values(db.cart).length)
      return alert("Necesitas mínimo 1 producto para realizar una compra");

    const response = confirm("¿Seguro desea proceder con su compra?");
    if (!response) return;

    const currentProducts = [];

    for (const product of db.products) {
      const productCart = db.cart[product.id];
      if (product.id === productCart?.id) {
        currentProducts.push({
          ...product,
          quantity: product.quantity - productCart.amount,
        });
      } else {
        currentProducts.push(product);
      }
    }

    db.products = currentProducts;
    db.cart = {};

    window.localStorage.setItem("products", JSON.stringify(db.products));
    window.localStorage.setItem("cart", JSON.stringify(db.cart));

    printTotal(db);
    printProductsInCart(db);
    printProducts(db);
    handlePrintAmountProducts(db);
  });
}

function handlePrintAmountProducts(db) {
  const amountProducts = document.querySelector(".totalAmountProducts");

  let amount = 0;

  for (const product in db.cart) {
    amount += db.cart[product].amount;
  }

  amountProducts.textContent = amount;
}

function handleDarkMode() {
  const btnDarkMode = document.querySelector(".bx-moon");
  const bodyHTML = document.querySelector(".body");

  btnDarkMode.addEventListener("click", function () {
    bodyHTML.classList.toggle("dark-theme");
    btnDarkMode.classList.toggle("bx-sun");
  });
}

function handleScroll() {
  const homeSection = document.querySelector(".home");
  const header = document.querySelector(".headerPrincipal");

  const observer = new IntersectionObserver((entries) => {
    const entry = entries[0];
    if (entry.isIntersecting) {
      header.classList.remove("header_show");
    } else {
      header.classList.add("header_show");
    }
  });

  observer.observe(homeSection);
}

function handleMenuLinks() {
  const productSection = document.querySelector(".content_products");
  const liProducts = document.querySelector(".li_product");
  const liHome = document.querySelector(".li_home");

  function activateLink(link) {
    link.classList.add("link__active");
  }

  function deactivateLink(link) {
    link.classList.remove("link__active");
  }

  function detectScroll() {
    const productPosition =
      productSection.getBoundingClientRect().top + window.scrollY;
    const currentPosition = window.scrollY;

    if (currentPosition >= productPosition) {
      activateLink(liProducts);
      deactivateLink(liHome);
    } else {
      activateLink(liHome);
      deactivateLink(liProducts);
    }
  }

  window.addEventListener("scroll", detectScroll);
}

function handleNavMenu() {
  const navbarMenu = document.querySelector(".navbar_menu");
  const mobileNavMenu = document.querySelector(".handleIconNavbar");
  const liProducts = document.querySelector(".li_product");
  const liHome = document.querySelector(".li_home");

  mobileNavMenu.addEventListener("click", function () {
    navbarMenu.classList.toggle("navbar_menu-show");
    mobileNavMenu.classList.toggle("bxs-dashboard");
    mobileNavMenu.classList.toggle("bx-x");

    if (mobileNavMenu.classList.contains("bx-x")) {
      liProducts.addEventListener("click", function () {
        navbarMenu.classList.remove("navbar_menu-show");
        mobileNavMenu.classList.remove("bx-x");
        mobileNavMenu.classList.add("bxs-dashboard");
      });

      liHome.addEventListener("click", function () {
        navbarMenu.classList.remove("navbar_menu-show");
        mobileNavMenu.classList.remove("bx-x");
        mobileNavMenu.classList.add("bxs-dashboard");
      });
    }
  });
}

function handleLoading() {
  const loading = document.querySelector(".load");

  function hideLoading() {
    loading.style.display = "none";
  }

  setTimeout(hideLoading, 2000);
}

function handleFilterOptions() {
  const filters = document.querySelectorAll(".filter");
  const acceptedFilters = [".shirt", ".hoddie", ".sweater", "all"];

  for (let i = 0; i < filters.length; i++) {
    filters[i].addEventListener("click", function () {
      const dataFilter = this.getAttribute("data-filter");
      if (acceptedFilters.includes(dataFilter)) {
        filters.forEach((filter) => filter.classList.remove("filter__active"));
        this.classList.add("filter__active");
      }
    });
  }
}

document
  .querySelector('.filter[data-filter=".shirt"]')
  .addEventListener("click", function () {
    let filterValue = this.dataset.filter;
    mixer.filter(filterValue);
  });

document
  .querySelector('.filter[data-filter=".hoddie"]')
  .addEventListener("click", function () {
    let filterValue = this.dataset.filter;
    mixer.filter(filterValue);
  });

document
  .querySelector('.filter[data-filter=".sweater"]')
  .addEventListener("click", function () {
    let filterValue = this.dataset.filter;
    mixer.filter(filterValue);
  });

function handleCategoryQuantity(db) {
  let shirtQty = 0;
  let hoddieQty = 0;
  let sweaterQty = 0;

  db.products.forEach((product) => {
    if (product.category === "shirt") {
      shirtQty++;
    }

    if (product.category === "hoddie") {
      hoddieQty++;
    }

    if (product.category === "sweater") {
      sweaterQty++;
    }
  });

  document.querySelector(
    '.filter[data-filter=".shirt"] p:last-child'
  ).textContent = shirtQty + " products";
  document.querySelector(
    '.filter[data-filter=".hoddie"] p:last-child'
  ).textContent = hoddieQty + " products";
  document.querySelector(
    '.filter[data-filter=".sweater"] p:last-child'
  ).textContent = sweaterQty + " products";
}

function handleModalProduct(db) {
  const showModalButtons = document.querySelectorAll(".showModalProduct");

  showModalButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const product = db.products.find(
        (prod) => prod.name === button.textContent.trim()
      );
      printModalProduct(product);
      addToCartFromModal(db);
    });
  });
}

function printModalProduct(product) {
  const modalProduct = document.querySelector(".modalProduct");
  modalProduct.classList.add("modalProduct__show");

  const contentProduct = document.createElement("div");
  contentProduct.classList.add("contentProduct");

  const closeModal = document.createElement("i");
  closeModal.classList.add("bx", "bxs-x-circle", "closeModal");
  closeModal.addEventListener("click", () => {
    modalProduct.classList.remove("modalProduct__show");
    contentProduct.remove();
  });

  const contentProductImg = document.createElement("div");
  contentProductImg.classList.add("contentProduct__img");

  const img = document.createElement("img");
  img.src = product.image;
  img.alt = "Product image";

  const contentProductName = document.createElement("h3");
  contentProductName.classList.add("contentProduct__name");
  contentProductName.textContent = `${product.name} - ${product.category}`;

  const contentProductDescription = document.createElement("p");
  contentProductDescription.classList.add("contentProduct__p");
  contentProductDescription.textContent = product.description;

  const contentProductInfo = document.createElement("div");
  contentProductInfo.classList.add("contentProduct__info");

  const contentProductPrice = document.createElement("h3");
  contentProductPrice.textContent = `$${product.price}.00`;

  const plusIcon = document.createElement("i");
  plusIcon.classList.add("bx", "bx-plus");
  plusIcon.id = product.id;

  const stockInfo = document.createElement("p");
  stockInfo.textContent = `Stock: ${product.quantity}`;

  contentProductImg.appendChild(img);
  contentProduct.appendChild(closeModal);
  contentProduct.appendChild(contentProductImg);
  contentProduct.appendChild(contentProductName);
  contentProduct.appendChild(contentProductDescription);
  contentProduct.appendChild(contentProductInfo);
  contentProductInfo.appendChild(contentProductPrice);
  contentProductPrice.appendChild(plusIcon);
  contentProductInfo.appendChild(stockInfo);
  modalProduct.appendChild(contentProduct);
}

function addToCartFromModal(db) {
  const modalWindow = document.querySelector(".contentProduct");

  if (modalWindow) {
    modalWindow.addEventListener("click", function (e) {
      if (e.target.classList.contains("bx-plus")) {
        const id = Number(e.target.id);

        const productFind = db.products.find((product) => product.id === id);

        if (db.cart[productFind.id]) {
          if (productFind.quantity === db.cart[productFind.id].amount) {
            return alert("No tenemos mas stock de este producto");
          }
          db.cart[productFind.id].amount++;
        } else {
          db.cart[productFind.id] = { ...productFind, amount: 1 };
        }

        window.localStorage.setItem("cart", JSON.stringify(db.cart));
        printProductsInCart(db);
        printTotal(db);
        handlePrintAmountProducts(db);
      }
    });
  }
}

async function main() {
  const db = {
    products:
      JSON.parse(window.localStorage.getItem("products")) ||
      (await getProducts()),
    cart: JSON.parse(window.localStorage.getItem("cart")) || {},
  };

  printProducts(db);
  handleOpenCart();
  handleCloseCart();
  addToCartFromProducts(db);
  printProductsInCart(db);
  handleProductsInCart(db);
  printTotal(db);
  handleTotal(db);
  handlePrintAmountProducts(db);
  handleDarkMode();
  handleScroll();
  handleMenuLinks();
  handleNavMenu();
  handleLoading();
  handleFilterOptions();
  handleCategoryQuantity(db);
  handleModalProduct(db);
}

main();
