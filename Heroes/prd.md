# **Modernization Blueprint and Technical Specifications for American Heroes & Brew**

## **Executive Overview of the Digital Transformation Strategy**

In the highly competitive hospitality and restaurant market of Carlsbad, California, a digital storefront serves as the primary mechanism for customer acquisition, brand reinforcement, and operational efficiency.1 For American Heroes & Brew, the mandate to execute a full modern refactor with a mobile-first design philosophy necessitates a complete departure from legacy web hosting paradigms. The overarching objective of this architectural blueprint is to engineer a comprehensive digital system characterized by minimal administrative overhead, seamless third-party data synchronization, and a frictionless, intuitive user experience.2

Historically, the restaurant industry has suffered from the proliferation of fragmented point solutions and data silos.4 A data silo occurs when a restaurant's Point of Sale (POS) system, online ordering platform, and informational website operate independently, requiring management to manually update menus, operating hours, and promotional materials across multiple discrete platforms.3 This fragmentation inevitably leads to margin erosion, operational friction, and a degraded customer experience when online information does not reflect physical reality.3 To resolve this, modern restaurant technology stacks must be built around a "Single Source of Truth" paradigm.3

This comprehensive architectural blueprint provides the exact specifications, data models, and integration protocols required for an autonomous AI development agent to construct, deploy, and maintain the new American Heroes & Brew application. By centralizing the data architecture around existing operational tools—specifically the Toast Point of Sale system—and automating event marketing through real-time sports and holiday Application Programming Interfaces (APIs), the website transitions from a static informational brochure into a dynamic, revenue-generating operational asset.3

When restaurant management updates a menu price, alters operating hours, or removes a depleted inventory item within the Toast POS hardware, the website will instantly and autonomously reflect these changes without requiring manual Content Management System (CMS) interventions.2 Furthermore, by programmatically aggregating San Diego Padres game schedules and national holidays into a unified "Upcoming Events" feed, the platform will function as a highly localized demand-forecasting and marketing engine, driving foot traffic during critical high-revenue windows.6 The resulting platform will embody the requested aesthetic of being simple, clean, and modern, while strictly adhering to the fundamental requirement of remaining exceptionally low-maintenance for the ownership team.

## **Core Architectural Framework and Technology Stack**

To satisfy the requirement for a modern, clean, and strictly low-maintenance infrastructure, the application must be built upon a headless, edge-rendered framework. Traditional monolithic architectures introduce significant maintenance burdens in the form of plugin updates, database management, and persistent security vulnerabilities.8 Instead, a modern decoupled technology stack is required to ensure long-term stability and high performance.9

The foundational framework for this refactor will be Next.js (version 14 or 15), utilizing React 18+ components.8 Next.js provides the capability for Incremental Static Regeneration (ISR) and Server-Side Rendering (SSR), both of which are critical for an application heavily reliant on external data synchronization.8 For a restaurant website dependent on external APIs representing the Toast POS, Major League Baseball schedules, and public holiday feeds, Incremental Static Regeneration represents the optimal rendering strategy.

Incremental Static Regeneration allows the server backend to fetch the latest menu and schedule data at predetermined, configurable intervals (for example, every fifteen minutes) and bake that data into highly optimized, static HTML files. When a prospective customer in Carlsbad accesses the site on their mobile device, they receive a pre-rendered static page directly from a Content Delivery Network (CDN) edge node. This architectural approach achieves three critical operational objectives. First, it guarantees instantaneous page load speeds, directly fulfilling the core requirement for a modern and fast user experience.8 Second, it entirely bypasses API rate limits imposed by third-party data providers, as the external APIs are only queried by the server during the background rebuild process, not by individual concurrent user visits.10 Third, it ensures maximum uptime and fault tolerance; if the Toast API or the MLB Stats API experiences temporary downtime or latency, the website continues to serve the most recently cached static version without displaying errors to the end user.11

Beyond the core Next.js framework, the AI agent should provision the boilerplate utilizing modern type-safe communication libraries and object-relational mappers, even if the primary database is simply the external APIs.12 Utilizing TypeScript across the entire repository ensures that the complex JSON payloads returned by the Toast and MLB APIs are strictly typed, preventing runtime errors if a data structure changes unexpectedly.12

| Architectural Component | Selected Technology | Primary Operational Justification |
| :---- | :---- | :---- |
| Core Framework | Next.js 14+ / React 18+ | Enables Incremental Static Regeneration for zero-latency page loads and SEO optimization.8 |
| Language | TypeScript | Enforces strict type-safety for complex API payloads, preventing runtime UI failures.12 |
| Styling Engine | Tailwind CSS | Utility-first compilation reduces stylesheet bloat, maximizing mobile performance.13 |
| Deployment | Vercel | Native edge-network deployment for Next.js, requiring zero manual server maintenance.9 |
| Monitoring | Checkly | Synthetic global monitoring to proactively alert management of API or endpoint failures.15 |

