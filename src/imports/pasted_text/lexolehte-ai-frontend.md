Act as a Senior Frontend Developer and UI/UX Designer.

Create the frontend of a modern, professional, and highly accessible educational application named:

“LexoLehtë AI”

Slogan:
“Every text, at the right level for every student.”

The application uses artificial intelligence to help students aged 10–15 who have difficulties with reading and text comprehension, including students with dyslexia.

The teacher uploads learning material, while the system simplifies it, summarizes it, explains difficult words, creates questions, translates it, and prepares it for text-to-speech reading.

The frontend must be fully functional using mock data. Do not create a backend and do not make real OpenAI API calls at this stage. Create a simulated service layer that can later be easily connected to the backend.

==================================================
1. TECHNOLOGIES
==================================================

Use:

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- React Router
- Lucide React for icons
- React Hook Form
- Zod for form validation
- Recharts for charts
- Zustand or React Context for state management
- LocalStorage for temporarily storing preferences and mock data

The code must be:

- modular;
- clean;
- reusable;
- responsive;
- organized into components;
- ready to connect to a real API;
- free of TypeScript errors.

==================================================
2. APPLICATION LANGUAGE
==================================================

All text displayed in the interface must be in Albanian.

Use simple, clear, and friendly language for teachers and students.

Do not use unnecessary technical terms.

==================================================
3. VISUAL STYLE
==================================================

Create a modern, minimalist, premium, and educational design.

Do not create an ordinary and boring dashboard.

The design must include:

- plenty of white space;
- cards with rounded corners;
- subtle shadows;
- clear visual hierarchy;
- understandable icons;
- smooth animations;
- short transitions;
- skeleton loading;
- empty states;
- success states;
- error states;
- toast notifications.

Recommended color palette:

- indigo or soft purple as the primary color;
- emerald or cyan as the secondary color;
- a very light background;
- soft colors for statuses;
- high contrast for text.

Use:

- Inter for the dashboard area;
- Lexend or Atkinson Hyperlegible as an option in the reading area.

The logo can be a combination of:

- an open book;
- a star or AI sparkle;
- the letter “L”.

==================================================
4. ACCESSIBILITY
==================================================

The application must be highly accessible.

Follow WCAG 2.1 AA as closely as possible.

Include:

- full keyboard navigation;
- visible focus states;
- aria-labels for buttons and icons;
- clear labels for every input;
- good contrast;
- large buttons;
- sufficient spacing between elements;
- readable text;
- clear error messages;
- do not rely only on color to indicate status;
- understandable loading states;
- an option to reduce animations.

Add a global “Accessibility” button that opens a panel with:

- text size;
- line spacing;
- letter spacing;
- high contrast;
- dark mode;
- reading font;
- reduced animations.

==================================================
5. USER ROLES
==================================================

Create two main roles:

1. Teacher
2. Student

On the login page, add two demo accounts:

Teacher:
Email: mesuesi@lexolehte.com
Password: demo123

Student:
Email: nxenesi@lexolehte.com
Password: demo123

Also add the buttons:

- “Log in as demo teacher”
- “Log in as demo student”

After logging in, the user must be redirected to the appropriate dashboard.

==================================================
6. APPLICATION STRUCTURE
==================================================

Create separate layouts for the teacher and the student.

Desktop:

- sidebar on the left;
- top navigation bar;
- main content area.

Mobile:

- bottom navigation;
- menu drawer;
- full-width cards;
- large and easy-to-tap buttons.

The sidebar must be collapsible.

In the top bar, display:

- greeting;
- search;
- notifications;
- accessibility button;
- profile;
- logout.

==================================================
7. PUBLIC PAGE
==================================================

Create a modern landing page.

Hero section:

Title:
“Learning materials that adapt to every student.”

Description:
“LexoLehtë AI helps teachers simplify, summarize, and adapt learning materials for students who have difficulties with reading and comprehension.”

Buttons:

- “Start as a teacher”
- “View the demo”

Add a visual mockup of the application.

Sections:

1. The problem
2. How it works
3. Features
4. For teachers
5. For students
6. Safety and teacher control
7. Call to action

The “How it works” section must contain four steps:

1. Upload the material
2. Adapt it with AI
3. Review and approve
4. Share it with the student

==================================================
8. LOGIN PAGE
==================================================

Create a modern split-screen login page.

Left side:

- logo;
- title;
- description;
- abstract educational illustration.

Right side:

- email;
- password;
- show/hide password;
- remember me;
- log in;
- log in as demo;
- forgot password.

Add form validation and clear error messages.

==================================================
9. TEACHER DASHBOARD
==================================================

Route:
 /teacher/dashboard

Create a dashboard with the greeting:

“Welcome, Arta!”

Add statistic cards:

- 24 students
- 8 active materials
- 16 completed assignments
- 74% average score

Add a large button:

“Create new material”

“Recent activity” section:

- Ardi completed the “Photosynthesis” quiz
- Sara requested explanations for 4 words
- The “Solar System” material was approved
- 5 students completed the latest assignment

“Students who may need support” section:

For each student, display:

