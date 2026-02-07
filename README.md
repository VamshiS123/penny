# Penny - Personal Finance Management Platform

## Overview

Penny is a comprehensive personal finance management platform that helps users track spending, set financial goals, and make smarter purchasing decisions. The platform consists of four main components: a **React frontend**, a **FastAPI backend**, a **Chrome browser extension**, and a **Remotion video tool** for creating promotional content.

---

## 🎨 Frontend

### Technology Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5
- **UI Library**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS
- **State Management**: React Context API (`FinanceContext`)
- **Routing**: React Router v6
- **Data Fetching**: TanStack Query (React Query)
- **Form Handling**: React Hook Form with Zod validation
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Notifications**: Sonner (toast notifications)

### Architecture

The frontend follows a component-based architecture with clear separation of concerns:

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/              # shadcn/ui base components
│   │   ├── goals/           # Goal-related components
│   │   └── landing/         # Landing page components
│   ├── pages/               # Route pages
│   ├── contexts/            # React Context providers
│   ├── hooks/               # Custom React hooks
│   ├── layouts/             # Layout components
│   └── lib/                 # Utility functions and API client
```

### Key Features

1. **Dashboard**: Overview of financial health, spending trends, and quick actions
2. **Transactions**: View, add, edit, and delete financial transactions
3. **Goals**: Set and track financial goals with progress visualization
4. **Accounts**: Manage multiple bank accounts (checking, savings, credit)
5. **Budgets**: Track spending against budget categories
6. **Gamification**: 
   - XP and leveling system
   - Achievement unlocks
   - Shop for cosmetic items (outfits, themes)
7. **Financial Twin**: AI-powered financial assistant (Penny) for chat-based interactions
8. **Receipt Analysis**: Upload receipt images for automatic transaction extraction
9. **Time Calendar**: Visualize spending over time

### Authentication

- JWT-based authentication
- Protected routes with `ProtectedRoute` component
- Token stored in `localStorage`
- Automatic token refresh handling

### API Integration

The frontend communicates with the backend via REST API calls defined in `src/lib/api.ts`:

- Authentication endpoints (`/auth/jwt/login`, `/auth/register`)
- User management (`/users/me`)
- Transactions (`/transactions/`)
- Goals (`/goals/`)
- Expenses (`/expenses/`)
- Accounts (`/accounts/`)
- Gamification (`/gamification/`)
- Chat (`/chat/`)
- Receipt analysis (`/transactions/analyze`)

---

## ⚙️ Backend

### Technology Stack

- **Framework**: FastAPI (Python 3.14+)
- **Database**: PostgreSQL with pgvector extension
- **ORM**: SQLModel (combines SQLAlchemy + Pydantic)
- **Authentication**: FastAPI Users with JWT
- **AI/ML**: 
  - LangChain for AI agent orchestration
  - OpenAI-compatible API (via OpenRouter) using Gemini 2.5 Flash
- **Async**: Full async/await support with asyncpg
- **Logging**: Loguru
- **Package Management**: uv (via pyproject.toml)

### Architecture

The backend follows a clean architecture pattern:

```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── endpoints/   # API route handlers
│   │       └── api.py        # Router aggregation
│   ├── core/
│   │   ├── config.py         # Configuration management
│   │   ├── db.py             # Database setup & session management
│   │   └── users.py          # User authentication setup
│   ├── models/               # SQLModel database models
│   ├── crud/                 # CRUD operations
│   ├── services/             # Business logic (AI analysis)
│   └── utils/                # Utility functions
```

### Database Schema

#### Core Models

1. **User**
   - Authentication (email, hashed_password)
   - Financial profile (income_type, annual_salary, hourly_rate)
   - Demographics (age, city, household_size)
   - Gamification (xp, level, streak, coins)

2. **Transaction**
   - merchant, category, amount, date, icon
   - Supports transaction splits (multiple categories per transaction)
   - Linked to User

3. **Account**
   - name, type (checking/savings/credit), balance
   - Visual customization (color, initial)

4. **Expense** (Recurring)
   - name, category, amount, is_fixed, icon
   - Monthly recurring expenses

5. **Goal**
   - name, description, target_amount, saved_amount, icon
   - Progress tracking

6. **Gamification**
   - **Achievement**: name, description, icon, xp_reward
   - **UserAchievement**: Many-to-many relationship
   - **ShopItem**: name, category, description, price, rarity
   - **UserItem**: Purchase tracking and equipment status

### API Endpoints

#### Authentication (`/api/v1/auth/`)
- `POST /auth/jwt/login` - Login with email/password
- `POST /auth/register` - Register new user

#### Users (`/api/v1/users/`)
- `GET /users/me` - Get current user
- `PATCH /users/me` - Update user profile

#### Transactions (`/api/v1/transactions/`)
- `GET /transactions/` - List user transactions
- `POST /transactions/` - Create transaction
- `POST /transactions/analyze` - Analyze receipt image (AI)

#### Goals (`/api/v1/goals/`)
- `GET /goals/` - List user goals
- `POST /goals/` - Create goal
- `PUT /goals/{id}` - Update goal
- `DELETE /goals/{id}` - Delete goal

#### Expenses (`/api/v1/expenses/`)
- `GET /expenses/` - List recurring expenses
- `POST /expenses/` - Create expense
- `PUT /expenses/{id}` - Update expense
- `DELETE /expenses/{id}` - Delete expense

#### Accounts (`/api/v1/accounts/`)
- `GET /accounts/` - List user accounts
- `POST /accounts/` - Create account
- `PUT /accounts/{id}` - Update account
- `DELETE /accounts/{id}` - Delete account

#### Gamification (`/api/v1/gamification/`)
- `GET /gamification/achievements` - List achievements
- `POST /gamification/achievements/seed` - Seed default achievements
- `POST /gamification/achievements/{id}/unlock` - Unlock achievement
- `GET /gamification/shop` - List shop items
- `POST /gamification/shop/seed` - Seed default shop items
- `POST /gamification/shop/{id}/purchase` - Purchase item
- `POST /gamification/shop/{id}/equip` - Equip item

#### Chat (`/api/v1/chat/`)
- `POST /chat/` - Chat with Penny AI assistant

#### Uploads (`/api/v1/uploads/`)
- `POST /uploads/csv` - Upload CSV for transaction import

### AI Services

#### Receipt Analysis (`app/services/receipt_analysis.py`)
- Uses Gemini 2.5 Flash via OpenRouter
- Extracts items, merchant, date, amounts from receipt images
- Categorizes items automatically
- Returns structured data with splits by category

#### Cart Analysis (`app/services/cart_analysis.py`)
- Similar to receipt analysis but for shopping cart screenshots
- Used by browser extension

#### Chat Assistant (`app/api/v1/endpoints/chat.py`)
- LangChain agent with tool calling capabilities
- Tools include:
  - Transaction management (CRUD)
  - Account management
  - Expense tracking
  - Goal tracking
  - Spending summaries
  - Achievement queries
- Conversational interface with memory

### Database Setup

- Uses PostgreSQL with pgvector extension for vector operations
- Async database operations with SQLModel
- Automatic table creation on startup
- Connection pooling via asyncpg

---

## 🔧 Browser Extension

### Technology Stack

- **Manifest**: Manifest V3
- **Languages**: Vanilla JavaScript, CSS, HTML
- **Storage**: Chrome Storage API

### Architecture

```
extension/
├── manifest.json      # Extension configuration
├── background.js      # Service worker (background script)
├── content.js         # Content script (injected into web pages)
├── popup.html/js/css  # Extension popup UI
└── assets/            # Images (Penny mascot variants)
```

### Features

1. **Shopping Cart Interception**
   - Detects checkout buttons on e-commerce sites
   - Universal detection using keywords and URL patterns
   - Works on Amazon, Walmart, Target, and generic Shopify sites

2. **Cart Analysis**
   - Captures screenshot of cart/checkout page
   - Sends to backend for AI analysis
   - Extracts items, prices, and categories

3. **Spending Awareness**
   - Calculates "time cost" (hours of work needed)
   - Shows user's current balance
   - Displays itemized breakdown

4. **Purchase Tracking**
   - Optionally tracks purchases in Penny app
   - Creates transactions automatically
   - Categorizes items

### Workflow

1. User browses shopping site
2. Extension detects checkout button click
3. Intercepts click and shows "Analyzing..." modal
4. Captures screenshot and sends to backend
5. Backend analyzes cart using AI
6. Extension displays:
   - Time cost calculation
   - Balance comparison
   - Item breakdown
7. User can:
   - Cancel purchase
   - Proceed with checkout
   - Track purchase in Penny

### Permissions

- `storage` - Store user data and tokens
- `activeTab` - Access current tab for screenshot
- `tabs` - Tab management
- `host_permissions` - Access to shopping sites and localhost API

---

## 🎬 Video Tool (Remotion)

### Technology Stack

- **Framework**: Remotion 4.0
- **Language**: TypeScript + React
- **Styling**: Tailwind CSS v4
- **Animation**: Remotion's built-in animation primitives

### Purpose

Creates promotional/intro videos for the Penny application using code-based video generation.

### Current Composition

**PennyIntro** (`src/Composition.tsx`):
- 7-second intro video (210 frames at 30fps)
- 1920x1080 resolution
- Animated logo reveal with geometric shapes
- Features:
  1. **Phase 1 (0-35 frames)**: Bold entrances of geometric shapes
  2. **Phase 2 (35-60 frames)**: Tension and drift
  3. **Phase 3 (60-85 frames)**: Rapid collapse to center
  4. **Phase 4 (85-120 frames)**: Penny mascot reveal
  5. **Phase 5 (120-165 frames)**: Tagline transition ("Your personal budget companion")

### Animation Techniques

- Spring physics for natural motion
- Bezier easing for smooth transitions
- Interpolation for frame-based animations
- Transform operations (translate, scale, rotate)
- Opacity transitions

### Usage

```bash
# Development (Remotion Studio)
npm run dev

