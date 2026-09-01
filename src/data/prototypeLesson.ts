// Prototype content for a new lesson format: Hook → Prediction → Concept Cards →
// Interactive → Apply It → Understanding Checks → AI Map → Mastery Check.
// Scoped to a single lesson (foundations / what-is-ai) as the course's gold-standard
// example of the format.
//
// Core framing (do not drift from this): AI is a broad field for systems that perform
// tasks like recognition, prediction, understanding, decision-making, or generation.
// Most modern AI happens to be built using models that learn patterns from data —
// but that's the current dominant METHOD, not a definition of what AI IS. Never
// equate "AI" with "pattern recognition." The central misconception this lesson
// targets: complexity/impressiveness does not equal AI — a huge pile of hand-written
// rules is still not AI, and a simple learned model still is.

export const PROTOTYPE_LESSON = { moduleId: 'foundations', lessonId: 'what-is-ai' } as const

export const hook = {
  eyebrow: 'שאלה לפני שמתחילים',
  title: 'פתחתם את נטפליקס. תוך שנייה היא כבר מציעה לכם בדיוק את הסרט שתרצו לראות הערב.',
  subtitle:
    'האם זו "בינה מלאכותית"? ומה זה בכלל אומר? בשיעור הקצר הזה תלמדו להבדיל בין תוכנה שרק *נשמעת* חכמה לבין AI אמיתי — ולמה זה לא תמיד מה שזה נראה.',
  icon: '🎬',
}

export type PredictionOption = { text: string; feedback: string; isClose: boolean }

export const prediction = {
  question: 'לפני שממשיכים — מה ההבדל, לדעתכם, בין שעון מעורר רגיל לבין נטפליקס שממליצה לכם סרטים?',
  options: [
    {
      text: 'אין הבדל אמיתי — שניהם רק תוכנה שמבצעת הוראות',
      feedback: 'שניהם אכן "רק תוכנה" — אבל יש הבדל מהותי באיך שהן מגיעות להתנהגות שלהן. תוך רגע נראה למה זה חשוב.',
      isClose: false,
    },
    {
      text: 'השעון פועל לפי כלל קבוע שמישהו כתב; נטפליקס למדה מדפוסי צפייה של מיליוני משתמשים',
      feedback: 'בול! זה בדיוק ההבדל שנצלול אליו: כלל קבוע שנכתב מראש, מול התנהגות שנלמדה מנתונים.',
      isClose: true,
    },
    {
      text: 'נטפליקס פשוט מסובכת יותר — זה מה שהופך אותה ל-AI',
      feedback: 'זו בדיוק התפיסה השגויה הכי נפוצה שנפרק בשיעור הזה: "מסובך" ו-"AI" הם לא אותו דבר. יש תוכנות מסובכות מאוד שהן לא AI, ותוכנות AI פשוטות. ההבדל האמיתי הוא איך המערכת בנויה מבפנים, לא כמה היא מרשימה מבחוץ.',
      isClose: false,
    },
    {
      text: 'אני לא בטוח/ה',
      feedback: 'לגמרי בסדר לא לדעת — בשביל זה בדיוק בנינו את השיעור הזה. בואו נגלה יחד.',
      isClose: false,
    },
  ] as PredictionOption[],
}

export type DeepDiveStep = { icon: string; text: string }

export type ConceptCard = { icon: string; title: string; text: string; deepDive?: DeepDiveStep[] }

