# Design Guidelines for Immigration Services Website
## Other Path Travel & Glory International

## Design Approach
**Reference-Based with Professional Services Focus**
Drawing inspiration from trust-focused platforms like Stripe's clarity, LinkedIn's professionalism, and Airbnb's emotional storytelling. This immigration services site requires credibility, warmth, and clear navigation across complex information.

**Core Principle**: Build trust through visual hierarchy, clear information architecture, and authentic human stories.

## Typography System
- **Headings**: Modern sans-serif, bold weights (700-800) for authority
- **Hero Headlines**: Extra-large (4xl-6xl), commanding presence
- **Section Headers**: Large (3xl-4xl), clear hierarchy
- **Body Text**: Clean sans-serif, regular weight (400), optimized readability (16-18px base)
- **Supporting Text**: Medium weight (500) for emphasis within paragraphs
- **UI Elements**: Medium weight (500-600) for buttons, navigation

## Layout & Spacing System
**Tailwind Units**: Primarily use 4, 6, 8, 12, 16, 20, 24 for consistency
- **Section Padding**: py-16 to py-24 (mobile: py-12)
- **Container Max-Width**: max-w-7xl for full sections, max-w-4xl for content
- **Card Spacing**: gap-6 to gap-8 between cards
- **Element Margins**: mb-6, mb-8, mb-12 for vertical rhythm

## Component Library

### Navigation Header
- Full-width sticky header with subtle shadow on scroll
- Left: Other Path Travel + Glory International logos
- Center: Main navigation (Home, EB3 Program, Services, Countries, Success Stories, FAQ, Contact)
- Right: Language switcher (7 languages) with flag icons + dropdown, CTA button
- Mobile: Hamburger menu with slide-in panel

### Hero Section
- Full-width, 80vh on desktop, 60vh on mobile
- Large hero image: American landmarks (Statue of Liberty, cityscapes) or diverse families achieving American Dream
- Centered content overlay with semi-transparent dark gradient
- Headline emphasizing EB3 Program opportunity
- Subheadline highlighting partnership and global reach
- Dual CTAs: "Start Your Journey" (primary), "Free Consultation" (secondary with blur background)
- Trust indicators below CTAs: "Trusted by 1,000+ families" with small icons

### EB3 Program Overview Section
- 3-column grid on desktop (EB-3A Professionals, EB-3B Skilled Workers, EB-3C Unskilled/Other Workers)
- Each card: Icon, category title, 2-3 key requirements, "Learn More" link
- Background: Subtle pattern or light treatment
- Prominent "Why Choose EB3?" callout

### Services Grid
- 2x3 grid layout (desktop), stacked on mobile
- Service cards: Icon, title, brief description, hover lift effect
- Services: Work Visa Assistance, Job Placement, Study Abroad, Scholarship Applications, Visa Services, Immigration Consulting
- Each card links to dedicated service page

### Country Selector
- Interactive map OR flag-based grid (2x4 layout)
- Countries: USA, Canada, Vietnam, Malaysia, Taiwan, UK, Australia, China
- Click reveals country-specific modal or navigates to dedicated page
- Shows available services per country

### Contact Multi-Channel Section
- Prominent "Get Free Consultation" headline
- 4-column icon grid: WhatsApp, Zalo, TikTok, Facebook Messenger
- Each with QR code + clickable button
- Form below: Name, Email, Phone, Inquiry Type dropdown, Message, Language preference
- Inquiry types: EB3 Visa, Study Abroad, Work Visa, Job Placement, General

### Success Stories
- Carousel OR 2-column grid layout
- Each story: Client photo (with permission), quote, country flag, visa type, approval date
- Include actual approval document screenshots (redacted) for authenticity
- "View All Success Stories" link

### FAQ Accordion
- Single column, generous spacing
- Questions grouped: EB3 Process, Eligibility, Timeline, Family Benefits, Costs
- Expand/collapse functionality
- Search bar above for FAQ filtering

### Footer
- 4-column layout: About Us, Services, Countries, Contact Info
- Newsletter signup: "Immigration Updates & Opportunities"
- Social media links
- Trust badges: Accreditations, partnerships
- Multi-language disclaimer text

## Images Strategy

### Hero Images
- Large, high-quality hero image: American landmarks (Golden Gate Bridge, NYC skyline, Statue of Liberty) or aspirational family imagery
- Professional photography showing diversity and success

### Supporting Images Throughout
- EB3 Section: Job category imagery (hotel workers, healthcare, retail)
- Country Pages: Iconic landmarks for each destination
- Success Stories: Authentic client photos
- Service Cards: Relevant illustrations or photos
- About Section: Team photos, office locations

### Image Treatment
- Subtle overlays on hero images for text readability
- Rounded corners (rounded-lg to rounded-xl) for card images
- Consistent aspect ratios: 16:9 for heroes, 4:3 for cards, 1:1 for testimonials

## Multi-Column Strategy
- **Use 3-4 columns**: EB3 categories, service offerings, country selection
- **Use 2 columns**: Success stories, comparison sections, contact form + info
- **Avoid multi-columns**: Long-form content, mobile views, FAQs (use accordion)

## Special Interactions
- Smooth scroll to sections from navigation
- Language switcher: Dropdown with instant translation (no page reload feel)
- Hover states on cards: Subtle lift (translateY -2px) with shadow increase
- Form validation: Inline, multi-language error messages
- Contact buttons: WhatsApp/Zalo/etc open in new tab/app

## Accessibility
- Language switcher keyboard navigable
- Form labels clearly associated
- Sufficient contrast ratios throughout
- Focus states on all interactive elements
- Alt text for all images in all languages

This design creates a comprehensive, trustworthy platform that guides users from initial awareness through to consultation, emphasizing credibility through real success stories and clear pathways to action.