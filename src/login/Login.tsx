import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import CssBaseline from "@mui/material/CssBaseline";
import FormControlLabel from "@mui/material/FormControlLabel";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import MuiCard from "@mui/material/Card";
import Link from "@mui/material/Link";
import { styled } from "@mui/material/styles";
import AppTheme from "../shared-theme/AppTheme";

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(2),
  gap: theme.spacing(2),
  margin: "auto",
  maxWidth: "400px",
  [theme.breakpoints.up("sm")]: {
    maxWidth: "552px",
    padding: theme.spacing(3),
  },
  boxShadow: "none",
  border: "none",
}));

const LoginContainer = styled(Stack)(({ theme }) => ({
  minHeight: "100vh",
  padding: theme.spacing(2),
  backgroundColor: "#fff",
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(4),
  },
}));

const CardHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  padding: theme.spacing(2),
  alignItems: "center",
  alignSelf: "stretch",
}));

const CardContent = styled(Box)(({ theme }) => ({
  display: "flex",
  padding: theme.spacing(2),
  flexDirection: "column",
  alignItems: "flex-start",
  gap: theme.spacing(2),
  alignSelf: "stretch",
}));

const FormSection = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: theme.spacing(2),
  alignSelf: "stretch",
}));

const ActionsSection = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "flex-start",
  gap: theme.spacing(1),
}));

export default function Login(props: { disableCustomTheme?: boolean }) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [rememberMe, setRememberMe] = React.useState(true);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log({
      email,
      password,
      rememberMe,
    });
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <LoginContainer
        direction="column"
        justifyContent="center"
        alignItems="center"
      >
        <Card>
          <CardHeader>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                flex: "1 0 0",
              }}
            >
              <Typography
                component="h1"
                sx={{
                  alignSelf: "stretch",
                  color: "rgba(0, 0, 0, 0.87)",
                  fontFamily: "Roboto",
                  fontSize: "24px",
                  fontWeight: 400,
                  lineHeight: "133.4%",
                }}
              >
                Log In
              </Typography>
              <Typography
                sx={{
                  alignSelf: "stretch",
                  color: "rgba(0, 0, 0, 0.60)",
                  fontFamily: "Roboto",
                  fontSize: "14px",
                  fontWeight: 400,
                  lineHeight: "143%",
                  letterSpacing: "0.17px",
                }}
              >
                Get started for free
              </Typography>
            </Box>
          </CardHeader>

          <CardContent>
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ width: "100%" }}
            >
              <FormSection>
                <TextField
                  fullWidth
                  id="email"
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  variant="outlined"
                  size="medium"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "4px",
                      "& fieldset": {
                        borderColor: "rgba(0, 0, 0, 0.23)",
                      },
                    },
                    "& .MuiInputLabel-root": {
                      color: "rgba(0, 0, 0, 0.60)",
                      fontFamily: "Roboto",
                      fontSize: "16px",
                      fontWeight: 400,
                      lineHeight: "24px",
                      letterSpacing: "0.15px",
                    },
                    "& .MuiOutlinedInput-input": {
                      padding: "16px 12px",
                      minHeight: "24px",
                    },
                  }}
                />

                <TextField
                  fullWidth
                  id="password"
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  variant="outlined"
                  size="medium"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "4px",
                      "& fieldset": {
                        borderColor: "rgba(0, 0, 0, 0.23)",
                      },
                    },
                    "& .MuiInputLabel-root": {
                      color: "rgba(0, 0, 0, 0.60)",
                      fontFamily: "Roboto",
                      fontSize: "16px",
                      fontWeight: 400,
                      lineHeight: "24px",
                      letterSpacing: "0.15px",
                    },
                    "& .MuiOutlinedInput-input": {
                      padding: "16px 12px",
                      minHeight: "24px",
                    },
                  }}
                />
              </FormSection>

              <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      sx={{
                        color: "#1976D2",
                        "&.Mui-checked": {
                          color: "#1976D2",
                        },
                        "& .MuiSvgIcon-root": {
                          fontSize: 24,
                        },
                      }}
                    />
                  }
                  label=""
                  sx={{ mr: 0 }}
                />
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{
                  mt: 2,
                  padding: "8px 22px",
                  borderRadius: "4px",
                  backgroundColor: "#1976D2",
                  color: "#FFF",
                  fontFamily: "Roboto",
                  fontSize: "15px",
                  fontWeight: 500,
                  lineHeight: "26px",
                  letterSpacing: "0.46px",
                  textTransform: "uppercase",
                  boxShadow:
                    "0px 1px 5px 0px rgba(0, 0, 0, 0.12), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 3px 1px -2px rgba(0, 0, 0, 0.20)",
                  "&:hover": {
                    backgroundColor: "#1565C0",
                  },
                }}
              >
                ACTION
              </Button>

              <ActionsSection sx={{ mt: 2 }}>
                <Link
                  href="#"
                  sx={{
                    color: "#1976D2",
                    fontFamily: "Roboto",
                    fontSize: "16px",
                    fontWeight: 400,
                    lineHeight: "150%",
                    letterSpacing: "0.15px",
                    textDecoration: "underline",
                    textDecorationColor: "rgba(25, 118, 210, 0.4)",
                  }}
                >
                  Link
                </Link>
                <Link
                  href="#"
                  sx={{
                    color: "#1976D2",
                    fontFamily: "Roboto",
                    fontSize: "16px",
                    fontWeight: 400,
                    lineHeight: "150%",
                    letterSpacing: "0.15px",
                    textDecoration: "underline",
                    textDecorationColor: "rgba(25, 118, 210, 0.4)",
                  }}
                >
                  Link
                </Link>
              </ActionsSection>
            </Box>
          </CardContent>
        </Card>
      </LoginContainer>
    </AppTheme>
  );
}
