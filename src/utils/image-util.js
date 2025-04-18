function getImageURL(name) {
    return new URL(`../../public/${name}`, import.meta.url).href;
}
export { getImageURL };