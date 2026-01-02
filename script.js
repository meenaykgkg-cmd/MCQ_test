// 🔴 IMPORTANT: PDF.js worker fix
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";

const upload = document.getElementById("pdfUpload");
const debug = document.getElementById("debug");

upload.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function () {
    const typedarray = new Uint8Array(this.result);

    pdfjsLib.getDocument(typedarray).promise.then(pdf => {
      let tasks = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        tasks.push(
          pdf.getPage(i).then(page =>
            page.getTextContent().then(tc =>
              tc.items.map(item => item.str).join(" ")
            )
          )
        );
      }

      Promise.all(tasks).then(allText => {
        debug.textContent = allText.join("\n\n");
      });
    }).catch(err => {
      debug.textContent = "PDF load error: " + err.message;
    });
  };

  reader.readAsArrayBuffer(file);
});
