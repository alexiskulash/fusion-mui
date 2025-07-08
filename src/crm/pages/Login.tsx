import * as React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";

export default function Login() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [rememberMe, setRememberMe] = React.useState(true);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Handle login logic here
    console.log("Login submitted:", { email, password, rememberMe });
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "80vh",
        px: 2,
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 552,
          boxShadow: "none",
        }}
      >
        <CardHeader
          title="Log In"
          subheader="Get started for free"
          sx={{
            textAlign: "left",
            "& .MuiCardHeader-title": {
              fontSize: "24px",
              fontWeight: 400,
              color: "rgba(0, 0, 0, 0.87)",
            },
            "& .MuiCardHeader-subheader": {
              fontSize: "14px",
              fontWeight: 400,
              color: "rgba(0, 0, 0, 0.60)",
              marginTop: "4px",
            },
          }}
        />
        <CardContent>
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Email"
                type="email"
                variant="outlined"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-input": {
                    fontSize: "16px",
                    padding: "16px 12px",
                  },
                  "& .MuiInputLabel-root": {
                    fontSize: "16px",
                    color: "rgba(0, 0, 0, 0.60)",
                  },
                }}
              />
              <TextField
                label="Password"
                type="password"
                variant="outlined"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-input": {
                    fontSize: "16px",
                    padding: "16px 12px",
                  },
                  "& .MuiInputLabel-root": {
                    fontSize: "16px",
                    color: "rgba(0, 0, 0, 0.60)",
                  },
                }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    color="primary"
                  />
                }
                label=""
                sx={{ alignSelf: "flex-start", mb: 1 }}
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                sx={{
                  py: 1,
                  fontSize: "15px",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.46px",
                  boxShadow:
                    "0px 1px 5px 0px rgba(0, 0, 0, 0.12), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 3px 1px -2px rgba(0, 0, 0, 0.20)",
                }}
              >
                ACTION
              </Button>
              <Stack direction="row" spacing={1}>
                <Link
                  href="#"
                  underline="always"
                  sx={{
                    fontSize: "16px",
                    fontWeight: 400,
                    color: "primary.main",
                  }}
                >
                  Link
                </Link>
                <Link
                  href="#"
                  underline="always"
                  sx={{
                    fontSize: "16px",
                    fontWeight: 400,
                    color: "primary.main",
                  }}
                >
                  Link
                </Link>
              </Stack>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
