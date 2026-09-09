/**
 * Project records.
 *
 * Homepage ordering, display numbering, the sitemap and every internal project
 * link derive from this array. Numbering is computed from position among the
 * published entries, so withholding a project renumbers the rest automatically.
 *
 * Every field must be traceable to the linked public repository, to a linked
 * external result, or to the CV. Nothing here is inferred.
 */

import type { ImageMetadata } from 'astro';

import tracked from '../assets/media/tracked-hero.jpg';
import njordHero from '../assets/media/njord-hero.jpg';
import pictaleLibrary from '../assets/media/pictale-library.jpg';

/** Layout template used for this project's homepage record. */
export type RecordVariant = 'feature' | 'split' | 'data' | 'compact';

export interface Project {
  slug: string;
  /** Displayed title. */
  title: string;
  /** One line, sentence case, under the title. */
  subtitle: string;
  /** One-sentence engineering result for the homepage record. */
  result: string;
  tier: 'flagship' | 'secondary';
  variant: RecordVariant;
  /** Withheld projects render nowhere: no page, no card, no sitemap entry, no link. */
  published: boolean;
  year: string;
  role: string;
  platform: string;
  /** Technologies shown on the homepage record — the short list. */
  tech: string[];
  /** Repository URL, or null when there is no public source to link. */
  repo: string | null;
  /** Poster/still for the homepage record. Omit for a text-only record. */
  image?: ImageMetadata;
  imageAlt?: string;
  /** Contain the record image in its well instead of cropping it to fill. */
  containImage?: boolean;
  /** Focal point for a cropped record image, e.g. "center 68%". */
  imagePosition?: string;
  /** Aspect ratio for this project's record media. Defaults to 4 / 3. */
  imageRatio?: string;
  /** Shown instead of media on a record that has no usable image. */
  highlights?: { term: string; value: string }[];
  /** Optional looping clip for the homepage record, served from public/media. */
  video?: { src: string; poster: string; width: number; height: number };
  /** Short description used for the case-study page metadata. */
  seoDescription: string;
}

