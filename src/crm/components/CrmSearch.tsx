import * as React from "react";
import InputBase from "@mui/material/InputBase";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { alpha, styled } from "@mui/material/styles";

type CrmSearchProps = {
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  inputProps?: React.ComponentProps<typeof InputBase>["inputProps"];
};

const SearchWrapper = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.black, 0.04),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.black, 0.06),
  },
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    width: "auto",
    marginLeft: theme.spacing(1),
  },
  ...theme.applyStyles("dark", {
    backgroundColor: alpha(theme.palette.common.white, 0.06),
    "&:hover": {
      backgroundColor: alpha(theme.palette.common.white, 0.1),
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
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      width: "12ch",
      "&:focus": {
        width: "20ch",
      },
    },
  },
}));

export default function CrmSearch({
  value,
  onChange,
  placeholder = "Search…",
  inputProps,
}: CrmSearchProps) {
  return (
    <SearchWrapper>
      <SearchIconWrapper>
        <SearchRoundedIcon fontSize="small" />
      </SearchIconWrapper>
      <StyledInputBase
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        inputProps={{ "aria-label": "search", ...inputProps }}
      />
    </SearchWrapper>
  );
}
