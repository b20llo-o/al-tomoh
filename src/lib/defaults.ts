import type { SiteContentMap, StoreSettingsMap } from "./types";
import type { Locale } from "./i18n";

/**
 * Fallbacks used when a content block has not yet been saved in Supabase.
 * Provided in both languages; once the store admin saves a block from the
 * hidden console, the saved version is shown to all visitors.
 */
const AR_CONTENT: SiteContentMap = {
  contact_info: {
    email: "hello@altomoh.com",
    phone: "+90 212 000 00 00",
    whatsapp: "905551234567",
    address: "جادة الاستقلال رقم 1، بي أوغلو، إسطنبول، تركيا",
    map_embed_url:
      "https://www.openstreetmap.org/export/embed.html?bbox=28.9700%2C41.0300%2C28.9900%2C41.0400&layer=mapnik",
    working_hours: "من الاثنين إلى السبت، 09:00 – 20:00",
  },
  about_page: {
    story:
      "بدأت مكتبة الطموح بقناعة بسيطة: أن الكتاب المطبوع، الذي يُمسَك باليد ويُقرأ بلا مشتتات، يبقى من أقوى أدوات الطموح الإنساني. من رفّ واحد من العناوين المختارة بعناية، نمونا لنصبح مكتبة مكرّسة بالكامل للكلمة المطبوعة — ننتقي الأدب والتاريخ والعلوم والفكر لقرّاء يهتمون بما تحمله أيديهم.",
    mission:
      "رسالتنا أن نضع كتبًا مطبوعة ذات معنى بين أيدي القراء الفضوليين أينما كانوا — بعناية بائع الكتب الجار، وبامتداد متجر عصري.",
    values: [
      {
        title: "الانتقاء قبل الكثرة",
        description:
          "كل عنوان في فهرسنا مختار بقصد. نفضّل طبعة واحدة عظيمة على عشر طبعات عابرة.",
      },
      {
        title: "احترام القارئ",
        description: "أوصاف صادقة، وتغليف متقن، وتجربة تسوق هادئة بلا ضجيج ولا إلحاح.",
      },
      {
        title: "الكلمة المطبوعة",
        description:
          "نؤمن بالورق والحبر والتجليد. الطموح تبيع الكتب الورقية فقط — أشياء صُنعت لتُقتنى.",
      },
    ],
  },
  homepage: {
    hero_title: "حيث يلتقي الطموح بالصفحة المطبوعة",
    hero_subtitle:
      "مكتبة منتقاة لقرّاء يؤمنون بأن الكتب العظيمة صُنعت لتُمسَك باليد. اكتشف الأدب والتاريخ والعلوم والفكر — يصلك حتى باب دارك.",
    why_choose_us: [
      {
        title: "مجموعة منتقاة",
        description:
          "عناوين مختارة بعناية في الأدب والتاريخ والعلوم والفلسفة — اختارها قرّاء، لقرّاء.",
      },
      {
        title: "توصيل بعناية",
        description:
          "كل كتاب يُغلَّف ويُشحَن بعناية، داخل تركيا وحول العالم، ليصل كما غادر رفوفنا.",
      },
      {
        title: "أسعار عادلة وواضحة",
        description: "أسعار واضحة بالليرة السورية والدولار الأمريكي، بلا تكاليف خفية.",
      },
      {
        title: "دعم إنساني",
        description: "فريق حقيقي من أمناء المكتبة جاهز للمساعدة بالتوصيات والطلبات وكل ما بينهما.",
      },
    ],
  },
  services_page: {
    intro:
      "وراء الرفوف، تقدم الطموح مجموعة خدمات صُممت لتجعل كل طلب تجربة مدروسة — من لحظة التصفح حتى لحظة فتح الطرد.",
    services: [
      {
        title: "توصيل محلي ودولي",
        description: "شحن سريع ومتتبَّع داخل تركيا، وتوصيل دولي متقن لقرّائنا حول العالم.",
      },
      {
        title: "تغليف الهدايا",
        description: "تغليف أنيق مع خيار بطاقة إهداء بخط اليد، ليصل الكتاب هدية حقيقية.",
      },
      {
        title: "تتبع الطلبات",
        description: "تابع كل طلب من رفوفنا حتى بابك مع تحديثات حالة مباشرة في حسابك.",
      },
      {
        title: "دعم عملاء مخصص",
        description: "سؤال عن طبعة أو طلب أو توصية — يجيبك أمناء مكتبتنا شخصيًا.",
      },
    ],
  },
};

