import { describe, it, expect } from 'vitest';
import {
  OrderStatusEnum,
} from './orders.js';
import {
  deliveryStatusEnum, deliveryAttemptStatusEnum,
} from './deliveries.js';
import {
  paymentProviderEnum, paymentIntentStatusEnum, refundStatusEnum,
} from './payments.js';
import { reviewStatusEnum } from './reviews.js';
import {
  driverApprovalStatusEnum, driverAvailabilityStatusEnum, driverTypeEnum,
} from './drivers.js';
import { userRoleEnum, userStatusEnum } from './user.js';
import {
  restaurantStatusEnum, deliveryModelEnum,
} from './restaurants.js';
import { branchStatusEnum } from './branches.js';
import {
  users, restaurants, branches, drivers, driverBranches,
  menuCategories, menuItems, branchMenuItems, Orders, orderItems,
  deliveries, deliveryAttempts, payments, refunds, paymentEvents,
  reviews, sessions, accounts, verifications, addresses,
} from './index.js';

describe('Schema enums', () => {
  it('order_status defines order-only lifecycle states (no delivery states)', () => {
    expect(OrderStatusEnum.enumValues).toEqual([
      'PENDING', 'ACCEPTED', 'REJECTED', 'CONFIRMED', 'PREPARING',
      'READY_FOR_PICKUP', 'READY_FOR_DELIVERY', 'CANCELLED',
    ]);
    expect(OrderStatusEnum.enumValues).not.toContain('ASSIGNED');
    expect(OrderStatusEnum.enumValues).not.toContain('PICKED_UP');
    expect(OrderStatusEnum.enumValues).not.toContain('DELIVERED');
  });

  it('delivery_status covers assignment, acceptance, pickup, completion, failure', () => {
    expect(deliveryStatusEnum.enumValues).toEqual([
      'PENDING_ASSIGNMENT', 'ASSIGNED', 'DRIVER_ACCEPTED', 'PICKED_UP',
      'IN_TRANSIT', 'DELIVERED', 'FAILED', 'CANCELLED',
    ]);
  });

  it('delivery_attempt_status covers assignment outcomes', () => {
    expect(deliveryAttemptStatusEnum.enumValues).toEqual([
      'ASSIGNED', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CANCELLED', 'COMPLETED',
    ]);
  });

  it('payment_provider includes COD, Stripe, JazzCash, Easypaisa', () => {
    expect(paymentProviderEnum.enumValues).toEqual([
      'STRIPE', 'CASH', 'JAZZCASH', 'EASYPAISA', 'OTHER',
    ]);
  });

  it('payment_intent_status covers provider lifecycle', () => {
    expect(paymentIntentStatusEnum.enumValues).toEqual([
      'REQUIRES_PAYMENT_METHOD', 'REQUIRES_CONFIRMATION', 'REQUIRES_ACTION',
      'PROCESSING', 'SUCCEEDED', 'CANCELED',
    ]);
  });

  it('refund_status supports multiple/partial refund lifecycle', () => {
    expect(refundStatusEnum.enumValues).toEqual([
      'PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'CANCELLED',
    ]);
  });

  it('driver_approval_status separated from availability', () => {
    expect(driverApprovalStatusEnum.enumValues).toEqual([
      'PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED',
    ]);
    expect(driverAvailabilityStatusEnum.enumValues).toEqual([
      'OFFLINE', 'ONLINE', 'BUSY',
    ]);
    expect(driverTypeEnum.enumValues).toEqual(['PLATFORM', 'RESTAURANT_OWNED']);
  });

  it('user roles and statuses', () => {
    expect(userRoleEnum.enumValues).toEqual(['CUSTOMER', 'RESTAURANT_OWNER', 'DRIVER', 'ADMIN']);
    expect(userStatusEnum.enumValues).toEqual(['ACTIVE', 'SUSPENDED', 'BANNED', 'INACTIVE']);
  });

  it('restaurant, branch, review enums', () => {
    expect(restaurantStatusEnum.enumValues).toEqual(['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED']);
    expect(deliveryModelEnum.enumValues).toEqual(['PLATFORM', 'RESTAURANT_OWNED', 'HYBRID']);
    expect(branchStatusEnum.enumValues).toEqual(['ACTIVE', 'INACTIVE', 'SUSPENDED']);
    expect(reviewStatusEnum.enumValues).toEqual(['PENDING', 'APPROVED', 'REJECTED']);
  });
});

describe('Schema tables export', () => {
  it('all expected tables are exported from schema index', () => {
    const expectedTables = [
      users, restaurants, branches, drivers, driverBranches,
      menuCategories, menuItems, branchMenuItems,
      Orders, orderItems,
      deliveries, deliveryAttempts,
      payments, refunds, paymentEvents,
      reviews, sessions, accounts, verifications, addresses,
    ];
    expectedTables.forEach((table) => {
      expect(table).toBeDefined();
    });
  });

  it('auth tables are exported for Better Auth adapter', () => {
    expect(sessions).toBeDefined();
    expect(accounts).toBeDefined();
    expect(verifications).toBeDefined();
  });
});