export const conceptCards: ConceptCard[] = [
  {
    icon: '🤖',
    title: 'מה זה בכלל בינה מלאכותית?',
    text: 'בינה מלאכותית (AI) הוא תחום רחב שעוסק בבניית מערכות שמבצעות משימות שדורשות בדרך כלל יכולות "חכמות" — כמו זיהוי, ניבוי, הבנה, קבלת החלטות או יצירה. זה תחום שלם, לא שיטה אחת ולא מכשיר אחד.',
  },
  {
    icon: '📊',
    title: 'איך בדרך כלל בונים מערכות כאלה?',
    text: 'רוב מערכות ה-AI המודרניות בנויות על מודלים שלומדים דפוסים מתוך כמויות גדולות של דוגמאות (נתונים) — במקום שמתכנת יכתוב חוק מפורש לכל מקרה אפשרי. זו השיטה הנפוצה כיום, אבל היא הדרך שבה בונים AI, לא ההגדרה של AI עצמו.',
  },
  {
    icon: '⚖️',
    title: 'ההשוואה שחשוב לזכור: כלל קבוע מול דפוס שנלמד',
    text: 'קחו שני מסנני ספאם. הראשון: מתכנת כתב חוק — "אם המילה \'הגרלה\' מופיעה, סמן כספאם". זה מבצע משימה שנשמעת חכמה, אבל הוא לא AI — הוא רק מבצע הוראה קבועה, בדיוק כמו מחשבון. השני: מודל שלמד מאלפי הודעות ספאם אמיתיות לזהות דפוסים בעצמו, בלי שמתכנת כתב לו את הכללים. זה כן AI.',
    deepDive: [
      { icon: '📋', text: 'מסנן מבוסס-חוקים: מתכנת כותב מראש רשימת מילים/כללים אסורים.' },
      { icon: '✉️', text: 'כל הודעה נבדקת מול הרשימה הקבועה — התאמה = ספאם.' },
      { icon: '🚫', text: 'בעיה: ספאמרים פשוט נמנעים מהמילים ברשימה, והמסנן נתקע במקום.' },
      { icon: '📊', text: 'מסנן מבוסס-AI: מקבל אלפי דוגמאות ספאם ותקין, ומזהה דפוסים בעצמו.' },
      { icon: '🔄', text: 'כשספאם חדש מגיע, המודל מזהה דפוסים דומים — גם בלי לראות בדיוק את אותה הודעה קודם.' },
    ],
  },
  {
    icon: '🔍',
    title: 'אז מה כן בודקים כדי לדעת אם זה AI?',
    text: 'השאלה הנכונה היא לא "זה נשמע חכם?" אלא "איך זה בנוי מבפנים?" — האם מישהו כתב הוראה קבועה מראש (זה לא AI, גם אם התוצאה מרשימה), או שהמערכת למדה את ההתנהגות שלה מתוך נתונים (זה כן AI)? לפעמים אין מספיק מידע כדי לדעת בלי לבדוק — וזה בסדר גמור להגיד "אין לי מספיק מידע".',
  },
]

export type SortVerdict = 'ai' | 'not-ai' | 'unclear'

export type SortItem = { id: string; label: string; icon: string; verdict: SortVerdict; explanation: string }

export const sortItems: SortItem[] = [
  {
    id: 'calculator',
    label: 'מחשבון כיס פשוט',
    icon: '🧮',
    verdict: 'not-ai',
    explanation: 'פועל לפי כללי חשבון קבועים שנכתבו מראש — אין כאן שום למידה מנתונים.',
  },
  {
    id: 'alarm',
    label: 'שעון מעורר דיגיטלי',
    icon: '⏰',
    verdict: 'not-ai',
    explanation: 'מצלצל בשעה שהגדרתם. הוראה קבועה, לא למידה.',
  },
  {
    id: 'netflix',
    label: 'המלצות סרטים בנטפליקס',
    icon: '🎬',
    verdict: 'ai',
    explanation: 'לומדת דפוסי צפייה של מיליוני משתמשים כדי להמליץ לכם באופן אישי.',
  },
  {
    id: 'waze',
    label: 'חיזוי פקקים בוויז',
    icon: '🚗',
    verdict: 'ai',
    explanation: 'לומדת מדפוסי תנועה היסטוריים וחיים כדי לחזות עומס בכביש.',
  },
  {
    id: 'chatgpt',
    label: 'ChatGPT עונה על שאלה',
    icon: '💬',
    verdict: 'ai',
    explanation: 'מודל שלמד מכמויות עצומות של טקסט לנחש תשובות סבירות.',
  },
  {
    id: 'spam-rule',
    label: 'מסנן ספאם שבודק אם המילה "הגרלה" מופיעה בהודעה',
    icon: '📋',
    verdict: 'not-ai',
    explanation: 'כלל קבוע שמתכנת כתב מראש — לא למידה מנתונים, גם אם זה "תופס" ספאם.',
  },
  {
    id: 'spam-learned',
    label: 'מסנן ספאם שאומן על אלפי הודעות מתויגות',
    icon: '📊',
    verdict: 'ai',
    explanation: 'המערכת גילתה בעצמה אילו תבניות מעידות על ספאם, מתוך הדוגמאות.',
  },
  {
    id: 'movie-app',
    label: 'אפליקציה שממליצה לכם על סרט לצפייה — בלי פרטים נוספים על איך',
    icon: '🍿',
    verdict: 'unclear',
    explanation: 'תלוי לגמרי איך היא בנויה: אם היא בוחרת מרשימה קבועה שזהה לכולם — זה לא AI. אם היא לומדת מהטעם האישי שלכם (כמו נטפליקס) — זה כן. בלי לדעת את המנגנון, אי אפשר לקבוע.',
  },
]

