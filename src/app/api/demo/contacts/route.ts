import { NextRequest, NextResponse } from "next/server";

const firstNames = ["Emma","Liam","Olivia","Noah","Ava","James","Sophia","William","Isabella","Mason","Mia","Ethan","Charlotte","Alexander","Amelia","Michael","Harper","Benjamin","Evelyn","Daniel","Sarah","David","Jessica","Chris","Nicole","Rachel","Marcus","Jasmine","Tyler","Laura","Kevin","Monica","Andrew","Samantha","Ryan","Amanda","Brandon","Ashley","Nathan","Melissa"];
const lastNames = ["Johnson","Smith","Williams","Brown","Jones","Garcia","Miller","Davis","Rodriguez","Martinez","Lopez","Wilson","Anderson","Thomas","Taylor","Moore","Jackson","Martin","Lee","Perez","Thompson","White","Harris","Clark","Lewis","Walker","Young","Allen","King","Wright"];

function rb(a:number,b:number){return Math.floor(Math.random()*(b-a+1))+a;}

const PLANS: Record<string,string[]> = {
  health_wellness:["Botox Monthly","IV Therapy","Weight Loss Program","Facial Membership","Wellness Annual"],
  fitness_gym:["Monthly Unlimited","Annual Membership","10-Class Pack","PT Sessions","Student Monthly"],
  beauty_salon:["Blowout Membership","Color Package","Lash Monthly","VIP All-Access","Bridal"],
  agency_consulting:["Starter $2K/mo","Growth $5K/mo","Enterprise $10K/mo","Project-Based","White Label"],
  real_estate:["Buyer Rep","Seller Listing","Dual Agency","Property Mgmt","Commercial"],
  home_services:["Roof Repair","Full Replacement","HVAC Tune-Up","Emergency","Maintenance Plan"],
  legal:["Hourly","Flat Fee","Retainer","Contingency","Corporate Counsel"],
  coaching_education:["1:1 Coaching","Group Program","VIP Day","Online Course","Mastermind"],
  restaurant_food:["Loyalty Member","Catering","Private Event","Meal Prep","Gift Card"],
  automotive:["Oil Change","Full Service","Brake Package","Tire Package","Maintenance Plan"],
  nonprofit:["Monthly Donor","Annual Supporter","Major Gift","Corporate Partner","Volunteer"],
  ecommerce:["Daily","Weekly","Monthly","3-Month","VIP Yearly"],
};

const TAGS: Record<string,string[][]> = {
  health_wellness:[["Botox Client"],["IV Therapy"],["Weight Loss"],["Follow-up Due"],["VIP Patient"]],
  fitness_gym:[["CrossFit"],["Yoga"],["Personal Training"],["Group Class"],["New Member"]],
  beauty_salon:[["Hair Color"],["Lashes"],["Nails"],["Bridal"],["Regular"]],
  agency_consulting:[["SEO Client"],["PPC"],["Social Media"],["Web Design"],["Full Stack"]],
  real_estate:[["First-Time Buyer"],["Seller"],["Investor"],["Relocation"],["Luxury"]],
  home_services:[["Roof"],["HVAC"],["Plumbing"],["Emergency"],["Maintenance"]],
  legal:[["Family Law"],["Criminal"],["Personal Injury"],["Business"],["Estate"]],
  coaching_education:[["1:1 Client"],["Group Member"],["Course Student"],["VIP"],["Alumni"]],
  restaurant_food:[["Regular"],["Catering"],["VIP Diner"],["Event"],["Takeout"]],
  automotive:[["Oil Change"],["Brake Job"],["Tire"],["Full Service"],["Fleet"]],
  nonprofit:[["Monthly Donor"],["Volunteer"],["Board Member"],["Corporate"],["Event Attendee"]],
  ecommerce:[["Whale"],["Mid-Tier"],["Low-Tier"],["Active Subscriber"],["Lapsed"]],
};

// Deterministic seed per industry so contacts don't change on every request
function seededRandom(seed: number) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

