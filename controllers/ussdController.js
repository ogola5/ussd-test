import Case from "../models/Case.js";
import Profile from "../models/Profile.js";
import Whistle from "../models/Whistle.js";
import { messages } from "../services/messages.js";

export const handleUssd = async (req, res) => {
  const { text, phoneNumber } = req.body;
  const input = text.split("*").filter(Boolean);
  let response = "";

  try {
    // 1️⃣ Ensure a minimal profile exists (phone + default lang)
    let profile = await Profile.findOne({ phoneNumber });
    if (!profile) {
      profile = await Profile.create({ phoneNumber, language: "en" });
    }
    const lang = profile.language || "en";

    // === 0. First Screen: if empty, ask language if not yet set ===
    if (text === "") {
      if (!profile.languageSet) {
        response = "CON Select Language:\n1. English\n2. Kiswahili";
        return send(res, response);
      }
      response = `CON ${messages[lang].main}`;
      return send(res, response);
    }

    // === 0a. Handle first-time language selection ===
    if (!profile.languageSet) {
      if (input[0] === "1" || input[0] === "2") {
        const newLang = input[0] === "2" ? "sw" : "en";
        await Profile.updateOne(
          { phoneNumber },
          { $set: { language: newLang, languageSet: true } }
        );
        return send(res, `END ✅ Language set. Dial again to continue.`);
      }
      return send(res, "END Invalid choice. Dial again.");
    }

    // ===== Main Menu Options =====
    switch (input[0]) {
      case "1": // Register / Update My Details
        response = await handleProfile(input, phoneNumber, lang);
        break;

      case "2": // Report Land Dispute
        if (!profile.name || !profile.county) {
          response = "END ⚠️ Please register your Name & County first (Menu 1).";
        } else {
          response = await handleDispute(input, profile, lang);
        }
        break;

      case "3": // Track My Cases
        response = await handleTracking(input, profile, lang);
        break;

      case "4": // Whistleblowing
        response = await handleWhistle(input);
        break;

      case "5": // Land Rights Info
        response = `END Land Rights:\n- Secure title deeds.\n- Community rights protected.\nVisit nearest Land Office.`;
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

// ---------- Helper Handlers ----------

async function handleProfile(input, phoneNumber, lang) {
  if (input.length === 1) {
    const prof = await Profile.findOne({ phoneNumber }).lean();
    if (prof.name && prof.county) {
      return `CON Your Details:\nName: ${prof.name}\nCounty: ${prof.county}\n0. Edit`;
    }
    return "CON Enter your Name:";
  } else if (input.length === 2 && input[1] !== "0") {
    return "CON Enter County:";
  } else if (input.length === 3 || (input.length === 2 && input[1] === "0")) {
    const name = input[1] === "0" ? null : input[1];
    const county = input[1] === "0" ? null : input[2];
    const update = {};
    if (name) update.name = name;
    if (county) update.county = county;
    await Profile.updateOne({ phoneNumber }, { $set: update });
    return `END ✅ Profile saved.`;
  }
  return `END ❌ ${messages[lang].invalid}`;
}

async function handleDispute(input, profile, lang) {
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
    const caseNumber = `LND-${Date.now().toString().slice(-6)}`;
    await Case.create({
      phoneNumber: profile.phoneNumber,
      profile: profile._id,
      caseNumber,
      description: input[2],
      landType
    });
    return `END ✅ Dispute logged. Case ID: ${caseNumber}`;
  }
  return `END ❌ ${messages[lang].invalid}`;
}

async function handleTracking(input, profile, lang) {
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
}

async function handleWhistle(input) {
  if (input.length === 1) return "CON Enter County:";
  else if (input.length === 2) return "CON Enter description:";
  else if (input.length === 3) {
    await Whistle.create({
      county: input[1],
      description: input[2],
      anonymous: true
    });
    return "END ✅ Report submitted anonymously.";
  }
  return "END Invalid input.";
}

function send(res, text) {
  res.set("Content-Type", "text/plain");
  res.send(text);
}
