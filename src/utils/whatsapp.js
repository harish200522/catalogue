const DEFAULT_WA_NUMBER = "919791639162";

/**
 * Returns true only for public, non-base64 image URLs.
 */
function isValidImageUrl(url) {
  if (typeof url !== "string") return false;
  if (url.startsWith("data:image")) return false;
  if (!url.startsWith("http")) return false;
  if (url.includes("localhost") || url.includes("127.0.0.1")) return false;
  return true;
}

/**
 * Returns the first valid public image URL from a product, or null.
 */
function getPublicImageUrl(product) {
  const images = Array.isArray(product.images) ? product.images : [];
  const candidates = product.image ? [...images, product.image] : images;
  for (const url of candidates) {
    if (isValidImageUrl(url)) return url;
    if (typeof url === "string" && url.startsWith("data:image")) {
      console.warn("[WhatsApp] Skipping base64 image — not suitable for WA preview.");
    }
  }
  return null;
}

export function generateWhatsAppLink(product, waNumber = DEFAULT_WA_NUMBER) {
  const imageUrl = getPublicImageUrl(product);

  const lines = [
    `Hi, I'm interested in this product:`,
    ``,
    `Product: ${product.name}`,
    `Price: ₹${product.price}`,
    `${product.quantity}`,
  ];

  if (imageUrl) {
    lines.push(``);
    lines.push(`Product Image:`);
    lines.push(imageUrl);
  }

  lines.push(``);
  lines.push(`Please share more details.`);

  return `https://wa.me/${waNumber}?text=${encodeURIComponent(lines.join("\n"))}`;
}

export function generalWhatsAppLink(waNumber = DEFAULT_WA_NUMBER) {
  const message = "Hi, I would like to know more about your products.";
  return `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
}
