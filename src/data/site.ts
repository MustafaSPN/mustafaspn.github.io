/** Site-wide identity and configuration. Single source of truth. */

export const site = {
  name: 'Mustafa Sepen',
  role: 'Robotics Software Engineer',
  title: 'Mustafa Sepen — Robotics Software Engineer',
  disciplines: [
    'Autonomous Navigation',
    'Localization',
    'ROS 2',
    'GNSS/RTK',
    'Embedded Systems',
  ],
  description:
    'Robotics software engineer working on autonomous navigation, RTK GNSS localization ' +
    'and embedded integration for ground and surface vehicles. ROS 2, Nav2, sensor ' +
    'fusion, C++ and Python.',
  location: 'Istanbul, Türkiye',
  email: 'mustafaspn@hotmail.com',
  github: 'https://github.com/MustafaSPN',
  /** Production domain. Displayed in the footer colophon and used in structured data. */
  domain: 'sepen.dev',
  linkedin: 'https://www.linkedin.com/in/mustafa-sepen-84565b240/',
  cv: '/mustafa-sepen-cv.pdf',
} as const;

export const nav = [
  { label: 'Work', href: '/#work', primaryMobile: true },
  { label: 'Experience', href: '/#experience', primaryMobile: false },
  { label: 'About', href: '/#about', primaryMobile: false },
] as const;
