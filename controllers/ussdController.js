


import Case from "../models/Case.js";
import Profile from "../models/Profile.js";
import Mediation from "../models/Mediation.js";

export const handleUssd = async (req, res) => {
  const { text, phoneNumber } = req.body;
  const input = text.split("*");
  let response = "";

  try {
    // ---- Screen 1 - Welcome ----
    if (text === "") {
      response = `CON Welcome to Judiciary Land Assist
1. Check Case
2. Report Land Issue
3. Book Mediation
4. Contacts
5. My Profile`;
    }

    // ---- My Profile ----
    else if (input[0] === "5" && input.length === 1) {
      const profile = await Profile.findOne({ phoneNumber }).lean();
      if (profile) {
        response = `END Profile already exists:\nName: ${profile.name}\nCounty: ${profile.county}`;
      } else {
        response = `CON Select County:
1. Nairobi
2. Kiambu
3. Machakos`;
      }
    }
    else if (input[0] === "5" && input.length === 2) {
      response = "CON Enter your Name:";
    }
    else if (input[0] === "5" && input.length === 3) {
      const counties = { "1": "Nairobi", "2": "Kiambu", "3": "Machakos" };
      const county = counties[input[1]] || "Other";
      const name = input[2];

      await Profile.updateOne(
        { phoneNumber },
        { phoneNumber, name, county },
        { upsert: true }
      );

      response = `END ✅ Profile saved successfully.\nName: ${name}, County: ${county}`;
    }

    // ---- Check Case ----
    else if (input[0] === "1" && input.length === 1) {
      response = "CON Enter Case No. (e.g., ELC/E001/2023):";
    }
    else if (input[0] === "1" && input.length === 2) {
      const caseNo = input[1];
      const foundCase = await Case.findOne({ caseNumber: caseNo }).lean();

      if (foundCase) {
        response = `CON Case ${caseNo}:
Status: ${foundCase.status}
1. SMS me
2. Back`;
      } else {
        response = "END ❌ Case not found in the system.";
      }
    }
    else if (input[0] === "1" && input.length === 3 && input[2] === "1") {
      response = "END ✅ Case details will be sent via SMS.";
    }

    // ---- Report Land Issue ----
    else if (input[0] === "2" && input.length === 1) {
      response = `CON Report Land Issue:
1. Missing File
2. Fraudulent Transfer
3. Boundary
4. Succession`;
    }
    else if (input[0] === "2" && input.length === 2) {
      response = "CON Enter a short description:";
    }
    else if (input[0] === "2" && input.length === 3) {
      const issueTypes = {
        "1": "Missing File",
        "2": "Fraudulent Transfer",
        "3": "Boundary",
        "4": "Succession"
      };
      const issueType = issueTypes[input[1]] || "Other";

      const newCase = await Case.create({
        phoneNumber,
        caseType: `Land Issue - ${issueType}`,
        description: input[2],
        status: "Pending"
      });

      response = `END ✅ Ticket created successfully. Ref: CASE-${newCase._id.toString().slice(-5)}`;
    }

    // ---- Book Mediation ----
    else if (input[0] === "3" && input.length === 1) {
      response = `CON Select County:
1. Nairobi
2. Kiambu
3. Machakos`;
    }
    else if (input[0] === "3" && input.length === 2) {
      response = "CON Enter mediation reason:";
    }
    else if (input[0] === "3" && input.length === 3) {
      response = "CON Enter preferred date (YYYY-MM-DD):";
    }
    else if (input[0] === "3" && input.length === 4) {
      const counties = { "1": "Nairobi", "2": "Kiambu", "3": "Machakos" };
      const county = counties[input[1]] || "Other";
      const reason = input[2];
      const date = input[3];

      const newMediation = await Mediation.create({
        phoneNumber, county, reason, date
      });

      response = `END ✅ Mediation booked for ${date} at ${county}. Ref: MED-${newMediation._id.toString().slice(-5)}`;
    }

    // ---- Contacts ----
    else if (input[0] === "4") {
      response = `END Judiciary Contacts:
Nairobi: 020-1234567
Kiambu: 020-7654321
Machakos: 020-1112233`;
    }

    else {
      response = "END ❌ Invalid choice.";
    }
  } catch (err) {
    console.error("❌ USSD Error:", err.message);
    response = "END ⚠️ Sorry, something went wrong. Please try again.";
  }

  res.set("Content-Type", "text/plain");
  res.send(response);
};
