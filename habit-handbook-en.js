// ============================================================
// DAVID COACHING — Behaviour Change Handbook (English)
// ============================================================
// The English version of habit-handbook.js: same parts, same section ids, same block kinds,
// so the links ("I'm struggling with…", the buttons to Set up / Track) land in the same place.
// When the Vietnamese text in habit-handbook.js changes, change this one too.
// Translated 2026-11-16 for David to review.

const p = (text) => ({ kind: 'p', text });
const h = (text) => ({ kind: 'h', text });
const ul = (...items) => ({ kind: 'ul', items });
const ol = (...items) => ({ kind: 'ol', items });
const quote = (text, by) => ({ kind: 'quote', text, by });
const formula = (title, text, ...examples) => ({ kind: 'formula', title, text, examples });
const callout = (text) => ({ kind: 'callout', text });
const cta = (label, goto) => ({ kind: 'cta', label, goto });
const coach = (title, ...blocks) => ({ kind: 'coach', title, blocks });

export const HANDBOOK_INTRO_EN = Object.freeze({
  id: 'intro',
  title: 'Introduction',
  blocks: [
    p('This handbook won’t tell you which exercises to do, how many sessions a week to train, or how many grams of protein to eat each day. Those numbers live in the training program and nutrition plan I design for you, updated in David Coaching. This handbook is about something more fundamental, and in my view more important than the program itself: how to actually follow it, day after day, including the days you have no motivation.'),
    p('In more than a decade of coaching, I have come to an uncomfortable truth: the best training program and the most scientific nutrition plan are useless if they are not carried out. For most clients the problem is not a lack of knowledge. The internet has more than enough knowledge. The problem is the gap between knowing and doing — and that gap is filled by habits, not by willpower.'),
    p('The content of this handbook is built on modern behavioural science — especially the principles laid out in James Clear’s Atomic Habits — combined with my own experience coaching clients in the gym. These are not tips or inspirational quotes. This is a testable model of how the human brain forms and keeps behaviours, retold for a specific setting: the gym, your meals, your sleep, and the small decisions you make every day.'),
    h('How to use this handbook'),
    ul(
      'Read it through once in your first week with me, before going deep into the details of your program.',
      'Come back to individual parts when you feel unmotivated, off track, or are struggling with a specific habit — each part is written to be read on its own.',
      'Do the habit Set up right here on the website. It is not a theory exercise — it is the tool for designing your own environment and system.',
      'Treat this as a living document. Read it again in three months and you will read it differently.',
    ),
    quote('You do not rise to the level of your goals. You fall to the level of your systems.', 'James Clear, Atomic Habits'),
    p('My goal is not to help you get a great body in three months and lose it in the next three. My goal is to help you become the kind of person for whom training and eating with discipline is simply normal, not something you have to cling to with motivation. That is what this handbook will help you build.'),
  ],
});