## **Mobile-First UI/UX Design Philosophy and Ergonomics**

The aesthetic directive for American Heroes & Brew is explicitly "simple, clean, and modern." In contemporary web design, this translates to minimalist navigation structures, card-based data presentation, and a profound, uncompromising respect for mobile device ergonomics.16 The AI agent must construct the user interface with mobile viewports as the default assumption, progressively enhancing the layout for larger desktop screens.

### **Utility-First Styling Architecture**

For the mobile-first styling architecture, Tailwind CSS is the designated framework.13 As the most widely utilized CSS framework in modern web development, Tailwind provides highly customizable, utility-first classes that facilitate rapid UI development without the bloat of traditional cascading stylesheets.13

While legacy frameworks like Bootstrap or Foundation offer pre-built components, they often result in generic visual identities and require developers to constantly override default styles to achieve a custom look.13 Tailwind CSS enables the AI agent to construct a bespoke, clean, and modern aesthetic directly within the React JSX markup.12 Furthermore, Tailwind's Just-In-Time (JIT) compiler automatically purges all unused CSS classes during the production build sequence. This results in microscopic stylesheet file sizes that drastically enhance mobile performance metrics and Google Core Web Vitals, a critical factor for search engine ranking in local markets.18

| CSS Framework | Layout Methodology | Theming Capabilities | Optimal Use Case |
| :---- | :---- | :---- | :---- |
| Tailwind CSS | Flexbox & CSS Grid | Highly customizable via configuration files | Projects requiring strict, bespoke branding and maximal performance.13 |
| Bootstrap 5 | Flexbox | Customizable via Sass | Rapid prototyping with less concern for unique visual identity.13 |
| Foundation | Flexbox & CSS Grid | Customizable via Sass | Enterprise applications focusing on dense data tables.13 |
| Materialize | Flexbox | Limited to Material guidelines | Projects strictly adhering to Google's Material Design principles.13 |

### **Ergonomics and the Thumb Zone Integration**

Research indicates that 49% of users navigate mobile applications using solely their thumb.19 Traditional desktop-oriented web design places critical navigation elements at the top of the viewport. In a mobile-first paradigm, this requires users to awkwardly stretch their hands or use two hands to operate the interface, creating microscopic points of friction that degrade the overall brand experience.19

To engineer a superior mobile experience for American Heroes & Brew, the website will utilize a bottom-aligned tab navigation system for all mobile viewports.19 Primary actions—such as routing to the Home page, the Toast-synced Menu, the Upcoming Events schedule, and the Information hub (Contact and Directions)—will be anchored to the bottom edge of the screen, placing them securely within the natural "thumb zone".19 For any additional secondary options, a "More" tab will trigger a bottom-sheet overlay rather than a traditional top-down hamburger menu.19 On desktop viewports, responsive Tailwind utility classes will automatically realign this navigation to a traditional top-bar or sleek sidebar configuration, ensuring that the interface adapts intelligently to the available screen real estate.13

### **Dark Mode Aesthetics and Atmospheric Consistency**

Sports bars and modern hospitality venues frequently utilize dark mode interfaces to convey a premium, immersive atmosphere that mirrors the physical, dimly-lit ambiance of the establishment itself.20 Analytical data reveals that up to one-third of general mobile users, and significantly higher percentages of tech-forward demographics, maintain their devices in dark mode permanently.21

The Next.js boilerplate must be configured with a dynamic theme provider to automatically respect the user's system preferences, while defaulting to a dark theme if no preference is detected.13 A proper dark mode implementation goes far beyond simple color inversion; it requires carefully calibrated color palettes and adjusted contrast ratios.21 Pure black must be avoided in favor of deep slate or charcoal hues to reduce eye strain, paired with off-white or soft gray typography for optimal readability.21 This approach creates high contrast while reducing overall screen brightness, which reduces eye strain in low-light environments and saves battery life on OLED displays—a highly appreciated feature for patrons browsing the menu while sitting inside the restaurant.21

### **Component-Based Layouts and Variable Typography**

The presentation of dynamic data—such as menu items populated from Toast and upcoming sports events populated from the MLB API—will utilize card-based interfaces.16 Cards encapsulate disparate pieces of information into highly digestible, visually distinct blocks that are easily swipeable on touch screens.16 For example, a sports event card might contain a Padres logo, a start time, and a "Watch Here" badge, neatly bordered and shadowed against the dark background.16 Furthermore, the interface will leverage variable typography, a modern UI trend that allows for fluid adjustments in font weight and width, ensuring that textual content remains perfectly legible regardless of the device's screen dimensions.16

## **Centralized Operations: Toast Point of Sale Integration Architecture**

The most critical technical requirement of this refactor is the direct integration with the Toast API to populate the Menu, Contact, and Directions pages.5 Maintaining separate databases for the physical POS and the digital website invariably leads to operational friction, outdated online prices, and severe customer dissatisfaction.3 The AI agent must construct a robust, authenticated bridge between the Next.js server and the Toast platform.

