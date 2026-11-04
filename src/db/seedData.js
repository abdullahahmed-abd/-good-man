// Insaan Seed Data - Philosophers, Books (Full public domain + Chapter Summaries), Concepts, Quotes, Badges

export const PHILOSOPHERS = [
  {
    id: 'marcus-aurelius',
    name: 'Marcus Aurelius',
    era: '121 – 180 CE',
    school: 'Stoicism',
    role: 'Roman Emperor & Stoic Philosopher',
    avatar: '🏛️',
    summary: 'The philosopher-king who ruled Rome while privately writing reflections on duty, mortality, and emotional discipline.',
    bio: 'Marcus Aurelius Antoninus was Roman emperor from 161 to 180 CE and the last of the rulers known later as the Five Good Emperors. Despite facing devastating plagues, German wars, and court betrayals, he recorded his private journals—known today as Meditations—never intending them for publication.',
    timeline: [
      { year: '121 CE', event: 'Born in Rome to a prominent senatorial family' },
      { year: '138 CE', event: 'Adopted by Emperor Antoninus Pius at the behest of Hadrian' },
      { year: '161 CE', event: 'Ascends throne alongside Lucius Verus; Antonine Plague breaks out' },
      { year: '169–175 CE', event: 'Fights Marcomannic Wars along the Danube; begins writing Meditations' },
      { year: '180 CE', event: 'Dies at Vindobona (modern Vienna), leaving a legacy of personal integrity' }
    ],
    coreIdeas: [
      {
        title: 'The Inner Citadel',
        desc: 'External events cannot harm your soul; only your judgment and response can harm you.'
      },
      {
        title: 'Amor Fati (Love of Fate)',
        desc: 'Accept whatever arises not as an enemy, but as material for character growth.'
      },
      {
        title: 'Common Good (Sympatheia)',
        desc: 'We are made for cooperation, like feet, hands, and the rows of upper and lower teeth.'
      }
    ],
    quotes: [
      "You have power over your mind - not outside events. Realize this, and you will find strength.",
      "Waste no more time arguing what a good man should be. Be one.",
      "The soul becomes dyed with the color of its thoughts.",
      "When you arise in the morning think of what a privilege it is to be alive, to think, to enjoy, to love."
    ],
    exercises: [
      {
        name: 'Morning Preparation',
        action: 'Each morning, remind yourself: "I shall meet with the busy-body, the ungrateful, arrogant, deceitful, envious, unsocial. None can harm me because none can force me to do wrong."'
      },
      {
        name: 'The View from Above',
        action: 'Mentally zoom out into space. See your town, continent, and planet as a tiny speck in cosmic time. Feel your anxieties shrink in perspective.'
      }
    ]
  },
  {
    id: 'seneca',
    name: 'Seneca the Younger',
    era: 'c. 4 BCE – 65 CE',
    school: 'Stoicism',
    role: 'Statesman, Playwright & Stoic Essayist',
    avatar: '📜',
    summary: 'A master of practical life advice whose letters dissect time management, anger, resilience, and true friendship.',
    bio: 'Lucius Annaeus Seneca was a Roman Stoic philosopher, statesman, and dramatist. Exiled to Corsica and later tutor and advisor to Nero, Seneca understood the peaks of wealth and power as well as sudden catastrophe.',
    timeline: [
      { year: 'c. 4 BCE', event: 'Born in Corduba, Hispania (modern Spain)' },
      { year: '41 CE', event: 'Exiled to Corsica by Emperor Claudius on political allegations' },
      { year: '49 CE', event: 'Recalled to Rome to tutor young Nero' },
      { year: '62 CE', event: 'Retires from public life to write Letters from a Stoic and essays' },
      { year: '65 CE', event: 'Ordered by Nero to commit suicide; meets death with tranquil dignity' }
    ],
    coreIdeas: [
      {
        title: 'On the Shortness of Life',
        desc: 'Life is long enough if you know how to use it; we waste most of it on trivial distractions.'
      },
      {
        title: 'Premeditatio Malorum',
        desc: 'Mentally rehearse potential difficulties beforehand so nothing catches you unready.'
      },
      {
        title: 'True Friendship',
        desc: 'Do not withhold your heart from a friend. Deliberate before, but trust fully after.'
      }
    ],
    quotes: [
      "We suffer more often in imagination than in reality.",
      "It is not that we have a short time to live, but that we waste a lot of it.",
      "Luck is what happens when preparation meets opportunity.",
      "A man who suffers before it is necessary, suffers more than is necessary."
    ],
    exercises: [
      {
        name: 'Voluntary Discomfort',
        action: 'Spend 24 hours eating simple food, sleeping without luxury, and wearing rough clothes. Ask yourself: "Is this the condition that I feared?"'
      },
      {
        name: 'Evening Accounting',
        action: 'Before bed, question yourself: What bad habit have I checked today? What virtue have I fostered? In what way am I better?'
      }
    ]
  },
  {
    id: 'epictetus',
    name: 'Epictetus',
    era: 'c. 50 – 135 CE',
    school: 'Stoicism',
    role: 'Freed Slave & Stoic Teacher',
    avatar: '⛓️',
    summary: 'Born a slave in Hierapolis, Epictetus taught that inner freedom is the only real freedom that no tyrant can take away.',
    bio: 'Epictetus spent his youth as a slave in Rome to Epaphroditos, an administrative secretary to Nero. He was crippled in one leg, possibly through torture or illness. After gaining freedom, he taught philosophy until banished by Domitian, establishing an influential school in Nicopolis, Greece.',
    timeline: [
      { year: 'c. 50 CE', event: 'Born in Hierapolis (modern Pamukkale, Turkey)' },
      { year: 'c. 68 CE', event: 'Obtains freedom after Nero\'s fall; studies under Musonius Rufus' },
      { year: '93 CE', event: 'Domitian banishes philosophers from Rome; Epictetus settles in Nicopolis' },
      { year: 'c. 108 CE', event: 'Arrian records his lectures as Discourses and the Enchiridion Handbook' },
      { year: 'c. 135 CE', event: 'Passes away peacefully, revered across the Mediterranean world' }
    ],
    coreIdeas: [
      {
        title: 'The Dichotomy of Control',
        desc: 'Some things are up to us (opinions, impulses, desires, aversions); others are not (body, property, reputation, external events).'
      },
      {
        title: 'Freedom from Attachment',
        desc: 'Never say of anything "I have lost it," but only "I have returned it."'
      },
      {
        title: 'Character over Theory',
        desc: 'Sheep do not vomit up grass to show the shepherd how much they ate; they digest it inside and produce wool and milk.'
      }
    ],
    quotes: [
      "Men are disturbed not by things, but by the view which they take of them.",
      "First say to yourself what you would be; and then do what you have to do.",
      "Don't explain your philosophy. Embody it.",
      "Freedom is the only worthy goal in life. It is won by disregarding things that lie beyond our control."
    ],
    exercises: [
      {
        name: 'Filter of Control',
        action: 'When any annoyance strikes, immediately categorize it: "Is this under my direct control?" If not, train yourself to dismiss it: "Then it is nothing to me."'
      },
      {
        name: 'Pause Before Reaction',
        action: 'When provoked or insulted, count to ten or wait ten breaths before replying. Emotions thrive on instant reactivity.'
      }
    ]
  },
  {
    id: 'socrates',
    name: 'Socrates',
    era: '470 – 399 BCE',
    school: 'Classical Greek',
    role: 'Father of Western Philosophy',
    avatar: '🏺',
    summary: 'Prowled the marketplace of Athens questioning pretenses of wisdom, stating that the unexamined life is not worth living.',
    bio: 'Socrates wrote nothing himself; his life and dialectical method survive through his student Plato. Living simply without shoes and rejecting payment for teaching, he examined politicians, poets, and craftsmen, demonstrating that humility in knowledge is the starting point of wisdom.',
    timeline: [
      { year: '470 BCE', event: 'Born in Alopece, Athens; trained as a stonemason' },
      { year: '431–404 BCE', event: 'Served with valor as a hoplite in the Peloponnesian War' },
      { year: 'c. 420 BCE', event: 'Delphic Oracle proclaims: No one is wiser than Socrates' },
      { year: '399 BCE', event: 'Brought to trial for corrupting youth and impiety; drinks hemlock' }
    ],
    coreIdeas: [
      {
        title: 'The Examined Life',
        desc: 'Living on autopilot without questioning values and actions makes life hollow.'
      },
      {
        title: 'Socratic Method (Elenchus)',
        desc: 'Refining understanding by asking clarifying questions and exposing internal contradictions.'
      },
      {
        title: 'Virtue is Knowledge',
        desc: 'No one does wrong willingly; wrongdoing stems from ignorance of the true good.'
      }
    ],
    quotes: [
      "The unexamined life is not worth living.",
      "I know that I am intelligent, because I know that I know nothing.",
      "Be kind, for everyone you meet is fighting a hard battle.",
      "Strong minds discuss ideas, average minds discuss events, weak minds discuss people."
    ],
    exercises: [
      {
        name: '5 Whys Socratic Drill',
        action: 'Take a belief you hold strongly (e.g. "I must be rich to be happy"). Ask "Why do I believe this?" five levels deep to find the root assumption.'
      }
    ]
  },
  {
    id: 'plato',
    name: 'Plato',
    era: '428 – 348 BCE',
    school: 'Platonism',
    role: 'Founder of the Academy',
    avatar: '🏛️',
    summary: 'Socrates\' disciple who founded the first Western university and investigated justice, love, the ideal state, and the Forms.',
    bio: 'Plato was an Athenian philosopher who founded the Academy, the first institution of higher learning in the Western world. His philosophical dialogues have influenced nearly all subsequent Western philosophy, theology, and political theory.',
    timeline: [
      { year: '428 BCE', event: 'Born to an aristocratic family in Athens' },
      { year: '399 BCE', event: 'Devastated by execution of Socrates; travels Mediterranean' },
      { year: '387 BCE', event: 'Founds the Academy in Athens' },
      { year: '375 BCE', event: 'Writes The Republic, presenting the Allegory of the Cave' },
      { year: '348 BCE', event: 'Dies peacefully at Athens in his eighties' }
    ],
    coreIdeas: [
      {
        title: 'Allegory of the Cave',
        desc: 'Most people mistake shadows on the wall for reality; enlightenment requires turning around toward the sunlight of truth.'
      },
      {
        title: 'Tripartite Soul',
        desc: 'The soul consists of Reason (charioteer), Spirit/Will (white horse), and Appetite/Desires (black horse).'
      },
      {
        title: 'Justice as Internal Harmony',
        desc: 'Justice occurs when each part of yourself fulfills its proper role governed by reason.'
      }
    ],
    quotes: [
      "The greatest wealth is to live content with little.",
      "We can easily forgive a child who is afraid of the dark; the real tragedy of life is when men are afraid of the light.",
      "Music gives a soul to the universe, wings to the mind, flight to the imagination and life to everything."
    ],
    exercises: [
      {
        name: 'Audit Your Shadows',
        action: 'Identify one digital or social shadow you consume daily (e.g. doomscrolling, vanity metrics) that distracts you from real substance.'
      }
    ]
  },
  {
    id: 'aristotle',
    name: 'Aristotle',
    era: '384 – 322 BCE',
    school: 'Peripatetic / Virtue Ethics',
    role: 'Polymath & Tutor to Alexander the Great',
    avatar: '🦉',
    summary: 'The master of logic and empirical ethics who defined flourishing (Eudaimonia) through daily virtuous action.',
    bio: 'Aristotle studied at Plato\'s Academy for twenty years before tutoring Alexander the Great. He founded the Lyceum in Athens and wrote groundbreaking treatises on ethics, politics, biology, metaphysics, and poetics.',
    timeline: [
      { year: '384 BCE', event: 'Born in Stagira, northern Greece' },
      { year: '367 BCE', event: 'Enters Plato\'s Academy in Athens at age 17' },
      { year: '343 BCE', event: 'Invited by King Philip II of Macedon to tutor Alexander' },
      { year: '335 BCE', event: 'Founds the Lyceum in Athens, teaching while walking (Peripatetic)' },
      { year: '322 BCE', event: 'Dies in Euboea after fleeing anti-Macedonian sentiment' }
    ],
    coreIdeas: [
      {
        title: 'The Golden Mean',
        desc: 'Virtue is the balance between deficiency and excess (e.g. Courage lies between Cowardice and Recklessness).'
      },
      {
        title: 'Eudaimonia (Flourishing)',
        desc: 'The ultimate human good is not fleeting pleasure, but the lifelong realization of human potential in accord with virtue.'
      },
      {
        title: 'Habitual Excellence',
        desc: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.'
      }
    ],
    quotes: [
      "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
      "Knowing yourself is the beginning of all wisdom.",
      "It is the mark of an educated mind to be able to entertain a thought without accepting it.",
      "Educating the mind without educating the heart is no education at all."
    ],
    exercises: [
      {
        name: 'The Golden Mean Calibration',
        action: 'Pick an area where you oscillate (e.g. spending, speaking, exercise). Find the midpoint between doing too little and burning out.'
      }
    ]
  },
  {
    id: 'epicurus',
    name: 'Epicurus',
    era: '341 – 270 BCE',
    school: 'Epicureanism',
    role: 'Founder of the Garden',
    avatar: '🍇',
    summary: 'Reframed pleasure not as hedonism, but as the quiet absence of physical pain and mental anxiety (Ataraxia).',
    bio: 'Epicurus established "The Garden" in Athens, a community welcoming men, women, and slaves alike. He taught that true happiness comes from modest living, philosophical conversation, and liberation from superstitious dread.',
    timeline: [
      { year: '341 BCE', event: 'Born on the Aegean island of Samos' },
      { year: '306 BCE', event: 'Establishes The Garden community just outside Athens' },
      { year: '270 BCE', event: 'Dies of kidney stones, comforting his students with good memories' }
    ],
    coreIdeas: [
      {
        title: 'Tetrapharmakos (The Four-Part Cure)',
        desc: 'Don\'t fear God; don\'t worry about death; what is good is easy to get; what is terrible is easy to endure.'
      },
      {
        title: 'Natural vs Unnatural Desires',
        desc: 'Distinguish basic needs (food, simple shelter, friends) from endless desires (fame, luxury).'
      }
    ],
    quotes: [
      "Do not spoil what you have by desiring what you have not; remember that what you now have was once among the things you only hoped for.",
      "Death is nothing to us. When we exist, death is not; and when death exists, we are not.",
      "Of all the means which wisdom acquires to ensure happiness, by far the most important is friendship."
    ],
    exercises: [
      {
        name: 'Savoring Modesty',
        action: 'Eat a meal of simple bread, fruit, or water in full presence with a loved friend. Recognize that luxury adds nothing to essential peace.'
      }
    ]
  },
  {
    id: 'immanuel-kant',
    name: 'Immanuel Kant',
    era: '1724 – 1804',
    school: 'Deontology / Enlightenment',
    role: 'Prussian Philosopher of Pure Reason',
    avatar: '⚖️',
    summary: 'The architect of modern ethics who asserted that human beings must always be treated as ends, never merely as means.',
    bio: 'Living his entire life in Königsberg, Kant established critical philosophy. His strict daily routine was so dependable that citizens reportedly set their clocks by his afternoon walk.',
    timeline: [
      { year: '1724', event: 'Born in Königsberg, Prussia' },
      { year: '1770', event: 'Appointed Professor of Logic and Metaphysics' },
      { year: '1781', event: 'Publishes Critique of Pure Reason' },
      { year: '1785', event: 'Publishes Groundwork of the Metaphysics of Morals' },
      { year: '1804', event: 'Dies saying "Es ist gut" (It is good)' }
    ],
    coreIdeas: [
      {
        title: 'Categorical Imperative',
        desc: 'Act only on that maxim whereby you can at the same time will that it should become a universal law.'
      },
      {
        title: 'Human Dignity Principle',
        desc: 'Treat humanity, whether in your own person or another, always as an end and never merely as an instrument.'
      }
    ],
    quotes: [
      "Two things fill the mind with ever new and increasing admiration: the starry heavens above me and the moral law within me.",
      "Have patience awhile; slanders are not long-lived. Truth is the child of time.",
      "Dare to know! Have the courage to use your own understanding."
    ],
    exercises: [
      {
        name: 'The Universalization Test',
        action: 'Before taking a questionable shortcut, ask: "What if every person on earth did this right now?" If the system collapses, do not do it.'
      }
    ]
  },
  {
    id: 'friedrich-nietzsche',
    name: 'Friedrich Nietzsche',
    era: '1844 – 1900',
    school: 'Existentialism / Vitalism',
    role: 'Iconoclastic German Thinker',
    avatar: '⚡',
    summary: 'Challenged conventional morality and urged humanity to overcome complacency and embrace life with unyielding vigor.',
    bio: 'A brilliant philologist turned radical philosopher, Nietzsche lived a solitary life in Alpine heights and Mediterranean towns, writing poetry and piercing aphorisms that anticipated modern psychology.',
    timeline: [
      { year: '1844', event: 'Born in Röcken, Saxony, Prussia' },
      { year: '1869', event: 'Becomes Professor of Classical Philology at Basel at age 24' },
      { year: '1883', event: 'Publishes Thus Spoke Zarathustra' },
      { year: '1889', event: 'Suffers mental breakdown in Turin' },
      { year: '1900', event: 'Dies in Weimar; ideas later profoundly impact world literature and psychology' }
    ],
    coreIdeas: [
      {
        title: 'Amor Fati',
        desc: 'Not merely bearing what is necessary, but loving it. All pain and triumph belong together.'
      },
      {
        title: 'Self-Overcoming (Übermensch)',
        desc: 'Life is a ladder of continually transcending your lower self and building strength of spirit.'
      }
    ],
    quotes: [
      "He who has a why to live can bear almost any how.",
      "That which does not kill us makes us stronger.",
      "No one can construct for you the bridge upon which precisely you must cross the stream of life.",
      "You must have chaos within you to give birth to a dancing star."
    ],
    exercises: [
      {
        name: 'The Eternal Recurrence Query',
        action: 'Ask yourself: "If I had to live this day over and over for eternity, would I live it this way?" Act with that degree of presence and honor.'
      }
    ]
  },
  {
    id: 'soren-kierkegaard',
    name: 'Søren Kierkegaard',
    era: '1813 – 1855',
    school: 'Christian Existentialism',
    role: 'Danish Father of Existentialism',
    avatar: '🕯️',
    summary: 'Probed the anxiety of human freedom, the dread of choices, and the necessity of personal commitment.',
    bio: 'Søren Kierkegaard wrote extensively under pseudonyms in Copenhagen, examining religious faith, romantic heartbreak, and the individual standing alone before existence.',
    timeline: [
      { year: '1813', event: 'Born in Copenhagen, Denmark' },
      { year: '1840', event: 'Breaks engagement with Regine Olsen to dedicate his life to thought' },
      { year: '1843', event: 'Publishes Fear and Trembling and Either/Or' },
      { year: '1855', event: 'Collapses on the street; dies at age 42' }
    ],
    coreIdeas: [
      {
        title: 'Anxiety as the Dizziness of Freedom',
        desc: 'Anxiety occurs when we realize our boundless ability to choose and the weight of our decisions.'
      },
      {
        title: 'Living Forward, Understanding Backward',
        desc: 'Life can only be understood backwards, but it must be lived forwards.'
      }
    ],
    quotes: [
      "Life is not a problem to be solved, but a reality to be experienced.",
      "Anxiety is the dizziness of freedom.",
      "The most common form of despair is not being who you are."
    ],
    exercises: [
      {
        name: 'Claim Your Choice',
        action: 'Stop saying "I have to do this." Reframe it honestly: "I choose to do this because I value its consequence."'
      }
    ]
  },
  {
    id: 'albert-camus',
    name: 'Albert Camus',
    era: '1913 – 1960',
    school: 'Absurdism',
    role: 'Nobel Laureate & Novelist',
    avatar: '☀️',
    summary: 'Confronted the silent absurdity of the universe by championing human defiance, freedom, and unwavering passion.',
    bio: 'Born in French Algeria into poverty, Camus became an active member of the French Resistance during WWII and won the Nobel Prize in Literature at age 44 for his writings illuminating the human conscience.',
    timeline: [
      { year: '1913', event: 'Born in Mondovi, French Algeria' },
      { year: '1942', event: 'Publishes The Stranger and The Myth of Sisyphus' },
      { year: '1944', event: 'Edits underground French Resistance newspaper Combat' },
      { year: '1957', event: 'Awarded Nobel Prize in Literature' },
      { year: '1960', event: 'Tragically killed in a car accident near Villeblevin' }
    ],
    coreIdeas: [
      {
        title: 'The Absurd',
        desc: 'The conflict between human longing for inherent purpose and the cold indifference of the cosmos.'
      },
      {
        title: 'Sisyphus Smiling',
        desc: 'We must imagine Sisyphus happy. Finding dignity and joy in the very act of rolling the boulder uphill.'
      }
    ],
    quotes: [
      "In the midst of winter, I found there was, within me, an invincible summer.",
      "The only way to deal with an unfree world is to become so absolutely free that your very existence is an act of rebellion.",
      "Don't walk behind me; I may not lead. Don't walk in front of me; I may not follow. Just walk beside me and be my friend."
    ],
    exercises: [
      {
        name: 'The Invincible Summer',
        action: 'When circumstances feel dreary or repetitive, deliberately find joy in a physical sensation: the warmth of tea, the breeze, the rhythm of your steps.'
      }
    ]
  },
  {
    id: 'arthur-schopenhauer',
    name: 'Arthur Schopenhauer',
    era: '1788 – 1860',
    school: 'German Idealism / Pessimism',
    role: 'Philosopher of the Will',
    avatar: '🐩',
    summary: 'Recognized universal suffering driven by blind desire and championed compassion, art, and philosophy as liberation.',
    bio: 'Schopenhauer lived in Frankfurt with his pet poodles. Combining Western metaphysics with early translations of the Upanishads and Buddhism, he laid groundwork for Freud and Nietzsche.',
    timeline: [
      { year: '1788', event: 'Born in Danzig (Gdańsk)' },
      { year: '1818', event: 'Publishes magnum opus The World as Will and Representation' },
      { year: '1851', event: 'Achieves late-life worldwide fame with Parerga and Paralipomena' },
      { year: '1860', event: 'Dies at his home in Frankfurt am Main' }
    ],
    coreIdeas: [
      {
        title: 'Compassion as Root of Morality',
        desc: 'Recognizing that all beings suffer under the same blind Will creates boundless empathy.'
      },
      {
        title: 'The Hedgehog\'s Dilemma',
        desc: 'Human beings huddle together for warmth in the cold, but prick each other when too close, learning to find the courteous middle distance.'
      }
    ],
    quotes: [
      "Compassion is the basis of morality.",
      "A man can be himself only so long as he is alone.",
      "Health outweighs all other blessings so much that one may say a healthy beggar is happier than an ailing king."
    ],
    exercises: [
      {
        name: 'Radical Empathy Glance',
        action: 'Look at a difficult coworker or stranger. Silently say to yourself: "They too are struggling under the burden of life just like me."'
      }
    ]
  },
  {
    id: 'baruch-spinoza',
    name: 'Baruch Spinoza',
    era: '1632 – 1677',
    school: 'Rationalism / Pantheism',
    role: 'Lens Grinder & Philosopher of Nature',
    avatar: '💎',
    summary: 'Refused prestigious university chairs to grind optical lenses, seeing God and Nature as one sublime, rational unity.',
    bio: 'Excommunicated from the Jewish community in Amsterdam for heretical ideas, Spinoza lived a quiet life grinding precision telescope and microscope lenses while writing his geometric masterpiece, Ethics.',
    timeline: [
      { year: '1632', event: 'Born in Amsterdam to Portuguese-Jewish parents' },
      { year: '1656', event: 'Issued Cherem (ban of excommunication) for radical theological ideas' },
      { year: '1670', event: 'Publishes Theological-Political Treatise anonymously' },
      { year: '1677', event: 'Dies of lung illness caused by glass dust; Ethics published posthumously' }
    ],
    coreIdeas: [
      {
        title: 'Deus sive Natura (God or Nature)',
        desc: 'Everything that exists is an expression of one singular infinite substance.'
      },
      {
        title: 'Sub Specie Aeternitatis',
        desc: 'To view events under the aspect of eternity; seeing personal setbacks as small notes in a vast universal symphony.'
      }
    ],
    quotes: [
      "I have striven not to laugh at human actions, not to weep at them, nor to hate them, but to understand them.",
      "Peace is not an absence of war, it is a virtue, a state of mind, a disposition for benevolence, confidence, justice.",
      "All things excellent are as difficult as they are rare."
    ],
    exercises: [
      {
        name: 'The Cosmic Perspective',
        action: 'Whenever irritation strikes, view the incident from 1,000 years in the future. See how minor it truly is.'
      }
    ]
  }
];

