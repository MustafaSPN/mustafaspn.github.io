/**
 * Career profiles.
 *
 * The site is one portfolio with three entrances: a general homepage and one page
 * per track (/robotics, /games). Every page shows every project and the whole
 * career; a profile only decides what leads — the hero copy, which track's
 * projects get the large records, the order of the experience timeline and the
 * engineering-focus groups.
 *
 * Adding a profile is a new entry here plus a two-line page in src/pages.
 */

import type { Track } from './projects';

export interface ExperienceItem {
  role: string;
  org: string;
  period: string;
  scope: string;
  scope2?: string;
  tracks: Track[];
}

export interface FocusGroup {
  domain: string;
  items: string[];
}

export interface Profile {
  id: 'general' | Track;
  /** Page path, used for canonical URLs and in-page navigation. */
  path: string;
  /** Short role shown in the header and the browser title. */
  role: string;
  pageTitle: string;
  description: string;
  eyebrow: string;
  disciplines: string[];
  statement: string;
  rail: { term: string; value: string }[];
  /** Track whose projects lead the work section. General shows a mixed selection. */
  lead: Track | 'mixed';
  workLabel: string;
  /** Heading over the other track's projects. */
  otherWorkLabel?: string;
  /** Experience tracks shown first; ties keep chronological order. */
  experienceLead: Track | 'chronological';
  focus: FocusGroup[];
  about: { lead: string; paragraphs: string[] };
  aboutAside: string;
}

/** The whole career, newest first. Profiles reorder it; none removes from it. */
export const experience: ExperienceItem[] = [
  {
    role: 'Robotics Engineer',
    org: 'Swegeo',
    period: 'Sep 2025 — Present',
    scope:
      'Autonomous ground vehicles built from the electronic architecture up: ESP32 drive ' +
      'control under a Raspberry Pi 5 running ROS 2 Humble, and a custom ROS 2 driver for a ' +
      'dual-antenna RTK GNSS receiver with an integrated NTRIP client.',
    scope2:
      'Outdoor waypoint navigation with Nav2 over EKF sensor fusion, plus the browser-based ' +
      'mission console used to plan and supervise runs in the field.',
    tracks: ['robotics'],
  },
  {
    role: 'Independent Mobile Developer',
    org: 'Astro Flow Jam · Pictale',
    period: '2026 — Present',
    scope:
      'Two products built and shipped alone, both live on the App Store: Pictale, a Flutter ' +
      'app, and Astro Flow Jam, a Unity puzzle game for iPhone and iPad.',
    scope2:
      'Everything around the code as well — ads and in-app purchases, analytics and crash ' +
      'reporting, privacy compliance and App Store submission.',
    tracks: ['games'],
  },
  {
    role: 'Autonomous Systems — Software Team',
    org: 'Team Navi · Njord Challenge, NTNU',
    period: 'Aug 2025',
    scope:
      'ROS 2 autonomy for an unmanned surface vessel: obstacle mapping, mission state machines, ' +
      'and dock approach and exit logic.',
    scope2: '4th place among 11 international teams, Trondheim.',
    tracks: ['robotics'],
  },
  {
    role: 'Simulation Systems — R&D',
    org: 'Baykar',
    period: 'Feb 2025 — Jun 2025',
    scope:
      'Moving-object detection for UAV footage, from OpenCV baselines to hardware-accelerated ' +
      'real-time processing with CUDA.',
    scope2:
      'Integrated YOLOv11 for complex scenes and ran an R&D comparison of the approaches on ' +
      'performance and accuracy.',
    tracks: ['robotics'],
  },
  {
    role: 'Autonomous Systems — Software',
    org: 'Teknofest Unmanned Surface Vehicle Competition',
    period: 'Oct 2024',
    scope:
      'Perception with a ZED camera and YOLO, A* route planning and Pure Pursuit path tracking ' +
      'across the autonomous vehicle stack.',
    scope2: 'Finalist. Most Original Software Award.',
    tracks: ['robotics'],
  },
  {
    role: 'Unity Game Developer — Intern',
    org: 'Game development internship',
    period: '2023',
    scope:
      'Unity fundamentals through a series of small demos, then Kelimetriks as the final ' +
      'project: a Turkish word-puzzle game for Android and iOS, scoped and reviewed with a ' +
      'supervisor over roughly four weeks.',
    scope2:
      'Event-driven manager architecture, object pooling, Firebase accounts and leaderboard, ' +
      'Unity Ads and TR/EN localization.',
    tracks: ['games'],
  },
  {
    role: 'B.Sc. Computer Engineering',
    org: 'Bahçeşehir University',
    period: '2020 — 2025',
    scope: 'Full scholarship. Honour degree, GPA 3.15 / 4.00.',
    tracks: ['robotics', 'games'],
  },
];

