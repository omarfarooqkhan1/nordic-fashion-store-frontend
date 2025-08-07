# Nordic Fashion Store - Frontend

Modern React frontend for Nordic Fashion Store e-commerce platform.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
# Runs on http://localhost:3001
```

## 📦 Scripts

```bash
npm run dev          # Development server with HMR
npm run build        # Production build
npm run preview      # Preview production build
npm run type-check   # TypeScript type checking
```

## �️ Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **TanStack Query** for server state management
- **Tailwind CSS** with shadcn/ui components
- **React Router** v6 for routing

## 🧩 Key Features

- **17 Reusable Components** with 75% code reduction
- **Dark Mode Support** with proper contrast
- **Guest Checkout** functionality
- **Order Tracking** integration
- **Multi-language** support
- **Responsive Design** mobile-first approach

## 🔧 Configuration

Backend API endpoint is configured to `http://localhost:8000` by default.
No additional configuration needed for development.

## � Project Structure

```
src/
├── components/       # Reusable UI components
├── pages/           # Route components
├── hooks/           # Custom React hooks
├── contexts/        # React context providers
├── api/            # API integration
├── lib/            # Utilities and helpers
└── types/          # TypeScript type definitions
```

For full project documentation, see the main README.md in the parent directory.

## 📦 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

* Node.js (LTS version recommended)
* npm or Yarn (package manager)

### Installation

1.  **Clone the repository:**

2.  **Install dependencies:**
    ```bash
    npm install  # or yarn install
    ```

3.  **Start the development server:**
    ```bash
    npm run dev  # or yarn dev
    ```
    The application will typically be available at `http://localhost:5173` (or another port Vite assigns).

## 💡 Dummy Data & Admin Panel

This initial version of the frontend uses **dummy data** for products, variants, and stock. The "admin panel" functionality is a placeholder designed to demonstrate future capabilities for managing stock. It **does not currently interact with a real backend** or persistent storage. Data displayed and manipulated within the admin panel is temporary and will reset upon page refresh.

## 🛣️ Future Enhancements

* **Backend Integration:** Connect to a Laravel API (or similar) for real data fetching, authentication, and persistent storage.
* **Authentication:** Implement user login/registration using real authentication services (e.g., Auth0).
* **Shopping Cart Logic:** Persist cart data and integrate with order placement.
* **Real-time Stock Updates:** Implement real-time updates for stock availability.
* **Payment Gateway Integration:** Integrate with payment processing services.

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## 📄 License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).