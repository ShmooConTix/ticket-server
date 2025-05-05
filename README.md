# ShmooCon Ticket Bot Mock Ticket Server 🎫🤖
*This is part of a proof-of-concept bot to automatically purchase tickets for ShmooCon, a conference that is notoriously hard to get tickets for. [See more info here.](https://github.com/ShmooConTix/ticket-bot)*

> [!CAUTION]
> This project is provided for research and educational purposes only. It is intended solely as a proof of concept. The author is not responsible for any misuse or actions taken by end users based on this code. Use at your own risk. We are not affiliated with ShmooCon in any way.

## About / Features
This serves as the "mock server" for the bot to ensure that we didn't use the *actual* ShmooCon ticket servers, as that would be unwanted in a PoC / experiment. It is built with Bun, Elysia, SQLite, and React.

- Accurate replication of the ShmooCon ticket purchasing process
- Documentation through [Bruno](https://www.usebruno.com/)
- Cookie validation to ensure that the bot went through correctly (stored w/ SQLite)
- Extensive logging

## Installation
To run a development environment, you can run the API through the `Dockerfile`. Make sure you expose the necessary ports. If you aren't familiar with Docker, please consult the documentation.

## Contributing
This project / experiment is over and is not open to changes. Please contact me if you have questions.
