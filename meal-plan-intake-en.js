// ============================================================
// DAVID COACHING — Meal Plan questionnaire (English)
// ============================================================
// The English version of meal-plan-intake.js, shown when the app is in English. Same sections
// (same ids), same order and the same number of questions, so both versions stay in step.
//
// TO EDIT: change only the text inside the quotes '...' or `...` below.
//   * Each question is one line in the section's `questions` list.
//   * Questions are numbered automatically, straight through the sections.
//   * `defaultOn: false` means the section is NOT sent by default (David ticks it when needed).
//   * `fills` is a hint: which Nutrition Builder field the client's answer goes into.

export const INTAKE_TITLE = 'QUESTIONNAIRE FOR YOUR NUTRITION PLAN';

export const INTAKE_INTRO = `Hi! To build a nutrition plan that fits your body and your life, please answer the questions below.

Answer as things really are, there's no need to make them look "good" — I need to know how you eat and live now so the plan is easy to follow. If a question isn't clear, leave it empty or write "not sure" and I'll ask again. You can reply straight in the message and number your answers by question.`;

export const INTAKE_CLOSING = `Thank you! I'll use this to build a nutrition plan just for you and send it once I've gone through it. If you have a medical condition or are pregnant/breastfeeding, I'll talk it through with you before sending the plan.`;

export const INTAKE_SECTIONS = Object.freeze([
  {
    id: 'basic', title: 'BASIC INFORMATION', defaultOn: true,
    fills: 'Sex, Age, Height, Weight',
    questions: [
      'Sex:',
      'Age (or year of birth):',
      'Height (cm):',
      'Current weight (kg). If you remember, also tell me your weight about 1 month ago:',
    ],
  },
  {
    id: 'goal', title: 'GOAL', defaultOn: true,
    fills: 'Goal',
    questions: [
      'What is your main goal (build muscle, lose fat, maintain weight, gain weight)? What weight or shape would you like to reach, and over roughly how long?',
      'Have you dieted or followed an eating plan before? What worked, and what made it hard to stick to?',
    ],
  },
  {
    id: 'activity', title: 'MOVEMENT AND TRAINING', defaultOn: true,
    fills: 'Daily movement, Training sessions/week, Training time, Training load',
    questions: [
      'What kind of daily work do you do: mostly sitting, lots of walking/standing, or manual labour? If you track it, about how many steps a day do you walk?',
      'How many times a week do you train, for how long, what kind of training (weights, cardio, sports...) and usually at what time?',
    ],
  },
  {
    id: 'schedule', title: 'DAILY SCHEDULE', defaultOn: true,
    fills: 'Work schedule, Sleep hours, Wake-up time, Meals/day',
    questions: [
      'What time do you usually wake up and go to bed? What does your work or study schedule look like (start time, end time, commute)?',
      'How many meals a day would you like to eat (3, 4 or 5)? Do you often skip any meal?',
    ],
  },
  {
    id: 'habits', title: 'CURRENT EATING HABITS', defaultOn: true,
    fills: 'Foods the client usually eats, Dishes the client can cook / often eats',
    questions: [
      'Walk me through a normal day of eating recently: what time each meal is, what you eat and drink (including snacks, soft drinks, coffee, milk tea, alcohol).',
      'Do you usually cook, buy ready-made food or eat out? About how many meals a week do you eat out? What does your kitchen have (fridge, microwave, air fryer...) and at most how many minutes can you spend cooking a meal?',
      'Roughly what is your food budget per day or per week?',
    ],
  },
  {
    id: 'likes', title: 'LIKES AND THINGS TO AVOID', defaultOn: true,
    fills: 'Foods the client usually eats, Foods to avoid, Foods not eaten',
    questions: [
      'Foods you like and often eat:',
      "Foods you don't like or can't eat:",
      'Do you have any food allergies or intolerances (seafood, dairy, peanuts, gluten...)? Are you vegetarian, or do you avoid foods for religious or lifestyle reasons?',
    ],
  },
  {
    id: 'health', title: 'HEALTH', defaultOn: true,
    fills: 'Digestion',
    questions: [
      'How is your digestion (stomach pain, reflux, bloating, constipation or diarrhoea, sensitive to milk...)?',
      'Do you have any medical condition or health issue being monitored (diabetes, blood pressure, cholesterol, gout, thyroid...)? Has your doctor given you any advice about eating?',
      'Are you taking any medication or supplements (whey, creatine, vitamins...)?',
    ],
  },
  {
    id: 'women', title: 'FOR WOMEN ONLY (answer only if relevant)', defaultOn: false,
    fills: 'Cycle (women)',
    questions: [
      'Are you pregnant or breastfeeding? Is your menstrual cycle regular, and when did your last period start?',
    ],
  },
]);

/** The text to send, built from the sections chosen (same rules as meal-plan-intake.js). */
export function intakeText(sectionIds = INTAKE_SECTIONS.filter((section) => section.defaultOn).map((section) => section.id)) {
  const wanted = new Set(sectionIds);
  const chosen = INTAKE_SECTIONS.filter((section) => wanted.has(section.id));
  let number = 0;
  const blocks = chosen.map((section, index) => {
    const lines = section.questions.map((question) => `${++number}. ${question}`);
    return `PART ${index + 1} — ${section.title}\n${lines.join('\n')}`;
  });
  return [INTAKE_TITLE, INTAKE_INTRO, ...blocks, INTAKE_CLOSING].join('\n\n');
}

/** How many questions the chosen sections hold. */
export function intakeQuestionCount(sectionIds) {
  const wanted = new Set(sectionIds);
  return INTAKE_SECTIONS.filter((section) => wanted.has(section.id)).reduce((sum, section) => sum + section.questions.length, 0);
}
