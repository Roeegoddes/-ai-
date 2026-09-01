// Prototype content for a new lesson format: Hook → Prediction → Concept Cards →
// Interactive → Apply It → Understanding Checks → AI Map → Mastery Check.
// Scoped to a single lesson (foundations / what-is-ai) as a design prototype.

export const PROTOTYPE_LESSON = { moduleId: 'foundations', lessonId: 'what-is-ai' } as const

export const hook = {
  eyebrow: 'שאלה לפני שמתחילים',
  title: 'פתחתם את נטפליקס. תוך שנייה היא כבר מציעה לכם בדיוק את הסרט שתרצו לראות הערב.',
  subtitle: 'איך היא "ידעה" את זה? בשיעור הקצר הזה תגלו — ותבינו מה זה בעצם AI, פעם אחת ולתמיד.',
  icon: '🎬',
}

export type PredictionOption = { text: string; feedback: string; isClose: boolean }

export const prediction = {
  question: 'לפני שנתחיל — מה הניחוש הראשוני שלכם? איך נטפליקס בוחרת מה להמליץ לכם?',
  options: [
    {
      text: 'מישהו בנטפליקס יושב וצופה במה שכל משתמש אוהב, ובוחר ידנית',
      feedback: 'כיוון הגיוני, אבל לא ריאלי בקנה מידה: אין דרך שצוות אנושי יעקוב אחרי מאות מיליוני משתמשים. במקום אדם — יש אלגוריתם שעושה בדיוק את זה, אוטומטית ובענק.',
      isClose: false,
    },
    {
      text: 'מחשב מזהה דפוסים במה שצפיתם, ומשווה אתכם למיליוני משתמשים דומים',
      feedback: 'בול! זו בדיוק המהות של איך AI עובד — זיהוי דפוסים בקנה מידה ענק. תוך כמה דקות תראו למה זה עובד ככה.',
      isClose: true,
    },
    {
      text: 'זה פשוט אקראי לגמרי',
      feedback: 'זה בהחלט לא מרגיש ככה כי ההמלצות טובות מדי — ובצדק: מאחורי הקלעים יש חישוב מדויק שמבוסס על נתונים אמיתיים על ההתנהגות שלכם, לא הגרלה.',
      isClose: false,
    },
    {
      text: 'אין לי מושג',
      feedback: 'לגמרי בסדר לא לדעת — בשביל זה בדיוק בנינו את השיעור הזה. בואו נגלה יחד, שלב אחר שלב.',
      isClose: false,
    },
  ] as PredictionOption[],
}

export type DeepDiveStep = { icon: string; text: string }

export type ConceptCard = { icon: string; title: string; text: string; deepDive?: DeepDiveStep[] }

export const conceptCards: ConceptCard[] = [
  {
    icon: '🤖',
    title: 'AI = מחשב שמזהה דפוסים',
    text: 'בינה מלאכותית היא היכולת של מחשב לבצע משימות שבעבר דרשו "חשיבה" אנושית — כמו לזהות תמונה או להמליץ על סרט.',
  },
  {
    icon: '🧠',
    title: 'הוא לא "חושב" כמו בן אדם',
    text: 'למחשב אין מודעות או רגשות. הוא לא "מבין" — הוא מוצא דפוסים סטטיסטיים בכמויות ענקיות של דוגמאות.',
  },
  {
    icon: '📊',
    title: 'מיליוני דוגמאות → ניחוש טוב',
    text: 'נטפליקס ראתה מיליוני אנשים דומים לכם, ולמדה שמי שאהב סרט X בדרך כלל אוהב גם סרט Y. זו סטטיסטיקה בקנה מידה ענק — לא קסם.',
    deepDive: [
      { icon: '👥', text: 'מיליוני משתמשים צופים בסרטים, וכל צפייה נרשמת כנתון.' },
      { icon: '🔗', text: 'המערכת מוצאת דפוס חוזר: "מי שאהב את X, לרוב אהב גם את Y".' },
      { icon: '🧬', text: 'היא בונה לכם "טביעת אצבע" של טעם, לפי מה שצפיתם וכמה זמן.' },
      { icon: '🎯', text: 'היא מוצאת משתמשים אחרים עם טביעת אצבע דומה לשלכם.' },
      { icon: '🍿', text: 'ואז ממליצה לכם על מה שהם אהבו — ואתם עוד לא ראיתם.' },
    ],
  },
  {
    icon: '📱',
    title: 'AI כבר נמצא כמעט בכל מקום',
    text: 'מצלמת הפנים בטלפון, מסנן הספאם באימייל, ה-GPS שמחשב מסלול — כולם AI, רק בצורות ומורכבות שונות.',
  },
]