# Build video
npm run build

# Render video
npx remotion render
```

---

## 🏗️ Architecture Overview

### System Architecture

```
┌─────────────────┐
│  Browser        │
│  Extension      │◄─────┐
└────────┬────────┘      │
         │               │
         │ Screenshot    │
         │ Analysis      │
         ▼               │
┌─────────────────┐      │
│  Frontend       │      │
│  (React)        │──────┘
└────────┬────────┘
         │
         │ REST API
         │ (JWT Auth)
         ▼
┌─────────────────┐
│  Backend        │
│  (FastAPI)      │
└────────┬────────┘
         │
         │ SQLModel
         │ AsyncPG
         ▼
┌─────────────────┐
│  PostgreSQL     │
│  + pgvector    │
└─────────────────┘
         │
         │ AI API Calls
         ▼
┌─────────────────┐
│  OpenRouter     │
│  (Gemini 2.5)   │
└─────────────────┘
```

### Data Flow

1. **User Registration/Login**
   - Frontend → Backend → Database
   - JWT token returned and stored

2. **Transaction Creation**
   - User uploads receipt → Frontend → Backend
   - Backend calls AI service → Analyzes image
   - Creates transactions → Database

3. **Shopping Cart Analysis**
   - Extension intercepts checkout
   - Captures screenshot → Backend
   - AI analyzes cart → Returns breakdown
   - Extension displays results

4. **Chat with Penny**
   - User sends message → Frontend → Backend
   - LangChain agent processes with tools
   - Queries database, performs actions
   - Returns response → Frontend

### Security

- JWT authentication for all protected endpoints
- User-scoped data access (all queries filtered by user_id)
- CORS configured for development/production
- Environment variables for sensitive data (API keys)

### Deployment

The project uses Docker Compose for containerized deployment:

- **Development** (`docker-compose.dev.yml`):
  - Hot-reloading enabled
  - Volumes mounted for live code updates
  - Debug mode enabled

- **Production** (`docker-compose.prod.yml`):
  - Optimized builds
  - No hot-reloading
  - Production environment variables

Services:
- `db`: PostgreSQL with pgvector
- `backend`: FastAPI application
- `frontend`: Vite React application

### Environment Variables

Required environment variables (see `.env.dev.example`):

```bash
DEBUG=false
POSTGRES_HOST=db
POSTGRES_PORT=5432
POSTGRES_USER=penny
POSTGRES_PASSWORD=<password>
POSTGRES_DB=penny_db
OPENROUTER_API_KEY=<api_key>
```

---

## 🚀 Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.14+ (for local backend development)
- uv (Python package manager)

### Quick Start

```bash
# Clone repository
git clone <repository-url>
cd penny

