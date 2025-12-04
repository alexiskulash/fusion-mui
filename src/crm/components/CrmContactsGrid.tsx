import * as React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Pagination from "@mui/material/Pagination";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import Modal from "@mui/material/Modal";
import Button from "@mui/material/Button";
import CloseIcon from "@mui/icons-material/Close";
import Divider from "@mui/material/Divider";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import CakeRoundedIcon from "@mui/icons-material/CakeRounded";
import MenuItem from "@mui/material/MenuItem";

/**
 * User interface representing contact data from the Users API.
 * Simplified structure focusing on contact information.
 */
interface Contact {
  login: {
    uuid: string;
    username: string;
  };
  name: {
    title?: string;
    first: string;
    last: string;
  };
  gender?: string;
  location?: {
    street?: {
      number?: number;
      name?: string;
    };
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
  email: string;
  dob?: {
    date?: string;
    age?: number;
  };
  phone?: string;
  cell?: string;
  picture?: {
    large?: string;
    medium?: string;
    thumbnail?: string;
  };
}

/**
 * API response structure for paginated contacts.
 */
interface ContactsResponse {
  page: number;
  perPage: number;
  total: number;
  data: Contact[];
}

const API_BASE = "https://user-api.builder-io.workers.dev/api";

/**
 * CrmContactsGrid Component
 * 
 * Displays contacts in a card-based grid layout with:
 * - Search functionality with debouncing
 * - Pagination
 * - Quick action buttons (email, call)
 * - Detailed contact view modal
 * - Edit capabilities
 */
export default function CrmContactsGrid() {
  const [contacts, setContacts] = React.useState<Contact[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(0);
  const [totalContacts, setTotalContacts] = React.useState(0);
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [selectedContact, setSelectedContact] = React.useState<Contact | null>(null);
  const [detailModalOpen, setDetailModalOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);

  const itemsPerPage = 12;

  /**
   * Debounce search input to avoid excessive API calls.
   */
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  /**
   * Fetch contacts when page or search changes.
   */
  React.useEffect(() => {
    fetchContacts();
  }, [page, debouncedSearch]);

  /**
   * Fetches contacts from the Users API.
   */
  const fetchContacts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        perPage: String(itemsPerPage),
        ...(debouncedSearch && { search: debouncedSearch }),
      });

      const response = await fetch(`${API_BASE}/users?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch contacts");
      }

      const data: ContactsResponse = await response.json();
      setContacts(data.data);
      setTotalContacts(data.total);
      setTotalPages(Math.ceil(data.total / itemsPerPage));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles page change in pagination.
   */
  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /**
   * Opens the detail modal for a contact.
   */
  const handleContactClick = (contact: Contact) => {
    setSelectedContact({ ...contact });
    setDetailModalOpen(true);
    setSaveError(null);
  };

  /**
   * Closes the detail modal.
   */
  const handleCloseModal = () => {
    setDetailModalOpen(false);
    setSelectedContact(null);
    setSaveError(null);
  };

  /**
   * Saves edited contact information.
   */
  const handleSaveContact = async () => {
    if (!selectedContact) return;

    setSaving(true);
    setSaveError(null);
    try {
      const response = await fetch(
        `${API_BASE}/users/${selectedContact.login.uuid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: selectedContact.name,
            email: selectedContact.email,
            gender: selectedContact.gender,
            location: selectedContact.location,
            phone: selectedContact.phone,
            cell: selectedContact.cell,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update contact");
      }

      await fetchContacts();
      handleCloseModal();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  /**
   * Handles input changes in the edit form.
   */
  const handleInputChange = (field: string, value: any) => {
    if (!selectedContact) return;

    const keys = field.split(".");
    const updatedContact = { ...selectedContact };
    let current: any = updatedContact;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    setSelectedContact(updatedContact);
  };

  /**
   * Gets contact initials for avatar fallback.
   */
  const getInitials = (contact: Contact) => {
    return `${contact.name.first[0]}${contact.name.last[0]}`.toUpperCase();
  };

  /**
   * Formats location for display.
   */
  const formatLocation = (contact: Contact) => {
    const parts = [];
    if (contact.location?.city) parts.push(contact.location.city);
    if (contact.location?.state) parts.push(contact.location.state);
    if (contact.location?.country) parts.push(contact.location.country);
    return parts.join(", ") || "Location not available";
  };

  return (
    <>
      {/* Header Section */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", sm: "center" }}
            spacing={2}
          >
            <Box>
              <Typography variant="h6" component="h2">
                Contacts
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {totalContacts} contact{totalContacts !== 1 ? "s" : ""} found
              </Typography>
            </Box>
            <TextField
              placeholder="Search contacts..."
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ minWidth: { sm: 300 } }}
            />
          </Stack>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Contacts Grid */}
          {contacts.length === 0 ? (
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ textAlign: "center", py: 8 }}>
                  <PersonRoundedIcon
                    sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
                  />
                  <Typography variant="h6" color="text.secondary">
                    No contacts found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Try adjusting your search criteria
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {contacts.map((contact) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={contact.login.uuid}>
                  <Card
                    variant="outlined"
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      transition: "all 0.2s",
                      "&:hover": {
                        boxShadow: 2,
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Stack spacing={2} alignItems="center">
                        {/* Avatar */}
                        <Avatar
                          src={contact.picture?.large}
                          sx={{
                            width: 80,
                            height: 80,
                            fontSize: "1.75rem",
                            bgcolor: "primary.main",
                          }}
                        >
                          {getInitials(contact)}
                        </Avatar>

                        {/* Name */}
                        <Box sx={{ textAlign: "center" }}>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {contact.name.title} {contact.name.first}{" "}
                            {contact.name.last}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block" }}
                          >
                            @{contact.login.username}
                          </Typography>
                        </Box>

                        {/* Contact Info */}
                        <Stack spacing={1} sx={{ width: "100%" }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <EmailRoundedIcon
                              fontSize="small"
                              sx={{ color: "text.secondary" }}
                            />
                            <Typography
                              variant="body2"
                              noWrap
                              sx={{ overflow: "hidden", textOverflow: "ellipsis" }}
                            >
                              {contact.email}
                            </Typography>
                          </Box>
                          {contact.phone && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <PhoneRoundedIcon
                                fontSize="small"
                                sx={{ color: "text.secondary" }}
                              />
                              <Typography variant="body2">{contact.phone}</Typography>
                            </Box>
                          )}
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <LocationOnRoundedIcon
                              fontSize="small"
                              sx={{ color: "text.secondary" }}
                            />
                            <Typography
                              variant="body2"
                              noWrap
                              sx={{ overflow: "hidden", textOverflow: "ellipsis" }}
                            >
                              {contact.location?.city || "N/A"}
                            </Typography>
                          </Box>
                        </Stack>

                        {/* Age Chip */}
                        {contact.dob?.age && (
                          <Chip
                            icon={<CakeRoundedIcon />}
                            label={`${contact.dob.age} years old`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Stack>
                    </CardContent>

                    {/* Action Buttons */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        gap: 1,
                        p: 1,
                        borderTop: 1,
                        borderColor: "divider",
                      }}
                    >
                      <IconButton
                        size="small"
                        aria-label="email contact"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `mailto:${contact.email}`;
                        }}
                      >
                        <EmailRoundedIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        aria-label="call contact"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (contact.phone) {
                            window.location.href = `tel:${contact.phone}`;
                          }
                        }}
                        disabled={!contact.phone}
                      >
                        <PhoneRoundedIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        aria-label="view details"
                        onClick={() => handleContactClick(contact)}
                      >
                        <PersonRoundedIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}

