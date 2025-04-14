import React from "react";
import { Container } from "react-bootstrap";
import { Typography } from "@mui/material";
const ClinicPOC = () => {


  return (
        <Container
          fluid
          className="d-flex flex-column justify-content-center align-items-center text-center"
          style={{ flexGrow: 1, backgroundColor: "#f0f4f8", padding: "2rem" }}
        >
          <Typography variant="h3" gutterBottom sx={{ color: "#1976d2", fontWeight: 700 }}>
            🚀 Coming Soon!
          </Typography>
          <Typography variant="h6" sx={{ color: "#555", maxWidth: "600px" }}>
            We're working hard to bring you this page. Stay tuned for updates!
          </Typography>
        </Container>

  );
};

export default ClinicPOC;