const EN_CONTENT: SiteContentMap = {
  contact_info: {
    email: "hello@altomoh.com",
    phone: "+90 212 000 00 00",
    whatsapp: "905551234567",
    address: "Istiklal Avenue No. 1, Beyoglu, Istanbul, Türkiye",
    map_embed_url:
      "https://www.openstreetmap.org/export/embed.html?bbox=28.9700%2C41.0300%2C28.9900%2C41.0400&layer=mapnik",
    working_hours: "Monday to Saturday, 09:00 – 20:00",
  },
  about_page: {
    story:
      "Al-Tomoh began with a simple conviction: that a printed book, held in the hand and read without distraction, remains one of the most powerful instruments of human ambition. From a single shelf of carefully chosen titles, we have grown into a bookstore devoted entirely to the printed word — curating literature, history, science, and thought for readers who care about what they hold.",
    mission:
      "Our mission is to place meaningful printed books in the hands of curious readers, wherever they are — with the care of a neighbourhood bookseller and the reach of a modern store.",
    values: [
      {
        title: "Curation over quantity",
        description:
          "Every title in our catalogue is chosen deliberately. We would rather carry one great edition than ten forgettable ones.",
      },
      {
        title: "Respect for the reader",
        description:
          "Honest descriptions, careful packaging, and a calm shopping experience free of noise and pressure.",
      },
      {
        title: "The printed word",
        description:
          "We believe in paper, ink, and binding. Al-Tomoh sells physical books only — objects made to be kept.",
      },
    ],
  },
  homepage: {
    hero_title: "Where ambition meets the printed page",
    hero_subtitle:
      "A curated bookstore for readers who believe great books are meant to be held. Discover literature, history, science, and thought — delivered to your door.",
    why_choose_us: [
      {
        title: "Curated selection",
        description:
          "Hand-picked titles across literature, history, science, and philosophy — chosen by readers, for readers.",
      },
      {
        title: "Careful delivery",
        description:
          "Every book is wrapped and shipped with care, within Türkiye and worldwide, so it arrives as it left our shelves.",
      },
      {
        title: "Fair, transparent prices",
        description:
          "Clear pricing in Syrian Pounds and US Dollars, with no hidden costs.",
      },
      {
        title: "Human support",
        description:
          "A real team of booksellers ready to help with recommendations, orders, and anything in between.",
      },
    ],
  },
  services_page: {
    intro:
      "Beyond the shelves, Al-Tomoh offers a set of services designed to make every order feel considered — from the moment you browse to the moment the parcel is opened.",
    services: [
      {
        title: "Domestic and international delivery",
        description:
          "Fast, tracked shipping across Türkiye and careful international delivery to readers around the world.",
      },
      {
        title: "Gift packaging",
        description: "Elegant wrapping with a handwritten note option, so a book arrives as a true gift.",
      },
      {
        title: "Order tracking",
        description:
          "Follow every order from our shelves to your door with live status updates in your account.",
      },
      {
        title: "Dedicated customer support",
        description:
          "Questions about an edition, an order, or a recommendation — our booksellers reply personally.",
      },
    ],
  },
};

export const DEFAULT_SITE_CONTENT: Record<Locale, SiteContentMap> = {
  ar: AR_CONTENT,
  en: EN_CONTENT,
};

export const DEFAULT_STORE_SETTINGS: StoreSettingsMap = {
  currency: {
    try_per_usd: 13000,
  },
  shipping: {
    domestic_flat_try: 80,
    international_flat_usd: 18,
    free_shipping_threshold_try: 1500,
  },
  tax: {
    vat_percent: 0,
    prices_include_tax: true,
  },
  payments: {
    enable_card_payments: true,
    enable_bank_transfer: true,
    bank_transfer_instructions:
      "حوّل إجمالي الطلب إلى حسابنا البنكي مع كتابة رقم الطلب في وصف التحويل. يُشحن طلبك فور تأكيد وصول المبلغ.",
  },
};

/** Hidden host dashboard base path — never linked from public navigation. */
export const ADMIN_PATH = "/host-console";
