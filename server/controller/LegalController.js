import { policyMail } from "../email/allEmail.js";
import Legal from "../models/Legal.js";

export const addOrUpdateLegal = async (req, res) => {
  try {
    const {
      privacy_policy,
      terms,
      disclaimer,
      cancelation_policy,
      cookies,
      community_guidlines,
      sendMail,
    } = req.body;

    let legal = await Legal.findOne();
    const now = new Date();

    if (!legal) {
      legal = new Legal({});
    }

    let condition = null;

    if (typeof privacy_policy === "string") {
      legal.privacy_policy.content = privacy_policy;
      legal.privacy_policy.date = now;
      condition = "Privacy Policy";
    }

    if (typeof terms === "string") {
      legal.terms.content = terms;
      legal.terms.date = now;
      condition = "Terms And Conditions";
    }

    if (typeof disclaimer === "string") {
      legal.disclaimer.content = disclaimer;
      legal.disclaimer.date = now;
      condition = "Disclaimer";
    }

    if (typeof cancelation_policy === "string") {
      legal.cancelation_policy.content = cancelation_policy;
      legal.cancelation_policy.date = now;
      condition = "Cancelation Policy";
    }

    if (typeof cookies === "string") {
      legal.cookies.content = cookies;
      legal.cookies.date = now;
      condition = "Cookies";
    }

    if (typeof community_guidlines === "string") {
      legal.community_guidlines.content = community_guidlines;
      legal.community_guidlines.date = now;
      condition = "Community Guidelines";
    }

    const isNew = legal.isNew;
    await legal.save();

    const message = isNew
      ? "Legal document created successfully"
      : "Legal document updated successfully";

    res.status(200).json({ message, data: legal });

    if (sendMail && condition) {
      policyMail({ legalPolicy: condition })
        .then(() => console.log("Policy emails sent"))
        .catch((err) => console.error("Mail error:", err));
    }
  } catch (error) {
    console.error("Error in addOrUpdateLegal:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getLegal = async (req, res) => {
  try {
    const legal = await Legal.findOne();

    if (!legal) {
      return res.status(404).json({ message: "Legal document not found" });
    }

    return res.status(200).json(legal);
  } catch (error) {
    console.error("Error in getLegal:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