export const projects: Project[] = [
  {
    slug: 'pathfinder',
    title: 'Pathfinder',
    subtitle: 'Multi-platform autonomous ground vehicle development',
    result:
      'One ROS 2 autonomy architecture — dual-EKF RTK localization, Nav2 waypoint ' +
      'navigation and a micro-ROS motor interface — adapted across three physical ' +
      'ground vehicles with three different drive kinematics.',
    tier: 'flagship',
    variant: 'feature',
    published: true,
    year: '2025 — present',
    role: 'Autonomy, localization, embedded integration',
    platform: 'Tracked UGV · 4×4 UGV · Ackermann RC crawler',
    tech: ['ROS 2 Humble', 'Nav2', 'robot_localization', 'RTK GNSS', 'micro-ROS', 'ESP32-S3'],
    repo: 'https://github.com/MustafaSPN/pathfinder-autonomous-ugv',
    image: tracked,
    imageAlt:
      'Tracked skid-steer unmanned ground vehicle outdoors, with a roof-mounted GNSS ' +
      'antenna mast, during an autonomous waypoint run.',
    seoDescription:
      'Pathfinder — one ROS 2 autonomy stack with dual-EKF RTK localization and Nav2 ' +
      'waypoint navigation, running on a tracked UGV, a 4×4 rover and an Ackermann RC crawler.',
  },
  {
    slug: 'njord',
    title: 'Njord Autonomous USV',
    subtitle: 'ROS 2 autonomy for an unmanned surface vessel — Njord Challenge 2025',
    result:
      'Perception, mapping, mission logic and navigation for Team Navi’s autonomous ' +
      'surface vessel, which placed 4th of 11 teams at NTNU’s Njord Challenge in Trondheim.',
    tier: 'flagship',
    variant: 'split',
    published: true,
    year: '2025',
    role: 'Software team — mission logic, mapping, docking',
    platform: 'Unmanned surface vessel',
    tech: ['ROS 2', 'Nav2', 'MAVROS', 'ZED stereo', 'YOLO', 'OpenCV'],
    repo: 'https://github.com/MustafaSPN/njord-autonomous-usv',
    image: njordHero,
    imageRatio: '5 / 4',
    imageAlt:
      'Team Navi’s unmanned surface vessel afloat in Trondheim harbour — twin blue ' +
      'catamaran hulls, a white instrument deck carrying the stereo camera housing, and ' +
      'two GNSS antenna masts.',
    seoDescription:
      'Njord Challenge 2025 — ROS 2 perception, mapping, mission planning and docking ' +
      'logic for Team Navi’s autonomous surface vessel. 4th of 11 teams.',
  },
  {
    slug: 'stm32-udp',
    title: 'STM32H7 ROS 2 UDP Link',
    subtitle: 'Deterministic motion-control link over Ethernet',
    result:
      '300 µs round-trip and zero loss across 600,000 packets at 1 kHz, over a ' +
      'CRC-checked protocol whose definition is shared byte-for-byte by firmware and host.',
    tier: 'flagship',
    variant: 'data',
    published: true,
    year: '2026',
    role: 'Firmware, protocol and host node',
    platform: 'NUCLEO-H723ZG · Raspberry Pi · 100 Mbit Ethernet',
    tech: ['C', 'C++', 'FreeRTOS', 'lwIP', 'STM32H723', 'ROS 2'],
    repo: 'https://github.com/MustafaSPN/stm32h7-ros2-udp-link',
    seoDescription:
      'A deterministic ROS 2 to STM32H723 motion-control link over Ethernet/UDP — ' +
      '300 µs round-trip, zero packet loss in 600,000 packets at 1 kHz.',
  },
  {
    slug: 'pictale',
    title: 'Pictale',
    subtitle: 'Shipped iOS product — drawings into narrated stories',
    result:
      'A complete production application built and released alone: Flutter client, ' +
      'event-driven serverless backend, multimodal generation and narration pipeline, ' +
      'live on the App Store.',
    tier: 'secondary',
    variant: 'compact',
    published: true,
    year: '2026',
    role: 'Sole developer',
    platform: 'iOS · Flutter · Firebase',
    tech: ['Flutter', 'Dart', 'Cloud Functions', 'Firestore', 'Gemini'],
    repo: 'https://github.com/MustafaSPN/pictale-showcase',
    image: pictaleLibrary,
    imagePosition: 'center 74%',
    imageAlt:
      'The Pictale story library on an iPhone, listing generated stories as illustrated ' +
      'cards with favourites and play buttons.',
    seoDescription:
      'Pictale — a published iOS app that turns a child’s drawing into a narrated ' +
      'story. Flutter client, event-driven Firebase backend, multimodal generation.',
  },
  {
    slug: 'esp32-roboclaw',
    title: 'ESP32 RoboClaw Controller',
    subtitle: 'micro-ROS motor-control interface',
    result: '',
    tier: 'secondary',
    // Held back pending a repository review. Nothing about this entry is rendered:
    // no page, no card, no navigation entry, no sitemap URL and no outbound link.
    // Setting `published: true` and filling in the fields below restores it as
    // project 05, moving Motion Detection to 06 automatically.
    variant: 'compact',
    published: false,
    year: '',
    role: '',
    platform: '',
    tech: [],
    repo: null,
    seoDescription: '',
  },
  {
    slug: 'motion-detection',
    title: 'Motion Detection — CUDA / YOLO',
    subtitle: 'Optical flow, GPU processing and learned detection',
    result:
      'Three separate implementations of the same problem — classical optical flow, ' +
      'a CUDA/OpenGL path, and a fine-tuned YOLO11 detector — built to compare their ' +
      'failure modes rather than their frame rates.',
    tier: 'secondary',
    variant: 'compact',
    published: true,
    year: '2025',
    role: 'Implementation, CUDA experimentation, evaluation',
    platform: 'UAV footage · Linux · NVIDIA GPU',
    tech: ['C++17', 'CUDA', 'OpenCV', 'OpenGL', 'Python', 'YOLO11'],
    repo: 'https://github.com/MustafaSPN/motion-detection-cuda-yolo',
    highlights: [
      { term: 'Classical CPU', value: 'Farnebäck flow, temporal masking, region markers' },
      { term: 'CUDA / OpenGL', value: 'GPU flow and experimental component kernels' },
      { term: 'YOLO11', value: 'Fine-tuned detector with library tracking' },
    ],
    seoDescription:
      'Motion detection and object tracking with optical flow, CUDA/OpenGL processing ' +
      'and a fine-tuned YOLO11 detector. Computer-vision and GPU experimentation.',
  },
];

/** Projects that appear on the site, in display order. */
export const publishedProjects = projects.filter((p) => p.published);

/** Two-digit display number, derived from position among published projects. */
export function projectNumber(slug: string): string {
  const index = publishedProjects.findIndex((p) => p.slug === slug);
  return String(index + 1).padStart(2, '0');
}

export function getProject(slug: string): Project {
  const project = publishedProjects.find((p) => p.slug === slug);
  if (!project) throw new Error(`No published project with slug "${slug}"`);
  return project;
}
