# GitLite

GitLite is a lightweight version control system inspired by Git. It was created to gain a deeper understanding of Git's internals and to offer a simplified alternative for basic version control operations.

## Motive

The primary motive behind creating GitLite was to explore and understand the inner workings of Git. By developing this project, I aimed to demystify the complex processes involved in version control systems and to provide a clear and concise implementation of the fundamental concepts. Additionally, the fun part of this project is that while i created GitLite, I used Git to push the code to GitHub!

## Usage

To start using GitLite locally, follow these steps:

### 1. Allow Write Operations in CLI

First, you need to allow write operations for the script. Run the following command to set the necessary permissions:

```sh
chmod +x gitLite.js
```

Now you can execute the GitLite commands listed below.

### 2. Initialize a Repository

To initialize a new GitLite repository, use:

```sh
./gitLite.js init
```

### 3. Add Files to Staging Area

To add files to the staging area, use:

```sh
./gitLite.js add <files...>
```

You can also add all files (except those listed in `.gitignore`) by using:

```sh
./gitLite.js add .
```

### 4. Commit Changes

To commit the staged changes with a message, use:

```sh
./gitLite.js commit "Your commit message"
```

### 5. View Commit History

To view the commit history, use:

```sh
./gitLite.js log
```

### 6. Check Repository Status

To check the status of your repository and see the changes staged for commit, use:

```sh
./gitLite.js status
```

### 7. View Differences Between Commits

To view the differences between a commit and its parent, use:

```sh
./gitLite.js diff <commitId>
```

### 8. Push to Remote

To simulate pushing to a remote repository, use:

```sh
./gitLite.js push
```

### 9. Create a New Branch

To create a new branch, use:

```sh
./gitLite.js branch <branchName>
```

### 10. Switch Branches

To switch to a different branch, use:

```sh
./gitLite.js checkout <branchName>
```

---

Feel free to explore GitLite and get a hands-on understanding of how version control systems work. This project serves as both an educational tool and a lightweight alternative for managing your source code. Enjoy using GitLite!