- avatar;
- name;
- class;
- score;
- reason for the alert;
- “View progress” button.

Examples:

- Ardi Hoxha – 52% – Difficulty identifying the main idea
- Sara Berisha – 61% – Requested many explanations
- Dren Gashi – 57% – Two incomplete assignments

Add a chart showing class results over the past few weeks.

Add a chart or progress bars for:

- text comprehension;
- vocabulary;
- main idea;
- multiple-choice questions.

==================================================
10. CLASSES AND STUDENTS
==================================================

Route:
 /teacher/classes

Create lists or cards for classes:

- Class VI-1
- Class VI-2
- Class VII-1

For each class, display:

- number of students;
- active materials;
- average score;
- progress.

When a class is opened, display a student table with:

- name;
- age;
- reading level;
- completed materials;
- average score;
- status;
- actions menu.

Add:

- search;
- filtering;
- sorting;
- “Add student” button;
- “Create assignment for class” button.

==================================================
11. STUDENT PROFILE
==================================================

Route:
 /teacher/students/:id

Display:

- name;
- class;
- age;
- avatar;
- current reading level;
- language;
- reading preferences.

Use non-medical data.

Do not display diagnoses.

Preferences:

- shorter texts;
- simpler sentences;
- audio enabled;
- font size;
- question level;
- preferred language.

Add statistics:

- completed materials;
- average score;
- number of attempts;
- audio usage;
- words opened;
- average completion time.

Add a progress chart.

Add the “Recent difficulties” section:

- identifying the main idea;
- academic vocabulary;
- short-answer questions.

Add the buttons:

- “Assign material”
- “Edit preferences”
- “View assignments”

==================================================
12. MATERIAL CREATION
==================================================

Route:
 /teacher/materials/new

Create a modern step-by-step wizard.

Step 1 – Upload the material

Options:

- write text;
- paste text;
- upload PDF;
- upload Word document;
- upload JPG or PNG.

Create a drag-and-drop upload zone.

Display:

- allowed file types;
- maximum file size;
- file name;
- upload progress;
- preview;
- remove file.

Step 2 – Select the audience

- select a class;
- select one student;
- select multiple students;
- select the entire class.

Step 3 – Adaptation

Fields:

- material title;
- subject;
- age;
- class;
- output language;
- reading level;
- simplification level;
- desired length;
- number of questions;
- question difficulty level.

Simplification levels:

1. Light adaptation
2. Medium adaptation
3. Advanced adaptation

Switch options:

- create a summary;
- extract key points;
- identify difficult words;
- create a quiz;
- translate the material;
- generate audio;
- create teacher notes.

Step 4 – Confirmation

Display a summary of the selected options.

Primary button:

“Adapt with AI”

When clicked, display a modern processing screen with animated steps:

- Analyzing the material
- Simplifying the text
- Creating the summary
- Identifying difficult words
- Creating questions
- The material is ready

Use a mock delay of several seconds and then redirect to the review page.

==================================================
13. MATERIAL REVIEW
==================================================

Route:
 /teacher/materials/:id/review

Create a professional split-view page.

Left side:

- original material.

Right side:

- adapted material.

Add tabs:

- Simplified text
- Summary
- Key points
- Vocabulary
- Quiz
- Teacher notes
- Audio

The content in every tab must be editable.

Add the buttons:

- “Save as draft”
- “Regenerate”
- “Compare versions”
- “Approve material”
- “Publish for students”

For “Regenerate,” open a modal with options:

- make it shorter;
- make it simpler;
- add examples;
- change the questions;
- explain the terms more clearly;
- write a custom instruction.

Add a badge:

“AI-generated content must be reviewed by the teacher.”

Add statuses:

- Draft
- Under review
- Approved
- Published

==================================================
14. MATERIALS LIST
==================================================

Route:
 /teacher/materials

Display materials as cards or in a table.

For each material, display:

- title;
- subject;
- class;
- date;
- status;
- number of students;
- completion percentage.

Add filters:

- status;
- subject;
- class;
- date.

Add a search bar.

Actions:

- view;
- edit;
- duplicate;
- assign;
- delete.

==================================================
15. ASSIGNMENT CREATION
==================================================

Create a modal or page for assigning the material.

Fields:

- material;
- class;
- students;
- start date;
- deadline;
- allow retry;
- show answers after the quiz;
- enable audio;
- message for the student.

Button:

“Assign task”

After successful completion, display a toast:

“The assignment was created successfully.”

==================================================
16. TEACHER ANALYTICS
==================================================

Route:
 /teacher/analytics

Display:

- average score;
- completion percentage;
- average time;
- number of explained words;
- audio usage;
- average attempts.

Charts:

1. Progress over time
2. Results by class
3. Question types with the most errors
4. Words opened most often by students
5. Audio usage
6. Assignment completion

Add a table of students.

Use color, icons, and text for statuses.

Do not make diagnostic statements.

Use wording such as:

- “The student may need support with understanding the main idea.”
- “The student requested explanations for 8 words.”
- “The score decreased across the last two materials.”

