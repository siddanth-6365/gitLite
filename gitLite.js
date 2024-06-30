#!/usr/bin/env node

const path = require("path");
const fs = require("fs/promises");
const crypto = require("crypto");
const { diffLines, diffChars } = require("diff");
const { Command } = require("commander");

const program = new Command();

class GitLite {
  constructor() {
    this.rootPath = ".";
    this.repoPath = path.join(this.rootPath, ".gitLite");
    this.objectFolderPath = path.join(this.repoPath, "objects");
    this.indexPath = path.join(this.repoPath, "index");
    this.headPath = path.join(this.repoPath, "HEAD");
    this.ignorePatterns = [];

    this.init();
  }

  async init() {
    await fs.mkdir(this.objectFolderPath, { recursive: true });

    try {
      await fs.access(this.indexPath);
      // console.log("GitLite already initialized");
    } catch (err) {
      await fs.writeFile(this.indexPath, JSON.stringify([]), { flag: "wx" });
      await fs.writeFile(this.headPath, "", { flag: "wx" });
      console.log("gitLite initialized");
    }
  }

  async readIgnoreFile() {
    const ignoreFilePath = path.join(this.rootPath, ".gitignore");
    try {
      const ignoreContent = await fs.readFile(ignoreFilePath, "utf8");
      this.ignorePatterns = ignoreContent.split(/\r?\n/);
    } catch (err) {
      console.log(".gitignore file not found or error while reading");
    }
  }

