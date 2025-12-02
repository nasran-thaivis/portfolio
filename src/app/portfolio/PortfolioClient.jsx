"use client";

import { useState, useEffect } from "react";
import Container from "../components/Container";
import { getSignedImageUrl } from "../../lib/imageUtils";
import { useAuth } from "../contexts/AuthContext";

// === Component สำหรับแสดงรูปภาพพร้อม proxy URL ===
const ImageWithSignedUrl = ({ src, alt, className }) => {
  // แปลง URL เป็น proxy URL ถ้าเป็น DigitalOcean Spaces URL
  const imageUrl = getSignedImageUrl(src);

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      onError={(e) => {
        // ถ้ารูปภาพโหลดไม่ได้ ให้แสดง placeholder
        e.target.src = "https://via.placeholder.com/800x400/1f2937/9ca3af?text=No+Image";
      }}
    />
  );
};

// === ข้อมูลเริ่มต้น (ตัวอย่าง 6 items = 3 คอลัมน์ x 2 boxes) ===
const initialItems = [
  {
    id: 1,
    title: "Project Alpha",
    description: "A web app built with Next.js and Tailwind CSS. Modern and responsive design.",
    imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&q=80&w=800",
  },
  {
    id: 2,
    title: "Project Beta",
    description: "Mobile design concept using Figma. Clean and intuitive user interface.",
    imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&q=80&w=800",
  },
  {
    id: 3,
    title: "Project Gamma",
    description: "E-commerce platform with payment integration. Secure and scalable.",
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&q=80&w=800",
  },
  {
    id: 4,
    title: "Project Delta",
    description: "Dashboard analytics tool. Real-time data visualization and reporting.",
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&q=80&w=800",
  },
  {
    id: 5,
    title: "Project Epsilon",
    description: "Social media management tool. Schedule posts and track engagement.",
    imageUrl: "https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&q=80&w=800",
  },
  {
    id: 6,
    title: "Project Zeta",
    description: "Task management application. Collaborate with your team efficiently.",
    imageUrl: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?ixlib=rb-4.0.3&q=80&w=800",
  },
];

