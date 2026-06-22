export default async function handler(req, res) {
  const SHEET_ID = '1FPiPD7Kxd27IwM9OpdDr5dY2xk0B4qezh_2UhhWXCjM';
  const GID = '911641837';
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Google returned ' + response.status);
    const csv = await response.text();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=300');
    res.status(200).send(csv);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
