// controllers/ussdController.js
import Case from "../models/Case.js";
import Profile from "../models/Profile.js";
import Mediation from "../models/Mediation.js";
import Whistle from "../models/Whistle.js";
import { messages } from "../services/messages.js";

export const handleUssd = async (req, res) => {
  const { text, phoneNumber } = req.body;
  const input = text.split("*").filter(Boolean);
  let response = "";

  try {
    // Check profile for language preference
    const profile = await Profile.findOne({ phoneNumber }).lean();
    const lang = profile?.language || "en";

    // === Main Menu ===
    if (text === "") {
      response = `CON ${messages[lang].main}`;
    }

    // === 1. Track Case ===
    else if (input[0] === "1") {
      if (input.length === 1) response = "CON Enter Case ID:";
      else if (input.length === 2) {
        const found = await Case.findOne({ caseNumber: input[1] }).lean();
        response = found
          ? `END Case ${found.caseNumber}\nStatus: ${found.status}`
          : "END ❌ Case not found.";
      }
    }

    // === 2. Log New Dispute ===
    else if (input[0] === "2") {
      if (input.length === 1) {
        response = `CON Select Land Type:
1. Titled Land
2. Sale Agreement
3. Community/Customary`;
      } else if (input.length === 2) {
        response = "CON Enter a short description:";
      } else if (input.length === 3) {
        const types = { "1": "TITLED", "2": "SALE_AGREEMENT", "3": "COMMUNITY" };
        const landType = types[input[1]] || "OTHER";
        const caseNumber = `LND-${Date.now().toString().slice(-6)}`;
        await Case.create({
          phoneNumber,
          caseNumber,
          description: input[2],
          landType
        });
        response = `END ✅ Dispute logged. Case ID: ${caseNumber}`;
      }
    }

    // === 3. Land Rights ===
    else if (input[0] === "3") {
      response = `END Land Rights:\n- Secure title deeds.\n- Community rights protected.\nVisit nearest Land Office for more.`;
    }

    // === 4. Whistleblowing ===
    else if (input[0] === "4") {
      if (input.length === 1) response = "CON Enter County:";
      else if (input.length === 2) response = "CON Enter description:";
      else if (input.length === 3) {
        await Whistle.create({
          county: input[1],
          description: input[2],
          anonymous: true
        });
        response = "END ✅ Report submitted anonymously.";
      }
    }

    // === 5. Language Settings ===
    else if (input[0] === "5") {
      if (input.length === 1) {
        response = "CON Select Language:\n1. English\n2. Kiswahili";
      } else if (input.length === 2) {
        const newLang = input[1] === "2" ? "sw" : "en";
        await Profile.updateOne(
          { phoneNumber },
          { $set: { language: newLang } },
          { upsert: true }
        );
        response = "END ✅ Language updated.";
      }
    }

    // === 6. My Profile ===
    else if (input[0] === "6") {
      if (input.length === 1) {
        if (profile) {
          response = `END Name: ${profile.name}\nCounty: ${profile.county}`;
        } else {
          response = "CON Enter your Name:";
        }
      } else if (input.length === 2) {
        response = "CON Enter County:";
      } else if (input.length === 3) {
        await Profile.updateOne(
          { phoneNumber },
          { name: input[1], county: input[2], language: lang },
          { upsert: true }
        );
        response = `END ✅ Profile saved.`;
      }
    }

    else {
      response = `END ❌ ${messages[lang].invalid}`;
    }
  } catch (err) {
    console.error("USSD Error:", err);
    response = "END ⚠️ System error. Try again later.";
  }

  res.set("Content-Type", "text/plain");
  res.send(response);
};