// === Component ฟอร์มสำหรับ เพิ่ม/แก้ไข Project ===
const PortfolioForm = ({ currentItem, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(
    currentItem || { title: "", description: "", imageUrl: "" }
  );

  // อัปเดต form data เมื่อมีการเปลี่ยนแปลง
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ส่งข้อมูลเมื่อ submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg mb-8 space-y-4">
      <h3 className="text-xl font-semibold text-white">
        {currentItem ? "Edit Project" : "Add New Project"}
      </h3>
      
      {/* Input: Project Title */}
      <input
        name="title"
        value={formData.title}
        onChange={handleChange}
        placeholder="Project Title"
        className="w-full bg-zinc-800 text-white p-3 rounded-md border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        required
      />
      
      {/* Input: Image URL */}
      <input
        name="imageUrl"
        type="url"
        value={formData.imageUrl}
        onChange={handleChange}
        placeholder="Image URL (https://...)"
        className="w-full bg-zinc-800 text-white p-3 rounded-md border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        required
      />
      
      {/* Textarea: Description */}
      <textarea
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Short Description"
        rows={3}
        className="w-full bg-zinc-800 text-white p-3 rounded-md border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
        required
      />
      
      {/* Buttons: Save/Cancel */}
      <div className="flex gap-4">
        <button
          type="submit"
          className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
        >
          {currentItem ? "💾 Save Changes" : "✨ Add Project"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
        >
          ✕ Cancel
        </button>
      </div>
    </form>
  );
};

// === Component หลักของหน้า Portfolio ===
export default function PortfolioClient() {
  const { currentUser } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  // ดึงข้อมูลจาก API
  useEffect(() => {
    const fetchProjects = async () => {
      if (!currentUser?.username) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/projects?username=${currentUser.username}`, {
          cache: "no-store",
        });
        
        if (res.ok) {
          const data = await res.json();
          const projects = Array.isArray(data) ? data : [];
          // แปลง imageUrl เป็น signed URL
          const projectsWithUrls = projects.map(project => ({
            ...project,
            imageUrl: project.imageUrl ? getSignedImageUrl(project.imageUrl) : project.imageUrl,
          }));
          setItems(projectsWithUrls);
        } else {
          console.warn(`[PortfolioClient] Failed to fetch projects: ${res.status}`);
          setItems([]);
        }
      } catch (error) {
        console.error("[PortfolioClient] Error fetching projects:", error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [currentUser]);

  // === ฟังก์ชันจัดการ: ลบ Project ===
  const handleDelete = async (idToDelete) => {
    if (typeof window !== "undefined" && !confirm("Are you sure you want to delete this project?")) {
      return;
    }

    try {
      const headers = {};
      if (currentUser?.id) headers['x-user-id'] = currentUser.id;
      if (currentUser?.username) headers['x-username'] = currentUser.username;

      const res = await fetch(`/api/projects/${idToDelete}`, {
        method: "DELETE",
        headers,
      });

      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.id !== idToDelete));
      } else {
        alert("❌ Failed to delete project");
      }
    } catch (error) {
      console.error("[PortfolioClient] Error deleting project:", error);
      alert("❌ Error deleting project");
    }
  };

  // === ฟังก์ชันจัดการ: เปิดฟอร์มแก้ไข ===
  const handleEdit = (itemToEdit) => {
    setCurrentItem(itemToEdit);
    setShowForm(true);
  };

  // === ฟังก์ชันจัดการ: เปิดฟอร์มเพิ่มใหม่ ===
  const handleAddNew = () => {
    setCurrentItem(null);
    setShowForm(true);
  };

  // === ฟังก์ชันจัดการ: ยกเลิกฟอร์ม ===
  const handleCancelForm = () => {
    setShowForm(false);
    setCurrentItem(null);
  };

  // === ฟังก์ชันจัดการ: บันทึกข้อมูลจากฟอร์ม ===
  const handleSubmitForm = async (formData) => {
    try {
      const headers = {
        "Content-Type": "application/json",
      };
      if (currentUser?.id) headers['x-user-id'] = currentUser.id;
      if (currentUser?.username) headers['x-username'] = currentUser.username;

      if (currentItem) {
        // โหมดแก้ไข: อัปเดต project
        const res = await fetch(`/api/projects/${currentItem.id}`, {
          method: "PATCH",
          headers,
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          const updatedProject = await res.json();
          setItems((prev) =>
            prev.map((item) =>
              item.id === currentItem.id 
                ? { ...updatedProject, imageUrl: updatedProject.imageUrl ? getSignedImageUrl(updatedProject.imageUrl) : updatedProject.imageUrl }
                : item
            )
          );
          alert("✅ Project updated successfully!");
        } else {
          alert("❌ Failed to update project");
          return;
        }
      } else {
        // โหมดเพิ่มใหม่: สร้าง project ใหม่
        const res = await fetch("/api/projects", {
          method: "POST",
          headers,
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          const newProject = await res.json();
          setItems((prev) => [
            ...prev,
            { ...newProject, imageUrl: newProject.imageUrl ? getSignedImageUrl(newProject.imageUrl) : newProject.imageUrl },
          ]);
          alert("✅ Project added successfully!");
        } else {
          alert("❌ Failed to add project");
          return;
        }
      }
      setShowForm(false);
      setCurrentItem(null);
    } catch (error) {
      console.error("[PortfolioClient] Error saving project:", error);
      alert("❌ Error saving project");
    }
  };

  // === ฟังก์ชันช่วย: แบ่ง items ออกเป็นกลุ่มๆ กลุ่มละ 2 items ===
  // แต่ละกลุ่มจะแสดงใน 1 คอลัมน์ (3 คอลัมน์ = 6 items)
  const groupItemsIntoColumns = (itemsArray) => {
    const columns = [[], [], []]; // สร้าง 3 คอลัมน์ว่าง
    
    itemsArray.forEach((item, index) => {
      // คำนวณว่าควรอยู่ในคอลัมน์ไหน (0, 1, หรือ 2)
      const columnIndex = Math.floor(index / 2) % 3;
      columns[columnIndex].push(item);
    });
    
    return columns;
  };

  // แบ่ง items ออกเป็น 3 คอลัมน์
  const columns = groupItemsIntoColumns(items);

  // === UI Render ===
  if (loading) {
    return (
      <Container title="Portfolio">
        <div className="text-center py-20 animate-pulse">
          <p className="text-xl text-gray-300">กำลังโหลดข้อมูล...</p>
        </div>
      </Container>
    );
  }

  if (!currentUser) {
    return (
      <Container title="Portfolio">
        <div className="text-center py-20 text-gray-500">
          <p className="text-xl mb-4">กรุณาเข้าสู่ระบบเพื่อดูผลงาน</p>
        </div>
      </Container>
    );
  }

  return (
    <Container title="Portfolio">
      <div className="space-y-8">
        {/* Header: ปุ่ม Add */}
        <div className="flex justify-end items-center">
          {!showForm && (
            <button
              onClick={handleAddNew}
              className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:from-[var(--color-primary)]/90 hover:to-[var(--color-secondary)]/90 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              ✨ Add New Project
            </button>
          )}
        </div>

        {/* แสดงฟอร์ม (เมื่อกด Add/Edit) */}
        {showForm && (
          <PortfolioForm
            currentItem={currentItem}
            onSubmit={handleSubmitForm}
            onCancel={handleCancelForm}
          />
        )}

        {/* Grid 3 คอลัมน์ (ขนาดเต็ม 100%) */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Loop แต่ละคอลัมน์ */}
          {columns.map((columnItems, columnIndex) => (
            <div
              key={columnIndex}
              className="flex flex-col gap-6"
            >
              {/* Loop 2 Box ในแต่ละคอลัมน์ */}
              {columnItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg overflow-hidden flex flex-col hover:border-zinc-600 transition-colors"
                >
                  {/* รูปภาพ Project */}
                  <div className="w-full h-48 bg-zinc-900 overflow-hidden">
                    <ImageWithSignedUrl
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* เนื้อหา: Title, Description, Buttons */}
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="text-lg font-semibold mb-2 text-white">{item.title}</h3>
                    <p className="text-zinc-400 text-sm mb-4 flex-grow">{item.description}</p>

                    {/* ปุ่ม Edit และ Delete */}
                    <div className="flex gap-3 mt-auto">
                      <button
                        onClick={() => handleEdit(item)}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-bold py-2.5 px-4 rounded-lg shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm font-bold py-2.5 px-4 rounded-lg shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* ถ้าคอลัมน์นี้ว่างเปล่า (ไม่มี Box) */}
              {columnItems.length === 0 && (
                <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-8 text-center text-zinc-500 text-sm">
                  Empty column
                </div>
              )}
            </div>
          ))}
        </div>

        {/* แสดงข้อความเมื่อไม่มีผลงานเลย */}
        {items.length === 0 && !showForm && (
          <div className="text-center py-16 px-4">
            <div className="text-6xl mb-4">📁</div>
            <p className="text-xl font-semibold text-gray-300 mb-2">Your portfolio is empty</p>
            <p className="text-sm text-gray-500">Click &quot;Add New Project&quot; to showcase your work!</p>
          </div>
        )}
      </div>
    </Container>
  );
}
