import { policyMail } from "../email/allEmail.js";
import Legal from "../models/Legal.js";

export const addOrUpdateLegal = async (req, res) => {
  try {
    const {
      privacyPolicy,
      terms,
      disclaimer,
      cancelationPolicy,
      cookies,
      sendMail,
    } = req.body;

    let legal = await Legal.findOne();

    if (!legal) {
      legal = new Legal({
        privacyPolicy,
        terms,
        disclaimer,
        cancelationPolicy,
        cookies,
      });
    } else {
      legal.privacyPolicy = privacyPolicy || legal.privacyPolicy;
      legal.terms = terms || legal.terms;
      legal.disclaimer = disclaimer || legal.disclaimer;
      legal.cancelationPolicy = cancelationPolicy || legal.cancelationPolicy;
      legal.cookies = cookies || legal.cookies;
    }

    let condition;
    if (privacyPolicy) condition = "Privacy Policy";
    else if (terms) condition = "Terms And Conditions";
    else if (disclaimer) condition = "Disclaimer";
    else if (cancelationPolicy) condition = "Cancelation Policy";
    else if (cookies) condition = "Cookies";

    const isNew = legal.isNew;
    await legal.save();

    // 🟢 Send response first
    const message = isNew
      ? "Legal document created successfully"
      : "Legal document updated successfully";

    res.status(200).json({ message });
    if (sendMail) {
      if (condition) {
        policyMail({ legalPolicy: condition })
          .then(() => console.log("✅ All policy emails sent successfully"))
          .catch((err) =>
            console.error("❌ Error sending policy emails:", err)
          );
      }
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