export const PHILOSOPHY_CONCEPTS = [
  {
    id: 'dichotomy-of-control',
    name: 'Dichotomy of Control',
    origin: 'Stoicism (Epictetus)',
    icon: '🎯',
    definition: 'Dividing reality into what is within our direct power (actions, thoughts, values) and what is not (other people, outcomes, weather, reputation). Peace comes from focusing exclusively on the former.',
    dailyPractice: 'When frustrated, immediately ask: "Can I directly change this right now?" If no, let go of emotional resistance.'
  },
  {
    id: 'amor-fati',
    name: 'Amor Fati',
    origin: 'Nietzsche / Marcus Aurelius',
    icon: '🔥',
    definition: 'Loving one\'s fate—not merely enduring adversity with gritted teeth, but enthusiastically embracing every obstacle as the perfect fuel for character.',
    dailyPractice: 'Greet every unexpected hurdle today with: "This is what I needed to test my patience and resolve."'
  },
  {
    id: 'memento-mori',
    name: 'Memento Mori',
    origin: 'Ancient Rome / Stoics',
    icon: '⏳',
    definition: 'Remembering that you must die. Keeping the finitude of life at hand evaporates petty anger, heals vanity, and infuses today with profound urgency and gratitude.',
    dailyPractice: 'Remind yourself at dawn: "This could be my last day. How do I wish to treat the people around me?"'
  },
  {
    id: 'golden-mean',
    name: 'The Golden Mean',
    origin: 'Aristotle',
    icon: '⚖️',
    definition: 'Virtue is the harmonious middle path between deficiency and excess. Courage balances between cowardice and recklessness; generosity balances between miserliness and profligacy.',
    dailyPractice: 'Observe your extremes today. Where are you over-reacting or under-delivering? Walk the measured center.'
  },
  {
    id: 'categorical-imperative',
    name: 'Categorical Imperative',
    origin: 'Immanuel Kant',
    icon: '🌐',
    definition: 'Act only according to that maxim whereby you can at the same time will that it should become a universal law.',
    dailyPractice: 'Never make an exception for yourself in traffic, queueing, or honesty that you would condemn in others.'
  },
  {
    id: 'arete',
    name: 'Aretē (Excellence / Virtue)',
    origin: 'Classical Greece',
    icon: '✨',
    definition: 'Fulfilling one\'s highest human potential in every moment. Living with moral integrity, wisdom, and nobility of character.',
    dailyPractice: 'Whatever your hand touches today—writing code, washing dishes, speaking to family—do it with total dedication and care.'
  }
];