==================================================
17. STUDENT DASHBOARD
==================================================

Route:
 /student/dashboard

The design must be simpler than the teacher dashboard.

Display the greeting:

“Hello, Ardi!”

Add a motivational message:

“Keep going! Today you have a new material to read.”

Sections:

- New assignments
- Continue where you left off
- Completed
- My progress

For every assignment, display:

- title;
- subject;
- progress;
- deadline;
- estimated time;
- “Start” or “Continue” button.

Do not create unnecessary competition between students.

Do not display a leaderboard.

==================================================
18. READING WORKSPACE
==================================================

Route:
 /student/read/:id

This must be the most important and most accessible page in the application.

Create a distraction-free reading workspace.

Display:

- title;
- progress;
- estimated time;
- adapted text;
- sections;
- current paragraph.

The reading toolbar must contain:

- listen;
- pause;
- repeat paragraph;
- decrease font size;
- increase font size;
- change line spacing;
- change letter spacing;
- change font;
- dark mode;
- high contrast;
- focus mode.

Add “Focus Mode”:

- display only one paragraph;
- fade the other sections;
- “Previous paragraph” button;
- “Next paragraph” button;
- progress indicator.

When the user clicks a difficult word, open a popover with:

- simple explanation;
- synonym;
- example;
- translation;
- “Listen to the word” button.

Add the ability to select a sentence.

When a sentence is selected, display a floating action menu:

- “Explain it more simply”
- “Give me an example”
- “What is the main idea?”
- “Translate”

Use mock responses for these features.

Add a sidebar or drawer containing:

- Summary
- Key points
- Vocabulary
- Progress

At the bottom, display:

“Are you ready for the questions?”

Button:

“Start the quiz”

==================================================
19. AUDIO PLAYER
==================================================

Create a modern audio player with:

- play;
- pause;
- rewind 10 seconds;
- forward 10 seconds;
- progress bar;
- volume;
- speeds of 0.75x, 1x, and 1.25x.

Display the text:

“This voice was generated using artificial intelligence.”

For the frontend, use demo audio or mock audio.

==================================================
20. QUIZ
==================================================

Route:
 /student/quiz/:id

Display only one question per screen.

Question types:

- multiple choice;
- yes or no;
- short answer;
- matching a word with its meaning;
- selecting the main idea.

Display:

- question number;
- progress;
- “Return to the text” button;
- hint;
- “Continue” button.

When the answer is incorrect, do not display only “Incorrect.”

Display feedback such as:

“The answer is not completely correct. Read the second paragraph again and look for the reason why plants need light.”

After the quiz, display:

- score;
- correct answers;
- answers that need review;
- suggestions;
- “Read again” button;
- “Try again” button;
- “Return to assignments” button.

==================================================
21. RESULTS PAGE
==================================================

Route:
 /student/results/:id

Display a positive and non-judgmental result.

Example:

“Great job! You completed the material.”

Display:

- 4 out of 5 correct answers;
- 80%;
- time;
- words opened;
- audio usage;
- number of attempts.

Add the section:

“What you understood well”

and:

“What you can read again”

Do not use negative or shaming messages.

==================================================
22. SETTINGS
==================================================

Create settings for both teachers and students.

Teacher settings:

- profile;
- notifications;
- language;
- privacy;
- default AI preferences;
- appearance;
- accessibility.

Student settings:

- font;
- size;
- line spacing;
- letter spacing;
- contrast;
- theme;
- audio speed;
- reduced animations.

==================================================
23. MOCK DATA
==================================================

Use the following demo material:

Title:
“Photosynthesis”

Subject:
“Biology”

Class:
“VI”

Original text:
“Photosynthesis is the biological process through which plants and other organisms containing chlorophyll convert light energy into chemical energy.”

Simplified text:
“Photosynthesis is the way plants create food. Plants use sunlight, water, and air. This process mainly happens in the leaves.”

Summary:
“Plants use sunlight to produce food. This process is called photosynthesis.”

Key points:

- Plants need light.
- Plants absorb water from the soil.
- Photosynthesis mainly happens in the leaves.
- Plants produce their own food.

Difficult words:

Chlorophyll:
“The green substance found in plant leaves.”

Energy:
“The power needed to perform an action.”

Process:
“A group of steps through which something happens.”

Create at least five questions related to this material.

==================================================
24. MOCK SERVICE LAYER
==================================================

Create separate services:

- authService
- materialService
- studentService
- assignmentService
- aiService
- analyticsService

The AI service functions can include:

- simplifyText()
- summarizeText()
- translateText()
- generateQuiz()
- explainSentence()
- explainWord()
- generateTeacherNotes()
- generateAudio()

For now, these functions must return mock data after a short delay.

Structure them so that they can later be easily replaced with fetch or Axios requests.

==================================================
25. FOLDER STRUCTURE
==================================================

Use a structure similar to:

src/
  components/
    common/
    layout/
    accessibility/
    teacher/
    student/
    materials/
    quiz/
    charts/
  pages/
    public/
    auth/
    teacher/
    student/
  layouts/
  routes/
  services/
  hooks/
  store/
  types/
  data/
  utils/
  constants/
  assets/

