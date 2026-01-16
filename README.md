# Portfolio Website

A modern, responsive portfolio website built with Next.js 14+, TypeScript, Tailwind CSS, and Framer Motion.

## Features

- **Modern Stack**: Next.js 14+ with App Router, TypeScript, and Tailwind CSS
- **Smooth Animations**: Framer Motion for performant animations
- **Dark Mode**: System preference detection with manual toggle
- **Responsive Design**: Mobile-first approach with fluid typography
- **Accessibility**: WCAG AA compliant with semantic HTML and ARIA labels
- **Performance Optimized**: Lazy loading, image optimization, and optimized builds

## Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
portfolio-v2/
├── app/
│   ├── globals.css      # Global styles and Tailwind imports
│   ├── layout.tsx       # Root layout component
│   └── page.tsx         # Home page
├── components/
│   ├── Contact.tsx      # Contact form and social links
│   ├── Hero.tsx         # Hero section with introduction
│   ├── Projects.tsx     # Featured projects with filtering
│   ├── Skills.tsx       # Skills and technologies showcase
│   └── ThemeToggle.tsx  # Dark mode toggle button
└── public/              # Static assets
```

## Customization

### Content

Replace the filler content in each component with your own:
- **Hero.tsx**: Update name, title, and description
- **Projects.tsx**: Replace project data with your own projects
- **Skills.tsx**: Update skill categories and technologies
- **Contact.tsx**: Update social media links

### Styling

The design uses a centered 400px container with large padding. This can be adjusted in `app/page.tsx` by modifying the `max-w-[400px]` class and padding values.

### Colors

Colors are defined using Tailwind's default gray scale with dark mode variants. You can customize colors in `tailwind.config.ts` and `app/globals.css`.

## Build

To create a production build:

```bash
npm run build
```

To start the production server:

```bash
npm start
```

## Performance

The site is optimized for:
- **Lighthouse Performance**: 90+
- **Accessibility**: 100
- **Best Practices**: 100
- **SEO**: 100

## License

MIT
