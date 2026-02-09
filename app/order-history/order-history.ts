import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService, Order } from '../cart-service/cart.service';

@Component({
  selector: 'app-order-history',
  imports: [CommonModule],
  templateUrl: './order-history.html',
  styleUrl: './order-history.css',
  standalone: true,
})
export class OrderHistory implements OnInit {
  orders: Order[] = [];

  constructor(private cartService: CartService, private router: Router) {}

  ngOnInit() {
    this.cartService.orders$.subscribe(orders => {
      this.orders = orders;
    });
  }

  // Format date
  formatDate(date: Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  // Get status color
  getStatusColor(status: string): string {
    switch (status) {
      case 'pending':
        return '#ffc107';
      case 'processing':
        return '#17a2b8';
      case 'shipped':
        return '#007bff';
      case 'delivered':
        return '#28a745';
      default:
        return '#666';
    }
  }

  // Continue shopping
  continueShopping() {
    this.router.navigate(['/store']);
  }

  // View order details (can be expanded in future)
  viewOrderDetails(orderId: string) {
    alert(`Order details for ${orderId} - Feature coming soon!`);
  }
}
