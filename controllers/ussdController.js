// controllers/ussdController.js
import Case from "../models/Case.js";
import Profile from "../models/Profile.js";
import Whistle from "../models/Whistle.js";
import { messages } from "../services/messages.js";

/**
 * Main USSD entry point
 */
export const handleUssd = async (req, res) => {
  const { text = "", phoneNumber } = req.body;
  const input = text.split("*").filter(Boolean);
  let response = "";

  try {
    // Ensure there is always a profile for this phone number
    let profile = await Profile.findOne({ phoneNumber });
    if (!profile) profile = await Profile.create({ phoneNumber });

    const lang = profile.language || "en";

    // === FIRST DIAL ===
    if (text === "") {
      if (!profile.languageSet) {
        return send(res, "CON Select Language:\n1. English\n2. Kiswahili");
      }
      return send(res, `CON ${messages[lang].main}`);
    }

    // === FIRST-TIME LANGUAGE SELECTION ===
    if (!profile.languageSet) {
      if (input[0] === "1" || input[0] === "2") {
        const newLang = input[0] === "2" ? "sw" : "en";
        await Profile.updateOne(
          { phoneNumber },
          { $set: { language: newLang, languageSet: true } }
        );
        return send(
          res,
          `END ✅ Language set to ${newLang === "sw" ? "Kiswahili" : "English"}. Dial again to continue.`
        );
      }
      return send(res, "END ❌ Invalid choice. Dial again.");
    }

    // === MAIN MENU ===
    switch (input[0]) {
      case "1":
        response = await handleProfile(input, phoneNumber, lang);
        break;
      case "2":
        if (!profile.name || !profile.county) {
          response = messages[lang].needProfile;
        } else {
          response = await handleDispute(input, profile, lang);
        }
        break;
      case "3":
        response = await handleTracking(input, profile, lang);
        break;
      case "4":
        response = await handleWhistle(input);
        break;
      case "5":
        response = messages[lang].rightsInfo;
        break;
      default:
        response = `END ❌ ${messages[lang].invalid}`;
    }

    send(res, response);
  } catch (err) {
    console.error("USSD Error:", err);
    send(res, "END ⚠️ System error. Try again later.");
  }
};

// ---------------------------------------------------------------------------
// Helper Handlers
// ---------------------------------------------------------------------------

async function handleProfile(input, phoneNumber, lang) {
  try {
    if (input.length === 1) {
      const prof = await Profile.findOne({ phoneNumber }).lean();
      if (prof.name && prof.county) {
        return `CON Your Details:\nName: ${prof.name}\nCounty: ${prof.county}\n0. Edit`;
      }
      return "CON Enter your Name:";
    } else if (input.length === 2 && input[1] !== "0") {
      return "CON Enter County:";
    } else if (input.length === 3 || (input.length === 2 && input[1] === "0")) {
      const update = {};
      if (input[1] !== "0") update.name = input[1].trim();
      if (input[2]) update.county = input[2].trim();
      if (Object.keys(update).length) {
        await Profile.updateOne({ phoneNumber }, { $set: update });
      }
      return "END ✅ Profile saved.";
    }
    return `END ❌ ${messages[lang].invalid}`;
  } catch (e) {
    console.error("Profile Error:", e);
    return "END ⚠️ Error saving profile.";
  }
}

async function handleDispute(input, profile, lang) {
  try {
    if (input.length === 1) {
      return `CON Select Land Type:
1. Titled Land
2. Sale Agreement
3. Community/Customary`;
    } else if (input.length === 2) {
      return "CON Enter a short description:";
    } else if (input.length === 3) {
      const types = { "1": "TITLED", "2": "SALE_AGREEMENT", "3": "COMMUNITY" };
      const landType = types[input[1]] || "OTHER";
      const description = input[2].slice(0, 160); // 160-char limit
      const caseNumber = `LND-${Date.now().toString().slice(-6)}`;

      await Case.create({
        phoneNumber: profile.phoneNumber,
        profile: profile._id,
        caseNumber,
        description,
        landType,
        status: "PENDING"
      });
      return `END ✅ Dispute logged. Case ID: ${caseNumber}`;
    }
    return `END ❌ ${messages[lang].invalid}`;
  } catch (e) {
    console.error("Dispute Error:", e);
    return "END ⚠️ Could not log dispute.";
  }
}

async function handleTracking(input, profile, lang) {
  try {
    if (input.length === 1) {
      return "CON 1. Enter Case ID\n2. View My Recent Cases";
    } else if (input[1] === "1" && input.length === 2) {
      return "CON Enter Case ID:";
    } else if (input[1] === "1" && input.length === 3) {
      const found = await Case.findOne({ caseNumber: input[2] }).lean();
      return found
        ? `END Case ${found.caseNumber}\nStatus: ${found.status}`
        : "END ❌ Case not found.";
    } else if (input[1] === "2") {
      const recent = await Case.find({ profile: profile._id })
        .sort({ createdAt: -1 })
        .limit(3)
        .lean();
      if (!recent.length) return "END No recent cases.";
      const list = recent
        .map((c, i) => `${i + 1}. ${c.caseNumber} (${c.status})`)
        .join("\n");
      return `END Recent Cases:\n${list}`;
    }
    return `END ❌ ${messages[lang].invalid}`;
  } catch (e) {
    console.error("Tracking Error:", e);
    return "END ⚠️ Error retrieving cases.";
  }
}

async function handleWhistle(input) {
  try {
    if (input.length === 1) return "CON Enter County:";
    if (input.length === 2) return "CON Enter description:";
    if (input.length === 3) {
      const county = input[1].trim();
      const description = input[2].slice(0, 160);
      await Whistle.create({
        county,
        description,
        anonymous: true
      });
      return "END ✅ Report submitted anonymously.";
    }
    return "END ❌ Invalid input.";
  } catch (e) {
    console.error("Whistle Error:", e);
    return "END ⚠️ Could not submit report.";
  }
}

// ---------------------------------------------------------------------------
// Utility to send plain-text USSD responses
// ---------------------------------------------------------------------------
function send(res, text) {
  res.set("Content-Type", "text/plain");
  res.send(text);
}
