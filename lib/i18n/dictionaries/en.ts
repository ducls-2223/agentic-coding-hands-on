import type { ViDictionary } from "./vi";

// English translations. Keys must mirror `VI`. Missing keys fall back to VI
// via the `t()` lookup chain — surfaces gaps without crashing render.
export const EN: Partial<Record<keyof ViDictionary, string>> = {
  // Chrome
  "nav.about_saa": "About SAA 2025",
  "nav.awards_information": "Awards Information",
  "nav.sun_kudos": "Sun* Kudos",
  "nav.notifications": "Notifications",
  "nav.profile": "Profile",
  "nav.sign_out": "Sign out",
  "footer.copyright": "© 2025 Sun* Inc. All rights reserved.",
  "footer.copyright_alt": "Copyright © Sun* 2025",
  "footer.privacy": "Privacy Policy",
  "footer.terms": "Terms",
  "footer.contact": "Contact",
  "language.current": "Current language",
  "language.select": "Select language",
  "language.vi": "VN",
  "language.en": "EN",

  // Common
  "common.cancel": "Cancel",
  "common.close": "Close",
  "common.send": "Send",
  "common.submit": "Submit",
  "common.sending": "Sending…",
  "common.save": "Save",
  "common.search": "Search",
  "common.required": "*",
  "common.max": "Max",
  "common.coming_soon": "Coming soon",
  "common.copy_link": "Copy link",
  "common.link_copied": "Link copied!",
  "common.view_details": "View details",
  "common.loading": "Loading…",
  "common.event_live": "The event has started!",
  "common.redirecting": "Redirecting…",

  // Time formatting
  "time.just_now": "Just now",
  "time.minutes_ago": "{n} minutes ago",
  "time.hours_ago": "{n} hours ago",
  "time.days_ago": "{n} days ago",

  // Countdown
  "countdown.coming_soon": "Coming soon",
  "countdown.event_starts": "The event starts in",
  "countdown.days": "DAYS",
  "countdown.hours": "HOURS",
  "countdown.minutes": "MINUTES",

  // Floating action widget
  "fab.open_menu": "Open quick action menu",
  "fab.close_menu": "Close menu",
  "fab.rules": "Rules",
  "fab.write_kudos": "Write KUDOS",
  "fab.kudos_sent": "Kudos sent!",

  // Rules modal
  "rules.title": "Rules",
  "rules.receivers.heading":
    "Kudos receivers: Hero badges for positive impact",
  "rules.receivers.intro":
    "Based on how many teammates send you Kudos, you'll earn the matching Hero badge displayed next to your profile name.",
  "rules.hero.new.range": "1–4 teammates have sent you Kudos",
  "rules.hero.new.description":
    "The journey of spreading good vibes has just begun — your first words of thanks have found their way to you.",
  "rules.hero.rising.range": "5–9 teammates have sent you Kudos",
  "rules.hero.rising.description":
    "You're growing in the hearts of your teammates through kindness and dedication.",
  "rules.hero.super.range": "10–20 teammates have sent you Kudos",
  "rules.hero.super.description":
    "You've become a trusted and loved icon — someone teammates rely on and remember.",
  "rules.hero.legend.range": "More than 20 teammates have sent you Kudos",
  "rules.hero.legend.description":
    "You've become a legend — leaving an unforgettable mark on the team with your heart and actions.",
  "rules.senders.heading":
    "Kudos senders: Collect all 6 icons and unlock a mystery gift",
  "rules.senders.intro":
    "Every Kudos you send is posted to the system and can earn ❤️ from the Sunner community. For every 5 ❤️, you get to open 1 Secret Box for a chance at one of 6 exclusive SAA icons.",
  "rules.senders.outro":
    "Sunners who collect the full set of 6 icons will receive a mystery gift from SAA 2025.",
  "rules.national.heading": "National Kudos",
  "rules.national.body":
    "The 5 Kudos with the most ❤️ across all of Sun* will officially become National Kudos and receive a special prize from SAA 2025: Root Further.",

  // Kudos write dialog
  "kudos.dialog.title": "Send thanks and recognition to a teammate",
  "kudos.dialog.recipient_label": "Recipient",
  "kudos.dialog.recipient_placeholder": "Search",
  "kudos.dialog.recipient_open_list": "Open recipient list",
  "kudos.dialog.honor_label": "Honor",
  "kudos.dialog.honor_placeholder": "Give your teammate an honorary title",
  "kudos.dialog.honor_hint_line1": "Example: Person who inspires me.",
  "kudos.dialog.honor_hint_line2": "The honor will appear as the Kudos title.",
  "kudos.dialog.content_placeholder":
    "Share your thanks and recognition with a teammate here!",
  "kudos.dialog.mention_hint":
    'You can type "@ + name" to mention other colleagues',
  "kudos.dialog.hashtag_label": "Hashtag",
  "kudos.dialog.hashtag_button": "Hashtag",
  "kudos.dialog.remove_hashtag": "Remove {tag}",
  "kudos.dialog.image_label": "Image",
  "kudos.dialog.image_button": "Image",
  "kudos.dialog.image_coming_soon": "Coming soon",
  "kudos.dialog.anonymous": "Send thanks and recognition anonymously",
  "kudos.dialog.error_session":
    "Your session has an issue. Please reload the page.",
  "kudos.dialog.error_login": "You need to sign in to send a Kudos.",
  "kudos.dialog.error_save": "Could not save your Kudos. Please try again.",
  "kudos.dialog.error_empty": "Please enter your message.",
  "kudos.dialog.error_long": "Message is too long (max {n} characters).",
  "kudos.dialog.error_invalid": "Invalid content.",
  "kudos.editor.bold": "Bold",
  "kudos.editor.italic": "Italic",
  "kudos.editor.strikethrough": "Strikethrough",
  "kudos.editor.numbered_list": "Numbered list",
  "kudos.editor.link": "Insert link",
  "kudos.editor.quote": "Quote",
  "kudos.editor.community_guidelines": "Community Guidelines",

  // Sun kudos page
  "sun_kudos.input_open": "Open the kudos compose box",
  "sun_kudos.input_placeholder":
    "Who would you like to thank and recognize today?",
  "sun_kudos.search_sunner": "Search Sunner profiles",
  "sun_kudos.title_brand": "Sun* Annual Awards 2025",
  "sun_kudos.kv_title": "Recognition and thanks system",
  "sun_kudos.highlight_title": "FEATURED KUDOS",
  "sun_kudos.filter_department": "Department",
  "sun_kudos.filter_department_all": "All departments",
  "sun_kudos.filter_department_label": "Filter by department",
  "sun_kudos.filter_open": "Open department filter",
  "sun_kudos.empty": "No Kudos yet.",
  "sun_kudos.detail_coming_soon": "Kudos detail page coming soon.",
  "sun_kudos.spotlight_title": "Sun* Spotlight",
  "sun_kudos.spotlight_pan_zoom": "Toggle pan and zoom",
  "sun_kudos.spotlight_subtitle": "Total",
  "sun_kudos.spotlight_count_suffix": "Kudos sent",
  "sun_kudos.all_kudos_title": "ALL KUDOS",
  "sun_kudos.sidebar.stats_title": "Your stats",
  "sun_kudos.sidebar.received": "Received",
  "sun_kudos.sidebar.sent": "Sent",
  "sun_kudos.sidebar.hearts": "Hearts",
  "sun_kudos.sidebar.secret_box_opened": "Boxes opened",
  "sun_kudos.sidebar.secret_box_unopened": "Boxes unopened",
  "sun_kudos.sidebar.rankups_title": "Recent rank-ups",
  "sun_kudos.sidebar.gifts_title": "Latest gifts",
  "sun_kudos.sidebar.open_secret_box": "Open Secret Box",
  "sun_kudos.card.sent_to": "sent to",
  "sun_kudos.card.gallery_image": "Attached image",
  "sun_kudos.card.previous": "Previous",
  "sun_kudos.card.next": "Next",
  "sun_kudos.card.like": "Like",
  "sun_kudos.card.unlike": "Unlike",
  "sun_kudos.card.copy_link": "Copy link",

  // Home page
  "home.hero.eyebrow": "Sun* Annual Awards 2025",
  "home.hero.title": "ROOT FURTHER",
  "home.hero.subtitle": "Dig deeper, reach further",
  "home.hero.body":
    "SAA 2025 honors Sunners who chose to root deeper in Sun*'s values to grow further with the community and the global market.",
  "home.hero.cta": "Learn more",
  "home.root_further.heading": "ROOT FURTHER",
  "home.root_further.body":
    "The message of SAA 2025 — root deeply into our values and spread them widely to teammates, partners, and society.",
  "home.root_further.para1":
    `Facing the turbulent transformation of the AI era and increasingly high customer expectations, Sun* has chosen a strategy of capability diversification — striving not only to excel in our own field, but reaching for a higher goal where every Sunner is a "problem-solver": an expert in resolving every challenge, finding answers for every project, customer, and societal problem.\nDrawing inspiration from diverse capabilities, the flexibility to grow, and the spirit of digging deeper to break through in the AI era, "Root Further" was chosen as the official theme of the Sun* Annual Awards 2025.\nBeyond its surface meaning, "Root Further" is the journey of continuously reaching farther, rooting deeper, touching the hidden "geological" layers to keep surviving, rising, and nurturing the ever-burning passion to create value that defines every Sunner. Borrowing the image of roots that continuously dig into the earth, powerfully weaving through each layer of "sediment" to absorb the purest essence — Sunners are likewise "absorbing" nutrients from the era and market challenges to reinvent themselves daily, expanding capabilities and powerfully "taking root" in the AI era: an entirely new, complex, and unpredictable "geological" stratum, yet one brimming with boundless potential and opportunity.`,
  "home.root_further.quote":
    `"A tree with deep roots fears no storm"\n(English proverb)`,
  "home.root_further.para2":
    `Before the storm, only trees with strong enough roots can stand firm. An organization whose individuals are confident in their diverse capabilities, ready to create and embrace challenges, and in command of change — is one that not only stands firm amid turbulence, but extracts every advantage and conquers the challenges of the times. More than simply the name of a new chapter in the organization's journey, "Root Further" is an encouragement, motivating each of us to dare to believe in ourselves, dare to dig deep, unlock all potential, dare to break limits, and dare to become the most versatile and excellent version of ourselves. Because in the AI era, diverse capabilities and leveraging the power of the times is the prerequisite for lasting.
Knowing that deep within the "earth" of the tech industry and modern market there are countless mysterious "geological" layers. Only this: when "Root Further" has become our core spirit, we will not be afraid — we will feel excited before any uncharted territory on the journey forward. Because we always believe that within those very boundless realms, countless wonders and opportunities to rise are waiting for us.`,
  "home.awards.heading": "Awards System",
  "home.awards.cta": "View details",
  "home.kudos.heading": "Sun* Kudos",
  "home.kudos.eyebrow": "Recognition movement",
  "home.kudos.desc":
    `NEW TO SAA 2025\nA colleague recognition and appreciation initiative — happening for the first time for all Sunners. Launching in November 2025, it encourages Sun* members to share recognition and thanks to colleagues on the official platform. This will serve as input for the Heads Council during the award selection process.`,
  "home.kudos.cta": "Explore now",

  // Awards information
  "awards.title": "Awards System",
  "awards.title_full": "SAA 2025 Awards System",
  "awards.subtitle": "Sun* Annual Awards 2025",
  "awards.menu_heading": "Award categories",
  "awards.count_label": "Number of awards:",
  "awards.value_label": "Award value:",
  "awards.kudos_banner.title": "Sun* Kudos",
  "awards.kudos_banner.description":
    "A recognition and thanks initiative for every Sunner. Every thank-you counts.",
  "awards.kudos_banner.cta": "Go to Sun* Kudos",

  // Login
  "login.welcome.title": "Welcome to SAA 2025",
  "login.welcome.body": "Sign in with your Sun* account to begin the journey.",
  "login.google_button": "Sign in with Google",
  "login.signing_in": "Signing in…",
  "login.error.generic": "Sign-in failed. Please try again.",
  "login.error.oauth_failed":
    "Google sign-in did not succeed. Please try again.",

  // Profile
  "profile.title": "Your profile",
  "profile.email_label": "Email",
  "profile.signed_in_with": "Signed in with Google",
  "profile.signed_in_as": "Signed in as",
  "profile.coming_soon": "Coming soon. Profile management for SAA 2025 will live here.",
  "profile.back_home": "← Back to home",
};
