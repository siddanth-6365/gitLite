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

### 2. Initialize a Repository
```sh
./gitLite.js init
```

### 3. Add Files to Staging Area
```sh
./gitLite.js add <files...>
```

You can also add all files (except those listed in `.gitignore`) by using:

```sh
./gitLite.js add .
```

### 4. Commit Changes
```sh
./gitLite.js commit "Your commit message"
```

### 5. View Commit History
```sh
./gitLite.js log
```

### 6. Check Repository Status
```sh
./gitLite.js status
```

### 7. View Differences Between Commits
```sh
./gitLite.js diff <commitId>
```

### 8. Push to Remote
```sh
./gitLite.js push
```

### 9. Create a New Branch
```sh
./gitLite.js branch <branchName>
```

### 10. Switch Branches
```sh
./gitLite.js checkout <branchName>
```

---

Feel free to explore GitLite and get a hands-on understanding of how version control systems work.