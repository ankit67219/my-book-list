import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// E-commerce Book interface with pricing and details
export interface EcommerceBook {
  id: string;
  name: string;
  aname: string;
  price: number;
  coverImage: string;
  description: string;
  isbn: string;
  stock: number;
  category: string;
}

// Cart Item interface
export interface CartItem {
  book: EcommerceBook;
  quantity: number;
}

// Order interface
export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  date: Date;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  shippingAddress: ShippingAddress;
}

// Shipping Address interface
export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cartItems = new BehaviorSubject<CartItem[]>([]);
  private orders = new BehaviorSubject<Order[]>([]);

  cartItems$ = this.cartItems.asObservable();
  orders$ = this.orders.asObservable();

  constructor() {
    this.loadCart();
    this.loadOrders();
  }

  // Load cart from localStorage
  private loadCart() {
    const saved = localStorage.getItem('cart');
    if (saved) {
      this.cartItems.next(JSON.parse(saved));
    }
  }

  // Save cart to localStorage
  private saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.cartItems.value));
  }

  // Load orders from localStorage
  private loadOrders() {
    const saved = localStorage.getItem('orders');
    if (saved) {
      this.orders.next(JSON.parse(saved));
    }
  }

  // Save orders to localStorage
  private saveOrders() {
    localStorage.setItem('orders', JSON.stringify(this.orders.value));
  }

  // Add item to cart
  addToCart(book: EcommerceBook, quantity: number = 1) {
    const currentCart = this.cartItems.value;
    const existingItem = currentCart.find(item => item.book.id === book.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      currentCart.push({ book, quantity });
    }

    this.cartItems.next(currentCart);
    this.saveCart();
  }

  // Remove item from cart
  removeFromCart(bookId: string) {
    const currentCart = this.cartItems.value.filter(item => item.book.id !== bookId);
    this.cartItems.next(currentCart);
    this.saveCart();
  }

  // Update item quantity
  updateQuantity(bookId: string, quantity: number) {
    const currentCart = this.cartItems.value;
    const item = currentCart.find(item => item.book.id === bookId);

    if (item) {
      if (quantity <= 0) {
        this.removeFromCart(bookId);
      } else {
        item.quantity = quantity;
        this.cartItems.next(currentCart);
        this.saveCart();
      }
    }
  }

  // Get cart total
  getCartTotal(): number {
    return this.cartItems.value.reduce(
      (total, item) => total + item.book.price * item.quantity,
      0
    );
  }

  // Get cart item count
  getCartItemCount(): number {
    return this.cartItems.value.reduce((count, item) => count + item.quantity, 0);
  }

  // Clear cart
  clearCart() {
    this.cartItems.next([]);
    this.saveCart();
  }

  // Place order
  placeOrder(shippingAddress: ShippingAddress): Order {
    const order: Order = {
      id: this.generateOrderId(),
      items: [...this.cartItems.value],
      total: this.getCartTotal(),
      date: new Date(),
      status: 'pending',
      shippingAddress,
    };

    const currentOrders = this.orders.value;
    currentOrders.unshift(order);
    this.orders.next(currentOrders);
    this.saveOrders();

    // Clear cart after order
    this.clearCart();

    return order;
  }

  // Get all orders
  getOrders(): Order[] {
    return this.orders.value;
  }

  // Generate unique order ID
  private generateOrderId(): string {
    return 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  // Get mock books for the store
  getMockBooks(): EcommerceBook[] {
    return [
      {
        id: '1',
        name: '1984',
        aname: 'George Orwell',
        price: 160,
        coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=400&fit=crop',
        description: 'A dystopian social science fiction novel and cautionary tale.',
        isbn: '978-0451524935',
        stock: 25,
        category: 'Fiction',
      },
      {
        id: '2',
        name: 'To Kill a Mockingbird',
        aname: 'Harper Lee',
        price: 150,
        coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=400&fit=crop',
        description: 'A gripping tale of racial injustice and childhood innocence.',
        isbn: '978-0061120084',
        stock: 30,
        category: 'Classic',
      },
      {
        id: '3',
        name: 'The Great Gatsby',
        aname: 'F. Scott Fitzgerald',
        price: 130,
        coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=400&fit=crop',
        description: 'A story of the fabulously wealthy Jay Gatsby and his love for Daisy Buchanan.',
        isbn: '978-0743273565',
        stock: 20,
        category: 'Classic',
      },
      {
        id: '4',
        name: 'Pride and Prejudice',
        aname: 'Jane Austen',
        price: 120,
        coverImage: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=300&h=400&fit=crop',
        description: 'A romantic novel of manners set in Georgian England.',
        isbn: '978-0141439518',
        stock: 15,
        category: 'Romance',
      },
      {
        id: '5',
        name: 'The Catcher in the Rye',
        aname: 'J.D. Salinger',
        price: 165,
        coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop',
        description: 'A story about teenage rebellion and alienation.',
        isbn: '978-0316769174',
        stock: 18,
        category: 'Fiction',
      },
      {
        id: '6',
        name: 'Harry Potter and the Philosopher\'s Stone',
        aname: 'J.K. Rowling',
        price: 180,
        coverImage: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=300&h=400&fit=crop',
        description: 'The first novel in the Harry Potter series.',
        isbn: '978-0439708180',
        stock: 50,
        category: 'Fantasy',
      },
      {
        id: '7',
        name: 'The Hobbit',
        aname: 'J.R.R. Tolkien',
        price: 170,
        coverImage: 'https://images.unsplash.com/photo-1621351183012-e2f1f6bde185?w=300&h=400&fit=crop',
        description: 'A fantasy novel about the journey of Bilbo Baggins.',
        isbn: '978-0547928227',
        stock: 22,
        category: 'Fantasy',
      },
      {
        id: '8',
        name: 'The Lord of the Rings',
        aname: 'J.R.R. Tolkien',
        price: 230,
        coverImage: 'https://images.unsplash.com/photo-1526243741027-444d633d7365?w=300&h=400&fit=crop',
        description: 'An epic high-fantasy novel trilogy.',
        isbn: '978-0544003415',
        stock: 1232,
        category: 'Fantasy',
      },
       {
        id: '9',
        name: 'The Lordy of the Rings',
        aname: 'J.R.R. Tolkien',
        price: 230,
        coverImage: 'https://images.unsplash.com/photo-1526243741027-444d633d7365?w=300&h=400&fit=crop',
        description: 'An epic high-fantasy novel trilogy.',
        isbn: '978-0544003415',
        stock: 0,
        category: 'Fantasy',
      },
    ];
  }
}
