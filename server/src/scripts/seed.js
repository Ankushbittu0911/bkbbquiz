require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const QuizQuestion = require('../models/QuizQuestion');
const Contest = require('../models/Contest');
const Settings = require('../models/Settings');

const QUESTIONS = [
  // Cricket
  { text: "Who holds the record for the most runs in Test cricket?", options: ["Ricky Ponting", "Sachin Tendulkar", "Brian Lara", "Kumar Sangakkara"], correctAnswer: 1, category: "Cricket", difficulty: "easy", points: 10 },
  { text: "Which country won the first Cricket World Cup in 1975?", options: ["Australia", "India", "West Indies", "England"], correctAnswer: 2, category: "Cricket", difficulty: "easy", points: 10 },
  { text: "What is the maximum score from a single ball in cricket?", options: ["4", "6", "7", "8"], correctAnswer: 2, category: "Cricket", difficulty: "medium", points: 10 },
  { text: "Who is known as the 'God of Cricket'?", options: ["Virat Kohli", "Ricky Ponting", "Sachin Tendulkar", "MS Dhoni"], correctAnswer: 2, category: "Cricket", difficulty: "easy", points: 10 },
  { text: "Which bowler has taken the most wickets in Test cricket?", options: ["Shane Warne", "Glenn McGrath", "Muttiah Muralitharan", "Anil Kumble"], correctAnswer: 2, category: "Cricket", difficulty: "medium", points: 10 },
  { text: "Which team won the ICC T20 World Cup 2024?", options: ["India", "Australia", "England", "South Africa"], correctAnswer: 0, category: "Cricket", difficulty: "easy", points: 10 },
  { text: "What is the nickname of the Indian cricket team?", options: ["Tigers", "Men in Blue", "Blue Army", "Blue Warriors"], correctAnswer: 1, category: "Cricket", difficulty: "easy", points: 10 },
  { text: "Who scored the first double century in ODI cricket?", options: ["Virender Sehwag", "Sachin Tendulkar", "Rohit Sharma", "Martin Guptill"], correctAnswer: 1, category: "Cricket", difficulty: "medium", points: 10 },
  { text: "How many players are there in a cricket team?", options: ["9", "10", "11", "12"], correctAnswer: 2, category: "Cricket", difficulty: "easy", points: 10 },
  { text: "Which IPL team has won the most titles?", options: ["CSK", "MI", "KKR", "RCB"], correctAnswer: 1, category: "Cricket", difficulty: "easy", points: 10 },
  { text: "What is the length of a cricket pitch?", options: ["18 yards", "20 yards", "22 yards", "24 yards"], correctAnswer: 2, category: "Cricket", difficulty: "medium", points: 10 },
  { text: "Who won the 2023 ODI World Cup?", options: ["Australia", "India", "England", "New Zealand"], correctAnswer: 0, category: "Cricket", difficulty: "easy", points: 10 },
  // Football
  { text: "Who has won the most Ballon d'Or awards?", options: ["Cristiano Ronaldo", "Lionel Messi", "Ronaldo Nazário", "Zinedine Zidane"], correctAnswer: 1, category: "Football", difficulty: "easy", points: 10 },
  { text: "Which country has won the most FIFA World Cups?", options: ["Germany", "Argentina", "Brazil", "Italy"], correctAnswer: 2, category: "Football", difficulty: "easy", points: 10 },
  { text: "What is the duration of a standard football match?", options: ["80 minutes", "90 minutes", "100 minutes", "120 minutes"], correctAnswer: 1, category: "Football", difficulty: "easy", points: 10 },
  { text: "Which club has won the most UEFA Champions League titles?", options: ["Barcelona", "Bayern Munich", "AC Milan", "Real Madrid"], correctAnswer: 3, category: "Football", difficulty: "medium", points: 10 },
  { text: "Who scored the 'Hand of God' goal?", options: ["Pelé", "Diego Maradona", "Ronaldo", "Zidane"], correctAnswer: 1, category: "Football", difficulty: "easy", points: 10 },
  { text: "Which country hosted the 2022 FIFA World Cup?", options: ["UAE", "Saudi Arabia", "Qatar", "Bahrain"], correctAnswer: 2, category: "Football", difficulty: "easy", points: 10 },
  { text: "How many players are on a football team?", options: ["9", "10", "11", "12"], correctAnswer: 2, category: "Football", difficulty: "easy", points: 10 },
  { text: "Who won the FIFA World Cup 2022?", options: ["France", "Brazil", "Germany", "Argentina"], correctAnswer: 3, category: "Football", difficulty: "easy", points: 10 },
  { text: "What is the offside rule in football?", options: ["Player behind defender", "Player ahead of last defender", "Player in own half", "Player next to goalkeeper"], correctAnswer: 1, category: "Football", difficulty: "medium", points: 10 },
  { text: "Which football position is Messi known for?", options: ["Goalkeeper", "Defender", "Forward", "Midfielder"], correctAnswer: 2, category: "Football", difficulty: "easy", points: 10 },
  // Basketball
  { text: "How many points is a three-pointer worth in basketball?", options: ["1", "2", "3", "4"], correctAnswer: 2, category: "Basketball", difficulty: "easy", points: 10 },
  { text: "Which player is known as 'The King' in NBA?", options: ["Kobe Bryant", "Michael Jordan", "LeBron James", "Stephen Curry"], correctAnswer: 2, category: "Basketball", difficulty: "easy", points: 10 },
  { text: "How tall is a standard basketball hoop from the floor?", options: ["8 feet", "9 feet", "10 feet", "11 feet"], correctAnswer: 2, category: "Basketball", difficulty: "medium", points: 10 },
  { text: "Which team has won the most NBA championships?", options: ["LA Lakers", "Boston Celtics", "Chicago Bulls", "Golden State Warriors"], correctAnswer: 1, category: "Basketball", difficulty: "medium", points: 10 },
  { text: "Who invented basketball?", options: ["James Naismith", "Michael Jordan", "Larry Bird", "Magic Johnson"], correctAnswer: 0, category: "Basketball", difficulty: "medium", points: 10 },
  // Tennis
  { text: "How many Grand Slam tournaments are there per year?", options: ["2", "3", "4", "5"], correctAnswer: 2, category: "Tennis", difficulty: "easy", points: 10 },
  { text: "Who holds the record for most Wimbledon titles (Men)?", options: ["Rafael Nadal", "Novak Djokovic", "Roger Federer", "Pete Sampras"], correctAnswer: 2, category: "Tennis", difficulty: "medium", points: 10 },
  { text: "What is the scoring sequence in tennis?", options: ["0,5,10,15,Game", "0,15,30,40,Game", "1,2,3,4,Game", "0,10,20,30,Game"], correctAnswer: 1, category: "Tennis", difficulty: "easy", points: 10 },
  { text: "Which surface is the French Open played on?", options: ["Grass", "Hard court", "Clay", "Carpet"], correctAnswer: 2, category: "Tennis", difficulty: "easy", points: 10 },
  { text: "Which player is known as 'Rafa'?", options: ["Roger Federer", "Novak Djokovic", "Rafael Nadal", "Andy Murray"], correctAnswer: 2, category: "Tennis", difficulty: "easy", points: 10 },
  // GK
  { text: "What is the capital of Australia?", options: ["Sydney", "Melbourne", "Canberra", "Brisbane"], correctAnswer: 2, category: "GK", difficulty: "medium", points: 10 },
  { text: "How many continents are there on Earth?", options: ["5", "6", "7", "8"], correctAnswer: 2, category: "GK", difficulty: "easy", points: 10 },
  { text: "What is the largest ocean on Earth?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], correctAnswer: 3, category: "GK", difficulty: "easy", points: 10 },
  { text: "Which planet is known as the Red Planet?", options: ["Venus", "Jupiter", "Mars", "Saturn"], correctAnswer: 2, category: "GK", difficulty: "easy", points: 10 },
  { text: "What is the currency of Japan?", options: ["Yuan", "Won", "Yen", "Ringgit"], correctAnswer: 2, category: "GK", difficulty: "easy", points: 10 },
  { text: "Who painted the Mona Lisa?", options: ["Michelangelo", "Raphael", "Leonardo da Vinci", "Donatello"], correctAnswer: 2, category: "GK", difficulty: "easy", points: 10 },
  { text: "What is the smallest country in the world?", options: ["Monaco", "San Marino", "Vatican City", "Liechtenstein"], correctAnswer: 2, category: "GK", difficulty: "medium", points: 10 },
  { text: "How many bones are in the human body?", options: ["196", "206", "216", "226"], correctAnswer: 1, category: "GK", difficulty: "medium", points: 10 },
  // Bollywood
  { text: "Which Bollywood film won the Academy Award for Best Film?", options: ["Dangal", "3 Idiots", "Lagaan", "Slumdog Millionaire"], correctAnswer: 3, category: "Bollywood", difficulty: "easy", points: 10 },
  { text: "Who is known as the 'King of Bollywood'?", options: ["Amitabh Bachchan", "Salman Khan", "Shah Rukh Khan", "Hrithik Roshan"], correctAnswer: 2, category: "Bollywood", difficulty: "easy", points: 10 },
  { text: "Which actor has won the most Filmfare Best Actor awards?", options: ["Shah Rukh Khan", "Amitabh Bachchan", "Dilip Kumar", "Ranveer Singh"], correctAnswer: 2, category: "Bollywood", difficulty: "hard", points: 10 },
  { text: "What is the highest-grossing Bollywood film of all time?", options: ["Dangal", "Bahubali 2", "KGF 2", "RRR"], correctAnswer: 0, category: "Bollywood", difficulty: "medium", points: 10 },
  { text: "Who directed the film '3 Idiots'?", options: ["Zoya Akhtar", "Rajkumar Hirani", "Anurag Kashyap", "Sanjay Leela Bhansali"], correctAnswer: 1, category: "Bollywood", difficulty: "medium", points: 10 },
  // Science
  { text: "What is the chemical symbol for gold?", options: ["Gl", "Go", "Au", "Ag"], correctAnswer: 2, category: "Science", difficulty: "easy", points: 10 },
  { text: "What is the speed of light?", options: ["3×10⁸ m/s", "3×10⁷ m/s", "3×10⁹ m/s", "3×10⁶ m/s"], correctAnswer: 0, category: "Science", difficulty: "medium", points: 10 },
  { text: "What gas do plants absorb during photosynthesis?", options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"], correctAnswer: 2, category: "Science", difficulty: "easy", points: 10 },
  { text: "Who discovered penicillin?", options: ["Louis Pasteur", "Marie Curie", "Alexander Fleming", "Robert Koch"], correctAnswer: 2, category: "Science", difficulty: "easy", points: 10 },
  { text: "What is the atomic number of Carbon?", options: ["4", "6", "8", "12"], correctAnswer: 1, category: "Science", difficulty: "medium", points: 10 },
  { text: "What is the powerhouse of the cell?", options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi Body"], correctAnswer: 2, category: "Science", difficulty: "easy", points: 10 },
  { text: "Which planet is closest to the Sun?", options: ["Earth", "Venus", "Mercury", "Mars"], correctAnswer: 2, category: "Science", difficulty: "easy", points: 10 },
  { text: "What is Newton's First Law of Motion?", options: ["F=ma", "Action-Reaction", "Law of Inertia", "Law of Gravitation"], correctAnswer: 2, category: "Science", difficulty: "medium", points: 10 },
  // History
  { text: "In which year did World War II end?", options: ["1943", "1944", "1945", "1946"], correctAnswer: 2, category: "History", difficulty: "easy", points: 10 },
  { text: "Who was the first President of the United States?", options: ["Abraham Lincoln", "Thomas Jefferson", "George Washington", "John Adams"], correctAnswer: 2, category: "History", difficulty: "easy", points: 10 },
  { text: "In which year did India gain independence?", options: ["1945", "1946", "1947", "1948"], correctAnswer: 2, category: "History", difficulty: "easy", points: 10 },
  { text: "Who was the first woman Prime Minister of India?", options: ["Sonia Gandhi", "Sarojini Naidu", "Indira Gandhi", "Pratibha Patil"], correctAnswer: 2, category: "History", difficulty: "easy", points: 10 },
  { text: "The Great Wall of China was built primarily to protect against which group?", options: ["Romans", "Persians", "Mongols", "Japanese"], correctAnswer: 2, category: "History", difficulty: "medium", points: 10 },
  { text: "Who gave the 'I Have a Dream' speech?", options: ["Barack Obama", "Malcolm X", "Martin Luther King Jr.", "Nelson Mandela"], correctAnswer: 2, category: "History", difficulty: "easy", points: 10 },
  // Technology
  { text: "Who co-founded Apple Inc.?", options: ["Bill Gates", "Steve Jobs", "Mark Zuckerberg", "Elon Musk"], correctAnswer: 1, category: "Technology", difficulty: "easy", points: 10 },
  { text: "What does HTML stand for?", options: ["Hyper Text Markup Language", "Home Text Markup Language", "Hyper Text Making Language", "High Text Markup Language"], correctAnswer: 0, category: "Technology", difficulty: "easy", points: 10 },
  { text: "Which company developed the Android operating system?", options: ["Apple", "Microsoft", "Google", "Samsung"], correctAnswer: 2, category: "Technology", difficulty: "easy", points: 10 },
  { text: "What does CPU stand for?", options: ["Central Processing Unit", "Computer Personal Unit", "Central Program Unit", "Core Processing Unit"], correctAnswer: 0, category: "Technology", difficulty: "easy", points: 10 },
  { text: "Who is known as the father of computers?", options: ["Alan Turing", "Charles Babbage", "John von Neumann", "Bill Gates"], correctAnswer: 1, category: "Technology", difficulty: "medium", points: 10 },
  { text: "What programming language is primarily used for web styling?", options: ["HTML", "JavaScript", "CSS", "Python"], correctAnswer: 2, category: "Technology", difficulty: "easy", points: 10 },
  { text: "What is the most used programming language worldwide?", options: ["Python", "Java", "JavaScript", "C++"], correctAnswer: 2, category: "Technology", difficulty: "medium", points: 10 },
  { text: "What does Wi-Fi stand for?", options: ["Wireless Fidelity", "Wide Frequency", "Wireless Function", "Wave Fidelity"], correctAnswer: 0, category: "Technology", difficulty: "easy", points: 10 },
  // Geography
  { text: "Which is the longest river in the world?", options: ["Amazon", "Nile", "Yangtze", "Mississippi"], correctAnswer: 1, category: "Geography", difficulty: "easy", points: 10 },
  { text: "Which is the highest mountain in the world?", options: ["K2", "Kangchenjunga", "Mount Everest", "Lhotse"], correctAnswer: 2, category: "Geography", difficulty: "easy", points: 10 },
  { text: "Which country has the most natural lakes?", options: ["Russia", "Canada", "Brazil", "USA"], correctAnswer: 1, category: "Geography", difficulty: "medium", points: 10 },
  { text: "What is the capital of Brazil?", options: ["São Paulo", "Rio de Janeiro", "Salvador", "Brasília"], correctAnswer: 3, category: "Geography", difficulty: "medium", points: 10 },
  { text: "Which desert is the largest in the world?", options: ["Sahara", "Gobi", "Arabian", "Antarctica"], correctAnswer: 3, category: "Geography", difficulty: "hard", points: 10 },
  { text: "Which country is both an island and a continent?", options: ["New Zealand", "Indonesia", "Australia", "Greenland"], correctAnswer: 2, category: "Geography", difficulty: "easy", points: 10 },
  { text: "The Amazon River flows through which continent?", options: ["Africa", "Asia", "South America", "North America"], correctAnswer: 2, category: "Geography", difficulty: "easy", points: 10 },
  { text: "Which country has the largest population?", options: ["India", "China", "USA", "Indonesia"], correctAnswer: 0, category: "Geography", difficulty: "easy", points: 10 },
];

const CONTESTS = [
  {
    title: "Cricket Champions Quiz",
    description: "Test your cricket knowledge and win big! 10 questions, 5 minutes.",
    category: "Cricket",
    entryFee: 10,
    totalSpots: 1000,
    startTime: new Date(Date.now() + 60 * 60 * 1000),    // 1 hour from now
    endTime: new Date(Date.now() + 25 * 60 * 60 * 1000), // 25 hours from now
    quizDuration: 300,
    winnersCount: 10,
    firstPrize: 500,
    status: 'active',
    prizeGroups: [
      { label: 'Rank 1', rankFrom: 1, rankTo: 1, percentage: 40 },
      { label: 'Rank 2', rankFrom: 2, rankTo: 2, percentage: 20 },
      { label: 'Rank 3', rankFrom: 3, rankTo: 3, percentage: 15 },
      { label: 'Rank 4-10', rankFrom: 4, rankTo: 10, percentage: 25 },
    ],
  },
  {
    title: "GK Mastermind Contest",
    description: "General knowledge quiz for the ultimate mastermind. Prove your knowledge!",
    category: "GK",
    entryFee: 5,
    totalSpots: 500,
    startTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 26 * 60 * 60 * 1000),
    quizDuration: 300,
    winnersCount: 5,
    firstPrize: 200,
    status: 'active',
    prizeGroups: [
      { label: 'Rank 1', rankFrom: 1, rankTo: 1, percentage: 50 },
      { label: 'Rank 2', rankFrom: 2, rankTo: 2, percentage: 25 },
      { label: 'Rank 3-5', rankFrom: 3, rankTo: 5, percentage: 25 },
    ],
  },
  {
    title: "Bollywood Blockbuster",
    description: "How well do you know Bollywood? Enter and win cash prizes!",
    category: "Bollywood",
    entryFee: 20,
    totalSpots: 200,
    startTime: new Date(Date.now() + 3 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 28 * 60 * 60 * 1000),
    quizDuration: 300,
    winnersCount: 3,
    firstPrize: 1000,
    status: 'active',
    prizeGroups: [
      { label: 'Rank 1', rankFrom: 1, rankTo: 1, percentage: 60 },
      { label: 'Rank 2', rankFrom: 2, rankTo: 2, percentage: 25 },
      { label: 'Rank 3', rankFrom: 3, rankTo: 3, percentage: 15 },
    ],
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Seed Settings
    await Settings.findOneAndUpdate({}, {
      merchantUpiId: process.env.MERCHANT_UPI || 'bkbbquiz@upi',
      merchantName: 'BKBBQUIZ',
      platformFeePercent: 30,
      appName: 'BKBBQUIZ',
      supportEmail: process.env.ADMIN_EMAIL || 'support@bkbbquiz.com',
    }, { upsert: true });
    console.log('✅ Settings seeded');

    // Seed admin user
    const existingAdmin = await User.findOne({ mobile: process.env.ADMIN_MOBILE || '9999999999' });
    if (!existingAdmin) {
      const admin = await User.create({
        name: process.env.ADMIN_NAME || 'Super Admin',
        username: 'superadmin',
        mobile: process.env.ADMIN_MOBILE || '9999999999',
        email: process.env.ADMIN_EMAIL || 'admin@bkbbquiz.com',
        dob: new Date('1990-01-01'),
        password: process.env.ADMIN_PASSWORD || 'Admin@123456',
        isAdmin: true,
      });
      await Wallet.create({ userId: admin._id });
      console.log('✅ Admin user seeded');
      console.log(`   Mobile: ${process.env.ADMIN_MOBILE || '9999999999'}`);
      console.log(`   Password: ${process.env.ADMIN_PASSWORD || 'Admin@123456'}`);
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // Seed questions
    const existingQuestions = await QuizQuestion.countDocuments();
    if (existingQuestions < 10) {
      await QuizQuestion.insertMany(QUESTIONS, { ordered: false });
      console.log(`✅ ${QUESTIONS.length} questions seeded`);
    } else {
      console.log(`ℹ️  ${existingQuestions} questions already exist`);
    }

    // Seed contests
    const existingContests = await Contest.countDocuments();
    if (existingContests === 0) {
      await Contest.insertMany(CONTESTS);
      console.log(`✅ ${CONTESTS.length} contests seeded`);
    } else {
      console.log(`ℹ️  ${existingContests} contests already exist`);
    }

    console.log('\n🎉 Seed complete! BKBBQUIZ is ready.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
}

seed();
