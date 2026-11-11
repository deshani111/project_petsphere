"use client";

import { useRef, useState } from "react";

export default function ReviewGallery({ children, heading }) {
  const gallery = useRef(null);
  const [active, setActive] = useState(0);

  function move(direction) {
    const cards = gallery.current.children;
    const next = (active + direction + cards.length) % cards.length;
    setActive(next);
    gallery.current.scrollTo({
      left: cards[next].offsetLeft - cards[0].offsetLeft,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }

  return (
    <>
      <div className="section-heading">
        {heading}
        <div className="review-controls">
          <button
            type="button"
            aria-label="Previous review"
            aria-controls="home-reviews"
            onClick={() => move(-1)}
          >
            &larr;
          </button>
          <button
            type="button"
            aria-label="Next review"
            aria-controls="home-reviews"
            onClick={() => move(1)}
          >
            &rarr;
          </button>
        </div>
      </div>
      <div
        className="review-grid"
        id="home-reviews"
        ref={gallery}
        tabIndex={0}
        aria-label="Pet parent reviews"
        onScroll={() => {
          const cards = gallery.current.children;
          const offset = gallery.current.scrollLeft;
          const maxOffset =
            gallery.current.scrollWidth - gallery.current.clientWidth;
          const distance = (index) =>
            Math.abs(
              Math.min(
                cards[index].offsetLeft - cards[0].offsetLeft,
                maxOffset,
              ) - offset,
            );
          let closest = 0;
          for (let i = 1; i < cards.length; i++) {
            if (distance(i) < distance(closest)) closest = i;
          }
          setActive(closest);
        }}
      >
        {children}
      </div>
    </>
  );
}
