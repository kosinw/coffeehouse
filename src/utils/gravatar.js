import md5 from "md5";

export function getGravatarUri(text) {
    return `https://www.gravatar.com/avatar/${md5(text)}?d=identicon`;
}