==================================================
26. REUSABLE COMPONENTS
==================================================

Create reusable components such as:

- AppSidebar
- AppHeader
- MobileNavigation
- StatCard
- EmptyState
- LoadingState
- ErrorState
- ConfirmDialog
- AccessibleModal
- FileUploader
- ReadingToolbar
- AudioPlayer
- ProgressCard
- StudentCard
- MaterialCard
- StatusBadge
- QuizQuestion
- WordDefinitionPopover
- AccessibilityPanel
- AIProcessingSteps
- TeacherReviewEditor

==================================================
27. ERROR HANDLING
==================================================

Create:

- 404 page;
- error boundary;
- upload error;
- AI generation error;
- empty state;
- mock network error;
- retry button;
- validation messages.

Example:

“We could not process the material. Check the file and try again.”

==================================================
28. SECURITY AND ETHICS IN THE UI
==================================================

On the review page, display:

“AI-generated content may contain errors. The teacher must review it before publishing.”

Do not use wording that diagnoses the student.

Do not display sensitive information or diagnoses.

Use demo profiles with fictional names.

Add the option to delete materials and data.

==================================================
29. RESPONSIVE DESIGN
==================================================

The application must work well on:

- desktop;
- laptop;
- tablet;
- phone.

On mobile:

- the sidebar becomes a drawer;
- the student reading page must be very clean;
- tables become cards;
- tabs use horizontal scrolling;
- primary buttons become full-width;
- bottom navigation must be easy to use.

==================================================
30. ACCEPTANCE CRITERIA
==================================================

The frontend is considered complete when:

- all routes work;
- teacher and student demo login work;
- dashboards are different according to the user role;
- the material creation wizard works;
- AI processing is simulated;
- the review page displays the results;
- the material can be approved;
- the assignment can be assigned to a student;
- the student can open the material;
- reading mode works;
- accessibility settings work;
- the quiz works;
- the result is saved in LocalStorage;
- the teacher dashboard updates with the results;
- the application is responsive;
- there are no console errors;
- there are no blank pages;
- all main buttons work.

==================================================
31. PRIORITY
==================================================

The main priority is the following flow:

The teacher logs in
→ uploads a material
→ selects the student profile
→ adapts the material with AI
→ reviews the result
→ approves it
→ assigns it to the student
→ the student reads it
→ uses audio and word explanations
→ completes the quiz
→ the teacher views the result.

Start with this flow and make sure it works completely before implementing other features.

==================================================
32. FINAL RESULT
==================================================

Generate the complete application, not only a static design.

Create:

- all pages;
- routing;
- components;
- mock data;
- state management;
- forms;
- validation;
- charts;
- interactions;
- animations;
- responsive design;
- accessibility features.

Do not use lorem ipsum.

Do not leave buttons without functionality.

Do not create only a homepage or only a dashboard.

Use realistic demo data and make sure the application looks like a product ready for a hackathon presentation.
==================================================
33. GAMIFICATION: XP, LEVELS, AND BADGES
==================================================

Add a positive and accessible gamification system based on:

- XP points;
- student levels;
- automatically earned badges;
- teacher-awarded badges;
- progress milestones;
- positive achievement notifications.

The purpose of the system is to motivate students to read, understand, improve, and complete their learning activities.

The gamification system must not create unhealthy competition between students.

Do not add a public leaderboard.

Do not compare one student’s score, XP, or level with another student.

The system must focus on personal progress, effort, consistency, comprehension, and improvement.

==================================================
34. XP POINT SYSTEM
==================================================

Each student must have:

- total XP;
- current level;
- XP required for the next level;
- XP progress bar;
- XP history;
- recently earned XP;
- source of each XP reward.

Use a configurable XP system.

Suggested XP rewards:

- Open a new reading material: +5 XP
- Complete reading material: +30 XP
- Complete a quiz: +20 XP
- Score at least 60%: +10 bonus XP
- Score at least 80%: +20 bonus XP
- Score 100%: +30 bonus XP
- Improve the previous quiz score: +15 XP
- Read the material again after receiving feedback: +10 XP
- Complete all assigned materials for the week: +25 XP
- Learn five difficult words: +15 XP
- Use the vocabulary explanations and complete the related questions: +10 XP
- Complete a teacher-assigned learning goal: configurable XP
- Receive a special XP reward from the teacher: configurable XP

Do not remove XP when a student makes a mistake.

Do not punish students for incorrect answers.

Incorrect answers should produce supportive feedback, not a loss of points.

Prevent XP farming:

- completion XP can only be earned once per assignment;
- quiz completion XP can only be earned once;
- retrying a quiz can award only an improvement bonus;
- limit repeated XP from the same activity;
- store a unique reward event for every XP transaction.

Every XP transaction should contain:

- id;
- studentId;
- amount;
- reason;
- source type;
- source id;
- awarded automatically or by teacher;
- teacher id when applicable;
- date and time.

Example XP history:

