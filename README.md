# E-commerce Frontend Application

This repository contains the frontend application for the e-commerce platform, built with modern web technologies. It provides a rich user interface for browsing products, managing a shopping cart, and includes a placeholder admin panel for product stock management.

## 🚀 Features

* **Product Catalog Display:** Browse a list of dummy products with essential details.
* **Product Variant Selection:** Select different variants (e.g., color, size) for products.
* **Dummy Stock Availability Check:** Basic simulation of checking product variant stock.
* **Add to Cart Flow:** Dummy functionality for adding products to a shopping cart.
* **Responsive Design:** Optimized for various screen sizes (desktop, tablet, mobile) using Tailwind CSS.
* **Dummy Admin Panel:** A basic interface to simulate maintaining and updating product stock (currently using dummy data).

## 🛠️ Technologies Used

* **React.js:** A JavaScript library for building user interfaces.
* **TypeScript:** A typed superset of JavaScript that compiles to plain JavaScript, enhancing code quality and maintainability.
* **Shadcn/ui:** A collection of re-usable components built with Radix UI and Tailwind CSS, providing a clean and accessible UI foundation.
* **Tailwind CSS:** A utility-first CSS framework for rapidly building custom designs.
* **Vite:** A fast build tool for modern web projects (used for development server and bundling).

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