### **OAuth 2.0 Authentication and Security Protocols**

The Toast APIs utilize the OAuth 2.0 client-credentials grant type to authenticate access to secure resources.22 The AI agent must construct an authentication module that programmatically exchanges a client identifier and a client secret for a temporary bearer authentication token.22

The client identifier functions as a unique application identifier, comparable to an account name, while the client secret operates as a private cryptographic string assigned by Toast to verify the identity of the partner application.24 To initiate the handshake, the backend server must concatenate the client identifier, the client secret, and a specific grant type formatted strictly as grant\_type=client\_credentials within the request payload.23

Upon successfully receiving the bearer token, all subsequent data retrieval requests to the Toast endpoints must include the HTTP header Authorization: Bearer \[token\].22 Furthermore, to specify the exact restaurant location within a potentially broader management group, the requests must also include the Toast-Restaurant-External-ID HTTP header, which requires the Toast system GUID for the Carlsbad American Heroes & Brew location.22 Because these credentials hold elevated access to the restaurant's financial and operational configuration, the client secret must be securely stored within the Next.js backend environment variables and never exposed to the client-side React code or public version control repositories.12 Access to specific endpoints is strictly controlled by OAuth scopes; the credentials must be provisioned with read-only scopes such as menus.read and restaurants.read to ensure principle-of-least-privilege security.26

### **Advanced Menu Data Synchronization and Resolution**

To construct the digital menu, the system will interface directly with the Toast Menus API.28 The integration should explicitly utilize the Version 2 (V2) or Version 3 (V3) Menus API, which provides a "fully resolved" JSON payload.28 A fully resolved payload is highly advantageous for web development because it eliminates the need to make sequential, cascading API calls to fetch nested data relationships. For example, if a specific menu item inherits its base price from a parent menu group, the fully resolved JSON delivers the final calculated price directly at the item level, abstracting the complex inheritance logic away from the frontend application.30

The data fetching sequence must be mathematically optimized to prevent redundant processing and API throttling. The Next.js server should first issue a lightweight GET request to the /metadata endpoint of the Menus API.28 This endpoint returns a tiny response indicating the timestamp of the last time the menu was published in the Toast system. The application will compare this timestamp against its locally cached version; only if the Toast menu has gone stale will the system execute the heavier GET /menus request to download the entire multi-megabyte menu hierarchy.28

The JSON structure returned by the Toast API perfectly mirrors the operational hierarchy of the restaurant itself.29

| Toast Entity Type | Operational Definition | Frontend Application Mapping |
| :---- | :---- | :---- |
| Menu | The top-level containers (e.g., "Lunch Menu", "Dinner Menu") | Primary tab navigation categories on the Menu page.29 |
| MenuGroup | Categorical divisions (e.g., "Appetizers", "Burgers") | Scrollable sub-sections within a primary menu tab.29 |
| MenuItem | The individual products (e.g., "Award Winning Curly-Q Fries") | Individual product cards displaying name, description, and base price.29 |
| MenuOptionGroup | A collection of customization options (e.g., "Size", "Add Meat") | Modal popups or accordion dropdowns for item customization.29 |
| Modifier | An optional component of another item (e.g., "Bacon") | Checkboxes or radio buttons within the customization modal.31 |
| Pre-Modifier | A text string applied to a modifier (e.g., "NO", "EXTRA") | Prefix labels attached to modifier selections.29 |

The AI agent must map this deeply nested JSON into a flat, optimized state for the React frontend. Specifically, the system must parse the pricingStrategy and pricingRules arrays to accurately calculate and display dynamic prices.28 Modifiers (such as varying beer pour sizes or premium add-ons) must be parsed from the modifierOptionReferences to render selectable options on the front end, ensuring that default modifier prices and substitution pricing logic exactly mirror the in-house point of sale behavior.32 This ensures that the customer is never surprised by a price discrepancy between the website and their physical bill.

### **Operational Synchronization: Location, Hours, and Directions**

The requirement to synchronize contact and directions information directly from Toast ensures that emergency holiday closures, seasonal hour adjustments, or alterations to the physical address are automatically reflected online without requiring webmaster intervention.11

The AI agent will utilize the Toast Restaurants API, sending an authenticated GET request to the /restaurants/v1/restaurants/{restaurantGUID} endpoint.33 The response payload from this endpoint contains a dedicated Location object encompassing address1, address2, city, stateCode, and zipCode parameters.33

This address data will be dynamically injected into a Google Maps Embed API or an interactive Mapbox component on the "Contact & Directions" page, automatically generating accurate routing instructions without relying on hardcoded text strings.33 For mobile users, tapping this dynamically generated address must trigger the device's native geo: or maps: URI protocols, immediately launching Apple Maps or Google Maps for frictionless vehicular routing.

Furthermore, the Schedule object embedded within this endpoint will be parsed to dynamically render the current week's operating hours.11 By tying the website's public-facing display hours directly to the Toast shift management and restaurant configuration parameters, the system fundamentally prevents scenarios where customers arrive at the venue only to find it closed despite the website indicating otherwise.11

