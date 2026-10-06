---
title: How This Works
summary: The shape of the curriculum, and how to get the most out of each lesson and project.
minutes: 8
objectives:
  - Know how paths, courses, lessons and projects fit together.
  - Know what to do in each part of a lesson.
  - Know where the Foundations path ends and the TypeScript and React path begins.
quiz:
  - question: What should you do when a project's requirements feel unclear?
    options:
      - Look up a finished solution and copy its structure.
      - Make a reasonable decision, write it down, and keep building.
      - Skip the project and come back after the next course.
    answer: 1
    explanation: Projects are written to leave room for decisions. Recording the decision and the reason for it is part of the exercise, and it gives you something concrete to talk through later.
  - question: Where is your progress stored?
    options:
      - In a cookie sent to a server.
      - In an account on GitHub.
      - In this browser's local storage.
    answer: 2
    explanation: Completed lessons are saved in localStorage on your device. Nothing is sent anywhere, so progress does not follow you to another browser.
  - question: What is the main purpose of the knowledge check at the end of a lesson?
    options:
      - To grade you before you can continue.
      - To check that you can recall and apply the lesson's key ideas.
      - To replace the assignment.
    answer: 1
    explanation: Knowledge checks are a quick self test. If a question surprises you, reread the section it came from before moving on.
resources:
  - title: The Odin Project, the curriculum this one is modelled on
    url: https://www.theodinproject.com/paths
  - title: MDN Web Docs
    url: https://developer.mozilla.org/en-US/
---

The ECMA Project teaches you to build for the web with modern JavaScript, TypeScript and React. It is organised the same way as [The Odin Project](https://www.theodinproject.com/paths): you read a little, then you build something.

## Paths, courses and lessons

A **path** is an ordered list of courses. There are two:

| Path | Covers |
| --- | --- |
| Foundations | How the web works, HTML, CSS and JavaScript basics |
| TypeScript and React | Modern JavaScript, TypeScript in depth, the browser platform, React, single-page apps and live coding |

A **course** groups lessons on one subject. A **lesson** teaches one idea. A **project** asks you to build something on your own machine using what the course covered.

If you already write JavaScript, start the TypeScript and React path and use Foundations as a reference.

## Inside a lesson

Every lesson has the same parts:

1. **You will learn** lists what the lesson covers. Read it first so you know what to look for.
2. **The lesson itself** explains the idea with short, runnable examples. Type the examples out rather than pasting them.
3. **Assignment** sends you to official documentation or asks you to try something. Do it before moving on; the lesson is a summary, the documentation is the source.
4. **Knowledge check** asks a few questions. Answer them without looking back first.
5. **Additional resources** are optional and collapsed by default.

> [!TIP]
> Keep a scratch project open while you read. TypeScript examples on this site are type-checked in CI under the strict compiler settings from [A Strict tsconfig](/lessons/typescript/strict-config/); only a few short fragments are excluded.

## Inside a project

Projects describe *what* to build, never *how*. Each one has:

- **Requirements** that define done.
- **Break it on purpose** steps in some projects, where you introduce a known bug (a race condition, a missing `key`, a stale cache) and then fix it, so you have seen the failure before you meet it at work.
- **Explain it** questions to answer out loud when you finish. Being able to explain a decision matters as much as making it.

Projects use a fictional live streaming site called **Lumen** as their domain: channels, streams, chat, follows and a directory of live content. Using one domain throughout lets later projects build on earlier ones.

## Tracking progress

Use **Mark as complete** at the end of each lesson. Progress is stored in this browser only; see [Privacy](/about/privacy/).

## Assignment

1. Read through the course list for both paths and decide where to start.
2. Create a folder called `ecma` somewhere on your machine. Every project will live inside it.
