# 🏆 Leaderboard Application

A modern, responsive leaderboard application built with Next.js 14, TypeScript, Tailwind CSS, and Vercel KV for persistent data storage.

## ✨ Features

- **Public Leaderboard**: View all scores sorted by rank
- **Admin Panel**: Add new scores with form validation
- **Real-time Updates**: Immediate reflection of new scores
- **Responsive Design**: Works perfectly on all devices
- **Loading States**: Smooth user experience with loading indicators
- **Error Handling**: Graceful error handling and user feedback
- **Modern UI**: Beautiful design with Tailwind CSS

## 🚀 Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Vercel KV (Redis)
- **Deployment**: Vercel (recommended)

## 📁 Project Structure

```
umain-leaderboard/
├── app/
│   ├── api/
│   │   └── scores/
│   │       └── route.ts          # API endpoints for scores
│   ├── admin/
│   │   └── page.tsx              # Admin page for adding scores
│   ├── components/
│   │   ├── Leaderboard.tsx       # Leaderboard display component
│   │   └── ScoreForm.tsx         # Score submission form
│   ├── types/
│   │   └── leaderboard.ts        # TypeScript type definitions
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page with leaderboard
├── package.json
├── next.config.ts
├── tsconfig.json
└── README.md
```

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Vercel KV Configuration
KV_URL=your_vercel_kv_url
KV_REST_API_URL=your_vercel_kv_rest_api_url
KV_REST_API_TOKEN=your_vercel_kv_rest_api_token
KV_REST_API_READ_ONLY_TOKEN=your_vercel_kv_read_only_token
```

### 3. Vercel KV Setup

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Create a new Vercel KV database**:
   ```bash
   vercel kv create
   ```

3. **Link your project**:
   ```bash
   vercel link
   ```

4. **Pull environment variables**:
   ```bash
   vercel env pull .env.local
   ```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🌐 API Endpoints

### GET `/api/scores`
Retrieves all scores from the leaderboard.

**Response:**
```json
{
  "scores": [
    {
      "id": "score_1234567890_1",
      "name": "Player Name",
      "score": 1000,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "success": true
}
```

### POST `/api/scores`
Adds a new score to the leaderboard.

**Request Body:**
```json
{
  "name": "Player Name",
  "score": 1000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Score added successfully!",
  "score": {
    "id": "score_1234567890_1",
    "name": "Player Name",
    "score": 1000,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## 🎨 Customization

### Styling
The application uses Tailwind CSS for styling. You can customize colors, spacing, and other design elements by modifying the Tailwind classes in the components.

### Data Structure
The leaderboard data is stored in Vercel KV using Redis sorted sets, which automatically maintains the ranking order. Each score entry includes:
- `id`: Unique identifier
- `name`: Player's name
- `score`: Numerical score
- `createdAt`: Timestamp of creation

## 🚀 Deployment

### Deploy to Vercel

1. **Push your code to GitHub**
2. **Import your repository to Vercel**
3. **Set up environment variables** in the Vercel dashboard
4. **Deploy!**

The application will automatically use Vercel KV for data storage when deployed.

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### TypeScript

The project is fully typed with TypeScript. All components and API routes include proper type definitions for better development experience and error catching.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Vercel KV documentation](https://vercel.com/docs/storage/vercel-kv)
2. Review the [Next.js documentation](https://nextjs.org/docs)
3. Open an issue in this repository

---

Built with ❤️ using Next.js 14, TypeScript, and Tailwind CSS
