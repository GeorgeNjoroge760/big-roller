# Big Roller — Cheers Club & Bar Management System

Full-stack bar/club point-of-sale and management system with a **Django web interface** (Bootstrap 5 + PWA) and a **React Native (Expo) mobile app**.

## Roles

| Role | Web / Mobile Permissions |
|------|--------------------------|
| **Admin** | Manage products, users, view dashboards, sales analytics, daily reports, low-stock alerts |
| **Waiter** | Browse menu, place orders for customers, track order status, view receipts |
| **Counter Attendant** | View pending orders, accept them, process payment, generate receipts, deduct stock |

## Tech Stack

### Backend
- Python 3.x, Django 5.2, Django REST Framework 3.17
- JWT authentication (simplejwt)
- SQLite (dev), xhtml2pdf for PDF receipts
- CORS enabled, Africa/Nairobi timezone

### Mobile App
- React Native 0.85 (Expo SDK 56)
- React Navigation 7 (Stack + Bottom Tabs)
- Axios (JWT interceptor with auto-refresh)
- AsyncStorage for token persistence

### Web Frontend
- Django templates + Bootstrap 5
- Chart.js for analytics
- PWA (manifest + service worker)

## Project Structure

```
bar_management/          # Django project config (settings, root URLs)
api/                     # REST API (DRF views & serializers)
users/                   # UserProfile model (role: admin/waiter/counter)
products/                # Category & Product models (stock tracking)
orders/                  # Order & OrderItem models (7-status workflow)
payments/                # Payment model (cash/card/mobile/mpesa)
receipts/                # Receipt model (PDF generation)
sales/                   # Denormalized sales records
inventory/               # InventoryLog (stock change audit trail)
reports/                 # DailyReport model (analytics)
dashboards/              # Role-based dashboard views
notifications/           # In-app notifications per user
templates/               # HTML templates for web UI
static/                  # CSS, JS, PWA assets
mobile/                  # React Native (Expo) app
```

## API Endpoints (`/api/`)

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login/` | Login, returns JWT + user data |
| GET | `/api/auth/me/` | Current user profile |

### Categories & Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories/` | List all categories |
| GET | `/api/products/` | List products (filter: `category`, `search`) |
| GET | `/api/products/<pk>/` | Product detail |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders/place/` | Place order (validates stock, creates Order + OrderItems) |
| GET | `/api/orders/` | List orders (role-filtered) |
| GET | `/api/orders/<pk>/` | Order detail with items |
| POST | `/api/orders/<pk>/accept/` | Counter accepts order |
| POST | `/api/orders/<pk>/cancel/` | Cancel order |
| POST | `/api/orders/<pk>/process/` | Complete order (deduct stock, create Payment) |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications/` | List user's notifications |
| POST | `/api/notifications/<pk>/read/` | Mark one as read |
| POST | `/api/notifications/read-all/` | Mark all as read |
| GET | `/api/notifications/unread-count/` | Unread count |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/` | Role-specific stats |

## Order Status Workflow

```
pending → claimed → preparing → ready → picked_up → delivered
  │                                                       │
  └──────────────── cancelled ────────────────────────────┘
```

(API simplifies to: `pending` → `claimed` (accept) → `delivered` (process + payment))

## Mobile App Screens

| Screen | Roles | Purpose |
|--------|-------|---------|
| LoginScreen | All | Username/password login |
| WaiterDashboard | Waiter | Pending/active orders & sales stats |
| MenuScreen | Waiter | Browse products by category, add to cart |
| CartScreen | Waiter | Review cart, place order |
| WaiterOrders | Waiter | List own orders |
| CounterDashboard | Counter | Pending/claimed/completed today |
| PendingOrders | Counter | Accept & process orders |
| ProcessOrder | Counter | Select payment method, complete |
| AdminDashboard | Admin | Revenue, pending orders, low stock |
| ProductList | Admin | View products with stock status |
| UserList | Admin | View users |
| OrderDetail | All | Full order details, role-based actions |
| ProfileScreen | All | Profile with logout |
| NotificationsScreen | All | Notification list |

## Setup

### Backend
```bash
python -m venv venv
source venv/bin/activate   # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Mobile App
```bash
cd mobile
npm install
npx expo start
```

