// Utils
// (Typescript Bean ORM)

"use strict";

/**
 * Escapes regular expressions espacial characters.
 * @param text The input text.
 */
export function escapeRegExp(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}
