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
  window.SLIDES = window.loadSlides();
})();
