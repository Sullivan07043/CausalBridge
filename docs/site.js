document.querySelectorAll(".copy").forEach(function (b) {
  b.addEventListener("click", function () {
    var t = b.getAttribute("data-copy");
    var done = function () { b.textContent = "Copied"; setTimeout(function () { b.textContent = "Copy"; }, 1600); };
    if (navigator.clipboard) { navigator.clipboard.writeText(t).then(done, function () {}); }
  });
});
