# 🍳 Pantry Chef

Pantry Chef is a web application that helps you discover and create recipes based on ingredients you have in your pantry. Built with Next.js, TypeScript, and Supabase.

## Features

- 🔍 Search recipes by ingredients
- 📝 Create and share your own recipes
- 💾 Save favorite recipes
- 👨‍🍳 User profiles with created and saved recipes
- 🎯 Smart recipe matching based on available ingredients
- 📱 Responsive design for all devices

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: TailwindCSS
- **Backend**: Supabase
- **Database**: PostgreSQL (via Supabase)
- **Storage**: Supabase Storage for images
- **Deployment**: Vercel

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/pantry-chef.git
cd pantry-chef
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Fill in your Supabase credentials

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
pantry-chef/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # Reusable React components
│   ├── services/         # API and business logic
│   ├── types/           # TypeScript type definitions
│   └── lib/             # Utility functions and configurations
├── public/              # Static assets
└── ...config files
```

## Database Schema

- `recipes`: Main recipe information
- `ingredients`: Recipe ingredients
- `instructions`: Recipe preparation steps
- `saved_recipes`: User's saved recipes

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Next.js team for the amazing framework
- Vercel for hosting
- Supabase for backend services