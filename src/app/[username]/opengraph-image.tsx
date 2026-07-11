import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { fetchPublicProfile } from "@/lib/api";
import { logoMarkDataUri } from "@/lib/brand/logo-mark-svg";
import { creatorInitials } from "@/lib/creator-initials";
import { creatorLocationLabel } from "@/lib/market-label";
import { isValidPublicUsername } from "@/lib/public-tip-path";
import { DEFAULT_OG_IMAGE_SIZE } from "@/lib/seo";

export const alt = "Tip a creator on TribeTip";
export const size = DEFAULT_OG_IMAGE_SIZE;
export const contentType = "image/png";

type CreatorOpenGraphImageProps = {
  params: Promise<{ username: string }>;
};

function truncateText(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 3)}...`;
}

export default async function CreatorOpenGraphImage({ params }: CreatorOpenGraphImageProps) {
  const { username } = await params;

  if (!isValidPublicUsername(username)) {
    notFound();
  }

  let profile;

  try {
    profile = await fetchPublicProfile(username);
  } catch {
    notFound();
  }

  const location = creatorLocationLabel(profile.country_code);
  const description =
    profile.bio?.trim() ||
    `Support ${profile.display_name} with tips in ${profile.currency} via mobile money or card.`;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #f7fff9 0%, #e7f9ef 45%, #ffffff 100%)",
          padding: "72px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <img src={logoMarkDataUri()} width={72} height={72} alt="" />
          <div
            style={{
              fontSize: 34,
              fontWeight: 700,
              color: "#1a1a1a",
              letterSpacing: "-0.02em",
            }}
          >
            TribeTip
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", gap: "32px" }}>
          <div
            style={{
              display: "flex",
              width: 128,
              height: 128,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 32,
              background: "#dcfce7",
              color: "#166534",
              fontSize: 48,
              fontWeight: 800,
            }}
          >
            {creatorInitials(profile.display_name)}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: 860 }}>
            <div
              style={{
                fontSize: 64,
                fontWeight: 800,
                lineHeight: 1.05,
                color: "#1a1a1a",
                letterSpacing: "-0.04em",
              }}
            >
              Tip {profile.display_name}
            </div>
            <div style={{ fontSize: 30, color: "#166534", fontWeight: 700 }}>
              @{profile.username} · {location} · {profile.currency}
            </div>
            <div
              style={{
                fontSize: 30,
                lineHeight: 1.35,
                color: "#3d4f45",
              }}
            >
              {truncateText(description, 180)}
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
