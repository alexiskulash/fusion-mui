import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";

export type ApiUser = {
  login?: { uuid?: string; username?: string };
  name?: { title?: string; first?: string; last?: string };
  email?: string;
  location?: {
    street?: { number?: number; name?: string };
    city?: string;
    state?: string;
    country?: string;
    postcode?: string | number;
  };
  dob?: { date?: string; age?: number };
  registered?: { date?: string; age?: number };
  phone?: string;
  cell?: string;
  picture?: { large?: string; medium?: string; thumbnail?: string };
  nat?: string;
};

function getUserId(user: ApiUser): string | undefined {
  return user?.login?.uuid || user?.login?.username || user?.email || undefined;
}

type CrmEditUserDialogProps = {
  open: boolean;
  user: ApiUser | null;
  onClose: () => void;
  onSaved: (updated: ApiUser) => void;
};

export default function CrmEditUserDialog({ open, user, onClose, onSaved }: CrmEditUserDialogProps) {
  const [first, setFirst] = React.useState("");
  const [last, setLast] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [city, setCity] = React.useState("");
  const [stateVal, setStateVal] = React.useState("");
  const [country, setCountry] = React.useState("");
  const [postcode, setPostcode] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (user) {
      setFirst(user.name?.first || "");
      setLast(user.name?.last || "");
      setEmail(user.email || "");
      setCity(user.location?.city || "");
      setStateVal(user.location?.state || "");
      setCountry(user.location?.country || "");
      setPostcode(String(user.location?.postcode ?? ""));
      setError(null);
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    if (!first.trim() || !last.trim() || !email.trim()) {
      setError("First name, last name, and email are required.");
      return;
    }
    const id = getUserId(user);
    if (!id) {
      setError("Missing user identifier.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const body: Partial<ApiUser> = {
        name: { first: first.trim(), last: last.trim(), title: user.name?.title },
        location: {
          ...user.location,
          city: city.trim(),
          state: stateVal.trim(),
          country: country.trim(),
          postcode: postcode,
        },
        email: email.trim(),
      };

      const res = await fetch(`https://user-api.builder-io.workers.dev/api/users/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || `Failed to update user (${res.status})`);
      }

      // Optimistically return updated user
      const updated: ApiUser = {
        ...user,
        ...body,
        name: { ...user.name, ...body.name },
        location: { ...user.location, ...body.location },
        email: body.email || user.email,
      };

      onSaved(updated);
      onClose();
    } catch (e: any) {
      setError(e?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit User</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField label="First name" value={first} onChange={(e) => setFirst(e.target.value)} fullWidth />
            <TextField label="Last name" value={last} onChange={(e) => setLast(e.target.value)} fullWidth />
          </Stack>
          <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField label="City" value={city} onChange={(e) => setCity(e.target.value)} fullWidth />
            <TextField label="State" value={stateVal} onChange={(e) => setStateVal(e.target.value)} fullWidth />
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField label="Country" value={country} onChange={(e) => setCountry(e.target.value)} fullWidth />
            <TextField label="Postcode" value={postcode} onChange={(e) => setPostcode(e.target.value)} fullWidth />
          </Stack>
          {error ? (
            <TextField value={error} error fullWidth InputProps={{ readOnly: true }} />
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" disabled={saving} startIcon={saving ? <CircularProgress size={18} /> : undefined}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
