export type ProjectSubsection = {
  id: string;
  title: string;
  content: string[];
  images?: string[];
};

export type ProjectSection = {
  id: string;
  title: string;
  level: number;
  content: string[];
  subsections?: ProjectSubsection[];
  images?: string[];
};

export type ProjectContent = {
  title: string;
  dateRange: string;
  preface: string[];
  sections: ProjectSection[];
  conclusion?: string[];
};

export const projectContents: Record<string, ProjectContent> = {
  modulize: {
    title: "Modulize",
    dateRange: "Jun '23 - Dec '23",
    preface: [
      "Modulize was a design platform focused on creating scalable, modular design systems. As part of this project, I designed and developed an admin dashboard that would serve as the central hub for managing users, permissions, analytics, and platform settings.",
      "The admin interface needed to be intuitive yet powerful, allowing administrators to efficiently manage complex workflows while maintaining a clean, approachable design language.",
    ],
    sections: [
      {
        id: "project-goal",
        title: "Project Goal",
        level: 2,
        content: [
          "The primary goal was to build a comprehensive admin dashboard that could scale with the platform's growth. The dashboard needed to support user management, role-based access control, analytics visualization, and system configuration.",
          "Key requirements included creating a design system that could be reused across different admin interfaces, ensuring consistency and reducing development time for future features.",
        ],
      },
      {
        id: "platform-tech-stack",
        title: "Platform & Tech Stack",
        level: 2,
        content: [
          "The admin dashboard was built using React with TypeScript, leveraging a component library built on top of Tailwind CSS. The design system utilized custom design tokens for spacing, typography, and color that could be easily maintained and updated.",
          "For data visualization, we integrated charting libraries that could handle real-time updates. The backend API was designed to support efficient data fetching with proper caching strategies.",
        ],
      },
      {
        id: "design-approach",
        title: "Design Approach",
        level: 2,
        content: [
          "I approached the design with a focus on clarity and efficiency. The layout uses a sidebar navigation pattern that keeps the main content area uncluttered while providing quick access to all major sections.",
          "Typography and spacing were carefully considered to create visual hierarchy. I used a monospace font for data-heavy sections like tables and logs, while maintaining the primary sans-serif font for general content. This distinction helps users quickly identify different types of information.",
          "Color usage was minimal but strategic—using accent colors only for important actions and status indicators. The neutral palette ensures the interface doesn't compete with the data it presents.",
        ],
        images: ["/modulize-hero.png"],
      },
      {
        id: "key-features",
        title: "Key Features",
        level: 2,
        content: [
          "User Management: A comprehensive user management system with search, filtering, and bulk actions. Administrators could view user activity, manage permissions, and handle account status.",
          "Analytics Dashboard: Real-time analytics with customizable date ranges and metric selection. The dashboard displays key platform metrics including user growth, engagement, and system health.",
          "Role-Based Access Control: A flexible permission system that allows fine-grained control over what different user roles can access and modify.",
          "Settings & Configuration: Centralized settings management for platform-wide configurations, feature flags, and system preferences.",
        ],
      },
      {
        id: "ui-components",
        title: "UI Components",
        level: 2,
        content: [
          "I designed a comprehensive component library that included navigation components, data tables with sorting and filtering, form inputs with validation states, modal dialogs, and notification systems.",
          "Each component was designed with accessibility in mind, ensuring keyboard navigation and screen reader compatibility. The components were also built to be responsive, adapting to different screen sizes while maintaining usability.",
          "The component library became a valuable asset for the team, reducing the time needed to build new admin interfaces and ensuring design consistency across the platform.",
        ],
      },
      {
        id: "challenges-solutions",
        title: "Challenges & Solutions",
        level: 2,
        content: [
          "One of the main challenges was managing complex state across different sections of the dashboard. I implemented a state management solution that kept the UI responsive while handling large datasets efficiently.",
          "Another challenge was creating a permission system that was both flexible and easy to understand. I designed a visual permission matrix that made it clear what each role could access, reducing confusion and support requests.",
          "Performance was also a concern, especially with real-time analytics. I worked closely with the engineering team to implement proper data pagination, lazy loading, and caching strategies that kept the interface snappy even with large amounts of data.",
        ],
      },
      {
        id: "outcome-learnings",
        title: "Outcome & Learnings",
        level: 2,
        content: [
          "The admin dashboard successfully launched and became the primary tool for platform management. User feedback was positive, with administrators appreciating the clean interface and efficient workflows.",
          "The component library we built has been reused across multiple projects, validating the investment in creating a robust design system. This experience reinforced the importance of thinking about scalability from the beginning of a project.",
          "I learned a lot about balancing feature richness with simplicity. It's easy to add more features, but the real challenge is creating an interface that feels powerful without being overwhelming.",
        ],
      },
    ],
    conclusion: [
      "The Modulize admin dashboard project was a great opportunity to work on a complex, data-heavy interface while maintaining design quality and user experience. The lessons learned about component design and system thinking have been valuable in subsequent projects.",
    ],
  },
  groq: {
    title: "Groq",
    dateRange: "May '25 - Dec '25",
    preface: [
      "From May to December 2025, I worked at Groq as a Product Design Intern on the GroqCloud platform. Over 8 months, I led the creation of a comprehensive design system for the entire console frontend—standardizing visual language, reducing color conventions from 30 to 14, and building a scalable component library. Alongside this foundational work, I designed and shipped multiple platform features, from LoRA management interfaces to mobile-optimized modals, while contributing directly to the codebase.",
    ],
    sections: [
      {
        id: "design-system",
        title: "Design System",
        level: 1,
        content: [
          "GroqCloud's rapid growth had led to inconsistent UI patterns across the platform. Colors were duplicated under different naming conventions, components had multiple implementations, and there was no single source of truth for design decisions. The engineering team needed a system that would accelerate development while ensuring visual consistency.",
          "I broke the design system into two phases: Foundations — Colors, typography, icons, spacing, and elevation; and Components — Reusable UI elements from buttons to complex inputs.",
        ],
      },
      {
        id: "foundations",
        title: "Foundations",
        level: 2,
        content: [
          "I began by auditing every color in use across the console, uncovering duplicates and near-identical shades scattered throughout the codebase. After consolidating these into a streamlined palette, I built a Tailwind CSS-based color system with shades from 50-950, reducing 30 different color conventions down to 14 core values.",
          "To make the system truly scalable, I introduced semantic naming conventions that mapped to the Tailwind palette. Instead of ambiguous names like $neutral-popover-foreground, designers and engineers could now reference clear, purpose-driven tokens like $text-primary, $text-secondary, or $background-default.",
          "This approach enabled seamless theme switching—$background-default maps to $neutral-50 in both light and dark modes without requiring overrides, making theming effortless.",
          "Using Tailwind as the framework, I defined text styles split between body and headings, with each style following a text-type-size convention (e.g., text-body-small, text-heading-large). Size, weight, line-height, and tracking were all standardized within this system.",
          "Icons were sourced from the Lucide library, and spacing utilized a consistent scale based on rem units (1 rem = 16px) with tokens like $spacing-04 and $spacing-06.",
        ],
        images: ["/groq-hero.png"],
      },
      {
        id: "components",
        title: "Components",
        level: 2,
        content: [
          "After auditing the console, I identified every repeated UI element that could be componentized. Each component was designed across three sizes (small, default, large), implemented in both light and dark modes, and documented with hover, active, and disabled states.",
          "Many components required multiple variants to cover different use cases. For example, the button component included:",
          "button-primary, button-secondary, button-ghost",
          "button-dropdown, button-pill, button-outline, button-split",
        ],
        images: ["/groq-hero.png"],
      },
      {
        id: "impact",
        title: "Impact",
        level: 2,
        content: [
          "The design system became the foundation for all new GroqCloud development, enabling faster implementation, consistent user experience, and easier onboarding for new designers and engineers.",
        ],
      },
      {
        id: "feature-design-development",
        title: "Feature Design & Development",
        level: 1,
        content: [
          "Beyond the design system, I designed and shipped several key platform features:",
        ],
      },
      {
        id: "lora-management",
        title: "LoRA Management Interface",
        level: 2,
        content: [
          "Designed an iterative evolution from card-based layouts to a streamlined list-based interface for managing LoRA fine-tuned models, improving information density and scanning efficiency.",
        ],
        images: ["/groq-hero.png"],
      },
      {
        id: "usage-dashboard",
        title: "Usage Dashboard",
        level: 2,
        content: [
          "Created a comprehensive dashboard for monitoring API usage statistics, costs, and analytics, giving users clear visibility into their GroqCloud consumption.",
        ],
        images: ["/groq-hero.png"],
      },
      {
        id: "documentation-search",
        title: "Documentation Search (cmd+k)",
        level: 2,
        content: [
          "Designed an AI-powered command palette for quick documentation access, integrating intelligent question-answering directly into the console workflow.",
        ],
        images: ["/groq-hero.png"],
      },
      {
        id: "mobile-modal-optimization",
        title: "Mobile Modal Optimization",
        level: 2,
        content: [
          "Redesigned modal experiences for mobile devices, ensuring responsive layouts that maintained usability across screen sizes.",
        ],
        images: ["/groq-hero.png"],
      },
      {
        id: "direct-code-contributions",
        title: "Direct Code Contributions",
        level: 2,
        content: [
          "In addition to design work, I contributed to the GroqCloud codebase, shipping both polish improvements and new feature implementations.",
        ],
      },
    ],
  },
  phia: {
    title: "Phia",
    dateRange: "Sep '25 - Dec '25",
    preface: [],
    sections: [
      {
        id: "overview",
        title: "Overview",
        level: 1,
        content: [
          "From September to December 2025, I worked as a Growth Design Intern at Phia, a fashion discovery iOS browser extension. I focused on three key growth levers: reducing extension churn, increasing user activation, and driving monetization. Through iterative design, A/B testing, and data-driven insights, I redesigned core user journeys and established a cohesive design language that evolved to define the entire product experience.",
        ],
      },
      {
        id: "onboarding-redesign",
        title: "Onboarding Redesign",
        level: 1,
        content: [],
        subsections: [
          {
            id: "the-challenge",
            title: "The Challenge",
            content: [
              "Phia's onboarding flow wasn't converting users effectively. Without a clear design system or cohesive visual language, the experience felt disjointed and failed to set proper expectations for the extension's value.",
            ],
          },
          {
            id: "research-discovery",
            title: "Research & Discovery",
            content: [
              "I began by auditing competitor iOS browser extensions, analyzing what made their onboarding experiences successful or unsuccessful. Key patterns emerged:",
              "Progress indicators (breadcrumbs) reduced abandonment by showing users where they were in the flow",
              "Early personalization increased engagement and relevance",
              "Copy optimization significantly improved click-through rates",
            ],
            images: ["/phia-hero.png"],
          },
          {
            id: "design-process",
            title: "Design Process",
            content: [
              "I approached the redesign in two phases:",
              "Quick wins — Reskinned the existing flow with improved copy, progress indicators, and minor UX refinements",
              "Full redesign — Built a completely reimagined experience with personalization, updated styling, and a cohesive visual language",
            ],
            images: ["/phia-hero.png"],
          },
          {
            id: "iteration-tension",
            title: "Iteration & Tension",
            content: [
              "High-impact screens went through dozens of iterations as I navigated a tension between the founders' desire for flashy marketing moments and creating the best possible user experience. Without an existing design system, each iteration began to diverge visually, creating inconsistency with the rest of the app.",
              "This challenge became an opportunity: I developed a new design language during the onboarding work that eventually became the foundation for the entire product. New patterns for typography, color usage, component styling, and interaction design emerged organically and were systematically applied across Phia.",
            ],
            images: ["/phia-hero.png"],
          },
        ],
      },
      {
        id: "activation-optimization",
        title: "Activation Optimization",
        level: 1,
        content: [],
        subsections: [
          {
            id: "the-problem",
            title: "The Problem",
            content: [
              "After completing onboarding, users were directed to Safari to activate the extension—but activation rates were concerningly low. Many users exited prematurely or failed to activate correctly, creating a critical drop-off point in the user journey.",
            ],
          },
          {
            id: "investigation",
            title: "Investigation",
            content: [
              "Through A/B testing and PostHog session recordings, I identified the core issue: users were confused during Apple's system modals and frequently selected the wrong option, preventing successful activation.",
              "Since we couldn't modify Apple's native modals, the solution had to come from improved preparation—clearer copy and better visual guidance on the activation screen itself.",
            ],
            images: ["/phia-hero.png"],
          },
          {
            id: "design-testing",
            title: "Design & Testing",
            content: [
              "Activation became a P0 priority across the company. I ran weekly experiments, testing:",
              "Different copy approaches to set clear expectations",
              "Visual guides showing exactly what to tap",
              "Step-by-step instructions vs. single-screen explanations",
              "Edge case handling for incorrect inputs and session timeouts",
              "Each iteration was informed by data, and we systematically improved activation rates by making the required user actions crystal clear before they entered Safari.",
            ],
            images: ["/phia-hero.png", "/phia-hero.png"],
          },
        ],
      },
      {
        id: "monetization-new-features",
        title: "Monetization & New Features",
        level: 1,
        content: [],
        subsections: [
          {
            id: "style-passport",
            title: "Style Passport",
            content: [
              "I designed \"Style Passport,\" a comprehensive feature aimed at increasing engagement and shareability while driving monetization. The feature combined three elements:",
              "Style Profile — An AI-powered analysis of the user's fashion preferences and aesthetic, surfacing personalized insights",
              "Outfit Gallery — A space for users to upload and curate their outfits, with social sharing built in to increase virality",
              "Shopping Profile — A year-round \"Spotify Wrapped\" experience showing users their shopping patterns, favorite brands, spending insights, and style evolution",
              "The goal was to create a shareable, engaging feature that would increase user retention while creating natural upsell opportunities for premium features.",
            ],
            images: ["/phia-hero.png", "/phia-hero.png"],
          },
        ],
      },
      {
        id: "additional-work",
        title: "Additional Work",
        level: 1,
        content: [
          "Beyond these core projects, I contributed across multiple touchpoints:",
          "Onboarding animations — Created motion design for key onboarding moments to increase delight and clarity",
          "App Store optimization — Redesigned all App Store screenshots to improve conversion from store page to install",
          "Growth features — Designed referral flows, email campaign templates, and other retention-focused features",
        ],
        images: ["/phia-hero.png", "/phia-hero.png", "/phia-hero.png"],
      },
    ],
  },
  klarify: {
    title: "Klarify",
    dateRange: "Sep '24 - Sep '25",
    preface: [
      "Klarify is a web application designed to help users track and manage their daily tasks. The application features a clean, intuitive interface with a focus on productivity and user experience.",
    ],
    sections: [
      {
        id: "project-goal",
        title: "Project Goal",
        level: 2,
        content: [
          "Design a task management application that helps users stay organized and productive.",
        ],
      },
      {
        id: "design-approach",
        title: "Design Approach",
        level: 2,
        content: [
          "Created a minimal, distraction-free interface that puts tasks front and center.",
        ],
        images: ["/klarify-hero.png"],
      },
    ],
  },
  "bronco-ai": {
    title: "Bronco AI",
    dateRange: "Jan '24 - Aug '24",
    preface: [
      "Bronco AI is an AI-powered platform focused on creating intuitive user experiences for complex AI interactions and workflows.",
    ],
    sections: [
      {
        id: "project-goal",
        title: "Project Goal",
        level: 2,
        content: [
          "Design interfaces that make complex AI interactions accessible and intuitive.",
        ],
      },
      {
        id: "design-approach",
        title: "Design Approach",
        level: 2,
        content: [
          "Focused on progressive disclosure and clear feedback to guide users through AI-powered workflows.",
        ],
        images: ["/bronco-hero.png"],
      },
    ],
  },
};