## **Automated Event Marketing Engine: Sports and Holidays**

American Heroes & Brew experiences significant revenue spikes during major sporting events and cultural holidays.7 The website must capitalize on this established behavioral pattern by transitioning the standard "Events" page into an automated, highly localized scheduling and marketing engine.35 By removing the manual labor associated with updating an event calendar, the restaurant ensures its promotional material is perpetually current.

### **Major League Baseball and San Diego Padres API Integration**

To fulfill the explicit requirement to showcase the upcoming week's events (e.g., "Watch the Padres game here tomorrow..."), the system requires real-time access to Major League Baseball schedules. While premium commercial data providers like Sportradar, API-Sports, or Broadage offer exhaustive data feeds across multiple global sports, they often introduce monthly licensing costs.10 Instead, the official MLB Stats API provides a highly reliable, cost-free alternative for targeted, team-specific schedules.38

The Next.js backend will be programmed to query the MLB Stats API schedule endpoint on a scheduled cadence. The MLB API utilizes Universally Unique Identifiers (UUIDs) and specific integer codes to identify entities.39 The San Diego Padres are uniquely identified within the MLB API architecture by the teamId of 136\.38

| MLB Team | API teamId Code | Abbreviation |
| :---- | :---- | :---- |
| San Diego Padres | 136 | sdn 40 |
| Seattle Mariners | 137 | sea 40 |
| San Francisco Giants | 138 | sfn 40 |
| Pittsburgh Pirates | 134 | pit 40 |

The specific programmatic API call will be constructed by the AI agent as follows: GET https://statsapi.mlb.com/api/v1/schedule?hydrate=team,lineups\&sportId=1\&startDate=\&endDate=\&teamId=136.38

This request fetches a tightly bounded rolling window of data—specifically the upcoming week. The AI agent will parse the returned JSON payload to extract the game.id, the status, the venue, and the opponent details.39 The resulting data will be transformed into frontend UI components that dynamically generate persuasive promotional copy. For example, if the JSON indicates a home game against the Los Angeles Dodgers at 6:40 PM tomorrow, the Next.js UI will automatically render a promotional card stating: *"Catch the Padres vs. Dodgers rivalry tomorrow at 6:40 PM\! Grab a local brew and watch the action here."*

### **Public Holiday Aggregation and Data Normalization**

Beyond daily sports, holidays such as St. Patrick's Day act as major revenue catalysts for American Heroes & Brew. To automate the awareness of these events, the system will integrate a global public holiday API. Services such as the Public Holiday Calendar API via RapidAPI, 11holidays, or PredictHQ offer simple RESTful endpoints designed specifically for this purpose.6

These APIs allow the system to fetch national and regional observances via simple parameterized GET requests, such as GET /api/v1/holidays?country=US\&year=2026.41 However, pulling data from disparate sources introduces a structural challenge: the JSON schema for a baseball game looks entirely different from the JSON schema for a public holiday.

To resolve this, the data architecture requires a strict normalization layer. The AI agent must build a middleware function in TypeScript that takes the disparate schemas from the MLB API and the Holiday API and standardizes them into a single, predictable UnifiedEvent interface.

| Data Source | Original API Field | UnifiedEvent Mapping | Operational Purpose |
| :---- | :---- | :---- | :---- |
| MLB Stats API | gameDate | eventTimestamp | Enables chronological sorting of all disparate events.39 |
| RapidAPI Holidays | date | eventTimestamp | Enables chronological sorting of all disparate events.41 |
| MLB Stats API | teams.away.team.name | eventTitle | Generates the primary display header (e.g., "Padres vs. Giants"). |
| RapidAPI Holidays | name | eventTitle | Generates the primary display header (e.g., "St. Patrick's Day").41 |
| Both Sources | Computed via Logic | eventType | An ENUM value (SPORTS, HOLIDAY) dictating UI colors. |
| Both Sources | Computed via Logic | displayMessage | Dynamically generated call-to-action promotional copy. |

By mathematically merging these discrete feeds into a singular, chronologically sorted array, the website's Upcoming Events page becomes a comprehensive, zero-maintenance operational calendar.35

### **Dynamic Live Score Ticker Component**

To further modernize the visual experience and seamlessly emulate the kinetic ambiance of a high-end sports bar, a live score ticker component will be embedded within the global header or footer of the website.37

Drawing inspiration from professional component-based match center designs and physical LED ticker displays found in arenas, this horizontal marquee will utilize performant CSS flexbox animations to scroll real-time or recent sports scores across the screen.37 The component will periodically fetch data from a live-score endpoint, parse the home\_team and away\_team scores, and inject them into a continuous CSS loop.37 This subtle, continuous animation adds kinetic energy to the site, signaling to visitors immediately upon landing on the homepage that the venue is an active, highly engaged sports-centric environment.16

