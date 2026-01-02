let questions = [];
let current = 0;

const upload = document.getElementById("pdfUpload");
const quiz = document.getElementById("quiz");
const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const resultEl = document.getElementById("result");
const nextBtn = document.getElementById("nextBtn");

upload.addEventListener("change", handlePDF);

function handlePDF(e) {
  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onload = function () {
    const typedarray = new Uint8Array(this.result);

    pdfjsLib.getDocument(typedarray).promise.then(pdf => {
      let textPromises = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        textPromises.push(
          pdf.getPage(i).then(page =>
            page.getTextContent().then(tc =>
              tc.items.map(item => item.str).join(" ")
            )
          )
        );
      }

      Promise.all(textPromises).then(pagesText => {
        extractMCQ(pagesText.join(" "));
        quiz.classList.remove("hidden");
        showQuestion();
      });
    });
  };

  reader.readAsArrayBuffer(file);
}

function extractMCQ(text) {
  questions = [];

  let blocks = text.split(/\d+\./).slice(1);

  blocks.forEach(b => {
    let opts = b.match(/\([a-d]\)[^()]+/g);
    let ans = b.match(/Answer[:\-]?\s*\(?([a-d])\)?/i);

    if (opts && ans) {
      questions.push({
        question: b.split("(a)")[0].trim(),
        options: opts.map(o => o.replace(/\([a-d]\)/, "").trim()),
        answer: opts[ans[1].charCodeAt(0) - 97]
          .replace(/\([a-d]\)/, "")
          .trim()
      });
    }
  });
}

function showQuestion() {
  let q = questions[current];
  questionEl.innerText = `Q${current + 1}. ${q.question}`;
  optionsEl.innerHTML = "";
  resultEl.style.display = "none";
  nextBtn.disabled = true;

  q.options.forEach(opt => {
    let btn = document.createElement("button");
    btn.innerText = opt;

    btn.onclick = () => selectAnswer(btn, opt);
    optionsEl.appendChild(btn);
  });
}

function selectAnswer(btn, selected) {
  let correct = questions[current].answer;
  resultEl.style.display = "block";

  Array.from(optionsEl.children).forEach(b => b.disabled = true);

  if (selected === correct) {
    btn.classList.add("correct");
    resultEl.innerHTML = "✅ Correct Answer";
  } else {
    btn.classList.add("wrong");
    resultEl.innerHTML = `❌ Wrong Answer<br>✅ Correct: ${correct}`;
  }

  nextBtn.disabled = false;
}

nextBtn.onclick = () => {
  current++;
  if (current < questions.length) {
    showQuestion();
  } else {
    questionEl.innerText = "🎉 Test Completed";
    optionsEl.innerHTML = "";
    resultEl.innerText = "";
    nextBtn.style.display = "none";
  }
};