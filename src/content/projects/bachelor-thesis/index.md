---
title: "Bachelor Thesis"
description: "Bachelor thesis about OS as Code and IaC."
date: "Sep 27 2025"
websiteURL: "https://boranuzun.github.io/homelab-docs/"
repoURL: "https://github.com/boranuzun/homelab-iac"
---

My Bachelor's thesis, titled "Conception et déploiement automatisé d'un Operating System as Code à l'aide de pratiques Infrastructure as Code" (Design and Automated Deployment of an OS as Code Using IaC Practices), focuses on designing and automating the deployment of a personal homelab server by applying modern Infrastructure as Code, GitOps, and DevSecOps practices.

## Tech Stack

- **OS & Virtualization:** NixOS, Proxmox
- **Infrastructure as Code:** OpenTofu (HCL), Nix
- **Secrets Management:** SOPS + age
- **CI/CD:** GitHub Actions, pre-commit hooks
- **Containers & Services:** Docker, Traefik, Tailscale, Uptime Kuma, Dozzle, Watchtower, Gotify

## Key Outcomes

- Built a fully reproducible NixOS virtual machine on Proxmox, entirely defined as code
- Managed infrastructure provisioning and configuration with OpenTofu and Nix
- Secured secrets using SOPS with age encryption
- Automated deployments via GitHub Actions with GitOps workflows
- Deployed and orchestrated containerized services including a reverse proxy (Traefik), VPN mesh (Tailscale), monitoring (Uptime Kuma), and more
- Produced comprehensive [technical documentation](https://boranuzun.github.io/homelab-docs/) covering the entire setup
