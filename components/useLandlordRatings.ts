"use client";

import React from "react";

type RatingsMap = Record<string, number>;
const STORAGE_KEY = "rr_landlord_ratings_v1";

function safeParse(json: string | null): RatingsMap {
  if (!json) return {};
  try {
    const obj = JSON.parse(json);
    return obj && typeof obj === "object" ? (obj as RatingsMap) : {};
  } catch {
    return {};
  }
}

export function useLandlordRatings() {
  const [ratings, setRatings] = React.useState<RatingsMap>({});

  React.useEffect(() => {
    setRatings(safeParse(localStorage.getItem(STORAGE_KEY)));
  }, []);

  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ratings));
  }, [ratings]);

  const setRating = (id: string, value: number) => {
    setRatings((prev) => ({ ...prev, [id]: value }));
  };

  const getRating = (id: string) => ratings[id] ?? 0;

  return { getRating, setRating };
}
