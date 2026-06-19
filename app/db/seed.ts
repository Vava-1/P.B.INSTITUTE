import { getDb } from "../api/queries/connection";
import {
  courses,
  testimonials,
  faqs,
  siteSettings,
  newsEvents,
  instructors,
  galleryItems,
  adminUsers,
} from "./schema";
import { eq, sql } from "drizzle-orm";
import { hashSync } from "bcryptjs";

async function seed() {
  const db = getDb();
  console.log("🌱 Starting seed...");

  // ─── SITE SETTINGS ───
  const existingSettings = await db.select().from(siteSettings).where(eq(siteSettings.id, "main"));
  if (existingSettings.length === 0) {
    await db.insert(siteSettings).values({
    id: "main",
    siteName: "Pacemaker Institute",
    tagline: "Empowering individuals with practical skills, language mastery, and professional knowledge to excel in today's competitive world.",
    phone: "+250 786 053 720",
    email: "info@pacemakerinstitute.rw",
    whatsapp: "+250786053720",
    address: "Centenary House, 8 KN 4 Ave, Kigali, Rwanda (3rd Floor)",
    openingHours: "Mon–Fri: 8:00 AM – 6:00 PM | Sat: 9:00 AM – 1:00 PM",
    announcementActive: true,
    announcementMessages: JSON.stringify([
      "📣 New intake starting soon — Enroll today to secure your spot!",
      "🎓 IELTS Prep Course — Next batch starts July 1st",
      "✂️ Salon & Bakery morning and evening classes now available",
      "🤖 AI Skills for Professionals — Weekend intensive available",
    ]),
    enrollmentOpen: true,
    academicCalendar: "Our academic year runs in quarterly intakes: January, April, July, and October. Each intake runs for 10-12 weeks with a 2-week break between sessions.",
    facebookUrl: "https://facebook.com/pacemakerinstitute",
    instagramUrl: "https://instagram.com/pacemakerinstitute",
    twitterUrl: "https://twitter.com/pacemakerinst",
    linkedinUrl: "https://linkedin.com/company/pacemaker-institute",
    youtubeUrl: "https://youtube.com/@pacemakerinstitute",
    seoTitleSuffix: "| Pacemaker Institute Kigali",
    seoDefaultDesc: "Professional training in Languages, Bakery, Salon, Mechanics, AI Skills and Private Candidate Support in Kigali, Rwanda.",
  });
    console.log("✅ Site settings seeded");
  } else {
    console.log("⏭️ Site settings already exist, skipping");
  }

  // ─── COURSES ───
  const courseData = [
    {
      slug: "languages-conversational",
      title: "Language Courses",
      category: "languages",
      languageSubType: "conversational",
      shortDesc: "Master French, English, Kiswahili, or German from beginner to advanced level.",
      description: "Our Language Department is the flagship of Pacemaker Institute. Whether you want conversational fluency or academic mastery, we offer structured courses in French, English, Kiswahili, and German at Beginner, Intermediate, and Advanced levels. Each level runs for 3 months with morning, afternoon, evening, and weekend schedules available. Our instructors are native or near-native speakers with years of teaching experience. At the end of each level, you receive a Pacemaker Language Certificate recognized by employers across Rwanda and East Africa.",
      whatYoullLearn: JSON.stringify([
        "Conversational fluency in your chosen language",
        "Grammar, writing, and reading comprehension",
        "Cultural context and business communication",
        "Listening skills through multimedia immersion",
        "Presentation and public speaking in the target language",
      ]),
      whoIsItFor: "Students, professionals, entrepreneurs, and anyone looking to learn a new language or improve existing skills for personal, academic, or career advancement.",
      modules: JSON.stringify([
        { title: "Foundation & Basics", description: "Alphabet, pronunciation, basic greetings, numbers, and everyday vocabulary", topics: ["Pronunciation", "Basic Grammar", "Vocabulary Building"] },
        { title: "Communication Skills", description: "Building sentences, asking questions, describing experiences, and everyday conversations", topics: ["Sentence Structure", "Question Formation", "Daily Conversations"] },
        { title: "Intermediate Fluency", description: "Complex grammar, reading comprehension, writing essays, and structured dialogues", topics: ["Advanced Grammar", "Essay Writing", "Reading Comprehension"] },
        { title: "Advanced Mastery", description: "Professional communication, presentations, debates, and cultural nuances", topics: ["Business Language", "Public Speaking", "Cultural Studies"] },
      ]),
      requirements: JSON.stringify(["No prior experience needed for Beginner level", "Pass previous level or placement test for Intermediate/Advanced", "Notebook and learning materials"]),
      careerOutcomes: JSON.stringify(["Translator", "Tourism Professional", "International Business Liaison", "Teacher", "Diplomatic Service"]),
      duration: "3 months per level",
      scheduleOptions: JSON.stringify(["Morning (8-10 AM)", "Afternoon (1-3 PM)", "Evening (5-7 PM)", "Weekend (Sat/Sun)"]),
      feeRwf: 150000,
      installmentAvailable: true,
      isFeatured: true,
      displayOrder: 1,
    },
    {
      slug: "language-test-prep",
      title: "Language Test Preparation",
      category: "languages",
      languageSubType: "test_prep",
      shortDesc: "Intensive coaching for IELTS, TOEFL, DELF, and Goethe-Zertifikat exams.",
      description: "Structured preparation for internationally recognized language certification exams. Our expert coaching includes practice tests, proven strategies, mock exams, and individual feedback to ensure you achieve the best possible score. We cover all sections of each exam: reading, writing, listening, and speaking.",
      whatYoullLearn: JSON.stringify([
        "Exam format and time management strategies",
        "Reading comprehension techniques for test conditions",
        "Writing task structures and scoring criteria",
        "Listening strategies and note-taking skills",
        "Speaking test practice with mock interviews",
      ]),
      whoIsItFor: "Students planning to study abroad, professionals seeking international certification, and anyone preparing for IELTS, TOEFL, DELF, or Goethe-Zertifikat exams.",
      modules: JSON.stringify([
        { title: "Exam Overview & Strategy", description: "Understanding the exam format, scoring system, and preparation timeline", topics: ["Test Format", "Scoring Criteria", "Study Plan"] },
        { title: "Reading Module", description: "Skimming, scanning, and detailed reading strategies for academic texts", topics: ["Reading Techniques", "Vocabulary for Exams", "Practice Tests"] },
        { title: "Writing Module", description: "Essay structures, task responses, and writing for specific exam formats", topics: ["Essay Writing", "Task Response", "Grammar for Writing"] },
        { title: "Listening Module", description: "Note-taking, prediction techniques, and listening under time pressure", topics: ["Listening Strategies", "Note-Taking", "Practice Tests"] },
        { title: "Speaking Module", description: "Fluency practice, pronunciation, and mock speaking tests", topics: ["Fluency Practice", "Mock Interviews", "Pronunciation"] },
      ]),
      requirements: JSON.stringify(["Intermediate level or above in target language", "Commitment to daily practice", "Registration for target exam recommended"]),
      careerOutcomes: JSON.stringify(["Study Abroad Candidate", "Certified Language Professional", "International Job Applicant", "Embassy/Consulate Worker"]),
      duration: "6-8 weeks intensive",
      scheduleOptions: JSON.stringify(["Evening (5-7 PM)", "Weekend Intensive"]),
      feeRwf: 135000,
      installmentAvailable: true,
      isFeatured: true,
      displayOrder: 2,
    },
    {
      slug: "bakery",
      title: "Bakery & Pastry",
      category: "bakery",
      shortDesc: "Turn your passion into profit. Learn baking from basics to advanced techniques.",
      description: "A hands-on baking and pastry program taught in a professional kitchen setting. Covers bread, cakes, pastries, decorating, food hygiene, and starting a bakery business in Rwanda. From basic dough techniques to elaborate cake decorating, this course gives you the practical skills to work in or run your own bakery.",
      whatYoullLearn: JSON.stringify([
        "Basic bread and dough techniques",
        "Cake baking and decorating (fondant, buttercream)",
        "Pastry making (croissants, puffs, tarts)",
        "Hygiene and food safety certification",
        "Business basics: costing, pricing, marketing your bakery",
      ]),
      whoIsItFor: "Aspiring bakers, culinary enthusiasts, entrepreneurs looking to start a bakery business, and anyone passionate about baking and pastry arts.",
      modules: JSON.stringify([
        { title: "Bread & Dough Fundamentals", description: "Yeast handling, kneading techniques, and classic bread varieties", topics: ["Yeast Science", "Kneading", "Classic Breads"] },
        { title: "Cake Baking", description: "Sponge cakes, layered cakes, chocolate cakes, and specialty cakes", topics: ["Sponge Cakes", "Layer Cakes", "Chocolate Work"] },
        { title: "Cake Decorating", description: "Buttercream piping, fondant covering, sugar flowers, and modern decorating techniques", topics: ["Buttercream Piping", "Fondant Work", "Sugar Flowers"] },
        { title: "Pastry Making", description: "Croissants, puff pastry, tarts, and savory pastries", topics: ["Laminated Dough", "Sweet Tarts", "Savory Pastries"] },
        { title: "Food Safety & Hygiene", description: "HACCP principles, kitchen safety, and food handling certification", topics: ["HACCP", "Kitchen Safety", "Food Handling"] },
        { title: "Bakery Business", description: "Costing, pricing, marketing, and launching your bakery in Rwanda", topics: ["Costing", "Pricing Strategy", "Marketing", "Business Launch"] },
      ]),
      requirements: JSON.stringify(["No prior baking experience needed", "Passion for food and creativity", "Basic math skills for measurements and costing"]),
      careerOutcomes: JSON.stringify(["Professional Baker", "Pastry Chef", "Catering Business Owner", "Bakery Owner", "Cake Designer"]),
      duration: "2 months",
      scheduleOptions: JSON.stringify(["Morning (8 AM - 12 PM)", "Afternoon (1-5 PM)"]),
      feeRwf: 175000,
      installmentAvailable: true,
      isFeatured: true,
      displayOrder: 3,
    },
    {
      slug: "salon",
      title: "Salon & Beauty",
      category: "salon",
      shortDesc: "Become a professional in hair, beauty, and personal care services.",
      description: "A comprehensive beauty and salon training program covering all aspects of professional hair and personal care services. Builds both practical skill and the business acumen to run a successful salon in Rwanda. Learn from experienced industry professionals in a fully equipped training salon.",
      whatYoullLearn: JSON.stringify([
        "Braiding, weaving, and natural hair care",
        "Chemical treatments (relaxers, perms, coloring)",
        "Skincare and facial treatments",
        "Nail care and manicure/pedicure",
        "Makeup artistry (bridal, casual, professional)",
        "Salon management and customer service",
      ]),
      whoIsItFor: "Aspiring beauticians, hair stylists, makeup artists, entrepreneurs looking to open a salon, and anyone passionate about beauty and personal care.",
      modules: JSON.stringify([
        { title: "Hair Care Fundamentals", description: "Hair types, scalp care, shampooing, conditioning, and basic styling", topics: ["Hair Types", "Scalp Care", "Basic Styling"] },
        { title: "Braiding & Weaving", description: "Cornrows, box braids, twists, wig installation, and weave techniques", topics: ["Cornrows", "Box Braids", "Weaving", "Wigs"] },
        { title: "Chemical Treatments", description: "Relaxers, texturizers, hair coloring, and perm techniques", topics: ["Relaxers", "Hair Coloring", "Perms", "Safety"] },
        { title: "Skincare & Facials", description: "Skin analysis, facial treatments, waxing, and body treatments", topics: ["Skin Analysis", "Facials", "Waxing"] },
        { title: "Nail Care", description: "Manicure, pedicure, gel nails, nail art, and hygiene", topics: ["Manicure", "Pedicure", "Nail Art", "Gel Nails"] },
        { title: "Makeup Artistry", description: "Bridal makeup, everyday looks, special effects, and color theory", topics: ["Bridal Makeup", "Color Theory", "Special Effects"] },
        { title: "Salon Management", description: "Customer service, booking systems, inventory, and business operations", topics: ["Customer Service", "Booking Systems", "Business Ops"] },
      ]),
      requirements: JSON.stringify(["No prior experience needed", "Good hand coordination", "Professional appearance and attitude"]),
      careerOutcomes: JSON.stringify(["Hair Stylist", "Makeup Artist", "Salon Owner", "Beauty Consultant", "Nail Technician", "Bridal Stylist"]),
      duration: "3 months",
      scheduleOptions: JSON.stringify(["Morning (8 AM - 12 PM)", "Afternoon (1-5 PM)"]),
      feeRwf: 175000,
      installmentAvailable: true,
      isFeatured: true,
      displayOrder: 4,
    },
    {
      slug: "mechanics",
      title: "Mechanics & Automotive",
      category: "mechanics",
      shortDesc: "Gain hands-on mechanical skills to build, repair, and innovate.",
      description: "A practical automotive and mechanical training program that prepares students for careers in vehicle repair, maintenance, and technical services. All training is workshop-based with real engines and equipment. Learn from certified mechanics with decades of industry experience.",
      whatYoullLearn: JSON.stringify([
        "Engine diagnosis and repair",
        "Electrical systems and wiring",
        "Brake systems and suspension",
        "Transmission and gearbox servicing",
        "Tyres and wheel alignment",
        "Preventive maintenance schedules",
      ]),
      whoIsItFor: "Aspiring mechanics, automotive enthusiasts, people seeking technical vocational skills, and those looking to start an auto repair business.",
      modules: JSON.stringify([
        { title: "Engine Fundamentals", description: "Engine components, operation principles, and basic troubleshooting", topics: ["Engine Components", "Operation", "Troubleshooting"] },
        { title: "Engine Diagnosis & Repair", description: "Diagnostic tools, common engine problems, and repair techniques", topics: ["Diagnostic Tools", "Engine Repairs", "Overhauling"] },
        { title: "Electrical Systems", description: "Wiring diagrams, battery systems, alternators, starters, and electronics", topics: ["Wiring", "Battery Systems", "Electronics"] },
        { title: "Brake & Suspension", description: "Disc and drum brakes, shock absorbers, springs, and steering components", topics: ["Brake Systems", "Suspension", "Steering"] },
        { title: "Transmission Service", description: "Manual and automatic gearbox servicing, clutch systems, and drivetrain", topics: ["Gearboxes", "Clutch", "Drivetrain"] },
        { title: "Tyres & Alignment", description: "Tyre fitting, balancing, wheel alignment, and tyre maintenance", topics: ["Tyre Fitting", "Balancing", "Alignment"] },
        { title: "Workshop Safety", description: "Tool management, workshop organization, and occupational safety", topics: ["Tool Safety", "Workshop Organization", "OSHA"] },
      ]),
      requirements: JSON.stringify(["No prior mechanical experience needed", "Physical ability to handle tools and equipment", "Safety-conscious attitude"]),
      careerOutcomes: JSON.stringify(["Auto Mechanic", "Service Technician", "Workshop Supervisor", "Auto Parts Specialist", "Mobile Mechanic"]),
      duration: "3 months",
      scheduleOptions: JSON.stringify(["Full-day (Mon-Fri 8 AM - 4 PM)"]),
      feeRwf: 200000,
      installmentAvailable: true,
      isFeatured: true,
      displayOrder: 5,
    },
    {
      slug: "ai-skills-for-professionals",
      title: "AI Skills for Professionals",
      category: "ai_skills",
      shortDesc: "Stay ahead of the future. Learn how to use AI tools to boost productivity.",
      description: "A modern, non-technical AI literacy and tools course for working professionals, entrepreneurs, and students who want to harness AI without coding. Covers the most powerful AI tools in use today and how to apply them in real work contexts. Be among the first in Kigali to master AI-powered workflows.",
      whatYoullLearn: JSON.stringify([
        "Understanding AI: What it is and why it matters (no coding required)",
        "ChatGPT & Claude for writing, research, and communication",
        "AI image generation for business and creative work",
        "AI for data analysis and spreadsheets",
        "Automating repetitive tasks with AI tools",
        "AI ethics, privacy, and responsible use in Africa",
      ]),
      whoIsItFor: "Working professionals, entrepreneurs, students, marketers, writers, and anyone who wants to leverage AI tools to improve productivity and career prospects.",
      modules: JSON.stringify([
        { title: "AI Fundamentals", description: "What AI is, how it works, types of AI, and why it matters for Africa", topics: ["AI Concepts", "Types of AI", "AI in Africa"] },
        { title: "AI for Writing & Communication", description: "Using ChatGPT, Claude, and other LLMs for professional writing", topics: ["ChatGPT", "Claude", "Email Writing", "Reports"] },
        { title: "AI for Visual Content", description: "Midjourney, DALL-E, Canva AI for images, presentations, and branding", topics: ["Midjourney", "DALL-E", "Canva AI", "Branding"] },
        { title: "AI for Data & Analysis", description: "Using AI with Excel, Google Sheets, and data visualization tools", topics: ["Excel AI", "Data Analysis", "Visualization"] },
        { title: "AI Automation", description: "Zapier, Make.com, and building automated workflows with AI", topics: ["Zapier", "Make.com", "Workflow Automation"] },
        { title: "AI for Marketing", description: "Social media content, SEO, email marketing, and customer engagement with AI", topics: ["Social Media", "SEO", "Email Marketing"] },
        { title: "AI Ethics & Responsible Use", description: "Privacy, bias, copyright, and ethical frameworks for AI use in Africa", topics: ["AI Ethics", "Privacy", "Copyright", "Bias"] },
      ]),
      requirements: JSON.stringify(["Basic computer literacy", "Laptop required (bring your own)", "No coding experience needed"]),
      careerOutcomes: JSON.stringify(["AI-Powered Professional", "Content Creator", "Marketing Specialist", "Automation Consultant", "Entrepreneur"]),
      duration: "4-6 weeks",
      scheduleOptions: JSON.stringify(["Evening (Mon/Wed/Fri 5-7 PM)", "Weekend Intensive"]),
      feeRwf: 175000,
      installmentAvailable: true,
      isFeatured: true,
      displayOrder: 6,
    },
    {
      slug: "private-candidate-support",
      title: "Private Candidate Support",
      category: "private_candidate",
      shortDesc: "Prepare effectively for national and international exams.",
      description: "Structured academic coaching for students who are registered or planning to register as private candidates for Rwanda's national examinations, as well as students needing academic support outside of school. Our experienced teachers provide targeted lessons, past paper practice, and exam strategy coaching.",
      whatYoullLearn: JSON.stringify([
        "Structured weekly lessons per subject",
        "Past paper practice and marking",
        "Individual progress tracking",
        "Mock examination sessions",
        "Study planning and exam strategy coaching",
      ]),
      whoIsItFor: "Private candidates preparing for PLE, O-Level, or A-Level exams, students needing extra academic support, and repeat candidates looking to improve their scores.",
      modules: JSON.stringify([
        { title: "Mathematics", description: "Algebra, geometry, calculus, statistics, and exam problem-solving", topics: ["Algebra", "Geometry", "Calculus", "Statistics"] },
        { title: "English Language", description: "Grammar, composition, comprehension, and literature analysis", topics: ["Grammar", "Essay Writing", "Comprehension", "Literature"] },
        { title: "Physics", description: "Mechanics, electricity, waves, and modern physics", topics: ["Mechanics", "Electricity", "Waves", "Modern Physics"] },
        { title: "Chemistry", description: "Organic, inorganic, physical chemistry, and laboratory skills", topics: ["Organic Chemistry", "Inorganic", "Physical Chemistry"] },
        { title: "Biology", description: "Cell biology, genetics, ecology, and human physiology", topics: ["Cell Biology", "Genetics", "Ecology", "Physiology"] },
        { title: "History & Geography", description: "Rwandan history, world history, physical and human geography", topics: ["Rwandan History", "World History", "Geography"] },
        { title: "Economics & Computer Science", description: "Micro/macro economics and computer science fundamentals", topics: ["Microeconomics", "Macroeconomics", "Computer Science"] },
      ]),
      requirements: JSON.stringify(["Registered or planning to register as a private candidate", "Commitment to regular attendance", "Study materials and past papers provided"]),
      careerOutcomes: JSON.stringify(["PLE Pass", "O-Level Certificate", "A-Level Certificate", "University Admission", "Career Advancement"]),
      duration: "3 months (per exam cycle)",
      scheduleOptions: JSON.stringify(["Morning", "Afternoon", "Evening"]),
      feeRwf: 150000,
      installmentAvailable: false,
      isFeatured: true,
      displayOrder: 7,
    },
  ];

  const existingCourses = await db.select({ slug: courses.slug }).from(courses);
  const existingSlugs = new Set(existingCourses.map(c => c.slug));

  for (const course of courseData) {
    if (existingSlugs.has(course.slug)) {
      await db.update(courses).set({ feeRwf: course.feeRwf }).where(eq(courses.slug, course.slug));
    } else {
      await db.insert(courses).values(course);
    }
  }
  console.log(`✅ ${courseData.length} courses synced`);

  // ─── TESTIMONIALS ───
  await db.insert(testimonials).values([
    {
      studentName: "Marie Claire Uwimana",
      courseName: "Bakery & Pastry",
      completionYear: 2024,
      currentRole: "Bakery Owner",
      employer: "Sweet Dreams Bakery",
      quote: "The hands-on training and supportive community gave me the confidence to launch my own bakery. Within 3 months of graduating, I opened Sweet Dreams Bakery in Kigali and now employ 5 people. Pacemaker Institute changed my life.",
      rating: 5,
      isFeatured: true,
      isApproved: true,
      isPublished: true,
    },
    {
      studentName: "Jean Paul Habimana",
      courseName: "Mechanics & Automotive",
      completionYear: 2024,
      currentRole: "Lead Mechanic",
      employer: "Kigali Auto Center",
      quote: "I came to Pacemaker with no mechanical background. The workshop-based training was intense but incredibly practical. Now I'm the lead mechanic at one of the biggest auto centers in Kigali. The certificate opened doors for me immediately.",
      rating: 5,
      isFeatured: true,
      isApproved: true,
      isPublished: true,
    },
    {
      studentName: "Grace Mutoni",
      courseName: "Salon & Beauty",
      completionYear: 2023,
      currentRole: "Salon Owner & Stylist",
      employer: "Grace Beauty Lounge",
      quote: "Pacemaker's salon program taught me not just the technical skills but also how to run a business. I opened my own salon and I'm now one of the most booked stylists in my area. The investment in this course paid off within 6 months.",
      rating: 5,
      isFeatured: true,
      isApproved: true,
      isPublished: true,
    },
    {
      studentName: "Patrick Ndayisaba",
      courseName: "AI Skills for Professionals",
      completionYear: 2025,
      currentRole: "Marketing Manager",
      employer: "RwandaTech Solutions",
      quote: "The AI Skills course was a game-changer. I learned how to use ChatGPT and other AI tools to automate my marketing workflows. My productivity increased by 300% and I got promoted to Marketing Manager within weeks of completing the course.",
      rating: 5,
      isFeatured: true,
      isApproved: true,
      isPublished: true,
    },
    {
      studentName: "Sophie Kabano",
      courseName: "Language Courses",
      completionYear: 2024,
      currentRole: "Customer Relations Officer",
      employer: "Bank of Kigali",
      quote: "I took the French advanced course and within 3 months I was fluent enough to handle French-speaking clients at the bank. The instructors are patient and the class schedule was perfect for working professionals.",
      rating: 5,
      isFeatured: false,
      isApproved: true,
      isPublished: true,
    },
    {
      studentName: "Eric Manirafasha",
      courseName: "Private Candidate Support",
      completionYear: 2024,
      currentRole: "University Student",
      employer: "University of Rwanda",
      quote: "Thanks to Pacemaker's private candidate support, I passed my A-Level exams with distinction. The structured lessons and past paper practice made all the difference. I'm now studying Computer Science at the University of Rwanda.",
      rating: 5,
      isFeatured: true,
      isApproved: true,
      isPublished: true,
    },
  ]);
  console.log("✅ 6 testimonials seeded");

  // ─── NEWS & EVENTS ───
  await db.insert(newsEvents).values([
    {
      slug: "new-ai-course-launch",
      title: "Pacemaker Institute Launches AI Skills Course — First in Kigali",
      category: "news",
      excerpt: "We are proud to announce the launch of our AI Skills for Professionals course, the first of its kind in Kigali. This course is designed for working professionals who want to harness the power of AI.",
      content: "Pacemaker Institute is proud to announce the launch of our groundbreaking AI Skills for Professionals course — the first of its kind in Kigali. This 4-6 week intensive program teaches working professionals how to leverage cutting-edge AI tools including ChatGPT, Claude, Midjourney, and more to dramatically improve productivity and career prospects.\n\nThe course requires no coding experience and is designed for professionals across all industries. Topics covered include AI for writing and communication, visual content creation, data analysis, workflow automation, and ethical AI use in the African context.\n\n\"We believe AI literacy will be as fundamental as computer literacy in the next decade,\" said the Institute Director. \"Our mission is to ensure Rwandan professionals are not left behind in this technological revolution.\"\n\nThe first intake begins next month with limited seats available. Early bird discounts are available for registrations made before the deadline.",
      authorName: "Pacemaker Institute",
      isPublished: true,
      publishedAt: new Date(),
    },
    {
      slug: "graduation-ceremony-2024",
      title: "Annual Graduation Ceremony Celebrates 500+ New Graduates",
      category: "event",
      excerpt: "Join us as we celebrate our newest graduates across all departments. The ceremony will feature keynote speakers, awards, and networking opportunities.",
      content: "Pacemaker Institute held its annual graduation ceremony, celebrating over 500 graduates from our Language, Bakery, Salon, Mechanics, AI Skills, and Private Candidate programs.\n\nThe event was attended by families, friends, industry partners, and government officials. Keynote speaker Hon. Minister of Education congratulated the graduates and praised Pacemaker's contribution to Rwanda's skills development agenda.\n\nHighlights of the ceremony included:\n- Valedictorian address by Marie Claire Uwimana (Bakery Program)\n- Excellence awards for top performers in each department\n- Live demonstrations of student projects\n- Networking session with industry employers\n\nCongratulations to the Class of 2024!",
      authorName: "Pacemaker Institute",
      eventDate: new Date("2024-11-15"),
      eventLocation: "Kigali Convention Centre",
      isPublished: true,
      publishedAt: new Date(),
    },
    {
      slug: "ielts-partnership",
      title: "Pacemaker Institute Partners with British Council for IELTS Prep",
      category: "announcement",
      excerpt: "We are excited to announce our official partnership with the British Council to provide premium IELTS test preparation courses.",
      content: "Pacemaker Institute is thrilled to announce a strategic partnership with the British Council to deliver premium IELTS test preparation courses. This partnership ensures our students receive the most up-to-date study materials, practice tests aligned with current exam standards, and expert guidance from British Council-certified trainers.\n\nThe partnership includes:\n- Official British Council practice materials\n- Mock tests with authentic exam conditions\n- Priority booking for IELTS test dates\n- Special discounted rates for Pacemaker students\n\nThis collaboration strengthens our commitment to helping Rwandan students achieve their dreams of studying abroad.",
      authorName: "Pacemaker Institute",
      isPublished: true,
      publishedAt: new Date(),
    },
  ]);
  console.log("✅ 3 news events seeded");

  // ─── INSTRUCTORS ───
  await db.insert(instructors).values([
    {
      fullName: "Prof. Jean Baptiste Ngabo",
      title: "Head of Language Department",
      department: "languages",
      bio: "Prof. Ngabo holds a PhD in Applied Linguistics from Sorbonne University and has over 20 years of experience teaching French and English. He has trained diplomats, business leaders, and thousands of students across East Africa.",
      qualifications: JSON.stringify(["PhD Applied Linguistics - Sorbonne University", "MA TESOL - University of London", "DELF Examiner Certified"]),
      specializations: JSON.stringify(["French", "English", "DELF Preparation", "IELTS Coaching"]),
      isLeadership: true,
      displayOrder: 1,
    },
    {
      fullName: "Chef Anne Marie Uwase",
      title: "Head Baker & Pastry Chef",
      department: "bakery",
      bio: "Chef Anne Marie trained at Le Cordon Bleu Paris and worked at Michelin-starred restaurants in France before returning to Rwanda. She brings world-class pastry techniques and a passion for African fusion baking.",
      qualifications: JSON.stringify(["Diplôme de Pâtisserie - Le Cordon Bleu Paris", "CAP Boulanger - France", "15+ Years Industry Experience"]),
      specializations: JSON.stringify(["Pastry Arts", "Bread Baking", "Cake Design", "Food Safety"]),
      isLeadership: true,
      displayOrder: 2,
    },
    {
      fullName: "Aline Mukamana",
      title: "Senior Beauty Instructor",
      department: "salon",
      bio: "Aline is a certified cosmetologist with expertise in natural hair care, makeup artistry, and salon management. She has trained over 500 students and owns a successful chain of beauty salons in Kigali.",
      qualifications: JSON.stringify(["Cosmetology License - South Africa", "CIDESCO Diploma", "Business Management Certificate"]),
      specializations: JSON.stringify(["Hair Styling", "Makeup Artistry", "Skincare", "Salon Management"]),
      isLeadership: true,
      displayOrder: 3,
    },
    {
      fullName: "Eng. Robert Mugabo",
      title: "Senior Automotive Instructor",
      department: "mechanics",
      bio: "Eng. Robert is a certified automotive engineer with 18 years of experience. He previously worked as a senior technician at Toyota Rwanda and holds multiple certifications in hybrid and electric vehicle technology.",
      qualifications: JSON.stringify(["BEng Mechanical Engineering", "Toyota Certified Technician", "Hybrid Vehicle Specialist"]),
      specializations: JSON.stringify(["Engine Repair", "Electrical Systems", "Diagnostics", "Hybrid Vehicles"]),
      isLeadership: false,
      displayOrder: 4,
    },
    {
      fullName: "David Tuyishime",
      title: "AI & Technology Instructor",
      department: "ai_skills",
      bio: "David is a tech entrepreneur and AI specialist. He founded a successful AI startup and has trained over 2,000 professionals across Africa in AI tools and digital transformation. He makes complex technology accessible to everyone.",
      qualifications: JSON.stringify(["MSc Computer Science - Carnegie Mellon", "Google AI Certified", "Tech Startup Founder"]),
      specializations: JSON.stringify(["Artificial Intelligence", "No-Code Tools", "Automation", "Digital Marketing"]),
      isLeadership: false,
      displayOrder: 5,
    },
  ]);
  console.log("✅ 5 instructors seeded");

  // ─── FAQS ───
  await db.insert(faqs).values([
    {
      question: "How do I enroll in a course?",
      answer: "You can enroll by filling out our online enrollment form, visiting our campus in person, or calling/WhatsApping us at +250 786 053 720. Our admissions team will guide you through the process and confirm your enrollment within 2 business days.",
      category: "enrollment",
      displayOrder: 1,
    },
    {
      question: "What are the admission requirements?",
      answer: "Most courses require no prior experience. For language courses at Intermediate or Advanced levels, you need to pass a placement test. For AI Skills, basic computer literacy is required. Private Candidate Support requires registration or intent to register for national exams.",
      category: "enrollment",
      displayOrder: 2,
    },
    {
      question: "Do you offer certificates?",
      answer: "Yes, all our courses come with Pacemaker Institute certificates that are recognized by employers across Rwanda and East Africa. Our Language Test Preparation courses also prepare you for internationally recognized certifications like IELTS, TOEFL, DELF, and Goethe-Zertifikat.",
      category: "certificates",
      displayOrder: 1,
    },
    {
      question: "What are the class schedules?",
      answer: "We offer flexible scheduling: Morning (8 AM - 12 PM), Afternoon (1-5 PM), Evening (5-7 PM), and Weekend classes (Saturday/Sunday). Specific schedules vary by course. Contact us for the current intake schedule.",
      category: "schedule",
      displayOrder: 1,
    },
    {
      question: "How much do courses cost?",
      answer: "Course fees vary by program. We offer competitive rates and installment payment plans. Contact our admissions office at +250 786 053 720 or visit us for current fee structures. We also offer early bird discounts and group enrollment discounts.",
      category: "fees",
      displayOrder: 1,
    },
    {
      question: "Can I pay in installments?",
      answer: "Yes, installment payment plans are available for most courses. Typically, you can pay 50% upfront and the remaining 50% mid-course. Contact our finance office to discuss a payment plan that works for you.",
      category: "fees",
      displayOrder: 2,
    },
    {
      question: "How long are the courses?",
      answer: "Course durations vary: Language courses are 3 months per level, Bakery is 2 months, Salon is 3 months, Mechanics is 3 months, AI Skills is 4-6 weeks, and Private Candidate Support follows the exam cycle (typically 3 months).",
      category: "courses",
      displayOrder: 1,
    },
    {
      question: "Where is Pacemaker Institute located?",
      answer: "We are located at Centenary House, 8 KN 4 Ave, Kigali, Rwanda (3rd Floor). We are easily accessible from all parts of the city.",
      category: "technical",
      displayOrder: 1,
    },
    {
      question: "Do you offer online classes?",
      answer: "Some courses, particularly AI Skills and certain language levels, offer online or hybrid options. However, our vocational courses (Bakery, Salon, Mechanics) require in-person attendance for hands-on training.",
      category: "courses",
      displayOrder: 2,
    },
    {
      question: "What makes Pacemaker different from other institutes?",
      answer: "Pacemaker Institute combines practical, hands-on training with flexible scheduling and recognized certifications. Our instructors are industry professionals, our facilities are modern and well-equipped, and we provide ongoing career support to our graduates.",
      category: "courses",
      displayOrder: 3,
    },
  ]);
  console.log("✅ 10 FAQs seeded");

  // ─── GALLERY ITEMS ───
  await db.insert(galleryItems).values([
    { imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800", caption: "Graduation Ceremony 2024", category: "graduation", displayOrder: 1 },
    { imageUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800", caption: "Language Class in Session", category: "classes", displayOrder: 2 },
    { imageUrl: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800", caption: "Bakery Students at Work", category: "bakery", displayOrder: 3 },
    { imageUrl: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800", caption: "Salon Training Session", category: "salon", displayOrder: 4 },
    { imageUrl: "https://images.unsplash.com/photo-1632823471406-0308db5aa501?w=800", caption: "Mechanics Workshop", category: "mechanics", displayOrder: 5 },
    { imageUrl: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?w=800", caption: "Campus Building", category: "campus", displayOrder: 6 },
  ]);
  console.log("✅ 6 gallery items seeded");

  // ─── ADMIN USER ───
  const adminEmail = "mnasida@gmail.com";
  const adminPassword = "Tonde@123";
  const hashedPassword = hashSync(adminPassword, 12);
  const existingAdmin = await db.select().from(adminUsers).where(eq(adminUsers.email, adminEmail));
  if (existingAdmin.length === 0) {
    await db.insert(adminUsers).values({
      name: "System Administrator",
      email: adminEmail,
      passwordHash: hashedPassword,
      role: "super_admin",
      isActive: true,
    });
    console.log(`✅ Admin user created (${adminEmail})`);
  } else {
    await db.update(adminUsers)
      .set({ passwordHash: hashedPassword, isActive: true })
      .where(eq(adminUsers.email, adminEmail));
    console.log(`✅ Admin password updated (${adminEmail})`);
  }

  console.log("\n🎉 Seed complete!");
}

seed().catch(console.error);
