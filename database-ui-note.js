// V/E Finder v1.1: make approximate postcode coordinates visible to the user.
(() => {
  const originalDetail = detail;
  detail = function(x) {
    originalDetail(x);
    if (x?.coordinateQuality === 'postcode') {
      const routeInfo = document.getElementById('routeInfo');
      if (routeInfo) {
        routeInfo.insertAdjacentHTML(
          'beforebegin',
          '<div class="routebox" style="font-size:11px">⚠️ Position derzeit PLZ-genau. Die Navigation führt in den PLZ-Bereich; die genaue Einfahrt muss noch geprüft werden.</div>'
        );
      }
    }
  };
})();
