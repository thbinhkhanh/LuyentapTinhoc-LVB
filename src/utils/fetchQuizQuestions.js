import { doc, getDoc } from "firebase/firestore";

/* ===== SHUFFLE ===== */
const shuffleArray = (arr) => {
  if (!Array.isArray(arr)) return [];
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const shuffleUntilDifferent = (arr) => {
  if (!Array.isArray(arr)) return [];
  let shuffled = [...arr];
  let same = true;

  while (same && arr.length > 1) {
    shuffled = shuffleArray(arr);
    same = shuffled.every((v, i) => v === arr[i]);
  }

  return shuffled;
};

/* ===== HÀM LOAD ĐỀ ===== */
export async function fetchQuizQuestions({
  db,
  selectedLop,
  selectedBai,

  setQuestions,
  setLoading,
  setProgress,
  setQuizClass,
  setSnackbar,
  setNotFoundMessage,
  setAnswers,
  setSubmitted,
  setCurrentIndex,
  setFillBlankStatus,
  setStarted,
}) {
  try {
    setLoading(true);
    setProgress(10);

    if (!selectedLop || !selectedBai) {
      setSnackbar?.({
        open: true,
        message: "❌ Thiếu lớp hoặc tên bài học",
        severity: "error",
      });
      return;
    }

    const collectionName = `TRACNGHIEM${selectedLop}`;
    const docRef = doc(db, collectionName, selectedBai);

    setProgress(30);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      const msg = `❌ Không tìm thấy đề ${selectedBai}`;
      setSnackbar?.({ open: true, message: msg, severity: "error" });
      setNotFoundMessage?.(msg);
      return;
    }

    const data = snap.data();
    setQuizClass?.(data.class || "");

    // RESET trạng thái
    setAnswers?.({});
    setSubmitted?.(false);
    setCurrentIndex?.(0);
    setFillBlankStatus?.({});
    setStarted?.(true);

    let saved = Array.isArray(data.questions)
      ? shuffleArray(data.questions)
      : [];

    const questions = saved
      .map((q, index) => {
        const id = q.id ?? `q_${index}`;
        const question =
          typeof q.question === "string" ? q.question.trim() : "";
        const type = (q.type || "").toLowerCase();
        if (!question) return null;

        /* === MATCHING === */
        if (type === "matching") {
          if (!Array.isArray(q.pairs)) return null;

          const leftOptions = q.pairs.map((p) => ({ text: p.left ?? "" }));
          const rightIndexed = q.pairs.map((p, i) => ({ opt: p.right, idx: i }));
          const shuffled =
            q.sortType === "shuffle"
              ? shuffleUntilDifferent(rightIndexed)
              : rightIndexed;

          const map = {};
          shuffled.forEach((s, i) => (map[s.idx] = i));

          return {
            ...q,
            id,
            type,
            question,
            leftOptions,
            rightOptions: shuffled.map(s => s.opt),
            correct: leftOptions.map((_, i) => map[i]),
            score: q.score ?? 1,
          };
        }

        /* === SORT === */
        if (type === "sort") {
          const options = Array.isArray(q.options) ? q.options : [];
          const indexed = options.map((opt, i) => ({ opt, idx: i }));
          const processed =
            q.sortType === "shuffle"
              ? shuffleUntilDifferent(indexed)
              : indexed;

          return {
            ...q,
            id,
            type,
            question,
            options: processed.map(p => p.opt),
            initialSortOrder: processed.map(p => p.idx),
            correctTexts: options,
            score: q.score ?? 1,
          };
        }

        /* === SINGLE / MULTIPLE === */
        if (["single", "multiple"].includes(type)) {
          return {
            ...q,
            id,
            type,
            question,
            options: q.options ?? [],
            correct: Array.isArray(q.correct) ? q.correct : [],
            score: q.score ?? 1,
          };
        }

        /* === TRUE / FALSE === */
        if (type === "truefalse") {
          return {
            ...q,
            id,
            type,
            question,
            options: q.options ?? ["Đúng", "Sai"],
            correct: q.correct ?? [],
            score: q.score ?? 1,
          };
        }

        /* === FILL BLANK === */
        if (type === "fillblank") {
          return {
            ...q,
            id,
            type,
            question,
            options: q.options ?? [],
            score: q.score ?? 1,
          };
        }

        return null;
      })
      .filter(Boolean);

    setQuestions(questions);
    setProgress(100);
  } catch (err) {
    console.error("❌ Load đề lỗi:", err);
    setQuestions([]);
  } finally {
    setLoading(false);
  }
}
