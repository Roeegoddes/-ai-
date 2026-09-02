// Lesson-specific interactive steps that get spliced into the LessonReader
// card flow for a particular lesson id, after a given content paragraph index.
// This is intentionally NOT the prototype system (LessonPrototype.tsx) — it's a
// small, general-purpose extension point on the *standard* reading flow, used
// today for exactly one lesson. Empty for every lesson id not listed here, so
// every other lesson's flow is byte-for-byte unchanged.

export type AlgoTraceCondition = {
  id: string
  question: string
  /** Whether "כן" is the accurate reading of the shown example for this condition. */
  correctAnswer: boolean
}

export type AlgoTraceData = {
  title: string
  scenario: string
  exampleText: string
  conditions: AlgoTraceCondition[]
  /** Minimum number of true conditions needed to trigger the verdict. */
  threshold: number
  verdictLabel: string
  determinismNote: string
}

export type GigoRow = { icon: string; features: string; label: string }

export type GigoDemoData = {
  title: string
  intro: string
  rows: GigoRow[]
  question: string
  choices: string[]
  correctIndex: number
  explanation: string
}

export type ApplicationCheckData = {
  question: string
  choices: string[]
  correctIndex: number
  explanation: string
}

export type Enrichment =
  | { insertAfterParagraph: number; kind: 'algo-trace'; data: AlgoTraceData }
  | { insertAfterParagraph: number; kind: 'gigo-demo'; data: GigoDemoData }
  | { insertAfterParagraph: number; kind: 'application-check'; data: ApplicationCheckData }

