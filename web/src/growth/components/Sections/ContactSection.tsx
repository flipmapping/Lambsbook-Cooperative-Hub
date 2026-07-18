// ContactSection.tsx
// LER-001A · Contact Experience
// Authorized mutation: web/src/growth/components/Sections/ContactSection.tsx

import { useEffect, useRef, useState } from "react";

// ─── Assets ──────────────────────────────────────────────────────────────────

import whatsappQr from "../../../assets/qr/Whatsapp.jpg";
import zaloQr      from "../../../assets/qr/zalo.jpg";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Channel {
  id:          string;
  label:       string;
  sublabel:    string;
  icon:        React.ReactNode;
  accent:      string;
  href:        string;
  ariaLabel:   string;
}

// ─── Intersection observer hook ───────────────────────────────────────────────

function useVisible(threshold = 0.15) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, visible };
}

// ─── SVG Icons ───────────────────────────────────────────────────────────────

function WhatsAppIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

function ZaloIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M24 4C12.954 4 4 12.954 4 24s8.954 20 20 20 20-8.954 20-20S35.046 4 24 4zm-3.5 28.5H16v-13h4.5v13zm-2.25-14.75a2.25 2.25 0 1 1 0-4.5 2.25 2.25 0 0 1 0 4.5zM34 32.5h-4l-5-6.5v6.5h-4v-13h4l5 6.5V19.5h4v13z" />
    </svg>
  );
}

function MessengerIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 0C5.373 0 0 4.975 0 11.111c0 3.497 1.745 6.616 4.472 8.652V24l4.086-2.242c1.09.301 2.246.464 3.442.464 6.627 0 12-4.975 12-11.111C24 4.975 18.627 0 12 0zm1.193 14.963l-3.056-3.259-5.963 3.259 6.559-6.963 3.13 3.259 5.889-3.259-6.559 6.963z" />
    </svg>
  );
}

function EmailIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

// ─── Channel data ─────────────────────────────────────────────────────────────

const CHANNELS: Channel[] = [
  {
    id:       "whatsapp",
    label:    "WhatsApp",
    sublabel: "Message us directly",
    icon:     <WhatsAppIcon size={22} />,
    accent:   "#25D366",
    href:     "https://wa.me/",
    ariaLabel:"Contact us on WhatsApp",
  },
  {
    id:       "zalo",
    label:    "Zalo",
    sublabel: "Chat on Zalo",
    icon:     <ZaloIcon size={22} />,
    accent:   "#0068FF",
    href:     "https://zalo.me/",
    ariaLabel:"Contact us on Zalo",
  },
  {
    id:       "messenger",
    label:    "Messenger",
    sublabel: "Find us on Facebook",
    icon:     <MessengerIcon size={22} />,
    accent:   "#0099FF",
    href:     "https://m.me/",
    ariaLabel:"Contact us on Messenger",
  },
];

const EMAIL_ADDRESS = "hello@lambsbook.coop";

// ─── QR card ─────────────────────────────────────────────────────────────────

interface QrCardProps {
  src:      string;
  label:    string;
  accent:   string;
  icon:     React.ReactNode;
  visible:  boolean;
  delay:    string;
}

function QrCard({ src, label, accent, icon, visible, delay }: QrCardProps) {
  return (
    <div
      className={[
        "flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-6",
        "transition-all duration-700 ease-out",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
      ].join(" ")}
      style={{ transitionDelay: visible ? delay : "0ms" }}
    >
      {/* Label row */}
      <div className="flex items-center gap-2" style={{ color: accent }}>
        {icon}
        <span className="text-sm font-semibold">{label}</span>
      </div>

      {/* QR image */}
      <div
        className="rounded-xl overflow-hidden border border-white/10 shadow-lg shadow-black/30"
        style={{ background: "#fff" }}
      >
        <img
          src={src}
          alt={`${label} QR code`}
          width={140}
          height={140}
          className="block w-[140px] h-[140px] object-contain p-1"
          loading="lazy"
          decoding="async"
        />
      </div>

      <p className="text-[11px] text-white/35 tracking-wide">Scan to connect</p>
    </div>
  );
}

// ─── Channel action row ───────────────────────────────────────────────────────

interface ChannelRowProps {
  channel: Channel;
  visible: boolean;
  delay:   string;
  // key is handled by React, not passed as a prop
}

function ChannelRow({ channel, visible, delay }: ChannelRowProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={channel.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={channel.ariaLabel}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      className={[
        "group flex items-center gap-4 rounded-xl border px-5 py-4",
        "outline-none transition-all duration-300 ease-out no-underline",
        "focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
        visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4",
      ].join(" ")}
      style={{
        transitionDelay: visible ? delay : "0ms",
        borderColor:  hovered ? channel.accent + "55" : "rgba(255,255,255,0.1)",
        backgroundColor: hovered ? channel.accent + "12" : "rgba(255,255,255,0.03)",
        color: "inherit",
      }}
    >
      {/* Icon bubble */}
      <span
        className="flex items-center justify-center w-10 h-10 rounded-full shrink-0 transition-colors duration-300"
        style={{
          backgroundColor: hovered ? channel.accent + "25" : channel.accent + "18",
          color: channel.accent,
        }}
      >
        {channel.icon}
      </span>

      {/* Label */}
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors">
          {channel.label}
        </span>
        <span className="text-xs text-white/40">{channel.sublabel}</span>
      </div>

      {/* Arrow */}
      <span
        className="ml-auto text-white/25 text-xs transition-all duration-300 group-hover:translate-x-1"
        style={{ color: hovered ? channel.accent : undefined }}
        aria-hidden="true"
      >
        →
      </span>
    </a>
  );
}