- +30 XP — Completed “Photosynthesis”
- +20 XP — Completed the quiz
- +20 XP — Achieved a score above 80%
- +15 XP — Improved the previous result
- +25 XP — Weekly learning goal completed

==================================================
35. LEVEL SYSTEM
==================================================

Create a student level system.

Each level must require more XP than the previous level.

Use the following example thresholds:

- Level 1: 0 XP
- Level 2: 100 XP
- Level 3: 250 XP
- Level 4: 450 XP
- Level 5: 700 XP
- Level 6: 1,000 XP
- Level 7: 1,400 XP
- Level 8: 1,850 XP
- Level 9: 2,350 XP
- Level 10: 3,000 XP
- Level 11: 3,750 XP
- Level 12: 4,600 XP
- Level 13: 5,550 XP
- Level 14: 6,600 XP
- Level 15: 7,750 XP

Store level thresholds in a separate configuration file so they can easily be changed later.

When a student earns XP:

1. Update the total XP.
2. Calculate the current level.
3. Calculate the remaining XP for the next level.
4. Update the progress bar.
5. Check whether the student reached a new level.
6. Check whether a badge should be unlocked.
7. Display a positive level-up message.

Example level-up message in Albanian:

“Urime! Arrite Nivelin 10!”

Supporting message:

“Puna dhe përparimi yt po japin rezultate. Vazhdo kështu!”

Display:

- the new level;
- total XP;
- XP earned from the latest activity;
- newly unlocked badge;
- progress toward the next level.

Add an accessible level-up celebration.

The celebration can include:

- a modal;
- a badge animation;
- subtle confetti;
- a short positive message;
- a “Vazhdo” button.

Respect the reduced-motion accessibility setting.

When reduced motion is enabled:

- disable confetti;
- disable large animations;
- use a simple success state;
- keep the message and badge visible.

==================================================
36. AUTOMATIC BADGES
==================================================

Create automatically unlocked badges based on achievements.

Each badge must contain:

- id;
- name;
- description;
- icon;
- category;
- rarity;
- unlock condition;
- XP reward;
- date earned;
- progress toward unlocking;
- locked or unlocked status.

Badge categories:

- Reading
- Comprehension
- Vocabulary
- Progress
- Consistency
- Audio learning
- Quiz achievement
- Level milestone
- Teacher recognition
- Special achievement

Suggested automatic badges:

1. “Hapi i Parë”

Description:
“Përfundove materialin tënd të parë.”

Condition:
Complete the first reading material.

Reward:
+20 XP

2. “Lexues Aktiv”

Description:
“Përfundove 5 materiale mësimore.”

Condition:
Complete 5 materials.

Reward:
+40 XP

3. “Eksplorues i Leximit”

Description:
“Përfundove 10 materiale mësimore.”

Condition:
Complete 10 materials.

Reward:
+60 XP

4. “Mjeshtër i Idesë Kryesore”

Description:
“U përgjigje saktë në 10 pyetje për idenë kryesore.”

Condition:
Answer 10 main-idea questions correctly.

Reward:
+50 XP

5. “Ndërtues i Fjalorit”

Description:
“Mësove dhe përdore 20 fjalë të reja.”

Condition:
Open, review, or correctly answer questions about 20 difficult words.

Reward:
+50 XP

6. “Dëgjues i Kujdesshëm”

Description:
“Përdore audion për të përfunduar 5 materiale.”

Condition:
Use audio support in 5 completed materials.

Reward:
+40 XP

7. “Nuk Dorëzohem”

Description:
“E përmirësove rezultatin pas një tentimi tjetër.”

Condition:
Improve a quiz result on a later attempt.

Reward:
+30 XP

8. “Rezultat i Shkëlqyeshëm”

Description:
“Arrite 100% në një kuiz.”

Condition:
Receive a perfect quiz score.

Reward:
+40 XP

9. “Pesë Materiale Radhazi”

Description:
“Përfundove 5 materiale të caktuara pa lënë asnjë të papërfunduar.”

Condition:
Complete 5 consecutive assigned materials.

Reward:
+50 XP

Do not require consecutive calendar-day activity because that could unfairly penalize students who cannot access the application every day.

10. “Nivel i Ri”

Description:
“Arrite Nivelin 5.”

Condition:
Reach Level 5.

Reward:
+50 XP

11. “Ylli i Nivelit 10”

Description:
“Arrite Nivelin 10.”

Condition:
Reach Level 10.

Reward:
+100 XP

12. “Ekspert i Nivelit 15”

Description:
“Arrite Nivelin 15.”

Condition:
Reach Level 15.

Reward:
+150 XP

13. “Përmirësim i Madh”

Description:
“E përmirësove rezultatin tënd me të paktën 20%.”

Condition:
Improve a result by at least 20 percentage points.

Reward:
+50 XP

14. “Kampion i Kuptimit”

Description:
“Arrite mbi 80% në 5 kuize të ndryshme.”

Condition:
Score at least 80% in 5 different quizzes.

Reward:
+75 XP

15. “Materiali i Javës”

Description:
“Përfundove të gjitha materialet e caktuara për këtë javë.”

