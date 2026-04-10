# 🚀 Skarsten TCG Ops

Welcome to your specialized Pokémon TCG Operations Dashboard. This app is built to automate your inventory, calculate WAC, and suggest market-driven prices.

## 🛠️ Installation & Setup

### 1. Install Dependencies
Open your terminal in this folder and run:
```bash
npm install
```

### 2. Configure Environment Variables
You must connect the app to your Shopify and Supabase accounts.
1. Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```
2. Open `.env.local` in your editor and fill in your credentials.
   - **Note**: Use your new **Development Store** shop name (e.g., `my-dev-store`) for `SHOPIFY_SHOP_NAME`.

### 3. Run the Dashboard
Start the development server:
```bash
npm run dev
```

## 🖥️ Viewing the Dashboard
Once the server is running, open your browser and go to:
[**http://localhost:3000**](http://localhost:3000)

### 🗺️ First Stop: Setup Guide
For detailed, step-by-step instructions on where to find your API keys, head to:
[**http://localhost:3000/setup**](http://localhost:3000/setup)

## 🛡️ Safety Warning
The app starts in **Simulator Modus** (`SHOPIFY_DRY_RUN=true`). In this mode, it will log actions to your terminal and Discord technical channel, but it **will not** change any data in your Shopify store. This allows you to test safely until you are ready to go live.
