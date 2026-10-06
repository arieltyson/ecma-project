---
title: Git and GitHub
summary: Track changes with Git, work on branches, and collaborate through GitHub pull requests.
minutes: 30
objectives:
  - Create commits and read history.
  - Work on branches and merge them.
  - Push to GitHub and open a pull request.
  - Write useful commit messages.
quiz:
  - question: What does `git add` do?
    options:
      - Uploads files to GitHub.
      - Stages changes so they are included in the next commit.
      - Creates a new branch.
    answer: 1
    explanation: Git has a staging area between your working files and the repository. You choose what goes into each commit.
  - question: Why work on a branch instead of main?
    options:
      - Branches are faster.
      - Changes stay isolated until they are reviewed and ready, so main stays working.
      - main cannot be committed to.
    answer: 1
    explanation: Branches let you experiment and open a pull request for review without affecting anyone else.
  - question: Which is the most useful commit message?
    options:
      - "\"fix\""
      - "\"fix(chat): stop auto-scroll when the reader scrolls up\""
      - "\"changes\""
    answer: 1
    explanation: Good messages say what changed and where, so history explains itself.
resources:
  - title: Pro Git book
    url: https://git-scm.com/book/en/v2
  - title: GitHub, about pull requests
    url: https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests
  - title: Conventional Commits
    url: https://www.conventionalcommits.org/en/v1.0.0/
---

Git records snapshots of your project so you can see what changed, when and why, and undo mistakes. GitHub hosts Git repositories and adds collaboration through pull requests.

## The basic loop

```bash
git init                       # start a repository
git status                     # what changed?
git add src/chat.ts            # stage a file
git commit -m "feat(chat): add message list"
git log --oneline              # history
git diff                       # unstaged changes
```

Files move through three places: your **working tree**, the **staging area** (what `git add` prepares), and the **repository** (what `git commit` records).

## Branches

A branch is a movable pointer to a line of commits. Work on a branch, then merge it:

```bash
git switch -c chat-scroll      # create and switch
# ...edit, add, commit...
git switch main
git merge chat-scroll
```

## GitHub

```bash
git remote add origin git@github.com:you/lumen.git
git push -u origin main
git push -u origin chat-scroll # then open a pull request on GitHub
```

A **pull request** proposes merging a branch. Teammates review the diff, CI runs checks, and the branch is merged when both pass.

## Commit messages

Write messages that explain the change to a future reader. Many teams use the **Conventional Commits** format:

```text
feat(chat): pause auto-scroll when the reader scrolls up
fix(directory): keep filters when navigating back
docs: describe the local setup
```

Keep commits small and focused: one logical change each.

## Undoing

| Situation | Command |
| --- | --- |
| Discard unstaged changes to a file | `git restore file` |
| Unstage a file | `git restore --staged file` |
| Change the last commit's message | `git commit --amend` (before pushing) |
| Undo a pushed commit safely | `git revert <commit>` |

## Assignment

1. Read chapters 1 to 3 of the [Pro Git book](https://git-scm.com/book/en/v2).
2. Create a repository in your `ecma` folder, make three commits, create a branch, merge it, and push to GitHub.
3. Open a pull request against your own repository from a branch, and review it yourself in the GitHub interface.
