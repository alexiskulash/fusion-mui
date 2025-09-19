import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import TablePagination from "@mui/material/TablePagination";
import Skeleton from "@mui/material/Skeleton";
import Button from "@mui/material/Button";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import type { ApiUser } from "./CrmEditUserDialog";

export type CustomersTableProps = {
  users: ApiUser[];
  total: number;
  page: number; // 0-indexed
  perPage: number;
  loading?: boolean;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  onEdit: (user: ApiUser) => void;
};

function getFullName(u: ApiUser): string {
  const first = u.name?.first || "";
  const last = u.name?.last || "";
  return `${first} ${last}`.trim();
}

function formatDate(date?: string) {
  if (!date) return "";
  const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" };
  return new Date(date).toLocaleDateString(undefined, options);
}

export default function CrmCustomersTable({ users, total, page, perPage, loading, onPageChange, onPerPageChange, onEdit }: CustomersTableProps) {
  return (
    <Card variant="outlined" sx={{ display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ pb: 0 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" component="h3">Customers</Typography>
          <Button endIcon={<ArrowForwardRoundedIcon />} size="small">Export</Button>
        </Stack>
      </CardContent>
      <TableContainer>
        <Table size="small" aria-label="customers table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>City</TableCell>
              <TableCell>Country</TableCell>
              <TableCell align="right">Age</TableCell>
              <TableCell>Registered</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading
              ? Array.from({ length: perPage }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`}>
                    <TableCell colSpan={7}>
                      <Skeleton height={32} />
                    </TableCell>
                  </TableRow>
                ))
              : users.map((u, idx) => (
                  <TableRow key={`${u?.login?.uuid || u?.email || idx}`} hover>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1.25}>
                        <Avatar sx={{ width: 28, height: 28 }} src={u.picture?.thumbnail}>
                          {getFullName(u).charAt(0) || "U"}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {getFullName(u)}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.location?.city}</TableCell>
                    <TableCell>{u.location?.country}</TableCell>
                    <TableCell align="right">{u.dob?.age ?? ""}</TableCell>
                    <TableCell>{formatDate(u.registered?.date)}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" aria-label="edit user" onClick={() => onEdit(u)}>
                        <EditRoundedIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            {!loading && users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <Typography variant="body2">No users found.</Typography>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={total}
        page={page}
        onPageChange={(_, p) => onPageChange(p)}
        rowsPerPage={perPage}
        onRowsPerPageChange={(e) => onPerPageChange(parseInt(e.target.value, 10))}
        rowsPerPageOptions={[5, 10, 20, 50]}
      />
    </Card>
  );
}