  isIgnored(filePath) {
    if (!this.ignorePatterns.length) {
      return false;
    }

    for (const pattern of this.ignorePatterns) {
      if (pattern.trim() === "") {
        continue;
      }
      const regex = new RegExp(pattern.replace(/\//g, path.sep));
      if (regex.test(filePath)) {
        return true;
      }
    }
    return false;
  }

  // reads the index file and return the list of files in the staging area
  async getStagedEntries() {
    let stagedEntries = [];
    try {
      const indexContent = await fs.readFile(this.indexPath, "utf-8");
      stagedEntries = JSON.parse(indexContent);
    } catch (err) {
      console.log("Failed to read index file. Assuming empty staging area.");
    }
    return stagedEntries;
  }

  hashIt(content) {
    return crypto.createHash("sha1").update(content).digest("hex");
  }


  async getAllFiles(dirPath, arrayOfFiles) {
    const files = await fs.readdir(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    for (const file of files) {
      if ((await fs.stat(path.join(dirPath, file))).isDirectory()) {
        arrayOfFiles = await this.getAllFiles(path.join(dirPath, file), arrayOfFiles);
      } else {
        arrayOfFiles.push(path.relative(this.rootPath, path.join(dirPath, file)));
      }
    }

    return arrayOfFiles;
  }

  async add(files) {
    console.log("Adding files to staging area...");

    await this.readIgnoreFile();

    let stagedEntries = await this.getStagedEntries();

    if (files.includes(".")) {
      files = await this.getAllFiles(this.rootPath);
    }

    for (const filePath of files) {
      const fullPath = path.join(this.rootPath, filePath);
      try {
        await fs.access(fullPath, fs.constants.F_OK);
      } catch {
        console.log(`File not found: ${filePath}`);
        continue;
      }
      if (this.isIgnored(filePath)) {
        console.log(`Ignoring file: ${filePath} (listed in .gitignore)`);
        continue;
      }

      const fileContent = await fs.readFile(fullPath);
      const hash = this.hashIt(fileContent);

      // Check if object with this hash already exists
      const objectPath = path.join(this.objectFolderPath, hash);
      try {
        await fs.access(objectPath, fs.constants.F_OK);
        console.log(`Object with hash ${hash} already exists.`);
        continue;
      } catch {
        // Object does not exist, proceed with writing the file
      }

      await fs.writeFile(objectPath, fileContent);

      stagedEntries.push({ path: filePath, hash });
      console.log(`Added ${filePath} (hash: ${hash}) to staging area.`);
    }

    const indexContent = JSON.stringify(stagedEntries, null, 2);
    await fs.writeFile(this.indexPath, indexContent);

    console.log("Done adding files to staging area");
  }

  async getHead() {
    try {
      const headContent = await fs.readFile(this.headPath, "utf-8");
      return headContent;
    } catch (err) {
      console.log("Failed to read HEAD file.");
      return null;
    }
  }

  async commit(message) {
    console.log("Committing changes...");

    const stagedEntries = await this.getStagedEntries();
    const parentHash = await this.getHead();

    if (stagedEntries.length === 0) {
      console.log("No changes to commit.");
      return;
    }

    const commitContent = {
      message,
      changes: stagedEntries,
      parent: parentHash,
      time: new Date().toISOString(),
    };

    const commitHash = this.hashIt(JSON.stringify(commitContent));

    const commitPath = path.join(this.objectFolderPath, commitHash);
    await fs.writeFile(commitPath, JSON.stringify(commitContent, null, 2));

    console.log(`Commit hash: ${commitHash}`);

    // Clear the staging area and updae HEAD
    await fs.writeFile(this.indexPath, JSON.stringify([], null, 2));
    await fs.writeFile(this.headPath, commitHash);

    console.log("Done committing changes");
  }

  async log() {
    console.log("Fetching commit history...");

    let commitHash = await this.getHead();
    if (!commitHash) {
      console.log("No commits found!!");
      return;
    }

    while (commitHash) {
      const commitPath = path.join(this.objectFolderPath, commitHash);
      const commitContent = await fs.readFile(commitPath, "utf-8");
      const commit = JSON.parse(commitContent);

      console.log(`\nCommit: ${commitHash}`);
      console.log(`Date: ${commit.time}`);
      console.log(`message: ${commit.message}`);

      commit.changes.forEach((change) => {
        console.log(`\n    ${change.path} (${change.hash})`);
      });

      commitHash = commit.parent;
      console.log("--------------------------------------------------- ");
    }

    console.log("Done fetching commit history");
  }

  async status() {
    console.log("Checking status...");
    const stagedEntries = await this.getStagedEntries();
    if (stagedEntries.length === 0) {
      console.log("No changes in staging area.");
    } else {
      console.log("Changes to be committed:");
      stagedEntries.forEach((entry) => {
        console.log(`\t${entry.path}`);
      });
    }
  }

  async getCommitHash(commitHash) {
    const commitPath = path.join(this.objectFolderPath, commitHash);
    const commitContent = await fs.readFile(commitPath, "utf-8");
    const commit = JSON.parse(commitContent);
    return commit;
  }

  async diff(commitId) {
    const currentCommitData = await this.getCommitHash(commitId);
    const currentParentHash = currentCommitData.parent;
    if (!currentParentHash) {
      console.log("No parent commit found");
      return;
    }
    const parentCommitData = await this.getCommitHash(currentParentHash);
    const parentChanges = parentCommitData.changes;
    const currentChanges = currentCommitData.changes; // changes is the array of files changed

    for (const change of currentChanges) {
      const parentChange = parentChanges.find(
        (parentChange) => parentChange.path === change.path
      );
      if (!parentChange) {
        console.log(`\nNew file: ${change.path}`);
        continue;
      }

      const parentObjectPath = path.join(
        this.objectFolderPath,
        parentChange.hash
      );
      const parentContent = await fs.readFile(parentObjectPath, "utf-8");

      const currentObjectPath = path.join(this.objectFolderPath, change.hash);
      const currentContent = await fs.readFile(currentObjectPath, "utf-8");

      // Using diffLines for line-by-line comparison
      const lineDiff = diffLines(
        parentContent.toString(),
        currentContent.toString()
      );
      console.log(`\nLine changes in: ${change.path}`);

      await lineDiff.forEach(async (part) => {
        if (part.added) {
          process.stdout.write("\x1b[32m" + "++++++++++" + part.value);
        } else if (part.removed) {
          process.stdout.write("\x1b[31m" + "----------" + part.value);
        } else {
          process.stdout.write("\x1b[0m" + part.value);
        }
      });

      // Using diffChars for character-by-character comparison
      const charDiff = diffChars(
        parentContent.toString(),
        currentContent.toString()
      );

      console.log("\n");
      console.log(`\nCharacter-by-character changes in: ${change.path}`);
      charDiff.forEach((part) => {
        if (part.added) {
          process.stdout.write("\x1b[32m" + part.value);
        } else if (part.removed) {
          process.stdout.write("\x1b[31m" + part.value);
        } else {
          process.stdout.write("\x1b[0m" + part.value);
        }
      });
    }
    console.log("\n");
  }
}

// Command line interface

program.command("init").action(async () => {
  const gitLite = new GitLite();
});

program.command("add <files...>").action(async (files) => {
  const gitLite = new GitLite();
  await gitLite.add(files);
});

program.command("commit <message>").action(async (message) => {
  const gitLite = new GitLite();
  await gitLite.commit(message);
});

program.command("log").action(async () => {
  const gitLite = new GitLite();
  await gitLite.log();
});

program.command("status").action(async () => {
  const gitLite = new GitLite();
  await gitLite.status();
});

program.command("diff <commitId>").action(async (commitId) => {
  const gitLite = new GitLite();
  await gitLite.diff(commitId);
});

program.parse(process.argv);
