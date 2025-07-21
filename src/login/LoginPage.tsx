import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import CssBaseline from "@mui/material/CssBaseline";
import FormControlLabel from "@mui/material/FormControlLabel";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import MuiCard from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import { styled } from "@mui/material/styles";
import AppTheme from "../shared-theme/AppTheme";

const LoginContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  minHeight: "100vh",
  justifyContent: "center",
  alignItems: "center",
  background: "#FFF",
  padding: theme.spacing(2),
  [theme.breakpoints.up("md")]: {
    padding: theme.spacing(4),
  },
}));

const StyledCard = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  width: "100%",
  maxWidth: "552px",
  height: "400px",
  padding: 0,
  boxShadow: "none",
  border: "none",
  background: "transparent",
  [theme.breakpoints.down("sm")]: {
    maxWidth: "375px",
    height: "100vh",
    justifyContent: "center",
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "4px",
    "& fieldset": {
      borderColor: "rgba(0, 0, 0, 0.23)",
    },
    "&:hover fieldset": {
      borderColor: "rgba(0, 0, 0, 0.23)",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#1976D2",
    },
  },
  "& .MuiInputLabel-root": {
    color: "rgba(0, 0, 0, 0.60)",
    fontSize: "16px",
    fontFamily: "Roboto",
    fontWeight: 400,
    lineHeight: "24px",
    letterSpacing: "0.15px",
    "&.Mui-focused": {
      color: "#1976D2",
    },
  },
  "& .MuiOutlinedInput-input": {
    padding: "16px 12px",
    fontSize: "16px",
    fontFamily: "Roboto",
    fontWeight: 400,
    lineHeight: "24px",
    letterSpacing: "0.15px",
    color: "rgba(0, 0, 0, 0.87)",
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#1976D2",
  color: "#FFF",
  fontSize: "15px",
  fontFamily: "Roboto",
  fontWeight: 500,
  lineHeight: "26px",
  letterSpacing: "0.46px",
  textTransform: "uppercase",
  padding: "8px 22px",
  borderRadius: "4px",
  boxShadow: "0px 1px 5px 0px rgba(0, 0, 0, 0.12), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 3px 1px -2px rgba(0, 0, 0, 0.20)",
  "&:hover": {
    backgroundColor: "#1565C0",
  },
  "&:focus": {
    backgroundColor: "#1976D2",
  },
}));

const StyledLink = styled(Link)(({ theme }) => ({
  color: "#1976D2",
  fontSize: "16px",
  fontFamily: "Roboto",
  fontWeight: 400,
  lineHeight: "24px",
  letterSpacing: "0.15px",
  textDecoration: "none",
  position: "relative",
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: "-4px",
    left: 0,
    width: "100%",
    height: "1px",
    backgroundColor: "#1976D2",
    opacity: 0.4,
  },
  "&:hover": {
    textDecoration: "none",
  },
}));

const StyledCheckbox = styled(Checkbox)(({ theme }) => ({
  padding: "9px",
  "& .MuiSvgIcon-root": {
    fontSize: "24px",
  },
  "&.Mui-checked": {
    color: "#1976D2",
  },
}));

export default function LoginPage(props: { disableCustomTheme?: boolean }) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [rememberMe, setRememberMe] = React.useState(false);

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
      <LoginContainer>
        <StyledCard>
          <CardHeader
            title={
              <Typography
                variant="h4"
                sx={{
                  color: "rgba(0, 0, 0, 0.87)",
                  fontSize: "24px",
                  fontFamily: "Roboto",
                  fontWeight: 400,
                  lineHeight: "133.4%",
                  margin: 0,
                }}
              >
                Log In
              </Typography>
            }
            subheader={
              <Typography
                variant="body2"
                sx={{
                  color: "rgba(0, 0, 0, 0.60)",
                  fontSize: "14px",
                  fontFamily: "Roboto",
                  fontWeight: 400,
                  lineHeight: "143%",
                  letterSpacing: "0.17px",
                  margin: 0,
                }}
              >
                Get started for free
              </Typography>
            }
            sx={{
              padding: "16px",
              alignItems: "center",
              "& .MuiCardHeader-content": {
                alignItems: "flex-start",
              },
            }}
          />
          <CardContent
            sx={{
              padding: "16px",
              width: "100%",
              "&:last-child": {
                paddingBottom: "16px",
              },
            }}
          >
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                width: "100%",
              }}
            >
              <StyledTextField
                label="Email"
                variant="outlined"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                autoComplete="email"
              />
              
              <StyledTextField
                label="Password"
                variant="outlined"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete="current-password"
              />

              <FormControlLabel
                control={
                  <StyledCheckbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    color="primary"
                  />
                }
                label=""
                sx={{
                  margin: 0,
                  alignSelf: "flex-start",
                }}
              />

              <ActionButton
                type="submit"
                fullWidth
                variant="contained"
              >
                ACTION
              </ActionButton>

              <Stack direction="row" spacing={1}>
                <StyledLink href="#" component="button" type="button">
                  Link
                </StyledLink>
                <StyledLink href="#" component="button" type="button">
                  Link
                </StyledLink>
              </Stack>
            </Box>
          </CardContent>
        </StyledCard>
      </LoginContainer>
    </AppTheme>
  );
}
