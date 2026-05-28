const CART_STORAGE_KEY = 'pizzaDeliveryCart';

const emptyCart = {
  items: [],
  totalQuantity: 0,
  totalAmount: 0,
};

const loadCart = () => {
  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    return savedCart ? JSON.parse(savedCart) : emptyCart;
  } catch {
    return emptyCart;
  }
};

const saveCart = (cart) => {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
};

const cartService = {
  loadCart,
  saveCart,
  emptyCart,
};

export default cartService;