export async function GET(req: NextRequest) {
  const industry = req.nextUrl.searchParams.get("industry") || "health_wellness";
  const pageSize = parseInt(req.nextUrl.searchParams.get("pageSize") || "25");
  const pageNum = parseInt(req.nextUrl.searchParams.get("page") || "1");

  const plans = PLANS[industry] || PLANS.ecommerce;
  const tagSets = TAGS[industry] || TAGS.ecommerce;

  // Use industry string as seed for deterministic contacts
  let seedVal = 0;
  for (let i = 0; i < industry.length; i++) seedVal += industry.charCodeAt(i) * (i + 1);
  const rand = seededRandom(seedVal);

  const totalContacts = industry === "restaurant_food" ? 1890 : industry === "fitness_gym" ? 1245 : industry === "nonprofit" ? 1234 : industry === "real_estate" ? 892 : industry === "health_wellness" ? 847 : industry === "automotive" ? 678 : industry === "beauty_salon" ? 623 : industry === "home_services" ? 534 : industry === "coaching_education" ? 456 : industry === "legal" ? 345 : industry === "agency_consulting" ? 234 : 500;

  const allContacts = [];
  for (let i = 0; i < Math.min(totalContacts, 200); i++) {
    const fi = Math.floor(rand() * firstNames.length);
    const li = Math.floor(rand() * lastNames.length);
    const fn = firstNames[fi], ln = lastNames[li];
    const ltv = rand() < 0.15 ? Math.floor(rand() * 7500 + 500) : rand() < 0.4 ? Math.floor(rand() * 299 + 200) : rand() < 0.7 ? Math.floor(rand() * 179 + 20) : 0;
    const purchases = ltv > 500 ? Math.floor(rand() * 25 + 5) : ltv > 200 ? Math.floor(rand() * 6 + 2) : ltv > 0 ? Math.floor(rand() * 2 + 1) : 0;
    const daysSince = ltv > 0 ? (rand() < 0.3 ? Math.floor(rand() * 30) : rand() < 0.6 ? Math.floor(rand() * 89 + 31) : Math.floor(rand() * 279 + 121)) : 0;
    const subStatus = rand() < 0.25 ? "active" : rand() < 0.5 ? "canceled" : rand() < 0.7 ? "one-time" : "never";
    const status = subStatus === "active" || daysSince < 30 ? "active" : ltv > 0 ? "inactive" : "lead";
    const tags = [...(tagSets[Math.floor(rand() * tagSets.length)] || [])];
    if (ltv >= 500) tags.push("Whale"); else if (ltv >= 200) tags.push("Mid-Tier"); else if (ltv > 0) tags.push("Low-Tier");
    if (subStatus === "active") tags.push("Active Subscriber");
    if (subStatus === "canceled") tags.push("Lapsed");
    const plan = plans[Math.floor(rand() * plans.length)];
    const endDate = subStatus === "active" ? new Date(Date.now() + Math.floor(rand() * 365 * 86400000)).toISOString() : subStatus === "canceled" ? new Date(Date.now() - Math.floor(rand() * 180 * 86400000)).toISOString() : null;

    allContacts.push({
      id: `demo-${industry}-${i}`,
      firstName: fn, lastName: ln,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@${["gmail.com","yahoo.com","outlook.com","icloud.com"][Math.floor(rand()*4)]}`,
      phone: `(${Math.floor(rand()*900+100)}) ${Math.floor(rand()*900+100)}-${Math.floor(rand()*9000+1000)}`,
      company: "",
      status, tags, source: "demo",
      customFields: {
        ltv, purchaseCount: purchases, avgOrderValue: purchases > 0 ? Math.round(ltv/purchases) : 0,
        daysSinceLastPurchase: daysSince, subscriptionStatus: subStatus,
        subscriptionPlan: plan, subscriptionEnd: endDate,
        lastPurchaseDate: daysSince > 0 ? new Date(Date.now() - daysSince * 86400000).toISOString() : null,
      },
    });
  }

  // Sort by LTV desc
  allContacts.sort((a: any, b: any) => (b.customFields.ltv || 0) - (a.customFields.ltv || 0));

  const start = (pageNum - 1) * pageSize;
  const paged = allContacts.slice(start, start + pageSize);

  return NextResponse.json({
    ok: true,
    data: paged,
    meta: { total: totalContacts, page: pageNum, pageSize, totalPages: Math.ceil(totalContacts / pageSize) },
  });
}
