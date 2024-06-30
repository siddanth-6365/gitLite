# GitLite

GitLite is a lightweight version control system designed for simplicity and ease of use. It provides basic version control functionalities similar to Git, but with a smaller footprint and simplified commands.

## Installation

To install GitLite, follow these steps:

1. Clone the repository: `git clone https://github.com/your-username/gitlite.git`
2. Navigate to the project directory: `cd gitlite`
3. Install dependencies: `npm install`

## Usage

GitLite can be used through the command line interface (CLI). Here are some common commands:
-- first you need to allow write operations in cli so just run `chmod +x gitLite.js` to allow permissions and now you can run following commands :

- `./gitLite init`: Initialize a new GitLite repository in the current directory.
- `./gitLite add <file>`: Add a file to the staging area.
- `./gitLite commit -m "<message>"`: Commit the changes in the staging area with a descriptive message.
- `./gitLite status`: View the status of the repository.
- `./gitLite log`: View the commit history.

For a complete overview of GitLite's functionalities, please refer to the [gitLite.js](./gitLite.js) file.

## Contributing

Contributions are welcome! If you encounter any issues or have suggestions for improvements, please open an issue or submit a pull request on the [GitLite GitHub repository](https://github.com/your-username/gitlite).

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for more information.
