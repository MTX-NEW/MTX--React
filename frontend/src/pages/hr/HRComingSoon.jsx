import React from "react";
import { Container, Card } from "react-bootstrap";
import { Typography } from "@mui/material";

const HRComingSoon = ({ pageName }) => {
  return (
    <Container
      fluid
      className="d-flex flex-column justify-content-center align-items-center text-center p-4"
      style={{ minHeight: 'calc(100vh - 150px)', backgroundColor: "#f0f4f8" }}
    >
      <Card className="p-5 shadow-sm" style={{ maxWidth: '600px' }}>
        <Typography variant="h4" gutterBottom sx={{ color: "#1976d2", fontWeight: 700 }}>
          🚀 Coming Soon!
        </Typography>
        {pageName && (
          <Typography variant="h6" sx={{ color: "#333", marginBottom: 2 }}>
            {pageName}
          </Typography>
        )}
        <Typography variant="body1" sx={{ color: "#555" }}>
          We're working hard to bring you this feature. Stay tuned for updates!
        </Typography>
      </Card>
    </Container>
  );
};

export default HRComingSoon;
