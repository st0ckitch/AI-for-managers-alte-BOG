/* global window */
/* კონტენტის შენახვა/ჩატვირთვა ბრაუზერის localStorage-ში.
   admin.html არედაქტირებს, deck (index.html) კითხულობს. */
(function () {
  var KEY = "bog_ai_slides_v1";
  window.loadSlides = function () {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
    } catch (e) { /* ignore */ }
    return window.DEFAULT_SLIDES;
  };
  window.saveSlides = function (slides) {
    localStorage.setItem(KEY, JSON.stringify(slides));
  };
  window.resetSlides = function () { localStorage.removeItem(KEY); };
  window.hasEdits = function () { return !!localStorage.getItem(KEY); };
  // Public deck ALWAYS shows the committed slides.js. A localStorage draft is
  // used only inside the admin preview (index.html?preview), so a saved draft
  // can never hide the published content from viewers.
  var isPreview = /[?&]preview(=|&|$)/.test(window.location.search);
  window.SLIDES = isPreview ? window.loadSlides() : window.DEFAULT_SLIDES;
})();