// ─── Email row ────────────────────────────────────────────────────────────────

function EmailRow({ visible }: { visible: boolean }) {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={`mailto:${EMAIL_ADDRESS}`}
      aria-label={`Send us an email at ${EMAIL_ADDRESS}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      className={[
        "group flex items-center gap-4 rounded-xl border px-5 py-4",
        "outline-none transition-all duration-300 ease-out no-underline",
        "focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
        visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4",
      ].join(" ")}
      style={{
        transitionDelay: visible ? "300ms" : "0ms",
        borderColor:     hovered ? "#A78BFA55" : "rgba(255,255,255,0.1)",
        backgroundColor: hovered ? "#A78BFA12" : "rgba(255,255,255,0.03)",
        color: "inherit",
      }}
    >
      <span
        className="flex items-center justify-center w-10 h-10 rounded-full shrink-0 transition-colors duration-300"
        style={{
          backgroundColor: hovered ? "#A78BFA25" : "#A78BFA18",
          color: "#A78BFA",
        }}
      >
        <EmailIcon size={22} />
      </span>

      <div className="flex flex-col min-w-0">
        <span className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors">
          Email
        </span>
        <span
          className="text-xs truncate transition-colors duration-300"
          style={{ color: hovered ? "#A78BFA" : "rgba(255,255,255,0.4)" }}
        >
          {EMAIL_ADDRESS}
        </span>
      </div>

      <span
        className="ml-auto text-xs transition-all duration-300 group-hover:translate-x-1"
        style={{ color: hovered ? "#A78BFA" : "rgba(255,255,255,0.25)" }}
        aria-hidden="true"
      >
        →
      </span>
    </a>
  );
}

// ─── Section header ──────────────────────────────────────────────────────────

function SectionHeader({ visible }: { visible: boolean }) {
  return (
    <header className="mx-auto max-w-2xl text-center mb-14">
      <div
        className={[
          "transition-all duration-700",
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        ].join(" ")}
      >
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-white/40 mb-4">
          Get In Touch
        </p>
        <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-5">
          Connect With Us
        </h2>
        <p className="text-sm leading-relaxed text-white/50 max-w-lg mx-auto">
          Reach out through your preferred channel. We're here to answer your
          questions and support your cooperative journey.
        </p>
      </div>
    </header>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────

export function ContactSection() {
  const { ref, visible } = useVisible();

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      id="contact"
      aria-label="Contact"
      className="relative py-24 sm:py-32 px-4 bg-[#0B0F1A] overflow-hidden"
    >
      {/* Ambient background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-green-600/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-blue-600/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-5xl">
        <SectionHeader visible={visible} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">

          {/* ── Left: channel actions ─────────────────────────────────── */}
          <div className="flex flex-col gap-3">
            <p
              className={[
                "text-[11px] font-semibold tracking-[0.18em] uppercase text-white/30 mb-2 transition-all duration-500",
                visible ? "opacity-100" : "opacity-0",
              ].join(" ")}
            >
              Messaging
            </p>

            {CHANNELS.map((channel, i) => (
              <ChannelRow
                key={channel.id}
                channel={channel}
                visible={visible}
                delay={`${i * 80}ms`}
              />
            ))}

            <div className="mt-2">
              <p
                className={[
                  "text-[11px] font-semibold tracking-[0.18em] uppercase text-white/30 mb-3 transition-all duration-500 delay-200",
                  visible ? "opacity-100" : "opacity-0",
                ].join(" ")}
              >
                Email
              </p>
              <EmailRow visible={visible} />
            </div>
          </div>

          {/* ── Right: QR codes ──────────────────────────────────────── */}
          <div className="flex flex-col gap-6">
            <p
              className={[
                "text-[11px] font-semibold tracking-[0.18em] uppercase text-white/30 transition-all duration-500 delay-100",
                visible ? "opacity-100" : "opacity-0",
              ].join(" ")}
            >
              Scan to Connect
            </p>

            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              <QrCard
                src={whatsappQr}
                label="WhatsApp"
                accent="#25D366"
                icon={<WhatsAppIcon size={18} />}
                visible={visible}
                delay="150ms"
              />
              <QrCard
                src={zaloQr}
                label="Zalo"
                accent="#0068FF"
                icon={<ZaloIcon size={18} />}
                visible={visible}
                delay="250ms"
              />
            </div>

            <p
              className={[
                "text-[11px] text-white/25 leading-relaxed transition-all duration-700 delay-500",
                visible ? "opacity-100" : "opacity-0",
              ].join(" ")}
            >
              Point your phone camera at a QR code to open the chat directly.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
