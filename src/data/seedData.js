import { genId } from '../utils/id.js'
import { DEFAULT_SUBJECTS } from './subjects.js'
import { storage } from '../services/storage.js'

const adminId = 'usr_admin'
const teacherId = 'usr_demo_teacher'
const studentId = 'usr_demo_student'

const animalsDeckId = 'deck_animals'
const mathDeckId = 'deck_math'
const moduleId = 'mod_intro'
const lesson1Id = 'les_1'
const lesson2Id = 'les_2'
const homeworkId = 'hw_1'

export function seedIfNeeded() {
  if (storage.isSeeded()) return

  storage.setSubjects(DEFAULT_SUBJECTS)

  storage.setUsers([
    {
      id: adminId,
      name: 'Admin',
      role: 'admin',
      active: true,
      avatarColor: '#ff7a7a',
      createdAt: new Date().toISOString(),
    },
    {
      id: teacherId,
      name: 'Ms. Johnson',
      role: 'teacher',
      active: true,
      avatarColor: '#4dabf7',
      createdAt: new Date().toISOString(),
    },
    {
      id: studentId,
      name: 'Alex',
      role: 'student',
      active: true,
      avatarColor: '#69db7c',
      createdAt: new Date().toISOString(),
    },
  ])

  storage.setDecks([
    {
      id: animalsDeckId,
      title: 'Animals in English',
      subjectId: 'languages',
      language: 'en',
      createdBy: teacherId,
      createdAt: new Date().toISOString(),
      cards: [
        { id: genId('c'), term: 'Cat',      definition: 'A small furry domesticated animal that meows' },
        { id: genId('c'), term: 'Dog',       definition: 'A loyal domesticated animal that barks' },
        { id: genId('c'), term: 'Elephant',  definition: 'The largest land animal with a long trunk' },
        { id: genId('c'), term: 'Giraffe',   definition: 'The tallest animal with a very long neck' },
        { id: genId('c'), term: 'Penguin',   definition: 'A flightless bird that lives in cold climates' },
      ],
    },
    {
      id: mathDeckId,
      title: 'Basic Math Terms',
      subjectId: 'math',
      language: 'en',
      createdBy: teacherId,
      createdAt: new Date().toISOString(),
      cards: [
        { id: genId('c'), term: 'Sum',        definition: 'The result of adding two or more numbers together' },
        { id: genId('c'), term: 'Difference', definition: 'The result of subtracting one number from another' },
        { id: genId('c'), term: 'Product',    definition: 'The result of multiplying two or more numbers' },
        { id: genId('c'), term: 'Quotient',   definition: 'The result of dividing one number by another' },
        { id: genId('c'), term: 'Factor',     definition: 'A number that divides another number exactly' },
      ],
    },
  ])

  storage.setModules([
    {
      id: moduleId,
      title: 'Introduction to English Vocabulary',
      subjectId: 'languages',
      createdBy: teacherId,
      lessonIds: [lesson1Id, lesson2Id],
      assignedTo: [studentId],
      createdAt: new Date().toISOString(),
    },
  ])

  storage.setLessons([
    {
      id: lesson1Id,
      moduleId,
      title: 'Welcome to EduQuest',
      content: 'In this course you will learn English vocabulary through fun games.\n\nEach lesson has a reading section and a practice game. Work through the lessons in order and complete the homework at the end.\n\n**Tips:**\n- Study a little every day to build a streak\n- Earn XP and badges as you progress\n- Try all three game modes: Word Guess, Flashcard, and Quiz',
      deckId: null,
      order: 1,
    },
    {
      id: lesson2Id,
      moduleId,
      title: 'Animals Vocabulary',
      content: 'Animals are a great starting point for English vocabulary.\n\nLearn the names of common animals and practise them with the word game below.\n\n**Words to learn:**\n- Cat, Dog, Elephant, Giraffe, Penguin\n\nClick **Study Deck** to practise these words.',
      deckId: animalsDeckId,
      order: 2,
    },
  ])

  storage.setHomework([
    {
      id: homeworkId,
      moduleId,
      title: 'Animals Vocabulary Practice',
      instructions: 'Complete the word-guess game with the Animals deck. Try to score at least 4 out of 5!',
      deckId: animalsDeckId,
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      assignedTo: [studentId],
      createdBy: teacherId,
      createdAt: new Date().toISOString(),
    },
  ])

  storage.markSeeded()
}
