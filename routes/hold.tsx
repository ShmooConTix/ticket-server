import type { Logestic } from "logestic";
import type { Cookie } from "elysia";
import NotFoundPage from "./404";
import { Html } from "@elysiajs/html";
import { db } from "..";
import { generateUniqueCookieID, generateUniqueID } from "../utils";
import { riddleState } from "./form";

export type SaleRecord = {
    id: number;
    form_id: string;
    hold_id?: string;
    sale_id?: string;
    confirmation_id?: string;
    ticket_count?: number;
    email?: string;
    xc?: string;
    cc?: string;
    conf?: string;
    completed_sale: boolean;
    created_at: Date;
};

export async function holdPageRoute({
  logestic,
  cookie,
  params,
  query,
}: {
  logestic: Logestic;
  cookie: Record<string, Cookie<string | undefined>>;
  params: any;
  query: Record<string, string | undefined>;
}) {
  if (!cookie.XC.value || !riddleState.r) return <NotFoundPage />;

  if (query[riddleState.r.secret_key] !== riddleState.r.answer) {
    logestic.info(
      `riddle answer incorrect (riddle key: ${
        riddleState.r.secret_key
      }, answer given: ${params[riddleState.r.secret_key]})`
    );

    return <NotFoundPage />;
  }

  const findSessionQuery = db.query(
    "SELECT * FROM sessions WHERE xc = $xc AND hold_id = $hold_id AND completed_sale = FALSE"
  ); // cached
  const saleRecord = findSessionQuery.get({
    $xc: cookie.XC.value,
    $hold_id: params.hold_id
  }) as SaleRecord | null;

  if (!saleRecord) return <NotFoundPage />;

  const CCcookieID = generateUniqueCookieID();
  const saleID = generateUniqueID(8);

  // xc is pre-answer and is used in reservation (first 39 chars)
  cookie.CC.set({
    value: CCcookieID,
    // expiry for XC is never, but in this case session is fine
  });

  const updateSaleSession = db.query(
    "UPDATE sessions SET cc = $cc, sale_id = $sale_id WHERE xc = $xc AND hold_id = $hold_id"
  );

  updateSaleSession.run({
    $cc: CCcookieID,
    $sale_id: saleID,
    $xc: cookie.XC.value,
    $hold_id: params.hold_id,
  });

  return (
    <html lang="en">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <link href="files/tix-style.css" rel="stylesheet" type="text/css" />
        <title>ShmooCon - Registration</title>
      </head>
      <body>
        <div style="width: 100%; height: 100%;" class="align-center">
          <div class="header"></div>
          <div class="print-header"> ShmooCon Tickets!! </div>
          <table id="mainTable" class="mainTable" width="850" align="center">
            <tbody>
              <tr id="contentRow">
                <td id="content">
                  <table
                    width="775"
                    id="contentTable"
                    align="center"
                    class="table-border"
                  >
                    <tbody>
                      <tr>
                        <td>
                          <h1 style="text-align: center;" class="title">
                            <span style="color: #a0a0a0;"></span> ShmooCon
                            Ticket Reservations
                          </h1>
                          <table class="newspost" width="775">
                            <tbody>
                              <tr>
                                <td>
                                  <div style="width: 725px; margin-left: 25px; margin-right: 25px; padding-bottom: 2em;">
                                    <form action={`/sale_${saleID}`}>
                                      <table align="center" class="styled">
                                        <tbody>
                                          <tr>
                                            <th rowspan="2">Ticket Type</th>
                                          </tr>
                                          <tr>
                                            <th>Reserve</th>
                                            <th>Waitlist</th>
                                          </tr>
                                          <tr>
                                            <td align="center">
                                              <b>$175</b>, General Admission
                                            </td>
                                            <td align="right">
                                              <select name="sctickets">
                                                <option value="1">1</option>
                                                <option
                                                  value="2"
                                                  selected={true}
                                                >
                                                  2
                                                </option>
                                              </select>
                                            </td>
                                            <td align="right">0</td>
                                          </tr>
                                        </tbody>
                                      </table>
                                      <div style="color: red; margin-bottom: 1em; margin-left: 80px; margin-right: 80px; text-align:center;">
                                        {" "}
                                        NOTE – You have up to five minutes to
                                        decide. <br /> After five minutes your
                                        ticket holds will be released to the
                                        next people in line.{" "}
                                      </div>
                                      <table align="center" class="styled">
                                        <tbody>
                                          <tr>
                                            <th>Email address</th>
                                            <td>
                                              <input
                                                type="text"
                                                name="email"
                                                size="30"
                                                value=""
                                              />
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                      <div style="text-align: center; margin-top: 1.2em;">
                                        <input
                                          class="big-button"
                                          value="Click here to reserve your tickets!"
                                          type="submit"
                                        />
                                      </div>
                                    </form>
                                  </div>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="text-align: center;">
                  <div style="width: 850px; height: 25px;" class="footer"></div>
                  <p style="margin-bottom: 3em;">Copyright © ShmooCon</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </body>
    </html>
  );
}
