const cartBtn = document.querySelector(".open-overlay");
const cart = document.querySelector(".cart");
const cartCloseBtn = document.querySelector(".cart-close-btn");
const clearBtn = document.querySelector(".cart__erase");
const totalSum = document.querySelector(".total-sum");
const overlayClick = document.querySelector(".overlay");
clearBtn.addEventListener("click", clearCart);
cartBtn.addEventListener("click", toggleCart);
cartCloseBtn.addEventListener("click", toggleCart);

function toggleCart() {
  cart.style.display === "flex"
    ? (cart.style.display = "none")
    : (cart.style.display = "flex");
}
function clearCart() {
  localStorage.clear();
  clearBtn.nextElementSibling.innerHTML = "";
  totalSum.textContent = "";
}
function fillCartList(fromClick) {
  let productName, productImg, productPrice, productQty;
  let product;
  const getLs = JSON.parse(localStorage.getItem("products"));
  const cartList = document.querySelector(".cart__product-list");
  for (let i = 0; i < getLs.length; i++) {
    if (fromClick) {
      const lastItem = getLs.length - 1;
      productId = getLs[lastItem].id;
      productName = getLs[lastItem].name;
      productImg = getLs[lastItem].img;
      productPrice = getLs[lastItem].price;
      productQty = getLs[lastItem].qty;
    } else {
      productId = getLs[i].id;
      productName = getLs[i].name;
      productImg = getLs[i].img;
      productPrice = getLs[i].price;
      productQty = getLs[i].qty;
    }

    product = `
      <div id="${productId}" class="cart__product">
        <div class="cart__product-img" style="background-image: url(${productImg}); "></div>
        <div class="cart__product-text">${productName}</div>
        <div class="cart__product-price">${productPrice}</div>
        <div class="cart__product-pull-right">
          <span><button class="qtyBtn minusQty">-</button></span>
          <div class="cart__product-qty">${productQty}</div>
          <span><button class="qtyBtn plusQty">+</button></span>
          <div class="cart__product-delete"><img src="./img/svg/close.svg"></div>
        </div>
      </div>`;

    if (fromClick === false) {
      cartList.innerHTML += product;
    }
  }
  if (fromClick) {
    cartList.innerHTML += product;
  }
  deleteProduct(getLs);
  updateSum(getLs);
  changeQty(getLs);
}
const productInfo = (btn) => {
  productName = btn.parentElement.firstElementChild.textContent;
  //get url from product card
  productImg = btn.parentElement.previousElementSibling.firstElementChild.style.backgroundImage.slice(
    5,
    -2
  );
  productPrice = btn.previousElementSibling.previousElementSibling.textContent;
  productQty =
    btn.previousElementSibling.firstElementChild.nextElementSibling.textContent;
  productId = btn.parentElement.parentElement.id; //t
  return {
    id: productId,
    name: productName,
    img: productImg,
    price: productPrice,
    qty: productQty,
  };
};

function alreadyExist(getArray, productName) {
  let nameInLs;
  for (let i = 0; i < getArray.length; i++) {
    nameInLs = getArray[i].name;
  }
  return nameInLs === productName;
}

function setLocalStorage(obj, fromClick) {
  const productName = obj.parentElement.firstElementChild.textContent;
  let alreadyExst = false;
  let getArray;
  if (localStorage.getItem("products") === null) {
    let prodArray = [];
    prodArray.push(productInfo(obj));
    localStorage.setItem("products", JSON.stringify(prodArray));
  } else {
    getArray = JSON.parse(localStorage.getItem("products"));

    if (alreadyExist(getArray, productName)) {
      alert("Produkten finns redan i varukorgen!");
      alreadyExst = true;
    } else {
      getArray.push(productInfo(obj));
      localStorage.setItem("products", JSON.stringify(getArray));
    }
  }
  if (alreadyExst === false) {
    fillCartList(fromClick);
  }
}

function refreshCartList() {
  const getLocalStorage = JSON.parse(localStorage.getItem("products"));
  if (getLocalStorage === null) return;
  let fromClick = false;
  fillCartList(fromClick);
}
refreshCartList();

function addProduct(productBtn) {
  for (let i = 0; i < productBtn.length; ++i) {
    const addBtn = productBtn[i];
    addBtn.addEventListener("click", (e) => {
      let fromClick = true;
      setLocalStorage(addBtn, fromClick);
    });
  }
}

function deleteProduct(getJSON) {
  const deleteBtn = document.querySelectorAll(".cart__product-delete");
  for (let i = 0; i < deleteBtn.length; ++i) {
    const delBtn = deleteBtn[i];
    delBtn.addEventListener("click", (e) => {
      //   const index = getJSON.findIndex(prod => {
      //     return prod.id == delBtn.parentElement.parentElement.id;
      //   });
      var findIndex = -1;
      getJSON.some(function (prod, i) {
        if (prod.id == delBtn.parentElement.parentElement.id) {
          findIndex = i;
          return true;
        }
      });
      getJSON.splice(findIndex, 1);
      delBtn.parentElement.parentElement.innerHTML = "";
      localStorage.setItem("products", JSON.stringify(getJSON));
      updateSum(getJSON);

      if (totalSum.textContent === "0") {
        clearCart();
      }
    });
  }
}

function updateSum(getLs) {
  let sum = 0;
  for (let i = 0; i < getLs.length; i++) {
    var str = getLs[i].price;
    var res = str.replace(/\D/g, "");
    sum += +res * getLs[i].qty;
  }
  totalSum.textContent = sum + " kr";
}

function changeQty(getJSON) {
  const qtyBtns = document.querySelectorAll(".qtyBtn");

  for (let i = 0; i < qtyBtns.length; ++i) {
    const qtyBtn = qtyBtns[i];
    qtyBtn.addEventListener("click", function () {
      var findQtyIndex = -1;
      for (var i = 0; i < getJSON.length; ++i) {
        if (
          getJSON[i].id == qtyBtn.parentElement.parentElement.parentElement.id
        ) {
          findQtyIndex = i;
        }
      }

      if (qtyBtn.innerHTML === "+") {
        getJSON[findQtyIndex].qty -= 1; //???
        getJSON[findQtyIndex].qty += 2;
        qtyBtn.parentElement.previousElementSibling.textContent =
          getJSON[findQtyIndex].qty;
      } else {
        if (getJSON[findQtyIndex].qty > 1) getJSON[findQtyIndex].qty -= 1;
        qtyBtn.parentElement.nextElementSibling.textContent =
          getJSON[findQtyIndex].qty;
      }
      localStorage.setItem("products", JSON.stringify(getJSON));
      updateSum(getJSON);
    });
  }
}
