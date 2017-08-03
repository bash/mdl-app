// Adopted from: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith
if (!window.String.prototype.startsWith) {
  window.String.prototype.startsWith = function (searchString, position) {
    return this.substr(position || 0, searchString.length) === searchString
  }
}
