const { Client } = require("pg");
exports.handler = async () => {
  const url = process.env.DATABASE_URL || "";
  const out = { envSet: !!url, urlLen: url.length };
  if (!url) { out.err = "DATABASE_URL KOSONG di fungsi"; return { statusCode: 200, body: JSON.stringify(out) }; }
  const client = new Client({ connectionString: url, connectionTimeoutMillis: 15000, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    const r = await client.query("select current_database() as db, inet_server_addr() as addr, version()");
    out.ok = true; out.db = r.rows[0].db; out.addr = r.rows[0].addr;
    await client.end();
  } catch (e) {
    out.ok = false; out.err = String((e && e.message) || e);
    try { await client.end(); } catch {}
  }
  return { statusCode: 200, body: JSON.stringify(out) };
};