const roboticsFocus: FocusGroup[] = [
  {
    domain: 'Autonomy',
    items: ['ROS 2 Humble', 'Nav2', 'Waypoint navigation', 'Regulated Pure Pursuit', 'Behaviour trees', 'Command arbitration'],
  },
  {
    domain: 'Localization',
    items: ['RTK GNSS', 'Dual-antenna heading', 'NTRIP corrections', 'robot_localization', 'Dual EKF', 'TF frame topology'],
  },
  {
    domain: 'Embedded',
    items: ['ESP32-S3', 'STM32H7', 'micro-ROS', 'FreeRTOS', 'Ethernet / UDP', 'Motor control and odometry'],
  },
  {
    domain: 'Perception',
    items: ['OpenCV', 'YOLO11', 'ZED stereo depth', 'CUDA', 'LiDAR integration', 'Optical flow'],
  },
];

const gamesFocus: FocusGroup[] = [
  {
    domain: 'Gameplay & engine',
    items: ['Unity', 'C#', 'Grid and puzzle mechanics', 'ScriptableObject data', 'Event-bus architecture', 'DOTween'],
  },
  {
    domain: 'Live ops & monetization',
    items: ['AdMob', 'Unity Ads', 'In-app purchases', 'Rewarded and interstitial ads', 'Consent and ATT'],
  },
  {
    domain: 'Backend & data',
    items: ['Firebase Auth', 'Realtime Database', 'Firebase Analytics', 'Crashlytics', 'Leaderboards'],
  },
  {
    domain: 'Performance',
    items: ['Object pooling', 'Data-structure lookups', 'C++ and CUDA', 'Mobile UI scaling'],
  },
];

