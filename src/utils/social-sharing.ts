export function generateSocialShareLinks(eventId: string, title: string, description?: string) {
  const baseUrl = `${process.env.CLIENT_URL}/event/${eventId}`;
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description || `Join me at ${title}!`);
  
  return {
    whatsapp: `https://wa.me/?text=${encodedDescription} ${encodeURIComponent(baseUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(baseUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedDescription}&url=${encodeURIComponent(baseUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(baseUrl)}`,
    copyLink: baseUrl,
  };
}
