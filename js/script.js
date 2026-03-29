const SUPABASE_URL = 'https://odahvmaqnqmyrhmeazgg.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ftztjo13zRtU1RZbaanAcg_ZnnnMlxl';

const TABLES = {
  users: 'users',
  products: 'products',
  orders: 'orders',
  orderItems: 'order_items'
};

// Корзина
class Cart {
  constructor() {
    this.items = [];
    this.init();
  }

  // Инициализация элементов корзины
  init() {
    this.cartBtn = document.querySelector('.cart__btn');
    this.cartCount = document.querySelector('.cart__count');
    this.cartPopup = document.querySelector('.cart-popup');
    this.cartOverlay = document.querySelector('.cart-popup__overlay');
    this.cartClose = document.querySelector('.cart-popup__close');
    this.cartItems = document.querySelector('.cart-popup__items');
    this.cartTotal = document.querySelector('.cart-popup__total-sum');
    this.checkoutBtn = document.querySelector('.cart-popup__checkout');

    this.cartBtn.addEventListener('click', () => this.openPopup());
    this.cartOverlay.addEventListener('click', () => this.closePopup());
    this.cartClose.addEventListener('click', () => this.closePopup());
    this.checkoutBtn.addEventListener('click', () => this.openOrderModal());

    document.querySelectorAll('.catalog__card-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const card = btn.closest('.catalog__card');
        // добавление в корзину товара
        if (card) {
          this.addItem({
            id: card.dataset.id,
            name: card.dataset.name,
            price: parseInt(card.dataset.price),
            image: card.dataset.image || null 
          });
        }
      });
    });
  }

  // Метод добавления товара в корзину
  addItem(item) {
    const existing = this.items.find(i => i.id === item.id);
    if (existing) {
      existing.quantity++;
    } else {
      this.items.push({ ...item, quantity: 1 });
    }
    this.updateCart();
  }

  // Метод удаления товара из корзины
  removeItem(id) {
    this.items = this.items.filter(item => item.id !== id);
    this.updateCart();
  }

  // Метод изменения количества товара в корзине
  updateQuantity(id, delta) {
    const item = this.items.find(i => i.id === id);
    if (item) {
      item.quantity += delta;
      if (item.quantity <= 0) {
        this.removeItem(id);
      }
    }
    this.updateCart();
  }

  // Метод обновления корзины
  updateCart() {
    const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalSum = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    this.cartCount.textContent = totalItems;
    this.cartCount.style.display = totalItems > 0 ? 'flex' : 'none';

    if (this.items.length === 0) {
      this.cartItems.innerHTML = '<p class="cart-popup__empty">Корзина пуста</p>';
    } else {
      this.cartItems.innerHTML = this.items.map(item => {
        // формируем содержимое для блока с картинкой
        let imageContent = '';
        if (item.image) {
          imageContent = `<img src="${item.image}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">`;
        } else {
          
          imageContent = `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 30px; background: #F5AAC3; border-radius: 8px;">${emoji}</div>`;
        }
        
        return `
          <div class="cart-item" data-id="${item.id}">
            <div class="cart-item__image">
              ${imageContent}
            </div>
            <div class="cart-item__info">
              <div class="cart-item__title">${item.name}</div>
              <div class="cart-item__price">${item.price} ₽ × ${item.quantity}</div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <button class="cart-item__remove" onclick="cart.updateQuantity('${item.id}', -1)">−</button>
              <span>${item.quantity}</span>
              <button class="cart-item__remove" onclick="cart.updateQuantity('${item.id}', 1)">+</button>
              <button class="cart-item__remove" onclick="cart.removeItem('${item.id}')">×</button>
            </div>
          </div>
        `;
      }).join('');
    }
    // изменение суммы заказа
    this.cartTotal.textContent = `${totalSum} ₽`;
  }


  // Метод открытие попапа корзины
  openPopup() {
    this.cartPopup.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  // Метод закрытие корзины
  closePopup() {
    this.cartPopup.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Метод открытие окна оформления заказа
  openOrderModal() {
    if (this.items.length === 0) { 
      return;
    }
    this.closePopup();
    document.querySelector('.order-modal').classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  // Метод закрытие окна оформления заказа
  closeOrderModal() {
    document.querySelector('.order-modal').classList.remove('active');
    document.body.style.overflow = '';
    document.getElementById('orderForm').reset();
  }

  // Метод всплывающего уведомления
  showNotification(message, type = 'success') {
    let notification = document.getElementById('notification');
    if (!notification) {
      notification = document.createElement('div');
      notification.id = 'notification';
      notification.className = 'notification';
      document.body.appendChild(notification);
    }
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    setTimeout(() => {
      notification.style.display = 'none';
    }, 3000);
  }
}



// Работа с Supabese
// Новый пользователь в таблице users
async function createUser(userData) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${TABLES.users}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        name: userData.name,
        email: userData.email,
        address: userData.address
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Ошибка при создании пользователя');
    }
    
    const data = await response.json();
    return data[0];
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

// Новый заказ в таблице
async function createOrder(userId, totalAmount) {
  try {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${TABLES.orders}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        user_id: userId,
        total_amount: totalAmount,
        order_date: formattedDate
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Ошибка при создании заказа');
    }
    
    const data = await response.json();
    return data[0];
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

// Добавление товара в заказ
async function createOrderItems(orderId, items) {
  try {
    for (const item of items) {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/${TABLES.orderItems}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          order_id: orderId,
          product_id: parseInt(item.id),
          quantity: item.quantity
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Ошибка при добавлении товаров в заказ');
      }
    }
  } catch (error) {
    console.error('Error creating order items:', error);
    throw error;
  }
}

// Инициализация
const cart = new Cart();
window.cart = cart;

// Обработка формы заказа
const orderForm = document.getElementById('orderForm');
if (orderForm) {
  orderForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Оформление...';
    
    try {
      const userData = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        address: document.getElementById('address').value.trim()
      };
      
      if (!userData.name || !userData.email || !userData.address) {
        throw new Error('Заполните все поля');
      }
      
      // вычисление суммы заказа
      const totalAmount = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      // создание пользователя, заказа, товаров в заказе
      const user = await createUser(userData);
      const order = await createOrder(user.id, totalAmount);
      await createOrderItems(order.id, cart.items);
      
      // Очищаем корзину
      cart.items = [];
      cart.updateCart();
      cart.closeOrderModal();
      
    } catch (error) {
      cart.showNotification(error.message, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Заказать';
    }
  });
}

// Закрытие модального окна по кнопке
const cancelBtn = document.getElementById('cancelOrderBtn');
if (cancelBtn) {
  cancelBtn.addEventListener('click', () => {
    cart.closeOrderModal();
  });
}

const modalOverlay = document.querySelector('.order-modal__overlay');
if (modalOverlay) {
  modalOverlay.addEventListener('click', () => {
    cart.closeOrderModal();
  });
}