export type ApplyVerdict = 'ai' | 'not-ai' | 'unclear'

export type ApplyApp = { id: string; label: string; icon: string; verdict: ApplyVerdict; note: string }

export const applyScenarioIntro = 'דמיינו אפליקציית כושר חדשה בשם "FitTrack". הנה כמה מהתכונות שלה — נחשו אילו מהן, לדעתכם, הן AI:'

export const applyApps: ApplyApp[] = [
  { id: 'steps', label: 'סופרת צעדים לפי חיישן תנועה', icon: '🚶', verdict: 'not-ai', note: 'מודדת תנועה בעזרת חיישן פיזי וסופרת לפי סף קבוע — אין כאן למידה.' },
  { id: 'plan', label: 'בונה תוכנית אימונים מותאמת אישית לפי הביצועים שלכם', icon: '🏋️', verdict: 'ai', note: 'לומדת מהדפוסים שלכם לאורך זמן כדי להתאים תוכנית אישית.' },
  { id: 'posture', label: 'מזהה תרגילים מהמצלמה ומתקנת יציבה', icon: '📸', verdict: 'ai', note: 'מודל שלמד לזהות תנוחות גוף מתוך אלפי דוגמאות וידאו.' },
  { id: 'reminder', label: 'שולחת תזכורת אימון בשעה קבועה שהגדרתם', icon: '⏰', verdict: 'not-ai', note: 'פשוט מפעילה טיימר בשעה שקבעתם — הוראה קבועה.' },
  { id: 'daily-pick', label: 'מציעה "תרגיל היום" מומלץ', icon: '💪', verdict: 'unclear', note: 'תלוי איך היא בוחרת: אם זו רשימה קבועה שמסתובבת לפי תאריך — לא AI. אם היא בוחרת לפי מה שעבד לכם בעבר — כן. בלי לדעת איך זה עובד מבפנים, אי אפשר לקבוע.' },
]

export type CheckQuestion = {
  id: string
  question: string
  choices: string[]
  correctIndex: number
  explanation: string
}

export const understandingChecks: CheckQuestion[] = [
  {
    id: 'uc1',
    question:
      'תוכנת אישור הלוואות בודקת 10,000 שורות של תנאים, כשכל תנאי נכתב ידנית על ידי מומחים. היא נראית מורכבת ומקבלת החלטות פיננסיות. האם זו בינה מלאכותית?',
    choices: [
      'כן, כי היא מאוד מורכבת ומקבלת החלטות חכמות',
      'לא — היא פועלת לפי כללים קבועים שנכתבו מראש, גם אם יש הרבה מהם, ואין כאן למידה מנתונים',
      'כן, כי כל תוכנה שמקבלת החלטות היא AI',
      'אי אפשר לדעת בלי לבדוק את הקוד',
    ],
    correctIndex: 1,
    explanation: 'השאלה כבר נתנה מספיק מידע: "כל תנאי נכתב ידנית". מורכבות וכמות כללים לא הופכות משהו ל-AI — היעדר למידה מנתונים כן מכריע כאן.',
  },
  {
    id: 'uc2',
    question:
      'שתי אפליקציות ניווט מציגות זמן הגעה משוער. אחת מחשבת לפי מרחק קבוע בק"מ בלבד. השנייה לומדת מדפוסי תנועה היסטוריים ונתוני תנועה חיים. איזו מהן AI?',
    choices: [
      'שתיהן, כי שתיהן "חכמות"',
      'רק השנייה — היא לומדת דפוסים מנתונים, לא רק מחשבת לפי כלל קבוע',
      'רק הראשונה, כי היא פשוטה יותר',
      'אף אחת, כי שתיהן רק אפליקציות ניווט',
    ],
    correctIndex: 1,
    explanation: 'חישוב לפי מרחק קבוע הוא כלל קבוע, לא למידה. חיזוי לפי דפוסי תנועה שנלמדו הוא בדיוק ההבדל שמגדיר כאן מי AI ומי לא.',
  },
]
