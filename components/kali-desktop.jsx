"use client"

import { useState, useEffect } from "react"
import RetroTerminal from "./retro-terminal"

export default function KaliDesktop() {
  const [terminalOpen, setTerminalOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState("")
  const [currentDate, setCurrentDate] = useState("")

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }))
      setCurrentDate(now.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" }))
    }
    updateDateTime()
    const interval = setInterval(updateDateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  const desktopIcons = [
    { id: "terminal", name: "Terminal", icon: "terminal" },
    { id: "home", name: "Carpeta Personal", icon: "folder" },
    { id: "trash", name: "Papelera", icon: "trash" },
  ]

  const handleIconDoubleClick = (iconId) => {
    if (iconId === "terminal") {
      setTerminalOpen(true)
    }
  }

  const renderIcon = (type) => {
    switch (type) {
      case "terminal":
        return (
          <svg viewBox="0 0 24 24" fill="none" className="w-12 h-12">
            <rect x="2" y="3" width="20" height="18" rx="2" fill="#1a1a2e" stroke="#00ff41" strokeWidth="1.5" />
            <path d="M6 8l4 4-4 4" stroke="#00ff41" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 16h6" stroke="#00ff41" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )
      case "folder":
        return (
          <svg viewBox="0 0 24 24" fill="none" className="w-12 h-12">
            <path
              d="M3 7c0-1.1.9-2 2-2h4l2 2h8c1.1 0 2 .9 2 2v9c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V7z"
              fill="#3b82f6"
              stroke="#60a5fa"
              strokeWidth="1"
            />
          </svg>
        )
      case "trash":
        return (
          <svg viewBox="0 0 24 24" fill="none" className="w-12 h-12">
            <path d="M3 6h18M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" stroke="#9ca3af" strokeWidth="1.5" />
            <path d="M19 6l-1 14c0 1-1 2-2 2H8c-1 0-2-1-2-2L5 6" fill="#4b5563" stroke="#9ca3af" strokeWidth="1.5" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <div
      className="min-h-screen w-full relative overflow-hidden"
      style={{
        backgroundImage: "url('/kali-tiles.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Top Panel - Kali style */}
      <div className="absolute top-0 left-0 right-0 h-8 bg-black/90 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-4">
          <span className="text-white text-sm font-medium">Activities</span>
        </div>
        <div className="flex items-center gap-2 text-white text-sm">
          <span>{currentDate}</span>
          <span>{currentTime}</span>
        </div>
        <div className="flex items-center gap-3">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5z" />
          </svg>
          <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
            S
          </div>
        </div>
      </div>

      {/* Desktop Icons */}
      <div className="absolute top-12 left-4 flex flex-col gap-6 z-40">
        {desktopIcons.map((icon) => (
          <button
            key={icon.id}
            onDoubleClick={() => handleIconDoubleClick(icon.id)}
            className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer group w-20"
          >
            <div className="drop-shadow-lg">{renderIcon(icon.icon)}</div>
            <span className="text-white text-xs text-center font-medium drop-shadow-lg group-hover:bg-blue-600/80 px-1 rounded">
              {icon.name}
            </span>
          </button>
        ))}
      </div>

      {/* Dock Panel - Bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-14 bg-black/80 backdrop-blur-sm flex items-center justify-center gap-2 px-4 z-50">
        <button
          onClick={() => setTerminalOpen(true)}
          className="w-10 h-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-all hover:scale-110"
          title="Terminal del Amor"
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
            <rect x="2" y="3" width="20" height="18" rx="2" fill="#1a1a2e" stroke="#00ff41" strokeWidth="1.5" />
            <path d="M6 8l4 4-4 4" stroke="#00ff41" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 16h6" stroke="#00ff41" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <button className="w-10 h-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-all hover:scale-110">
          <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
            <path
              d="M3 7c0-1.1.9-2 2-2h4l2 2h8c1.1 0 2 .9 2 2v9c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V7z"
              fill="#3b82f6"
              stroke="#60a5fa"
              strokeWidth="1"
            />
          </svg>
        </button>
        <button className="w-10 h-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-all hover:scale-110">
          <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
            <circle cx="12" cy="12" r="10" fill="#f97316" />
            <circle cx="12" cy="12" r="4" fill="white" />
          </svg>
        </button>
        <button className="w-10 h-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-all hover:scale-110">
          <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
            <circle cx="12" cy="12" r="10" stroke="#60a5fa" strokeWidth="2" fill="none" />
            <path d="M12 6v6l4 2" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Terminal Window */}
      {terminalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="relative w-full max-w-[95vw] sm:max-w-xl md:max-w-2xl lg:max-w-2xl xl:max-w-2xl 2xl:max-w-3xl max-h-[78vh] sm:max-h-[82vh] md:max-h-[85vh] lg:max-h-[88vh] xl:max-h-[88vh] 2xl:max-h-[90vh] flex flex-col min-h-0">
            <RetroTerminal onClose={() => setTerminalOpen(false)} />
          </div>
        </div>
      )}

      {/* Click outside to close terminal */}
      {terminalOpen && (
        <div className="absolute inset-0 bg-black/50 z-40" onClick={() => setTerminalOpen(false)} />
      )}
    </div>
  )
}
