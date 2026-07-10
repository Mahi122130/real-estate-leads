"use client";

import React, { useState, useEffect } from "react";
import { submitLeadAndGetRedirect } from "./actions/leadActions";
import { Lock, Send, PlayCircle, Loader2 } from "lucide-react";
import { getVideoEmbedInfo } from "../components/lib/urlParser";

export default function LandingPage() {
  const [days, setDays] = useState<any[]>([]);
  const [selectedDay, setSelectedDay] = useState(1);
  const [unlockedDays, setUnlockedDays] = useState<number[]>([1]);
  const [isLoading, setIsLoading] = useState(true);

  const [loadingWhatsApp, setLoadingWhatsApp] = useState(false);
  const [loadingTelegram, setLoadingTelegram] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    telegram: "",
    whatsapp: "",
  });

  useEffect(() => {
    fetchLiveDays();
  }, []);

  async function fetchLiveDays() {
    try {
      // no-store: this page must always reflect whatever the admin last
      // saved, not a cached response from an earlier visit.
      const res = await fetch("/api/days", { cache: "no-store" });
      const data = await res.json();
      if (data.success && data.days.length > 0) {
        setDays(data.days);
      }
    } catch (error) {
      console.error("Failed to load live days configuration:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const activeContent = days.find((d) => d.day === selectedDay) || days[0] || {
    day: 1,
    title: "Masterclass Day 1",
    description: "Loading masterclass details...",
    videoUrl: "",
    documentUrl: "",
    isLocked: false,
  };

  const videoInfo = getVideoEmbedInfo(activeContent.videoUrl);

  const handleDaySelect = (dayNum: number, isLocked: boolean) => {
    if (dayNum === 1 || (!isLocked && unlockedDays.includes(dayNum))) {
      setSelectedDay(dayNum);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (channel: "whatsapp" | "telegram") => {
    if (!formData.name || !formData.email || !formData.phone) {
      alert("Please fill out Name, Email, and Phone Number.");
      return;
    }

    if (channel === "whatsapp") setLoadingWhatsApp(true);
    if (channel === "telegram") setLoadingTelegram(true);

    try {
      const res = await submitLeadAndGetRedirect({
        ...formData,
        selectedDay,
        channel,
      });

      if (res.success) {
        if (selectedDay < 7 && !unlockedDays.includes(selectedDay + 1)) {
          setUnlockedDays([...unlockedDays, selectedDay + 1]);
        }
        if (res.redirectUrl) {
          window.open(res.redirectUrl, "_blank");
        }
      } else {
        alert(res.error || "Failed to submit details. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoadingWhatsApp(false);
      setLoadingTelegram(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <p className="text-sm text-slate-400 animate-pulse">Loading Hub...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-4xl space-y-8">

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Real Estate Masterclass Hub
          </h1>
          <p className="text-slate-400">
            Select your day, watch the training, and instantly receive your resources.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
          {days.map((d) => {
            const isUnlocked = d.day === 1 || (!d.isLocked && unlockedDays.includes(d.day));
            const isSelected = selectedDay === d.day;

            return (
              <button
                key={d.day}
                type="button"
                onClick={() => handleDaySelect(d.day, d.isLocked)}
                disabled={!isUnlocked || d.isLocked}
                className={`p-3 rounded-xl flex flex-col items-center justify-center border transition-all ${
                  isSelected
                    ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20"
                    : isUnlocked && !d.isLocked
                    ? "bg-slate-900 border-slate-800 text-slate-200 hover:border-slate-700 cursor-pointer"
                    : "bg-slate-900/50 border-slate-900 text-slate-600 cursor-not-allowed"
                }`}
              >
                <div className="flex items-center gap-1 mb-1">
                  {isUnlocked && !d.isLocked ? (
                    <PlayCircle className="w-4 h-4" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                  <span className="font-semibold text-xs">Day {d.day}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-6 space-y-4">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-white">{activeContent.title}</h2>
            <p className="text-sm text-slate-400">{activeContent.description}</p>
          </div>
          <div className="relative aspect-video w-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
            {videoInfo.type === "iframe" && (
              <iframe
                src={videoInfo.src}
                title={activeContent.title}
                className="absolute top-0 left-0 w-full h-full"
                allow="autoplay; fullscreen; encrypted-media"
                allowFullScreen
              />
            )}
            {videoInfo.type === "direct" && (
              <video
                src={videoInfo.src}
                controls
                className="absolute top-0 left-0 w-full h-full"
              />
            )}
            {videoInfo.type === "unsupported" && (
              <p className="text-xs text-slate-500 px-6 text-center">
                {activeContent.videoUrl
                  ? "This video link isn't in a supported format (YouTube, Vimeo, Loom, Google Drive, or a direct .mp4 file)."
                  : `No video link configured for Day ${selectedDay}`}
              </p>
            )}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-lg font-semibold text-white">Get Day {selectedDay} Document</h3>
            <p className="text-sm text-slate-400">
              Fill in your contact details below to instantly receive the day's document via WhatsApp or Telegram.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="John Doe"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="john@example.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Phone Number *</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+1 555 0199"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">WhatsApp Number</label>
              <input
                type="text"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleInputChange}
                placeholder="+15550199"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 text-white"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-xs font-medium text-slate-300">Telegram Username</label>
              <input
                type="text"
                name="telegram"
                value={formData.telegram}
                onChange={handleInputChange}
                placeholder="@username"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 text-white"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={() => handleSubmit("whatsapp")}
              disabled={loadingWhatsApp || loadingTelegram}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium p-3.5 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loadingWhatsApp ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              Send Document via WhatsApp
            </button>
            <button
              type="button"
              onClick={() => handleSubmit("telegram")}
              disabled={loadingWhatsApp || loadingTelegram}
              className="flex-1 bg-sky-600 hover:bg-sky-500 text-white font-medium p-3.5 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loadingTelegram ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              Send Document via Telegram
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}