export const DAILY_REFLECTIONS = [
  {
    id: 'refl-1',
    prompt: 'What is one thing that frustrated you recently, and what portion of it was actually within your control?',
    philosopher: 'Epictetus',
    virtue: 'Patience'
  },
  {
    id: 'refl-2',
    prompt: 'If this were the final week of your life, which trivial worries would you drop instantly?',
    philosopher: 'Marcus Aurelius',
    virtue: 'Wisdom'
  },
  {
    id: 'refl-3',
    prompt: 'How can you turn your biggest obstacle right now into an opportunity to practice courage or kindness?',
    philosopher: 'Seneca',
    virtue: 'Courage'
  },
  {
    id: 'refl-4',
    prompt: 'Did you treat everyone you encountered today as an end in themselves, or merely as a means to an outcome?',
    philosopher: 'Immanuel Kant',
    virtue: 'Honesty'
  },
  {
    id: 'refl-5',
    prompt: 'What habit are you repeating that is molding you into a person you do not wish to be?',
    philosopher: 'Aristotle',
    virtue: 'Discipline'
  }
];

// BOOKS LIBRARY
// Full text public domain books + original chapter-by-chapter summaries for copyrighted classics
export const SEED_BOOKS = [
  // PUBLIC DOMAIN - FULL TEXT BOOKS
  {
    id: 'meditations-marcus-aurelius',
    title: 'Meditations',
    author: 'Marcus Aurelius',
    category: 'Philosophy & Stoicism',
    isPublicDomain: true,
    year: '180 CE',
    coverColor: 'from-amber-700 to-stone-900',
    description: 'The private, intimate journal of the Roman Emperor Marcus Aurelius on Stoic duty, nature, and the inner citadel.',
    chapters: [
      {
        title: 'Book 1: Debts and Lessons',
        content: `From my grandfather Verus I learned good morals and the government of my temper.

From the reputation and remembrance of my father, modesty and a manly character.

From my mother, piety and beneficence, and abstinence, not only from evil deeds, but even from evil thoughts; and further, simplicity in my way of living, far removed from the habits of the rich.

From my great-grandfather, not to have frequented public schools, and to have had good teachers at home, and to know that on such things a man should spend liberally.

From Diognetus, not to busy myself about trifling things, and not to give credit to what was said by miracle-workers and jugglers about incantations and the driving away of daemons and such things; and not to breed quails for fighting, nor to give myself up to such passions; and to endure freedom of speech; and to have become intimate with philosophy.

From Rusticus I received the impression that my character required improvement and discipline; and from him I learned not to be led astray to sophistic emulation, nor to writing on speculative matters, nor to delivering little hortatory orations, nor to showing myself off as a man who does much discipline, or does benevolent acts in order to make a display; and to abstain from rhetoric, and poetry, and fine writing.

From Apollonius I learned freedom of will and undeviating steadiness of purpose; and to look to nothing else, not even for a moment, except to reason; and to be always the same, in sharp pains, on the occasion of the loss of a child, and in long illness; and clearly to see in a living example that the same man can be both the most resolute and yielding, and not peevish in giving his instruction.

From Sextus, a benevolent disposition, and the example of a family governed in a fatherly manner, and the idea of living conformably to nature; and gravity without affectation, and to look carefully after the interests of friends, and to tolerate ignorant persons, and those who form opinions without consideration.

From Maximus I learned self-government, and not to be led aside by anything; and cheerfulness in all circumstances, as well as in illness; and a just blend in the moral character of sweetness and dignity, and to do what was set before me without complaining.`
      },
      {
        title: 'Book 2: On the River Danube',
        content: `When you wake up in the morning, tell yourself: The people I deal with today will be meddling, ungrateful, arrogant, dishonest, jealous, and surly. They are like this because they cannot distinguish good from evil.

But I have seen the beauty of good, and the ugliness of evil, and have recognized that the wrongdoer has a nature related to my own - not of the same blood or birth, but the same mind, and possessing a share of the divine. And so none of them can hurt me. No one can implicate me in ugliness. Nor can I feel angry at my relative, or hate him. We were made to work together like feet, hands, and the rows of the upper and lower teeth. To obstruct each other is against nature. To be angry at someone, to turn your back on him: these are obstructions.

Whatever this is that I am, it is a little flesh and breath, and the ruling part. Despise the flesh: blood and bones and a network, a jumble of nerves, veins, and arteries. Consider the breath: wind, always changing, expelled and sucked back again. The third part is the master: you are an old man; do not let this any longer be a slave, do not let it any longer be pulled by the strings of selfish desire, nor let it complain of the present or shrink from the future.

Everything that comes from the gods is full of Providence. That which comes from fortune is not separated from nature or without an interweaving and involution with the things ordered by Providence. From thence all things flow.

Remember how long you have been deferring these things, and how often a certain limit of time has been set for you, which if you do not use to clear the clouds from your mind, it will go and you will go, and there will never be another chance.`
      },
      {
        title: 'Book 3: The Sacred Spark Inside',
        content: `We ought to consider not only that our life is each day expending itself, and that a smaller portion of it is left, but this also: if a man should live longer, it is quite uncertain whether his intellect will continue to be sufficient for the understanding of things, and for the contemplation which strives to acquire knowledge of the divine and the human. For if he should begin to fall into dotage, perspiration and nutrition and imagination and appetite and other things of that kind will not fail; but the power of making use of ourselves, and filling up the measure of our duty, and clearly separating all appearances, and considering whether he should now depart from life - all this is entirely extinguished in him beforehand. We must make haste then, not only because we are each day nearer to death, but also because the conception of things and the understanding of them cease first.

Never value anything as profitable to yourself which shall ever compel you to break your promise, to lose your self-respect, to hate any man, to suspect, to curse, to act the hypocrite, to desire anything which needs walls and curtains: for he who has preferred to everything else his own intelligence and daemon and the worship of its excellence, acts no tragic part, does not groan, will not need either solitude or much company; and, what is chief of all, he will live without either pursuing or flying from death.

Throw away idle speculations; hold on only to these few truths: that each person lives only in this fleeting present. The rest is either already lived or submerged in obscurity. Brief then is the time which each man lives, and small the nook of the earth where he lives.`
      },
      {
        title: 'Book 4: The Inner Sanctuary',
        content: `Men look for retreats for themselves, the country, by the seashore, or in the hills. There is nowhere that a man can find a more peaceful and trouble-free retreat than in his own mind, especially if he has within himself the kind of thoughts that allow him to be immediately at ease. So constantly grant yourself this retreat, and renew yourself. Let your basic concepts be brief and fundamental, so that as soon as you have returned to them, they will wash away all your discontent, and send you back without irritation to the affairs to which you must return.

For what is it that displeases you? The wickedness of men? Reflect on the conclusion that rational beings exist for one another, and that tolerance is a part of justice, and that men do wrong involuntarily.

Or are you discontented with your portion in the universe? Recall the alternative: either Providence or blind atoms.

Does the physical body still pull you? Reflect that the mind does not blend with breath and flesh once it has grasped its own power and true nature.

Take away your opinion, and there is taken away the complaint, "I have been harmed." Take away the complaint, "I have been harmed," and the harm is taken away.

That which does not make a man worse than he was, also does not make his life worse, nor does it hurt him either from without or from within.`
      }
    ]
  },
  {
    id: 'enchiridion-epictetus',
    title: 'The Enchiridion (Handbook for Living)',
    author: 'Epictetus',
    category: 'Philosophy & Stoicism',
    isPublicDomain: true,
    year: 'c. 125 CE',
    coverColor: 'from-blue-800 to-slate-900',
    description: 'The definitive manual of Stoic philosophy on what is in your control, emotional sovereignty, and practical resilience.',
    chapters: [
      {
        title: 'Chapter 1: Things in Our Power and Things Not',
        content: `Some things are in our control and others not. Things in our control are opinion, pursuit, desire, aversion, and, in a word, whatever are our own actions. Things not in our control are body, property, reputation, command, and, in one word, whatever are not our own actions.

The things in our control are by nature free, unrestrained, unhindered; but those not in our control are weak, slavish, restrained, belonging to others. Remember, then, that if you suppose that things which are slavish by nature are also free, and that what belongs to others is your own, then you will be hindered. You will lament, you will be disturbed, and you will find fault both with gods and men. But if you suppose that only to be your own which is your own, and what belongs to others such as it really is, then no one will ever compel you or restrain you. Further, you will find fault with no one or accuse no one. You will do nothing against your will. No one will hurt you, you will have no enemies, and you will not be harmed.

Aiming therefore at such great things, remember that you must not allow yourself to be carried, even with a slight effort, toward other matters; you must completely give up some things and for the present postpone others.`
      },
      {
        title: 'Chapter 2: Managing Judgments and Impressions',
        content: `Remember that following desire promises the attainment of that of which you are desirous; and aversion promises the avoiding that to which you are averse. However, he who fails to obtain the object of his desire is disappointed, and he who incurs the object of his aversion wretched. If, then, you confine your aversion to those objects only which are contrary to the natural use of your faculties, which you have in your own control, you will never incur anything to which you are averse. But if you are averse to sickness, or death, or poverty, you will be wretched.

Remove aversion, then, from all things that are not in our control, and transfer it to things contrary to the nature of what is in our control. But, for the present, totally suppress desire: for, if you desire any of the things which are not in your own control, you must necessarily be disappointed.

When any harsh appearance presents itself to your mind, argue with it immediately: "You are only an impression, and by no means the thing you represent." Then examine it by your rules: Does this concern things which are in our power, or things which are not? If it concerns things not in our power, be ready with the answer: "This is nothing to me."`
      },
      {
        title: 'Chapter 5: The Source of Human Disturbance',
        content: `Men are disturbed, not by things, but by the principles and notions which they form concerning things. Death, for instance, is not terrible, else it would have appeared so to Socrates. But the terror consists in our notion of death that it is terrible.

When therefore we are hindered, or disturbed, or grieved, let us never attribute it to others, but to ourselves; that is, to our own principles and judgments.

An uninstructed person will lay the fault of his own bad condition upon others. Someone who has begun instruction will lay the fault on himself. But he who is perfectly instructed will neither blame another nor himself.`
      },
      {
        title: 'Chapter 8: Harmonizing with Reality',
        content: `Demand not that events should happen as you wish; but wish them to happen as they do happen, and you will go on well.

Sickness is a hindrance to the body, but not to your will, unless it is your choice that it should be. Lameness is a hindrance to the leg, but not to your will. Say this to yourself with regard to everything that happens, then you will see such occurrences as hindrances to something else, but not to yourself.`
      }
    ]
  },
  {
    id: 'letters-from-a-stoic-seneca',
    title: 'Letters from a Stoic (Epistulae Morales)',
    author: 'Lucius Annaeus Seneca',
    category: 'Philosophy & Stoicism',
    isPublicDomain: true,
    year: '65 CE',
    coverColor: 'from-emerald-800 to-teal-950',
    description: 'Letters addressed to his dear friend Lucilius sharing reflections on simplifying life, managing time, and cultivating serenity.',
    chapters: [
      {
        title: 'Letter 1: On Saving Time',
        content: `Continue to act thus, my dear Lucilius: set yourself free for your own sake; gather and save your time, which till lately has been forced from you, or filched away, or has merely slipped between your fingers. Make yourself believe the truth of my words - that certain moments are torn from us, that some are gently stolen, and that others glide beyond our reach. The most disgraceful kind of loss, however, is that due to carelessness.

If you pay close heed, you will see that the largest portion of our life passes while we are doing ill, a goodly share while we are doing nothing, and the whole while we are doing that which is not to the purpose. What man can you show me who places any value on his time, who reckons the worth of each passing day, who understands that he is dying daily? In this we are mistaken: that we look forward to death; the major portion of death has already passed. Whatever years lie behind us are in death's hands.

Therefore, Lucilius, do what you write me that you are doing: hold every hour in your grasp. Lay hold of today's task, and you will not need to depend so much upon tomorrow's. While we are postponing, life speeds by. Nothing, Lucilius, is ours, except time.`
      },
      {
        title: 'Letter 2: On Discursive Reading',
        content: `Judging by what you write to me, and by what I hear, I am forming a good opinion of you. You do not run hither and thither, or distract yourself by changing your abode. Such restlessness is the sign of a disordered spirit. The primary indication, to my thinking, of a well-ordered mind is a man's ability to remain in one place and linger in his own company.

Be careful, however, lest this reading of many authors and books of every sort may tend to make you discursive and unsteady. You must linger among a limited number of master-thinkers, and digest their works, if you would derive ideas which shall win firm hold in your mind. Everywhere means nowhere. To be everywhere is to be nowhere. People who spend their whole life traveling end up having plenty of places where they can find hospitality, but no real friendships.

The same thing necessarily happens to those who never apply themselves intimately to any single author, but casually turn over pages in haste. Food does no good and is not assimilated into the body if it is leaving the stomach as fast as it enters.`
      },
      {
        title: 'Letter 9: On Philosophy and Friendship',
        content: `The wise man is self-sufficient. This has been misunderstood by many: they suppose it means that the wise man cares nothing for friends. But that is not true. The wise man, self-sufficient as he is, still desires to have a friend, if only for the purpose of practicing friendship, in order that so noble a virtue may not remain dormant.

He desires a friend not, as Epicurus says, "in order that there may be someone to sit by him when he is ill, or help him when he is in prison or in poverty," but that he may have someone by whose sickbed he himself may sit, someone a prisoner in hostile hands whom he himself may liberate. He who regards himself only, and enters upon friendships for this reason, reckons wrongly. The end will correspond to the beginning: he has made friends with someone who could assist him against bonds; at the first rattle of the chain, that friend will take flight.`
      }
    ]
  },
  {
    id: 'the-republic-plato',
    title: 'The Republic: The Allegory of the Cave',
    author: 'Plato',
    category: 'Classical Philosophy',
    isPublicDomain: true,
    year: '375 BCE',
    coverColor: 'from-purple-900 to-indigo-950',
    description: 'The celebrated philosophical dialogue revealing the illusion of superficial appearances and the ascent toward truth.',
    chapters: [
      {
        title: 'Book VII: The Allegory of the Cave',
        content: `And now, I said, let me show in a figure how far our nature is enlightened or unenlightened: Behold! human beings living in an underground den, which has a mouth open towards the light and reaching all along the den; here they have been from their childhood, and have their legs and necks chained so that they cannot move, and can only see before them, being prevented by the chains from turning round their heads. Above and behind them a fire is blazing at a distance, and between the fire and the prisoners there is a raised way; and you will see, if you look, a low wall built along the way, like the screen which marionette players have in front of them, over which they show the puppets.

And do you see, I said, men passing along the wall carrying all sorts of vessels, and statues and figures of animals made of wood and stone and various materials, which appear over the wall? Some of them are talking, others silent.

You have shown me a strange image, and they are strange prisoners.

Like ourselves, I replied; and they see only their own shadows, or the shadows of one another, which the fire throws on the opposite wall of the cave?

True, he said; how could they see anything but the shadows if they were never allowed to move their heads?

And now look again, and see what will naturally follow if the prisoners are released and disabused of their error. At first, when any of them is liberated and compelled suddenly to stand up and turn his neck round and walk and look towards the light, he will suffer sharp pains; the glare will distress him, and he will be unable to see the realities of which in his former state he had seen the shadows.

And when he comes into the light, his eyes will be dazzled, and he will not be able to see even one of the things now said to be real. He will require to grow accustomed to the sight of the upper world. And first he will see the shadows best, next the reflections of men and other objects in the water, and then the objects themselves; then he will gaze upon the light of the moon and the stars; and last of all he will be able to see the sun, and contemplate him as he is.`
      }
    ]
  },

  // COPYRIGHTED BOOKS - ORIGINAL CHAPTER-BY-CHAPTER KEY TAKEAWAYS ONLY (No copyrighted text reproduced)
  {
    id: 'atomic-habits-james-clear',
    title: 'Atomic Habits',
    author: 'James Clear',
    category: 'Habits & Productivity',
    isPublicDomain: false,
    year: '2018',
    coverColor: 'from-amber-500 to-rose-700',
    description: 'An easy & proven framework for building good habits and breaking bad ones through tiny 1% daily changes.',
    chapters: [
      {
        title: 'The Fundamentals: Why Tiny Changes Make a Big Difference',
        summary: `• The 1% Rule: Compounding applies to self-improvement just like money. Improving by 1% each day makes you 37 times better over a year.
• Forget Goals, Build Systems: Winners and losers often have identical goals. The differentiator is the system and process you commit to every day.
• Identity-Based Habits: Lasting change starts from within. Instead of saying "I want to run a marathon" (outcome), adopt the identity: "I am a runner." Every action is a vote for the type of person you wish to become.`
      },
      {
        title: 'The 1st Law: Make It Obvious',
        summary: `• Implementation Intentions: Pre-commit your action plan using the explicit formula: "I will [BEHAVIOR] at [TIME] in [LOCATION]."
• Habit Stacking: Attach a new habit onto an already established routine: "After [CURRENT HABIT], I will [NEW HABIT]."
• Environment Design: Visual cues are the most potent triggers. Place your book on your pillow, fill water bottles on your desk, and hide phones in another room.`
      },
      {
        title: 'The 2nd Law: Make It Attractive',
        summary: `• Temptation Bundling: Link an action you NEED to do with an action you WANT to do (e.g. only listen to your favorite podcast while doing the dishes).
• Social Proof: Join a peer group where your desired behavior is the normal, expected baseline.
• Reframing Mindset: Shift from "I have to wake up early" to "I get to wake up early and enjoy uninterrupted morning peace."`
      },
      {
        title: 'The 3rd Law: Make It Easy',
        summary: `• Reduce Friction: Minimize the steps needed between your decision and starting the habit.
• The 2-Minute Rule: When starting any new routine, scale it down so it takes under two minutes (e.g. "read one page", "put on running shoes"). Master the art of showing up first before expanding duration.
• Commitment Devices: Automate decisions beforehand so future impulses cannot sabotage you.`
      },
      {
        title: 'The 4th Law: Make It Satisfying',
        summary: `• Immediate Gratification: The human brain evolved to prioritize immediate rewards over delayed ones. Add an immediate small pleasure to habits that pay off long-term.
• Visual Habit Trackers: Marking an X on a calendar or moving paper clips gives immediate sensory proof of progress.
• Never Miss Twice: A single missed day is an accident; two missed days is the beginning of an unwanted habit.`
      }
    ]
  },
  {
    id: 'the-obstacle-is-the-way-ryan-holiday',
    title: 'The Obstacle Is the Way',
    author: 'Ryan Holiday',
    category: 'Philosophy & Resilience',
    isPublicDomain: false,
    year: '2014',
    coverColor: 'from-zinc-700 to-stone-900',
    description: 'How to turn adversity into advantage using the timeless wisdom of ancient Roman Stoics.',
    chapters: [
      {
        title: 'Part 1: Perception — Master Your Perspective',
        summary: `• Control Your Emotions: Objective reality is neutral. We suffer because of the catastrophic story our nervous system constructs around it.
• Steady Your Nerves: Panic changes nothing. When crisis hits, breathe, slow down your reaction time, and ask: "What is actually here?"
• Find the Hidden Opening: Every difficulty contains an equal or greater seed of benefit if you refuse to play the victim.`
      },
      {
        title: 'Part 2: Action — Deliberate and Persistent Energy',
        summary: `• Move with Purpose: Do not wait for ideal conditions. Start with whatever small, imperfect move is immediately available.
• Process Over Outcome: Break monumental projects into the very next minute action. Focus entirely on executing that single stroke cleanly.
• Failure as Instruction: Every time an attempt fails, you have gained vital data about how the world actually behaves.`
      },
      {
        title: 'Part 3: Will — Cultivating Inner Citadel',
        summary: `• Prepare for Hard Times: The internal will is the only thing truly under our total governance.
• Amor Fati: Do not merely tolerate harsh turns of fortune—celebrate them as high-grade fuel.
• Sympatheia: Look beyond yourself. Helping others who are struggling instantly restores purpose and dispels self-pity.`
      }
    ]
  },
  {
    id: 'deep-work-cal-newport',
    title: 'Deep Work',
    author: 'Cal Newport',
    category: 'Productivity & Focus',
    isPublicDomain: false,
    year: '2016',
    coverColor: 'from-blue-700 to-indigo-900',
    description: 'Rules for focused success in a distracted world, proving deep work is a modern superpower.',
    chapters: [
      {
        title: 'Chapter 1: Deep Work is Rare, Valuable, and Meaningful',
        summary: `• The Ability to Learn Hard Things: In an automated economy, the winners are those who can quickly master complex tools and produce high-quality work at speed.
• The Depth Deficit: Constant digital context-switching creates attention residue that reduces cognitive capacity by up to 20-30%.`
      },
      {
        title: 'Chapter 2: The 4 Philosophies of Deep Scheduling',
        summary: `• Monastic: Complete isolation from shallow obligations for extended months.
• Bimodal: Dividing life into clearly defined deep stretches (e.g. 4 days dedicated retreat, 3 days open).
• Rhythmic: Dedicating a regular daily block (e.g. 6:00 AM to 8:30 AM every morning).
• Journalistic: Dropping instantly into intense focus whenever a spare 60 minutes opens up.`
      },
      {
        title: 'Chapter 3: Embrace Boredom & Drain the Shallows',
        summary: `• Train Attention Resistance: If you check your phone every time you wait 30 seconds in line, your brain loses its wiring for uninterrupted thought.
• Fixed-Schedule Productivity: Set a hard stop to your workday (e.g. 5:30 PM). Working fewer hours forces sharp ruthless prioritization of high-leverage tasks.`
      }
    ]
  },
  {
    id: 'mans-search-for-meaning-viktor-frankl',
    title: "Man's Search for Meaning",
    author: 'Viktor E. Frankl',
    category: 'Psychology & Existentialism',
    isPublicDomain: false,
    year: '1946',
    coverColor: 'from-slate-700 to-zinc-900',
    description: 'A psychiatrist’s memoir of surviving concentration camps and the birth of Logotherapy.',
    chapters: [
      {
        title: 'Part 1: Experiences in a Concentration Camp',
        summary: `• The Ultimate Human Freedom: Everything can be taken from a person but one thing: the freedom to choose one\'s attitude in any given set of circumstances.
• The Danger of Apathy: Prisoners who lost faith in their future succumbed rapidly to despair and illness.
• Humor and Love as Salvation: Thinking of a beloved person or finding humor amid misery provides a vital lifeline to humanity.`
      },
      {
        title: 'Part 2: Logotherapy in a Nutshell',
        summary: `• The Will to Meaning: Man\'s primary motivational force is neither pleasure (Freud) nor power (Adler), but the quest for meaning.
• Three Avenues to Meaning:
  1. Creating a work or performing a deed.
  2. Experiencing something (nature, art) or encountering someone (love).
  3. The attitude we take toward unavoidable suffering.`
      }
    ]
  },
  {
    id: 'the-7-habits-stephen-covey',
    title: 'The 7 Habits of Highly Effective People',
    author: 'Stephen R. Covey',
    category: 'Character & Leadership',
    isPublicDomain: false,
    year: '1989',
    coverColor: 'from-emerald-700 to-blue-900',
    description: 'Transformational character ethics focusing on principle-centered living and true interdependence.',
    chapters: [
      {
        title: 'Habits 1 to 3: Private Victory (Independence)',
        summary: `• Habit 1: Be Proactive. Take responsibility. Focus strictly on your Circle of Influence rather than whining about your Circle of Concern.
• Habit 2: Begin with the End in Mind. Envision what you want friends and family to say at your funeral. Align your daily decisions to that standard.
• Habit 3: Put First Things First. Categorize actions using the Eisenhower Matrix. Spend maximum energy in Quadrant II (Important, Not Urgent: relationships, health, preparation).`
      },
      {
        title: 'Habits 4 to 6: Public Victory (Interdependence)',
        summary: `• Habit 4: Think Win-Win. Life is not a zero-sum competition. Seek mutual benefit in all human transactions.
• Habit 5: Seek First to Understand, Then to Be Understood. Empathic listening: listen to comprehend, not merely to prepare your rebuttal.
• Habit 6: Synergize. The whole is infinitely greater than the sum of its parts. Value differences in others.`
      },
      {
        title: 'Habit 7: Sharpen the Saw (Renewal)',
        summary: `• Continuous balanced renewal across four dimensions: Physical (exercise, nutrition), Mental (reading, writing), Spiritual (meditation, nature), and Social/Emotional (service, empathy).`
      }
    ]
  },
  {
    id: 'cant-hurt-me-david-goggins',
    title: "Can't Hurt Me",
    author: 'David Goggins',
    category: 'Discipline & Resilience',
    isPublicDomain: false,
    year: '2018',
    coverColor: 'from-orange-700 to-neutral-900',
    description: 'Master your mind and defy the odds: the story of an overweight young man who became a Navy SEAL and ultra-endurance athlete.',
    chapters: [
      {
        title: 'The Accountability Mirror & Taking Souls',
        summary: `• The Accountability Mirror: Stop making excuses. Face the mirror, tell yourself the unfiltered truth, and post raw goals where you cannot escape them.
• Overcoming Victimhood: No one is coming to save you. Transform past traumas from a weakness into pure mental armor.`
      },
      {
        title: 'The 40% Rule & The Cookie Jar',
        summary: `• The 40% Rule: When your mind tells you that you are completely exhausted and ready to quit, you have only tapped into roughly 40% of your actual capacity.
• The Cookie Jar: Keep a mental repository of past hardships you have conquered. In moments of extreme fatigue, pull out a "cookie" to remind yourself who you are.`
      }
    ]
  },
  {
    id: 'ikigai-garcia-miralles',
    title: 'Ikigai: The Japanese Secret to a Long and Happy Life',
    author: 'Héctor García and Francesc Miralles',
    category: 'Lifestyle & Meaning',
    isPublicDomain: false,
    year: '2016',
    coverColor: 'from-rose-600 to-indigo-950',
    description: 'Discover the intersection of passion, mission, vocation, and profession practiced in the longevity villages of Okinawa.',
    chapters: [
      {
        title: 'The Four Circles of Ikigai',
        summary: `• The Intersection: True fulfillment is found where four dimensions overlap:
  1. What you love doing.
  2. What you are good at.
  3. What the world needs.
  4. What you can get paid for.
• Living with Purpose: Having a clear reason to jump out of bed in the morning keeps mind and body youthful.`
      },
      {
        title: 'The 80% Rule (Hara Hachi Bu) & Flow',
        summary: `• Hara Hachi Bu: Ancient Okinawan practice of stopping eating when you are 80% full prevents digestive overload.
• Immersion in Flow: Engage in hobbies, crafts, and work where self-consciousness dissolves and you become one with the activity.`
      }
    ]
  },
  {
    id: 'thinking-fast-and-slow-daniel-kahneman',
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    category: 'Psychology & Rationality',
    isPublicDomain: false,
    year: '2011',
    coverColor: 'from-cyan-800 to-blue-950',
    description: 'The Nobel laureate’s breakdown of the two systems that drive the way we think, decide, and deceive ourselves.',
    chapters: [
      {
        title: 'System 1 and System 2',
        summary: `• System 1 (Fast): Operates automatically, emotionally, and effortlessly with little or no sense of voluntary control.
• System 2 (Slow): Allocates attention to effortful mental operations, including complex computations, critical thinking, and discipline.
• The Lazy Monitor: System 2 is easily fatigued, often endorsing impulsive System 1 judgments without verification.`
      },
      {
        title: 'Heuristics and Cognitive Biases',
        summary: `• Availability Heuristic: Judging probability based on how easily examples spring to memory (e.g. news fears).
• Anchoring Effect: Being disproportionately swayed by the first number or premise presented.
• Loss Aversion: The psychological pain of losing is roughly twice as potent as the pleasure of an equivalent gain.`
      }
    ]
  },
  {
    id: 'the-power-of-now-eckhart-tolle',
    title: 'The Power of Now',
    author: 'Eckhart Tolle',
    category: 'Spiritual Mindfulness',
    isPublicDomain: false,
    year: '1997',
    coverColor: 'from-amber-600 to-teal-900',
    description: 'A guide to spiritual enlightenment through disidentifying from mental noise and residing in the present moment.',
    chapters: [
      {
        title: 'You Are Not Your Mind & The Pain-Body',
        summary: `• Observing the Thinker: You are not the incessant stream of thoughts in your head; you are the silent consciousness observing them.
• The Pain-Body: Unresolved emotional wounds accumulate into a dormant energy form that periodically takes over to feed on more drama and conflict.
• The Eternal Now: The past has no reality except as a memory trace; the future has no reality except as anticipation. Life is only ever Now.`
      }
    ]
  },
  {
    id: 'the-alchemist-paulo-coelho',
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    category: 'Fable & Purpose',
    isPublicDomain: false,
    year: '1988',
    coverColor: 'from-yellow-600 to-amber-900',
    description: 'The mystical journey of Santiago, an Andalusian shepherd boy who journeys toward the Egyptian pyramids in search of treasure.',
    chapters: [
      {
        title: 'Personal Legend and the Soul of the World',
        summary: `• Discovering Your Personal Legend: When you truly want something, all the universe conspires in helping you to achieve it.
• Reading the Omens: Pay close attention to synchronicity and subtle signs along your life path.
• The Real Treasure: The true alchemy is not turning lead into gold, but transforming yourself through the courage of the journey.`
      }
    ]
  }
];

