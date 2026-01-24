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
      "From May to December 2025, I worked at Groq as a Product Design Intern on the GroqCloud platform. Over the course of 8 months, I led the creation of a comprehensive design system for the entire console frontend, standardizing visual language, reducing color conventions from 30 to 14, and building a scalable component library. Alongside this foundational work, I had the opportunity to design and ship multiple platform features, from LoRA management interfaces to mobile-optimized modals, while contributing directly to the codebase.",
    ],
    sections: [
      {
        id: "overview",
        title: "Overview",
        level: 1,
        content: [
          "As GroqCloud scaled rapidly, features were being built and shipped every week, but with no standardized design system, incosistent UI patterns and styling began to emerge. Colors were duplicated under different naming conventions, components had multiple implementations, and there was no single source of truth for design decisions. To solve this problem, I proposed building a comprehensive design system that would standardize the visual language, reduce color conventions, and build a scalable component library.",
        ],
      },
      {
        id: "design-system",
        title: "Design System",
        level: 1,
        content: [
          "I broke the design system into two phases: Foundations, which included colors, typography, icons, spacing, and elevation; and Components, which were reusable UI elements from simple buttons to complex inputs.",
        ],
        images: ["/groq-0.png"],
      },
      {
        id: "foundations",
        title: "Foundations",
        level: 2,
        content: [
          "I began by auditing every color in use across the console, to uncover duplicates and near-identical shades which were scattered throughout the codebase. After consolidating these into a streamlined palette, I started to build a Tailwind CSS-based color system with shades from 50-950, while reducing 30 different color conventions down to 14 core values.",
          "To make the system truly scalable, I introduced semantic naming conventions that mapped to the Tailwind palette. Instead of ambiguous names like $neutral-popover-foreground, I opted for more relevant token names, like $text-primary, $text-secondary, or $background-default.",
          "By using these semantic names, it enabled seamless theme switching, because token like $background-default would map to $neutral-50 in both light and dark modes, without requiring any manual overrides.",
          "Keeping with the Tailwind framework, I also defined text styles, split between body and headings, with each style following a text-type-size convention (e.g., text-body-small, text-heading-large). Size, weight, line-height, and tracking were all standardized within this system.",
          "Icons were sourced from the Lucide library, and spacing utilized a consistent scale based on rem units (1 rem = 16px) with tokens like $spacing-04 and $spacing-06.",
        ],
        images: ["/groq-1.png"],
      },
      {
        id: "components",
        title: "Components",
        level: 2,
        content: [
          "After auditing the console for colors, I went back and identified every repeated UI element that could be componentized. Each component was designed across three sizes (small, default, large), implemented in both light and dark modes, and documented with hover, active, and disabled states.",
          "Many components required multiple variants to cover different use cases. For example, the button component included:",
          "button-primary, button-secondary, button-ghost, button-dropdown, button-pill, button-outline, button-split",
        ],
        images: ["/groq-2.png"],
      },
      {
        id: "impact",
        title: "Impact",
        level: 2,
        content: [
          "The design system became the foundational building blocks for all new features being built on GroqCloud, enabling both faster design & faster implementation, as well as a more consistent user experience.",
        ],
      },
      {
        id: "feature-design-development",
        title: "Feature Design & Development",
        level: 1,
        content: [
          "Beyond the design system, I also had the opportunity to design a number of new platform features, and even ship a few of them directly:",
        ],
      },
      {
        id: "lora-management",
        title: "LoRA Management Interface",
        level: 2,
        content: [
          "One new feature was the addition of LoRAs on the console. While I won't go into the reasoning and design decisions here, all decisions were backed by user requirements and data, and went through a number of iterations before being shipped.",
        ],
        images: ["/groq-3.png"],
      },
      {
        id: "usage-dashboard",
        title: "Usage Dashboard",
        level: 2,
        content: [
          "A big pain point on the console was the data (usage) dashboard. This went through a massive redesign, prioritizing better information hierarchy, improved readability and more succinct charts and data visualizations. To design this feature, my manager and I ran a number of user interviews to gather key requirements and define user flows, in order to craft the best user experience.",
        ],
        images: ["/groq-4.png"],
      },
      {
        id: "documentation-search",
        title: "Documentation Search (cmd+k)",
        level: 2,
        content: [
          "While definitely a smaller project, this is one of the ones I'm more proud of. When we added search to the docs pages, it looked very boilerplate and didn't fit the modern design we were striving for. After mocking up a few designs, I decided to take a stab at rehauling the UI (and some of the functionality directly), and ended up shipping my PR directly. This was the first PR I'd ever shipped, and my search modal still exists on the GroqCloud docs pages today :)",
        ],
        images: ["/groq-5.png"],
      },
      {
        id: "mobile-modal-optimization",
        title: "Mobile Modal Optimization",
        level: 2,
        content: [
          "A pain point that kept coming up was the formatting of our modals on mobile. Due to the smaller screen sizes, our modals were getting cut off and didn't look great. I went through and redesigned each of modals to be more responsive to ensyre that they looked great on all screen sizes. I also created a new modal component that could be used across the platform, and could be easily styled to match the new design system.",
        ],
        images: ["/groq-6.png"],
      },
    //   {
    //     id: "direct-code-contributions",
    //     title: "Direct Code Contributions",
    //     level: 2,
    //     content: [
    //       "In addition to design work, I contributed to the GroqCloud codebase, shipping both polish improvements and new feature implementations.",
    //     ],
    //   },
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
          "From September to December 2025, I worked as a Growth Design Intern at Phia, a fashion discovery iOS browser extension. During this time, I focused on three key growth levers: reducing extension churn, increasing user activation, and driving monetization. I went through a number of iterations and rounds, ran A/B tests, and dug through Mixpanel data to better understand user behavior and pain points. By the end of my time there, I had redesigned core user journeys and contributed to establishing a cohesive design language that eventually evolved to define the entire product experience.",
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
              "I began by auditing competitor iOS browser extensions, to analyze what made their onboarding experiences successful or unsuccessful. From this, a few key patterns emerged:",
              "Progress indicators (breadcrumbs) tended to reduce abandonment, by showing users where they were in the flow.",
              "Early personalization in an onboarding increased engagement and relevance by getting users more invested in the flow.",
              "Copy optimization significantly improved click-through rates by making the value proposition more clear.",
            ],
            images: ["/phia-1.png"],
          },
          {
            id: "design-process",
            title: "Design Process",
            content: [
              "I approached the redesign in two phases:",
              "First, quick wins: I reskinned the existing flow with improved copy, progress indicators, and minor UX refinements, as things that could be shipped easily but still resulting in a big impact.",
              "Next, a full redesign: I built a completely reimagined onboarding experience with personalization, updated styling, and a cohesive visual language",
            ],
            images: ["/phia-2.png"],
          },
          {
            id: "iteration-tension",
            title: "Iteration & Tension",
            content: [
              "Some of the more high-impact screens went through dozens of iterations as I navigated a tension between the founders' desire for flashy marketing moments and trying to craft the best possible user experience. Without an existing design system, each iteration began to diverge visually, which created inconsistency with the rest of the app.",
              "But, I started to view this challenge as an opportunity: I developed a new design language during the onboarding work that eventually became the foundation for the entire product. New patterns for typography, color usage, component styling, and interaction design emerged organically and were systematically applied across Phia.",
            ],
            images: ["/phia-3.png"],
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
              "After completing onboarding, users were directed to Safari to activate the extension, but activation rates were concerningly low. Many users exited prematurely or failed to activate correctly, which created a critical drop-off point in the user journey.",
            ],
          },
          {
            id: "investigation",
            title: "Investigation",
            content: [
              "Through A/B testing and PostHog session recordings, I was able to identify the core issue: users were confused during Apple's system modals and frequently selected the wrong option, which prevented successful activation.",
              "Since we couldn't modify Apple's native modals, the solution had to come from improved preparation on our end -- clearer copy and better visual guidance on the activation screen itself.",
            ],
            images: ["/phia-4.png"],
          },
          {
            id: "design-testing",
            title: "Design & Testing",
            content: [
              "Activation then became a P0 priority across the company. I started to run weekly experiments to test different approaches to activation, including:",
              "Different copy approaches to set clear expectation.",
              "Visual guides showing exactly what to tap.",
              "Step-by-step instructions vs. single-screen explanations.",
              "Edge case handling for incorrect inputs and session timeouts.",
              "Each iteration was informed by data, and we systematically improved activation rates by making the required user actions crystal clear before they entered Safari.",
            ],
            images: ["/phia-5.png", "/phia-6.png"],
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
              "I also had the opporuntity to work on the design of \"Style Passport,\" a comprehensive feature set aimed at increasing engagement and shareability while driving monetization. The feature combined three main elements:",
              "Style Profile: An AI-powered analysis of the user's fashion preferences and aesthetic, surfacing personalized insights.",
              "Outfit Gallery: A space for users to upload and curate their outfits, with social sharing built in to increase virality.",
              "Shopping Profile: A year-round \"Spotify Wrapped\" experience showing users their shopping patterns, favorite brands, spending insights, and style evolution.",
              "The goal was to ultimately create a shareable, engaging feature that would increase user retention while also creating natural upsell opportunities for more premium features that were planned.",
            ],
            images: ["/phia-7.png", "/phia-8.png"],
          },
        ],
      },
      {
        id: "additional-work",
        title: "Additional Work",
        level: 1,
        content: [
          "Beyond these core projects, I also contributed across multiple touchpoints:",
          "Onboarding animations: I created motion design for key onboarding moments to increase delight and clarity,",
          "App Store optimization: I redesigned all App Store screenshots to improve conversion from store page to install,",
          "Growth features: I designed referral flows, email campaign templates, and other retention-focused features.",
        ],
        images: ["/phia-9.png", "/phia-10.png"],
      },
    ],
  },
  klarify: {
    title: "Klarify",
    dateRange: "Sep '24 - Sep '25",
    preface: [
      "I joined Klarify in late 2024 as the sole designer on a rapidly scaling mental health AI platform. Over the course of a year, I designed every user-facing screen, established comprehensive brand guidelines, overhauled marketing materials, and built a scalable design system. Working directly with the founders and engineering team, I tackled the challenge of introducing AI to a more tech-resistant audience, while trying to maintain clarity and simplicity across complex therapeutic workflows.",
    ],
    sections: [
      {
        id: "overview",
        title: "Overview",
        level: 1,
        content: [],
      },
      {
        id: "brand-web-design",
        title: "Brand & Web Design",
        level: 1,
        content: [],
        subsections: [
          {
            id: "the-challenge",
            title: "The Challenge",
            content: [
              "Klarify needed a web presence that could effectively communicate its expanding feature set, while navigating a unique tension: positioning itself as an AI company in a field where many therapists were skeptical of the technology.",
            ],
          },
          {
            id: "website-v1",
            title: "Website V1 — Finding Identity",
            content: [
              "The company was in a transitional phase, where it was still defining its identity. I led a website redesign to focus on communicating the value proposition as clearly as possible, while simultaneously trying to understand the core audience. Through multiple iterations, we tested different sections and styles to find the right balance of showcasing AI capabilities, without alienating traditional practitioners.",
              "Once the design was finalized, I built and shipped the site in Framer.",
            ],
            images: ["/klarify-1.png"],
          },
          {
            id: "website-v2",
            title: "Website V2 — Current Version",
            content: [
              "In late 2025, I led a second iteration that refined the brand further, and had a more concrete style defined. View the current site here.",
            ],
          },
        ],
      },
      {
        id: "marketing-brand-assets",
        title: "Marketing & Brand Assets",
        level: 1,
        content: [
          "As the brand evolved, I designed all public-facing materials to establish a cohesive visual language:",
        ],
        subsections: [
          {
            id: "digital-advertising",
            title: "Digital Advertising",
            content: [
              "Some of the work I did on this front included:",
              "LinkedIn banners and promotional graphics.",
              "YouTube video thumbnails and ad campaigns.",
              "Multi-platform ads designed across screen sizes.",
              "During this work, Klarify's color guidelines and design language began to converge, and thus every asset followed a consistent structure that became the foundation for all future brand work.",
            ],
            images: ["/klarify-2.png", "/klarify-3.png"],
          },
          {
            id: "conference-materials",
            title: "Conference Materials",
            content: [
              "When Klarify sponsored one of North America's largest therapy conferences, I created a full suite of promotional designs including booth materials, handouts, and digital assets.",
            ],
            images: ["/klarify-4.png"],
          },
        ],
      },
      {
        id: "platform-design",
        title: "Platform Design",
        level: 1,
        content: [
          "As the sole designer, I contributed to every feature and flow in the Klarify platform. Working primarily autonomously but in constant conversation with the founders and engineering team, I prioritized simplification. I focused on stripping away complexity in order to create intuitive experiences for therapists at all levels of tech proficiency.",
        ],
        subsections: [
          {
            id: "design-philosophy",
            title: "Design Philosophy: Less is More",
            content: [
              "Each feature went through multiple iterations, progressively refining the experience month over month. Below are key projects that showcase the breadth of my work. (Reach out if you'd like to see more -- I'm happy to walk through the full scope.)",
            ],
          },
          {
            id: "overview-page",
            title: "Overview Page",
            content: [
              "The Overview Page acted as the command center for each therapy session. Therapists could access notes, client details, reflection questions, transcripts, and AI-generated insights, all while interacting with Bloomy, Klarify's built-in AI assistant.",
              "Key actions included:",
              "Creating and editing multiple note types and formats.",
              "Sharing notes with clients or colleagues.",
              "Asking Bloomy questions directly within the session context.",
              "The biggest challenge was attempting to organize dense information hierarchies, while maintaining a clean, scannable interface that didn't overwhelm users.",
            ],
            images: ["/overview-1.png", "/overview-2.png", "/overview-3.png", "/overview-4.png"],
          },
          {
            id: "record-page",
            title: "Record Page",
            content: [
              "The Record Page served as the app's homepage. Since recording sessions was therapists' most frequent action, the design needed to balance two competing needs:",
              "Displaying information: The page needed to show past sessions and relevant history",
              "Enabling action: It also needed to be effortless to allow therapists to start recording via multiple methods",
              "The recording flow itself was the most critical part of the entire platform. It went through numerous iterations to reduce friction and handle edge cases like interrupted recordings, background audio, and session metadata capture.",
            ],
            images: ["/record-1.png", "/record-2.png", "/record-3.png", "/record-4.png"],
          },
          {
            id: "settings-billing",
            title: "Settings & Billing",
            content: [
              "What began as a simple payment settings page evolved into a complex multi-role system once we introduced clinic support.",
            ],
          },
          {
            id: "the-complexity",
            title: "The Complexity",
            content: [
              "User roles began to emerge; individual therapists, clinic administrators and billing managers, each one with different permissions and capabilities. Administrators needed to:",
              "Purchase and manage seat licenses.",
              "Reassign seats to different users.",
              "Update billing for specific seats.",
              "View clinic-wide usage and analytics.",
              "The flow went through countless iterations, guided by user research and real-world requirements from clinic partners. The final design balanced power-user functionality with clarity for less technical users.",
            ],
            images: ["/settings-1.png", "/settings-2.png", "/settings-3.png", "/settings-4.png"],
          },
          {
            id: "klarifygpt",
            title: "KlarifyGPT",
            content: [
              "Toward the end of my time at Klarify, I designed KlarifyGPT, the in-house AI assistant. This presented an opportunity to design for conversational AI while being mindful of our audience, including elderly therapists who weren't tech-savvy.",
            ],
            images: ["/gpt-1.png", "/gpt-2.png", "/gpt-3.png", "/gpt-4.png"],
          },
          {
            id: "design-approach-klarifygpt",
            title: "Design Approach",
            content: [
              "To tackle this, I opted for a lightweight interface with:",
              "Clear, succinct explanations of AI capabilities.",
              "\"Quick Actions\" for common tasks to save time.",
              "Transparent AI responses with visible sourcing.",
              "Familiar patterns that didn't require learning new interaction models.",
              "The goal was to make AI feel helpful rather than intimidating -- a tool that therapists could use to enhance their practice without adding cognitive load.",
            ],
          },
        ],
      },
      {
        id: "design-system",
        title: "Design System",
        level: 1,
        content: [
          "Throughout all of this work, I built a comprehensive design system that unified the platform's visual language. Components, patterns, and guidelines scaled across all features, ensuring consistency as the product grew and making handoff to engineering seamless.",
        ],
        images: ["/design-system.png"],
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
