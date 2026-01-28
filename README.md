# 🎬 Shaflix - Movie Recommendation & Tracking Platform

A full-stack movie recommendation and tracking application with mood-based discovery, built with Next.js 15, Firebase, and PostgreSQL.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Firebase](https://img.shields.io/badge/Firebase-Auth-orange)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-green)
![Drizzle](https://img.shields.io/badge/Drizzle-ORM-purple)

## ✨ Features

### 🎭 Core Features
- **Mood-Based Discovery** - Find movies based on your current mood
- **Personal Library** - Track favorites, watchlist, and watched movies
- **Diary Entries** - Log watches with ratings, reviews, and tags
- **Custom Lists** - Create and organize your own movie collections
- **User Profiles** - View stats and manage your account

### 🔐 Authentication
- Email/Password authentication
- Google OAuth sign-in
- Secure token-based API access
- Automatic data sync across devices

### 📊 Analytics
- Track user behavior with Firebase Analytics
- Monitor engagement and popular features
- Data-driven insights

### 🗄️ Database
- PostgreSQL database with Neon (serverless)
- Type-safe queries with Drizzle ORM
- Automatic movie caching
- Multi-device sync

## 🚀 Quick Start

### New to the Backend?

👉 **[GET_STARTED.md](./GET_STARTED.md)** - Start here for guided navigation

### Ready to Set Up? (15 minutes)

👉 **[QUICKSTART.md](./QUICKSTART.md)** - Complete setup guide

### Prerequisites
- Node.js 18+
- Firebase account (free)
- Neon account (free tier available)

### Quick Setup

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your credentials
# (See QUICKSTART.md for detailed instructions)

# Set up database
npm run db:generate
npm run db:push

# Start development
npm run dev
```

### Complete Setup Guide

📖 **[QUICKSTART.md](./QUICKSTART.md)** - 15-minute setup  
📖 **[SETUP.md](./SETUP.md)** - Detailed instructions  
📖 **[SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md)** - Track your progress

Or follow these quick steps:

1. **Firebase Setup** (5 min)
   - Create Firebase project
   - Enable Email/Password + Google auth
   - Get client config and admin credentials
   - Add to `.env`

2. **Neon Database** (3 min)
   - Create Neon project
   - Copy connection string
   - Add to `.env`

3. **Database Migration** (2 min)
   ```bash
   npm run db:generate
   npm run db:push
   ```

4. **Start Development** (1 min)
   ```bash
   npm run dev
   ```

5. **Test** (4 min)
   - Visit http://localhost:3000
   - Sign up with email or Google
   - Add a movie to favorites
   - Check database with `npm run db:studio`

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [QUICKSTART.md](./QUICKSTART.md) | 15-minute setup guide (START HERE!) |
| [SETUP.md](./SETUP.md) | Detailed setup instructions |
| [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) | How to integrate backend with frontend |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System architecture & design decisions |
| [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) | Complete file structure overview |

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **State**: React Context API
- **Icons**: Lucide React

### Backend
- **API**: Next.js API Routes
- **Database**: Neon (Serverless PostgreSQL)
- **ORM**: Drizzle ORM
- **Authentication**: Firebase Auth
- **Analytics**: Firebase Analytics

### External APIs
- **TMDB API** - Movie data and images

## 📁 Project Structure

```
shaflix/
├── app/
│   ├── api/              # API routes (backend)
│   ├── components/       # React components
│   ├── contexts/         # React contexts
│   ├── db/              # Database schema & connection
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utilities & libraries
│   └── (pages)/         # App pages
├── public/              # Static assets
├── drizzle/             # Database migrations
└── docs/                # Documentation
```

See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for complete structure.

## 🔌 API Endpoints

All endpoints require Firebase authentication token.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/sync-user` | Sync localStorage to database |
| GET/POST | `/api/favorites` | Manage favorites |
| GET/POST | `/api/watchlist` | Manage watchlist |
| GET/POST | `/api/watched` | Manage watched movies |
| GET/POST/DELETE | `/api/diary` | Manage diary entries |
| GET/POST/PATCH/DELETE | `/api/lists` | Manage custom lists |
| GET/PATCH | `/api/profile` | User profile & stats |

## 🗄️ Database Schema

8 tables with full relational integrity:

- **users** - Firebase authenticated users
- **movies** - Cached TMDB movie data
- **favorites** - User's favorite movies
- **watchlist** - Movies to watch
- **watched** - Movies already watched
- **diary_entries** - Detailed watch logs
- **custom_lists** - User-created lists
- **list_movies** - Movies in lists (with ordering)

## 🔐 Environment Variables

Required environment variables (17 total):

```env
# TMDB API
TMDB_API_KEY=
NEXT_PUBLIC_TMDB_API_KEY=

# Neon Database
DATABASE_URL=

# Firebase Admin (server-side)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# Firebase Client (public)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

See `.env.example` for template.

## 📦 NPM Scripts

```bash
# Development
npm run dev              # Start dev server with Turbopack
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint

# Database
npm run db:generate      # Generate migrations
npm run db:push          # Push schema to database
npm run db:studio        # Open Drizzle Studio
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] Sign up with email/password
- [ ] Sign in with Google
- [ ] Add movie to favorites
- [ ] Add movie to watchlist
- [ ] Mark movie as watched
- [ ] Create diary entry
- [ ] Create custom list
- [ ] View profile stats
- [ ] Sign out and sign back in
- [ ] Verify data persists

### Database Inspection
```bash
npm run db:studio
```
Opens Drizzle Studio at https://local.drizzle.studio

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Then:
1. Add environment variables in Vercel dashboard
2. Add your domain to Firebase authorized domains
3. Update Google OAuth redirect URIs

See [SETUP.md](./SETUP.md) for detailed deployment instructions.

## 📊 Analytics Events

Tracked events:
- `mood_selected` - User selects a mood
- `movie_viewed` - User views movie details
- `movie_added_to_watchlist` - Movie added to watchlist
- `movie_marked_watched` - Movie marked as watched
- `diary_entry_created` - Diary entry created
- `movie_added_to_favorites` - Movie added to favorites
- `list_created` - Custom list created

## 🔒 Security

- ✅ Server-side token verification
- ✅ Parameterized database queries
- ✅ Environment variable protection
- ✅ CORS protection (same-origin)
- ✅ Foreign key constraints
- ✅ User data isolation

## 🎯 Roadmap

### Current Features ✅
- [x] Firebase Authentication
- [x] PostgreSQL Database
- [x] API Routes
- [x] Movie Tracking
- [x] Diary Entries
- [x] Custom Lists
- [x] Analytics Tracking

### Planned Features 🚧
- [ ] Social features (follow users)
- [ ] Share lists publicly
- [ ] Advanced search & filters
- [ ] Movie recommendations
- [ ] Email notifications
- [ ] PWA support
- [ ] Dark/light theme persistence

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

[Your License Here]

## 🆘 Support

### Documentation
- [QUICKSTART.md](./QUICKSTART.md) - Quick setup
- [SETUP.md](./SETUP.md) - Detailed setup
- [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) - Integration help
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture details

### Troubleshooting
- Check browser console (F12)
- Check terminal for errors
- Review Firebase Console
- Review Neon Console
- Use Drizzle Studio to inspect database

### Common Issues

**"Invalid or expired token"**
- Verify Firebase credentials in `.env`
- Check `FIREBASE_PRIVATE_KEY` formatting

**"Database connection failed"**
- Verify `DATABASE_URL` is correct
- Check Neon dashboard

**"Module not found"**
- Run `npm install`
- Delete `node_modules` and `.next`, reinstall

## 🙏 Acknowledgments

- [TMDB](https://www.themoviedb.org/) for movie data
- [Firebase](https://firebase.google.com/) for authentication
- [Neon](https://neon.tech/) for database hosting
- [Vercel](https://vercel.com/) for deployment platform
- [shadcn/ui](https://ui.shadcn.com/) for UI components

## 📧 Contact

For questions or support:
- Open an issue on GitHub
- Check the documentation
- Review the troubleshooting guide

---

**Built with ❤️ using Next.js, Firebase, and PostgreSQL**

🎬 Happy movie tracking!
