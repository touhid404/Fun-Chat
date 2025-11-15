import { useState, useEffect } from "react";

function getRandomAvatar(seed) {
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(seed)}`;
}

export function useDummyAvatar(seed) {
  const [avatar, setAvatar] = useState("");

  useEffect(() => {
    if (!seed) return;
    setAvatar(getRandomAvatar(seed));
  }, [seed]);

  return avatar;
}