export const DAILY_QUOTES = [
  { text: "You have power over your mind - not outside events. Realize this, and you will find strength.", author: "Marcus Aurelius", source: "Meditations" },
  { text: "We suffer more often in imagination than in reality.", author: "Seneca", source: "Letters from a Stoic" },
  { text: "Waste no more time arguing what a good man should be. Be one.", author: "Marcus Aurelius", source: "Meditations" },
  { text: "He who has a why to live can bear almost any how.", author: "Friedrich Nietzsche", source: "Twilight of the Idols" },
  { text: "The unexamined life is not worth living.", author: "Socrates", source: "Plato's Apology" },
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle", source: "Nicomachean Ethics" },
  { text: "First say to yourself what you would be; and then do what you have to do.", author: "Epictetus", source: "Discourses" },
  { text: "In the midst of winter, I found there was, within me, an invincible summer.", author: "Albert Camus", source: "Return to Tipasa" },
  { text: "Life is long if you know how to use it.", author: "Seneca", source: "On the Shortness of Life" },
  { text: "Do not spoil what you have by desiring what you have not.", author: "Epicurus", source: "Fragments" },
  { text: "Knowing yourself is the beginning of all wisdom.", author: "Aristotle", source: "Ethica" },
  { text: "Act only according to that maxim whereby you can will that it should become a universal law.", author: "Immanuel Kant", source: "Groundwork" },
  { text: "Freedom is the only worthy goal in life. It is won by disregarding things beyond our control.", author: "Epictetus", source: "Enchiridion" },
  { text: "What we achieve inwardly will change outer reality.", author: "Plutarch", source: "Moralia" }
];

