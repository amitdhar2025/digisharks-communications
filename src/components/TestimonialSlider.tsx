"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  initials: string;
  avatarBg?: string;
}

const testimonials: Testimonial[] = [
  {
    quote: "They have excellent media coverage capabilities and provide great exposure for brands. Truly one of the best in the business. Our visibility grew 4x in just 3 months.",
    author: "Yassmin Mistry",
    role: "Founder, Verified Client",
    initials: "YM",
  },
  {
    quote: "It was great working with Digisharks Communications. They provided valuable opportunities and helped enhance my knowledge. Highly recommended PR and Digital Marketing agency.",
    author: "Uday Kumar",
    role: "CEO, Verified Client",
    initials: "UK",
    avatarBg: "linear-gradient(135deg,var(--violet),var(--pink))",
  },
  {
    quote: "Digisharks Communications is one of the best PR and digital marketing agencies in Delhi NCR. Their team is highly professional, experienced, and supportive throughout.",
    author: "Preeti Packer",
    role: "Director, Verified Client",
    initials: "PP",
    avatarBg: "linear-gradient(135deg,var(--pink),var(--cyan))",
  },
];

export default function TestimonialSlider() {
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const total = testimonials.length;

  // Auto-advance every 5s, paused on interaction
  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % total);
    }, 5000);
  }, [total]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Resume timer after inactivity (3s pause)
  const resumeTimer = useCallback(() => {
    setIsPaused(false);
    startTimer();
  }, [startTimer]);

  const goTo = useCallback(
    (index: number) => {
      setActive(index);
      stopTimer();
      setIsPaused(true);
      // Clear any pending resume timeout
      if (resumeTimerRef.current) {
        clearTimeout(resumeTimerRef.current);
        resumeTimerRef.current = null;
      }
      // Resume after 3s of inactivity
      resumeTimerRef.current = setTimeout(() => resumeTimer(), 3000);
    },
    [stopTimer, resumeTimer]
  );

  // Start timer on mount
  useEffect(() => {
    startTimer();
    return () => {
      stopTimer();
      if (resumeTimerRef.current) {
        clearTimeout(resumeTimerRef.current);
      }
    };
  }, [startTimer, stopTimer]);

  // Swipe support
  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    const threshold = 50;
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // Swipe right → previous
        goTo((active - 1 + total) % total);
      } else {
        // Swipe left → next
        goTo((active + 1) % total);
      }
    }
    touchStartX.current = null;
  };

  return (
    <div className="testimonial-slider-container">
      <div
        className="testimonial-slider-track"
        ref={trackRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseEnter={() => stopTimer()}
        onMouseLeave={() => resumeTimer()}
      >
        {testimonials.map((t, i) => (
          <div
            key={i}
            className={`testimonial-slide ${i === active ? "active" : ""}`}
            style={{ transform: `translateX(${(i - active) * 100}%)` }}
          >
            <div className="testi-card slider-card">
              <div className="stars">★★★★★</div>
              <p className="testi-quote">&ldquo;{t.quote}&rdquo;</p>
              <div className="testi-author">
                <div
                  className="avatar"
                  style={
                    t.avatarBg
                      ? { background: t.avatarBg }
                      : undefined
                  }
                >
                  {t.initials}
                </div>
                <div>
                  <div className="author-name">{t.author}</div>
                  <div className="author-sub">{t.role}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dot pagination */}
      <div className="testimonial-dots">
        {testimonials.map((_, i) => (
          <button
            key={i}
            className={`testimonial-dot ${i === active ? "active" : ""}`}
            onClick={() => goTo(i)}
            aria-label={`Go to testimonial ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
