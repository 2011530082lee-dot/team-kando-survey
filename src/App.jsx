import { useState } from "react";
import { supabase } from "./supabase";

const QUESTIONS = [
  { id: "nickname", type: "text", title: "呼びやすい名前を教えてください", placeholder: "ニックネームでOKです" },
  { id: "q1", type: "single", title: "失礼ながらおいくつですか", options: ["20〜24歳", "25〜29歳", "30〜34歳", "35〜39歳", "40歳以上"] },
  { id: "q2", type: "single", title: "住んでるとこは？", options: ["大阪市中心部（中央区・西区・浪速区・北区など）", "大阪市内その他", "大阪府内（市外）", "兵庫・京都・奈良など近隣", "その他"] },
  { id: "q3", type: "single", title: "何暮らし？？", options: ["一人暮らし", "パートナーと同棲・結婚（子どもなし）", "子育て中", "実家暮らし", "その他"] },
  { id: "q4", type: "multi", title: "大阪で「よく行く」とこ", subtitle: "複数選んでOKです", options: ["梅田・北新地", "なんば・心斎橋", "堀江", "天満・中崎町", "阿倍野・天王寺", "うめきた（グラングリーン大阪）", "その他"] },
  { id: "q5", type: "text", title: "Q4で選んだエリアの中で一番好きなとこ", subtitle: "その理由も教えてください", placeholder: "" },
  { id: "q6", type: "text", aside: "わかります！めっちゃいいですよね。", title: "逆に「最近あまり行かんな」「昔は行っていたけど今は行かん」とこ", subtitle: "理由も含めて教えてください", placeholder: "" },
  { id: "q7", type: "text", title: "最近ハマっていること・趣味を", subtitle: "こっそり教えていただけますか", placeholder: "例：レコード収集、筋トレ、キャンプ、コーヒーなど何でも" },
  { id: "q8", type: "text", title: "直近1ヶ月で「まじでお金を使ってよかった！！」", subtitle: "と思った買い物・体験は何ですか？", placeholder: "" },
  { id: "q9", type: "single", title: "自分は流行りに敏感な方だと思いますか？", options: ["かなり敏感な方", "まあまあ敏感な方", "普通", "あまり敏感じゃない", "全然"] },
  { id: "q10", type: "multi", title: "土日何してますか", subtitle: "複数選んでOKです", options: ["家でゆっくり", "カフェや喫茶店でだべる", "ご友人とお食事", "デートとかはナシです", "一人でぶらぶら街歩き・ウィンドウショッピング", "運動・スポーツ", "展示会・映画・ライブなどカルチャー系", "ショッピングモール・商業施設で買い物", "自然界隈（公園、キャンプなど）", "その他"] },
  { id: "q11", type: "single", title: "誰かとどこかに行くとき、自分から提案する方ですか？", options: ["けっこう提案する派", "誘われたら乗る派", "半々くらい"] },
  { id: "q12", type: "text", title: "「どこいく〜？なにする〜？」ってなったとき", subtitle: "まず何をしますか？", placeholder: "例：Instagramで検索する、行きつけの場所に提案する、友達に聞く、など" },
  { id: "q13", type: "text", title: "逆に、一人で「なんかでかけたいな〜」ってなったとき", subtitle: "どこで何しますか？", placeholder: "" },
  { id: "q14", type: "text", title: "「理想の休日」を1日の流れで", subtitle: "教えてください", placeholder: "例：朝は近所のカフェでモーニング→午後は堀江で服を見て→夕方はご飯" },
  { id: "q15", type: "text", title: "絶対無理に近いと思いますけど、平日の仕事帰りに", subtitle: "ふらっと立ち寄りたくなる場所・時間の過ごし方はありますか？", placeholder: "" },
  { id: "q16", type: "text", title: "Instagramでよくチェックしている", subtitle: "好きなインフルエンサー・アカウントがあれば教えてください", placeholder: "ジャンル問わず、複数でもOKです" },
];


