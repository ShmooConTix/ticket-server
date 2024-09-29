import { Html } from "@elysiajs/html";

export default function NotFoundPage() {
  return (
    <html lang="en">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="files/alt-style.css" rel="stylesheet" type="text/css" />
        <title>ShmooCon - Registration</title>
      </head>
      <body>
        <h1 style="text-align: center;" class="title">
          <span style="color: #a0a0a0;"></span> ShmooCon Ticket Reservations
        </h1>
        <h3 style="text-align: center;">Ticket Time!</h3>
        <p>
          You are either a bot... or you did something very wrong. Either way;{" "}
          <a href="/">let's get you back on track</a>
        </p>
      </body>
    </html>
  );
}