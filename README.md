# Nord Flex - Frontend

Modern React frontend for Nord Flex e-commerce platform.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
# Runs on http://localhost:3000
```

## 📦 Scripts

```bash
npm run dev          # Development server with HMR
npm run build        # Production build
npm run preview      # Preview production build
npm run type-check   # TypeScript type checking
npm run lint         # Run ESLint
```

## 🛠️ Tech Stack

- **React 18.3.1** with TypeScript
- **Vite 5.4.1** for fast development and building
- **TanStack Query 5.81.2** for server state management
- **Tailwind CSS 3.4.11** with shadcn/ui components
- **React Router 6.26.2** for routing
- **Three.js** for 3D configurator
- **Auth0** for authentication

## 🧩 Key Features

- **17+ Reusable Components** with 75% code reduction
- **Dark Mode Support** with proper contrast
- **Guest Checkout** functionality
- **Order Tracking** integration
- **Multi-language** support
- **Responsive Design** mobile-first approach
- **3D Product Configurator** with leather textures
- **Product Review System** with star ratings
- **Stripe Payment Integration**

## 🔧 Configuration

Backend API endpoint is configured to `https://backend.nordflex.shop` by default.
Development server runs on port 3000.

## 📁 Project Structure

```
src/
├── api/             # API integration
├── components/      # Reusable UI components
├── config/          # Configuration files
├── contexts/        # React context providers
├── hooks/           # Custom React hooks
├── lib/             # Utilities and helpers
├── pages/           # Route components
├── providers/       # React providers
├── types/           # TypeScript type definitions
└── utils/           # Utility functions
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
    The application will be available at `http://localhost:3000`.

## 🎨 Texture Customization

The configurator supports custom leather textures. You can add your own textures by following the guides:
- [Cowhide Leather Texture Setup Guide](./TEXTURE_SETUP_GUIDE.md)
- [Adding Custom Textures Guide](./ADD_CUSTOM_TEXTURES.md)

Place your PNG texture files in the `public/textures/` directory and configure them in the code.

## ⭐ Product Review System

The platform includes a comprehensive product review system with the following features:
- Purchase verification (only customers who bought the product can review)
- One review per product per user
- Star rating system (1-5 stars)
- Review management (edit/delete)
- Verified purchase badges

See [Review System Documentation](./REVIEW_SYSTEM_README.md) for implementation details.

## 💡 Current Implementation Status

This version of the frontend uses a mix of dummy data and real API integrations:
- Authentication is implemented with Auth0
- Stripe payment integration is functional
- 3D configurator with real-time texture preview
- Some components still use mock data for demonstration

## 🛣️ Future Enhancements

* **Full Backend Integration:** Complete integration with Laravel API for all data operations
* **Enhanced Admin Panel:** Full-featured admin dashboard with real data management
* **Advanced Analytics:** Implementation of user behavior tracking and analytics
* **Mobile App:** Native mobile application development
* **AI Recommendations:** Personalized product recommendations

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## 📄 License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).