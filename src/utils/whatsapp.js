const DEFAULT_WA_NUMBER = "919791639162";

export function generateWhatsAppLink(product, waNumber = DEFAULT_WA_NUMBER) {
  const message =
    `Hi, I'm interested in this product:\n\n` +
    `Product: ${product.name}\n` +
    `Price: \u20b9${product.price}\n` +
    `${product.quantity}\n\n` +
    `Please share more details.`;
  return `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
}

export function generalWhatsAppLink(waNumber = DEFAULT_WA_NUMBER) {
  const message = "Hi, I would like to know more about your products.";
  return `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
}
