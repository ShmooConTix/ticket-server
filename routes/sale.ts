import { redirect, type Cookie } from "elysia";
import { Logestic } from "logestic";
import { riddleState } from "./form";
import NotFoundPage from "./404";
import { db } from "..";
import type { SaleRecord } from "./hold";
import { z } from "zod";
import { generateUniqueID, generateUniqueIDlowercase } from "../utils";

const saleSchema = z.object({
  email: z.string().email(),
  sctickets: z.literal("1").or(z.literal("2")),
});

export function saleRoute({
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
  if (!cookie.XC.value || !cookie.CC.value || !riddleState.r)
    return NotFoundPage();

  const saleData = saleSchema.safeParse(query);

  if (saleData.error) return NotFoundPage();

  const findSessionQuery = db.query(
    "SELECT * FROM sessions WHERE xc = $xc AND cc = $cc AND sale_id = $sale_id AND completed_sale = FALSE"
  );

  const saleRecord = findSessionQuery.get({
    $xc: cookie.XC.value,
    $cc: cookie.CC.value,
    $sale_id: params.sale_id,
  }) as SaleRecord | null;

  if (!saleRecord) return NotFoundPage();

  const confirmation_id = generateUniqueID(8);
  const confCookie = `${generateUniqueIDlowercase(64)}:email=${
    saleData.data.email
  }&xactn=${cookie.XC.value.substring(0, 39)}&tix=${saleData.data.sctickets}`;

  cookie.CONF.set({
    value: confCookie,
  });

  const updateSaleSession = db.query(`
    UPDATE sessions 
    SET 
        confirmation_id = $conf_id, 
        ticket_count = $ticket_count, 
        email = $email, 
        conf = $conf, 
        completed_sale = TRUE 
    WHERE 
        xc = $xc AND 
        cc = $cc AND 
        sale_id = $sale_id AND 
        completed_sale = FALSE
  `);

  updateSaleSession.run({
    $conf_id: confirmation_id,
    $ticket_count: parseInt(saleData.data.sctickets),
    $email: saleData.data.email,
    $conf: confCookie,
    $xc: cookie.XC.value,
    $cc: cookie.CC.value,
    $sale_id: params.sale_id,
  });

  logestic.info(
    `sale completed as ${confirmation_id}, ${saleData.data.email} (${saleData.data.sctickets} tickets)`
  );

  return redirect(`/confirm_${confirmation_id}`);
}