Condition:
Complete all assigned materials during a teacher-defined learning period.

Reward:
+50 XP

Create different visual states:

- locked badge;
- badge in progress;
- newly unlocked badge;
- earned badge;
- teacher-awarded badge.

For locked badges, show:

- badge name;
- description;
- progress;
- requirement;
- locked icon.

Example:

“7 nga 10 materiale të përfunduara”

For hidden or surprise badges, display:

“Distinktiv sekret”

Do not reveal the condition until it is unlocked.

==================================================
37. TEACHER-AWARDED BADGES
==================================================

Allow teachers to manually award badges to students.

Teachers must be able to:

- select one student;
- select multiple students;
- select an entire class;
- choose a predefined badge;
- create a custom badge;
- write a positive message;
- add optional XP;
- preview the badge;
- confirm the award.

Create a teacher modal titled:

“Dhuro distinktiv”

Fields:

- student or students;
- badge;
- badge name;
- description;
- icon;
- category;
- optional XP reward;
- personal message;
- visibility;
- award date.

Visibility options:

- visible to the student;
- visible to the teacher and student;
- private teacher note.

Suggested teacher-awarded badges:

1. “Përpjekje e Jashtëzakonshme”

Description:
“Ke treguar përpjekje dhe vendosmëri të madhe.”

2. “Përmirësimi i Javës”

Description:
“Ke bërë përparim të dukshëm gjatë kësaj jave.”

3. “Lexues i Kujdesshëm”

Description:
“Ke lexuar me vëmendje dhe ke kontrolluar përgjigjet.”

4. “Pyetje të Mençura”

Description:
“Ke bërë pyetje që të kanë ndihmuar ta kuptosh më mirë materialin.”

5. “Punë e Pavarur”

Description:
“Ke përfunduar detyrën me shumë pak ndihmë.”

6. “Përdorim i Mirë i Mjeteve”

Description:
“Ke përdorur audion, fjalorin dhe shpjegimet në mënyrë efektive.”

7. “Hap i Madh Përpara”

Description:
“Ke bërë një përmirësim të rëndësishëm.”

8. “Ylli i Klasës”

Description:
“Mësuesi po të vlerëson për punën dhe përkushtimin tënd.”

Teachers must also be able to create custom badges.

Custom badge fields:

- badge title;
- short description;
- icon selection;
- badge shape;
- category;
- XP reward;
- message for the student.

Teacher-awarded badges should have a small label:

“Dhuruar nga mësuesja”

Display the teacher’s message inside the badge detail modal.

Example:

“Ke bërë një përmirësim të madh në kuptimin e idesë kryesore. Vazhdo kështu!”

==================================================
38. STUDENT REWARDS DASHBOARD
==================================================

Create a new student route:

/student/rewards

Add a navigation item:

“Shpërblimet”

The page must display:

- current level;
- total XP;
- XP progress toward the next level;
- current XP streak based on completed assigned activities, not daily login;
- recently earned XP;
- recently unlocked badges;
- all earned badges;
- badges in progress;
- teacher-awarded badges;
- upcoming level rewards;
- XP activity history.

At the top, display a large level card.

Example:

“Niveli 7”

“1,620 / 1,850 XP”

“Të duhen edhe 230 XP për Nivelin 8.”

Add a large horizontal XP progress bar.

Add a motivational message:

“Çdo material që përfundon të sjell më afër nivelit tjetër.”

Sections:

1. Distinktivët e fundit
2. Distinktivët e mi
3. Në progres
4. Shpërblime nga mësuesja
5. Historia e XP
6. Nivelet e ardhshme

Badge grid:

Each badge card must display:

- icon;
- name;
- description;
- date earned;
- XP reward;
- rarity;
- category.

Badge rarity examples:

- Common
- Uncommon
- Rare
- Special
- Teacher Award

Use Albanian UI labels:

- I zakonshëm
- Jo i zakonshëm
- I rrallë
- Special
- Shpërblim nga mësuesja

Do not use rarity to make students feel inferior.

Rarity should only describe how specific the achievement is.

Add filtering options:

- të gjithë;
- leximi;
- kuptimi;
- fjalori;
- nivelet;
- mësuesja;
- të fituar;
- në progres.

Add sorting options:

- më të fundit;
- më të vjetrit;
- progresi më i afërt;
- kategoria.

==================================================
39. STUDENT DASHBOARD GAMIFICATION WIDGET
==================================================

Update the student dashboard at:

/student/dashboard

Add a compact gamification widget that displays:

- current level;
- total XP;
- progress toward the next level;
- latest badge;
- XP earned this week;
- button “Shiko shpërblimet”.

Example:

“Niveli 7”

“1,620 XP”

“230 XP deri në Nivelin 8”

Latest badge:

“Ndërtues i Fjalorit”

Add a small progress bar.

After completing an assignment, display a reward summary:

“Materiali u përfundua!”

“+30 XP për përfundimin e materialit”

“+20 XP për rezultatin mbi 80%”

“Gjithsej: +50 XP”

If a badge was earned, also display:

“Distinktiv i ri!”

“Ndërtues i Fjalorit”