# Copy environment file
cp .env.dev.example .env.dev
# Edit .env.dev with your configuration

# Start development environment
make dev

# Or manually:
docker-compose -f docker-compose.dev.yml up --build
```

### Development Commands

```bash
# Start development
make dev

# View logs
make dev-logs
make dev-logs-backend
make dev-logs-frontend

# Access shell
make dev-shell-backend
make dev-shell-frontend
make dev-shell-db

# Stop services
make dev-stop
make dev-down
```

### Frontend Development

```bash
cd frontend
npm install
npm run dev      # Start dev server (http://localhost:5173)
npm run build    # Production build
npm run lint     # Run ESLint
```

### Backend Development

```bash
cd backend
uv sync          # Install dependencies
uv run uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

### Extension Development

1. Load extension in Chrome:
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select `extension/` directory

2. Configure API endpoint in `background.js` if needed

### Video Development

```bash
cd video
npm install
npm run dev      # Start Remotion Studio
npx remotion render  # Render video
```

---

## 📊 Key Features Summary

### Financial Management
- ✅ Transaction tracking with receipt analysis
- ✅ Multiple account management
- ✅ Recurring expense tracking
- ✅ Financial goal setting and progress tracking
- ✅ Budget categorization
- ✅ Spending analytics and visualizations

### AI-Powered Features
- ✅ Receipt image analysis (OCR + categorization)
- ✅ Shopping cart analysis
- ✅ Conversational financial assistant (Penny)
- ✅ Automatic transaction extraction

### Gamification
- ✅ XP and leveling system
- ✅ Achievement unlocks
- ✅ Cosmetic shop (outfits, themes)
- ✅ Streak tracking

### User Experience
- ✅ Modern, responsive UI
- ✅ Real-time spending awareness (browser extension)
- ✅ Time-cost calculations
- ✅ Visual data representations
- ✅ Onboarding flow

---

## 🔮 Future Enhancements

Potential areas for expansion:

- Bank account integration (Plaid/Yodlee)
- Investment tracking
- Bill reminders
- Subscription management automation
- Social features (shared goals, challenges)
- Mobile app (React Native)
- Advanced analytics and predictions
- Multi-currency support