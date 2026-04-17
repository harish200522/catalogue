const DEFAULT_WA_NUMBER = "919791639162";

/**
 * Returns the first public image URL from a product, or null if none found.
 * Rejects base64 strings, localhost, and non-http URLs.
 */
function getPublicImageUrl(product) {
  const images = Array.isArray(product.images) ? product.images : [];
  const candidates = product.image ? [...images, product.image] : images;
  for (const url of candidates) {
    if (
      typeof url === "string" &&
      url.startsWith("http") &&
      !url.startsWith("data:") &&
      !url.includes("localhost") &&
      !url.includes("127.0.0.1")
    ) {
      return url;
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

  const message = lines.join("\n");
  return `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
}

export function generalWhatsAppLink(waNumber = DEFAULT_WA_NUMBER) {
  const message = "Hi, I would like to know more about your products.";
  return `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
}
