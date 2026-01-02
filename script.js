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
      let tasks = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        tasks.push(
          pdf.getPage(i).then(p =>
            p.getTextContent().then(tc =>
              tc.items.map(it => it.str).join(" ")
            )
          )
        );
      }

      Promise.all(tasks).then(allText => {
        extractMCQ(allText.join(" "));
        if (questions.length === 0) {
          alert("MCQ detect nahi hue — PDF format match nahi hua");
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

  blocks.forEach(block => {
    let options = block.match(/¼[vcln]½[^¼]+/g);
    if (!options || options.length < 4) return;

    let cleanOptions = options
      .filter(o => !o.includes("अनुत्तरित"))
      .map(o => o.replace(/¼[vcln]½/, "").trim());

    if (cleanOptions.length < 4) return;

    // answer = jo option dubara repeat hua ho
    let answerText = null;
    cleanOptions.forEach(opt => {
      let count = block.split(opt).length - 1;
      if (count > 1) answerText = opt;
    });

    if (!answerText) return;

    questions.push({
      question: block.split("¼")[0].trim(),
      options: cleanOptions.slice(0, 4),
      answer: answerText
    });
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