If the student reached a new level, display:

“Urime! Arrite Nivelin 8!”

==================================================
40. TEACHER GAMIFICATION DASHBOARD
==================================================

Create a new teacher route:

/teacher/rewards

Add a navigation item:

“XP dhe distinktivët”

The teacher page must display:

- class XP overview;
- student levels;
- recently awarded badges;
- automatic badge activity;
- students close to reaching a new level;
- students who have recently improved;
- award badge button;
- award XP button;
- badge management;
- XP configuration.

Do not rank students from highest to lowest.

Do not display a competitive leaderboard.

Default ordering should be alphabetical or based on recent activity.

Create a student rewards table with:

- student;
- level;
- total XP;
- progress to next level;
- latest badge;
- last activity;
- actions.

Actions:

- view rewards;
- award badge;
- award XP;
- view XP history;
- remove an incorrectly awarded badge;
- correct an XP transaction.

Any manual XP adjustment must require a reason.

Example modal:

Title:
“Dhuro XP”

Fields:

- student;
- XP amount;
- reason;
- related material;
- optional message.

Buttons:

- “Anulo”
- “Dhuro XP”

Show a confirmation message:

“30 XP iu dhuruan me sukses Ardi Hoxhës.”

Create a badge management section where the teacher can:

- view all badge templates;
- create a custom badge;
- edit custom badges;
- disable a badge;
- preview a badge;
- view how many students earned it.

System-defined automatic badges should not be permanently deleted.

They can be enabled or disabled.

==================================================
41. BADGE DETAIL MODAL
==================================================

When a badge is clicked, open an accessible modal.

Display:

- large badge icon;
- badge name;
- description;
- category;
- date earned;
- XP reward;
- reason it was earned;
- progress if it is still locked;
- teacher message if applicable.

For an earned badge, display:

“E fituar më 10 korrik 2026”

For a locked badge, display:

“Edhe 3 materiale për ta fituar këtë distinktiv.”

For a teacher-awarded badge, display:

“Dhuruar nga mësuesja Arta.”

Add a close button with an accessible aria-label.

The modal must be fully usable with the keyboard.

==================================================
42. REWARD NOTIFICATIONS
==================================================

Add reward notifications for:

- XP earned;
- badge unlocked;
- new level reached;
- teacher-awarded badge;
- teacher-awarded XP;
- achievement progress.

Notification examples in Albanian:

“Fitove 30 XP për përfundimin e materialit.”

“Distinktiv i ri: Hapi i Parë!”

“Urime! Arrite Nivelin 10.”

“Mësuesja të dhuroi distinktivin ‘Përpjekje e Jashtëzakonshme’.”

“Edhe një material për ta fituar distinktivin ‘Lexues Aktiv’.”

Notifications must:

- be positive;
- be short;
- not interrupt reading unnecessarily;
- be dismissible;
- support screen readers;
- respect reduced-motion preferences.

Use toast notifications for small XP rewards.

Use a modal only for:

- a newly reached level;
- a major badge;
- a teacher-awarded badge with a personal message.

==================================================
43. GAMIFICATION DATA MODELS
==================================================

Create TypeScript types or interfaces similar to:

type XPTransaction = {
  id: string;
  studentId: string;
  amount: number;
  reason: string;
  sourceType:
    | "material"
    | "quiz"
    | "vocabulary"
    | "level"
    | "badge"
    | "teacher"
    | "improvement";
  sourceId?: string;
  awardedBy: "system" | "teacher";
  teacherId?: string;
  createdAt: string;
};

type StudentLevel = {
  studentId: string;
  level: number;
  totalXP: number;
  currentLevelXP: number;
  nextLevelXP: number;
  progressPercentage: number;
};

type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  category:
    | "reading"
    | "comprehension"
    | "vocabulary"
    | "progress"
    | "audio"
    | "quiz"
    | "level"
    | "teacher"
    | "special";
  rarity: "common" | "uncommon" | "rare" | "special" | "teacher";
  conditionType: string;
  conditionValue?: number;
  xpReward: number;
  isAutomatic: boolean;
  isSecret: boolean;
  isEnabled: boolean;
};

type StudentBadge = {
  id: string;
  studentId: string;
  badgeId: string;
  earnedAt: string;
  awardedBy: "system" | "teacher";
  teacherId?: string;
  teacherMessage?: string;
};

type BadgeProgress = {
  studentId: string;
  badgeId: string;
  currentValue: number;
  targetValue: number;
  progressPercentage: number;
};

==================================================
44. GAMIFICATION MOCK SERVICES
==================================================

Create a separate service:

gamificationService

Include mock functions such as:

- getStudentXP()
- getStudentLevel()
- calculateLevel()
- calculateXPProgress()
- awardXP()
- getXPHistory()
- getBadges()
- getStudentBadges()
- getBadgeProgress()
- checkAutomaticBadges()
- unlockBadge()
- awardTeacherBadge()
- createCustomBadge()
- updateCustomBadge()
- getRecentRewards()
- getTeacherRewardsOverview()

For now, all functions must use mock data and LocalStorage.

