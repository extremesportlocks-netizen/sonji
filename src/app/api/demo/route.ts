import { NextRequest, NextResponse } from "next/server";

const firstNames = ["Emma","Liam","Olivia","Noah","Ava","James","Sophia","William","Isabella","Mason","Mia","Ethan","Charlotte","Alexander","Amelia","Michael","Harper","Benjamin","Evelyn","Daniel","Sarah","David","Jessica","Chris","Nicole","Rachel","Marcus","Jasmine","Tyler","Laura","Kevin","Monica","Andrew","Samantha","Ryan","Amanda"];
const lastNames = ["Johnson","Smith","Williams","Brown","Jones","Garcia","Miller","Davis","Rodriguez","Martinez","Lopez","Wilson","Anderson","Thomas","Taylor","Moore","Jackson","Martin","Lee","Perez","Thompson","White","Harris","Clark","Lewis","Walker","Young","Allen","King","Wright"];

function rn() { return { f: firstNames[Math.floor(Math.random()*firstNames.length)], l: lastNames[Math.floor(Math.random()*lastNames.length)] }; }
function re(f:string,l:string) { return `${f.toLowerCase()}.${l.toLowerCase()}@${["gmail.com","yahoo.com","outlook.com","icloud.com"][Math.floor(Math.random()*4)]}`; }
function rb(a:number,b:number) { return Math.floor(Math.random()*(b-a+1))+a; }

function genContacts(count:number, plans:string[]) {
  return Array.from({length:count},(_,i)=>{
    const n=rn(); const ltv=Math.random()<.15?rb(500,8000):Math.random()<.4?rb(200,499):Math.random()<.7?rb(20,199):0;
    const purchases=ltv>500?rb(5,30):ltv>200?rb(2,8):ltv>0?rb(1,3):0;
    const daysSince=ltv>0?(Math.random()<.3?rb(0,30):Math.random()<.6?rb(31,120):rb(121,400)):0;
    const subStatus=Math.random()<.25?"active":Math.random()<.5?"canceled":Math.random()<.7?"one-time":"never";
    const tags:string[]=[];if(ltv>=500)tags.push("Whale");else if(ltv>=200)tags.push("Mid-Tier");else if(ltv>0)tags.push("Low-Tier");if(subStatus==="active")tags.push("Active Subscriber");if(subStatus==="canceled")tags.push("Lapsed");
    return{id:`demo-${i}`,firstName:n.f,lastName:n.l,email:re(n.f,n.l),status:subStatus==="active"||daysSince<30?"active":ltv>0?"inactive":"lead",ltv,purchases,daysSince,subStatus,plan:plans[Math.floor(Math.random()*plans.length)]||"",tags,customFields:{ltv,purchaseCount:purchases,subscriptionStatus:subStatus,daysSinceLastPurchase:daysSince}};
  }).sort((a:any,b:any)=>b.ltv-a.ltv);
}