      {/* Contact Detail Modal */}
      <Modal
        open={detailModalOpen}
        onClose={handleCloseModal}
        aria-labelledby="contact-detail-modal"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: 600 },
            maxHeight: "90vh",
            overflow: "auto",
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
          }}
        >
          {selectedContact && (
            <Stack spacing={3}>
              {/* Modal Header */}
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar
                    src={selectedContact.picture?.large}
                    sx={{ width: 64, height: 64, fontSize: "1.5rem" }}
                  >
                    {getInitials(selectedContact)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" id="contact-detail-modal">
                      Contact Details
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      @{selectedContact.login.username}
                    </Typography>
                  </Box>
                </Stack>
                <IconButton onClick={handleCloseModal} size="small">
                  <CloseIcon />
                </IconButton>
              </Stack>

              {saveError && <Alert severity="error">{saveError}</Alert>}

              <Divider />

              {/* Edit Form */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Title"
                    select
                    value={selectedContact.name.title || ""}
                    onChange={(e) => handleInputChange("name.title", e.target.value)}
                  >
                    <MenuItem value="Mr">Mr</MenuItem>
                    <MenuItem value="Mrs">Mrs</MenuItem>
                    <MenuItem value="Ms">Ms</MenuItem>
                    <MenuItem value="Miss">Miss</MenuItem>
                    <MenuItem value="Dr">Dr</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    required
                    label="First Name"
                    value={selectedContact.name.first}
                    onChange={(e) => handleInputChange("name.first", e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    required
                    label="Last Name"
                    value={selectedContact.name.last}
                    onChange={(e) => handleInputChange("name.last", e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Email"
                    type="email"
                    value={selectedContact.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Gender"
                    select
                    value={selectedContact.gender || ""}
                    onChange={(e) => handleInputChange("gender", e.target.value)}
                  >
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={selectedContact.phone || ""}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Cell"
                    value={selectedContact.cell || ""}
                    onChange={(e) => handleInputChange("cell", e.target.value)}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Location
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="City"
                    value={selectedContact.location?.city || ""}
                    onChange={(e) => handleInputChange("location.city", e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="State"
                    value={selectedContact.location?.state || ""}
                    onChange={(e) => handleInputChange("location.state", e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Country"
                    value={selectedContact.location?.country || ""}
                    onChange={(e) =>
                      handleInputChange("location.country", e.target.value)
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Postcode"
                    value={selectedContact.location?.postcode || ""}
                    onChange={(e) =>
                      handleInputChange("location.postcode", e.target.value)
                    }
                  />
                </Grid>
              </Grid>

              {/* Modal Actions */}
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button onClick={handleCloseModal} disabled={saving}>
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSaveContact}
                  disabled={saving}
                >
                  {saving ? <CircularProgress size={24} /> : "Save Changes"}
                </Button>
              </Stack>
            </Stack>
          )}
        </Box>
      </Modal>
    </>
  );
}
