// routes.constant.ts
export const routes = {
  // Dashboard
  dashboard: '/dashboard',
  salesAnalytics: '/dashboard/sales-analytics',
  sallersList: '/dashboard/sallers-list',
  sallersTable: '/dashboard/sallers-table',
  sallersGrid: '/dashboard/sallers-grid',
  sallersProfile: '/dashboard/sallers-profile',
  revenueByPeriod: '/dashboard/revenue-by-period',

  // Products
  addProducts: '/products/shop/add-products',
  allProducts: '/products/shop/all-products',
  topProducts: '/products/shop/top-products',
  newArrivals: '/products/shop/new-arrivals',
  offersAndDiscounts: '/products/shop/offers',

  // Categories
  electronics: '/categories/electronics/dashboard/electronics',
  fashion: '/categories/electronics/dashboard/fashion',
  homeAndKitchen: '/categories/electronics/dashboard/home-kitchen',
  beautyAndHealth: '/categories/electronics/dashboard/beauty-health',
  sports: '/categories/electronics/dashboard/sports',

  // Orders
  myOrders: '/orders/myorders',
  orderTracking: '/orders/tracking',
  returnsAndRefunds: '/orders/returns',

  // Cart & Wishlist
  cart: '/cart',
  wishlist: '/cart/wishlist',

  // Customer
  profile: '/account/profile',
  addresses: '/account/addresses',
  paymentMethods: '/account/payments',

  // Admin
  adminDashboard: '/admin',
  adminProducts: '/admin/products',
  adminOrders: '/admin/orders',
  adminUsers: '/admin/users',
  adminSettings: '/admin/settings',

  // Support
  contactUs: '/support/contact',
  faqs: '/support/faqs',
  shippingInfo: '/support/shipping',
};
