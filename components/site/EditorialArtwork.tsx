export function EditorialArtwork({ variant = "hero" }: { variant?: "hero" | "hands" }) {
  if (variant === "hands") {
    return (
      <svg viewBox="0 0 640 320" className="h-auto w-full" role="img" aria-label="Minh họa hai bàn tay tìm đến nhau">
        <defs>
          <linearGradient id="hand-sky" x1="0" x2="1">
            <stop offset="0" stopColor="#e8f0d8" />
            <stop offset="1" stopColor="#f8d8cf" />
          </linearGradient>
        </defs>
        <rect width="640" height="320" rx="36" fill="url(#hand-sky)" />
        <path d="M0 268c92-26 146-30 222-12 54 13 90 8 132-9 73-29 145-19 286 23v50H0z" fill="#d6e3bb" opacity=".72" />
        <path d="M44 88c65 12 100 34 135 71 17 18 42 26 68 26 20 0 38 10 48 26 7 11-5 23-18 18l-55-22c-15-6-26-2-35 11-6 9-19 11-28 4l-51-42c-22-18-50-31-79-36z" fill="#f2c0a9" stroke="#c85a50" strokeWidth="3" />
        <path d="M596 86c-65 12-100 34-135 71-17 18-42 26-68 26-20 0-38 10-48 26-7 11 5 23 18 18l55-22c15-6 26-2 35 11 6 9 19 11 28 4l51-42c22-18 50-31 79-36z" fill="#e7b1a5" stroke="#8ba77c" strokeWidth="3" />
        <path d="M284 189c17-19 31-18 42-4 11-14 25-15 42 4-16 26-29 39-42 48-13-9-26-22-42-48z" fill="#c85a50" opacity=".9" />
        <circle cx="106" cy="60" r="11" fill="#f1d76b" /><circle cx="532" cy="55" r="8" fill="#f1d76b" />
        <path d="M83 240c12-21 25-31 43-37M557 239c-12-21-25-31-43-37" stroke="#8ba77c" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 680 560" className="h-auto w-full" role="img" aria-label="Minh họa mềm mại về tiền bạc và kết nối">
      <defs>
        <linearGradient id="hero-paper" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#fff8e8" />
          <stop offset="1" stopColor="#f5d7cf" />
        </linearGradient>
        <linearGradient id="hero-sage" x1="0" x2="1">
          <stop offset="0" stopColor="#b6cf9c" />
          <stop offset="1" stopColor="#7fa272" />
        </linearGradient>
      </defs>
      <rect width="680" height="560" rx="44" fill="url(#hero-paper)" />
      <path d="M0 451c88-46 155-36 239-10 67 21 143 12 209-24 74-41 139-35 232 12v131H0z" fill="#dce8be" opacity=".82" />
      <path d="M0 54c116 56 171 26 243-21 58-38 126-39 194 15 67 53 130 57 243 11v-59H0z" fill="#f8d4c8" opacity=".55" />
      <circle cx="506" cy="144" r="72" fill="#f1d76b" opacity=".9" />
      <circle cx="548" cy="116" r="15" fill="#fff4c5" />
      <path d="M86 446c20-91 23-164 7-238M109 446c-4-103 19-170 61-226M112 322c-28-24-49-32-78-25M133 288c26-33 54-46 83-43" fill="none" stroke="#78946d" strokeWidth="5" strokeLinecap="round" />
      <path d="M76 276c-20-10-38-7-55 8 24 20 49 19 72 6M160 246c18-15 38-18 59-8-19 24-43 28-67 19" fill="#9fbf8d" stroke="#78946d" strokeWidth="2" />
      <path d="M600 503c-19-85-14-155 14-225M578 503c-10-92-36-149-76-190M585 355c23-23 46-30 73-22M565 324c-28-27-53-36-80-28" fill="none" stroke="#78946d" strokeWidth="5" strokeLinecap="round" />
      <path d="M595 284c18-14 36-14 54-4-16 22-38 27-59 18M514 294c-18-16-38-21-58-14 18 23 39 29 62 22" fill="#9fbf8d" stroke="#78946d" strokeWidth="2" />
      <path d="M255 355c24-23 45-34 66-35 16 0 30 8 37 21 8 14 7 31-2 44l-23 34c-11 17-12 37-4 58l11 31h-91c-14-47-14-84 3-111z" fill="#d99386" stroke="#a9514d" strokeWidth="3" />
      <path d="M407 355c-24-23-45-34-66-35-16 0-30 8-37 21-8 14-7 31 2 44l23 34c11 17 12 37 4 58l-11 31h91c14-47 14-84-3-111z" fill="#e7b5aa" stroke="#a9514d" strokeWidth="3" />
      <circle cx="315" cy="315" r="23" fill="#f0bf9f" stroke="#a9514d" strokeWidth="3" />
      <circle cx="365" cy="315" r="23" fill="#f0bf9f" stroke="#a9514d" strokeWidth="3" />
      <path d="M309 321c8-5 13-5 20 0M351 321c8-5 13-5 20 0" fill="none" stroke="#8b4a42" strokeWidth="3" strokeLinecap="round" />
      <path d="M322 340c10 10 22 10 32 0" fill="none" stroke="#8b4a42" strokeWidth="3" strokeLinecap="round" />
      <circle cx="234" cy="113" r="20" fill="#f0c53f" stroke="#c58e28" strokeWidth="3" /><circle cx="259" cy="127" r="20" fill="#f5d85f" stroke="#c58e28" strokeWidth="3" />
      <path d="M228 108h13M228 115h10M252 122h13M252 129h10" stroke="#c58e28" strokeWidth="2" strokeLinecap="round" />
      <path d="M338 99l6 15 16 2-12 10 4 16-14-8-14 8 4-16-12-10 16-2z" fill="#f1d76b" opacity=".95" />
      <path d="M420 190c17-27 37-37 60-31-7 25-25 39-51 43M447 204c11 8 20 19 26 35" fill="none" stroke="#8ba77c" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}
