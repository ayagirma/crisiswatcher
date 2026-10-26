/* ════════════════════════════════════════════════════════════════════
   EDIT HERE. Site settings and content for Ethiopia Crisis Watch.
   Blog posts are written on the admin page (/admin/).
   ════════════════════════════════════════════════════════════════════ */
var CONFIG = {
  siteName: "Ethiopia Crisis Watch",
  siteNameAm: "የኢትዮጵያ ቀውስ ክትትል",
  siteUrl: "https://crisiswatcher.org",
  contactEmail: "sshiferawq@gmail.com",
  apiBase: "/api",
  newsletterEndpoint: "/api/subscribe",
  contactEndpoint: "/api/contact",
  blogAuthor: "Soleyana Shiferaw",
  blogEmail: "",
  gofundmeWidget: false,
  social: [
    { name: "Instagram", url: "https://www.instagram.com/ethiopiacrisiswatch" },
    { name: "Telegram", url: "https://t.me/ethiopiacrisiswatch" },
    { name: "X", url: "https://x.com/ethcrisiswatch" }
  ]
};

var CONTENT = {
  regions: ["Amhara", "Oromia", "Tigray", "Arsi", "Afar", "Somali", "Benishangul-Gumuz"],
  regionsAm: {
    "Amhara": "አማራ",
    "Oromia": "ኦሮሚያ",
    "Tigray": "ትግራይ",
    "Arsi": "አርሲ",
    "Afar": "አፋር",
    "Somali": "ሶማሌ",
    "Benishangul-Gumuz": "ቤኒሻንጉል-ጉሙዝ",
    "Gambela": "ጋምቤላ",
    "Sidama": "ሲዳማ",
    "Addis Ababa": "አዲስ አበባ"
  },

  /* Verified GoFundMe campaigns (set to [] to clear all prefabricated collection amounts) */
  campaigns: [],

  /* Template to add a real verified campaign in the future:
  campaigns: [
    {
      id: "emergency-relief",
      featured: true,
      title: "Your Campaign Title",
      titleAm: "የዘመቻው ርዕስ",
      region: "Arsi", // or "Amhara", "Oromia", "Tigray", etc.
      organizer: "Organizer Name",
      gofundmeUrl: "https://www.gofundme.com/f/your-actual-campaign",
      goal: 0, // optional goal amount (set to 0 or omit to not show prefabricated collection bars)
      raised: 0,
      donors: 0,
      summary: "Description of the relief effort.",
      summaryAm: "የእርዳታው ዝርዝር መግለጫ።",
      uses: [],
      updates: []
    }
  ],
  */

  /* Open advocacy petitions */
  petitions: [
    {
      id: "unrestricted-aid",
      title: "Demand Unrestricted Humanitarian Access for All Ethiopian Regions",
      titleAm: "ለሁሉም የኢትዮጵያ ክልሎች ያልተገደበ የሰብዓዊ እርዳታ መተላለፊያ እንዲፈቀድ መጠየቅ",
      text: "Call upon the UN Security Council and international donors to hold all parties accountable for obstructing humanitarian aid convoys and medical supplies.",
      textAm: "የተመድ የፀጥታው ምክር ቤት እና ዓለም አቀፍ ለጋሾች የሰብዓዊ እርዳታ አቅርቦቶችን የሚያስተጓጉሉ አካላትን ተጠያቂ እንዲያደርጉ ጥሪ ያቅርቡ።",
      host: "Change.org",
      url: "https://www.change.org/p/unrestricted-humanitarian-access-ethiopia"
    },
    {
      id: "protect-civilians",
      title: "Protect Vulnerable Communities and Places of Worship from Targeted Attacks",
      titleAm: "ተጋላጭ ማህበረሰቦችን እና የእምነት ቦታዎችን ከጥቃት መጠበቅ",
      text: "Urge the African Union Commission and international human rights bodies to investigate identity-based violence and safeguard historic heritage sites and places of worship.",
      textAm: "የአፍሪካ ህብረት ኮሚሽን እና የሰብዓዊ መብት ተቋማት በማንነት ላይ የተመሰረቱ ጥቃቶችን እንዲመረምሩና ታሪካዊ የእምነት ቦታዎችን እንዲጠብቁ ይጠይቁ።",
      host: "ActionNetwork",
      url: "https://actionnetwork.org/petitions/protect-places-of-worship-in-ethiopia"
    }
  ],

  /* Verified situation reports & updates (newest first) */
  posts: [
    {
      id: "amhara-marketplace-drone-strikes",
      type: "breaking",
      status: "verified",
      region: "Amhara",
      date: "2026-10-10",
      title: "UN Human Rights Office reports civilian casualties from airstrikes in Amhara",
      titleAm: "የተመድ የሰብዓዊ መብቶች ቢሮ በአማራ ክልል በድሮን ጥቃቶች ንጹሃን ዜጎች መሞታቸውን አስታወቀ",
      summary: "UN OHCHR and local health authorities document airstrikes and drone strikes near rural marketplace centers in North Gondar and Gojjam, killing over 30 civilians.",
      summaryAm: "የተመድ የሰብዓዊ መብቶች ከፍተኛ ኮሚሽነር ቢሮና የአካባቢው የጤና ባለሙያዎች በሰሜን ጎንደርና ጎጃም የገበያ ቦታዎች ላይ በተፈጸሙ የአየርና የድሮን ጥቃቶች ከ30 በላይ ንጹሃን መገደላቸውን አረጋገጡ።",
      body: [
        "United Nations human rights monitors reported multiple drone and airstrikes targeting commercial and rural market junctions in Amhara regional state over the past week.",
        "Local hospital administrators in Gondar confirmed receiving dozens of critically injured civilians, including women and young children. Medical staff face severe shortages of surgical anesthetics, blood bags, and sterile dressings due to ongoing transit blockades.",
        "Independent human rights organizations continue to demand an immediate end to indiscriminate strikes on civilian population centers and full access for international humanitarian observers."
      ],
      bodyAm: [
        "የተባበሩት መንግስታት ድርጅት የሰብዓዊ መብት ተቆጣጣሪዎች ባለፈው ሳምንት በአማራ ክልል የገበያ ማዕከላትና የህዝብ መሰብሰቢያዎች ላይ ተደጋጋሚ የአየርና የድሮን ጥቃቶች መፈጸማቸውን ዘግበዋል።",
        "በጎንደር የሚገኙ የሆስፒታል አስተዳዳሪዎች ሴቶችና ህፃናትን ጨምሮ በርካታ በፅኑ የተጎዱ ዜጎችን መቀበላቸውን ገልጸዋል። በተዘጉ መንገዶች ሳቢያ የማደንዘዣ መድኃኒቶች፣ የደም ከረጢቶችና የቁስል ማከሚያዎች እጥረት አጋጥሟል።",
        "ገለልተኛ የሰብዓዊ መብት ተሟጋች ድርጅቶች በሰላማዊ ዜጎች ላይ የሚፈጸሙ ያልተመረጡ ጥቃቶች በአስቸኳይ እንዲቆሙና ለዓለም አቀፍ የሰብዓዊ ታዛቢዎች ሙሉ ፈቃድ እንዲሰጥ ጥሪያቸውን አጠናክረዋል።"
      ],
      sources: [
        { label: "UN OHCHR Press Briefing: Civilian Casualties in Ethiopia", url: "https://www.ohchr.org/en/press-briefing-notes/2026/10/ethiopia-civilian-casualties" },
        { label: "ReliefWeb: Amhara Humanitarian Snapshot", url: "https://reliefweb.int/country/eth" }
      ],
      cta: "action"
    },
    {
      id: "arsi-firsthand-displaced-families",
      type: "account",
      status: "verified",
      anonymized: true,
      region: "Arsi",
      date: "2026-10-06",
      title: "Firsthand Account: Displaced families recount targeted night attacks in Arsi Zone",
      titleAm: "የአይን እማኝ ምስክርነት፡ በአርሲ ዞን በሌሊት ጥቃት የተፈናቀሉ ቤተሰቦች ያጋጠማቸውን ገለጹ",
      summary: "Eyewitnesses detail armed incursions against rural farming communities and historic church compounds in Shirka woreda, forcing hundreds to flee on foot.",
      summaryAm: "በሺርካ ወረዳ ገጠራማ የግብርና መንደሮችና አብያተ ክርስቲያናት ላይ የታጠቁ ኃይሎች በፈጸሙት ጥቃት በመቶዎች የሚቆጠሩ በእግራቸው ለመሸሽ መገደዳቸውን እማኞች ገልጸዋል።",
      body: [
        "Firsthand testimonies gathered by verified community liaisons describe coordinated late-night attacks on agrarian villages in Shirka district. Residential dwellings and granaries were burned, forcing families to flee into nearby woodlands.",
        "Survivors walked over 45 kilometers through rugged terrain to reach provisional displacement shelters in Assela and Adama. Elders report an urgent need for shelter tarps, clean water purification tablets, and infant nutritional supplements.",
        "To protect family members remaining in the affected districts, specific personal names, hamlet locations, and identifying details have been withheld in accordance with our verification safety protocols."
      ],
      bodyAm: [
        "በሺርካ ወረዳ ገጠራማ መንደሮች ላይ የተፈጸሙትን የተቀናጁ የሌሊት ጥቃቶች በቦታው የነበሩ ምስክሮች አስረድተዋል። መኖሪያ ቤቶችና የዕህል ጎተራዎች በመቃጠላቸው ቤተሰቦች ወደ ጫካ ሸሽተዋል።",
        "ተረፊዎች አሰላና አዳማ ወደሚገኙ ጊዜያዊ መጠለያዎች ለመድረስ ከ45 ኪሎ ሜትር በላይ በእግራቸው ተጉዘዋል። የድንኳን ፕላስቲኮች፣ የውሃ ማከሚያ ኪኒኖችና የህፃናት አልሚ ምግቦች አስቸኳይ እርዳታ ያስፈልጋቸዋል።",
        "በአካባቢው የቀሩትን ቤተሰቦች ደህንነት ለመጠበቅ ሲባል ስሞች፣ ትክክለኛ የመንደር ስሞችና መለያዎች ከመረጃ ማጣሪያ ደንባችን ጋር በሚስማማ መልኩ ተሰርዘዋል።"
      ],
      sources: [
        { label: "Ethiopian Human Rights Commission (EHRC) Investigation Report", url: "https://ehrc.org/" }
      ],
      cta: "action"
    },
    {
      id: "oromia-wollega-aid-corridor",
      type: "update",
      status: "verified",
      region: "Oromia",
      date: "2026-10-02",
      title: "Humanitarian agencies negotiate emergency relief passage into Western Oromia",
      titleAm: "የሰብዓዊ እርዳታ ኤጀንሲዎች ወደ ምዕራብ ኦሮሚያ የሚወስዱ የድንገተኛ አደጋ መተላለፊያዎችን አስከፈቱ",
      summary: "UN OCHA and humanitarian partner organizations deliver critical grain and nutritional shipments to isolated communities across East and West Wollega.",
      summaryAm: "የተመድ የሰብዓዊ ጉዳዮች ማስተባበሪያ ቢሮ (OCHA) እና አጋር ድርጅቶች በምስራቅና ምዕራብ ወለጋ ለተገለሉ ማህበረሰቦች አስቸኳይ የዕህል እና አልሚ ምግብ አቅርቦቶችን አደረሱ።",
      body: [
        "A humanitarian relief convoy consisting of 18 trucks carrying emergency flour, therapeutic food, and water treatment supplies arrived at distribution hubs in East and West Wollega.",
        "Aid workers note that recurring clashes and highway security checkpoints have disrupted civilian commerce for months, causing severe price inflation on basic staple foods.",
        "Over 450,000 internally displaced persons across Western Oromia remain dependent on continuous, unhindered humanitarian corridors as agricultural harvesting approaches."
      ],
      bodyAm: [
        "የአስቸኳይ ጊዜ ዱቄት፣ አልሚ ምግቦችና የውሃ ማከሚያ ቁሳቁሶችን የጫኑ 18 የጭነት መኪኖች የምስራቅና ምዕራብ ወለጋ ማከፋፈያ ማዕከላት ደርሰዋል።",
        "የእርዳታ ሠራተኞች ተደጋጋሚ ግጭቶችና የፍተሻ ኬላዎች የንግድ እንቅስቃሴውን ለወራት ማስተጓጎላቸውንና በመሠረታዊ ምግቦች ላይ ከፍተኛ የዋጋ ጭማሪ ማስከተላቸውን ገልጸዋል።",
        "በምዕራብ ኦሮሚያ የሚገኙ ከ450,000 በላይ ተፈናቃዮች የመከር ወቅት እስኪደርስ ድረስ ያልተቋረጠ የሰብዓዊ መተላለፊያ ይፈልጋሉ።"
      ],
      sources: [
        { label: "UN OCHA Ethiopia Situation Report", url: "https://www.unocha.org/ethiopia" }
      ]
    },
    {
      id: "tigray-idp-shelter-crisis",
      type: "update",
      status: "verified",
      region: "Tigray",
      date: "2026-09-28",
      title: "Protracted displacement leaves over one million IDPs in severe shelter crisis across Tigray",
      titleAm: "በትግራይ ከአንድ ሚሊዮን በላይ ተፈናቃዮች በከፍተኛ የመጠለያ ችግር ውስጥ ይገኛሉ",
      summary: "Humanitarian agencies warn of deteriorating sanitary conditions in overcrowded schools and camps across Shire and Mekelle pending implementation of safe return protocols.",
      summaryAm: "የሰብዓዊ እርዳታ ድርጅቶች በሽሬ እና መቀሌ በሚገኙ ትምህርት ቤቶችና ካምፖች ውስጥ የንፅህና አጠባበቅ ሁኔታ እያሽቆለቆለ መምጣቱን አስጠነቀቁ።",
      body: [
        "Over one million internally displaced persons continue to reside in makeshift classrooms and communal centers across Tigray, awaiting safe, voluntary return arrangements as envisioned under the Pretoria Agreement.",
        "International relief agencies face severe funding shortfalls, leading to reductions in food rations and basic sanitation supplies. Health workers warn of rising risks of preventable waterborne illnesses ahead of the rainy season.",
        "Community advocates are urging federal authorities and international guarantors to accelerate the restoration of civilian administration and demilitarization of contested western zones."
      ],
      bodyAm: [
        "ከአንድ ሚሊዮን በላይ የሀገር ውስጥ ተፈናቃዮች በትግራይ በሚገኙ ጊዜያዊ ትምህርት ቤቶች ውስጥ በመጠለል የፕሪቶሪያውን ስምምነት ተከትሎ ወደ ቀያቸው በሰላም ለመመለስ እየተጠባበቁ ነው።",
        "ዓለም አቀፍ የእርዳታ ድርጅቶች ከፍተኛ የበጀት እጥረት አጋጥሟቸዋል፤ ይህም የምግብ ድልድል እንዲቀነስ ምክንያት ሆኗል። የጤና ባለሙያዎች የክረምት ዝናብ ከመግባቱ በፊት የውሃ ወለድ በሽታዎች ስጋት እንዳይጨምር አስጠንቅቀዋል።",
        "የማህበረሰብ ተሟጋቾች የፌዴራል መንግስት እና ዓለም አቀፍ ዋስትና ሰጪዎች የሲቪል አስተዳደር መልሶ ማቋቋምን እንዲያፋጥኑ ጠይቀዋል።"
      ],
      sources: [
        { label: "IOM Displacement Tracking Matrix (DTM) Ethiopia", url: "https://dtm.iom.int/ethiopia" },
        { label: "Amnesty International: Regional Human Rights Update", url: "https://www.amnesty.org/en/location/africa/east-africa-the-horn-and-great-lakes/ethiopia/" }
      ]
    }
  ],

  /* Learn page: timeline */
  timeline: [
    {
      date: "Nov 2020",
      dateAm: "ኅዳር 2013 ዓ.ም.",
      title: "War erupts in Tigray",
      titleAm: "በትግራይ ጦርነት ተቀሰቀሰ",
      text: "Hostilities break out between federal armed forces and regional forces in Tigray, beginning two years of devastating conflict.",
      textAm: "በፌዴራል የፀጥታ ኃይሎችና በትግራይ ኃይሎች መካከል ግጭት ተቀስቅሶ የሁለት ዓመት አስከፊ ጦርነት ተጀመረ።"
    },
    {
      date: "Nov 2022",
      dateAm: "ጥቅምት 2015 ዓ.ም.",
      title: "Pretoria Cessation of Hostilities Agreement",
      titleAm: "የፕሪቶሪያ የሰላም ስምምነት",
      text: "Federal government and TPLF sign a permanent cessation of hostilities in South Africa, bringing an end to conventional front-line war in Tigray.",
      textAm: "የፌዴራል መንግስት እና ህወሓት በደቡብ አፍሪካ ቋሚ የተኩስ አቁም ስምምነት ተፈራረሙ፤ በትግራይ የነበረው መደበኛ ጦርነት አበቃ።"
    },
    {
      date: "Spring 2023",
      dateAm: "መጋቢት 2015 ዓ.ም.",
      title: "Oromia Peace Negotiations in Tanzania",
      titleAm: "በታንዛኒያ የኦሮሚያ የሰላም ንግግር",
      text: "Two rounds of direct peace talks in Zanzibar between the federal government and the OLA conclude without a formal ceasefire agreement.",
      textAm: "በዛንዚባር በፌዴራል መንግስት እና በኦነግ ሸኔ (OLA) መካከል የተደረጉ ሁለት ዙር የሰላም ንግግሮች ያለ ቋሚ ስምምነት ተጠናቀቁ።"
    },
    {
      date: "Aug 2023",
      dateAm: "ሐምሌ 2015 ዓ.ም.",
      title: "State of Emergency in Amhara",
      titleAm: "በአማራ ክልል የአስቸኳይ ጊዜ አዋጅ ታወጀ",
      text: "Federal government decrees a six-month state of emergency following the decision to integrate regional special forces, triggering widespread clashes with Fano militias.",
      textAm: "የክልል ልዩ ኃይሎችን መልሶ የማዋቀር ውሳኔን ተከትሎ መንግስት የስድስት ወር የአስቸኳይ ጊዜ አዋጅ አወጣ፤ ከፋኖ ታጣቂዎች ጋር ውጊያ ተጀመረ።"
    },
    {
      date: "2024–2026",
      dateAm: "2016–2018 ዓ.ም.",
      title: "Persistent Multi-Front Instability & Civilian Crisis",
      titleAm: "የቀጠለ ሁለገብ አለመረጋጋትና የሰብዓዊ ቀውስ",
      text: "Armed violence, drone warfare, localized mass displacements, and attacks on religious institutions persist across Amhara and Oromia while Tigray faces an IDP return deadlock.",
      textAm: "የታጠቀ ግጭት፣ የድሮን ጥቃቶች፣ መጠነ-ሰፊ መፈናቀሎች በአማራና ኦሮሚያ ሲቀጥሉ፣ በትግራይ የተፈናቃዮች መመለስ ጉዳይ እልባት ሳያገኝ ቆይቷል።"
    }
  ],

  /* Regional explainers */
  regionsInfo: [
    {
      name: "Amhara",
      nameAm: "አማራ",
      text: "Northern and northwestern Ethiopia. Widespread clashes between federal defense forces and localized Fano militias have severely impacted urban centers and agrarian valleys since mid-2023. Civilian populations have experienced periodic communications blackouts, drone strikes, roadblocks, and severe disruption to grain harvesting.",
      textAm: "ሰሜን እና ሰሜን ምዕራብ ኢትዮጵያ። ከመካከለኛው 2023 ጀምሮ በፌዴራል ኃይሎችና በፋኖ ታጣቂዎች መካከል የሚካሄዱ ግጭቶች የከተሞችን እና የእርሻ ማሳዎችን እንቅስቃሴ በእጅጉ ጎድተዋል። የኮሙኒኬሽን መቋረጥ፣ የአየር ጥቃቶች እና የመንገዶች መዘጋት በሰብል ስብሰባ ላይ ከፍተኛ ተጽዕኖ አሳድረዋል።"
    },
    {
      name: "Oromia",
      nameAm: "ኦሮሚያ",
      text: "Ethiopia's largest regional state by population and geographical extent. Multiple zones—most notably East and West Wollega, Guji, and North Shewa—have suffered from long-running hostilities involving government forces, the Oromo Liberation Army (OLA), and localized community militias, generating extensive civilian displacement.",
      textAm: "በህዝብ ቁጥርና በቆዳ ስፋት ትልቁ የኢትዮጵያ ክልል። በተለይም ምዕራብ እና ምስራቅ ወለጋ፣ ጉጂ እና ሰሜን ሸዋ በፌዴራል ኃይሎች፣ በኦነግ ሸኔ እና በአካባቢ ታጣቂዎች መካከል በሚደረጉ ተደጋጋሚ ግጭቶች ሳቢያ ከፍተኛ የህዝብ መፈናቀል አስተናግደዋል።"
    },
    {
      name: "Tigray",
      nameAm: "ትግራይ",
      text: "Northernmost region bordering Eritrea. The 2020–2022 war caused massive civilian casualties, widespread destruction of healthcare infrastructure, and catastrophic famine. While large-scale combat ended with the Pretoria Agreement, over one million displaced people remain unable to return safely to Western Tigray.",
      textAm: "የሰሜን ጫፍ ክልል። የ2020–2022 ጦርነት ከፍተኛ የሰው ህይወት መጥፋት፣ የጤና ተቋማት ውድመት እና ሰብዓዊ ቀውስ አስከትሏል። ምንም እንኳን የፕሪቶሪያው የሰላም ስምምነት መጠነ-ሰፊ ጦርነቱን ቢያስቆምም፣ ከአንድ ሚሊዮን በላይ ተፈናቃዮች እስካሁን ወደ ምዕራብ ትግራይ በደህንነት መመለስ አልቻሉም።"
    },
    {
      name: "Arsi",
      nameAm: "አርሲ",
      text: "A historical zone located in central-southeastern Oromia. In recent years, civilian farming communities and historic Orthodox Christian church communities in districts like Shirka have suffered targeted night raids, fatalities, property burnings, and mass flight toward urban municipal shelters.",
      textAm: "በመካከለኛው ምስራቅ ኦሮሚያ የሚገኝ ታሪካዊ ዞን። በቅርብ ዓመታት በተለይም በሺርካ ወረዳ ባሉ ገበሬዎች እና የቤተክርስቲያን ማህበረሰቦች ላይ ያነጣጠሩ የሌሊት ጥቃቶች፣ ግድያዎች፣ የንብረት ቃጠሎዎች እና ወደ ከተሞች የተደረጉ መጠነ-ሰፊ ስደቶች ተመዝግበዋል።"
    },
    {
      name: "Afar",
      nameAm: "አፋር",
      text: "North-eastern pastoralist region severely impacted by spillover fighting during the northern war and recurrent climate shocks. Communities continue to rebuild damaged pastoral supply chains and healthcare posts.",
      textAm: "በሰሜኑ ጦርነት ተጽዕኖ እና በተደጋጋሚ የአየር ንብረት ድርቆች የተጎዳ የቆላማ አርብቶ አደር ክልል። ማህበረሰቦች የተጎዱ የጤና ኬላዎችን እና የእንስሳት እርባታ አቅርቦቶችን በማቋቋም ላይ ይገኛሉ።"
    },
    {
      name: "Somali",
      nameAm: "ሶማሌ",
      text: "Eastern lowland region vulnerable to compounding severe droughts, flash floods, and borderland resource disputes, hosting significant numbers of climate and conflict-displaced pastoralists.",
      textAm: "በከፍተኛ ድርቅ፣ በድንገተኛ ጎርፍ እና በአጎራባች የሀብት ውዝግቦች የተጎዳ የምስራቅ አርብቶ አደር ክልል።"
    },
    {
      name: "Benishangul-Gumuz",
      nameAm: "ቤኒሻንጉል-ጉሙዝ",
      text: "Western borderland region home to the Grand Ethiopian Renaissance Dam (GERD). The Metekel and Kamashi zones have experienced recurring inter-ethnic clashes and civilian displacement over land rights and local governance.",
      textAm: "የታላቁ የኢትዮጵያ ህዳሴ ግድብ የሚገኝበት የምዕራብ ድንበር ክልል። የመተከል እና ካማሺ ዞኖች በመሬት ይገባኛል እና በአካባቢ አስተዳደር ሳቢያ ተደጋጋሚ የማህበረሰብ ግጭቶችን አስተናግደዋል።"
    }
  ],

  /* In-depth educational articles (slide series) */
  articles: [
    {
      id: "history-conflicts",
      title: "A short history of the conflicts",
      titleAm: "የግጭቶቹ አጭር ታሪካዊ ዳራ",
      note: "Slide series · Part 1",
      noteAm: "የትምህርታዊ ጽሑፍ · ክፍል 1",
      ready: true,
      summary: "How constitutional structures, political transitions since 2018, and regional power struggles led to the current humanitarian crisis.",
      summaryAm: "የህገ-መንግስቱ መዋቅር፣ ከ2018 (2010 ዓ.ም.) ወዲህ የተከሰቱ የፖለቲካ ሽግግሮች እና የክልላዊ ስልጣን ሽኩቻዎች ለአሁኑ ሰብዓዊ ቀውስ እንዴት ምክንያት ሆኑ?",
      sections: [
        {
          heading: "The 1995 Constitutional Framework",
          headingAm: "የ1987 ዓ.ም. (1995) የህገ-መንግስት መዋቅር",
          text: "Ethiopia's 1995 constitution established an ethnic federalist system, structuring the nation into regional states delineated primarily along linguistic and ethnic boundaries. While created to guarantee cultural autonomy and self-determination after decades of centralized imperial and military rule, the system institutionalized political competition along ethnic lines and left numerous historic territorial borders unresolved.",
          textAm: "የኢትዮጵያ የ1987 ዓ.ም. ህገ-መንግስት ብሔር ተኮር የፌዴራሊዝም ስርዓት በመዘርጋት ሀገሪቱን በዋናነት በቋንቋ እና በማንነት በተከፋፈሉ ክልሎች አዋቀረ። ይህ ስርዓት የባህል ራስን በራስ የማስተዳደር መብትን ለማረጋገጥ ያለመ ቢሆንም፣ የፖለቲካ ፉክክር በማንነት መስመር እንዲቀረጽ አድርጓል፤ በርካታ ታሪካዊ የድንበር ይገባኛል ጥያቄዎችንም ሳይፈታ አስቀርቷል።"
        },
        {
          heading: "The 2018 Political Transition",
          headingAm: "የ2010 ዓ.ም. (2018) የፖለቲካ ሽግግር",
          text: "The appointment of Prime Minister Abiy Ahmed in 2018 followed years of widespread grassroots protests, initially ushering in a wave of political reforms, prisoner releases, and a landmark peace accord with neighboring Eritrea. However, the subsequent dissolution of the long-ruling EPRDF coalition into the unified Prosperity Party alienated key regional elites—particularly the TPLF in Tigray—setting off rapid political realignment and escalating polarization.",
          textAm: "የጠቅላይ ሚኒስትር ዐቢይ አሕመድ ወደ ስልጣን መምጣት ተከትሎ የፖለቲካ ማሻሻያዎች፣ የእስረኞች መፈታት እና ከኤርትራ ጋር ታሪካዊ የሰላም ስምምነት ተደርገው ነበር። ሆኖም የኢህአዴግ ውህደት ወደ ብልፅግና ፓርቲ መቀየሩ የትግራዩን ህወሓት ጨምሮ ከአንዳንድ ክልላዊ ኃይሎች ጋር አለመግባባትን ፈጥሮ የፖለቲካ ውጥረቱን አባባሰው።"
        },
        {
          heading: "From Northern War to Multi-Front Crisis",
          headingAm: "ከሰሜኑ ጦርነት ወደ ሁለገብ ቀውስ",
          text: "The outbreak of catastrophic war in Tigray in November 2020 lasted two full years, devastating regional infrastructure and costing hundreds of thousands of civilian lives. Even as the November 2022 Pretoria Agreement ended formal warfare in Tigray, the federal government's subsequent move to dissolve regional special forces sparked intense armed resistance in Amhara by Fano militias, while protracted conflict in Oromia persisted unresolved.",
          textAm: "በኅዳር 2013 ዓ.ም. በትግራይ የተቀሰቀሰው አውዳሚ ጦርነት ለሁለት ዓመታት ቆይቶ ከፍተኛ የሰው ህይወትና የንብረት ውድመት አስከትሏል። ምንም እንኳን የፕሪቶሪያው ስምምነት በትግራይ መደበኛ ጦርነት ቢያስቆምም፣ የክልል ልዩ ኃይሎችን የመበተን ውሳኔ በአማራ ክልል ከፋኖ ታጣቂዎች ጋር ውጊያ እንዲቀሰቀስ ምክንያት ሆኗል፤ በኦሮሚያም የነበረው ግጭት እልባት አላገኘም።"
        }
      ]
    },
    {
      id: "who-is-affected",
      title: "Who is affected, region by region",
      titleAm: "በቀውሱ የተጎዱት እነማን ናቸው? ክልል በክልል",
      note: "Slide series · Part 2",
      noteAm: "የትምህርታዊ ጽሑፍ · ክፍል 2",
      ready: true,
      summary: "A factual examination of how ordinary farmers, religious communities, mothers, and children bear the brunt of violence across the country.",
      summaryAm: "ተራ ገበሬዎች፣ የእምነት ማህበረሰቦች፣ እናቶችና ህፃናት በሀገሪቱ የዓመፅ ሰለባ የሆኑበትን ሁኔታ የሚያሳይ ተጨባጭ ዳሰሳ።",
      sections: [
        {
          heading: "Amhara: Drone Warfare & Agricultural Disruption",
          headingAm: "አማራ፡ የድሮን ጥቃት እና የእርሻ እንቅስቃሴ መስተጓጎል",
          text: "In Amhara, rural agrarian families and urban residents across Gojjam, Gondar, and Wollo face curfews, drone strikes near civilian assemblies, and frequent transport shutdowns. Checkpoints and fuel shortages prevent farmers from transporting teff and grain to national markets, compounding hunger in major cities.",
          textAm: "በአማራ ክልል በጎጃም፣ ጎንደርና ወሎ የሚኖሩ ገበሬዎችና የከተማ ነዋሪዎች የሰዓት እላፊ ገደቦችን፣ የድሮን ጥቃቶችን እና የመንገዶች መዘጋት እያስተናገዱ ነው። የነዳጅ እጥረትና ኬላዎች እህል ወደ ገበያ እንዳይደርስ አግደዋል።"
        },
        {
          heading: "Oromia & Arsi: Civilian Targeted Raids",
          headingAm: "ኦሮሚያ እና አርሲ፡ በሰላማዊ ዜጎች ላይ ያነጣጠሩ ጥቃቶች",
          text: "In western zones (Wollega) and central zones (Arsi), recurring raids on rural villages have resulted in killings of defenseless farming families, destruction of church property, and widespread abductions along transit corridors. Many displaced families now live in temporary shacks with zero sanitation.",
          textAm: "በምዕራብ ዞኖች (ወለጋ) እና በመካከለኛው ዞን (አርሲ) በገጠር መንደሮች ላይ የሚፈጸሙ ተደጋጋሚ ጥቃቶች ንጹሃን አርሶ አደሮች እንዲገደሉ፣ አብያተ ክርስቲያናት እንዲቃጠሉ እና የመንገደኞች እገታ እንዲስፋፋ አድርገዋል። በርካታ ቤተሰቦች ያለ ምንም የንፅህና አቅርቦት በጊዜያዊ መጠለያዎች ውስጥ ይገኛሉ።"
        },
        {
          heading: "Tigray: The Unresolved IDP Stagnation",
          headingAm: "ትግራይ፡ ያልተፈታው የተፈናቃዮች የመጠለያ ቀውስ",
          text: "Over one million Tigrayan civilians remain displaced from their homes, crammed into abandoned schoolhouses and makeshift tarpaulin tents. Without full implementation of return mechanisms and sustained international food aid, malnutrition among infants and nursing mothers remains at emergency thresholds.",
          textAm: "ከአንድ ሚሊዮን በላይ የትግራይ ተፈናቃዮች በትምህርት ቤቶችና በፕላስቲክ ድንኳኖች ውስጥ ተጨናንቀው ይገኛሉ። ወደ ቀያቸው የመመለስ ሂደት ባለመጠናቀቁ እና በምግብ እጥረት ሳቢያ በህፃናትና አጥቢ እናቶች ላይ የተመጣጠነ ምግብ እጥረት በከፍተኛ ደረጃ ላይ ይገኛል።"
        }
      ]
    },
    {
      id: "how-to-read-sitrep",
      title: "How to read a situation report",
      titleAm: "የሁኔታዎች መግለጫ (SitRep) እንዴት ይነበባል?",
      note: "Slide series · Part 3",
      noteAm: "የትምህርታዊ ጽሑፍ · ክፍል 3",
      ready: true,
      summary: "A practical guide for diaspora members and researchers on deciphering UN OCHA, ReliefWeb, and human rights briefs without getting misled by propaganda.",
      summaryAm: "የዲያስፖራ አባላት እና ተመራማሪዎች የተመድ OCHA፣ ReliefWeb እና የሰብዓዊ መብት ሪፖርቶችን በፕሮፓጋንዳ ሳይታለሉ በትክክል እንዲረዱ የተዘጋጀ መመሪያ።",
      sections: [
        {
          heading: "1. Distinguishing Source Reliability",
          headingAm: "1. የመረጃ ምንጭን አስተማማኝነት ማረጋገጥ",
          text: "Look for multi-agency corroboration. Established international agencies (such as UN OCHA, UNICEF, and the ICRC) and reputable rights monitors (Amnesty International, Human Rights Watch, and the EHRC) adhere to strict corroboration thresholds before publishing casualty or displacement estimates. Be cautious of unsourced social media graphics.",
          textAm: "በበርካታ ኤጀንሲዎች የተረጋገጡ መረጃዎችን ይፈልጉ። የተመድ OCHA፣ ዩኒሴፍ፣ አለም አቀፉ የቀይ መስቀል እና የሰብዓዊ መብት ኮሚሽን (ኢሰመኮ) መረጃ ከማውጣታቸው በፊት ጥብቅ ማጣሪያ ያደርጋሉ። ምንጭ ከሌላቸው የማህበራዊ ሚዲያ መረጃዎች ይጠንቀቁ።"
        },
        {
          heading: "2. Decoding 'Humanitarian Access Constraints'",
          headingAm: "2. 'የሰብዓዊ እርዳታ ተደራሽነት እንቅፋቶች' ትርጉም",
          text: "In UN reports, phrases like 'access physically constrained' or 'insecurity impeding assessment missions' are diplomatic terms indicating that military checkpoints, active crossfire, or bureaucratic denial of travel permits are preventing relief trucks from entering distressed communities.",
          textAm: "በተመድ ሪፖርቶች ውስጥ 'ተደራሽነት መገደብ' ወይም 'የፀጥታ ችግር' የሚሉት ዲፕሎማሲያዊ ቃላት የፍተሻ ኬላዎች፣ የተኩስ ልውውጦች ወይም የመንቀሳቀስ ፈቃድ መከልከል የእርዳታ መኪኖች ለተቸገሩ ወገኖች እንዳይደርሱ እያገዱ መሆኑን ያመለክታሉ።"
        },
        {
          heading: "3. Prioritizing Eyewitness Safety",
          headingAm: "3. ለምስክሮች ደህንነት ቅድሚያ መስጠት",
          text: "When evaluating or circulating firsthand videos or reports, responsible monitors never share unblurred faces of victims or exact GPS coordinates of vulnerable hideouts. In active conflict zones, premature publicity can trigger retaliatory sweeps against defenseless families.",
          textAm: "የአይን እማኝ ቪዲዮዎችን ወይም ሪፖርቶችን ሲያጋሩ የተጎጂዎችን ፊት ወይም ትክክለኛ የቦታ መለያዎችን በፍፁም አያጋሩ። በግጭት ቀጣናዎች ውስጥ ያለ ጥንቃቄ መረጃ ማጋራት በንጹሃን ላይ የበቀል እርምጃ ሊያስከትል ይችላል።"
        }
      ]
    }
  ],

  /* Reputable research & reporting sources */
  sources: [
    { label: "ReliefWeb: Ethiopia Crisis Overview", url: "https://reliefweb.int/country/eth" },
    { label: "UN OCHA: Ethiopia Humanitarian Updates", url: "https://www.unocha.org/ethiopia" },
    { label: "Ethiopian Human Rights Commission (EHRC)", url: "https://ehrc.org/" },
    { label: "Human Rights Watch: Ethiopia Reports", url: "https://www.hrw.org/africa/ethiopia" },
    { label: "Amnesty International: Ethiopia Documentation", url: "https://www.amnesty.org/en/location/africa/east-africa-the-horn-and-great-lakes/ethiopia/" },
    { label: "International Crisis Group (ICG): Horn of Africa", url: "https://www.crisisgroup.org/africa/horn-africa/ethiopia" }
  ],

  /* Emergency humanitarian assistance, missing persons & mental health */
  resources: [
    {
      name: "ICRC - Restoring Family Links",
      nameAm: "የቀይ መስቀል ማህበር - የቤተሰብ ግንኙነት መልሶ ማቋቋም",
      tag: "Missing Persons",
      tagAm: "የጠፉ ሰዎችን መፈለግ",
      desc: "Assisting families in tracing relatives separated, missing, or detained during conflict in Ethiopia.",
      descAm: "በኢትዮጵያ በግጭት ሳቢያ የተነጣጠሉ፣ የጠፉ ወይም የታሰሩ ዘመዶቻቸውን እንዲያገኙ ለቤተሰቦች እገዛ ያደርጋል።",
      link: "https://familylinks.icrc.org/",
      contactText: "Visit familylinks.icrc.org or contact local Red Cross branch",
      contactTextAm: "familylinks.icrc.org ን ይጎብኙ ወይም በአካባቢዎ የሚገኘውን የቀይ መስቀል ቅርንጫፍ ያነጋግሩ"
    },
    {
      name: "UN OCHA Ethiopia Humanitarian Coordination",
      nameAm: "የተመድ የሰብዓዊ ጉዳዮች ማስተባበሪያ (OCHA)",
      tag: "Relief Tracking",
      tagAm: "የእርዳታ ክትትል",
      desc: "Official situation reports, IDP cluster tracking, and humanitarian convoy logistics updates.",
      descAm: "ይፋዊ የሁኔታዎች መግለጫ፣ የተፈናቃዮች ክትትል እና የሰብዓዊ እርዳታ ኮንቮይ መረጃዎችን ያቀርባል።",
      link: "https://www.unocha.org/ethiopia",
      contactText: "Addis Ababa: +251 11 544 4000",
      contactTextAm: "አዲስ አበባ፡ +251 11 544 4000"
    },
    {
      name: "Ethiopian Human Rights Commission (EHRC)",
      nameAm: "የኢትዮጵያ ሰብዓዊ መብቶች ኮሚሽን (ኢሰመኮ)",
      tag: "Violation Reporting",
      tagAm: "የመብት ጥሰት ጥቆማ",
      desc: "Independent statutory body investigating civilian abuses, unlawful detentions, and attacks on religious institutions.",
      descAm: "በሰላማዊ ዜጎች ላይ የሚደርሱ ጥቃቶችን፣ ህገ-ወጥ እስራቶችን እና በእምነት ተቋማት ላይ የሚፈጸሙ ጥቃቶችን የሚመረምር ገለልተኛ አካል።",
      link: "https://ehrc.org/",
      contactText: "Toll-Free in Ethiopia: 8220 · info@ehrc.org",
      contactTextAm: "በኢትዮጵያ ነፃ የስልክ መስመር፡ 8220 · info@ehrc.org"
    },
    {
      name: "Diaspora Grief & Trauma Support Network",
      nameAm: "የዲያስፖራ የሀዘንና የስነ-ልቦና ድጋፍ መረብ",
      tag: "Mental Health",
      tagAm: "የስነ-ልቦና ድጋፍ",
      desc: "Confidential peer counseling and trauma resources for diaspora members experiencing grief, secondary trauma, and anxiety for loved ones.",
      descAm: "በሀገር ቤት ላሉ ወዳጆቻቸው የሚጨነቁ፣ በሀዘንና በስነ-ልቦና ጫና ውስጥ ላሉ የዲያስፖራ አባላት የሚሰጥ ሚስጥራዊ የማማከር አገልግሎት።",
      link: "https://www.mentalhealthfirstaid.org/",
      contactText: "Crisis Text Line: Text HOME to 741741 (US/CA/UK)",
      contactTextAm: "የአደጋ ጊዜ መልእክት መስመር፡ HOME ብለው ወደ 741741 ይላኩ (አሜሪካ/ካናዳ/እንግሊዝ)"
    }
  ],

  /* Multi-country advocacy letter configurations */
  countries: {
    us: {
      name: "United States (Congress - House & Senate)",
      nameAm: "አሜሪካ (የተወካዮች ም/ቤት እና ሴኔት)",
      salutation: "Dear Representative / Senator,",
      findLabel: "Find my Representative",
      findLabelAm: "ተወካይዎን ይፈልጉ (house.gov)",
      findUrl: "https://www.house.gov/representatives/find-your-representative",
      altFindLabel: "Find my Senators",
      altFindLabelAm: "ሴኔተሮችዎን ይፈልጉ (senate.gov)",
      altFindUrl: "https://www.senate.gov/senators/senators-contact.htm",
      postalLabel: "ZIP code",
      postalLabelAm: "የዚፕ ኮድ (ZIP code)",
      cityLabel: "City and state",
      cityLabelAm: "ከተማ እና ግዛት (City, State)",
      cityPlaceholder: "Denver, CO",
      authority: "U.S. House of Representatives and Senate"
    },
    uk: {
      name: "United Kingdom (Member of Parliament - MP)",
      nameAm: "እንግሊዝ (የፓርላማ አባል - MP)",
      salutation: "Dear Member of Parliament,",
      findLabel: "Find your MP (parliament.uk)",
      findLabelAm: "የፓርላማ አባልዎን ይፈልጉ (parliament.uk)",
      findUrl: "https://members.parliament.uk/FindYourMP",
      altFindLabel: null,
      postalLabel: "Postcode",
      postalLabelAm: "የፖስታ ኮድ (Postcode)",
      cityLabel: "City / Constituency",
      cityLabelAm: "ከተማ / ምርጫ ክልል",
      cityPlaceholder: "London / Manchester",
      authority: "UK Parliament (House of Commons)"
    },
    ca: {
      name: "Canada (Member of Parliament - MP)",
      nameAm: "ካናዳ (የፓርላማ አባል - MP)",
      salutation: "Dear Member of Parliament,",
      findLabel: "Find your MP (ourcommons.ca)",
      findLabelAm: "የፓርላማ አባልዎን ይፈልጉ (ourcommons.ca)",
      findUrl: "https://www.ourcommons.ca/members/en/search",
      altFindLabel: null,
      postalLabel: "Postal code",
      postalLabelAm: "የፖስታ ኮድ (Postal code)",
      cityLabel: "City and province",
      cityLabelAm: "ከተማ እና ግዛት (City, Province)",
      cityPlaceholder: "Toronto, ON",
      authority: "House of Commons of Canada"
    },
    eu: {
      name: "European Union (MEPs & Foreign Affairs)",
      nameAm: "የአውሮፓ ህብረት (የአውሮፓ ፓርላማ አባላት - MEPs)",
      salutation: "Dear Member of the European Parliament,",
      findLabel: "Find your MEP (europarl.europa.eu)",
      findLabelAm: "የአውሮፓ ፓርላማ አባልዎን ይፈልጉ (europarl.europa.eu)",
      findUrl: "https://www.europarl.europa.eu/meps/en/home",
      altFindLabel: null,
      postalLabel: "Postal code",
      postalLabelAm: "የፖስታ ኮድ (Postal code)",
      cityLabel: "City and country",
      cityLabelAm: "ከተማ እና ሀገር (City, Country)",
      cityPlaceholder: "Brussels, Belgium",
      authority: "European Parliament"
    }
  },

  /* UI Translations */
  i18n: {
    en: {
      siteTitle: "Ethiopia Crisis Watch",
      siteSubtitle: "Documenting the crisis. Amplifying the call to act.",
      home: "Home",
      news: "News & Updates",
      blog: "Blog",
      action: "Take Action",
      donate: "Donate",
      learn: "Learn",
      about: "About & Contact",
      menu: "Menu",
      close: "Close",
      startHere: "Start here",
      verifiedReports: "Verified reports",
      opinionReflect: "Opinion, reflections",
      petitionsLetters: "Petitions, letters",
      gofundmeSub: "GoFundMe",
      historyRegions: "History, regions",
      whoWeAre: "Who we are",
      donateBtn: "Donate",
      langSwitch: "አማርኛ",
      themeDark: "Dark mode",
      themeLight: "Light mode",

      /* Hero */
      heroTitle: "Documenting the crisis. Amplifying the call to act.",
      heroLede: "Verified updates, petitions, and fundraisers for communities affected by violence in Ethiopia.",
      signPetition: "Sign a petition",
      writeCongress: "Write your representative",
      donateNow: "Donate",
      learnHistory: "Learn the history",
      activeFundraiser: "Active fundraiser",
      whereMoneyGoes: "Where the money goes",
      actFiveMin: "Act in five minutes",
      tellThree: "Tell three people today",
      tellThreeSub: "Most of our readers find us through a friend's share.",
      copySiteLink: "Copy site link",
      howWeVerify: "How we verify",
      trust1Title: "Every claim has a source",
      trust1Text: "Posts link to UN agencies, rights groups, and established outlets. Unconfirmed reports are labeled Developing.",
      trust2Title: "People are protected",
      trust2Text: "Names, faces, and locations are removed from firsthand accounts before they are published.",
      trust3Title: "Donations go through GoFundMe",
      trust3Text: "Payments happen on GoFundMe's secure checkout. We never handle your card details.",

      /* Stats & counters */
      updatesCountMonth: "updates this month",
      openPetitionsCount: "open petitions",
      activeFundraisersCount: "active fundraisers",

      /* Map */
      mapTitle: "Interactive Regional Crisis Map",
      mapSub: "Select any region to see verified reports, access alerts, and humanitarian status.",
      regionalFocus: "Regional Focus",
      verifiedUpdates: "verified update",
      filterNewsFor: "Filter news for",

      /* News & Updates */
      newsHead: "What is happening, verified",
      newsSub: "Newest first. Every post shows its sources. Reports still being confirmed are marked Developing.",
      searchPlaceholder: "Search updates by region or keyword",
      all: "All",
      verified: "Verified",
      developing: "Developing",
      breaking: "Breaking",
      update: "Update",
      account: "Firsthand account",
      actionTag: "Action",
      opinion: "Opinion",
      sources: "Sources",
      shareUpdate: "Share this update",
      copyLink: "Copy link",
      allUpdates: "All updates",
      safetyNotice: "Names, faces, and exact locations in this account were removed to protect the people involved.",
      takeNextStep: "Take the next step",
      viewAllReports: "View all",
      latestVerified: "Latest verified updates",
      today: "Today",
      yesterday: "Yesterday",
      daysAgo: "days ago",
      noMatch: "No updates match.",
      noMatchSub: "Try another region or clear the search.",
      comingSoon: "Verified updates are coming soon.",
      comingSoonSub: "Subscribe below to get them by email, or read the blog in the meantime.",

      /* Blog */
      blogTitle: "Analysis & Opinion",
      blogSub: "Reflections and opinion from our contributors, kept separate from the verified News. Tell us what you think: like a post, or email if you have more to say.",
      like: "Like",
      dislike: "Dislike",
      speakToYou: "Did this post speak to you?",
      haveMoreToSay: "Have more to say?",
      emailOpinion: "Email me your opinion",
      emailOpinionSub: "Send me your opinion by email. I read every message. I won't publish anything you send unless you say I can.",
      copyEmail: "Copy email address",
      sharePost: "Share this post",
      noPostsYet: "No posts yet.",
      loadingPosts: "Loading posts…",

      /* Take Action & Letter Builder */
      actionHead: "Advocate for peace in two steps",
      actionSub: "Sign open petitions, contact your elected representative, and mobilize your community.",
      step1: "Sign a petition",
      step1Desc: "Demand aid access and protection of civilians.",
      step2: "Write your elected official",
      step2Desc: "Customize your letter for US Congress, UK Parliament, Canada, or EU.",
      step3: "Share with three people",
      step3Desc: "Every share expands the coalition calling for accountability.",
      openPetitions: "Open petitions",
      signOn: "Sign on",
      writeYourRep: "Write your representative",
      letterJurisdiction: "Works for constituents in the US, UK, Canada, and European Union.",
      yourGov: "Your government / parliament",
      fullName: "Your full name",
      keyDemand: "Key policy demand",
      personalNote: "Add a personal line (optional)",
      personalHint: "Personalized constituent messages have 4x higher response rates from staffers.",
      localDataNotice: "Your information stays local in your browser. Nothing is sent to our servers.",
      copyLetter: "Copy letter",
      pasteInstruction: "Copy the letter and paste it directly into your representative's official constituent contact page.",
      shareAction: "Share Take Action",
      letterCopied: "Letter copied. Paste it into your representative's constituent form.",

      /* Donate */
      donateHead: "Direct relief for affected communities",
      donateSub: "Every campaign runs through GoFundMe's verified checkout, ensuring transparent donor protections, progress tracking, and verified fund distributions.",
      raisedOf: "raised of",
      goal: "goal",
      funded: "funded",
      donors: "donors",
      asOf: "as of",
      donateGfm: "Donate on GoFundMe",
      copyCampaignLink: "Copy campaign link",
      whereMoneyGoesHead: "Where the money goes",
      progressUpdates: "Progress updates",
      cantGive: "Can't give right now?",
      cantGiveSub: "Sharing a verified campaign helps almost as much. Most donations come from people who saw a friend share it.",
      shareDonate: "Support emergency relief in Ethiopia:",
      gfmFeeNote: "You'll finish on GoFundMe's secure checkout. Platform fee is 0%; standard card processing is ~2.9% + $0.30 per donation.",
      taxNote: "Personal GoFundMe fundraisers are typically not tax-deductible. Check the campaign page for full organizer details.",
      organizedBy: "Organized by",
      otherCampaigns: "Other verified campaigns",

      /* Learn */
      learnHead: "Understand the context and root causes",
      learnSub: "Comprehensive background on regional dynamics, historical timelines, and practical guides adapted from our slide series.",
      timelineHead: "Timeline of key events",
      regionsCommunities: "Regions and communities",
      educationalGuides: "Educational articles & slide series",
      emergencyContacts: "Emergency contacts & humanitarian aid",
      reputableSources: "Reputable sources we rely on",
      readGuide: "Read guide →",
      officialLink: "Official Link",
      allArticles: "All articles & guides",

      /* About & Contact */
      aboutHead: "Who runs this site, and why",
      aboutText1: "Ethiopia Crisis Watch is run by Soleyana Shiferaw, a member of the Ethiopian diaspora, with a small group of volunteer researchers and monitors. We collect verified reports, make them easy to understand, and turn attention into action: signatures, letters to Congress, and donations to communities rebuilding.",
      aboutText2: "We are not affiliated with any government, political party, or armed faction. We correct mistakes openly and transparently on the relevant posts.",
      shareSafely: "Sharing a firsthand account safely",
      shareSafelyDesc: "Use a private device and account that others cannot access. Never include family names or vulnerable village locations in your initial message. We strictly strip personal names, faces, metadata, and identifiable landmarks before publishing. We never publish without your explicit consent.",
      contactUs: "Contact us",
      whatIsThisAbout: "What is this about?",
      namePseudonym: "Name (a first name or pseudonym is fine)",
      email: "Email",
      message: "Message",
      sendMessage: "Send message",
      sending: "Sending…",
      sentSuccess: "Message sent. We usually reply within two days.",
      followSubscribe: "Follow & Subscribe",
      directContact: "Direct Contact:",

      /* Newsletter & Footer */
      nlTitle: "Get verified updates in your inbox",
      nlSub: "One email a week, plus urgent alerts when action is needed. No spam, unsubscribe anytime.",
      subscribe: "Subscribe",
      subscribing: "Subscribing…",
      subscribed: "You're subscribed. Check your inbox to confirm.",
      siteSection: "Site",
      followSection: "Follow",
      safetySection: "Your safety",
      safetyFootText: "We remove names, faces, and locations from firsthand accounts before publishing.",
      safeShareLink: "How to share safely",
      gfmNoticeFoot: "Donations are processed by GoFundMe. We never see your card details.",
      rssFeed: "RSS Feed",
      lastUpdated: "Last updated",
      takeActionFoot: "Take action"
    },

    am: {
      siteTitle: "የኢትዮጵያ ቀውስ ክትትል",
      siteSubtitle: "ቀውሱን መመዝገብ። የፍትሕና የእርዳታ ጥሪን ማሰማት።",
      home: "መነሻ",
      news: "ዜና እና ወቅታዊ",
      blog: "ብሎግ",
      action: "እርምጃ ይውሰዱ",
      donate: "ይርዱ",
      learn: "ይማሩ",
      about: "ስለ እኛ",
      menu: "ማውጫ",
      close: "ዝጋ",
      startHere: "ከዚህ ይጀምሩ",
      verifiedReports: "የተረጋገጡ ዘገባዎች",
      opinionReflect: "ግላዊ አስተያየቶች",
      petitionsLetters: "አቤቱታዎች እና ደብዳቤዎች",
      gofundmeSub: "የGoFundMe እርዳታ",
      historyRegions: "ታሪክ እና ክልሎች",
      whoWeAre: "እኛ ማን ነን",
      donateBtn: "ይርዱ",
      langSwitch: "English",
      themeDark: "ጨለማ ሁነታ",
      themeLight: "ብርሃን ሁነታ",

      /* Hero */
      heroTitle: "ቀውሱን መመዝገብ። የፍትሕና የእርዳታ ጥሪን ማሰማት።",
      heroLede: "በኢትዮጵያ በግጭትና በዓመፅ ለተጎዱ ወገኖች የተረጋገጡ መረጃዎች፣ አቤቱታዎች እና የእርዳታ ማሰባሰቢያዎች።",
      signPetition: "አቤቱታ ይፈርሙ",
      writeCongress: "ለተወካይዎ ይጻፉ",
      donateNow: "ይርዱ",
      learnHistory: "ታሪኩን ይወቁ",
      activeFundraiser: "ወቅታዊ የእርዳታ ጥሪ",
      whereMoneyGoes: "የገንዘቡ አጠቃቀም ዝርዝር",
      actFiveMin: "በአምስት ደቂቃ ውስጥ እርምጃ ይውሰዱ",
      tellThree: "ለሶስት ሰዎች ዛሬ ያጋሩ",
      tellThreeSub: "አብዛኛዎቹ አንባቢዎቻችን ድረ-ገጻችንን የሚያገኙት በወዳጆቻቸው አማካኝነት ነው።",
      copySiteLink: "የድረ-ገጹን ማስፈንጠሪያ ቅዳ",
      howWeVerify: "መረጃዎችን እንዴት እናረጋግጣለን?",
      trust1Title: "እያንዳንዱ ዘገባ ምንጭ አለው",
      trust1Text: "ዘገባዎች ከተመድ ኤጀንሲዎች፣ ከሰብዓዊ መብት ተሟጋቾች እና ከታወቁ መገናኛ ብዙኃን ጋር የተገናኙ ናቸው። ያልተረጋገጡ ዘገባዎች 'በማጣራት ላይ' ተብለው ይገለጻሉ።",
      trust2Title: "የምስክሮች ደህንነት የተጠበቀ ነው",
      trust2Text: "የተጎጂዎች ስሞች፣ ፊቶች እና ትክክለኛ አድራሻዎች ከመታተማቸው በፊት ለደህንነታቸው ሲባል ይሰረዛሉ።",
      trust3Title: "እርዳታዎች የሚሰበሰቡት በGoFundMe በኩል ነው",
      trust3Text: "ክፍያዎች የሚፈጸሙት በGoFundMe አስተማማኝ ስርዓት በኩል ነው። የእርስዎን የካርድ መረጃ እኛ አንይዝም።",

      /* Stats & counters */
      updatesCountMonth: "በዚህ ወር የወጡ ዘገባዎች",
      openPetitionsCount: "ክፍት አቤቱታዎች",
      activeFundraisersCount: "ንቁ የእርዳታ ማሰባሰቢያዎች",

      /* Map */
      mapTitle: "የክልሎች የቀውስ ካርታ",
      mapSub: "የተረጋገጡ መረጃዎችን እና የሰብዓዊ ሁኔታዎችን ለማየት ክልሉን ይጫኑ።",
      regionalFocus: "የክልሉ ወቅታዊ ሁኔታ",
      verifiedUpdates: "የተረጋገጠ ዘገባ",
      filterNewsFor: "የዚህን ክልል ዜና ብቻ አሳይ",

      /* News & Updates */
      newsHead: "በአገሪቱ ምን እየተከሰተ ነው? (የተረጋገጠ)",
      newsSub: "አዳዲሶች ቀድመው ይቀርባሉ። እያንዳንዱ ዘገባ ምንጩን ያሳያል። በማጣራት ላይ ያሉ መረጃዎች 'በማጣራት ላይ' ተብለው ምልክት ይደረግባቸዋል።",
      searchPlaceholder: "ዘገባዎችን በክልል ወይም በቁልፍ ቃል ይፈልጉ...",
      all: "ሁሉም",
      verified: "የተረጋገጠ",
      developing: "በማጣራት ላይ",
      breaking: "ሰበር ዜና",
      update: "ወቅታዊ መረጃ",
      account: "የአይን እማኝ ምስክርነት",
      actionTag: "እርምጃ",
      opinion: "አስተያየት",
      sources: "ምንጮች",
      shareUpdate: "ይህንን መረጃ ያጋሩ",
      copyLink: "ማስፈንጠሪያውን ቅዳ",
      allUpdates: "ሁሉም ዘገባዎች",
      safetyNotice: "የተጎጂዎችን ደህንነት ለመጠበቅ ሲባል ስሞች፣ ፊቶች እና ትክክለኛ ቦታዎች ከዚህ ዘገባ ተሰርዘዋል።",
      takeNextStep: "ቀጣዩን እርምጃ ይውሰዱ",
      viewAllReports: "ሁሉንም ይመልከቱ",
      latestVerified: "የቅርብ ጊዜ የተረጋገጡ መረጃዎች",
      today: "ዛሬ",
      yesterday: "ትናንት",
      daysAgo: "ቀናት በፊት",
      noMatch: "ምንም የሚዛመድ ዘገባ አልተገኘም።",
      noMatchSub: "ሌላ ክልል ይምረጡ ወይም ፍለጋውን ያጽዱ።",
      comingSoon: "የተረጋገጡ መረጃዎች በቅርቡ ይቀርባሉ።",
      comingSoonSub: "በኢሜይል እንዲደርስዎት ከታች ይመዝገቡ፣ ወይም እስከዚያው ብሎጉን ያንብቡ።",

      /* Blog */
      blogTitle: "ትንታኔ እና ግላዊ አስተያየቶች",
      blogSub: "ከተሳታፊ ጸሐፊዎቻችን የተሰበሰቡ ግላዊ አስተያየቶች እና ትንታኔዎች፤ ከተረጋገጠው ዜና ተለይተው የቀረቡ።",
      like: "ወድጄዋለሁ",
      dislike: "አልወደድኩትም",
      speakToYou: "ይህ ጽሑፍ ምን ስሜት ፈጠረብዎ?",
      haveMoreToSay: "ተጨማሪ አስተያየት አለዎት?",
      emailOpinion: "አስተያየትዎን በኢሜይል ይላኩልኝ",
      emailOpinionSub: "አስተያየትዎን በኢሜይል ይላኩ። እያንዳንዱን መልእክት አነባለሁ። ያለእርስዎ ፈቃድ ምንም ነገር አይታተምም።",
      copyEmail: "የኢሜይል አድራሻ ቅዳ",
      sharePost: "ይህንን ጽሑፍ ያጋሩ",
      noPostsYet: "እስካሁን ምንም ጽሑፍ አልተለጠፈም።",
      loadingPosts: "ጽሑፎች በመጫን ላይ ናቸው…",

      /* Take Action & Letter Builder */
      actionHead: "በሁለት ቀላል እርምጃዎች የሰላም ድምፅ ይሁኑ",
      actionSub: "አቤቱታዎችን ይፈርሙ፣ ለተወካይዎ ይጻፉ፣ እና ማህበረሰብዎን ያንቁ።",
      step1: "አቤቱታ ይፈርሙ",
      step1Desc: "የእርዳታ መተላለፊያ መንገዶች እንዲከፈቱ እና ንጹሃን እንዲጠበቁ ይጠይቁ።",
      step2: "ለተወካይዎ ይጻፉ",
      step2Desc: "ለአሜሪካ ኮንግረስ፣ ለእንግሊዝ፣ ለካናዳ ወይም ለአውሮፓ ህብረት ፓርላማ ደብዳቤዎን ያዘጋጁ።",
      step3: "ለሶስት ሰዎች ያጋሩ",
      step3Desc: "እያንዳንዱ መጋራት ፍትሕ እንዲሰፍን የሚጠይቀውን ህብረት ያሰፋዋል።",
      openPetitions: "ክፍት አቤቱታዎች",
      signOn: "ይፈርሙ በ",
      writeYourRep: "ለህዝብ ተወካይዎ ይጻፉ",
      letterJurisdiction: "በአሜሪካ፣ በእንግሊዝ፣ በካናዳ እና በአውሮፓ ህብረት ለሚኖሩ ዜጎች ያገለግላል።",
      yourGov: "የሚኖሩበት ሀገር / ፓርላማ",
      fullName: "ሙሉ ስምዎ",
      keyDemand: "ዋነኛ የፖሊሲ ጥያቄ",
      personalNote: "የግል መልእክት ያክሉ (አማራጭ)",
      personalHint: "የግል መልእክት የታከለባቸው ደብዳቤዎች በተወካዮች ዘንድ በ4 እጥፍ የላቀ ትኩረት ያገኛሉ።",
      localDataNotice: "መረጃዎ በራስዎ ስልክ ወይም ኮምፒውተር ላይ ብቻ ይቀራል። ወደ እኛ ሰርቨር የሚላክ ምንም ነገር የለም።",
      copyLetter: "ደብዳቤውን ቅዳ",
      pasteInstruction: "ደብዳቤውን ከቀዱ በኋላ በተወካይዎ ይፋዊ ድረ-ገጽ የህዝብ አስተያየት ሳጥን ውስጥ ይለጥፉት።",
      shareAction: "እርምጃ ይውሰዱን ያጋሩ",
      letterCopied: "ደብዳቤው ተቀድቷል! በተወካይዎ የኮንቲቱየንት ገጽ ላይ ይለጥፉት።",

      /* Donate */
      donateHead: "ለተጎዱ ወገኖች ቀጥተኛ የሰብዓዊ እርዳታ",
      donateSub: "እያንዳንዱ የእርዳታ ማሰባሰቢያ በGoFundMe በኩል የሚካሄድ ሲሆን፣ የተሟላ ግልጽነትና ጥበቃ ያለው ነው።",
      raisedOf: "ከተፈለገው",
      goal: "ግብ",
      funded: "ተሳክቷል",
      donors: "ለጋሾች",
      asOf: "እስከ",
      donateGfm: "በGoFundMe ይርዱ",
      copyCampaignLink: "የእርዳታውን ማስፈንጠሪያ ቅዳ",
      whereMoneyGoesHead: "የገንዘቡ አጠቃቀም ዝርዝር",
      progressUpdates: "የእርዳታ አሰጣጥ ሂደት ዜናዎች",
      cantGive: "አሁን መርዳት አይችሉም?",
      cantGiveSub: "መረጃውን ለሌሎች ማጋራት እኩል ዋጋ አለው። አብዛኛው እርዳታ የሚገኘው በጓደኞች መጋራት አማካኝነት ነው።",
      shareDonate: "በኢትዮጵያ የሚደረገውን የድንገተኛ አደጋ እርዳታ ይደግፉ:",
      gfmFeeNote: "ክፍያውን የሚያጠናቅቁት በGoFundMe አስተማማኝ ስርዓት ላይ ነው። የመድረክ ክፍያ 0% ነው።",
      taxNote: "የግል GoFundMe ማሰባሰቢያዎች በአብዛኛው ከቀረጥ ነፃ አይደሉም። ዝርዝሩን በዘመቻው ገጽ ይመልከቱ።",
      organizedBy: "አስተባባሪ:",
      otherCampaigns: "ሌሎች የተረጋገጡ የእርዳታ ጥሪዎች",

      /* Learn */
      learnHead: "የቀውሱን መነሻ ምክንያቶችና ዳራ ይረዱ",
      learnSub: "ስለ ክልላዊ ሁኔታዎች፣ ታሪካዊ ክስተቶች እና የመረጃ አጠቃቀም የተዘጋጁ አጠቃላይ መመሪያዎች።",
      timelineHead: "ዋና ዋና ታሪካዊ ክስተቶች",
      regionsCommunities: "ክልሎች እና ማህበረሰቦች",
      educationalGuides: "የትምህርታዊ ጽሑፎች እና ገላጭ መመሪያዎች",
      emergencyContacts: "የአደጋ ጊዜ ስልኮች እና የሰብዓዊ እርዳታ ተቋማት",
      reputableSources: "የምንጠቀምባቸው ታማኝ የመረጃ ምንጮች",
      readGuide: "መመሪያውን ያንብቡ →",
      officialLink: "ይፋዊ ድረ-ገጽ",
      allArticles: "ሁሉም ጽሑፎችና መመሪያዎች",

      /* About & Contact */
      aboutHead: "ይህንን ድረ-ገጽ የሚያስተዳድረው ማን ነው? ለምንስ?",
      aboutText1: "የኢትዮጵያ ቀውስ ክትትል በዲያስፖራ አባሏ ሶልያና ሽፈራው እና በበጎ ፈቃደኛ ተመራማሪዎች የሚመራ ገለልተኛ መድረክ ነው። የተረጋገጡ ዘገባዎችን በማሰባሰብ ለዓለም አቀፉ ማህበረሰብ ያቀርባል፤ ትኩረትንም ወደ ተጨባጭ እርዳታና የፍትሕ ጥሪ ይቀይራል።",
      aboutText2: "ከየትኛውም መንግስት፣ የፖለቲካ ድርጅት ወይም ታጣቂ ቡድን ጋር ምንም አይነት ግንኙነት የለንም። ስህተቶች ሲኖሩም ወዲያውኑ በግልጽ እናርማለን።",
      shareSafely: "የአይን እማኝ መረጃን በደህንነት ስለማጋራት",
      shareSafelyDesc: "ሌሎች ሊደርሱበት የማይችሉትን የግል ስልክ ወይም ኮምፒውተር ይጠቀሙ። በመጀመሪያው መልእክትዎ ላይ የቤተሰብ ስሞችን ወይም ተጋላጭ የሆኑ የገጠር መንደሮችን አይጥቀሱ። ስሞች፣ ፊቶች እና መለያዎች ከመታተማቸው በፊት በጥብቅ ይሰረዛሉ። ያለእርስዎ ፈቃድ ምንም አይታተምም።",
      contactUs: "ያነጋግሩን",
      whatIsThisAbout: "ጉዳዩ ምንድን ነው?",
      namePseudonym: "ስም (የመጠሪያ ስም ወይም የብዕር ስም መጠቀም ይቻላል)",
      email: "ኢሜይል",
      message: "መልእክት",
      sendMessage: "መልእክት ላክ",
      sending: "በመላክ ላይ…",
      sentSuccess: "መልእክትዎ ደርሷል። በአብዛኛው በሁለት ቀናት ውስጥ ምላሽ እንሰጣለን።",
      followSubscribe: "ይከተሉን እና ይመዝገቡ",
      directContact: "ቀጥተኛ አድራሻ:",

      /* Newsletter & Footer */
      nlTitle: "የተረጋገጡ መረጃዎችን በኢሜይልዎ ያግኙ",
      nlSub: "በሳምንት አንድ ጊዜ፣ እንዲሁም አፋጣኝ እርዳታ የሚያስፈልጉ ጉዳዮች ሲኖሩ ብቻ የሚላክ። በማንኛውም ጊዜ ማቋረጥ ይችላሉ።",
      subscribe: "ይመዝገቡ",
      subscribing: "በመመዝገብ ላይ…",
      subscribed: "ተመዝግበዋል! እባክዎ ኢሜይልዎን ያረጋግጡ።",
      siteSection: "ገጾች",
      followSection: "ይከተሉን",
      safetySection: "የእርስዎ ደህንነት",
      safetyFootText: "የተጎጂዎችን ደህንነት ለመጠበቅ ስሞች፣ ፊቶች እና አካባቢዎች ከመታተማቸው በፊት ይሰረዛሉ።",
      safeShareLink: "በደህንነት እንዴት እንደሚጋራ",
      gfmNoticeFoot: "እርዳታዎች የሚሰበሰቡት በGoFundMe በኩል ነው። የእርስዎን የካርድ መረጃ እኛ አናይም።",
      rssFeed: "የRSS ዜና ማስተላለፊያ",
      lastUpdated: "የመጨረሻ ማሻሻያ",
      takeActionFoot: "እርምጃ ይውሰዱ"
    }
  }
};
