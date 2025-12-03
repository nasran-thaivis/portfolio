"use client";

import { useState, useEffect, useRef } from "react";
import { getSignedImageUrl, normalizeImageUrl } from "../../../lib/imageUtils";
import { getApiUrl } from "../../../lib/api";
import { useAuth } from "../../contexts/AuthContext";

export default function PortfolioEditor() {
  const { currentUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  
  // State สำหรับฟอร์มเพิ่มงานใหม่
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    link: ""
  });

  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);

  // 1. ดึงข้อมูลจาก Backend (Port 3001)
  useEffect(() => {
    fetchProjects();
  }, [currentUser]);

  const fetchProjects = async () => {
    try {
      // Prepare headers with authentication
      const headers = {};
      if (currentUser?.id) headers['x-user-id'] = currentUser.id;
      if (currentUser?.username) headers['x-username'] = currentUser.username;

      // Use Next.js API route which proxies to backend
      const res = await fetch("/api/projects", {
        headers,
      });
      
      if (!res.ok) {
        console.warn("[PortfolioEditor] Failed to fetch projects, using empty list");
        setProjects([]);
        setIsLoading(false);
        return;
      }
      
      const data = await res.json();
      // แปลง imageUrl เป็น full backend URL สำหรับแต่ละ project
      const projectsWithFullUrls = (Array.isArray(data) ? data : []).map((project) => ({
        ...project,
        imageUrl: project.imageUrl ? getSignedImageUrl(project.imageUrl) : project.imageUrl,
      }));
      setProjects(projectsWithFullUrls);
      setIsLoading(false);
    } catch (error) {
      console.error("[PortfolioEditor] Failed to fetch projects", error);
      // On error, show empty list - user can still add projects
      setProjects([]);
      setIsLoading(false);
    }
  };

  // 2. ฟังก์ชันอัปโหลดรูปสำหรับ Add Form (S3 Upload)
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("❌ กรุณาเลือกไฟล์รูปภาพเท่านั้น");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("❌ ไฟล์รูปภาพต้องมีขนาดไม่เกิน 5MB");
      return;
    }

    setIsUploading(true);

    try {
      // อัปโหลดไป S3
      const formDataToUpload = new FormData();
      formDataToUpload.append('file', file);

      // Prepare headers with authentication
      const headers = {};
      if (currentUser?.id) headers['x-user-id'] = currentUser.id;
      if (currentUser?.username) headers['x-username'] = currentUser.username;

      const uploadRes = await fetch('/api/upload/image', {
        method: 'POST',
        headers,
        body: formDataToUpload,
      });

      if (!uploadRes.ok) {
        throw new Error('อัปโหลดล้มเหลว');
      }

      const { url } = await uploadRes.json();
      setFormData({ ...formData, imageUrl: getSignedImageUrl(url) });
      alert('✅ อัปโหลดรูปภาพสำเร็จ!');
    } catch (error) {
      console.error(error);
      alert('❌ อัปโหลดล้มเหลว กรุณาลองใหม่');
    } finally {
      setIsUploading(false);
    }
  };

  // 3. ฟังก์ชันลบรูปสำหรับ Add Form
  const handleRemoveImage = () => {
    if (confirm("คุณต้องการลบรูปภาพนี้หรือไม่?")) {
      setFormData({ ...formData, imageUrl: "" });
    }
  };

  // 4. ฟังก์ชันเพิ่มงานใหม่
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) return alert("Please enter a title");

    try {
      // Normalize imageUrl to path before saving
      const dataToSave = {
        ...formData,
        imageUrl: formData.imageUrl ? normalizeImageUrl(formData.imageUrl) : formData.imageUrl,
      };

      // Prepare headers with authentication
      const headers = {
        "Content-Type": "application/json",
      };
      if (currentUser?.id) headers["x-user-id"] = currentUser.id;
      if (currentUser?.username) headers["x-username"] = currentUser.username;

      const res = await fetch("/api/projects", {
        method: "POST",
        headers,
        body: JSON.stringify(dataToSave),
      });
      
      if (res.ok) {
        alert("✅ Project added successfully!");
        setFormData({ title: "", description: "", imageUrl: "", link: "" }); // ล้างฟอร์ม
        fetchProjects(); // ดึงข้อมูลใหม่มาโชว์ทันที
      } else {
        // รองรับทั้งกรณี response เป็น JSON และ non‑JSON (เช่น HTML error page)
        let rawBody = "";
        let errorData = {};
        try {
          rawBody = await res.text();
          if (rawBody) {
            try {
              errorData = JSON.parse(rawBody);
            } catch {
              // ไม่ใช่ JSON ก็ปล่อยไป ใช้ rawBody เป็นข้อความดิบ
            }
          }
        } catch {
          // ignore body read error
        }

        const message =
          errorData.message ||
          errorData.error ||
          errorData.detail ||
          (rawBody && typeof rawBody === "string" ? rawBody : "") ||
          `Failed to add project (status ${res.status})`;

        console.error("[PortfolioEditor] Failed to add project", {
          status: res.status,
          errorData,
          rawBody,
        });

        alert(`❌ ${message}`);
      }
    } catch (error) {
      console.error("[PortfolioEditor] Save error:", error);
      alert("❌ Error connecting to server");
    }
  };

  // 5. ฟังก์ชันเริ่มแก้ไข
  const startEdit = (project) => {
    setEditingProject(project);
  };

  // 6. ฟังก์ชันอัปโหลดรูปสำหรับ Edit Form (S3 Upload)
  const handleEditImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("❌ กรุณาเลือกไฟล์รูปภาพเท่านั้น");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("❌ ไฟล์รูปภาพต้องมีขนาดไม่เกิน 5MB");
      return;
    }

    setIsUploading(true);

    try {
      // อัปโหลดไป S3
      const formDataToUpload = new FormData();
      formDataToUpload.append('file', file);

      // Prepare headers with authentication
      const headers = {};
      if (currentUser?.id) headers['x-user-id'] = currentUser.id;
      if (currentUser?.username) headers['x-username'] = currentUser.username;

      const uploadRes = await fetch('/api/upload/image', {
        method: 'POST',
        headers,
        body: formDataToUpload,
      });

      if (!uploadRes.ok) {
        throw new Error('อัปโหลดล้มเหลว');
      }

      const { url } = await uploadRes.json();
      setEditingProject({ ...editingProject, imageUrl: getSignedImageUrl(url) });
      alert('✅ อัปโหลดรูปภาพสำเร็จ!');
    } catch (error) {
      console.error(error);
      alert('❌ อัปโหลดล้มเหลว กรุณาลองใหม่');
    } finally {
      setIsUploading(false);
    }
  };

  // 7. ฟังก์ชันลบรูปสำหรับ Edit Form
  const handleEditRemoveImage = () => {
    if (confirm("คุณต้องการลบรูปภาพนี้หรือไม่?")) {
      setEditingProject({ ...editingProject, imageUrl: "" });
    }
  };

  // 8. ฟังก์ชันบันทึกการแก้ไข
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingProject.title) return alert("Please enter a title");

    try {
      // Normalize imageUrl to path before saving
      const dataToSave = {
        ...editingProject,
        imageUrl: editingProject.imageUrl ? normalizeImageUrl(editingProject.imageUrl) : editingProject.imageUrl,
      };

      // Prepare headers with authentication
      const headers = {
        "Content-Type": "application/json",
      };
      if (currentUser?.id) headers['x-user-id'] = currentUser.id;
      if (currentUser?.username) headers['x-username'] = currentUser.username;

      // Prepare headers with authentication for PATCH request
      const patchHeaders = {
        "Content-Type": "application/json",
      };
      if (currentUser?.id) patchHeaders['x-user-id'] = currentUser.id;
      if (currentUser?.username) patchHeaders['x-username'] = currentUser.username;

      const res = await fetch(`/api/projects/${editingProject.id}`, {
        method: "PATCH",
        headers: patchHeaders,
        body: JSON.stringify(dataToSave),
      });

      if (res.ok) {
        alert("✅ Project updated successfully!");
        setEditingProject(null);
        fetchProjects();
      } else {
        alert("❌ Failed to update project");
      }
    } catch (error) {
      console.error(error);
      alert("Error connecting to server");
    }
  };

  // 9. ฟังก์ชันลบงาน
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      // Prepare headers with authentication
      const headers = {};
      if (currentUser?.id) headers['x-user-id'] = currentUser.id;
      if (currentUser?.username) headers['x-username'] = currentUser.username;

      const res = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
        headers,
      });

      if (res.ok) {
        alert("🗑️ Project deleted!");
        fetchProjects(); // อัปเดตตาราง
      }
    } catch (error) {
      console.error(error);
      alert("Failed to delete");
    }
  };

  return (
    <div className="space-y-8">
      {/* === 1. ส่วนฟอร์มเพิ่มงานใหม่ === */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Add New Project</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Project Title (ชื่อผลงาน)"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="p-3 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none text-black"
              required
            />
             <input
              type="text"
              placeholder="Link URL (เช่น https://mysite.com)"
              value={formData.link}
              onChange={(e) => setFormData({...formData, link: e.target.value})}
              className="p-3 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none text-black"
            />
          </div>
          
          {/* Project Image Upload */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Project Image</label>
            <div className="flex gap-3 mb-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Uploading...
                  </>
                ) : (
                  <>
                    📤 Upload Image
                  </>
                )}
              </button>
              
              {formData.imageUrl && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                >
                  🗑️ Remove
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            {formData.imageUrl && (
              <div className="mt-4 h-40 w-full rounded-lg overflow-hidden bg-gray-100 border">
                <img src={getSignedImageUrl(formData.imageUrl)} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <textarea
            placeholder="Description (รายละเอียด)"
            rows="3"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="p-3 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none text-black"
          ></textarea>
          
          <button 
            type="submit" 
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-medium transition w-full md:w-auto"
          >
            + Create Project
          </button>
        </form>
      </div>

      {/* === 2. ส่วนฟอร์มแก้ไข === */}
      {editingProject && (
        <div className="bg-yellow-50 p-6 rounded-xl shadow-sm border-2 border-yellow-400">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Edit Project</h3>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Project Title"
                value={editingProject.title}
                onChange={(e) => setEditingProject({...editingProject, title: e.target.value})}
                className="p-3 border rounded-lg w-full focus:ring-2 focus:ring-yellow-500 outline-none text-black"
                required
              />
              <input
                type="text"
                placeholder="Link URL"
                value={editingProject.link || ""}
                onChange={(e) => setEditingProject({...editingProject, link: e.target.value})}
                className="p-3 border rounded-lg w-full focus:ring-2 focus:ring-yellow-500 outline-none text-black"
              />
            </div>
            
            {/* Edit Image Upload */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Project Image</label>
              <div className="flex gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => editFileInputRef.current?.click()}
                  disabled={isUploading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      Uploading...
                    </>
                  ) : (
                    <>
                      📤 Upload New Image
                    </>
                  )}
                </button>
                
                {editingProject.imageUrl && (
                  <button
                    type="button"
                    onClick={handleEditRemoveImage}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                  >
                    🗑️ Remove
                  </button>
                )}
              </div>

              <input
                ref={editFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleEditImageUpload}
                className="hidden"
              />

              {editingProject.imageUrl && (
                <div className="mt-4 h-40 w-full rounded-lg overflow-hidden bg-gray-100 border">
                  <img src={getSignedImageUrl(editingProject.imageUrl)} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <textarea
              placeholder="Description"
              rows="3"
              value={editingProject.description || ""}
              onChange={(e) => setEditingProject({...editingProject, description: e.target.value})}
              className="p-3 border rounded-lg w-full focus:ring-2 focus:ring-yellow-500 outline-none text-black"
            ></textarea>
            
            <div className="flex gap-3">
              <button 
                type="submit" 
                className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 font-medium transition"
              >
                💾 Update Project
              </button>
              <button 
                type="button"
                onClick={() => setEditingProject(null)}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 font-medium transition"
              >
                ✖️ Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* === 3. ส่วนตารางแสดงรายการ (เชื่อม Database) === */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
          All Projects ({projects.length})
        </h3>
        
        {isLoading ? (
          <div className="text-center py-10 text-gray-500 animate-pulse">Loading data...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                  <th className="p-4 font-semibold rounded-tl-lg">Image</th>
                  <th className="p-4 font-semibold">Title</th>
                  <th className="p-4 font-semibold">Link</th>
                  <th className="p-4 font-semibold rounded-tr-lg text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {projects.map((project) => (
                  <tr key={project.id} className="border-b hover:bg-gray-50 transition">
                    <td className="p-4">
                      <img 
                        src={project.imageUrl ? getSignedImageUrl(project.imageUrl) : "https://placehold.co/100"} 
                        alt={project.title} 
                        className="w-20 h-14 object-cover rounded shadow-sm"
                      />
                    </td>
                    <td className="p-4 font-medium">{project.title}</td>
                    <td className="p-4 text-blue-600 text-sm truncate max-w-[150px]">
                      {project.link || "-"}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex gap-2 justify-center">
                        <button 
                          onClick={() => startEdit(project)}
                          className="bg-yellow-100 text-yellow-600 hover:bg-yellow-600 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(project.id)}
                          className="bg-red-100 text-red-600 hover:bg-red-600 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {projects.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-10 text-center text-gray-400">
                      ยังไม่มีข้อมูล (ลองเพิ่มงานใหม่ดูสิ!)
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}