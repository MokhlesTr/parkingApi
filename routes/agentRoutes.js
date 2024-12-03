const express = require("express");
const router = express.Router();
const pool = require("../db/pool");
const bcrypt = require("bcrypt");

const GetAllAgents = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM agent");

    // Remove the password field from each agent object before sending the response
    const agentsWithoutPassword = result.rows.map((agent) => {
      delete agent.password;
      return agent;
    });

    res.status(200).json(agentsWithoutPassword);
  } catch (e) {
    console.error("ERROR fetching agents:", e);
    res.status(500).json({ error: e.message });
  }
};

const GetOneAgent = async (req, res) => {
  try {
    const { id_agent } = req.params;
    const result = await pool.query("SELECT * FROM agent WHERE id_agent = $1", [
      id_agent,
    ]);

    if (result.rows.length > 0) {
      const agent = result.rows[0];
      delete agent.password;
      res.status(200).json(agent);
    } else {
      res.status(404).json({ error: "Agent not found!" });
    }
  } catch (e) {
    console.error("ERROR fetching agent:", e);
    res.status(500).json({ error: e.message });
  }
};

const AddAgent = async (req, res) => {
  try {
    const {
      cin,
      first_name,
      last_name,
      recruitment_date,
      id_parking,
      password,
    } = req.body;

    if (
      !cin ||
      !first_name ||
      !last_name ||
      !recruitment_date ||
      !id_parking ||
      !password
    ) {
      return res.status(400).json({ error: "All fields are required!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO agent (cin, first_name, last_name, recruitment_date, id_parking, password)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [cin, first_name, last_name, recruitment_date, id_parking, hashedPassword]
    );

    res.status(201).json({
      message: "Agent added successfully!",
      agent: result.rows[0],
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
    console.error("ERROR:", e);
  }
};

const DeleteAgent = async (req, res) => {
  try {
    const { id_agent } = req.params;
    const result = await pool.query("DELETE FROM agent WHERE id_agent=$1", [
      id_agent,
    ]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Agent not found!" });
    }
    res.status(200).json({ message: "Agent deleted successfully!" });
  } catch (e) {
    console.error("ERROR deleting agent:", e.message);
    res.status(500).json({ error: "Internal server error." });
  }
};

const UpdateAgent = async (req, res) => {
  try {
    const { id_agent } = req.params;
    const updates = req.body;
    let UpdatedAgentKeys = Object.keys(updates);
    let UpdatedAgentValues = Object.values(updates);

    if (UpdatedAgentKeys.length === 0) {
      return res.status(400).json({ error: "No fields provided for update!" });
    }

    const fields = UpdatedAgentKeys.map(
      (key, index) => `${key} = $${index + 1}`
    ).join(", ");

    const values = [...UpdatedAgentValues, id_agent];
    const query = `UPDATE agent SET ${fields} WHERE id_agent = $${values.length}`;

    const result = await pool.query(query, values);

    if (!result.rowCount) {
      return res.status(404).json({ error: "Agent not found!" });
    }

    res.status(200).json({ message: "Agent updated successfully!" });
  } catch (e) {
    console.error("Error updating agent:", e);
    res.status(500).json({ error: e.message });
  }
};

//1st method
// router.get("/", GetAllAgents);
// router.post("/", AddAgent);
// router.get("/:id_agent", GetOneAgent);
// router.delete("/:id_agent", DeleteAgent);
// router.put("/:id_agent", UpdateAgent);

//2nd method
router.route("/").get(GetAllAgents).post(AddAgent);
router
  .route("/:id_agent")
  .get(GetOneAgent)
  .delete(DeleteAgent)
  .put(UpdateAgent);

module.exports = router;
