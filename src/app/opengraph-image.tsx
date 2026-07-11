import { ImageResponse } from "next/og";
import { logoMarkDataUri } from "@/lib/brand/logo-mark-svg";
import { DEFAULT_OG_IMAGE_SIZE, DEFAULT_TITLE, HOME_DESCRIPTION } from "@/lib/seo";

export const alt = DEFAULT_TITLE;
export const size = DEFAULT_OG_IMAGE_SIZE;
export const contentType = "image/png";

export default function OpenGraphImage() {
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
          <img src={logoMarkDataUri()} width={88} height={88} alt="" />
          <div
            style={{
              fontSize: 42,
              fontWeight: 800,
              color: "#1a1a1a",
              letterSpacing: "-0.03em",
            }}
          >
            TribeTip
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "920px" }}>
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              lineHeight: 1.05,
              color: "#1a1a1a",
              letterSpacing: "-0.04em",
            }}
          >
            Creator tips for Africa
          </div>
          <div
            style={{
              fontSize: 34,
              lineHeight: 1.35,
              color: "#3d4f45",
            }}
          >
            {HOME_DESCRIPTION}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