export const HANDBOOK_PARTS_EN = Object.freeze([
  {
    id: 'A',
    title: 'Foundations: why small changes create big results',
    sections: [
      {
        id: 'a1',
        title: 'A1. The compound interest of habits',
        blocks: [
          p('An athlete who gets 1% better every day won’t see a difference within a single session. But kept up for a year, the maths is 1.01³⁶⁵ ≈ 37.8 — nearly 38 times better than where they started. The other way round, getting 1% worse every day for a year takes you close to zero. This is exactly how British Cycling — the British cycling team that went almost a century without medals — became the most successful team in Olympic history in just 5 years, by improving 1% in hundreds of small details: from saddle padding and massage gel to the right way to wash hands to avoid colds.'),
          p('The results you have today — your weight, strength, endurance, health — are a lagging measure of the habits you have repeated in the past. The important question is not where you are, but where your trajectory is heading. Someone who is overweight but building the right eating habits every day is on a far better trajectory than someone at an ideal weight whose habits are slowly drifting the wrong way.'),
          h('The Plateau of Latent Potential'),
          p('This is the most common reason clients give up: they train well and eat well for 3–4 weeks, see no clear change on the scale or in the mirror, and decide “this doesn’t work for me”. But biological progress is not linear. Think of an ice cube in a room warming from 25°F to 31°F — nothing happens — until it reaches 32°F and melts. The effort between 25 and 31 degrees is not wasted; it is building up below the threshold you can see. James Clear calls this stage the Plateau of Latent Potential, and the discouraging stretch before the breakthrough the Valley of Disappointment.'),
          coach('Using it with clients',
            p('When a client says “I’ve trained for a month and nothing has changed”, don’t rush to change the program. Ask: is the system (number of sessions, sleep quality, average protein per day) being kept up consistently? If so, this is the Valley of Disappointment, not the wrong program.'),
            p('Use non-scale victories so the client can see evidence of progress during the plateau: weight on the bar going up, reps completed, daytime energy, sleep quality, waist size.'),
          ),
          h('Systems, not goals'),
          p('“Lose 10 kg” is a goal. Goals only create temporary change — once you reach one, if the system behind it (eating and movement habits) hasn’t changed, you drift back to where you started. That is the classic yo-yo effect of dieting. Four problems with focusing only on goals:'),
          ol(
            'Winners and losers have the same goal — everyone wants to lose weight; the difference lies in the daily system, not in the goal.',
            'Reaching a goal only changes a moment — a cleaned room gets messy again if the cleaning habit doesn’t change.',
            'Goals tie your happiness to a single milestone in the future — you put off feeling satisfied until you “get there”.',
            'Goals clash with long-term progress — many people stop training right after reaching a goal because the reason (a competition, a wedding, summer) has passed.',
          ),
          p('My role with you is not to set a number to conquer and then let go. My role is to help you build a system you can run for the rest of your life — whatever your short-term goal is.'),
        ],
      },
      {
        id: 'a2',
        title: 'A2. Identity drives behaviour',
        blocks: [
          p('This is the most important part of the whole handbook. Real behaviour change happens on three layers: outcomes (what you achieve — losing weight, building muscle), process (what you do — your training program, your eating plan), and identity (who you believe you are). Most people start with outcomes. The more lasting way is to go the other direction: start with identity.'),
          p('Compare two answers when offered a cigarette: “No thanks, I’m trying to quit” versus “No thanks, I don’t smoke”. The first still believes they are a smoker holding back. The second has changed identity. In your context: the difference between “I’m trying to lose weight” and “I’m someone who takes care of my body” is not just words — it decides what you choose when nobody is watching.'),
          quote('The goal is not to read a book, the goal is to become a reader. The goal is not to run a marathon, the goal is to become a runner.', 'James Clear'),
          h('A two-step process to change your identity'),
          ol(
            'Decide the kind of person you want to be — not “I want to lose 10 kg” but “I am someone who is disciplined about my health”.',
            'Prove it to yourself with small wins, again and again.',
          ),
          p('Every time you turn up to a session you planned, every time you choose the right meal over the convenient one, that is a vote for the identity of “a disciplined person”. You don’t need a unanimous vote — you just need the majority. Missing one session doesn’t destroy that identity, as long as most of the votes go the right way.'),
          coach('Exercise for the onboarding session',
            ul(
              'Ask the client: “Who is the kind of person who could get the result you want?” — instead of “how many kg do you want to lose?”.',
              'Help the client write 2–3 concrete identity statements and put them somewhere they see every day — the fridge, the phone lock screen.',
              'In later PT sessions, keep linking actions to identity: “This is exactly what someone who values their health would do” — rather than only praising results.',
            ),
          ),
          cta('Write your “I am the kind of person who…” line', 'setup'),
        ],
      },
      {
        id: 'a3',
        title: 'A3. The habit loop and the Four Laws',
        blocks: [
          p('Every habit — good or bad — runs through the same four-step cycle, repeated constantly and almost entirely unconsciously:'),
          callout('1. Cue → 2. Craving → 3. Response → 4. Reward'),
          ul(
            'Cue: a piece of information that predicts a reward — a 6 a.m. alarm, a gym bag ready by the door.',
            'Craving: the motivation behind the behaviour. You don’t crave the gym; you crave the energy or the pride afterwards.',
            'Response: the actual behaviour — whether you train or not depends on how strong the craving is and how hard (how much friction) the action is.',
            'Reward: satisfies the craving and teaches the brain to remember “this behaviour is worth repeating”.',
          ),
          p('From these four steps James Clear built the Four Laws of Behaviour Change — a practical framework that all of Part B of this handbook works through in detail:'),
          formula('The Four Laws', '', 'Law 1 (Cue) — Make it Obvious', 'Law 2 (Craving) — Make it Attractive', 'Law 3 (Response) — Make it Easy', 'Law 4 (Reward) — Make it Satisfying'),
          p('To build a good habit (training, eating well, sleeping enough), apply all four laws forwards. To break a bad habit (late-night snacking, scrolling instead of sleeping), invert all four: make it invisible, unattractive, difficult and unsatisfying. Part B goes into each law with concrete uses for training and nutrition.'),
          cta('Set up your habits', 'setup'),
        ],
      },
    ],
  },
  {
    id: 'B',
    title: 'The Four Laws — applied to training and nutrition',
    sections: [
      {
        id: 'b1',
        title: 'B1. Law 1 — Make it Obvious',
        blocks: [
          p('Most habits fail not for lack of motivation but for lack of awareness. People often don’t notice which cue is triggering their behaviour. The first step to change is turning unconscious cues into conscious ones.'),
          h('Implementation intention'),
          p('Research shows that people who make a specific plan for when and where they will act follow through far more often than people with only a general intention. The formula:'),
          formula('Implementation intention formula', 'I will [BEHAVIOUR] at [TIME] in [LOCATION].',
            'I will train at 6:30 a.m. at the gym near my home, before work.',
            'I will prepare tomorrow’s lunch at 8:00 p.m. the night before, in my kitchen.'),
          h('Habit stacking'),
          p('Attach a new habit to one that is already settled in your day — instead of trying to remember it on its own.'),
          formula('Habit stacking formula', 'After [CURRENT HABIT], I will [NEW HABIT].',
            'After I finish making my morning coffee, I will put my gym bag by the front door.',
            'After I sit down to dinner, I will open David Coaching and log my lunch.'),
          p('The deciding factor: the cue must be specific and actionable right away. “After my lunch break I’ll do 10 push-ups” is vague — before or after eating? Where? “After I close my laptop for lunch, I’ll do 10 push-ups right next to my desk” is no longer vague.'),
          h('Environment design'),
          p('Your environment shapes behaviour more than willpower does. The brain responds to what stands out in view. The principle: make the cues of good habits obvious and easy to see, and make the cues of bad habits disappear from view.'),
          p('In practice:'),
          ul(
            'Lay out your training clothes and water bottle next to the bed or the door the night before.',
            'Put ready-made meal boxes or cut fruit where you see them first when you open the fridge; hide snacks in a closed, hard-to-reach drawer.',
            'Put fixed training times in your phone calendar with a reminder 30 minutes before — let the time be the cue instead of waiting to “feel motivated”.',
            'Give each space one function: if you can, keep eating separate from working or relaxing, to avoid eating mindlessly in front of a screen.',
          ),
          h('The secret of self-control: less exposure, not more resistance'),
          p('Self-control is a short-term strategy, not a long-term solution — nobody has enough willpower to keep resisting temptation. People who seem to have “good self-control” usually just put themselves in tempting situations less often. The inversion of Law 1: make bad habits invisible.'),
          ul(
            'Don’t keep snacks at home, instead of trying to “not touch them” once they are already in the kitchen.',
            'Turn off notifications from food-delivery apps and remove them from your home screen.',
            'If you skip training because you scroll your phone in the morning, leave the phone in another room overnight and use a separate alarm clock.',
          ),
          cta('Write the cue for your habit', 'setup'),
        ],
      },
      {
        id: 'b2',
        title: 'B2. Law 2 — Make it Attractive',
        blocks: [
          p('A habit is a loop driven by dopamine. Interestingly, dopamine spikes not when you get the reward but when you anticipate it. It is the anticipation — not the satisfaction — that drives action. That is why making a habit attractive in your mind matters so much.'),
          h('Temptation bundling'),
          p('Pair something you need to do with something you want to do, so the “need” becomes more attractive.'),
          formula('Temptation bundling formula', 'After [THING I NEED TO DO], I will [THING I WANT TO DO].',
            'Only listen to your favourite podcast or playlist while training — not at any other time.',
            'Only watch your favourite show while on the exercise bike (cardio).'),
          h('The role of family, friends and community'),
          p('People tend to imitate the behaviour of three social groups: the close (family, close friends), the many (the community around them), and the powerful (people with status, who are admired). A habit becomes far more attractive when it is “normal” behaviour in the group you belong to.'),
          p('In practice:'),
          ul(
            'Train with friends, join a small group at the gym, or share your progress with people close to you — make training your social norm rather than a lonely effort.',
            'If your current social environment (colleagues who keep inviting you out drinking, a family that eats unhealthily) works against your goals, find a new community with the same values — a group class, a running club.',
            'For David Coaching clients: regular PT sessions and the shared progress checklist are a form of “community” that creates positive pressure and a social norm.',
          ),
          h('Reframe it: from “have to” to “get to”'),
          p('Every behaviour has a surface motive and a deeper motive underneath. Whether something feels attractive comes not from the action itself but from how you predict and interpret it in your head. Instead of thinking “I have to go train”, reframe it as “I get the chance to build strength and energy for my body”. This is not fooling yourself — it is choosing the framing that reflects the real benefit of the action.'),
          quote('He who has a why to live for can bear almost any how.', 'Friedrich Nietzsche, quoted in Atomic Habits'),
        ],
      },
      {
        id: 'b3',
        title: 'B3. Law 3 — Make it Easy',
        blocks: [
          p('How many times you repeat a behaviour matters more than how much time has passed. There is no magic “21 days” or “66 days” to form a habit — what matters is how often you do it. And you can only do it often when it is easy enough to do even on the days you are tired, busy or unmotivated.'),
          h('The Law of Least Effort'),
          p('People naturally lean towards the option that takes the least effort. This is not a weakness — it is how the brain saves energy. The right strategy is not to fight this law but to design your environment so that the right behaviour is also the one with the least friction.'),
          p('Reduce friction for good behaviour:'),
          ul(
            'Get your training clothes, shoes and water bottle ready the night before — fewer steps in the morning.',
            'Choose a gym on your way to work or school over a “better” gym 20 minutes further away — travel distance is the strongest predictor of dropping out.',
            'Meal prep for the week instead of cooking every meal — make eating well the default, with no decision needed every time you are hungry.',
            'Buy a yearly or quarterly membership up front (one decision) instead of paying per visit — going becomes “it’s paid for, I’m going” rather than a decision every day.',
          ),
          p('Add friction to bad behaviour:'),
          ul(
            'Don’t stock snacks at home — having to go out to buy them is enough friction for many people to skip it.',
            'Log out of food-delivery apps and delete your saved card details.',
            'If after-work drinks keep pulling you away from training, have an excuse ready and your gym kit in the car, so “gym first” is easier than “drinks first”.',
          ),
          h('The Two-Minute Rule'),
          p('Every big habit can be scaled down to a starting version that takes less than two minutes. The point is not to finish a whole session in two minutes — it is to make “getting started” almost free of barriers. Once you have started, carrying on is much easier than starting from zero.'),
          ul(
            '“Exercise 3 times a week” → 2-minute version: “Put on my training clothes and step out the door.”',
            '“Eat healthily” → 2-minute version: “Plan the week’s menu on Sunday.”',
            '“Sleep 7–8 hours” → 2-minute version: “Turn off screens and leave my phone outside the bedroom at 10 p.m.”',
          ),
          p('This is also the most important strategy for beginners and for anyone badly lacking motivation: don’t start with the optimal program; start with the minimum standard version, then optimise gradually. You can’t improve a habit that doesn’t exist yet.'),
          h('Automation: make the good behaviour inevitable'),
          p('A one-time decision can create benefits that repeat forever without ongoing willpower. This is the strongest form of Law 3.'),
          ul(
            'Book a fixed weekly PT slot instead of booking each session as you go — training becomes a set commitment rather than a decision every week.',
            'Set a phone alarm to remind you to log meals in David Coaching at a fixed time.',
            'Set up an automatic monthly transfer into a small “health fund” to cover your gym or PT — removing a money barrier you would otherwise have to decide on again every month.',
          ),
          cta('Write your 2-minute version', 'setup'),
        ],
      },
      {
        id: 'b4',
        title: 'B4. Law 4 — Make it Satisfying',
        blocks: [
          quote('The Cardinal Rule of Behaviour Change: what is immediately rewarded is repeated. What is immediately punished is avoided.', 'James Clear'),
          p('The human brain is wired to prefer immediate rewards over delayed ones — an evolutionary legacy from when our ancestors had to react quickly to their surroundings to survive. That is exactly why training and eating well are hard to keep up: the cost (fatigue, holding back) comes right away, while the reward (health, physique) comes weeks or months later. Fast food and inactivity are the opposite: instant satisfaction, with the price paid much later.'),
          p('The strategy: create some immediate satisfaction tied to the right long-term behaviour — so your brain gets instant proof that this action is “worth it”.'),
          h('Habit tracking'),
          p('Recording a completed behaviour — an X on a calendar, a tick in an app — creates a kind of instant satisfaction: visible proof that you are making progress. It is also an awareness tool: you can’t improve what you don’t measure. The Track tab is your tracker.'),
          ul(
            'Don’t break the chain — seeing an unbroken run of days is a strong motivation not to break it.',
            'Never miss twice — missing one session is an accident; missing two in a row is the start of a new habit forming. Get back on track at the very next session.',
            'Measurement isn’t only body weight — sessions completed, days you hit your protein target, sleep quality are all valid measures, especially useful when the scale stalls (the Plateau of Latent Potential in A1).',
          ),
          h('Accountability partner'),
          p('We always try to show the best version of ourselves to others. When someone knows about and follows your commitment, the cost of not doing it rises a lot — you are not just breaking a promise to yourself, but to someone else too.'),
          ul(
            'My role as your PT is naturally a form of accountability partner — fixed appointments and weekly check-ins are the “someone is watching” structure.',
            'Share your goal with a specific friend or family member, or find a training partner to create positive pressure both ways.',
          ),
          p('An important note: choose short-term rewards that don’t contradict the long-term identity you are building. Rewarding yourself with a cream cake after a hard leg session can be two opposing votes for two different identities that cancel each other out. A massage, a new piece of training gear, or simply putting an X on your tracker is a better reward — a small luxury and a vote for taking care of your body.'),
          cta('Start tracking today', 'today'),
        ],
      },
    ],
  },
  {
    id: 'C',
    title: 'From stable to lasting',
    sections: [
      {
        id: 'c1',
        title: 'C1. Choose the right game for you',
        blocks: [
          p('The Four Laws make any habit easier to build. But the habits that are easiest to keep are the ones that fit your nature — your body type, the kind of movement you enjoy, your daily rhythm, your personality. Genes don’t remove the need for effort — they help you know where to put it.'),
          p('In training: not everyone needs to love powerlifting to be healthy. Someone who loves being outdoors may build a far more lasting habit through running, hiking or swimming than by forcing themselves into a traditional gym. My role is to help you find the kind of movement and the nutrition structure you can keep for life — not the “theoretically optimal” version you hate every time you do it.'),
          h('Questions to ask yourself'),
          ul(
            'Do I prefer training alone or in a group or class?',
            'Do I do better with a strict structure (a fixed program) or with flexibility (adjusting by feel)?',
            'At what time of day do I have the most energy and discipline — early morning, midday or evening?',
          ),
          p('Don’t compare your progress with other people’s. Compare yourself with who you were before. Genes and life circumstances differ — what matters is whether you are making the most of your own potential.'),
        ],
      },
      {
        id: 'c2',
        title: 'C2. The Goldilocks Rule and flow',
        blocks: [
          p('People are most motivated when facing a challenge right at the edge of their current ability — not too easy (boring) and not too hard (anxiety, giving up). This is called the Goldilocks Rule. Research suggests that flow — being fully absorbed — tends to happen when a task is about 4% beyond your current ability.'),
          p('In your training: at the start, the aim is to make the habit as easy as possible so you keep it up consistently (Law 3). Once the habit is settled, progress and new challenges — more weight, new techniques, performance goals — are needed to stay interested over the long run. That is also why adjusting your program from time to time (progressive overload, new exercises, new cycle goals) matters not only physically but psychologically.'),
          h('Boredom — the real enemy, not failure'),
          p('Top athletes don’t have endless motivation. They get bored, tired and unwilling to train like anyone else. The only difference: they still show up, even when they’re not in the mood.'),
          quote('Professionals stick to the schedule; amateurs let life get in the way.', 'James Clear'),
          p('This is the real line between people who get lasting results and people who don’t: the ability to tolerate the boredom of repeating the same behaviour day after day, even when it is no longer new or exciting. The only way to become truly excellent is to learn to love (or at least accept) that repetition.'),
        ],
      },
      {
        id: 'c3',
        title: 'C3. The downside of habits: when automation becomes a trap',
        blocks: [
          p('Habits free up mental energy — but the price is that you can become less sensitive to feedback. Once a movement is automatic, you stop noticing small mistakes. That is why “training for years” doesn’t automatically mean “training with good technique” — repeating a mistake thousands of times only engrains it deeper.'),
          formula('The formula for real mastery', 'Habits (automation) + Deliberate practice (with feedback and adjustment) = Mastery'),
          h('Regular reflection'),
          p('Top athletes and experts all have a system for regular review — not to punish themselves, but to catch early whatever is drifting the wrong way. I encourage clients to use two simple kinds of reflection:'),
          ul(
            'Monthly review: What is working? What isn’t? What do I need to adjust in my system (not my goal)?',
            'Quarterly review: Is the identity I’m building still true to the person I want to become? Am I living by the values I set?',
          ),
          h('Keep your identity flexible'),
          p('A paradox: the same pride in an identity that helps you keep your habits can make you rigid and unwilling to change when circumstances demand it. Someone too attached to the identity of “an athlete” can fall into crisis when an injury forces a long break. The answer: define your identity broadly enough to bend with circumstances — not “I am someone who trains at the gym 6 times a week” but “I am someone who always finds a way to take care of my body, in whatever form suits my situation right now”.'),
          quote('The supple and soft belong to life. The rigid and unbending belong to death.', 'Lao Tzu, Tao Te Ching'),
        ],
      },
    ],
  },
  {
    id: 'D',
    title: 'Summary',
    sections: [
      {
        id: 'd1',
        title: 'D1. Twenty core principles',
        blocks: [
          p('A quick summary to reread whenever you need a reminder.'),
          ol(
            'The results you have today are a lagging measure of your past habits — care about the trajectory, not only the current point.',
            'Progress isn’t linear. The Plateau of Latent Potential is real — don’t give up in the Valley of Disappointment.',
            'Focus on systems, not goals. You fall to the level of the systems you build.',
            'Lasting behaviour change is identity change, not just outcome change.',
            'Every action is a vote for the kind of person you want to become. You don’t need a unanimous win, just the majority.',
            'Every habit runs through the loop Cue → Craving → Response → Reward.',
            'Law 1: Make it Obvious — use implementation intentions, habit stacking, environment design.',
            'Law 2: Make it Attractive — use temptation bundling, choose the right social group.',
            'Law 3: Make it Easy — reduce friction, use the Two-Minute Rule, automate decisions.',
            'Law 4: Make it Satisfying — track progress, find an accountability partner, reward yourself the right way.',
            'To break a bad habit: invert all four laws — invisible, unattractive, difficult, unsatisfying.',
            'Never miss twice in a row.',
            'Choose the kind of movement and nutrition that suits your nature, not the “theoretically optimal” version you hate doing.',
            'Motivation peaks at the edge of your current ability — not too easy, not too hard.',
            'The real enemy isn’t failure but boredom. Professionals still show up when they’re not in the mood.',
            'Habits + Deliberate practice = Real mastery.',
            'Review monthly and quarterly so you don’t drift without noticing.',
            'Keep your identity flexible enough to adapt when circumstances change.',
            'Don’t let one slip break the whole system — get straight back on track the next time.',
            'Meaningful change doesn’t have to be big change. What is small and repeated consistently is what lasts.',
          ),
        ],
      },
      {
        id: 'd3',
        title: 'Closing words',
        blocks: [
          p('No handbook, this one included, can train for you or eat for you. What it can do is help you understand why your earlier attempts failed — not because you lacked willpower, but because the system wasn’t designed right — and give you a framework to redesign it.'),
          p('My role on this journey is not only to write your program or work out your portions. My role is to be alongside you as you build that system, adjust it when life changes, and remind you to get back on course when you slip — which will certainly happen, and is completely normal.'),
          p('Welcome to David Coaching. Let’s start with the smallest things.'),
          p('— David (Đình Bảo)'), // i18n-data: tên riêng
          cta('Set up your first habit', 'setup'),
        ],
      },
    ],
  },
]);

export const HANDBOOK_STRUGGLES_EN = Object.freeze([
  { label: 'A month of training and no change yet', target: 'a1' },
  { label: 'I forget, or don’t know where to start', target: 'b1' },
  { label: 'I’m not motivated', target: 'b2' },
  { label: 'Too busy or too tired', target: 'b3' },
  { label: 'I just missed a few days', target: 'b4' },
  { label: 'I’m bored', target: 'c2' },
  { label: 'I don’t know which habits suit me', target: 'c1' },
]);