## **Social Media Synchronization: The Serverless Widget Architecture**

The requirement to link the website to the restaurant's Instagram account must be executed with strict adherence to the fundamental "low maintenance" directive. Attempting to build a custom API integration for Meta's platforms frequently violates this directive due to rapid deprecations and stringent security protocols.

### **Overcoming Meta Graph API Limitations**

Historically, web developers utilized the official Instagram Basic Display API or the Instagram Graph API to programmatically pull photos onto a website.45 However, Meta's ongoing architectural restrictions have rendered this approach highly impractical for small business applications.45 The official Basic Display API was deprecated, forcing migrations to the Graph API, which requires strict application reviews, mandates continuous token refreshing protocols, and imposes aggressive rate limits.45

Crucially, if a Graph API access token expires and is not manually re-authenticated by the restaurant owner via a complex Facebook login flow, the website's social feed will abruptly break, displaying empty spaces or error codes.45 This violates the core requirements of the project. Furthermore, the official API does not natively support the embedding of ephemeral content, such as Instagram Stories, due to strict 24-hour expiration constraints enforced by Meta's privacy policies.47

### **Implementation of a Cloud-Based Middleware Solution**

To guarantee a genuine zero-maintenance integration, the AI agent must bypass custom Graph API engineering entirely and implement an enterprise-grade, cloud-based widget solution such as Mirror App, Elfsight, or Smash Balloon.18

These third-party platforms act as a robust, automated middleware layer. They manage the complex OAuth handshakes on their own servers, handle token lifecycle renewals autonomously, and cache the Instagram media on their own global Content Delivery Networks (CDNs).18

| Integration Method | Maintenance Burden | Token Management | Reliability for Small Business |
| :---- | :---- | :---- | :---- |
| Custom Graph API | High (Requires code updates per Meta changes) 45 | Manual/Programmatic refresh required 45 | Low (High risk of sudden failure) |
| Serverless Widget (e.g., Elfsight, Mirror App) | Zero (Managed by vendor) 18 | Fully automated by vendor 18 | High (Guaranteed uptime via vendor CDN) 18 |

The engineering implementation on the Next.js side is remarkably lightweight. The AI agent simply needs to embed the provided asynchronous JavaScript snippet or HTML iframe code into a dedicated React component (\<InstagramFeed /\>) on the Social page.18

To optimize performance and protect Google Core Web Vitals, the following architectural rules must be applied to the widget implementation:

1. **Strict Lazy Loading**: The widget execution must be deferred until the user scrolls near the social section. This prevents heavy image payloads from blocking the initial page render, ensuring the site feels instantly responsive.18  
2. **No-Heavy-JS Constraints**: Ensure the chosen widget relies on optimized Document Object Model (DOM) manipulation without loading redundant, legacy libraries like jQuery, which would unnecessarily bloat the application.18  
3. **Real-Time Polling**: The widget must be configured to poll the Instagram account at regular intervals, ensuring the website perpetually features the most current content without requiring manual triggers.50

By outsourcing the social media synchronization to a specialized microservice, the Next.js application remains incredibly performant, visually engaging, and entirely insulated from Meta's frequent, unpredictable API deprecations.45

## **AI Agent Handoff Specifications and Page Routing**

To ensure the autonomous AI agent can successfully execute this modernization plan, the application must be structured logically utilizing the Next.js App Router paradigm. The following directives dictate the exact page structures and their corresponding data fetching strategies.

### **The Home Page (/app/page.tsx)**

The Home page serves as the atmospheric entry point. It will not be cluttered with deep transactional data. It must utilize a highly optimized hero section featuring a high-resolution video or image background showcasing the physical venue, utilizing the next/image component for automatic WebP formatting and responsive sizing.9 The live sports ticker component will anchor the bottom of this hero viewport.37 Large, touch-friendly, card-based buttons will route users to the Menu or Directions pages, adhering strictly to the mobile-first thumb-zone ergonomics.16

### **The Menu Page (/app/menu/page.tsx)**

The Menu page is the transactional heart of the site. The deeply nested JSON from the Toast /menus endpoint will be flattened into a relational dictionary structure using React's state management hooks to ensure rapid filtering and sorting.29 Rather than a single infinite scroll, the menu will utilize sticky categorical navigation, allowing users to rapidly jump between "Starters", "Burgers", and "Brews" without losing their place on the page.17 Items will be rendered in a grid layout utilizing CSS Grid. Pricing will be dynamically formatted based on the Toast pricingRules object, ensuring that complex items display accurately.32

### **The Upcoming Events Page (/app/events/page.tsx)**

This page materializes the normalized UnifiedEvent data. Events are sorted strictly by temporal proximity.39 MLB games will dynamically pull corresponding team logos based on the string value of the opponent.51 Holidays will utilize thematic color overlays managed via Tailwind utilities. Every single event card must feature a localized call-to-action, such as "Reserve a Table" or "Get Directions," maximizing the probability of converting a passive browser into a physical patron.