export const lessonEnrichments: Record<string, Enrichment[]> = {
  'how-computers-think': [
    {
      insertAfterParagraph: 1,
      kind: 'algo-trace',
      data: {
        title: 'תרגול — הריצו את האלגוריתם בעצמכם',
        scenario: 'הנה אלגוריתם קבוע לזיהוי ספאם: בודקים 3 תנאים על הודעה, ואם 2 מתוכם מתקיימים או יותר — מסמנים אותה כספאם. בואו נריץ אותו, צעד אחר צעד, על הודעה אמיתית.',
        exampleText: '🎉 זכית בפרס! לחצו כאן עכשיו: bit.ly/free-money !!! הצעה לזמן מוגבל!!!',
        conditions: [
          { id: 'link', question: 'האם ההודעה מכילה קישור מקוצר וחשוד?', correctAnswer: true },
          { id: 'marks', question: 'האם יש 3 סימני קריאה או יותר ברצף (!!!)?', correctAnswer: true },
          { id: 'sender', question: 'האם השולח אינו ברשימת אנשי הקשר שלכם?', correctAnswer: true },
        ],
        threshold: 2,
        verdictLabel: 'ספאם',
        determinismNote:
          'שימו לב למה שקרה: לא היה כאן שום "ניחוש". האלגוריתם ספר בדיוק כמה תנאים התקיימו, והשווה למספר קבוע (2). אם תריצו אותו שוב על אותה הודעה בדיוק — תמיד תקבלו את אותה תוצאה. זו המשמעות של "אלגוריתם": רצף צעדים חד-משמעי, בלי מקום לפרשנות.',
      },
    },
    {
      insertAfterParagraph: 3,
      kind: 'gigo-demo',
      data: {
        title: 'תרגול — נחשו מה המודל "למד"',
        intro:
          'עכשיו הצד השני: נתונים. הנה סט אימון קטן שמישהו נתן למודל שאמור להבדיל בין תפוחים לתפוזים, לפי צבע וגודל:',
        rows: [
          { icon: '🍎', features: 'אדום, קטן', label: 'תפוח' },
          { icon: '🍎', features: 'אדום, קטן', label: 'תפוח' },
          { icon: '🍎', features: 'אדום, קטן', label: 'תפוח' },
          { icon: '🍊', features: 'כתום, גדול', label: 'תפוז' },
          { icon: '🍊', features: 'כתום, גדול', label: 'תפוז' },
          { icon: '🍊', features: 'כתום, גדול', label: 'תפוז' },
        ],
        question: 'בכל הדוגמאות שהמודל ראה, "קטן" הופיע רק עם תפוחים ו"גדול" רק עם תפוזים. מה צפוי לקרות כשיראה תפוח אדום וגדול (נדיר, אבל קיים במציאות)?',
        choices: [
          'יזהה נכון שזה תפוח, כי הוא אדום',
          'כנראה יטעה ויסווג אותו כתפוז — כי מהדוגמאות שראה, הוא "למד" בטעות שגודל הוא הסימן המכריע',
          'יסרב לסווג פרי שהוא לא ראה בדיוק כמוהו',
          'אין מספיק מידע כדי לדעת',
        ],
        correctIndex: 1,
        explanation:
          'זו הטיית מדגם (Sampling Bias): המודל לא באמת "יודע" מה מבדיל תפוח מתפוז — הוא רק מזהה מה שהיה עקבי בנתונים שראה. מכיוון שבמדגם הקטן הזה גודל וסוג הפרי במקרה הלכו יחד, הוא עלול לבנות על כך תלות שגויה. זה בדיוק המשמעות של Garbage in, garbage out: לא בהכרח "נתונים גרועים", אלא נתונים שלא מייצגים את כל המצב.',
      },
    },
    {
      insertAfterParagraph: 3,
      kind: 'application-check',
      data: {
        question: 'מאמנים מודל לזהות כלבים מתוך 500 תמונות — אבל כולן כלבים גדולים, בחוץ, באור יום. מה צפוי לקרות כשיראה כלב קטן, בתוך הבית, בלילה?',
        choices: [
          'יזהה מושלם, כי הוא "מודל AI" ואלה תמיד מדויקים',
          'כנראה יתקשה — הוא מעולם לא ראה כלבים קטנים, בפנים, או בתאורה כזו, כך שהדוגמאות שלו לא מייצגות את כל המקרים האפשריים',
          'יסרב לגמרי לנתח את התמונה',
          'אין שום השפעה — כמות הדוגמאות תמיד קובעת, בלי קשר לגיוון שלהן',
        ],
        correctIndex: 1,
        explanation: 'אותו עיקרון בדיוק כמו בדוגמת התפוח/תפוז: 500 דוגמאות זה הרבה, אבל אם כולן דומות מדי זו לזו, המודל לא נחשף למגוון האמיתי של המקרים — וכך הוא "מכליל" גרוע יותר ממה שהכמות לבדה הייתה מרמזת.',
      },
    },
  ],
  'how-machine-learns': [
    {
      insertAfterParagraph: 1,
      kind: 'gigo-demo',
      data: {
        title: 'תרגול — צפו במודל "לומד" בזמן אמת',
        intro: 'מודל מנסה לנחש את מחיר הדירה האמיתי: 450,000 ₪. הנה 4 סיבובי אימון עוקבים על אותה דירה:',
        rows: [
          { icon: '🎯 סיבוב 1', features: 'ניחוש: 200,000 ₪', label: 'שגיאה: 250,000 ₪' },
          { icon: '🎯 סיבוב 2', features: 'ניחוש: 320,000 ₪', label: 'שגיאה: 130,000 ₪' },
          { icon: '🎯 סיבוב 3', features: 'ניחוש: 410,000 ₪', label: 'שגיאה: 40,000 ₪' },
          { icon: '🎯 סיבוב 4', features: 'ניחוש: 441,000 ₪', label: 'שגיאה: 9,000 ₪' },
        ],
        question: 'מה קורה למשקלים הפנימיים של המודל (Weights) בכל סיבוב, ולמה השגיאה קטנה?',
        choices: [
          'המודל מוחק את הניחוש הקודם ומתחיל מאפס בכל סיבוב',
          'המשקלים מתעדכנים בעדינות בכל סיבוב כדי לצמצם את השגיאה — בלי לאפס את מה שכבר נלמד',
          'המחיר האמיתי משתנה כדי להתאים לניחוש',
          'המודל שומר את הניחוש הקודם בזיכרון ומעתיק אותו בפעם הבאה',
        ],
        correctIndex: 1,
        explanation: 'בדיוק זו המשמעות של אימון: המשקלים מתכווננים בהדרגה, סיבוב אחרי סיבוב, כדי לצמצם את הפער בין הניחוש למציאות — לא איפוס, לא שינון, אלא כיוונון מתמשך.',
      },
    },
  ],
  'supervised-learning': [
    {
      insertAfterParagraph: 2,
      kind: 'application-check',
      data: {
        question: 'מערכת שמנבאת כמה דקות ייקח למשלוח להגיע (על סמך מרחק ותנועה בדרכים) — Classification או Regression?',
        choices: [
          'Classification, כי "זמן הגעה" זו קטגוריה',
          'Regression — התוצאה היא מספר על טווח רציף (כל ערך אפשרי של דקות), לא בחירה מתוך רשימה סגורה',
          'שניהם, תלוי במרחק',
          'אף אחד, זה לא קשור ל-Supervised Learning',
        ],
        correctIndex: 1,
        explanation: 'המבחן הפשוט תמיד עובד: "שם מרשימה סגורה, או מספר על ציר?" זמן הגעה יכול לקבל כל ערך (12 דקות, 12.5, 47...) — זו Regression קלאסית.',
      },
    },
  ],
}