const IND: Record<string,any> = {
  health_wellness:{name:"Glow Med Spa",icon:"♥",plans:["Botox Monthly","IV Therapy Package","Weight Loss Program","Facial Membership"],
    pipeline:[{s:"Inquiry",c:"#818CF8",n:24},{s:"Consultation Booked",c:"#6366F1",n:18},{s:"Treatment Plan",c:"#F59E0B",n:12},{s:"Payment Collected",c:"#10B981",n:8},{s:"In Treatment",c:"#06B6D4",n:35},{s:"Follow-up",c:"#8B5CF6",n:15}],
    cc:847,rev:284500,ao:385,subs:{active:124,canceled:67,"one-time":312,never:344},bk:{whale:45,mid:128,low:198,zero:476},
    sb:["Revenue This Month","Active Patients","Consultations Booked","Treatments Pending","Avg Revenue/Patient"]},
  fitness_gym:{name:"Iron Republic Fitness",icon:"💪",plans:["Monthly Unlimited","Annual Membership","10-Class Pack","PT Sessions"],
    pipeline:[{s:"Lead",c:"#818CF8",n:32},{s:"Trial Booked",c:"#6366F1",n:19},{s:"Trial Completed",c:"#F59E0B",n:14},{s:"Membership Offered",c:"#F97316",n:9},{s:"Active Member",c:"#10B981",n:312},{s:"At Risk",c:"#EF4444",n:28}],
    cc:1245,rev:189000,ao:79,subs:{active:312,canceled:145,"one-time":89,never:699},bk:{whale:28,mid:89,low:342,zero:786},
    sb:["Active Members","New Signups","Revenue This Month","Avg Visits/Week","At-Risk Members"]},
  beauty_salon:{name:"Luxe Beauty Studio",icon:"✂",plans:["Blowout Membership","Color Package","Lash Monthly","VIP All-Access"],
    pipeline:[{s:"New Client",c:"#818CF8",n:18},{s:"Booked",c:"#6366F1",n:34},{s:"Served",c:"#10B981",n:156},{s:"Rebooking Window",c:"#F59E0B",n:89},{s:"Loyal Regular",c:"#8B5CF6",n:201},{s:"Lapsed",c:"#EF4444",n:67}],
    cc:623,rev:167200,ao:95,subs:{active:201,canceled:67,"one-time":198,never:157},bk:{whale:34,mid:98,low:245,zero:246},
    sb:["Revenue This Month","Appointments Today","Rebooking Rate","Clients Due","Reviews"]},
  agency_consulting:{name:"Power Marketing Agency",icon:"🏢",plans:["Starter Retainer $2K","Growth Retainer $5K","Enterprise $10K","Project-Based"],
    pipeline:[{s:"Discovery",c:"#818CF8",n:8},{s:"Proposal Sent",c:"#6366F1",n:5},{s:"Negotiation",c:"#F59E0B",n:3},{s:"Contract Signed",c:"#10B981",n:2},{s:"Onboarding",c:"#06B6D4",n:2},{s:"Active Client",c:"#8B5CF6",n:15},{s:"Renewal",c:"#F97316",n:4}],
    cc:234,rev:512000,ao:4750,subs:{active:15,canceled:8,"one-time":45,never:166},bk:{whale:12,mid:18,low:34,zero:170},
    sb:["Monthly Recurring Revenue","Active Retainers","Pipeline Value","Proposals Out","Avg Retainer"]},
  real_estate:{name:"Summit Realty Group",icon:"🏠",plans:["Buyer Rep","Seller Listing","Dual Agency","Commercial","Property Mgmt"],
    pipeline:[{s:"Lead",c:"#818CF8",n:42},{s:"Contacted",c:"#6366F1",n:28},{s:"Showing Scheduled",c:"#F59E0B",n:15},{s:"Offer Submitted",c:"#F97316",n:6},{s:"Under Contract",c:"#10B981",n:4},{s:"Closed",c:"#8B5CF6",n:23},{s:"Past Client",c:"#06B6D4",n:189}],
    cc:892,rev:892000,ao:12500,subs:{active:4,canceled:23,"one-time":189,never:676},bk:{whale:23,mid:45,low:121,zero:703},
    sb:["Active Leads","Showings This Week","Pipeline Volume","Closed This Month","Commission YTD"]},
  home_services:{name:"Apex Roofing & HVAC",icon:"🔧",plans:["Roof Repair","Full Replacement","HVAC Tune-Up","Emergency","Maintenance Plan"],
    pipeline:[{s:"Estimate Requested",c:"#818CF8",n:22},{s:"Site Visit",c:"#6366F1",n:14},{s:"Estimate Sent",c:"#F59E0B",n:18},{s:"Follow-up",c:"#F97316",n:8},{s:"Job Booked",c:"#10B981",n:6},{s:"Completed",c:"#8B5CF6",n:145}],
    cc:534,rev:478000,ao:3200,subs:{active:45,canceled:12,"one-time":145,never:332},bk:{whale:18,mid:42,low:85,zero:389},
    sb:["Revenue This Month","Estimates Pending","Jobs Scheduled","Close Rate","Avg Job Value"]},
  legal:{name:"Sterling Law Group",icon:"⚖",plans:["Hourly","Flat Fee","Retainer","Contingency","Corporate Counsel"],
    pipeline:[{s:"Inquiry",c:"#818CF8",n:15},{s:"Consultation Scheduled",c:"#6366F1",n:8},{s:"Consultation Done",c:"#F59E0B",n:6},{s:"Engagement Sent",c:"#F97316",n:4},{s:"Retained",c:"#10B981",n:18},{s:"Case Closed",c:"#8B5CF6",n:67}],
    cc:345,rev:634000,ao:5800,subs:{active:18,canceled:67,"one-time":124,never:136},bk:{whale:22,mid:38,low:64,zero:221},
    sb:["Active Cases","Consultations","Pipeline Value","Revenue This Month","Avg Retainer"]},
  coaching_education:{name:"Elevate Coaching Co.",icon:"🎓",plans:["1:1 Coaching","Group Program","VIP Day","Online Course","Mastermind"],
    pipeline:[{s:"Lead",c:"#818CF8",n:89},{s:"Application",c:"#6366F1",n:24},{s:"Discovery Call",c:"#F59E0B",n:12},{s:"Call Completed",c:"#F97316",n:8},{s:"Enrolled",c:"#10B981",n:34},{s:"Alumni",c:"#8B5CF6",n:156}],
    cc:456,rev:389000,ao:2500,subs:{active:34,canceled:56,"one-time":156,never:210},bk:{whale:28,mid:45,low:83,zero:300},
    sb:["Active Clients","Revenue This Month","Applications","Discovery Calls","Completion Rate"]},
  restaurant_food:{name:"The Copper Table",icon:"🍽",plans:["Loyalty Member","Catering Package","Private Event","Meal Prep","Gift Card"],
    pipeline:[{s:"New Customer",c:"#818CF8",n:45},{s:"Return Visitor",c:"#6366F1",n:134},{s:"Regular",c:"#10B981",n:89},{s:"Catering Lead",c:"#F59E0B",n:6},{s:"Catering Booked",c:"#8B5CF6",n:3},{s:"Lapsed",c:"#EF4444",n:234}],
    cc:1890,rev:156000,ao:42,subs:{active:89,canceled:234,"one-time":645,never:922},bk:{whale:12,mid:45,low:312,zero:1521},
    sb:["Revenue This Week","New Customers","Repeat Rate","Catering Pipeline","Reviews"]},
  automotive:{name:"Precision Auto Works",icon:"🚗",plans:["Oil Change","Full Service","Brake Package","Tire Package","Maintenance Plan"],
    pipeline:[{s:"Lead",c:"#818CF8",n:12},{s:"Estimate Given",c:"#6366F1",n:18},{s:"Scheduled",c:"#F59E0B",n:8},{s:"In Service",c:"#F97316",n:4},{s:"Completed",c:"#10B981",n:234},{s:"Maintenance Due",c:"#8B5CF6",n:145}],
    cc:678,rev:342000,ao:420,subs:{active:145,canceled:34,"one-time":234,never:265},bk:{whale:15,mid:56,low:234,zero:373},
    sb:["Revenue This Month","Services Done","Estimates Pending","Maintenance Due","Avg Repair Order"]},
  nonprofit:{name:"Harbor Community Foundation",icon:"💚",plans:["Monthly Donor","Annual Supporter","Major Gift","Corporate Partner","Volunteer"],
    pipeline:[{s:"Prospect",c:"#818CF8",n:67},{s:"Contacted",c:"#6366F1",n:34},{s:"First Gift",c:"#10B981",n:23},{s:"Repeat Donor",c:"#8B5CF6",n:89},{s:"Major Donor",c:"#F97316",n:12},{s:"Lapsed",c:"#EF4444",n:156}],
    cc:1234,rev:187000,ao:125,subs:{active:89,canceled:156,"one-time":234,never:755},bk:{whale:12,mid:34,low:234,zero:954},
    sb:["Donations This Month","Active Donors","Retention Rate","Avg Gift","Lapsed to Re-engage"]},
  ecommerce:{name:"ESL Sports (Live Data)",icon:"🛒",plans:["Daily","Weekly","Monthly","3-Month","VIP Yearly"],
    pipeline:[{s:"Subscriber",c:"#818CF8",n:456},{s:"First Purchase",c:"#6366F1",n:234},{s:"Repeat",c:"#10B981",n:189},{s:"VIP",c:"#8B5CF6",n:78},{s:"Win-Back",c:"#F59E0B",n:312},{s:"Churned",c:"#EF4444",n:564}],
    cc:4075,rev:840796,ao:116,subs:{active:94,canceled:1243,"one-time":1578,never:1160},bk:{whale:371,mid:456,low:812,zero:2436},
    sb:["Revenue","Total Contacts","Active Subscribers","Whales","Avg LTV"],isReal:true},
};

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("industry") || "health_wellness";
  const ind = IND[key];
  if (!ind) return NextResponse.json({ error: "Unknown industry" }, { status: 400 });

  const contacts = ind.isReal ? [] : genContacts(20, ind.plans);
  const top5 = contacts.slice(0,5).map((c:any)=>({id:c.id,name:`${c.firstName} ${c.lastName}`,email:c.email,ltv:c.ltv,purchases:c.purchases,subStatus:c.subStatus}));
  const pipeDeals = ind.pipeline.reduce((s:number,p:any)=>s+p.n,0);
  const activeStages = ["Inquiry","Lead","Trial Booked","Trial Completed","Membership Offered","New Client","Booked","Rebooking Window","Discovery","Proposal Sent","Negotiation","Contract Signed","Onboarding","Contacted","Showing Scheduled","Offer Submitted","Under Contract","Estimate Requested","Site Visit","Estimate Sent","Follow-up","Consultation Scheduled","Consultation Done","Consultation Booked","Engagement Sent","Treatment Plan","Payment Collected","In Treatment","Application","Discovery Call","Call Completed","Catering Lead","Estimate Given","Scheduled","In Service","Prospect","At Risk","Renewal","Maintenance Due"];
  const wonStages = ["Active Member","Served","Loyal Regular","Active Client","Retained","Enrolled","Closed","Completed","Job Booked","Regular","Repeat Donor","Major Donor","Payment Collected","In Treatment","First Gift","Return Visitor","Catering Booked"];

  return NextResponse.json({ ok:true, isDemo:!ind.isReal, industry:key, industryName:ind.name, industryIcon:ind.icon, sonjiBoxDefaults:ind.sb,
    data:{
      totalContacts:ind.cc,
      totalDeals:pipeDeals,
      activeDeals:ind.pipeline.filter((p:any)=>activeStages.includes(p.s)).reduce((s:number,p:any)=>s+p.n,0),
      wonDeals:ind.pipeline.filter((p:any)=>wonStages.includes(p.s)).reduce((s:number,p:any)=>s+p.n,0),
      totalTasks:rb(12,45),openTasks:rb(5,18),
      recentContacts:contacts.slice(0,6),
      statusBreakdown:[{status:"active",count:Math.round(ind.cc*.3)},{status:"inactive",count:Math.round(ind.cc*.45)},{status:"lead",count:Math.round(ind.cc*.25)}],
      sourceBreakdown:[{source:"google",count:Math.round(ind.cc*.35)},{source:"referral",count:Math.round(ind.cc*.25)},{source:"instagram",count:Math.round(ind.cc*.2)},{source:"direct",count:Math.round(ind.cc*.15)}],
      revenue:{total:ind.rev,totalPurchases:Math.round(ind.rev/ind.ao),avgLTV:Math.round(ind.rev/(ind.cc*.6)),avgOrder:ind.ao,contactsWithPurchases:Math.round(ind.cc*.6)},
      ltvBuckets:ind.bk,subscriptionBreakdown:ind.subs,topCustomers:top5,pipeline:ind.pipeline.map((p:any)=>({stage:p.s,color:p.c,count:p.n})),
      tenantName:ind.name,tenantSlug:key,
    }});
}