### **The Social Page (/app/social/page.tsx)**

This page provides an immersive masonry grid of the brand's culture. It will host the full-width integration of the chosen Instagram widget.18 To maintain the fast loading speeds expected in modern web development, the Next.js architecture must prioritize skeletal loading screens (shimmer effects) to hold the layout steady while the third-party widget negotiates its external API handshake, preventing layout shift penalties.

### **Contact and Directions (/app/location/page.tsx)**

All textual address data, phone numbers, and operational hours are injected directly from the Toast Restaurants API payload.11 The variables will be concatenated and URL-encoded to form a dynamic query string passed to a Google Maps component.33 Deep linking is mandatory: tapping the address on a mobile device must trigger the native operating system mapping application, ensuring frictionless vehicular routing.

By strictly adhering to these integration protocols, architectural standards, and UI/UX design philosophies, the AI agent will successfully construct a digital platform for American Heroes & Brew that is not merely an updated website, but an autonomous, high-performance extension of the restaurant's core operational infrastructure.

#### **Works cited**

1. How to Make the Best Restaurant Websites in 2025 \- Foodhub for Business, accessed February 26, 2026, [https://foodhubforbusiness.com/blogs/restaurant-website-guide-2025/](https://foodhubforbusiness.com/blogs/restaurant-website-guide-2025/)  
2. Restaurant Tech Stack of the Future | FoodNotify Hospitality Blog, accessed February 26, 2026, [https://www.foodnotify.com/en/blog/tech-stack-future-restaurants](https://www.foodnotify.com/en/blog/tech-stack-future-restaurants)  
3. Restaurant Technology Stack: Tools You Actually Need, accessed February 26, 2026, [https://bepbackoffice.com/blog/restaurant-technology-stack/](https://bepbackoffice.com/blog/restaurant-technology-stack/)  
4. Restaurants are Drowning in Data Silos—Integrations Can Help \- Olo, accessed February 26, 2026, [https://www.olo.com/blog/restaurant-tech-integration](https://www.olo.com/blog/restaurant-tech-integration)  
5. Building a Modern Restaurant Tech Stack: 5 Essential Systems You Need \- Sauce, accessed February 26, 2026, [https://www.getsauce.com/post/building-a-restaurant-tech-stack](https://www.getsauce.com/post/building-a-restaurant-tech-stack)  
6. Public Holidays API \- Ranked Event Data \- PredictHQ, accessed February 26, 2026, [https://www.predicthq.com/events/public-holidays](https://www.predicthq.com/events/public-holidays)  
7. Padres Schedule & Tickets \- 2026 Home Games | Petco Park Insider, accessed February 26, 2026, [https://www.petcoparkinsider.com/padres-schedule](https://www.petcoparkinsider.com/padres-schedule)  
8. Top 5 Food Templates for Fast & Modern Restaurant Websites \[2025\] \- Themixly, accessed February 26, 2026, [https://themixly.com/top-5-food-templates-for-fast-modern-restaurant-websites-2025/](https://themixly.com/top-5-food-templates-for-fast-modern-restaurant-websites-2025/)  
9. Next.js Boilerplate Setup 2025 | Create a Scalable & Fast Web App Starter Template, accessed February 26, 2026, [https://www.youtube.com/watch?v=a5jQnfxkC4k](https://www.youtube.com/watch?v=a5jQnfxkC4k)  
10. Sports Data API \- Sportradar, accessed February 26, 2026, [https://sportradar.com/media-tech/data-content/sports-data-api/](https://sportradar.com/media-tech/data-content/sports-data-api/)  
11. API overview \- \- Developer guide \- Toast platform docs \-, accessed February 26, 2026, [https://doc.toasttab.com/doc/devguide/apiOverview.html](https://doc.toasttab.com/doc/devguide/apiOverview.html)  
12. Top 7 Next.js Boilerplates for 2025 to Jumpstart Your Project \- AnotherWrapper, accessed February 26, 2026, [https://anotherwrapper.com/blog/next-js-boilerplate](https://anotherwrapper.com/blog/next-js-boilerplate)  
13. The ultimate guide to CSS frameworks in 2025 \- Contentful, accessed February 26, 2026, [https://www.contentful.com/blog/css-frameworks/](https://www.contentful.com/blog/css-frameworks/)  
14. Top 7 CSS Frameworks in 2025 \- WeAreDevelopers, accessed February 26, 2026, [https://www.wearedevelopers.com/en/magazine/best-css-frameworks](https://www.wearedevelopers.com/en/magazine/best-css-frameworks)  
15. ixartz/Next-js-Boilerplate: Nextjs Boilerplate and Starter with App Router and Page Router support, Tailwind CSS 4 and TypeScript ⚡️ Made with developer experience first: Next.js 16 \+ TypeScript \+ ESLint \+ Prettier \+ Drizzle ORM \+ Husky \+ Lint-Staged \+ Vitest \+ Testing Library \+ Playwright \- GitHub, accessed February 26, 2026, [https://github.com/ixartz/Next-js-Boilerplate](https://github.com/ixartz/Next-js-Boilerplate)  
16. Modern UI Design Trends For Websites In 2025 \- Elegant Themes, accessed February 26, 2026, [https://www.elegantthemes.com/blog/design/modern-ui-design-trends](https://www.elegantthemes.com/blog/design/modern-ui-design-trends)  
17. Website Top Bar Navigation Design in 2025: Key Trends and Best Practices \- O-WOW, Inc., accessed February 26, 2026, [https://o-wow.com/website-top-bar-navigation-design-in-2025/](https://o-wow.com/website-top-bar-navigation-design-in-2025/)  
18. Best Instagram Feed Widget for Websites in 2025 \- Mirror App, accessed February 26, 2026, [https://mirror-app.com/best-instagram-feed-widget-websites](https://mirror-app.com/best-instagram-feed-widget-websites)  
19. The Complete Guide to Creating User-Friendly Mobile Navigation in 2025 \- Medium, accessed February 26, 2026, [https://medium.com/@secuodsoft/the-complete-guide-to-creating-user-friendly-mobile-navigation-in-2025-59c9dd620c1d](https://medium.com/@secuodsoft/the-complete-guide-to-creating-user-friendly-mobile-navigation-in-2025-59c9dd620c1d)  
20. Restaurant Dark Website Templates \- ThemeForest, accessed February 26, 2026, [https://themeforest.net/search/restaurant%20dark](https://themeforest.net/search/restaurant%20dark)  
21. Dark Mode Websites: 10 Stunning Examples That Actually Work \- Lovable, accessed February 26, 2026, [https://lovable.dev/guides/dark-mode-website-examples-guide](https://lovable.dev/guides/dark-mode-website-examples-guide)  
22. Authentication and restaurant access \- \- Developer guide \- Toast platform docs \-, accessed February 26, 2026, [https://doc.toasttab.com/doc/devguide/authentication.html](https://doc.toasttab.com/doc/devguide/authentication.html)  
23. Deprecated API functions \- \- Developer guide \- Toast platform docs \-, accessed February 26, 2026, [https://doc.toasttab.com/doc/devguide/apiDeprecatedApiFunctions.html](https://doc.toasttab.com/doc/devguide/apiDeprecatedApiFunctions.html)  
24. Toast API accounts \- \- Developer guide, accessed February 26, 2026, [https://doc.toasttab.com/doc/devguide/apiClientAccounts.html](https://doc.toasttab.com/doc/devguide/apiClientAccounts.html)  
25. Get menu items and modifiers \- Toast platform docs \-, accessed February 26, 2026, [https://doc.toasttab.com/openapi/configuration/operation/menuItemsGet/](https://doc.toasttab.com/openapi/configuration/operation/menuItemsGet/)  
26. Scopes \- \- Developer guide \- Toast platform docs \-, accessed February 26, 2026, [https://doc.toasttab.com/doc/devguide/apiScopes.html](https://doc.toasttab.com/doc/devguide/apiScopes.html)  
27. Toast developer portal \- \- Developer guide, accessed February 26, 2026, [https://doc.toasttab.com/doc/devguide/apiDeveloperPortal.html](https://doc.toasttab.com/doc/devguide/apiDeveloperPortal.html)  
28. Menus API overview \- \- Developer guide \- Toast platform docs \-, accessed February 26, 2026, [https://doc.toasttab.com/doc/devguide/apiGettingMenuInformationFromTheMenusAPI.html](https://doc.toasttab.com/doc/devguide/apiGettingMenuInformationFromTheMenusAPI.html)  
29. Getting menu information from the configuration API \- \- Developer guide, accessed February 26, 2026, [https://doc.toasttab.com/doc/devguide/menu\_information\_config\_api.html](https://doc.toasttab.com/doc/devguide/menu_information_config_api.html)  
30. Menus API returns fully resolved JSON \- \- Developer guide \- Toast platform docs \-, accessed February 26, 2026, [https://doc.toasttab.com/doc/devguide/apiMenusApiReturnsFullyResolvedJson\_V2.html](https://doc.toasttab.com/doc/devguide/apiMenusApiReturnsFullyResolvedJson_V2.html)  
31. Specifying modifiers and instructions for menu item selections \- \- Developer guide, accessed February 26, 2026, [https://doc.toasttab.com/doc/devguide/apiSpecifyingModifiersAndInstructions.html](https://doc.toasttab.com/doc/devguide/apiSpecifyingModifiersAndInstructions.html)  
32. Mapping menus API values to other Toast APIs and the menu data export \- \- Developer guide \- Toast platform docs \-, accessed February 26, 2026, [https://doc.toasttab.com/doc/devguide/apiMappingMenusApiValuesToOtherToastApisAndTheMenuDataExport\_V2.html](https://doc.toasttab.com/doc/devguide/apiMappingMenusApiValuesToOtherToastApisAndTheMenuDataExport_V2.html)  
33. Getting information about a specific restaurant \- \- Developer guide \- Toast platform docs \-, accessed February 26, 2026, [https://doc.toasttab.com/doc/devguide/apiRestaurantInformation.html](https://doc.toasttab.com/doc/devguide/apiRestaurantInformation.html)  
34. Building a shift scheduling integration \- \- Integration how-to guides \- Toast platform docs \-, accessed February 26, 2026, [https://doc.toasttab.com/doc/cookbook/apiIntegrationChecklistShift.html](https://doc.toasttab.com/doc/cookbook/apiIntegrationChecklistShift.html)  
35. Automated Sports Schedule Maker \- League Management Software, accessed February 26, 2026, [https://manageyourleague.com/MYL/schedule-maker](https://manageyourleague.com/MYL/schedule-maker)  
36. API-Sports \- Restful API for Sports data, accessed February 26, 2026, [https://api-sports.io/](https://api-sports.io/)  
37. Football Live Ticker, Football Live Sports Data \- Broadage, accessed February 26, 2026, [https://www.broadage.com/sports-data-widgets/football/live-ticker](https://www.broadage.com/sports-data-widgets/football/live-ticker)  
38. Anyone know a free API for just MLB schedule, home and away team, time and date? Does the MLB support one? I can't seem to find it if so. : r/mlbdata \- Reddit, accessed February 26, 2026, [https://www.reddit.com/r/mlbdata/comments/1e2b1ic/anyone\_know\_a\_free\_api\_for\_just\_mlb\_schedule\_home/](https://www.reddit.com/r/mlbdata/comments/1e2b1ic/anyone_know_a_free_api_for_just_mlb_schedule_home/)  
39. ID Handling \- Sportradar API Documentation, accessed February 26, 2026, [https://developer.sportradar.com/baseball/docs/mlb-ig-id-handling](https://developer.sportradar.com/baseball/docs/mlb-ig-id-handling)  
40. gameday-api-docs/team-information.md at master \- GitHub, accessed February 26, 2026, [https://github.com/jasonlttl/gameday-api-docs/blob/master/team-information.md](https://github.com/jasonlttl/gameday-api-docs/blob/master/team-information.md)  
41. Public Holiday Calendar API \- Rapid API, accessed February 26, 2026, [https://rapidapi.com/TekBunny/api/public-holiday-calendar-api](https://rapidapi.com/TekBunny/api/public-holiday-calendar-api)  
42. Holidays API & Calendar for 2026 \- 11holiday.com, accessed February 26, 2026, [https://11holidays.com/](https://11holidays.com/)  
43. Building a Sports Ticker using ESPHome and Home Assistant \- Brent Saltzman, accessed February 26, 2026, [https://brentsaltzman.com/building-a-sports-ticker/](https://brentsaltzman.com/building-a-sports-ticker/)  
44. Add a Live Scoreboard Overlay To Your Stream \- Keepthescore.com, accessed February 26, 2026, [https://keepthescore.com/blog/posts/stream-scoreboard-overlay/](https://keepthescore.com/blog/posts/stream-scoreboard-overlay/)  
45. Best Instagram API Alternatives After Meta Changes \- Xpoz, accessed February 26, 2026, [https://www.xpoz.ai/blog/comparisons/best-instagram-api-alternatives-after-meta-changes/](https://www.xpoz.ai/blog/comparisons/best-instagram-api-alternatives-after-meta-changes/)  
46. New Instagram APIs \- Graph API and Basic Display API \- LightWidget, accessed February 26, 2026, [https://lightwidget.com/new-instagram-apis](https://lightwidget.com/new-instagram-apis)  
47. Can You Embed Instagram Stories on a Website? (Realistic Options) \- Elfsight, accessed February 26, 2026, [https://elfsight.com/blog/how-to-embed-instagram-stories-on-website/](https://elfsight.com/blog/how-to-embed-instagram-stories-on-website/)  
48. 6 Best Instagram Gallery Plugins for WordPress 2025 \- WP All Import, accessed February 26, 2026, [https://www.wpallimport.com/best-instagram-gallery-wordpress/](https://www.wpallimport.com/best-instagram-gallery-wordpress/)  
49. How to Embed Instagram Feed on Website for FREE in 2026 \- EmbedSocial, accessed February 26, 2026, [https://embedsocial.com/blog/embed-instagram-feed-for-free/](https://embedsocial.com/blog/embed-instagram-feed-for-free/)  
50. How to Embed Instagram Feed on Any Website for Free \[ 2025 \], accessed February 26, 2026, [https://elfsight.com/blog/how-to-embed-instagram-feed-on-website/](https://elfsight.com/blog/how-to-embed-instagram-feed-on-website/)  
51. Translate MLB team schedule from csv into json \- gists · GitHub, accessed February 26, 2026, [https://gist.github.com/2533648](https://gist.github.com/2533648)