"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [lang, setLang] = useState("si");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const text = {
    si: {
      title: "නැවත සාදරයෙන් පිළිගනිමු",
      subtitle: "ඔබේ ගිණුමට ඇතුල් වන්න",
      email: "ඊමේල් ලිපිනය",
      password: "මුරපදය",
      btn: "ඇතුල් වන්න",
      btnLoading: "ඇතුල් වෙමින්...",
      noAcc: "ගිණුමක් නොමැතිද?",
      regNow: "දැන්ම ලියාපදිංචි වන්න",
      loginSuccess: "සාර්ථකව ඇතුල් විය! යොමු කෙරේ...",
      loginFailed: "ඇතුල් වීම අසාර්ථකයි. නැවත උත්සාහ කරන්න.",
    },
    en: {
      title: "Welcome Back",
      subtitle: "Sign in to your account",
      email: "Email Address",
      password: "Password",
      btn: "Sign In",
      btnLoading: "Signing In...",
      noAcc: "Don't have an account?",
      regNow: "Register Now",
      loginSuccess: "Logged in successfully! Redirecting...",
      loginFailed: "Login failed. Please try again.",
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
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || (lang === "si" ? t.loginFailed : t.loginFailed));
      }

      // Save user details to localStorage for session persistence
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      setSuccess(lang === "si" ? t.loginSuccess : t.loginSuccess);
      
      // Redirect based on role
      setTimeout(() => {
        const role = data.user?.role;
        if (role === "farmer") {
          router.push("/farmer");
        } else if (role === "hotel") {
          router.push("/hotel");
        } else if (role === "driver") {
          router.push("/driver");
        } else if (role === "admin") {
          router.push("/admin");
        } else {
          router.push("/marketplace");
        }
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 relative">
      {/* Language Button */}
      <button
        onClick={() => setLang(lang === "si" ? "en" : "si")}
        className="absolute top-6 right-6 bg-white border border-gray-200 text-sm font-bold px-4 py-2 rounded-xl cursor-pointer hover:bg-gray-50 transition shadow-sm"
      >
        {lang === "si" ? "English 🌐" : "සිංහල 🌐"}
      </button>

      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">{t.title}</h2>
          <p className="text-sm text-gray-500 mt-2">{t.subtitle}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-semibold mb-5 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-semibold mb-5 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
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
          {t.noAcc}{" "}
          <Link href="/register" className="text-green-600 font-bold hover:underline">
            {t.regNow}
          </Link>
        </p>
      </div>
    </div>
  );
}