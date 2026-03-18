import type { Site, Metadata, Socials } from "@types";

export const SITE: Site = {
  NAME: "Boran UZUN",
  EMAIL: "contact@boranuzun.ch",
  NUM_POSTS_ON_HOMEPAGE: 3,
  NUM_WORKS_ON_HOMEPAGE: 2,
  NUM_PROJECTS_ON_HOMEPAGE: 3,
};

export const HOME: Metadata = {
  TITLE: "Home",
  DESCRIPTION: "Welcome to my personal website where I share my projects and blog posts.",
};

export const BLOG: Metadata = {
  TITLE: "Blog",
  DESCRIPTION: "A collection of articles on topics I am passionate about.",
};

export const WORK: Metadata = {
  TITLE: "Work",
  DESCRIPTION: "Where I have worked and what I have done.",
};

export const PROJECTS: Metadata = {
  TITLE: "Projects",
  DESCRIPTION:
    "A collection of my projects, with links to repositories and demos.",
};

export const SOCIALS: Socials = [
  {
    NAME: "github",
    HREF: "https://github.com/boranuzun/",
  },
  {
    NAME: "linkedin",
    HREF: "https://www.linkedin.com/in/boranuzun/",
  },
];

export const KEYS = {
  AGE: "age18n0n4gjkmeymg2rmgsxkru6y54vncsan3qsjl593rdum9z3nj3qsrfng7x",
  GPG_FINGERPRINT: "6A5F 6B76 7594 C2C4 A813  7150 D531 98C4 0330 BEBC",
  GPG_KEY_ID_LONG: "D53198C40330BEBC",
  GPG: `-----BEGIN PGP PUBLIC KEY BLOCK-----

mDMEabnaPhYJKwYBBAHaRw8BAQdAZmfUEz2hYJI4uHLpKPsna7iM0Ip8Nzlp5g7a
Iq254pe0IUJvcmFuIFV6dW4gPGNvbnRhY3RAYm9yYW51enVuLmNoPoi1BBMWCgBd
FiEEal9rdnWUwsSoE3FQ1TGYxAMwvrwFAmm52j4bFIAAAAAABAAObWFudTIsMi41
KzEuMTIsMCwzAhsDBQkDwmcABQsJCAcCAiICBhUKCQgLAgQWAgMBAh4HAheAAAoJ
ENUxmMQDML68e/sA/3SS2vUHhmFECz0B8vlaAXNksjW9LpXXQd/PXBMK3LWuAP0W
pC85IrxYZf/Pv97ZCCIskCFVKs0AeTj9PG4jKE0NBbg4BGm52j4SCisGAQQBl1UB
BQEBB0B0+ut1TktCJ1siJk3g1BhaJnZjTsUl155wa9fnl7yTIwMBCAeImgQYFgoA
QhYhBGpfa3Z1lMLEqBNxUNUxmMQDML68BQJpudo+GxSAAAAAAAQADm1hbnUyLDIu
NSsxLjEyLDAsMwIbDAUJA8JnAAAKCRDVMZjEAzC+vLiLAQDjRhJugp9B3Ca0/lu6
tvR1CDPtzZlsaxWAEi6GtJlHJAEAj5fMKZlBI8TCTLUkBGXzFc1qc255NnKNwhmv
7WJpmQg=
=LBNu
-----END PGP PUBLIC KEY BLOCK-----

`,
};
