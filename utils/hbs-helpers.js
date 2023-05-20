module.exports = {
  // equals as directive in handlebars
  ifeq(a, b, options) {
    if (a.toString() === b.toString()) {
      return options.fn(this);
    }

    return options.inverse(this);
  }
}