export const VIRTUES = [
  { id: 'wisdom', name: 'Wisdom', icon: '🦉', color: '#6366f1', desc: 'Sound judgment, intellectual humility, discerning truth from hype.' },
  { id: 'discipline', name: 'Discipline', icon: '🛡️', color: '#3b82f6', desc: 'Self-mastery, consistency over convenience, keeping promises to yourself.' },
  { id: 'courage', name: 'Courage', icon: '🦁', color: '#ef4444', desc: 'Moral bravery, speaking truth, facing discomfort and hardship.' },
  { id: 'kindness', name: 'Kindness', icon: '🌱', color: '#10b981', desc: 'Active benevolence, gentleness, empathy without expectation of return.' },
  { id: 'gratitude', name: 'Gratitude', icon: '☀️', color: '#f59e0b', desc: 'Reverence for the gift of existence, appreciating what is already here.' },
  { id: 'humility', name: 'Humility', icon: '🌊', color: '#8b5cf6', desc: 'Freedom from ego, recognizing one\'s small place in the cosmos.' }
];

export const BADGES = [
  { id: 'first_step', title: 'First Stride', desc: 'Recorded your first calibrated steps.', icon: '👟', xp: 50 },
  { id: 'step_master', title: '10,000 Milestone', desc: 'Achieved 10,000 steps in a single day.', icon: '🏆', xp: 200 },
  { id: 'stoic_scholar', title: 'Stoic Scholar', desc: 'Finished reading a complete book.', icon: '📚', xp: 250 },
  { id: 'daily_philosopher', title: 'Examined Life', desc: 'Completed 5 daily evening reviews.', icon: '🕯️', xp: 150 },
  { id: 'habit_architect', title: 'Identity Forged', desc: 'Maintained a 7-day habit streak.', icon: '⚡', xp: 300 },
  { id: 'deep_focus', title: 'Unbreakable Focus', desc: 'Completed 4 Pomodoro focus sessions.', icon: '⏱️', xp: 150 },
  { id: 'kind_soul', title: 'Compassionate Heart', desc: 'Logged 3 deeds of genuine kindness.', icon: '❤️', xp: 120 },
  { id: 'memento_mori', title: 'Awakened Soul', desc: 'Explored your life in weeks visualizer.', icon: '⏳', xp: 80 }
];

