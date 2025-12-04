import * as React from "react";
import InputBase from "@mui/material/InputBase";
import IconButton from "@mui/material/IconButton";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { alpha, styled } from "@mui/material/styles";

const SearchWrapper = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.black, 0.04),
  border: `1px solid ${alpha(theme.palette.common.black, 0.08)}`,
  transition: "all 0.2s",
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.black, 0.06),
    borderColor: alpha(theme.palette.common.black, 0.12),
  },
  "&:focus-within": {
    backgroundColor: theme.palette.background.paper,
    borderColor: theme.palette.primary.main,
    boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`,
  },
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    width: "auto",
    marginLeft: theme.spacing(1),
  },
  ...theme.applyStyles("dark", {
    backgroundColor: alpha(theme.palette.common.white, 0.06),
    borderColor: alpha(theme.palette.common.white, 0.1),
    "&:hover": {
      backgroundColor: alpha(theme.palette.common.white, 0.1),
      borderColor: alpha(theme.palette.common.white, 0.15),
    },
    "&:focus-within": {
      backgroundColor: alpha(theme.palette.common.white, 0.08),
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.2)}`,
    },
  }),
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: theme.palette.text.secondary,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  width: "100%",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    paddingRight: theme.spacing(5),
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      width: "16ch",
      "&:focus": {
        width: "24ch",
      },
    },
    "&::placeholder": {
      opacity: 0.6,
    },
  },
}));

const ClearButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  right: theme.spacing(0.5),
  top: "50%",
  transform: "translateY(-50%)",
  padding: theme.spacing(0.5),
  opacity: 0.6,
  "&:hover": {
    opacity: 1,
    backgroundColor: alpha(theme.palette.common.black, 0.08),
  },
  ...theme.applyStyles("dark", {
    "&:hover": {
      backgroundColor: alpha(theme.palette.common.white, 0.1),
    },
  }),
}));

export default function CrmSearch() {
  const [searchValue, setSearchValue] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleClear = () => {
    setSearchValue("");
    inputRef.current?.focus();
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  };

  return (
    <SearchWrapper>
      <SearchIconWrapper>
        <SearchRoundedIcon fontSize="small" />
      </SearchIconWrapper>
      <StyledInputBase
        placeholder="Search everything..."
        inputProps={{ "aria-label": "search", ref: inputRef }}
        value={searchValue}
        onChange={handleChange}
      />
      {searchValue && (
        <ClearButton size="small" onClick={handleClear} aria-label="clear search">
          <CloseRoundedIcon fontSize="small" />
        </ClearButton>
      )}
    </SearchWrapper>
  );
}