export type SortItem = { id: string; label: string; icon: string; isAI: boolean; explanation: string }

export const sortItems: SortItem[] = [
  {
    id: 'netflix',
    label: 'המלצות סרטים בנטפליקס',
    icon: '🎬',
    isAI: true,
    explanation: 'לומד דפוסי צפייה של מיליוני משתמשים כדי להמליץ לכם.',
  },
  {
    id: 'calculator',
    label: 'מחשבון כיס פשוט',
    icon: '🧮',
    isAI: false,
    explanation: 'פועל לפי כללי חשבון קבועים שנכתבו מראש — אין כאן שום למידה מנתונים.',
  },
  {
    id: 'spam',
    label: 'מסנן ספאם באימייל',
    icon: '📧',
    isAI: true,
    explanation: 'לומד לזהות דפוסים של הודעות ספאם מתוך אלפי דוגמאות.',
  },
  {
    id: 'clock',
    label: 'שעון קיר מכני',
    icon: '🕐',
    isAI: false,
    explanation: 'רק מודד זמן בצורה מכנית קבועה — אין כאן שום "החלטה" חכמה.',
  },
  {
    id: 'face-unlock',
    label: 'פתיחת טלפון בזיהוי פנים',
    icon: '🔓',
    isAI: true,
    explanation: 'מזהה דפוסים בתווי הפנים שלכם כדי לוודא שזה אתם.',
  },
  {
    id: 'elevator',
    label: 'כפתור קריאה למעלית',
    icon: '🛗',
    isAI: false,
    explanation: 'לוחצים וזה שולח פקודה קבועה — אין כאן שום למידה מדפוסים.',
  },
]

export type ApplyApp = { id: string; label: string; icon: string; usesAI: boolean; note: string }

export const applyApps: ApplyApp[] = [
  { id: 'whatsapp', label: 'וואטסאפ', icon: '💬', usesAI: true, note: 'תמלול הודעות קוליות ותרגום הודעות מתבססים על AI.' },
  { id: 'waze', label: 'ווייז / גוגל מפות', icon: '🗺️', usesAI: true, note: 'חיזוי פקקים ובחירת המסלול המהיר משתמשים בדפוסי תנועה שנלמדו.' },
  { id: 'instagram', label: 'אינסטגרם', icon: '📸', usesAI: true, note: 'הפיד וההמלצות מדורגים על ידי מודל שלומד מה מעניין אתכם.' },
  { id: 'gmail', label: 'ג׳ימייל', icon: '✉️', usesAI: true, note: 'סינון ספאם והשלמת משפטים אוטומטית מבוססים על AI.' },
  { id: 'spotify', label: 'ספוטיפיי', icon: '🎧', usesAI: true, note: 'פלייליסטים מותאמים אישית נבנים מדפוסי האזנה.' },
  { id: 'flashlight', label: 'פנס בטלפון', icon: '🔦', usesAI: false, note: 'פשוט מדליק/מכבה LED — אין כאן שום למידה או דפוס.' },
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
    question: 'לפי מה שלמדתם עד כה — האם למחשב יש "רגשות" כשהוא מזהה דפוס?',
    choices: ['כן, תמיד', 'לא — הוא רק מזהה דפוסים סטטיסטיים, בלי מודעות או רגש', 'רק במודלים חדשים מאוד', 'זה תלוי בכמות הזיכרון'],
    correctIndex: 1,
    explanation: 'AI לא מודע ואין לו רגשות — הוא כלי סטטיסטי שמזהה דפוסים ומשתמש בהם כדי לנחש.',
  },
  {
    id: 'uc2',
    question: 'למה נטפליקס "יודעת" מה להמליץ לכם?',
    choices: ['היא מנחשת אקראית', 'היא למדה דפוסים ממיליוני משתמשים דומים לכם', 'עובד אנושי צופה בכם', 'זה קסם טכנולוגי בלתי מוסבר'],
    correctIndex: 1,
    explanation: 'ההמלצה מבוססת על דפוסים שנלמדו מהתנהגות מיליוני משתמשים — לא קסם וגם לא עבודה ידנית.',
  },
]

export const applyReveal =
  'שמתם לב? כמעט כל אפליקציה שאתם פותחים היום משתמשת ב-AI במקום כלשהו — בפיד, בהמלצות, בסינון או בניווט. AI הפסיק להיות "עתידני" — הוא כבר כאן, בשקט, ברוב מסך הבית שלכם.'
