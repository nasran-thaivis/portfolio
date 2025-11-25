import Container from "../components/Container";
import { getApiUrl } from "../../lib/api";

async function getReviews() {
  try {
    const res = await fetch(getApiUrl("/api/reviews"), { cache: "no-store" });
    if (!res.ok) throw new Error("Failed");
    return res.json();
  } catch (error) {
    return [];
  }
}

// ฟังก์ชันช่วยแปลงเลข 5 -> ⭐⭐⭐⭐⭐
function renderStars(rating) {
  return "⭐".repeat(rating);
}

export default async function ReviewPage() {
  const reviews = await getReviews();

  return (
    <Container title="Client Reviews">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-white"></h2>
        <p className="text-gray-400 mt-2">เสียงตอบรับจากลูกค้าที่น่ารักของเรา</p>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-20 text-gray-500 border-2 border-dashed border-zinc-800 rounded-xl">
          ยังไม่มีรีวิวในขณะนี้
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <div key={review.id} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-lg hover:border-zinc-600 transition">
              <div className="flex items-center gap-4 mb-4">
                {/* รูปโปรไฟล์ */}
                <img 
                  src={review.avatarUrl || `https://ui-avatars.com/api/?name=${review.name}&background=random`} 
                  alt={review.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-bold text-white">{review.name}</h4>
                  <div className="text-yellow-400 text-sm tracking-widest">
                    {renderStars(review.rating)}
                  </div>
                </div>
              </div>
              
              <p className="text-gray-300 text-sm leading-relaxed italic">
                {review.comment}&quot;
              </p>
              
              <div className="mt-4 text-xs text-gray-500 text-right">
                {new Date(review.createdAt).toLocaleDateString('th-TH')}
              </div>
            </div>
          ))}
        </div>
      )}
    </Container>
  );
}