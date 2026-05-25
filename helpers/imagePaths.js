const DEFAULT_PROJECT_IMAGE = "/images/gallery.jpg";
const DEFAULT_PRODUCT_IMAGE = "/images/blank.png";

function hasValue(value) {
  return typeof value === "string" && value.trim() !== "";
}

function firstImage(images, fallback) {
  if (!Array.isArray(images)) {
    return fallback;
  }

  const image = images.find(hasValue);
  return image || fallback;
}

function validImages(images) {
  if (!Array.isArray(images)) {
    return [];
  }

  return images.filter(hasValue);
}

function projectImage(project) {
  if (!project) {
    return DEFAULT_PROJECT_IMAGE;
  }

  return firstImage(project.images, DEFAULT_PROJECT_IMAGE);
}

function projectImages(project) {
  if (!project) {
    return [DEFAULT_PROJECT_IMAGE];
  }

  const images = validImages(project.images);
  return images.length ? images : [DEFAULT_PROJECT_IMAGE];
}

function productImage(product) {
  if (!product || !product._id) {
    return DEFAULT_PRODUCT_IMAGE;
  }

  return `/product/image/${product._id}`;
}

module.exports = {
  DEFAULT_PROJECT_IMAGE,
  DEFAULT_PRODUCT_IMAGE,
  projectImage,
  projectImages,
  productImage,
};