Add a small simulated delay.

Structure the service so it can later be replaced with real API calls.

When an assignment is completed:

1. Calculate completion XP.
2. Calculate quiz bonus XP.
3. Check improvement bonus.
4. Save XP transactions.
5. Recalculate the level.
6. Check all badge conditions.
7. Unlock eligible badges.
8. Save rewards in LocalStorage.
9. update the teacher dashboard;
10. display the student reward summary.

==================================================
45. GAMIFICATION COMPONENTS
==================================================

Create reusable components such as:

- XPProgressBar
- LevelCard
- LevelUpModal
- XPRewardToast
- XPHistoryList
- BadgeCard
- BadgeGrid
- BadgeDetailModal
- BadgeProgressCard
- BadgeUnlockedModal
- TeacherAwardBadgeModal
- TeacherAwardXPModal
- CreateCustomBadgeModal
- RecentRewardsWidget
- StudentRewardsSummary
- LevelMilestoneTimeline
- RewardNotification
- BadgeIconPicker

All components must:

- be responsive;
- support keyboard navigation;
- include visible focus states;
- use accessible labels;
- support reduced motion;
- work with mock data;
- have loading, empty, and error states.

==================================================
46. GAMIFICATION VISUAL DESIGN
==================================================

The gamification interface must match the existing LexoLehtë AI design system.

Use:

- soft gradients;
- rounded cards;
- subtle shadows;
- clear progress bars;
- friendly badge icons;
- small celebration effects;
- accessible contrast;
- readable typography.

Do not make the application look like a casino or gambling application.

Do not use:

- spinning wheels;
- random rewards;
- loot boxes;
- flashing effects;
- misleading countdowns;
- loss-based mechanics;
- aggressive streak pressure.

Rewards must always be connected to a real learning action or teacher recognition.

Use icon themes such as:

- open book;
- light bulb;
- star;
- vocabulary cards;
- headphones;
- target;
- upward arrow;
- trophy;
- medal;
- sparkle;
- shield.

Create visual variations for:

- automatic badges;
- level badges;
- teacher-awarded badges;
- locked badges;
- secret badges.

==================================================
47. GAMIFICATION ACCESSIBILITY AND WELL-BEING
==================================================

The gamification system must be encouraging and inclusive.

Requirements:

- never remove XP for mistakes;
- never shame students;
- never publicly rank students;
- never show “worst student” indicators;
- never compare one student directly with another;
- never require daily activity to keep rewards;
- never use manipulative reward mechanics;
- always allow animations to be reduced;
- provide text descriptions for every badge icon;
- do not rely only on badge color;
- announce important rewards to screen readers;
- keep celebration messages short and clear.

Focus rewards on:

- completion;
- effort;
- personal improvement;
- comprehension;
- vocabulary growth;
- responsible use of learning tools;
- teacher-recognized progress.

Use messages such as:

“Ke bërë përparim.”

“Përpjekja jote po jep rezultate.”

“E përmirësove rezultatin tënd.”

“Përfundove një tjetër hap të rëndësishëm.”

Avoid messages such as:

“Je më i mirë se të tjerët.”

“Je i fundit në klasë.”

“Do ta humbësh shpërblimin nëse nuk hyn sot.”

==================================================
48. GAMIFICATION ACCEPTANCE CRITERIA
==================================================

The gamification system is considered complete when:

- students earn XP after completing learning activities;
- XP transactions are saved in LocalStorage;
- the student level updates automatically;
- the XP progress bar updates correctly;
- a level-up modal appears when a new level is reached;
- Level 5, Level 10, and Level 15 badges unlock automatically;
- learning achievement badges unlock automatically;
- teachers can award predefined badges;
- teachers can create and award custom badges;
- teachers can award custom XP with a required reason;
- students can view all earned badges;
- students can view badge progress;
- students can view their XP history;
- teacher-awarded messages appear correctly;
- the student dashboard displays level and XP;
- the teacher dashboard displays student reward information;
- duplicate XP rewards are prevented;
- retry XP is limited to improvement bonuses;
- rewards work across page refreshes;
- reduced-motion mode disables celebration animations;
- all reward modals are keyboard accessible;
- no leaderboard is displayed;
- no student loses XP for incorrect answers;
- all UI text displayed to users remains in Albanian.

==================================================
49. GAMIFICATION PRIORITY
==================================================

Implement the following gamification flow first:

The student completes a material
→ receives completion XP
→ completes the quiz
→ receives quiz and score bonus XP
→ the XP progress bar updates
→ the system checks the student’s level
→ the system checks badge conditions
→ a badge is unlocked if eligible
→ a level-up modal appears if eligible
→ the rewards are saved in LocalStorage
→ the teacher can view the student’s updated level and rewards.

Then implement:

The teacher opens the student profile
→ clicks “Dhuro distinktiv”
→ selects or creates a badge
→ adds an optional XP reward
→ writes a positive message
→ confirms the award
→ the student receives a notification
→ the badge appears under “Shpërblime nga mësuesja.”

Make sure this complete flow works before adding secondary gamification features.