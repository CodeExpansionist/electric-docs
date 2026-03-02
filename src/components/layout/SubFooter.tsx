import Link from "next/link";

const privacyLinks = [
  { text: "Privacy & cookies policy", url: "/privacy-cookies-policy" },
  { text: "Terms & conditions", url: "/terms-and-conditions" },
  { text: "Product recalls", url: "/product-recalls" },
  { text: "Sitemap", url: "/sitemap" },
];

function SocialIcon({ platform }: { platform: string }) {
  switch (platform) {
    case "Facebook":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );
    case "X":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case "Instagram":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      );
    case "YouTube":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );
    default:
      return null;
  }
}

export default function SubFooter() {
  return (
    <div className="bg-[#292929] text-gray-400">
      <div className="container-main py-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
          {/* Privacy links */}
          <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs">
            {privacyLinks.map((link, i) => (
              <span key={link.text} className="flex items-center gap-2 md:gap-3">
                {i > 0 && <span className="text-gray-500 hidden md:inline">|</span>}
                <Link
                  href={link.url}
                  className="text-gray-400 hover:text-white no-underline transition-colors"
                >
                  {link.text}
                </Link>
              </span>
            ))}
          </div>

          {/* Social icons */}
          <div className="flex items-center gap-4">
            {["Facebook", "X", "Instagram", "YouTube"].map((platform) => (
              <Link
                key={platform}
                href="#"
                className="text-gray-400 hover:text-white no-underline transition-colors"
                aria-label={platform}
              >
                <SocialIcon platform={platform} />
              </Link>
            ))}
          </div>
        </div>

        {/* Legal text */}
        <p className="text-[10px] text-gray-500 leading-relaxed">
          Currys plc registered in England &amp; Wales. Registered number: 07105905.
          Registered office: 1 Portal Way, London, W3 6RS. VAT number: 927 2556 00.
        </p>
      </div>
    </div>
  );
}
