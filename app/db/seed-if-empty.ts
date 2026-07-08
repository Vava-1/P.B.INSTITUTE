import { getDb } from "../api/queries/connection";
import { testimonials } from "./schema";
import { count } from "drizzle-orm";

/**
 * Auto-seed: runs on every container startup after drizzle-kit push.
 * Only inserts seed data when a table is EMPTY — never overwrites existing rows.
 * This recovers data lost by destructive schema pushes (e.g. type changes that
 * drop+recreate columns) without requiring manual admin action.
 */
export async function seedIfEmpty() {
  const db = getDb();
  try {
    const [result] = await db.select({ count: count() }).from(testimonials);
    if (result.count === 0) {
      console.log("🌱 [auto-seed] Testimonials table is empty — inserting seed data...");
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
      console.log("✅ [auto-seed] 6 testimonials inserted");
    } else {
      console.log(`ℹ️  [auto-seed] Testimonials table already has ${result.count} rows — skipping`);
    }
  } catch (e) {
    console.error("⚠️  [auto-seed] Failed to seed testimonials:", (e as Error).message);
  }
}
