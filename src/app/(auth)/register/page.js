"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();
  const [lang, setLang] = useState("si");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "farmer",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const text = {
    si: {
      title: "ගිණුමක් අරඹන්න",
      subtitle: "අදම අපේ කෘෂි ජාලය සමඟ එකතු වන්න",
      name: "සම්පූර්ණ නම",
      email: "ඊමේල් ලිපිනය",
      role: "ඔබ කවුද?",
      role1: "ගොවියෙක් (Farmer)",
      role2: "හෝටලයක් / අවන්හලක් (Hotel/B2B)",
      role3: "සාමාන්‍ය පාරිභෝගිකයෙක් (Customer)",
      role4: "ප්‍රවාහන සහකරු (Delivery Partner / Driver)",
      password: "මුරපදය",
      btn: "ලියාපදිංචි වන්න",
      btnLoading: "ලියාපදිංචි වෙමින්...",
      hasAcc: "දැනටමත් ගිණුමක් තිබේද?",
      loginNow: "ඇතුල් වන්න",
      regSuccess: "ලියාපදිංචිය සාර්ථකයි! ඇතුල්වීමේ පිටුවට යොමු කෙරේ...",
      regFailed: "ලියාපදිංචි වීම අසාර්ථකයි. නැවත උත්සාහ කරන්න.",
    },
    en: {
      title: "Create an Account",
      subtitle: "Join our agro network today",
      name: "Full Name",
      email: "Email Address",
      role: "Who are you?",
      role1: "Farmer",
      role2: "Hotel / Restaurant (B2B)",
      role3: "Regular Customer",
      role4: "Delivery Partner / Driver",
      password: "Password",
      btn: "Register Now",
      btnLoading: "Registering...",
      hasAcc: "Already have an account?",
      loginNow: "Sign In",
      regSuccess: "Registration successful! Redirecting to login...",
      regFailed: "Registration failed. Please try again.",
    },
  };

  const t = text[lang];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, action: "register" }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || (lang === "si" ? t.regFailed : t.regFailed));
      }

      setSuccess(lang === "si" ? t.regSuccess : t.regSuccess);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 relative py-12">
      {/* Language Button */}
      <button
        onClick={() => setLang(lang === "si" ? "en" : "si")}
        className="absolute top-6 right-6 bg-white border border-gray-200 text-sm font-bold px-4 py-2 rounded-xl cursor-pointer"
      >
        {lang === "si" ? "English 🌐" : "සිංහල 🌐"}
      </button>

      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">{t.title}</h2>
          <p className="text-sm text-gray-500 mt-2">{t.subtitle}</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-semibold mb-5 border border-red-100">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm font-semibold mb-5 border border-green-100">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">{t.name}</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Kamal Perera"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-green-500 text-gray-900 bg-white"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">{t.email}</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@gmail.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-green-500 text-gray-900 bg-white"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">{t.role}</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-green-500 text-gray-900"
              disabled={loading}
            >
              <option value="farmer">{t.role1}</option>
              <option value="hotel">{t.role2}</option>
              <option value="customer">{t.role3}</option>
              <option value="driver">{t.role4}</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">{t.password}</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-green-500 text-gray-900 bg-white"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition cursor-pointer shadow-md shadow-green-100 disabled:bg-gray-400"
          >
            {loading ? t.btnLoading : t.btn}
          </button>
        </form>

        <p className="text-sm text-center text-gray-600 mt-6">
          {t.hasAcc}{" "}
          <Link href="/login" className="text-green-600 font-bold hover:underline">
            {t.loginNow}
          </Link>
        </p>
      </div>
    </div>
  );
}