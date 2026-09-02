// Copy for the 3D scroll experience of the "מה זה נוירון מלאכותי?" lesson
// (neural-networks / artificial-neuron). Each beat owns a slice of the 0..1
// scroll range that drives both the 3D scene and this text overlay — see
// NeuronScrollExperience.tsx.

export type Beat = {
  key: string
  range: [number, number]
  eyebrow: string
  title: string
  body: string
}

export const beats: Beat[] = [
  {
    key: 'hook',
    range: [0, 0.14],
    eyebrow: 'לפני שממשיכים',
    title: 'זה נוירון מלאכותי.',
    body: 'לא תא עצב אמיתי — פונקציה מתמטית קטנה. גללו כדי לראות מה קורה בפנים.',
  },
  {
    key: 'weights',
    range: [0.14, 0.32],
    eyebrow: 'קלט ומשקלים',
    title: 'כל קלט נכנס עם "משקל" משלו.',
    body: 'קו עבה ובהיר = משקל חזק, הקלט הזה משפיע הרבה. קו דהוי = כמעט ולא משפיע. את המשקלים האלה האימון מכוונן.',
  },
  {
    key: 'sum-bias',
    range: [0.32, 0.48],
    eyebrow: 'חיבור',
    title: 'הנוירון מחבר הכל למספר אחד.',
    body: 'כל קלט כפול המשקל שלו, סכום של כל התוצאות, ועוד מספר קבוע — ה-Bias — שמזיז את הסף מעט.',
  },
  {
    key: 'activation',
    range: [0.48, 0.62],
    eyebrow: 'הפעלה',
    title: 'ואז — הוא מחליט.',
    body: 'פונקציית ההפעלה בודקת את הסכום ומחליטה עד כמה הנוירון "יורה" תשובה החוצה. זו כל הפעולה. שום קסם.',
  },
  {
    key: 'pullback',
    range: [0.62, 0.8],
    eyebrow: 'זום אאוט',
    title: 'נוירון אחד לא חכם במיוחד.',
    body: 'הכוח מגיע מחיבור אלפי נוירונים כאלה יחד, בשכבות: קלט → שכבות חבויות → פלט.',
  },
  {
    key: 'depth',
    range: [0.8, 1],
    eyebrow: 'למה "עמוקה"',
    title: 'כל שכבה לומדת רמת הפשטה גבוהה יותר.',
    body: 'בזיהוי פנים: השכבות הראשונות תופסות קווים ופינות. האמצעיות מרכיבות עיניים ואף. העמוקות מזהות פנים שלמות — בלי שאף אחד תכנת "חפש עיניים".',
  },
]

export const scrollHint = 'גללו למטה'
