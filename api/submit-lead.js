const CRM_ENDPOINT = "https://thequotemasters.com/crm_api/api.php?action=push_lead";
const INDUSTRY_CODE = 23;

function splitName(fullName) {
  const parts = fullName.trim().split(/\s+/);
  const firstName = parts.shift() || "";
  const lastName = parts.join(" ");
  return { firstName, lastName };
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = process.env.CRM_API_TOKEN;
  if (!token) {
    return res.status(500).json({ error: "Server misconfigured" });
  }

  const body = req.body || {};
  const name = (body.name || "").toString().trim();
  const phone = (body.phone || "").toString().trim();
  const email = (body.email || "").toString().trim();

  if (!name || !phone || !email) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const { firstName, lastName } = splitName(name);
  const facility = (body.facility || "").toString().trim();
  const sqft = (body.sqft || "").toString().trim();
  const message = (body.message || "").toString().trim();
  const utmSource = (body.utm_source || "").toString().trim();

  const notesParts = [];
  if (facility) notesParts.push("Facility type: " + facility);
  if (sqft) notesParts.push("Approx. sq ft: " + sqft);
  if (message) notesParts.push(message);
  const notes = notesParts.join(" | ").slice(0, 2000);

  const payload = {
    zip: "",
    customer: {
      company_name: "",
      first_name: firstName,
      last_name: lastName,
      position: "",
      phone: phone,
      email: email,
      email2: "",
      address: "",
      service_address: "",
      notes: notes
    },
    industry: INDUSTRY_CODE,
    questions: [],
    appointments: [],
    number_of_quotes: "1",
    utm_source: utmSource
  };

  try {
    const crmResponse = await fetch(CRM_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify(payload)
    });

    const text = await crmResponse.text();

    if (!crmResponse.ok) {
      return res.status(502).json({ error: "CRM rejected the request" });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(502).json({ error: "Failed to reach CRM" });
  }
};
