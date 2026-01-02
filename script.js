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
      let texts = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        texts.push(
          pdf.getPage(i).then(p =>
            p.getTextContent().then(tc =>
              tc.items.map(it => it.str).join(" ")
            )
          )
        );
      }

      Promise.all(texts).then(all => {
        extractMCQ(all.join(" "));
        if (questions.length === 0) {
          alert("MCQ detect nahi huye. PDF format match nahi hua.");
          return;
        }
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
    let opts = b.match(/¼[vcln]½[^¼]+/g);
    let ans = b.match(/¼([vcln])½\s*$/);

    if (opts && ans && opts.length >= 4) {
      let optionTexts = opts.map(o =>
        o.replace(/¼[vcln]½/, "").trim()
      );

      let answerIndex = { v: 0, c: 1, l: 2, n: 3 }[ans[1]];

      questions.push({
        question: b.split("¼")[0].trim(),
        options: optionTexts,
        answer: optionTexts[answerIndex]
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
};      });
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
