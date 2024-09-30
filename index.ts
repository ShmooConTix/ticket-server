import { Elysia, t } from "elysia";
import { staticPlugin } from "@elysiajs/static";
import { Logestic } from "logestic";
import { Database } from "bun:sqlite";
import html from "@elysiajs/html";
import { ticketModeRoute } from "./routes/queue";
import { landingPageRoute } from "./routes/landing";
import { formPageRoute, riddleState, type Riddle } from "./routes/form";
import { initalizeDatabase } from "./utils";
import NotFoundPage from "./routes/404";
import { holdPageRoute } from "./routes/hold";
import { saleRoute } from "./routes/sale";
import { confirmPageRoute } from "./routes/confirm";

export const logestic = Logestic.preset("fancy");

export const db = new Database("/app/data/ticket-db.sqlite", {
  create: true,
});

initalizeDatabase(db);

// this combines landing and tix server
// note that we cannot use .html in our stuff, which is fine in this case
// but the real tix server does use .html
export const server = new Elysia()
  .use(logestic)
  .use(html())
  .use(
    staticPlugin({
      prefix: "/files",
    })
  )
  .get("/", async ({ logestic }) => landingPageRoute({ logestic }))
  .post(
    "/enableTicketMode",
    async ({ logestic, body: { delayTime, duration } }) =>
      ticketModeRoute({ logestic, delayTime, duration }),
    {
      body: t.Object({
        delayTime: t.Number(),
        duration: t.Number(),
      }),
    }
  )
  .get("/form_:form_id", async ({ logestic, cookie, params: { form_id } }) =>
    formPageRoute({ logestic, formID: form_id, cookie })
  )
  .get("/hold_:hold_id", async ({ logestic, cookie, params, query }) =>
    holdPageRoute({ logestic, cookie, params, query })
  )
  .get("/sale_:sale_id", async ({ logestic, cookie, params, query }) =>
    saleRoute({ logestic, cookie, params, query })
  )
  .get(
    "/confirm_:confirm_id",
    async ({ logestic, cookie, params: { confirm_id } }) =>
      confirmPageRoute({ logestic, confirmID: confirm_id, cookie })
  )
  .onError(({ code }) => {
    if (code === "NOT_FOUND") return NotFoundPage();
  })
  .onStart(({ server, decorator: { logestic } }) => {
    logestic.info(`Server started on ${server?.url}:${server?.port}`);

    const randomRiddle = db
      .query("SELECT * FROM riddles ORDER BY RANDOM() LIMIT 1")
      .get() as Riddle;

    if (!randomRiddle) {
      db.run(
        `INSERT INTO riddles (riddle, answer, secret_key) VALUES (?, ?, ?)`,
        [
          "________ ShmooCon for graduating! (the work you are LOOKING for is congratulations)",
          "congratulations",
          "shoe",
        ]
      );
    }

    riddleState.r = randomRiddle;

    logestic.info(`successfully set riddle`);
  })
  .listen(80);