export const profiles: Record<Profile['id'], Profile> = {
  general: {
    id: 'general',
    path: '/',
    role: 'Robotics & Game Developer',
    pageTitle: 'Mustafa Sepen — Robotics & Game Developer',
    description:
      'Mustafa Sepen builds autonomous robots and mobile games: ROS 2 navigation and ' +
      'embedded control on real vehicles, and Unity games shipped to the App Store.',
    eyebrow: 'Robotics engineer · Game developer',
    disciplines: ['ROS 2', 'Autonomous Navigation', 'Embedded Systems', 'Unity', 'C#', 'Mobile Games'],
    statement:
      'I build software that has to behave in the real world — autonomous ground and marine ' +
      'vehicles on one side, mobile games people download and play on the other.',
    rail: [
      { term: 'Currently', value: 'Robotics Engineer, Swegeo' },
      { term: 'Mobile', value: 'Astro Flow Jam · Pictale' },
      { term: 'Languages', value: 'C++ · C# · Python' },
      { term: 'Based', value: 'Istanbul, Türkiye' },
    ],
    lead: 'mixed',
    workLabel: 'Selected work',
    experienceLead: 'chronological',
    focus: [roboticsFocus[0], gamesFocus[0], roboticsFocus[2], gamesFocus[1]],
    about: {
      lead:
        'I work where software meets something physical or something played — robots that ' +
        'have to find their way outside, and games that have to feel right in the hand.',
      paragraphs: [
        'By day I build autonomy for ground vehicles: the ROS 2 stack, the firmware it talks ' +
          'to, and the field runs that show what a configuration actually does.',
        'Alongside that I make mobile games and apps end to end, from the first prototype to ' +
          'ads, purchases, analytics and the App Store review. The two halves feed each other: ' +
          'robotics taught me real-time thinking and profiling, games taught me to ship.',
      ],
    },
    aboutAside: 'Istanbul, Türkiye\nOpen to robotics and game roles',
  },

  robotics: {
    id: 'robotics',
    path: '/robotics',
    role: 'Robotics Software Engineer',
    pageTitle: 'Mustafa Sepen — Robotics Software Engineer',
    description:
      'Robotics software engineer working on autonomous navigation, RTK GNSS localization ' +
      'and embedded integration for ground and surface vehicles. ROS 2, Nav2, sensor ' +
      'fusion, C++ and Python.',
    eyebrow: 'Robotics Software Engineer · Open to roles in Europe',
    disciplines: ['Autonomous Navigation', 'Localization', 'ROS 2', 'GNSS/RTK', 'Embedded Systems'],
    statement:
      'Outdoor autonomy on real hardware — RTK GNSS localization, Nav2 waypoint navigation ' +
      'and the embedded motor interface underneath, running today on three ground vehicles ' +
      'that share one ROS 2 stack.',
    rail: [
      { term: 'Currently', value: 'Robotics Engineer, Swegeo' },
      { term: 'Platforms', value: 'Tracked · 4×4 · Ackermann · USV' },
      { term: 'Primary stack', value: 'ROS 2 Humble · C++ · Python' },
      { term: 'Based', value: 'Istanbul, Türkiye' },
    ],
    lead: 'robotics',
    workLabel: 'Robotics work',
    otherWorkLabel: 'Also shipped — games and apps',
    experienceLead: 'robotics',
    focus: roboticsFocus,
    about: {
      lead:
        'I work at the boundary between robotics software and the vehicle itself — ' +
        'localization and navigation on one side, embedded control and physical integration ' +
        'on the other.',
      paragraphs: [
        'In practice that means writing the ROS 2 stack, writing the firmware it talks to, ' +
          'wiring the GNSS receiver and the IMU, and then taking the vehicle outside to find ' +
          'out what the configuration actually does. Most of what I know about EKF tuning, ' +
          'frame conventions and command arbitration came from watching a real platform get ' +
          'it wrong in a field.',
        'The platforms so far are ground and marine: a tracked skid-steer UGV, a 4×4 ' +
          'differential rover and an Ackermann RC crawler running one shared autonomy ' +
          'architecture, and an unmanned surface vessel built with a team for the Njord ' +
          'Challenge at NTNU. I write C++ and Python, and I am comfortable being the person ' +
          'who owns the part where the software meets the hardware.',
      ],
    },
    aboutAside: 'Istanbul, Türkiye\nAvailable for robotics roles in Europe',
  },

  games: {
    id: 'games',
    path: '/games',
    role: 'Game Developer',
    pageTitle: 'Mustafa Sepen — Game Developer',
    description:
      'Game developer building mobile games in Unity and C#: puzzle mechanics, ads and ' +
      'in-app purchases, Firebase backends, and a systems-engineering background in C++ ' +
      'and real-time robotics.',
    eyebrow: 'Game Developer · Unity · Mobile',
    disciplines: ['Unity', 'C#', 'Mobile Puzzle Games', 'Monetization', 'Firebase', 'Performance'],
    statement:
      'Mobile games built end to end — gameplay systems in Unity and C#, ads and ' +
      'in-app purchases, analytics and leaderboards — backed by a systems-engineering ' +
      'background in real-time C++.',
    rail: [
      { term: 'Shipped', value: 'Astro Flow Jam — App Store' },
      { term: 'Engine', value: 'Unity · C#' },
      { term: 'Live ops', value: 'AdMob · IAP · Firebase' },
      { term: 'Based', value: 'Istanbul, Türkiye' },
    ],
    lead: 'games',
    workLabel: 'Games and apps',
    otherWorkLabel: 'Systems engineering — robotics',
    experienceLead: 'games',
    focus: gamesFocus,
    about: {
      lead:
        'I make games the way I build robots: systems first, measured on the device, and ' +
        'finished all the way to the store.',
      paragraphs: [
        'My first game was Kelimetriks, a Turkish word-puzzle game I built as the final ' +
          'project of a Unity internship — falling letters, a dictionary lookup fast enough to ' +
          'run on every tap, pooled tiles and a live leaderboard. Astro Flow Jam is the next ' +
          'step: a puzzle game for iPhone and iPad that I built and published alone, ' +
          'with ads, purchases, analytics and crash reporting in place.',
        'My day job is robotics, and it shows in how I work on games: I care about frame ' +
          'budgets, data structures and what actually happens on the hardware. I write C# for ' +
          'gameplay and C++ when performance matters, and I like owning a feature from the ' +
          'first prototype to the analytics that tell me whether it works.',
      ],
    },
    aboutAside: 'Istanbul, Türkiye\nOpen to game-development roles',
  },
};

/** Experience reordered so the profile's own track leads; order is otherwise kept. */
export function experienceFor(profile: Profile): ExperienceItem[] {
  if (profile.experienceLead === 'chronological') return experience;
  const lead = profile.experienceLead;
  const isEducation = (e: ExperienceItem) => e.tracks.length > 1;
  return [
    ...experience.filter((e) => e.tracks[0] === lead && !isEducation(e)),
    ...experience.filter((e) => e.tracks[0] !== lead && !isEducation(e)),
    ...experience.filter(isEducation),
  ];
}