const CHOICE_IDS = QUESTIONS.filter((q) => q.type === "single" || q.type === "multi").map((q) => q.id);
const TEXT_IDS = QUESTIONS.filter((q) => q.type === "text" && q.id !== "nickname").map((q) => q.id);
const TOTAL = QUESTIONS.length;

function Confetti() {
  return (
    <>
      <div style={{
        position: "fixed", top: -90, right: -70, width: 220, height: 220,
        borderRadius: "50%", background: "#E6EEE3", opacity: 0.75,
        pointerEvents: "none"
      }} />
      <div style={{
        position: "fixed", bottom: -110, left: -80, width: 260, height: 260,
        borderRadius: "50%", background: "#F1E8DD", opacity: 0.8,
        pointerEvents: "none"
      }} />
      <div style={{
        position: "fixed", top: "16%", left: "7%", width: 10, height: 10,
        borderRadius: "50%", background: "#C9D8C8", opacity: 0.8,
        pointerEvents: "none"
      }} />
      <div style={{
        position: "fixed", bottom: "19%", right: "7%", width: 8, height: 8,
        borderRadius: "50%", background: "#DDBFAE", opacity: 0.75,
        pointerEvents: "none"
      }} />
    </>
  );
}

export default function App() {
  const [stage, setStage] = useState("intro"); // intro | question | done
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [otherText, setOtherText] = useState({});
  const [saveState, setSaveState] = useState("idle");
  const current = QUESTIONS[step];

  function goNext() {
    if (step < TOTAL - 1) setStep(step + 1);
    else submitResponse();
  }

  function goBack() {
    if (step > 0) setStep(step - 1);
  }

  function setAnswer(id, value) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  function toggleMulti(id, option) {
    setAnswers((prev) => {
      const list = Array.isArray(prev[id]) ? prev[id] : [];
      const has = list.includes(option);
      const next = has ? list.filter((o) => o !== option) : [...list, option];
      return { ...prev, [id]: next };
    });
  }

  function selectSingle(id, option) {
    setAnswer(id, option);
    setTimeout(() => goNext(), 260);
  }

  async function submitResponse() {
    setSaveState("saving");
    setStage("done");
    const payload = {
      nickname: answers.nickname || "名無し",
      answers,
      otherText,
      submittedAt: new Date().toISOString(),
    };

    try {
      const { error } = await supabase.from("survey_responses").insert({
        nickname: payload.nickname,
        answers: payload.answers,
        other_text: payload.otherText,
        submitted_at: payload.submittedAt,
      });
      setSaveState(error ? "error" : "saved");
    } catch (e) {
      console.error(e);
      setSaveState("error");
    }
  }

  const progressPct = stage === "question" ? Math.round(((step + 1) / TOTAL) * 100) : stage === "done" ? 100 : 0;

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@500;700&family=Zen+Maru+Gothic:wght@400;500;700&display=swap');
      `}</style>
      <Confetti />
      <div style={styles.stage}>
        {stage === "intro" && (
          <div style={styles.card}>
            <div style={styles.kickerRow}>
              <span style={styles.kickerEn}>TEAM</span>
              <span style={styles.kickerJp}>感度高い</span>
            </div>
            <h1 style={styles.introTitle}>開いてくれてありがとうございます🙏</h1>
            <p style={styles.introText}>
              少し個人的なことも聞いちゃいますが、気軽な感じで答えてもらえると嬉しいです。お手間かけてすみません…！
            </p>
            <p style={styles.introNote}>※正直「感度」ってなんやねんって自分でも思ってます、</p>
            <div style={styles.metaRow}>
              <span style={styles.metaPill}>🍙 コンビニ行って戻れるくらい</span>
              <span style={styles.metaPill}>全{TOTAL}問</span>
            </div>
            <button style={styles.primaryBtn} onClick={() => setStage("question")}>
              START
            </button>
          </div>
        )}

        {stage === "question" && (
          <div style={styles.card}>
            <div style={styles.progressWrap}>
              <div style={styles.progressTrack}>
                <div style={{ ...styles.progressFill, width: `${progressPct}%` }} />
              </div>
              <span style={styles.progressLabel}>Q{step + 1} / {TOTAL}</span>
            </div>

            <div key={current.id} style={styles.questionBlock}>
              {current.aside && <p style={styles.aside}>{current.aside}</p>}
              <h2 style={styles.questionTitle}>{current.title}</h2>
              {current.subtitle && <p style={styles.questionSubtitle}>{current.subtitle}</p>}

              {current.type === "single" && (
                <div style={styles.optionList}>
                  {current.options.map((opt) => {
                    const selected = answers[current.id] === opt;
                    return (
                      <button
                        key={opt}
                        onClick={() => selectSingle(current.id, opt)}
                        style={{ ...styles.optionPill, ...(selected ? styles.optionPillSelected : {}) }}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              )}

              {current.type === "multi" && (
                <div style={styles.optionList}>
                  {current.options.map((opt) => {
                    const list = Array.isArray(answers[current.id]) ? answers[current.id] : [];
                    const selected = list.includes(opt);
                    return (
                      <div key={opt}>
                        <button
                          onClick={() => toggleMulti(current.id, opt)}
                          style={{ ...styles.optionPill, ...(selected ? styles.optionPillSelected : {}) }}
                        >
                          <span style={styles.checkbox}>{selected ? "✓" : ""}</span>
                          {opt}
                        </button>
                        {opt === "その他" && selected && (
                          <input
                            style={styles.otherInput}
                            placeholder="よければ教えてください"
                            value={otherText[current.id] || ""}
                            onChange={(e) => setOtherText((p) => ({ ...p, [current.id]: e.target.value }))}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {current.type === "text" && (
                <textarea
                  style={styles.textArea}
                  rows={3}
                  placeholder={current.placeholder}
                  value={answers[current.id] || ""}
                  onChange={(e) => setAnswer(current.id, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      goNext();
                    }
                  }}
                />
              )}
            </div>

            <div style={styles.navRow}>
              <button
                onClick={goBack}
                disabled={step === 0}
                style={{ ...styles.ghostBtn, opacity: step === 0 ? 0.35 : 1, cursor: step === 0 ? "default" : "pointer" }}
              >
                ← BACK
              </button>
              {current.type !== "single" && (
                <button style={styles.primaryBtnSmall} onClick={goNext}>
                  {step === TOTAL - 1 ? "SEND ✦" : "NEXT"}
                </button>
              )}
            </div>
          </div>
        )}

        {stage === "done" && (
          <div style={styles.card}>
            <div style={styles.doneEmoji}>🎉</div>
            <h1 style={styles.introTitle}>答えてくれてありがとうございました</h1>
            <p style={styles.introText}>またどこかで、こっそり感想聞かせてください。</p>
            <p style={styles.saveStatus}>
              {saveState === "saving" && "保存中…"}
              {saveState === "saved" && "✓ ちゃんと届きました"}
              {saveState === "error" && "うまく保存できなかったかも…もう一度送ってみてください"}
            </p>
          </div>
        )}

      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    width: "100%",
    background: "#F4F1EA",
    fontFamily: "'Zen Maru Gothic', 'Kosugi Maru', sans-serif",
    color: "#31433B",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "28px 18px",
    boxSizing: "border-box",
  },

  stage: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    maxWidth: 520,
  },

  card: {
    background: "#FFFCF7",
    border: "1px solid #DDD8CC",
    borderRadius: 28,
    padding: "34px 30px 28px",
    boxSizing: "border-box",
    boxShadow: "0 18px 50px rgba(62, 72, 62, 0.10)",
  },

  kickerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    marginBottom: 18,
    flexWrap: "wrap",
  },

  kickerEn: {
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 700,
    fontSize: 11,
    letterSpacing: "0.18em",
    color: "#758B78",
    background: "#E7EEE5",
    borderRadius: 999,
    padding: "6px 10px",
  },

  kickerJp: {
    fontFamily: "'Zen Maru Gothic', sans-serif",
    fontWeight: 700,
    fontSize: 13,
    color: "#53675B",
  },

  introTitle: {
    fontFamily: "'Zen Maru Gothic', sans-serif",
    fontSize: 25,
    lineHeight: 1.55,
    color: "#304238",
    margin: "0 0 14px 0",
    fontWeight: 700,
    textAlign: "center",
    letterSpacing: "-0.02em",
  },

  introText: {
    fontSize: 13.5,
    lineHeight: 1.9,
    color: "#68736C",
    margin: "0 auto 12px",
    textAlign: "center",
    maxWidth: 390,
  },

  introNote: {
    fontSize: "12px",
    lineHeight: 1.7,
    color: "#7A786D",
    background: "#F5F0E4",
    border: "1px solid #E5DECE",
    borderRadius: 14,
    padding: "10px 13px",
    margin: "16px 0 18px",
    textAlign: "center",
  },

  metaRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 7,
    marginBottom: 22,
    justifyContent: "center",
  },

  metaPill: {
    fontSize: 11.5,
    color: "#5F7064",
    background: "#EEF3EB",
    border: "1px solid #DCE6D9",
    borderRadius: 999,
    padding: "7px 11px",
    fontWeight: 700,
  },

  primaryBtn: {
    width: "100%",
    border: "none",
    background: "#718A78",
    color: "#FFFDF8",
    fontFamily: "'DM Sans', 'Zen Maru Gothic', sans-serif",
    fontWeight: 700,
    fontSize: 14,
    letterSpacing: "0.12em",
    padding: "14px 0",
    borderRadius: 999,
    cursor: "pointer",
    boxShadow: "0 7px 18px rgba(93, 118, 99, 0.20)",
    transition: "transform .18s ease, box-shadow .18s ease",
  },

  primaryBtnSmall: {
    border: "none",
    background: "#718A78",
    color: "#FFFDF8",
    fontFamily: "'DM Sans', 'Zen Maru Gothic', sans-serif",
    fontWeight: 700,
    fontSize: 12.5,
    letterSpacing: "0.10em",
    padding: "11px 19px",
    borderRadius: 999,
    cursor: "pointer",
    boxShadow: "0 6px 15px rgba(93, 118, 99, 0.18)",
  },

  ghostBtn: {
    border: "none",
    background: "transparent",
    color: "#89918A",
    fontFamily: "'DM Sans', 'Zen Maru Gothic', sans-serif",
    fontSize: 11.5,
    fontWeight: 700,
    letterSpacing: "0.08em",
    padding: "10px 4px",
  },

  linkBtn: {
    display: "block",
    margin: "15px auto 0",
    border: "none",
    background: "transparent",
    color: "#7B887F",
    fontFamily: "'DM Sans', 'Zen Maru Gothic', sans-serif",
    fontWeight: 700,
    fontSize: "11px",
    letterSpacing: "0.08em",
    cursor: "pointer",
    textAlign: "center",
  },

  progressWrap: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 30,
  },

  progressTrack: {
    flex: 1,
    height: 5,
    borderRadius: 999,
    background: "#E8E7E0",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    background: "#718A78",
    borderRadius: 999,
    transition: "width 0.35s ease",
  },

  progressLabel: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 10.5,
    color: "#8A918B",
    fontWeight: 700,
    whiteSpace: "nowrap",
    letterSpacing: "0.08em",
  },

  questionBlock: {
    minHeight: 250,
  },

  aside: {
    display: "inline-block",
    fontSize: "11px",
    color: "#A57C65",
    background: "#F7EDE5",
    borderRadius: 999,
    padding: "5px 9px",
    fontWeight: 700,
    margin: "0 0 12px",
  },

  questionTitle: {
    fontFamily: "'Zen Maru Gothic', sans-serif",
    fontSize: 20,
    lineHeight: 1.65,
    color: "#304238",
    fontWeight: 700,
    margin: "0 0 5px",
    letterSpacing: "-0.015em",
  },

  questionSubtitle: {
    fontSize: 12.5,
    color: "#8A918B",
    margin: "0 0 20px",
    lineHeight: 1.7,
  },

  optionList: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    marginTop: 18,
  },

  optionPill: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    textAlign: "left",
    border: "1px solid #DDDCD4",
    background: "#FFFFFF",
    color: "#4A5950",
    fontFamily: "inherit",
    fontSize: "13px",
    lineHeight: 1.45,
    padding: "12px 14px",
    borderRadius: 14,
    cursor: "pointer",
    width: "100%",
    boxSizing: "border-box",
    boxShadow: "none",
    transition: "all .16s ease",
  },

  optionPillSelected: {
    border: "1px solid #AABBAA",
    background: "#EDF3EB",
    color: "#405448",
    fontWeight: 700,
    boxShadow: "inset 0 0 0 1px #D8E4D6",
  },

  checkbox: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 19,
    height: 19,
    borderRadius: 50,
    border: "1px solid #C9CEC8",
    fontSize: 11,
    color: "#718A78",
    flexShrink: 0,
    background: "#FAFAF7",
  },

  otherInput: {
    width: "100%",
    marginTop: 7,
    marginBottom: 3,
    fontFamily: "inherit",
    fontSize: 12.5,
    color: "#405048",
    padding: "10px 13px",
    borderRadius: 12,
    border: "1px solid #D8D9D1",
    boxSizing: "border-box",
    background: "#FBFBF8",
    outline: "none",
  },

  textArea: {
    width: "100%",
    marginTop: 17,
    fontFamily: "inherit",
    fontSize: "13px",
    lineHeight: 1.8,
    color: "#405048",
    padding: "14px 15px",
    borderRadius: 15,
    border: "1px solid #D9DAD2",
    boxSizing: "border-box",
    resize: "vertical",
    background: "#FBFBF8",
    outline: "none",
    minHeight: 116,
  },

  textAreaSingleLine: {
    width: "100%",
    fontFamily: "inherit",
    fontSize: "13px",
    color: "#405048",
    padding: "12px 14px",
    borderRadius: 13,
    border: "1px solid #D9DAD2",
    boxSizing: "border-box",
    background: "#FBFBF8",
    marginBottom: 12,
    outline: "none",
  },

  errorText: {
    fontSize: "12px",
    color: "#A86558",
    textAlign: "center",
    marginBottom: 10,
    fontWeight: 700,
  },

  navRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
  },

  doneEmoji: {
    fontSize: 34,
    marginBottom: 10,
    textAlign: "center",
  },

  saveStatus: {
    fontSize: "12px",
    color: "#8A918B",
    textAlign: "center",
    margin: "7px 0 4px",
  },

  resultsScroll: {
    maxHeight: 380,
    overflowY: "auto",
    paddingRight: 4,
    marginBottom: 16,
  },

  personCard: {
    marginBottom: 9,
    border: "1px solid #DDDCD4",
    borderRadius: 14,
    overflow: "hidden",
    background: "#FFFFFF",
  },

  personHeader: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    border: "none",
    background: "#EEF3EB",
    fontFamily: "inherit",
    fontWeight: 700,
    fontSize: 13,
    color: "#405448",
    padding: "12px 14px",
    cursor: "pointer",
  },

  personName: {
    fontFamily: "inherit",
  },

  personToggle: {
    fontSize: 10,
    color: "#87948B",
  },

  personBody: {
    padding: "13px 14px",
    display: "flex",
    flexDirection: "column",
    gap: 11,
  },

  qaRow: {
    borderBottom: "1px solid #ECEAE3",
    paddingBottom: 9,
  },

  qaQ: {
    fontSize: 10.5,
    color: "#969C96",
    margin: "0 0 4px",
  },

  qaA: {
    fontSize: 12.5,
    color: "#405048",
    margin: 0,
    lineHeight: 1.65,
    fontWeight: 600,
  },
};