## Deployment

- Backend deployed on **PythonAnywhere** (`georgen760.pythonanywhere.com`)
- Mobile app API URL configured in `mobile/src/api/config.js`

## User Manual

### Web App

#### Login
1. Open the web app in your browser.
2. Enter your username and password, click **Login**.
3. You'll be redirected to your role-specific dashboard.

#### Admin
- **Dashboard** — View today's revenue, pending orders, product count, and low-stock alerts.
- **Products** — Add, edit, or remove products and categories. Set price, stock, and minimum stock level.
- **Users** — Create and manage user accounts (assign roles: admin, waiter, counter).
- **Orders** — View all orders across all statuses.
- **Reports** — Generate daily reports with revenue breakdowns, best sellers, and PDF export.
- **Notifications** — View system notifications.

#### Waiter
- **Dashboard** — See your pending orders, active orders, and total sales.
- **Menu** — Browse products by category. Click to view details.
- **Place Order** — Add items to cart, enter customer name and notes, confirm order.
- **Receipts** — View receipts for completed orders.

#### Counter Attendant
- **Dashboard** — See pending orders, claimed orders, and completed orders today.
- **Orders** — View pending orders. Click **Accept** to claim an order.
- **Process Order** — Select payment method (cash/card/mobile/M-Pesa) and complete the order. Stock is deducted automatically.
- **Receipts** — Print or download receipts as PDF.

### Mobile App (React Native / Expo)

#### Login
1. Open the Big Roller app on your phone.
2. Enter your username and password, tap **Login**.
3. The app loads your role-based interface.

#### Waiter (Mobile)

**Dashboard Tab**
- View pending orders count, active orders count, and total sales.
- Tap **Browse Menu** to start a new order.
- Tap **View Orders** to see your existing orders.

**Menu Tab**
- Products are grouped by category. Scroll or use the category filter.
- Tap **+** to add an item to your cart, tap **-** to remove.
- Use the search bar to find products by name.
- Tap **View Cart** when ready.

**Cart (Modal)**
- Review all items, adjust quantities.
- Enter **Customer Name** (required) and optional **Notes**.
- Tap **Place Order** to submit. The counter attendants will be notified.

**Orders Tab**
- Lists all your orders with order number, customer, total, and status.
- Tap any order to view full details.

**Profile Tab**
- View your account info (username, email, phone, role).
- Tap **Logout** to sign out.

#### Counter Attendant (Mobile)

**Dashboard Tab**
- View pending orders count, claimed orders count, and completed orders today.
- Tap **View Pending Orders** to accept new orders.

**Pending Orders Tab**
- Orders are filtered by status: **Pending**, **Claimed**, **Preparing**.
- Tap **Accept** on any pending order to claim it.
- Tap an order to view full details.

**Order Detail**
- View customer name, waiter, items, and total.
- Tap **Accept Order** to claim it.
- Tap **Process Order** to proceed to payment.

**Process Order (Modal)**
- Select payment method: Cash, Card, Mobile, or M-Pesa.
- Tap **Complete Order** to finish. Stock is deducted and the waiter is notified.
- A receipt is generated automatically.

**Profile Tab** — View your info and logout.

#### Admin (Mobile)

**Dashboard Tab**
- View today's total revenue, pending orders count, total products, and low-stock items.

**Products Tab**
- View all products with stock status indicators (green = OK, yellow = low, red = out of stock).

**Users Tab**
- View all user accounts and their roles.

**Profile Tab** — View your info and logout.

#### Common Features (All Roles)

**Notifications**
- Tap the bell icon from any screen to view notifications.
- Unread notifications are highlighted.
- Tap a notification to mark it as read.
- Tap **Mark All as Read** to clear all.

**Order Detail**
- Tap any order to see full details: order number, customer, items with quantities and prices, total, status timeline, assigned waiter and counter attendant.
